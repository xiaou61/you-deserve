import { ArrowRight, CircleDot, ImageIcon, Sparkles, Workflow } from "lucide-react";

import type { QuestionVisual as QuestionVisualData, VisualNode } from "@/lib/visuals";

const typeText: Record<QuestionVisualData["type"], string> = {
  flow: "流程图",
  structure: "结构图",
  compare: "对比图",
  sequence: "时序图",
  scenario: "场景图"
};

const toneClass: Record<NonNullable<VisualNode["tone"]>, string> = {
  main: "bg-ink text-white",
  safe: "bg-mint text-ink",
  warn: "bg-coral text-white"
};

type QuestionVisualProps = {
  visual: QuestionVisualData;
};

function NodePill({ node, index }: { node: VisualNode; index: number }) {
  return (
    <div className="visual-node">
      <span className={`visual-node-index ${toneClass[node.tone ?? "safe"]}`}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <p className="text-base font-black leading-tight text-ink">{node.label}</p>
        {node.detail ? <p className="mt-1 text-sm font-bold leading-6 text-ink/58">{node.detail}</p> : null}
      </div>
    </div>
  );
}

function connectorText(type: QuestionVisualData["type"]) {
  const text: Record<QuestionVisualData["type"], string> = {
    flow: "下一步",
    structure: "关联",
    compare: "对照",
    sequence: "然后",
    scenario: "进入"
  };

  return text[type];
}

function VisualDiagram({ visual }: QuestionVisualProps) {
  const nodes = visual.nodes ?? [];

  if (visual.columns?.length) {
    return (
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visual.columns.map((column) => (
          <div className="visual-column" key={column.title}>
            <h3>{column.title}</h3>
            <ul>
              {column.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`visual-canvas visual-canvas-${visual.type}`}>
      {nodes.map((node, index) => (
        <div className="visual-step" key={`${node.label}-${index}`}>
          <NodePill index={index} node={node} />
          {index < nodes.length - 1 ? (
            <div className="visual-connector" aria-hidden="true">
              <span>{connectorText(visual.type)}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function QuestionVisual({ visual }: QuestionVisualProps) {
  const firstNode = visual.nodes?.[0]?.label ?? "核心概念";
  const lastNode = visual.nodes?.at(-1)?.label ?? "面试落点";

  return (
    <section className="visual-shell">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-sm font-black text-white">
            <ImageIcon className="h-4 w-4 text-amber" />
            图解秒懂 · {typeText[visual.type]}
          </div>
          <h2 className="mt-4 text-3xl font-black leading-tight text-ink sm:text-4xl">
            {visual.title}
          </h2>
          <p className="mt-3 max-w-3xl text-base font-bold leading-7 text-ink/66">{visual.summary}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-white/72 px-4 py-3 text-sm font-black text-teal shadow-[0_10px_30px_rgb(23_23_20_/_0.08)]">
          <Workflow className="h-4 w-4" />
          已生成图解
        </div>
      </div>

      <VisualDiagram visual={visual} />

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
            看图顺序
          </div>
          <p className="font-bold leading-7 text-ink/68">
            先抓住“{firstNode}”，再顺着箭头看到“{lastNode}”。回答时按图里的节点顺序展开，
            最后补一句边界和风险。
          </p>
        </div>
      </div>
    </section>
  );
}
