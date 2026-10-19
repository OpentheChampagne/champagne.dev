import rss from "@astrojs/rss";
import { getPosts } from "../lib/posts";
import type { APIContext } from "astro";
export async function GET(context: APIContext) {
  return rss({
    title: "Champagne.dev — Notes",
    description: "Notes on code, design, and useful little tools.",
    site: context.site!,
    items: (await getPosts()).map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/notes/${post.id}`,
    })),
  });
}
