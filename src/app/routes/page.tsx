import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Compass, ExternalLink, Target } from "lucide-react";

import { QuestionCard } from "@/components/question-card";
import { getQuestionMetas } from "@/lib/content";
import { roadmapStages } from "@/lib/roadmap";

export const metadata: Metadata = {
  title: "上岸路线 | You Deserve",
  description: "按 Java 后端面试频率整理的学习路线，覆盖 Java、JVM、Spring、MySQL、Redis、MQ、计网、操作系统和工程化。"
};

export default function RoutesPage() {
  const questions = getQuestionMetas();
  const totalTopics = roadmapStages.reduce((sum, stage) => sum + stage.mustKnow.length, 0);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <section className="hero-panel overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3 py-1 text-sm font-bold text-ink">
              <Compass className="h-4 w-4 text-coral" />
              Java 后端 · 双非上岸优先级
            </div>
            <p className="mb-4 text-sm font-black uppercase tracking-[0.28em] text-teal">
              Roadmap
            </p>
            <h1 className="display-title max-w-4xl text-5xl font-black leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
              先补能涨分的，再补能拉开差距的。
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-ink/72">
              这条路线按后端面试常见追问组织：基础题保证不丢分，框架和中间件负责撑二面，工程化负责让项目经历更像真实上线。
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-ink/10 bg-white/78 p-5 shadow-soft">
            <p className="text-sm font-black text-ink/55">当前路线规模</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-smoke p-4">
                <p className="text-3xl font-black text-coral">{roadmapStages.length}</p>
                <p className="mt-1 text-sm font-bold text-ink/55">阶段</p>
              </div>
              <div className="rounded-2xl bg-smoke p-4">
                <p className="text-3xl font-black text-teal">{questions.length}</p>
                <p className="mt-1 text-sm font-bold text-ink/55">题目</p>
              </div>
              <div className="rounded-2xl bg-smoke p-4">
                <p className="text-3xl font-black text-amber-strong">{totalTopics}</p>
                <p className="mt-1 text-sm font-bold text-ink/55">抓手</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5">
        {roadmapStages.map((stage, index) => {
          const stageQuestions = questions
            .filter((question) => stage.categories.includes(question.category))
            .slice(0, 4);
          const Icon = stage.icon;

          return (
            <article
              className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6 lg:grid lg:grid-cols-[280px_1fr] lg:gap-6"
              id={stage.id}
              key={stage.id}
            >
              <aside className="rounded-[1.4rem] bg-ink p-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-mint">阶段 {index + 1}</p>
                    <h2 className="mt-3 text-2xl font-black leading-tight">{stage.title}</h2>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-amber">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-4 text-sm font-bold leading-7 text-white/65">{stage.subtitle}</p>
                <a
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-black text-white transition hover:bg-white hover:text-ink"
                  href={stage.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {stage.sourceLabel}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </aside>

              <div className="mt-5 min-w-0 lg:mt-0">
                <p className="leading-8 text-ink/68">{stage.description}</p>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
                  <div className="rounded-[1.3rem] bg-smoke p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-black text-ink">
                      <Target className="h-4 w-4 text-coral" />
                      必须拿下
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {stage.mustKnow.map((item) => (
                        <span className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-ink/68" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.3rem] bg-mint/65 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-black text-ink">
                      <CheckCircle2 className="h-4 w-4 text-teal" />
                      阶段产出
                    </div>
                    <p className="leading-7 text-ink/70">{stage.output}</p>
                  </div>
                </div>

                {stageQuestions.length > 0 ? (
                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-black text-ink/55">对应题目</p>
                      <Link
                        className="inline-flex items-center gap-1 text-sm font-black text-coral"
                        href={`/routes/${stage.id}`}
                      >
                        刷本阶段
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {stageQuestions.map((question) => (
                        <QuestionCard compact key={question.slug} question={question} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
