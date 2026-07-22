import axios from 'axios';
import LRU from 'lru-cache';

// LRU cache configuration
const cache = new LRU({
  max: 100, // Maximum number of items
  ttl: 5 * 60 * 1000, // 5 minutes
  updateAgeOnGet: true,
});

// Create axios instance with caching
const createCachedAxios = () => {
  const instance = axios.create();

  // Response interceptor for caching GET requests
  instance.interceptors.response.use(
    (response) => {
      if (response.config.method === 'get') {
        cache.set(response.config.url, response);
      }
      return response;
    },
    (error) => Promise.reject(error)
  );

  // Request interceptor to use cached data if available
  instance.interceptors.request.use((config) => {
    if (config.method === 'get') {
      const cachedResponse = cache.get(config.url);
      if (cachedResponse) {
        return Promise.resolve(cachedResponse);
      }
    }
    return config;
  });

  return instance;
};

export default createCachedAxios;
