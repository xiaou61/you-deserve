import { CircleDot, GitBranch, ImageIcon, Sparkles, Workflow } from "lucide-react";

import type { QuestionVisual as QuestionVisualData, VisualNode } from "@/lib/visuals";

const typeText: Record<QuestionVisualData["type"], string> = {
  flow: "流程导图",
  structure: "结构导图",
  compare: "对比导图",
  sequence: "时序导图",
  scenario: "场景导图"
};

const toneClass: Record<NonNullable<VisualNode["tone"]>, string> = {
  main: "bg-ink text-white",
  safe: "bg-mint text-ink",
  warn: "bg-coral text-white"
};

type QuestionVisualProps = {
  visual: QuestionVisualData;
};

type BranchNode = {
  label: string;
  detail?: string;
  tone?: VisualNode["tone"];
  points: string[];
};

function compactText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function splitDetail(detail?: string) {
  if (!detail) {
    return [];
  }

  return compactText(detail)
    .split(/[、，；。]/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2)
    .slice(0, 3);
}

function fallbackPoint(visual: QuestionVisualData, node: VisualNode, index: number) {
  if (node.tone === "warn") {
    return "这里通常也是风险、边界和追问点";
  }

  if (index === 0) {
    return "先把这一支讲清楚，主线就稳了";
  }

  const map: Record<QuestionVisualData["type"], string> = {
    flow: "回答时顺着这条链路往后讲",
    structure: "把这一支和整体结构联系起来",
    compare: "和其他分支放在同一维度对照",
    sequence: "讲清它前后依赖的阶段",
    scenario: "落回真实业务场景去解释"
  };

  return map[visual.type];
}

function buildBranches(visual: QuestionVisualData) {
  return (visual.nodes ?? []).map((node, index) => {
    const points = splitDetail(node.detail);

    if (!points.length) {
      points.push(fallbackPoint(visual, node, index));
    } else if (points.length < 3) {
      points.push(fallbackPoint(visual, node, index));
    }

    return {
      label: node.label,
      detail: node.detail,
      tone: node.tone,
      points: points.slice(0, 3)
    };
  });
}

function BranchCard({
  branch,
  index,
  isCore = false
}: {
  branch: BranchNode;
  index: number;
  isCore?: boolean;
}) {
  return (
    <article className={isCore ? "mindmap-core-card" : "mindmap-branch-card"}>
      <div className="flex items-start gap-3">
        <span className={`${isCore ? "mindmap-core-badge" : "mindmap-branch-badge"} ${toneClass[branch.tone ?? "safe"]}`}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <h3 className={`${isCore ? "text-2xl sm:text-3xl" : "text-lg"} font-black leading-tight text-ink`}>
            {branch.label}
          </h3>
          {branch.detail ? <p className="mt-2 text-sm font-bold leading-6 text-ink/60">{branch.detail}</p> : null}
        </div>
      </div>

      {branch.points.length ? (
        <ul className={isCore ? "mindmap-core-points" : "mindmap-branch-points"}>
          {branch.points.map((point) => (
            <li className={isCore ? "mindmap-core-point" : "mindmap-branch-point"} key={point}>
              <span className="mindmap-point-dot" aria-hidden="true" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export function QuestionVisual({ visual }: QuestionVisualProps) {
  const branches = buildBranches(visual);
  const [core, ...rest] = branches.length
    ? branches
    : [
        {
          label: visual.title,
          detail: visual.summary,
          tone: "main" as const,
          points: [visual.takeaway]
        }
      ];

  return (
    <section className="visual-shell">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-sm font-black text-white">
            <ImageIcon className="h-4 w-4 text-amber" />
            图解复盘 · {typeText[visual.type]}
          </div>
          <h2 className="mt-4 text-3xl font-black leading-tight text-ink sm:text-4xl">{visual.title}</h2>
          <p className="mt-3 max-w-3xl text-base font-bold leading-7 text-ink/66">{visual.summary}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-white/72 px-4 py-3 text-sm font-black text-teal shadow-[0_10px_30px_rgb(23_23_20_/_0.08)]">
          <Workflow className="h-4 w-4" />
          导图复盘
        </div>
      </div>

      <div className={`mindmap-shell mindmap-shell-${visual.type}`}>
        <div className="mindmap-topline" aria-hidden="true">
          <GitBranch className="h-4 w-4" />
          <span>从核心概念向外拆分</span>
        </div>

        <div className="mindmap-core-wrap">
          <BranchCard branch={core} index={0} isCore />
        </div>

        <div className="mindmap-branch-grid">
          {rest.map((branch, index) => (
            <BranchCard branch={branch} index={index + 1} key={`${branch.label}-${index}`} />
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-[1.2rem] bg-white/76 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-black text-coral">
            <Sparkles className="h-4 w-4" />
            记忆落点
          </div>
          <p className="font-bold leading-7 text-ink/72">{visual.takeaway}</p>
        </div>
        <div className="rounded-[1.2rem] border border-ink/10 bg-white/76 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-black text-teal">
            <CircleDot className="h-4 w-4" />
            怎么看图
          </div>
          <p className="font-bold leading-7 text-ink/68">
            先看中间核心，再按分支逐个展开。每个分支都可以按“定义 / 机制 / 风险 / 工程落地”这个顺序往下讲，
            这样比死背段落更像真正的脑图复盘。
          </p>
        </div>
      </div>
    </section>
  );
}
