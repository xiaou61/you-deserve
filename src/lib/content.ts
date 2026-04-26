import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

export type Difficulty = "easy" | "medium" | "hard";

export type QuestionMeta = {
  title: string;
  slug: string;
  category: string;
  tags: string[];
  difficulty: Difficulty;
  route: string;
  scene: string;
  order: number;
  summary: string;
  readingTime: number;
};

export type Question = QuestionMeta & {
  content: string;
  filePath: string;
};

const contentRoot = path.join(process.cwd(), "content", "questions");

function getMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return getMarkdownFiles(fullPath);
    }

    if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      return [fullPath];
    }

    return [];
  });
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asDifficulty(value: unknown): Difficulty {
  if (value === "easy" || value === "medium" || value === "hard") {
    return value;
  }

  return "medium";
}

function estimateReadingTime(content: string): number {
  const chineseChars = content.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  const latinWords = content.match(/[a-zA-Z0-9_]+/g)?.length ?? 0;
  const units = chineseChars + latinWords * 2;

  return Math.max(1, Math.ceil(units / 520));
}

function parseQuestion(filePath: string): Question {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const fallbackSlug = path.basename(filePath).replace(/\.(md|mdx)$/, "");

  return {
    title: asString(data.title, fallbackSlug),
    slug: asString(data.slug, fallbackSlug),
    category: asString(data.category, "未分类"),
    tags: asStringArray(data.tags),
    difficulty: asDifficulty(data.difficulty),
    route: asString(data.route, "通用路线"),
    scene: asString(data.scene, "面试常见"),
    order: typeof data.order === "number" ? data.order : 999,
    summary: asString(data.summary, ""),
    readingTime: estimateReadingTime(content),
    content,
    filePath
  };
}

function toQuestionMeta(question: Question): QuestionMeta {
  return {
    title: question.title,
    slug: question.slug,
    category: question.category,
    tags: question.tags,
    difficulty: question.difficulty,
    route: question.route,
    scene: question.scene,
    order: question.order,
    summary: question.summary,
    readingTime: question.readingTime
  };
}

export function getAllQuestions(): Question[] {
  return getMarkdownFiles(contentRoot)
    .map(parseQuestion)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "zh-CN"));
}

export function getQuestionBySlug(slug: string): Question | undefined {
  return getAllQuestions().find((question) => question.slug === slug);
}

export function getQuestionMetas(): QuestionMeta[] {
  return getAllQuestions().map(toQuestionMeta);
}

export function getCategories(): string[] {
  return Array.from(new Set(getAllQuestions().map((question) => question.category)));
}

export function getRoutes(): string[] {
  return Array.from(new Set(getAllQuestions().map((question) => question.route)));
}

export function getRelatedQuestions(question: Question, limit = 3): QuestionMeta[] {
  const tagSet = new Set(question.tags);

  return getAllQuestions()
    .filter((item) => item.slug !== question.slug)
    .map((item) => ({
      item,
      score:
        (item.category === question.category ? 3 : 0) +
        item.tags.filter((tag) => tagSet.has(tag)).length +
        (item.route === question.route ? 1 : 0)
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.order - b.item.order)
    .slice(0, limit)
    .map(({ item }) => toQuestionMeta(item));
}
