import NodeCache from 'node-cache';

// stdTTL: 600 seconds (10 minutes)
// checkperiod: 120 seconds (deletes expired keys every 2 mins)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

export const cacheProvider = {
    set: (key, value, ttl) => cache.set(key, value, ttl),
    get: (key) => cache.get(key),
    has: (key) => cache.has(key),
    delete: (key) => cache.del(key)
};