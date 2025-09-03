import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useLikes(articleId: string) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkIfLiked();
  }, [articleId]);

  const checkIfLiked = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      const userId = user?.user?.id;
      
      // Check if user already liked this article
      const { data } = await supabase
        .from('article_likes')
        .select('id')
        .eq('article_id', articleId)
        .or(userId ? `user_id.eq.${userId}` : `ip_address.eq.${await getClientIP()}`)
        .single();

      setIsLiked(!!data);

      // Get total likes count for this article
      const { data: article } = await supabase
        .from('articles')
        .select('likes_count')
        .eq('id', articleId)
        .single();

      setLikesCount(article?.likes_count || 0);
    } catch (error) {
      console.error('Error checking likes:', error);
    }
  };

  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const toggleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const userId = user?.user?.id;
      const clientIP = await getClientIP();

      if (isLiked) {
        // Unlike
        await supabase
          .from('article_likes')
          .delete()
          .eq('article_id', articleId)
          .or(userId ? `user_id.eq.${userId}` : `ip_address.eq.${clientIP}`);
        
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        toast({
          title: "Removed like",
          description: "You've unliked this article.",
        });
      } else {
        // Like
        await supabase
          .from('article_likes')
          .insert({
            article_id: articleId,
            user_id: userId,
            ip_address: userId ? null : clientIP
          });
        
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        toast({
          title: "Liked!",
          description: "Thanks for liking this article!",
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLiked,
    likesCount,
    toggleLike,
    isLoading
  };
}