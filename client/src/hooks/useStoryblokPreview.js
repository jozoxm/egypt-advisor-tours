import { useEffect } from 'react';

function isStoryblokPreview() {
  if (typeof window === 'undefined') {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return (
    params.has('_storyblok') ||
    params.has('_storyblok_tk') ||
    params.get('storyblok') === 'draft'
  );
}

export default function useStoryblokPreview() {
  useEffect(() => {
    if (!isStoryblokPreview()) {
      return undefined;
    }

    let active = true;
    let bridge;

    import('@storyblok/preview-bridge')
      .then(({ default: StoryblokBridge }) => {
        if (!active) {
          return;
        }

        bridge = new StoryblokBridge();
        bridge.on(['change', 'published'], () => {
          window.location.reload();
        });
      })
      .catch(() => {});

    return () => {
      active = false;
      if (bridge && typeof bridge.teardown === 'function') {
        bridge.teardown();
      }
    };
  }, []);
}
