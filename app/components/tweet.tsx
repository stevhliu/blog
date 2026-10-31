import type { ReactNode } from "react";
import { after } from "next/server";
import { getTweet, type Tweet as TweetData } from "react-tweet/api";
import { supabase } from "@/app/supabase";
import { Caption } from "./caption";

// Tweets render as plain server markup. react-tweet's own renderer includes
// client components (date-fns, swr, a copy button, a video player), and since
// every post shares one route, their JS and CSS shipped to every post even
// though only two embed a tweet. Only its fetcher, react-tweet/api, is used.

interface TweetArgs {
  id: string;
  caption: ReactNode;
}

// The syndication API marks deleted, protected or withheld tweets with a
// `tombstone` instead of returning them. Tweet's type doesn't declare it.
function isTombstone(tweet: TweetData): boolean {
  return "tombstone" in tweet && Boolean(tweet.tombstone);
}

/**
 * Fetch a tweet fresh, falling back to the Supabase cache only when the fetch
 * itself fails (network error, rate limit, 5xx). A tweet that X reports as
 * missing or tombstoned stays gone: the cache covers outages, it must not
 * bring back something its author deleted or protected.
 */
async function getAndCacheTweet(id: string): Promise<TweetData | undefined> {
  let tweet: TweetData | undefined;
  try {
    tweet = await getTweet(id);
  } catch (error) {
    console.error("tweet fetch error", error);
    return supabase ? readCachedTweet(id) : undefined;
  }

  if (!tweet || isTombstone(tweet)) return undefined;

  if (supabase) {
    const sb = supabase;
    const fresh = tweet;
    after(async () => {
      const { error } = await sb.from("tweet_cache").upsert({
        tweet_id: id,
        data: fresh,
        cached_at: new Date().toISOString(),
      });
      if (error) console.error("tweet cache upsert error", error);
    });
  }
  return tweet;
}

async function readCachedTweet(id: string): Promise<TweetData | undefined> {
  if (!supabase) return undefined;
  const { data, error } = await supabase
    .from("tweet_cache")
    .select("data")
    .eq("tweet_id", id)
    .maybeSingle();

  if (error) {
    console.error("tweet cache fetch error", error);
  }

  const cachedTweet = (data?.data as TweetData | null | undefined) ?? undefined;
  if (!cachedTweet || isTombstone(cachedTweet)) return undefined;
  return cachedTweet;
}

type QuotedTweet = NonNullable<TweetData["quoted_tweet"]>;
type AnyTweet = TweetData | QuotedTweet;

const tweetUrl = (tweet: AnyTweet) =>
  `https://x.com/${tweet.user.screen_name}/status/${tweet.id_str}`;

// Same underline treatment as the site's own links (app/components/a.tsx).
const linkClass =
  "border-b border-gray-300 transition-[border-color] duration-100 ease-[ease] motion-reduce:transition-none dark:border-gray-500 [@media(hover:hover)_and_(pointer:fine)]:hover:border-gray-600 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-white";

type Segment = { start: number; end: number; node: ReactNode };

// The API returns text with &, < and > escaped, and entity indices count the
// escaped text, so decode each plain-text slice after cutting it.
const decodeEntities = (text: string) =>
  text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/**
 * Turn the tweet text into React nodes with mentions, hashtags, cashtags and
 * links replaced by anchors. Entity indices count code points, not UTF-16
 * units, so the text is split with Array.from before slicing.
 */
function renderText(tweet: AnyTweet): ReactNode[] {
  const chars = Array.from(tweet.text);
  const [rangeStart, rangeEnd] = tweet.display_text_range ?? [0, chars.length];
  const { hashtags = [], urls = [], user_mentions = [], symbols = [] } =
    tweet.entities ?? {};

  const segments: Segment[] = [
    ...user_mentions.map(m => ({
      start: m.indices[0],
      end: m.indices[1],
      node: <a className={linkClass} href={`https://x.com/${m.screen_name}`}>@{m.screen_name}</a>,
    })),
    ...hashtags.map(h => ({
      start: h.indices[0],
      end: h.indices[1],
      node: <a className={linkClass} href={`https://x.com/hashtag/${h.text}`}>#{h.text}</a>,
    })),
    ...symbols.map(s => ({
      start: s.indices[0],
      end: s.indices[1],
      node: <a className={linkClass} href={`https://x.com/search?q=%24${s.text}`}>${s.text}</a>,
    })),
    ...urls.map(u => ({
      start: u.indices[0],
      end: u.indices[1],
      node: <a className={linkClass} href={u.expanded_url}>{u.display_url}</a>,
    })),
  ]
    .filter(s => s.start >= rangeStart && s.end <= rangeEnd)
    .sort((a, b) => a.start - b.start);

  const nodes: ReactNode[] = [];
  let cursor = rangeStart;
  segments.forEach((segment, i) => {
    if (segment.start < cursor) return; // overlapping entity; keep the first
    nodes.push(decodeEntities(chars.slice(cursor, segment.start).join("")));
    nodes.push(<span key={i}>{segment.node}</span>);
    cursor = segment.end;
  });
  nodes.push(decodeEntities(chars.slice(cursor, rangeEnd).join("")));
  return nodes;
}

