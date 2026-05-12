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
        className="ghost-action mb-4 px-4 py-2 text-sm font-semibold"
        href="/routes"
      >
        <ArrowLeft className="h-4 w-4" />
        返回路线
      </Link>

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.8rem] border border-white/75 bg-white/70 p-6 text-ink shadow-soft backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-teal">阶段路线</p>
                <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-[-0.04em]">{stage.title}</h1>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[1.25rem] border border-white/80 bg-white/82 text-teal shadow-[0_10px_28px_rgba(15,23,40,0.08)]">
                <Icon className="h-6 w-6" />
              </span>
            </div>
            <p className="mt-5 leading-8 text-ink/68">{stage.description}</p>
            <p className="mt-4 text-sm font-medium leading-7 text-ink/56">
              这页更适合拿来做阶段推进表：先看抓手，再刷本阶段题，最后用“学完要达到”检查自己有没有真的吃透。
            </p>
            <a
              className="ghost-action mt-6 px-4 py-2 text-sm font-semibold"
              href={stage.sourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              {stage.sourceLabel}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-white/75 bg-white/66 p-5 shadow-soft backdrop-blur-2xl">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-ink">
              <Target className="h-4 w-4 text-coral" />
              本阶段抓手
            </div>
            <div className="flex flex-wrap gap-2">
              {stage.mustKnow.map((item) => (
                <span className="rounded-full border border-white/70 bg-[#f3f7ff] px-3 py-1.5 text-sm font-medium text-ink/68" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(255,255,255,0.62))] p-5 shadow-soft backdrop-blur-2xl">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-ink">
              <CheckCircle2 className="h-4 w-4 text-teal" />
              学完要达到
            </div>
            <p className="leading-7 text-ink/70">{stage.output}</p>
            <p className="mt-3 text-sm font-medium leading-7 text-ink/56">别只停在“看过这些题”，尽量让自己能用这个标准回头检查表达有没有站住。</p>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">阶段题单</p>
              <h2 className="mt-2 text-3xl font-black text-ink sm:text-4xl">
                本阶段先刷这 {questions.length} 道
              </h2>
              <p className="mt-2 text-sm leading-7 text-ink/58">建议先把抓手扫一遍，再集中刷这组题，最后回到左侧看“学完要达到”做一次自检。</p>
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
              <p className="mt-2 text-ink/55">内容会继续按路线推进。你也可以先回总路线页，先刷已经完整的阶段。</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
