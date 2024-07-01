import { Redis } from "@upstash/redis";

// if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
//   throw new Error("UPSTASH_REDIS_REST_TOKEN is not defined");
// }

const redis = new Redis({
  url: "https://usw1-native-pup-33102.upstash.io",
  token: "AYFOASQgOTRiNWU2YTQtYThiZi00OGE4LTkwZTQtNGRhYTUyYWQ4MmJkYzczYjYwNmUxZGEyNGI4YTg4YTdjOWIwZTRjNDhlNmQ=",
});

export default redis;