function TweetMedia({ tweet }: { tweet: AnyTweet }) {
  const media = tweet.mediaDetails ?? [];
  if (media.length === 0) return null;

  return (
    <div className={`mt-3 grid gap-0.5 overflow-hidden rounded-xl ${media.length > 1 ? "grid-cols-2" : ""}`}>
      {media.map(item => {
        const { width, height } = item.original_info;
        if (item.type === "photo") {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={item.media_url_https}
              src={item.media_url_https}
              alt={item.ext_alt_text ?? ""}
              width={width}
              height={height}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          );
        }
        // X's video host returns 403 to requests that carry a Referer, and
        // <video> can't opt out of sending one, so videos and GIFs show
        // their poster frame and play on X.
        return (
          <a
            key={item.media_url_https}
            href={tweetUrl(tweet)}
            aria-label="Play video on X"
            className="relative block no-underline"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.media_url_https}
              alt=""
              width={width}
              height={height}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="h-auto w-full"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-0.5 h-6 w-6 fill-current">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </a>
        );
      })}
    </div>
  );
}

function TweetAuthor({ tweet, small = false }: { tweet: AnyTweet; small?: boolean }) {
  const size = small ? 20 : 40;
  return (
    <a
      href={`https://x.com/${tweet.user.screen_name}`}
      className="flex min-w-0 items-center gap-2 no-underline"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tweet.user.profile_image_url_https}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={tweet.user.profile_image_shape === "Square" ? "rounded-md" : "rounded-full"}
      />
      <span className={`flex min-w-0 ${small ? "items-baseline gap-1" : "flex-col"}`}>
        <span className="truncate font-semibold">{tweet.user.name}</span>
        <span className="truncate text-gray-500 dark:text-gray-400">
          @{tweet.user.screen_name}
        </span>
      </span>
    </a>
  );
}

// Formatted on the server in UTC so the static HTML never disagrees with
// itself; react-tweet did this on the client with date-fns.
const createdAtFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TweetCard({ tweet }: { tweet: TweetData }) {
  const created = new Date(tweet.created_at);
  return (
    <article className="w-full max-w-[550px] rounded-xl border border-[rgb(207,217,222)] bg-white p-4 text-left text-[15px] leading-[1.3rem] dark:border-[#333] dark:bg-[#222]">
      <div className="flex items-start justify-between gap-3">
        <TweetAuthor tweet={tweet} />
        <a href={tweetUrl(tweet)} aria-label="View on X" className="-m-3 p-3 no-underline">
          <XLogo />
        </a>
      </div>

      {tweet.in_reply_to_screen_name ? (
        <p className="m-0 mt-3 text-gray-500 dark:text-gray-400">
          Replying to{" "}
          <a className={linkClass} href={`https://x.com/${tweet.in_reply_to_screen_name}`}>
            @{tweet.in_reply_to_screen_name}
          </a>
        </p>
      ) : null}

      <p className="m-0 mt-3 whitespace-pre-wrap break-words">{renderText(tweet)}</p>

      <TweetMedia tweet={tweet} />

      {tweet.quoted_tweet ? (
        <div className="mt-3 rounded-xl border border-[rgb(207,217,222)] p-3 dark:border-[#333]">
          <TweetAuthor tweet={tweet.quoted_tweet} small />
          <p className="m-0 mt-2 whitespace-pre-wrap break-words">
            {renderText(tweet.quoted_tweet)}
          </p>
          <TweetMedia tweet={tweet.quoted_tweet} />
        </div>
      ) : null}

      <p className="m-0 mt-3 text-gray-500 dark:text-gray-400">
        <a className={linkClass} href={tweetUrl(tweet)}>
          <time dateTime={created.toISOString()}>{createdAtFormatter.format(created)} UTC</time>
        </a>
      </p>
    </article>
  );
}

function TweetUnavailable({ id }: { id: string }) {
  return (
    <div className="w-full max-w-[550px] rounded-xl border border-[rgb(207,217,222)] bg-white p-4 text-center text-gray-500 dark:border-[#333] dark:bg-[#222] dark:text-gray-400">
      This post is unavailable.{" "}
      <a className={linkClass} href={`https://x.com/i/status/${id}`}>
        View on X
      </a>
    </div>
  );
}

export async function Tweet({ id, caption }: TweetArgs) {
  const tweet = await getAndCacheTweet(id);
  return (
    <div className="my-6">
      <div className="flex justify-center">
        {tweet ? <TweetCard tweet={tweet} /> : <TweetUnavailable id={id} />}
      </div>
      {caption && <Caption>{caption}</Caption>}
    </div>
  );
}
