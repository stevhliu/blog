import { Redis } from "@upstash/redis";

type RedisLike = {
  hgetall: (key: string) => Promise<Record<string, string> | null>;
  hget: (key: string, field: string) => Promise<string | null>;
  hincrby: (key: string, field: string, increment: number) => Promise<number>;
};

const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? null;
const url =
  process.env.UPSTASH_REDIS_REST_URL ??
  "https://usw1-native-pup-33102.upstash.io";

let redis: RedisLike;

if (token) {
  redis = (new Redis({ url, token }) as unknown) as RedisLike;
} else {
  // Fallback stub to allow local builds and preview deploys without Redis
  const inMemoryStore = new Map<string, Map<string, number>>();

  redis = {
    async hgetall(key: string) {
      const bucket = inMemoryStore.get(key);
      if (!bucket) return null;
      const result: Record<string, string> = {};
      for (const [field, value] of bucket.entries()) {
        result[field] = String(value);
      }
      return Object.keys(result).length > 0 ? result : null;
    },
    async hget(key: string, field: string) {
      const bucket = inMemoryStore.get(key);
      if (!bucket) return null;
      const value = bucket.get(field);
      return value == null ? null : String(value);
    },
    async hincrby(key: string, field: string, increment: number) {
      let bucket = inMemoryStore.get(key);
      if (!bucket) {
        bucket = new Map<string, number>();
        inMemoryStore.set(key, bucket);
      }
      const current = bucket.get(field) ?? 0;
      const next = current + increment;
      bucket.set(field, next);
      return next;
    },
  };
}

export default redis;
