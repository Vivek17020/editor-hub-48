import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { supabase } from '@/integrations/supabase/client';

interface AdSlotProps {
  id: string;
  format?: 'banner' | 'rectangle' | 'leaderboard' | 'skyscraper' | 'native';
  className?: string;
  lazy?: boolean;
}

export const AdSlot = ({ id, format = 'rectangle', className, lazy = true }: AdSlotProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  const adDimensions = {
    banner: { width: 728, height: 90 },
    rectangle: { width: 300, height: 250 },
    leaderboard: { width: 970, height: 90 },
    skyscraper: { width: 160, height: 600 },
    native: { width: '100%', height: 'auto' },
  };

  const trackAdImpression = async () => {
    try {
      // Track ad impression - will be implemented when database tables are available
      console.log('Ad impression tracked:', { ad_slot_id: id, type: 'impression' });
    } catch (error) {
      console.error('Failed to track ad impression:', error);
    }
  };

  const trackAdClick = async () => {
    try {
      // Track ad click - will be implemented when database tables are available
      console.log('Ad click tracked:', { ad_slot_id: id, type: 'click' });
    } catch (error) {
      console.error('Failed to track ad click:', error);
    }
  };

  useEffect(() => {
    if ((!lazy || inView) && !isLoaded && adRef.current) {
      // AdSense initialization would go here
      // For now, we'll show a placeholder
      setIsLoaded(true);
      trackAdImpression();
    }
  }, [inView, lazy, isLoaded, id]);

  const setRefs = (node: HTMLDivElement | null) => {
    adRef.current = node;
    inViewRef(node);
  };

  return (
    <div
      ref={setRefs}
      className={`ad-slot ${className || ''} ${format === 'native' ? 'native-ad' : ''}`}
      style={{
        width: adDimensions[format].width,
        height: adDimensions[format].height,
        minHeight: format === 'native' ? '150px' : adDimensions[format].height,
        backgroundColor: '#f5f5f5',
        border: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        margin: '16px auto',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={trackAdClick}
    >
      {isLoaded ? (
        <>
          {/* This is where Google AdSense code would be inserted */}
          <div className="ad-content text-center text-muted-foreground">
            <div className="text-xs mb-2">Advertisement</div>
            <div className="text-sm">
              {format === 'native' ? 'Native Ad Content' : `${format.charAt(0).toUpperCase() + format.slice(1)} Ad`}
            </div>
            <div className="text-xs mt-1 opacity-60">AdSense Ready - {adDimensions[format].width}x{adDimensions[format].height}</div>
          </div>
          
          {/* AdSense script insertion point */}
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
          ></script>
        </>
      ) : (
        <div className="text-muted-foreground text-xs">Loading Ad...</div>
      )}
    </div>
  );
};