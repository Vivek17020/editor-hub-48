import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { AIAssistantPanel } from './ai-assistant-panel';
import { ArticlePremiumControls } from './article-premium-controls';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, Eye, Save, Send, X, Clock, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import slugify from 'slugify';
import { z } from 'zod';

interface Article {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url?: string;
  category_id?: string;
  tags: string[];
  published: boolean;
  meta_title?: string;
  meta_description?: string;
  is_premium?: boolean;
  premium_preview_length?: number;
  ads_enabled?: boolean;
  affiliate_products_enabled?: boolean;
}

interface ArticleFormProps {
  article?: Article;
  onSave?: () => void;
}

// Validation schema for publishing
const articleValidationSchema = z.object({
  title: z.string().trim().min(3, "Title is required"),
  slug: z
    .string()
    .trim()
    .min(3, "Slug is required")
    .max(120, "Slug too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  content: z.string().trim().min(20, "Content is too short"),
  excerpt: z.string().trim().max(300).optional(),
  meta_title: z.string().trim().max(60, "Meta title must be ≤ 60 characters").optional().nullable(),
  meta_description: z
    .string()
    .trim()
    .max(160, "Meta description must be ≤ 160 characters")
    .optional()
    .nullable(),
  category_id: z.string().min(1, "Category is required"),
  tags: z.array(z.string().trim()).max(20, "Too many tags").optional(),
  is_premium: z.boolean().optional(),
  premium_preview_length: z.number().int().min(0).max(5000).optional(),
});

export function ArticleForm({ article, onSave }: ArticleFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [newTag, setNewTag] = useState('');
  
  // Auto-save states
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const autoSaveInterval = 30 * 1000; // 30 seconds
  
  const [formData, setFormData] = useState<Article>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    category_id: '',
    tags: [],
    published: false,
    meta_title: '',
    meta_description: '',
    ...article,
  });

  useEffect(() => {
    fetchCategories();
    if (article?.image_url) {
      setImagePreview(article.image_url);
    }
    
    // Load draft if creating new article
    if (!article) {
      loadDraft();
    }
  }, [article]);

  useEffect(() => {
    // Auto-generate slug from title
    if (formData.title && (!article || !article.slug)) {
      const slug = slugify(formData.title, { 
        lower: true, 
        strict: true,
        remove: /[*+~.()'"!:@]/g 
      });
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, article]);

  // Auto-save effect
  useEffect(() => {
    // Do not schedule autosave during publishing to avoid race conditions
    if (isPublishing) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      return;
    }

    if (hasUnsavedChanges && (formData.title.trim() || formData.content.trim())) {
      // Clear existing timer
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      
      // Set new timer for auto-save
      autoSaveTimer.current = setTimeout(() => {
        autoSave();
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [formData, hasUnsavedChanges, isPublishing]);

  // Track changes to form data
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData.title, formData.content, formData.excerpt, formData.tags, formData.category_id]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (data) setCategories(data);
  };

  const getDraftKey = () => {
    return article?.id ? `article-draft-${article.id}` : 'article-draft-new';
  };

  const loadDraft = useCallback(async () => {
    try {
      const draftKey = getDraftKey();
      const savedDraft = localStorage.getItem(draftKey);
      
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        const draftAge = Date.now() - draft.timestamp;
        
        // Only load drafts that are less than 24 hours old
        if (draftAge < 24 * 60 * 60 * 1000) {
          setFormData(prev => ({ ...prev, ...draft.data }));
          setLastSavedAt(new Date(draft.timestamp));
          setAutoSaveStatus('saved');
          
          toast({
            title: "Draft restored",
            description: `Draft from ${formatDistanceToNow(new Date(draft.timestamp), { addSuffix: true })} has been restored.`,
          });
        } else {
          // Remove old draft
          localStorage.removeItem(draftKey);
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  }, [article?.id]);

  const autoSave = useCallback(async () => {
    if (isPublishing) return; // skip autosave during publish
    if (!formData.title.trim() && !formData.content.trim()) {
      return;
    }

    setAutoSaveStatus('saving');
    
    try {
      const draftKey = getDraftKey();
      const draftData = {
        data: formData,
        timestamp: Date.now()
      };
      
      // Save to localStorage as backup
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      
      // Save to Supabase if editing existing article
      if (article?.id) {
        const sanitizedTags = Array.from(new Set((formData.tags || []).map(t => t.trim()).filter(Boolean)));
        const categoryId = formData.category_id && formData.category_id !== '' ? formData.category_id : (categories[0]?.id || null);
        const updatePayload = {
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt?.trim() ? formData.excerpt : null,
          content: formData.content,
          image_url: (formData.image_url && formData.image_url.trim() !== '') ? formData.image_url : null,
          category_id: categoryId,
          tags: sanitizedTags.length ? sanitizedTags : null,
          seo_keywords: sanitizedTags.length ? sanitizedTags : null,
          meta_title: formData.meta_title?.trim() ? formData.meta_title : null,
          meta_description: formData.meta_description?.trim() ? formData.meta_description : null,
          updated_at: new Date().toISOString(),
        } as any;
        
        const { error } = await supabase
          .from('articles')
          .update(updatePayload)
          .eq('id', article.id);
        
        if (error) throw error;
      }
      
      setLastSavedAt(new Date());
      setAutoSaveStatus('saved');
      setHasUnsavedChanges(false);
      
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
    }
  }, [formData, article?.id]);

  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('article-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setLoading(true);
    setIsPublishing(true);
    
    try {
      // Stop any pending autosave timer to avoid race conditions
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to publish articles.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      let imageUrl = formData.image_url;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      // Sanitize inputs
      const sanitizedTags = Array.from(new Set((formData.tags || []).map(t => t.trim()).filter(Boolean)));
      const categoryId = formData.category_id && formData.category_id !== '' ? formData.category_id : (categories[0]?.id || '');
      const safeSlug = slugify(formData.slug || formData.title, { 
        lower: true, 
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });

      // Validate required fields
      const validation = articleValidationSchema.safeParse({
        title: formData.title,
        slug: safeSlug,
        content: formData.content,
        excerpt: formData.excerpt,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        category_id: categoryId,
        tags: sanitizedTags,
        is_premium: formData.is_premium,
        premium_preview_length: formData.premium_preview_length,
      });

      if (!validation.success) {
        const msg = validation.error.issues[0]?.message || 'Validation failed';
        toast({ title: 'Validation Error', description: msg, variant: 'destructive' });
        return;
      }

      // Ensure slug is unique
      let slugQuery = supabase
        .from('articles')
        .select('id')
        .eq('slug', safeSlug)
        .limit(1);
      if (article?.id) slugQuery = slugQuery.neq('id', article.id);
      const { data: slugExisting } = await slugQuery.maybeSingle();
      if (slugExisting?.id) {
        toast({
          title: 'Duplicate Slug',
          description: 'This slug is already in use. Please choose another.',
          variant: 'destructive',
        });
        return;
      }

      if (!categoryId) {
        toast({
          title: 'Missing category',
          description: 'Please select or create a category before publishing.',
          variant: 'destructive',
        });
        return;
      }

      const now = new Date().toISOString();

      const articleData = {
        title: formData.title,
        slug: safeSlug,
        excerpt: formData.excerpt?.trim() ? formData.excerpt : null,
        content: formData.content,
        image_url: (imageUrl && imageUrl.trim() !== '') ? imageUrl : null,
        category_id: categoryId,
        tags: sanitizedTags.length ? sanitizedTags : null,
        seo_keywords: sanitizedTags.length ? sanitizedTags : null,
        meta_title: formData.meta_title?.trim() ? formData.meta_title : null,
        meta_description: formData.meta_description?.trim() ? formData.meta_description : null,
        author_id: user.id,
        published: !isDraft,
        published_at: !isDraft ? now : null,
        updated_at: now,
        is_premium: formData.is_premium ?? false,
        premium_preview_length: formData.premium_preview_length ?? 300,
        ads_enabled: formData.ads_enabled !== false,
        affiliate_products_enabled: formData.affiliate_products_enabled !== false,
      } as any;

      if (article?.id) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', article.id);
        if (error) throw error;
        toast({
          title: isDraft ? 'Draft updated' : 'Article Published',
          description: `Article ${isDraft ? 'saved as draft' : 'published'} successfully.`,
        });
      } else {
        const { error } = await supabase
          .from('articles')
          .insert({
            ...articleData,
            created_at: now,
          });
        if (error) throw error;
        toast({
          title: isDraft ? 'Draft created' : 'Article Published',
          description: `Article ${isDraft ? 'saved as draft' : 'published'} successfully.`,
        });
      }

      // Clear draft from localStorage after successful save
      const draftKey = getDraftKey();
      localStorage.removeItem(draftKey);
      setHasUnsavedChanges(false);
      setAutoSaveStatus('idle');

      // Invalidate React Query cache to refresh article lists everywhere
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles-paginated'] });

      onSave?.();
      navigate('/admin/articles');
    } catch (error: any) {
      console.error('Article save error:', error);
      const details = error?.details || error?.hint || '';
      toast({
        title: 'Error',
        description: (error?.message || 'Failed to save article') + (details ? ` — ${details}` : ''),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setIsPublishing(false);
    }
  };

  const updateFormData = useCallback((updates: Partial<Article>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setHasUnsavedChanges(true);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData({ tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData({ tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          {article ? 'Edit Article' : 'Create New Article'}
        </h1>
        <div className="flex items-center gap-4">
          {/* Auto-save status */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {autoSaveStatus === 'saving' && (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Saving draft...</span>
              </>
            )}
            {autoSaveStatus === 'saved' && lastSavedAt && (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Draft saved {formatDistanceToNow(lastSavedAt, { addSuffix: true })}</span>
              </>
            )}
            {autoSaveStatus === 'error' && (
              <>
                <X className="w-4 h-4 text-red-600" />
                <span>Auto-save failed</span>
              </>
            )}
            {hasUnsavedChanges && autoSaveStatus === 'idle' && (
              <>
                <Clock className="w-4 h-4 text-yellow-600" />
                <span>Unsaved changes</span>
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={loading || isPublishing}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={loading || isPublishing}
              className="bg-gradient-primary hover:bg-gradient-secondary transition-all duration-300"
            >
              <Send className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  placeholder="Enter article title..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => updateFormData({ slug: e.target.value })}
                  placeholder="article-slug"
                  className="mt-1 font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => updateFormData({ excerpt: e.target.value })}
                  placeholder="Brief description of the article..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => updateFormData({ content })}
                placeholder="Start writing your article..."
              />
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => updateFormData({ meta_title: e.target.value })}
                  placeholder="SEO title (defaults to article title)"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => updateFormData({ meta_description: e.target.value })}
                  placeholder="SEO description (defaults to excerpt)"
                  className="mt-1"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Assistant Panel */}
          <AIAssistantPanel
            content={formData.content}
            onInsertSummary={(summary) => {
              updateFormData({ excerpt: summary });
              toast({
                title: "Summary Inserted",
                description: "AI-generated summary has been added as excerpt."
              });
            }}
            onInsertTitle={(title) => {
              updateFormData({ title });
              toast({
                title: "Title Updated",
                description: "AI-generated title has been applied."
              });
            }}
            onInsertKeywords={(keywords) => {
              updateFormData({ tags: [...formData.tags, ...keywords.filter(k => !formData.tags.includes(k))] });
              toast({
                title: "Keywords Added",
                description: "AI-extracted keywords have been added as tags."
              });
            }}
            onTranslationGenerated={(translation) => {
              toast({
                title: "Translation Ready",
                description: "Hindi translation has been generated. You can copy it to create a new Hindi article."
              });
            }}
          />
          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                
                {imagePreview && (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-border"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                        updateFormData({ image_url: '' });
                      }}
                    >
                      Remove Image
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.category_id}
                onValueChange={(value) => updateFormData({ category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    Add
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
                    <Badge key={`${tag}-${idx}`} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-destructive" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Preview Article
              </Button>
            </CardContent>
          </Card>

          {/* Monetization Settings */}
          {article?.id && (
            <ArticlePremiumControls
              articleId={article.id}
              isPremium={article.is_premium || false}
              premiumPreviewLength={article.premium_preview_length || 300}
              adsEnabled={article.ads_enabled !== false}
              affiliateProductsEnabled={article.affiliate_products_enabled !== false}
              onUpdate={onSave || (() => {})}
            />
          )}
        </div>
      </div>
    </div>
  );
}