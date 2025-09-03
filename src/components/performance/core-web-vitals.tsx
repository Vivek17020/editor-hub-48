import { useEffect } from 'react';

// Core Web Vitals monitoring component
export function CoreWebVitals() {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload font if using web fonts
      const fontPreload = document.createElement('link');
      fontPreload.rel = 'preload';
      fontPreload.as = 'font';
      fontPreload.type = 'font/woff2';
      fontPreload.crossOrigin = 'anonymous';
      
      // Add to head only if not already present
      if (!document.querySelector('link[rel="preload"][as="font"]')) {
        document.head.appendChild(fontPreload);
      }
    };

    // Optimize images for faster loading
    const optimizeImages = () => {
      const images = document.querySelectorAll('img[loading="lazy"]');
      
      // Add intersection observer for better lazy loading
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              imageObserver.unobserve(img);
            }
          });
        }, {
          rootMargin: '50px 0px',
          threshold: 0.01
        });

        images.forEach(img => imageObserver.observe(img));
      }
    };

    // Optimize layout shifts
    const preventLayoutShifts = () => {
      // Add aspect ratios to images without them
      const images = document.querySelectorAll('img:not([style*="aspect-ratio"])');
      images.forEach(img => {
        if (img instanceof HTMLImageElement && !img.style.aspectRatio) {
          // Default to 16:9 if no aspect ratio is set
          img.style.aspectRatio = '16 / 9';
        }
      });
    };

    // Run optimizations
    preloadCriticalResources();
    optimizeImages();
    preventLayoutShifts();

    // Monitor performance metrics (if supported)
    if ('PerformanceObserver' in window) {
      try {
        // Monitor LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP candidate:', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Monitor CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              console.log('CLS value:', clsValue);
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Monitor FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidEntry = entry as any; // Type assertion for FID specific properties
            if (fidEntry.processingStart) {
              const fid = fidEntry.processingStart - entry.startTime;
              console.log('FID value:', fid);
            }
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

      } catch (error) {
        console.log('Performance monitoring not fully supported');
      }
    }

    // Cleanup function
    return () => {
      // Cleanup observers if needed
    };
  }, []);

  return null; // This component doesn't render anything
}

// Hook for preloading critical resources
export function usePreloadCritical(resources: string[]) {
  useEffect(() => {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      if (resource.includes('.css')) {
        link.as = 'style';
      } else if (resource.includes('.js')) {
        link.as = 'script';
      } else if (resource.match(/\.(jpg|jpeg|png|webp|gif)$/)) {
        link.as = 'image';
      }
      
      link.href = resource;
      document.head.appendChild(link);
    });
  }, [resources]);
}