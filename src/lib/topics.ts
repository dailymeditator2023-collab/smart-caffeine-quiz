export interface Topic {
  slug: string;
  name: string;
  emoji: string;
  dbName: string; // exact value stored in DB topic column
}

export const TOPICS: Topic[] = [
  { slug: "tech-ai", name: "Tech & AI", emoji: "🤖", dbName: "Tech & AI" },
  { slug: "cricket", name: "Cricket", emoji: "🏏", dbName: "Cricket" },
  { slug: "science", name: "Science", emoji: "🔬", dbName: "Science" },
  { slug: "business", name: "Business & Startups", emoji: "📈", dbName: "Business & Startups" },
  { slug: "coffee", name: "Coffee & Caffeine", emoji: "☕", dbName: "Coffee & Caffeine" },
];

export function getTopicBySlug(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

export function getTopicByDbName(dbName: string): Topic | undefined {
  return TOPICS.find((t) => t.dbName === dbName);
}
