import { NextResponse } from "next/server";

// Shared in-memory mock DB using globalThis
interface Course {
   id: number;
   title: string;
   description?: string;
   price?: number;
   status?: "draft" | "published" | "archived";
   chapters_count?: number;
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
  const courseId = Number(params.id);
  const db = getDB();

  const chapters = db.chapters.filter((ch) => ch.course_id === courseId);
  return NextResponse.json({ data: chapters });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const courseId = Number(params.id);
  const db = getDB();

  // Basic validation: ensure course exists (optional)
  const courseExists = db.courses.some((c) => c.id === courseId);
  if (!courseExists) {
    // We allow creating chapter even if course not seeded, but better to warn
    // For compatibility with frontend flow, return 404 if strict.
    // return NextResponse.json({ message: "المقرر غير موجود" }, { status: 404 });
  }

  const body = await req.json();
  const title = String(body?.title || "").trim();
  if (!title) {
    return NextResponse.json({ message: "العنوان مطلوب" }, { status: 422 });
  }

  const description = body?.description ? String(body.description) : undefined;
  const order = body?.order != null ? Number(body.order) : undefined;

  const now = new Date().toISOString();
  const chapter: Chapter = {
    id: db.nextChapterId++,
    course_id: courseId,
    title,
    description,
    order,
    created_at: now,
    updated_at: now,
  };
  db.chapters.push(chapter);

// تحديث عدد الوحدات داخل سجل المقرر ليظهر في جدول المقررات
const courseIdx = db.courses.findIndex((c) => c.id === courseId);
if (courseIdx !== -1) {
  const current = db.courses[courseIdx];
  const currentCount = Number(current.chapters_count ?? 0);
  db.courses[courseIdx] = { ...current, chapters_count: currentCount + 1 };
}

return NextResponse.json({ data: chapter, message: "تم إنشاء الوحدة بنجاح" }, { status: 201 });
}