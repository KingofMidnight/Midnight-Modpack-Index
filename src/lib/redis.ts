import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => console.log('Redis Client Error', err));

export const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
};

export const getCachedData = async (key: string) => {
  try {
    const redis = await connectRedis();
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

export const setCachedData = async (key: string, data: any, expiration = 3600) => {
  try {
    const redis = await connectRedis();
    await redis.setEx(key, expiration, JSON.stringify(data));
  } catch (error) {
    console.error('Redis set error:', error);
  }
};

export const invalidateCache = async (pattern: string) => {
  try {
    const redis = await connectRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    console.error('Redis invalidation error:', error);
  }
};

export default client;
