import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = path.join(process.cwd(), "content", "questions");

function collectMarkdownFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function normalize(text) {
  return text.replace(/\r\n/g, "\n");
}

function extractSection(content, title) {
  const match = normalize(content).match(new RegExp(`(?:^|\\n)## ${title}\\n+([\\s\\S]*?)(?=\\n## |$)`));
  return match?.[1]?.trim() ?? "";
}

function replaceSection(content, title, body) {
  return normalize(content).replace(
    new RegExp(`((?:^|\\n)## ${title}\\n+)([\\s\\S]*?)(?=\\n## |$)`),
    `$1${body.trim()}\n`
  );
}

const files = collectMarkdownFiles(root);
let updated = 0;

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(normalize(raw));
  const detail = extractSection(parsed.content, "详细讲解");
  if (!detail) continue;

  const paragraphs = detail.split(/\n\n+/).map((item) => item.trim()).filter(Boolean);
  const seen = new Set();
  const deduped = [];

  for (const paragraph of paragraphs) {
    if (seen.has(paragraph)) continue;
    seen.add(paragraph);
    deduped.push(paragraph);
  }

  if (deduped.length === paragraphs.length) continue;

  const nextContent = replaceSection(parsed.content, "详细讲解", deduped.join("\n\n"));
  const rebuilt = matter.stringify(nextContent, parsed.data, { lineWidth: 0 });
  fs.writeFileSync(file, rebuilt.replace(/\n/g, "\r\n"), "utf8");
  updated += 1;
}

console.log(JSON.stringify({ updated }, null, 2));
