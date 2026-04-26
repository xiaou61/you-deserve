import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";

import type { QuestionMeta } from "@/lib/content";

const difficultyText: Record<QuestionMeta["difficulty"], string> = {
  easy: "入门",
  medium: "进阶",
  hard: "硬仗"
};

type QuestionCardProps = {
  question: QuestionMeta;
  compact?: boolean;
};

export function QuestionCard({ question, compact = false }: QuestionCardProps) {
  return (
    <Link className="question-card group" href={`/questions/${question.slug}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-black text-ink">
              {question.category}
            </span>
            <span className="rounded-full bg-smoke px-2.5 py-1 text-xs font-black text-ink/55">
              {difficultyText[question.difficulty]}
            </span>
          </div>
          <h3 className="mt-4 text-xl font-black leading-snug text-ink group-hover:text-coral">
            {question.title}
          </h3>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-ink text-white transition group-hover:-translate-y-1 group-hover:bg-coral">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      {!compact ? <p className="mt-4 leading-7 text-ink/65">{question.summary}</p> : null}

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-bold text-ink/48">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-4 w-4" />
          {question.readingTime} 分钟
        </span>
        <span>{question.scene}</span>
      </div>
    </Link>
  );
}
