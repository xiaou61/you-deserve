import { ImageIcon, MessageSquareText, Sparkles } from "lucide-react";

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

export function QuestionVisual({ visual }: QuestionVisualProps) {
  const nodeCount = visual.nodes?.length ?? 0;
  const nodeGridClass =
    nodeCount <= 4 ? "mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4" : "mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5";

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
        <div className="rounded-2xl bg-white/72 px-4 py-3 text-sm font-black text-teal shadow-[0_10px_30px_rgb(23_23_20_/_0.08)]">
          可直接用于生图
        </div>
      </div>

      {visual.columns?.length ? (
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
      ) : (
        <div className={nodeGridClass}>
          {(visual.nodes ?? []).slice(0, 5).map((node, index) => (
            <NodePill index={index} key={`${node.label}-${index}`} node={node} />
          ))}
        </div>
      )}

      {(visual.nodes?.length ?? 0) > 5 ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(visual.nodes ?? []).slice(5).map((node, index) => (
            <NodePill index={index + 5} key={`${node.label}-${index}`} node={node} />
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-[1.2rem] bg-white/76 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-black text-coral">
            <Sparkles className="h-4 w-4" />
            记忆落点
          </div>
          <p className="font-bold leading-7 text-ink/72">{visual.takeaway}</p>
        </div>
        <div className="rounded-[1.2rem] border border-ink/10 bg-ink p-4 text-white">
          <div className="mb-2 flex items-center gap-2 text-sm font-black text-amber">
            <MessageSquareText className="h-4 w-4" />
            生图提示词
          </div>
          <p className="text-sm font-bold leading-7 text-white/72">{visual.prompt}</p>
        </div>
      </div>
    </section>
  );
}
