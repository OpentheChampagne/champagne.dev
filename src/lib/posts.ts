import { getCollection } from "astro:content";
export async function getPosts() {
  return (
    await getCollection(
      "blog",
      ({ data }) => !data.draft && data.date <= new Date(),
    )
  ).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
export const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

// Handwritten-style numeric date for the homepage note cards: 10/07/26 or 10/07/2026.
// The note's id picks the year style, so it varies between notes like real handwriting
// but stays the same for any one note.
export const formatShortDate = (date: Date, id: string) => {
  const hash = [...id].reduce((h, char) => (Math.imul(h, 33) ^ char.charCodeAt(0)) >>> 0, 5381);
  const longYear = ((hash >>> 4) & 1) === 0;
  return date.toLocaleDateString("en-US", {
    year: longYear ? "numeric" : "2-digit",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  });
};
