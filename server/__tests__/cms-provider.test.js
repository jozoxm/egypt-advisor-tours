const mockFetchStoryblokResource = jest.fn();
const mockUpdateStoryblokResource = jest.fn();
const mockIsStoryblokConfigured = jest.fn();

jest.mock('../storyblok', () => ({
  fetchStoryblokResource: (...args) => mockFetchStoryblokResource(...args),
  getStoryblokAdminUrl: () => 'https://app.storyblok.com/',
  getStoryblokVersion: () => 'published',
  isStoryblokConfigured: (...args) => mockIsStoryblokConfigured(...args),
  updateStoryblokResource: (...args) => mockUpdateStoryblokResource(...args),
}));

const { createCmsProviderContext, resolveProviderName } = require('../cms/provider');

describe('CMS provider dispatcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves auto provider to file when Storyblok is not configured', () => {
    mockIsStoryblokConfigured.mockReturnValue(false);
    expect(resolveProviderName({ CMS_PROVIDER: 'auto' })).toBe('file');
  });

  it('resolves auto provider to storyblok when Storyblok is configured', () => {
    mockIsStoryblokConfigured.mockReturnValue(true);
    expect(resolveProviderName({ CMS_PROVIDER: 'auto' })).toBe('storyblok');
  });

  it('falls back to file provider for writes when Storyblok write fails', async () => {
    mockIsStoryblokConfigured.mockReturnValue(true);
    mockUpdateStoryblokResource.mockRejectedValue(new Error('Upstream unavailable'));

    const cmsProvider = createCmsProviderContext({
      CMS_PROVIDER: 'storyblok',
      CMS_FAILOVER_PROVIDER: 'file',
      STORYBLOK_PREVIEW_TOKEN: 'token',
    });

    const localWrite = jest.fn().mockReturnValue(true);
    const result = await cmsProvider.write('blogs', { blogs: [] }, { localWrite });

    expect(result.persisted).toBe(true);
    expect(result.provider).toBe('file');
    expect(result.primaryProvider).toBe('storyblok');
    expect(result.failover).toBe(true);
    expect(localWrite).toHaveBeenCalled();
  });

  it('falls back to file provider for reads when Storyblok read fails', async () => {
    mockIsStoryblokConfigured.mockReturnValue(true);
    mockFetchStoryblokResource.mockRejectedValue(new Error('Delivery API unavailable'));

    const cmsProvider = createCmsProviderContext({
      CMS_PROVIDER: 'storyblok',
      CMS_FAILOVER_PROVIDER: 'file',
      STORYBLOK_PREVIEW_TOKEN: 'token',
    });

    const localRead = jest.fn().mockReturnValue({ blogs: [{ title: 'offline' }] });
    const result = await cmsProvider.read('blogs', { localRead });

    expect(result.found).toBe(true);
    expect(result.provider).toBe('file');
    expect(result.failover).toBe(true);
    expect(result.data).toEqual({ blogs: [{ title: 'offline' }] });
  });
});
