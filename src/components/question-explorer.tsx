"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { QuestionCard } from "@/components/question-card";
import type { QuestionMeta } from "@/lib/content";

type QuestionExplorerProps = {
  questions: QuestionMeta[];
  categories: string[];
  routes: string[];
};

export function QuestionExplorer({ questions, categories, routes }: QuestionExplorerProps) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("全部");
  const [route, setRoute] = useState(routes[0] ?? "全部");

  const filteredQuestions = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return questions.filter((question) => {
      const matchKeyword =
        !normalizedKeyword ||
        [question.title, question.summary, question.category, question.scene, ...question.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);
      const matchCategory = category === "全部" || question.category === category;
      const matchRoute = route === "全部" || question.route === route;

      return matchKeyword && matchCategory && matchRoute;
    });
  }, [category, keyword, questions, route]);

  return (
    <div className="study-board rounded-[2rem] border border-ink/10 bg-white p-4 shadow-soft sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">Question Bank</p>
          <h2 className="mt-2 text-3xl font-black text-ink sm:text-4xl">先把高频题答稳</h2>
        </div>

        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/35" />
          <input
            className="h-13 w-full rounded-2xl border border-ink/10 bg-smoke px-12 text-base font-bold text-ink outline-none transition placeholder:text-ink/35 focus:border-teal focus:bg-white"
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜 HashMap、索引、TCP..."
            type="search"
            value={keyword}
          />
        </div>
      </div>

      <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="min-w-0 rounded-[1.4rem] bg-smoke p-3">
          <div className="mb-3 flex items-center gap-2 px-2 text-sm font-black text-ink/55">
            <SlidersHorizontal className="h-4 w-4" />
            筛选
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible">
            {["全部", ...categories].map((item) => (
              <button
                className={`filter-chip ${category === item ? "is-active" : ""}`}
                key={item}
                onClick={() => setCategory(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-5 border-t border-ink/8 pt-4">
            <p className="mb-3 px-2 text-sm font-black text-ink/55">路线</p>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible">
              {["全部", ...routes].map((item) => (
                <button
                  className={`filter-chip ${route === item ? "is-active" : ""}`}
                  key={item}
                  onClick={() => setRoute(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-ink/55">
              当前显示 <span className="font-black text-ink">{filteredQuestions.length}</span> 道题
            </p>
            <p className="hidden text-sm font-bold text-ink/42 sm:block">内容文件来自 content/questions</p>
          </div>

          {filteredQuestions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredQuestions.map((question) => (
                <QuestionCard key={question.slug} question={question} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-ink/18 bg-smoke px-6 py-12 text-center">
              <p className="text-xl font-black text-ink">暂时没有匹配题目</p>
              <p className="mt-2 text-ink/55">换一个关键词，或者先清空筛选。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
