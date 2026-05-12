import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Clock3, Layers3, Sparkles } from "lucide-react";

import { QuestionCard } from "@/components/question-card";
import { QuestionEngagement } from "@/components/question-engagement";
import { QuestionVisual } from "@/components/question-visual";
import { getQuestionBySlug, getQuestionMetas, getRelatedQuestions, getRouteQuestionNeighbors } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { getQuestionVisual } from "@/lib/visuals";

type QuestionPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getQuestionMetas().map((question) => ({
    slug: question.slug
  }));
}

export async function generateMetadata({ params }: QuestionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const question = getQuestionBySlug(slug);

  if (!question) {
    return {
      title: "题目不存在 | You Deserve"
    };
  }

  return {
    title: `${question.title} | You Deserve`,
    description: question.summary
  };
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { slug } = await params;
  const question = getQuestionBySlug(slug);

  if (!question) {
    notFound();
  }

  const html = await renderMarkdown(question.content);
  const related = getRelatedQuestions(question);
  const routeNeighbors = getRouteQuestionNeighbors(question);
  const visual = getQuestionVisual(question.slug);
  const recapScript = `这题本质上属于「${question.category}」里的高频表达题。先给结论，再解释为什么，最后顺手补一个常见追问。`;
  const memoryChecks = [
    `你能不用看稿，先把「${question.title}」的结论直接讲出来吗？`,
    `如果面试官追问“为什么”，你能顺着原理往下讲 2 层吗？`,
    `如果把它放回「${question.scene}」场景里，你知道这题为什么会被问到吗？`
  ];

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8 lg:pt-10">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Link
          className="ghost-action mb-4 px-4 py-2 text-sm font-semibold"
          href="/"
        >
          <ArrowLeft className="h-4 w-4" />
          返回题库
        </Link>

        <div className="rounded-[1.6rem] border border-white/75 bg-white/68 p-6 shadow-soft backdrop-blur-2xl">
          <p className="text-sm font-semibold text-teal">{question.scene}</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.03em] text-ink">{question.title}</h1>
          <p className="mt-4 leading-7 text-ink/65">{question.summary}</p>
          <div className="mt-5 rounded-[1.2rem] border border-white/75 bg-white/72 px-4 py-4">
            <p className="text-sm font-semibold text-ink">这题怎么用更值</p>
            <p className="mt-2 text-sm leading-7 text-ink/62">
              适合在 <span className="font-semibold text-ink">{question.scene}</span> 这个场景下补齐表达。学完至少要能在 1 分钟内讲清结论、原理和一个常见追问。
            </p>
          </div>

          <div className="mt-6 grid gap-3 text-sm font-bold text-ink/72">
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-teal" />
              {question.category}
            </div>
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-coral" />
              约 {question.readingTime} 分钟
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-strong" />
              {question.route}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <span className="rounded-full border border-white/70 bg-[#f3f7ff] px-3 py-1.5 text-xs font-semibold text-ink/62" key={tag}>
                {tag}
              </span>
            ))}
          </div>

          {routeNeighbors.previous || routeNeighbors.next ? (
            <div className="mt-6 rounded-[1.3rem] border border-white/75 bg-white/72 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">同路线跳题</p>
              <p className="mt-2 text-sm leading-6 text-ink/58">如果你正在顺着这条线复习，最省脑力的方式就是继续按前后题串着刷。</p>
              <div className="mt-3 grid gap-2">
                {routeNeighbors.previous ? (
                  <Link className="route-jump-card" href={`/questions/${routeNeighbors.previous.slug}`}>
                    <ArrowLeft className="h-4 w-4 text-teal" />
                    <div className="min-w-0">
                      <strong>上一题</strong>
                      <p>{routeNeighbors.previous.title}</p>
                    </div>
                  </Link>
                ) : null}
                {routeNeighbors.next ? (
                  <Link className="route-jump-card" href={`/questions/${routeNeighbors.next.slug}`}>
                    <ArrowRight className="h-4 w-4 text-coral" />
                    <div className="min-w-0">
                      <strong>下一题</strong>
                      <p>{routeNeighbors.next.title}</p>
                    </div>
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      <section className="min-w-0">
        <section className="mb-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.6rem] border border-white/75 bg-white/68 p-5 shadow-soft backdrop-blur-2xl sm:p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal">
              <Sparkles className="h-3.5 w-3.5" />
              30 秒复述卡
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink">先把这题讲顺，再去背细节。</h2>
            <p className="mt-4 text-base leading-8 text-ink/64">{recapScript}</p>
            <div className="mt-5 rounded-[1.2rem] border border-white/75 bg-white/82 px-4 py-4">
              <p className="text-sm font-semibold text-ink">最稳的开口顺序</p>
              <ol className="mt-3 space-y-2 text-sm leading-7 text-ink/62">
                <li>1. 先说一句话结论，不绕。</li>
                <li>2. 再补核心原理，让答案站住。</li>
                <li>3. 最后带一个常见追问，显得你不是只会背标题。</li>
              </ol>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-white/75 bg-white/68 p-5 shadow-soft backdrop-blur-2xl sm:p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal">
              <BookOpen className="h-3.5 w-3.5" />
              看完自检
            </div>
            <div className="mt-4 space-y-3">
              {memoryChecks.map((item) => (
                <div className="rounded-[1.1rem] border border-white/75 bg-white/82 px-4 py-4 text-sm leading-7 text-ink/62" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <article className="article-shell rounded-[2rem] border border-white/75 bg-white/68 px-5 py-7 shadow-soft sm:px-8 lg:px-12 lg:py-10">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/78 px-3 py-1.5 text-sm font-semibold text-ink">
            <Sparkles className="h-4 w-4 text-teal" />
            通俗解释优先
          </div>
          <p className="mb-6 max-w-3xl text-sm leading-7 text-ink/58">
            建议先看“一句话结论”抓主干，再顺着解释和追问往下读。不要一上来背全文，先把自己能不能讲明白放在前面。
          </p>
          <div className="question-body" dangerouslySetInnerHTML={{ __html: html }} />
        </article>

        <QuestionEngagement
          route={question.route}
          slug={question.slug}
          title={question.title}
          totalQuestions={getQuestionMetas().length}
        />

        {visual ? <QuestionVisual visual={visual} /> : null}

        {related.length > 0 ? (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-ink">顺手再补几道</h2>
                <p className="mt-2 text-sm leading-7 text-ink/58">如果这一题你已经听顺了，继续补相邻概念，记忆会比跳着刷更稳。</p>
              </div>
              <span className="rounded-full border border-white/75 bg-white/78 px-3 py-1 text-sm font-medium text-ink/55">
                相关题目
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <QuestionCard compact key={item.slug} question={item} />
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
