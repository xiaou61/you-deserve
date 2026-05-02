# Findings

## 2026-05-02
- 项目是 Next.js 16 + React 19 的静态内容题库。
- 题目内容存放在 `content/questions/**.md`。
- 每题页面在 `src/app/questions/[slug]/page.tsx` 渲染 Markdown，并通过 `getQuestionVisual(slug)` 加载 `content/visuals/question-visuals.json`。
- 截图里的黑色“生图提示词”来自 `src/components/question-visual.tsx`，当前只是把 prompt 展示给用户，并不是真正的生成图。
- 已有脚本 `scripts/generate-visuals-from-questions.mjs` 会根据题目内容生成 visual JSON。
- 当前共有 400 道题，`content/visuals/question-visuals.json` 也有 400 条记录。
- 所有题目都有 `一句话结论 / 通俗解释 / 面试回答 / 常见追问 / 易错点 / 记忆钩子`，但只有 149 道题有 `图解提示`。
- 题目平均长度约 1.7KB，需要追加更结构化的“回答框架、项目落地、追问、避坑、图解提示”。
- 扩写后 400 道题平均长度约 6KB，全部增加了 `深挖理解 / 实战落地 / 追问准备 / 回答模板 / 图解提示`。
- 重新生成 visual 后，400 道题全部有图解数据；节点数量 3 到 7 个，类型分布为结构图 184、流程图 37、时序图 32、对比图 62、场景图 85。
