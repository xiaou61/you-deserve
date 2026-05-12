"use client";

import Link from "next/link";
import { ArrowUpRight, GraduationCap } from "lucide-react";

import { useStudy } from "@/components/study-provider";
import type { QuestionMeta } from "@/lib/content";
import { derivePersonalInsights } from "@/lib/personal-insights";

type HomeRoutePanelProps = {
  questions: QuestionMeta[];
};

export function HomeRoutePanel({ questions }: HomeRoutePanelProps) {
  const { currentUser, data, ready } = useStudy();
  const personal = ready ? derivePersonalInsights(questions, data, currentUser) : null;
  const topRoute = personal?.routeProgress[0] ?? null;
  const routeQuestions = topRoute ? questions.filter((question) => question.route === topRoute.route) : [];
  const candidates = topRoute
    ? routeQuestions.filter((question) => {
        const activity = data.questions[question.slug];

        if (!currentUser || !activity) {
          return true;
        }

        return !activity.masteredBy?.includes(currentUser);
      })
    : questions.slice(0, 3);
  const featured = (candidates.length > 0 ? candidates : routeQuestions.length > 0 ? routeQuestions : questions).slice(0, 3);
  const heading = topRoute ? `先把「${topRoute.route}」这条线推下去` : "先拿下面试高频题";
  const caption = topRoute
    ? `你在这条路线已经掌握 ${topRoute.mastered} / ${topRoute.total} 题，今天顺着刷最省脑力。`
    : "先从高频题起手，让轨迹快点长出来。";

  return (
    <div className="rounded-[1.6rem] border border-white/70 bg-white/68 p-6 text-ink shadow-soft backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-teal">{topRoute ? "你的今日路线" : "今日路线"}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink">{heading}</h2>
          <p className="mt-3 text-sm leading-7 text-ink/58">{caption}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-[1.2rem] border border-white/80 bg-white/75 text-teal shadow-[0_10px_28px_rgba(15,23,40,0.08)]">
          <GraduationCap className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-8 grid gap-3">
        {featured.map((question, index) => (
          <Link
            className="group flex items-center justify-between rounded-[1.15rem] border border-white/75 bg-white/72 px-4 py-3 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/90"
            href={`/questions/${question.slug}`}
            key={question.slug}
          >
            <div>
              <p className="text-xs font-semibold text-ink/42">0{index + 1}</p>
              <p className="mt-1 font-semibold leading-snug text-ink">{question.title}</p>
              <p className="mt-1 text-xs font-medium text-ink/42">{question.route}</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/80 bg-white/80 text-teal transition group-hover:bg-[#0a84ff] group-hover:text-white">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
