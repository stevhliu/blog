import { Redis } from "@upstash/redis";

type RedisLike = {
  hgetall: (key: string) => Promise<Record<string, string> | null>;
  hget: (key: string, field: string) => Promise<string | null>;
  hincrby: (key: string, field: string, increment: number) => Promise<number>;
  get: <T = unknown>(key: string) => Promise<T | null>;
  set: (key: string, value: unknown) => Promise<"OK">;
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
  const hashStore = new Map<string, Map<string, number>>();
  const kvStore = new Map<string, unknown>();

  redis = {
    async hgetall(key: string) {
      const bucket = hashStore.get(key);
      if (!bucket) return null;
      const result: Record<string, string> = {};
      for (const [field, value] of bucket.entries()) {
        result[field] = String(value);
      }
      return Object.keys(result).length > 0 ? result : null;
    },
    async hget(key: string, field: string) {
      const bucket = hashStore.get(key);
      if (!bucket) return null;
      const value = bucket.get(field);
      return value == null ? null : String(value);
    },
    async hincrby(key: string, field: string, increment: number) {
      let bucket = hashStore.get(key);
      if (!bucket) {
        bucket = new Map<string, number>();
        hashStore.set(key, bucket);
      }
      const current = bucket.get(field) ?? 0;
      const next = current + increment;
      bucket.set(field, next);
      return next;
    },
    async get<T = unknown>(key: string): Promise<T | null> {
      return (kvStore.has(key) ? (kvStore.get(key) as T) : null);
    },
    async set(key: string, value: unknown): Promise<"OK"> {
      kvStore.set(key, value);
      return "OK";
    },
  };
}

export default redis;
