import { type ReactNode, Suspense } from "react";
import { unstable_after as after } from "next/server";
import { Tweet, getTweet } from "react-tweet/api";
import {
  EmbeddedTweet,
  TweetNotFound,
  TweetSkeleton,
  type TweetProps,
} from "react-tweet";
import { supabase } from "@/app/supabase";
import { Caption } from "./caption";
import "./tweet.css";

interface TweetArgs {
  id: string;
  caption: ReactNode;
}

async function getAndCacheTweet(id: string): Promise<Tweet | undefined> {
  if (!supabase) {
    try {
      const tweet = await getTweet(id);
      // @ts-ignore
      if (tweet && !tweet.tombstone) {
        return tweet;
      }
    } catch (error) {
      console.error("tweet fetch error", error);
    }

    return undefined;
  }

  const sb = supabase;

  // we first prioritize getting a fresh tweet
  try {
    const tweet = await getTweet(id);

    // @ts-ignore
    if (tweet && !tweet.tombstone) {
      after(async () => {
        const { error } = await sb.from("tweet_cache").upsert({
          tweet_id: id,
          data: tweet,
          cached_at: new Date().toISOString(),
        });
        if (error) console.error("tweet cache upsert error", error);
      });
      return tweet;
    }
  } catch (error) {
    console.error("tweet fetch error", error);
  }

  const { data, error } = await sb
    .from("tweet_cache")
    .select("data")
    .eq("tweet_id", id)
    .maybeSingle();

  if (error) {
    console.error("tweet cache fetch error", error);
  }

  const cachedTweet: Tweet | null =
    (data?.data as unknown as Tweet | null) ?? null;

  // @ts-ignore
  if (!cachedTweet || cachedTweet.tombstone) return undefined;

  return cachedTweet;
}

/**
 * react-tweet's enrichTweet() iterates entities.{hashtags,urls,user_mentions,
 * symbols} unconditionally — for the tweet AND its quoted_tweet. Some fetched/
 * cached tweets omit one of those arrays, which throws "entities is not
 * iterable". Backfill them on both.
 */
function withEntities<T extends { entities?: Tweet["entities"] }>(t: T): T {
  return {
    ...t,
    entities: {
      hashtags: [],
      urls: [],
      user_mentions: [],
      symbols: [],
      ...t.entities,
    },
  };
}

function normalizeTweet(tweet: Tweet): Tweet {
  const normalized = withEntities(tweet);
  if (normalized.quoted_tweet) {
    normalized.quoted_tweet = withEntities(normalized.quoted_tweet);
  }
  return normalized;
}

const TweetContent = async ({ id, components }: TweetProps) => {
  const tweet = id ? await getAndCacheTweet(id) : undefined;

  if (!tweet) {
    return <TweetNotFound />;
  }

  return <EmbeddedTweet tweet={normalizeTweet(tweet)} components={components} />;
};

export const ReactTweet = (props: TweetProps) => (
  <Suspense fallback={<TweetSkeleton />}>
    {/* @ts-ignore: Async components are valid in the app directory */}
    <TweetContent {...props} />
  </Suspense>
);

export async function Tweet({ id, caption }: TweetArgs) {
  return (
    <div className="tweet my-6">
      <div className={`flex justify-center`}>
        <ReactTweet id={id} />
      </div>
      {caption && <Caption>{caption}</Caption>}
    </div>
  );
}
