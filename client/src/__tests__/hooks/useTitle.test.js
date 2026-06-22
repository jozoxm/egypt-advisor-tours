import { renderHook } from '@testing-library/react';
import useTitle from '../../hooks/useTitle';

const BASE_TITLE = 'Egypt Advisor Tours';

describe('useTitle', () => {
  const originalTitle = document.title;

  afterEach(() => {
    document.title = originalTitle;
  });

  it('sets the document title with page name when provided', () => {
    renderHook(() => useTitle('About Us'));
    expect(document.title).toBe(`About Us | ${BASE_TITLE}`);
  });

  it('sets the document title to the base title when no page name is provided', () => {
    renderHook(() => useTitle());
    expect(document.title).toBe(BASE_TITLE);
  });

  it('sets the document title to the base title when pageTitle is an empty string', () => {
    renderHook(() => useTitle(''));
    expect(document.title).toBe(BASE_TITLE);
  });

  it('updates the title when pageTitle changes', () => {
    const { rerender } = renderHook(({ title }) => useTitle(title), {
      initialProps: { title: 'Home' },
    });
    expect(document.title).toBe(`Home | ${BASE_TITLE}`);

    rerender({ title: 'Tours' });
    expect(document.title).toBe(`Tours | ${BASE_TITLE}`);
  });

  it('restores the previous title on unmount', () => {
    document.title = 'Previous Title';
    const { unmount } = renderHook(() => useTitle('Current Page'));
    expect(document.title).toBe(`Current Page | ${BASE_TITLE}`);
    unmount();
    expect(document.title).toBe('Previous Title');
  });
});
