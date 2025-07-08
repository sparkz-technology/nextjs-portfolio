"use client";

import { useEffect } from "react";

// Performance optimization component for Core Web Vitals
export function PerformanceOptimizer() {
  useEffect(() => {
    // Preload critical resources
    const preloadResources = () => {
      // Preload critical images that are likely to be needed
      const criticalImages = [
        "/placeholder.svg",
        "/vercel.svg",
      ];

      criticalImages.forEach((src) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = src;
        document.head.appendChild(link);
      });
    };

    // Optimize third-party script loading
    const optimizeThirdPartyScripts = () => {
      // Add loading="lazy" to non-critical iframes if any exist
      const iframes = document.querySelectorAll("iframe");
      iframes.forEach((iframe) => {
        if (!iframe.loading) {
          iframe.loading = "lazy";
        }
      });
    };

    // Optimize images that don't use Next.js Image component
    const optimizeImages = () => {
      const images = document.querySelectorAll("img");
      images.forEach((img) => {
        if (!img.loading && !img.src.includes("data:")) {
          img.loading = "lazy";
        }
        if (!img.decoding) {
          img.decoding = "async";
        }
      });
    };

    // Initialize optimizations
    preloadResources();
    optimizeThirdPartyScripts();
    optimizeImages();

    // Set up a mutation observer to optimize dynamically added content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          optimizeImages();
          optimizeThirdPartyScripts();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}

// Component to add critical CSS inlining hint
export function CriticalCSS() {
  useEffect(() => {
    // Add resource hints for critical resources
    const addResourceHints = () => {
      const hints = [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        { rel: "dns-prefetch", href: "https://res.cloudinary.com" },
      ];

      hints.forEach((hint) => {
        const existing = document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`);
        if (!existing) {
          const link = document.createElement("link");
          link.rel = hint.rel;
          link.href = hint.href;
          if (hint.crossOrigin) {
            link.crossOrigin = hint.crossOrigin;
          }
          document.head.appendChild(link);
        }
      });
    };

    addResourceHints();
  }, []);

  return null;
}