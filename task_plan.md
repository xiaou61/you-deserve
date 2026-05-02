# Task Plan

## Goal
把题库从“短答案 + 生图提示词”升级成“更详细的面试题内容 + 每题都有可视化图解”。

## Phases
- [complete] 1. 盘点现有题目、可视化数据和页面渲染链路
- [complete] 2. 批量扩写所有题目 Markdown，保留原有内容并补充实战细节
- [complete] 3. 优化可视化数据生成，让每题都有更完整的图解节点
- [complete] 4. 改造题目页视觉组件，隐藏“生图提示词”，展示真正图解
- [complete] 5. 跑 lint/build，访问页面验证效果
- [in_progress] 6. 按 10 道一批增加 1000-2000 字 `详细讲解`，并保存批处理进度

## Detail Batch Progress
- Batch size: 10
- Completed batches: 1-40
- Completed range: sorted questions 1-400
- Next batch: 41
- Next range: none
- Status: verified through batch 40; all question batches completed

## Decisions
- 优先做可运行的批量增强脚本，避免手工改几道题导致覆盖不完整。
- 保留原始 Markdown 的 frontmatter 和已有回答，只追加结构化扩展段落。
- 新的超长详解按 10 道一批推进，进度写入 `content/question-detail-progress.json`，方便后续继续。
- 详解正文使用 `## 详细讲解`，长度目标为去空白后 1000-2000 个中文字符左右；图解继续使用站内 `QuestionVisual` 渲染，避免只显示 Mermaid 代码块。
- 第一批详解实际长度已按脚本独立校验，最短 1002、最长 1072。
- 前四十批详解实际长度已按脚本独立校验，400 道全部在 1000-2000 字符目标内；当前整体范围 1000-1264，batch 10 范围 1005-1160，batch 11 范围 1026-1167，batch 12 范围 1122-1204，batch 13 范围 1038-1204，batch 14 范围 1007-1221，batch 15 范围 1142-1254，batch 16 范围 1049-1209，batch 17 范围 1164-1237，batch 18 范围 1148-1237，batch 19 范围 1127-1204，batch 20 范围 1112-1208，batch 21 范围 1007-1186，batch 22 范围 1156-1264，batch 23 范围 1135-1179，batch 24 范围 1131-1215，batch 25 范围 1125-1214，batch 26 范围 1099-1250，batch 27 范围 1157-1243，batch 28 范围 1143-1247，batch 29 范围 1144-1193，batch 30 范围 1128-1207，batch 31 范围 1139-1217，batch 32 范围 1120-1219，batch 33 范围 1124-1247，batch 34 范围 1150-1243，batch 35 范围 1137-1201，batch 36 范围 1151-1209，batch 37 范围 1133-1226，batch 38 范围 1128-1189，batch 39 范围 1128-1216，batch 40 范围 1130-1151。
- `scripts/enrich-detail-batch.mjs` 已增强为可自动生成缺失批次 payload，并会为不足 1000 字符的历史详解追加工程化补充，避免进度数字前进但内容质量掉线。

## Errors Encountered
- `Get-Content src\app\questions\[slug]\page.tsx` 被 PowerShell 当作通配符路径解析，改用 `-LiteralPath`。
