import links from "@/links.json";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";

export default async function Link(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bot?: string }>;
}) {
  const params = await props.params;
  const link = links[params.id];

  if (link == null) {
    return notFound();
  }

  const searchParams = await props.searchParams;
  if (searchParams.bot) {
    return <></>;
  }

  const userAgent = (await headers()).get("user-agent") ?? "";
  if (/bot/i.test(userAgent)) {
    return <></>;
  }

  redirect(link.link);
}