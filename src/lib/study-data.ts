import type { QueryResultRow } from "pg";

import { query } from "@/lib/db";
import type { QuestionActivity, StudyComment, StudyStoreData, StudyUser } from "@/lib/study-store";

type DbUserRow = QueryResultRow & {
  id: string;
  username: string;
  created_at: string | Date;
  disabled: boolean;
};

type DbActivityRow = QueryResultRow & {
  slug: string;
  views: number;
};

type DbUserActivityRow = QueryResultRow & {
  slug: string;
  username: string;
  viewed_count: number;
  last_viewed_at: string | Date | null;
  liked: boolean;
  favorited: boolean;
  mastered: boolean;
  note: string;
};

type DbCommentRow = QueryResultRow & {
  id: string;
  slug: string;
  username: string;
  content: string;
  created_at: string | Date;
};

export function emptyQuestionActivity(): QuestionActivity {
  return {
    views: 0,
    likedBy: [],
    favoritedBy: [],
    masteredBy: [],
    viewedByUser: {},
    notesByUser: {},
    comments: []
  };
}

function toIso(value: string | Date) {
  return new Date(value).toISOString();
}

function normalizeUser(row: DbUserRow): StudyUser {
  return {
    id: row.id,
    username: row.username,
    createdAt: toIso(row.created_at),
    disabled: row.disabled
  };
}

function ensureActivity(map: Record<string, QuestionActivity>, slug: string) {
  map[slug] ??= emptyQuestionActivity();
  return map[slug];
}

export async function loadStudyData(options: { currentUserId?: string | null; includeAllUsers?: boolean } = {}) {
  const usersResult = options.includeAllUsers
    ? await query<DbUserRow>("SELECT id, username, created_at, disabled FROM users ORDER BY created_at DESC")
    : options.currentUserId
      ? await query<DbUserRow>("SELECT id, username, created_at, disabled FROM users WHERE id = $1", [options.currentUserId])
      : { rows: [] };
  const [activityResult, userActivityResult, commentResult] = await Promise.all([
    query<DbActivityRow>("SELECT slug, views FROM question_activity"),
    query<DbUserActivityRow>(
      `SELECT a.slug, u.username, a.viewed_count, a.last_viewed_at, a.liked, a.favorited, a.mastered, a.note
       FROM question_user_activity a
       JOIN users u ON u.id = a.user_id
       WHERE u.disabled = false`
    ),
    query<DbCommentRow>(
      `SELECT c.id, c.slug, u.username, c.content, c.created_at
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE u.disabled = false
       ORDER BY c.created_at DESC`
    )
  ]);
  const questions: Record<string, QuestionActivity> = {};

  activityResult.rows.forEach((row) => {
    ensureActivity(questions, row.slug).views = Number(row.views) || 0;
  });

  userActivityResult.rows.forEach((row) => {
    const activity = ensureActivity(questions, row.slug);
    const username = row.username;

    if (row.liked) {
      activity.likedBy.push(username);
    }

    if (row.favorited) {
      activity.favoritedBy.push(username);
    }

    if (row.mastered) {
      activity.masteredBy.push(username);
    }

    if (row.viewed_count > 0 && row.last_viewed_at) {
      activity.viewedByUser[username] = {
        count: row.viewed_count,
        lastViewedAt: toIso(row.last_viewed_at)
      };
    }

    if (row.note.trim()) {
      activity.notesByUser[username] = row.note;
    }
  });

  commentResult.rows.forEach((row) => {
    const comment: StudyComment = {
      id: row.id,
      user: row.username,
      content: row.content,
      createdAt: toIso(row.created_at)
    };

    ensureActivity(questions, row.slug).comments.push(comment);
  });

  const users = usersResult.rows.map(normalizeUser);
  const currentUser = options.currentUserId ? users.find((user) => user.id === options.currentUserId)?.username ?? null : null;

  return {
    users,
    currentUser,
    questions
  } satisfies StudyStoreData;
}
