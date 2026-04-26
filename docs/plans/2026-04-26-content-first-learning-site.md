# Content First Learning Site Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the first usable version of a responsive interview-prep learning site backed by local Markdown content.

**Architecture:** Use Next.js App Router as a full-stack-ready shell. Public question content lives in local Markdown files and is indexed at build/runtime through server utilities. User-specific features are visually prepared but not persisted until a later database phase.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, lucide-react, gray-matter, unified/remark/rehype.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next-env.d.ts`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `.gitignore`

**Steps:**
1. Add Next.js scripts and dependencies.
2. Add TypeScript and framework config.
3. Run `npm install`.
4. Verify dependency installation with `npm run lint` after app files exist.

### Task 2: Content System

**Files:**
- Create: `src/lib/content.ts`
- Create: `src/lib/markdown.ts`
- Create: `content/questions/**/*.md`

**Steps:**
1. Define question metadata types.
2. Read Markdown files recursively from `content/questions`.
3. Parse frontmatter and expose sorted question indexes.
4. Render trusted local Markdown to HTML.
5. Add initial Java/backend sample content.

### Task 3: Application UI

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/questions/[slug]/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/components/*.tsx`

**Steps:**
1. Build mobile-first app shell.
2. Build homepage with search/filter and question cards.
3. Build question detail page with readable article layout.
4. Add related question links.
5. Add polished responsive styling.

### Task 4: Verification

**Files:**
- Modify as needed.

**Steps:**
1. Run `npm run lint`.
2. Run `npm run build`.
3. Start local dev server.
4. Inspect responsive pages in browser.
5. Fix any layout, build, or lint issues.
