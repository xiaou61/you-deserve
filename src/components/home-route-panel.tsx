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
    <div className="rounded-[1.6rem] border border-ink/10 bg-ink p-6 text-white shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-mint">{topRoute ? "你的今日路线" : "今日路线"}</p>
          <h2 className="mt-3 text-3xl font-black">{heading}</h2>
          <p className="mt-3 text-sm leading-7 text-white/68">{caption}</p>
        </div>
        <GraduationCap className="h-9 w-9 text-amber" />
      </div>
      <div className="mt-8 grid gap-3">
        {featured.map((question, index) => (
          <Link
            className="group flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3 transition hover:bg-white/14"
            href={`/questions/${question.slug}`}
            key={question.slug}
          >
            <div>
              <p className="text-xs font-black text-white/45">0{index + 1}</p>
              <p className="mt-1 font-bold leading-snug">{question.title}</p>
              <p className="mt-1 text-xs font-bold text-white/45">{question.route}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-white/45 transition group-hover:text-amber" />
          </Link>
        ))}
      </div>
    </div>
  );
}
