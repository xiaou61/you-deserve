import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ExternalLink, Target } from "lucide-react";

import { QuestionCard } from "@/components/question-card";
import { getQuestionMetas } from "@/lib/content";
import { getRoadmapStageById, roadmapStages } from "@/lib/roadmap";

type RouteDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return roadmapStages.map((stage) => ({
    id: stage.id
  }));
}

export async function generateMetadata({ params }: RouteDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const stage = getRoadmapStageById(id);

  if (!stage) {
    return {
      title: "路线不存在 | You Deserve"
    };
  }

  return {
    title: `${stage.title} | You Deserve`,
    description: stage.description
  };
}

export default async function RouteDetailPage({ params }: RouteDetailPageProps) {
  const { id } = await params;
  const stage = getRoadmapStageById(id);

  if (!stage) {
    notFound();
  }

  const questions = getQuestionMetas().filter((question) => stage.categories.includes(question.category));
  const Icon = stage.icon;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <Link
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-black text-ink transition hover:border-ink hover:bg-ink hover:text-white"
        href="/routes"
      >
        <ArrowLeft className="h-4 w-4" />
        返回路线
      </Link>

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.8rem] bg-ink p-6 text-white shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-mint">阶段路线</p>
                <h1 className="mt-3 text-4xl font-black leading-tight">{stage.title}</h1>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-amber">
                <Icon className="h-6 w-6" />
              </span>
            </div>
            <p className="mt-5 leading-8 text-white/70">{stage.description}</p>
            <a
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white hover:text-ink"
              href={stage.sourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              {stage.sourceLabel}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-ink">
              <Target className="h-4 w-4 text-coral" />
              本阶段抓手
            </div>
            <div className="flex flex-wrap gap-2">
              {stage.mustKnow.map((item) => (
                <span className="rounded-full bg-smoke px-3 py-1.5 text-sm font-bold text-ink/68" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-ink/10 bg-mint/70 p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-ink">
              <CheckCircle2 className="h-4 w-4 text-teal" />
              学完要达到
            </div>
            <p className="leading-7 text-ink/70">{stage.output}</p>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">Stage Questions</p>
              <h2 className="mt-2 text-3xl font-black text-ink sm:text-4xl">
                本阶段先刷这 {questions.length} 道
              </h2>
            </div>
            <Link className="text-sm font-black text-teal hover:text-coral" href="/#questions">
              回到总题库
            </Link>
          </div>

          {questions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {questions.map((question) => (
                <QuestionCard key={question.slug} question={question} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.6rem] border border-dashed border-ink/18 bg-white px-6 py-12 text-center shadow-soft">
              <p className="text-xl font-black text-ink">这个阶段还在补题</p>
              <p className="mt-2 text-ink/55">内容会继续按路线推进。</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
