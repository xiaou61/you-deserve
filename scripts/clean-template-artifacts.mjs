#!/usr/bin/env node
// 批量修正 content/questions 下脚本生成内容里的机械瑕疵：
// 1. 拼接残留：。；  ；。  。。  ；；
// 2. 小数点丢失：075 → 0.75；05 → 0.5（仅限固定语境）
// 3. 中英文之间漏空格的固定词对
// 4. 删除/替换最明显的模板套话；若导致 详细讲解 字数低于 1000 则回退本文件
//
// 用法：node scripts/clean-template-artifacts.mjs [--dry]
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const questionsRoot = path.join(root, "content", "questions");
const dry = process.argv.includes("--dry");

function collect(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collect(p));
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(p);
  }
  return out;
}

function sub(text, pattern, replacement) {
  let count = 0;
  const next = text.replace(pattern, (...args) => {
    count += 1;
    return typeof replacement === "function" ? replacement(...args) : replacement;
  });
  return [next, count];
}

// —— 安全修复（始终应用）——
const PUNCT_FIXES = [
  [/。；/g, "；"],
  [/；。/g, "。"],
  [/。。+/g, "。"],
  [/；；+/g, "；"]
];

// 中英文之间漏空格（保守词表）
const CN_EN_PAIRS = [
  [/CompletableFuture对比/g, "CompletableFuture 对比"],
  [/Java语境/g, "Java 语境"],
  [/MySQL语境/g, "MySQL 语境"],
  [/Redis语境/g, "Redis 语境"],
  [/JVM语境/g, "JVM 语境"],
  [/Spring语境/g, "Spring 语境"],
  [/MyBatis语境/g, "MyBatis 语境"],
  [/Java题里/g, "Java 题里"],
  [/MySQL题里/g, "MySQL 题里"],
  [/Redis题里/g, "Redis 题里"],
  [/JVM题里/g, "JVM 题里"],
  [/Spring题里/g, "Spring 题里"],
  [/MQ题里/g, "MQ 题里"],
  [/MyBatis题里/g, "MyBatis 题里"],
  [/说明JDK实现/g, "说明 JDK 实现"],
  [/说明JVM实现/g, "说明 JVM 实现"]
];

// 仅在“图解提示”这种箭头链路里，把 075/05 修回小数
const DECIMAL_FIXES = [
  [/(\s)075(\s)/g, "$10.75$2"],
  [/(\s)05(\s)/g, "$10.5$2"],
  [/(\s)025(\s)/g, "$10.25$2"]
];

// —— 模板噪声删除/替换（在 详细讲解 长度允许时才生效）——
const TEMPLATE_NOISE = [
  [
    /[^。\n]{0,40}这道题现在要从“能背出来”修到“能接住追问”。核心结论是：([^。\n]+)。/g,
    "核心结论是：$1。"
  ],
  [/这样能避免泛泛而谈，也能让面试官听出你知道这题的真实边界。/g, ""],
  [
    /每个点都要回答三个问题：它在链路里的位置是什么，它改变了什么状态，失败或边界条件下会留下什么现象。把这三件事讲清楚，追问从概念跳到实战时就不会断。/g,
    "每个点都要交代它在链路里的位置、它改变了哪个状态，以及失败或边界条件下会留下什么可观察现象。"
  ],
  [
    /很多八股答案的问题不是方向错，而是没有说适用范围；一旦遇到数据规模变化、异常分支或版本差异，原来的结论就可能不成立。/g,
    "答错往往不是方向错，而是没有说适用范围；一旦数据规模、异常分支或版本变了，结论就可能不成立。"
  ],
  [
    /最后收束成一套回答节奏：先给结论，再讲机制，再补边界，最后说验证方式。/g,
    "回答的节奏可以是：先结论，再机制，再边界，最后讲怎么验证。"
  ],
  [/这样既保留八股题的清晰度，也能把答案讲成可落地、可排查、可复盘的经验。/g, ""],
  [
    /画面重点突出：[^。\n]+？\s*不是孤立概念，要把核心机制、边界风险、异常处理和验证证据放在同一张图里。/g,
    "画面重点：把核心机制、边界风险、异常分支和验证证据放在同一张图里。"
  ]
];

function applyAll(text, rules) {
  let next = text;
  let count = 0;
  for (const [pat, rep] of rules) {
    const [n, c] = sub(next, pat, rep);
    next = n;
    count += c;
  }
  return [next, count];
}

function extractDetailLength(content) {
  const match = content.match(/(?:^|\r?\n)## 详细讲解\r?\n([\s\S]*?)(?=\r?\n## |$)/);
  if (!match) return null;
  return match[1].replace(/\s/g, "").length;
}

let totalChanged = 0;
let rolledBack = 0;
let totalReplacements = 0;
const patternCounts = {};

for (const file of collect(questionsRoot)) {
  const original = fs.readFileSync(file, "utf8");

  // Step 1：先做安全修复
  let [text, safeCount] = applyAll(original, [
    ...PUNCT_FIXES,
    ...CN_EN_PAIRS,
    ...DECIMAL_FIXES
  ]);

  // Step 2：逐条尝试删模板噪声，只保留不会让“详细讲解”跌破阈值的那部分
  let noiseCount = 0;
  let skippedAny = false;
  const FLOOR = 1010;
  for (const [pat, rep] of TEMPLATE_NOISE) {
    const [next, c] = sub(text, pat, rep);
    if (c === 0) continue;
    const trial = matter(next);
    const len = extractDetailLength(trial.content);
    if (len != null && len < FLOOR) {
      skippedAny = true;
      continue; // 跳过这条规则，不写回
    }
    text = next;
    noiseCount += c;
    patternCounts[pat.source] = (patternCounts[pat.source] ?? 0) + c;
  }
  if (skippedAny) rolledBack += 1;

  // 最终标点统一二次清理（防止替换链尾巴）
  const [final2, c2] = applyAll(text, PUNCT_FIXES);
  text = final2;

  if (text !== original) {
    totalChanged += 1;
    totalReplacements += safeCount + noiseCount + c2;
    if (!dry) fs.writeFileSync(file, text);
  }
}

console.log(`Files changed: ${totalChanged}`);
console.log(`Rolled back (detail<1010): ${rolledBack}`);
console.log(`Total replacements: ${totalReplacements}`);
const topPatterns = Object.entries(patternCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30);
for (const [pattern, count] of topPatterns) {
  console.log(`  ${count.toString().padStart(5)}× ${pattern}`);
}
if (dry) console.log("(dry-run, no files written)");
