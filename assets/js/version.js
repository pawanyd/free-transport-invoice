/**
 * Version Configuration
 * Update this version number with each commit to bust browser cache
 * Increment the version number by 1 for each new deployment
 */

export const APP_VERSION = '9';

/**
 * Get versioned URL for cache busting
 * @param {string} url - The original URL
 * @returns {string} - URL with version parameter
 */
export function getVersionedUrl(url) {
    return `${url}?v=${APP_VERSION}`;
}
