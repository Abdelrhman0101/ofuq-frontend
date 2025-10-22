import { NextResponse } from "next/server";

// Shared in-memory mock DB using globalThis
interface Category {
  id: number;
  title: string;
  description?: string;
  price?: number;
  status?: "draft" | "published" | "archived";
  courses_count?: number;
}

interface Course {
  id: number;
  category_id: number;
  title: string;
  description?: string;
  price?: number;
  instructor_id?: number;
  cover_image?: string;
  video_url?: string | null;
  is_free?: boolean;
  status?: "draft" | "published" | "archived";
  duration?: number;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

interface DB {
  categories: Category[];
  nextId: number;
  categoryCourses: Course[];
  nextCourseId: number;
}

function getDB(): DB {
  const g = globalThis as any;
  if (!g.__mockCategoriesDB) {
    g.__mockCategoriesDB = {
      categories: [],
      nextId: 2001,
      categoryCourses: [],
      nextCourseId: 3001,
    } as DB;
  } else {
    const db = g.__mockCategoriesDB;
    if (!Array.isArray(db.categoryCourses)) db.categoryCourses = [];
    if (typeof db.nextCourseId !== "number") db.nextCourseId = 3001;
  }
  return g.__mockCategoriesDB as DB;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const categoryId = Number(params.id);
  const db = getDB();

  const courses = db.categoryCourses.filter((course) => course.category_id === categoryId);
  return NextResponse.json({ data: courses });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const categoryId = Number(params.id);
  const db = getDB();

  // Basic validation: ensure category exists (optional)
  const categoryExists = db.categories.some((c) => c.id === categoryId);
  if (!categoryExists) {
    // We allow creating course even if category not seeded, but better to warn
    // For compatibility with frontend flow, return 404 if strict.
    // return NextResponse.json({ message: "الدبلوم غير موجود" }, { status: 404 });
  }

  const body = await req.json();
  const title = String(body?.title || "").trim();
  if (!title) {
    return NextResponse.json({ message: "العنوان مطلوب" }, { status: 422 });
  }

  const description = body?.description ? String(body.description) : undefined;
  const price = body?.price != null ? Number(body.price) : 0;
  const instructor_id = body?.instructor_id != null ? Number(body.instructor_id) : undefined;
  const cover_image = body?.cover_image ? String(body.cover_image) : '/course-default.jpg';
  const video_url = body?.video_url ? String(body.video_url) : null;
  const is_free = body?.is_free != null ? Boolean(body.is_free) : false;
  const status = body?.status ? String(body.status) as Course['status'] : 'draft';
  const duration = body?.duration != null ? Number(body.duration) : 0;
  const order = body?.order != null ? Number(body.order) : undefined;

  const now = new Date().toISOString();
  const course: Course = {
    id: db.nextCourseId++,
    category_id: categoryId,
    title,
    description,
    price,
    instructor_id,
    cover_image,
    video_url,
    is_free,
    status,
    duration,
    order,
    created_at: now,
    updated_at: now,
  };
  db.categoryCourses.push(course);

  // تحديث عدد المقررات داخل سجل الدبلوم ليظهر في جدول الدبلومات
  const categoryIdx = db.categories.findIndex((c) => c.id === categoryId);
  if (categoryIdx !== -1) {
    const current = db.categories[categoryIdx];
    const currentCount = Number(current.courses_count ?? 0);
    db.categories[categoryIdx] = { ...current, courses_count: currentCount + 1 };
  }

  return NextResponse.json({ data: course, message: "تم إنشاء المقرر بنجاح" }, { status: 201 });
}