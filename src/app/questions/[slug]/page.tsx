import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Clock3, Layers3, Sparkles } from "lucide-react";

import { QuestionCard } from "@/components/question-card";
import { getQuestionBySlug, getQuestionMetas, getRelatedQuestions } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";

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

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8 lg:pt-10">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Link
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-black text-ink transition hover:border-ink hover:bg-ink hover:text-white"
          href="/"
        >
          <ArrowLeft className="h-4 w-4" />
          返回题库
        </Link>

        <div className="rounded-[1.6rem] border border-ink/10 bg-white p-6 shadow-soft">
          <p className="text-sm font-black text-coral">{question.scene}</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-ink">{question.title}</h1>
          <p className="mt-4 leading-7 text-ink/65">{question.summary}</p>

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
              <span className="rounded-full bg-smoke px-3 py-1.5 text-xs font-black text-ink/62" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        <article className="article-shell rounded-[2rem] border border-ink/10 bg-white px-5 py-7 shadow-soft sm:px-8 lg:px-12 lg:py-10">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-mint/70 px-3 py-1.5 text-sm font-black text-ink">
            <Sparkles className="h-4 w-4 text-teal" />
            通俗解释优先
          </div>
          <div className="question-body" dangerouslySetInnerHTML={{ __html: html }} />
        </article>

        {related.length > 0 ? (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black text-ink">顺手再补几道</h2>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-ink/55">
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
