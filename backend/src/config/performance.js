// Backend Performance Configuration
// Caching, compression, and optimization settings

// Response compression - reduces payload size
export const compressionConfig = {
  level: 6, // Compression level (0-9, 6 is good balance)
  threshold: 1024, // Only compress responses > 1KB
};

// Database query timeout - prevent hanging queries
export const dbTimeout = 30000; // 30 seconds

// Connection pool settings for better concurrency
export const dbPoolConfig = {
  connectionLimit: 10, // Number of connections in pool
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
};

// Cache expiry times (in milliseconds)
export const cacheExpiry = {
  stats: 5 * 60 * 1000,        // 5 minutes for stats
  repairs: 3 * 60 * 1000,      // 3 minutes for repairs list
  assets: 5 * 60 * 1000,       // 5 minutes for assets
  costs: 10 * 60 * 1000,       // 10 minutes for costs
  userProfiles: 15 * 60 * 1000, // 15 minutes for profiles
};

// Pagination settings
export const defaultPageSize = 50;
export const maxPageSize = 200;

// API rate limiting (requests per minute)
export const rateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,    // 100 requests per minute
};

// Response size limits
export const responseSizeLimits = {
  json: '10mb',
  urlencoded: '10mb',
};

// Query optimization settings
export const queryOptimizations = {
  useSelectLimit: true,  // Always limit SELECT queries
  defaultLimit: 100,
  enableQueryCaching: true,
  cacheKeyPrefix: 'query_',
};

export default {
  compressionConfig,
  dbTimeout,
  dbPoolConfig,
  cacheExpiry,
  defaultPageSize,
  maxPageSize,
  rateLimitConfig,
  responseSizeLimits,
  queryOptimizations,
};
