import { NextResponse } from "next/server";

// Shared in-memory mock DB using globalThis
interface Course {
  id: number;
  title: string;
  description?: string;
  price?: number;
  status?: "draft" | "published" | "archived";
}

interface Chapter {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

interface Lesson {
  id: number;
  chapter_id: number;
  title: string;
  description?: string;
  content?: string;
  order?: number;
  is_visible?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface DB {
  courses: Course[];
  nextId: number;
  chapters: Chapter[];
  nextChapterId: number;
  lessons: Lesson[];
  nextLessonId: number;
}

function getDB(): DB {
  const g = globalThis as any;
  if (!g.__mockCoursesDB) {
    g.__mockCoursesDB = {
      courses: [],
      nextId: 1001,
      chapters: [],
      nextChapterId: 2001,
      lessons: [],
      nextLessonId: 3001,
    } as DB;
  } else {
    const db = g.__mockCoursesDB;
    if (!Array.isArray(db.chapters)) db.chapters = [];
    if (typeof db.nextChapterId !== "number") db.nextChapterId = 2001;
    if (!Array.isArray(db.lessons)) db.lessons = [];
    if (typeof db.nextLessonId !== "number") db.nextLessonId = 3001;
  }
  return g.__mockCoursesDB as DB;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const chapterId = Number(params.id);
  const db = getDB();

  const lessons = db.lessons.filter((ls) => ls.chapter_id === chapterId);
  return NextResponse.json({ data: lessons });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const chapterId = Number(params.id);
  const db = getDB();

  // Ensure chapter exists (optional)
  const chapterExists = db.chapters.some((ch) => ch.id === chapterId);
  if (!chapterExists) {
    // return NextResponse.json({ message: "الوحدة غير موجود" }, { status: 404 });
  }

  const body = await req.json();
  const title = String(body?.title || "").trim();
  if (!title) {
    return NextResponse.json({ message: "العنوان مطلوب" }, { status: 422 });
  }

  const description = body?.description ? String(body.description) : undefined;
  const content = body?.content ? String(body.content) : undefined;
  const order = body?.order != null ? Number(body.order) : undefined;
  const is_visible = body?.is_visible != null ? Boolean(body.is_visible) : true;

  const now = new Date().toISOString();
  const lesson: Lesson = {
    id: db.nextLessonId++,
    chapter_id: chapterId,
    title,
    description,
    content,
    order,
    is_visible,
    created_at: now,
    updated_at: now,
  };
  db.lessons.push(lesson);

  return NextResponse.json({ data: lesson, message: "تم إنشاء الدرس بنجاح" }, { status: 201 });
}