const { isWordPressConfigured } = require('../wordpress');
const { isStoryblokConfigured } = require('../storyblok');

function getCmsProvider(env) {
    const e = env || process.env;
    const explicit = e.CMS_PROVIDER || '';

    if (explicit === 'wordpress') return 'wordpress';
    if (explicit === 'storyblok') return 'storyblok';
    if (explicit === 'filesystem') return 'filesystem';

    if (isWordPressConfigured(e)) return 'wordpress';
    if (isStoryblokConfigured(e)) return 'storyblok';
    return 'filesystem';
}

module.exports = { getCmsProvider };
