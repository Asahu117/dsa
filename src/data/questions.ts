import bank from './bank.json';
import type { DSAQuestion } from '../types';
// bank.json = Striver A2Z (problems with at least one public LeetCode/GFG/Code360 link) + any sheets merged via
// `node scripts/merge-sheet.mjs <file> "<Sheet Name>"`. Order in the file = roadmap order.
export const QUESTIONS: DSAQuestion[] = (bank as unknown as Omit<DSAQuestion, 'order'>[]).map((q, order) => ({ ...q, order }));
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const TOPICS: { name: string; slug: string; index: number }[] = [];
for (const q of QUESTIONS) if (!TOPICS.some((t) => t.name === q.topic)) TOPICS.push({ name: q.topic, slug: slugify(q.topic), index: TOPICS.length });
export const SOURCES = [...new Set(QUESTIONS.flatMap((q) => q.sources))];
export const sectionKey = (topic: string, subtopic: string) => `${topic}||${subtopic}`;
