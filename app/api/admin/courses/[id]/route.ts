import { NextResponse } from 'next/server';

// Share the same in-memory DB by importing from parent file is not possible directly.
// So we redefine and rely on module scoping across route files? That won't share state.
// To keep state consistent, we will attach mock DB to globalThis.

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  instructor_id: number;
  category_id: number;
  cover_image?: string;
  video_url?: string | null;
  is_free: boolean;
  status: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
  duration?: number;
  chapters_count?: number;
  rating?: number | string;
  students_count?: number;
}

type DB = { courses: Course[]; nextId: number };
const getDB = (): DB => {
  const g = globalThis as any;
  if (!g.__mockCoursesDB) {
    g.__mockCoursesDB = { courses: [], nextId: 1001 } as DB;
  }
  return g.__mockCoursesDB as DB;
};

const nowISO = () => new Date().toISOString();

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params;
  const db = getDB();
  const course = db.courses.find((c) => c.id === Number(id));
  if (!course) {
    return NextResponse.json({ success: false, message: 'المقرر غير موجود' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: course });
}

async function updateFromForm(course: Course, form: FormData): Promise<Course> {
  const title = form.get('title');
  const description = form.get('description');
  const price = form.get('price');
  const instructor_id = form.get('instructor_id');
  const category_id = form.get('category_id');
  const isFreeRaw = form.get('is_free') ?? form.get('isFree');
  const status = form.get('status');
  const file = form.get('cover_image');

  if (title) course.title = String(title);
  if (description) course.description = String(description);
  if (price) course.price = Number(price);
  if (instructor_id) course.instructor_id = Number(instructor_id);
  if (category_id) course.category_id = Number(category_id);
  if (isFreeRaw !== null) {
    course.is_free = String(isFreeRaw) === '1' || String(isFreeRaw).toLowerCase() === 'true';
  }
  if (status) course.status = String(status) as Course['status'];
  if (file instanceof File) {
    course.cover_image = `/public/${file.name}`;
  }
  course.updated_at = nowISO();
  return course;
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params;
  const db = getDB();
  const course = db.courses.find((c) => c.id === Number(id));
  if (!course) {
    return NextResponse.json({ message: 'المقرر غير موجود' }, { status: 404 });
  }

  const form = await req.formData();
  const updated = await updateFromForm(course, form);
  return NextResponse.json({ data: updated, message: 'تم التعديل بنجاح' });
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const form = await req.formData();
  const methodOverride = String(form.get('_method') ?? '').toUpperCase();
  if (methodOverride === 'PUT') {
    return PUT(req, ctx);
  }
  return NextResponse.json({ message: 'العملية غير مدعومة' }, { status: 405 });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params;
  const db = getDB();
  const idx = db.courses.findIndex((c) => c.id === Number(id));
  if (idx === -1) {
    return NextResponse.json({ message: 'المقرر غير موجود' }, { status: 404 });
  }
  db.courses.splice(idx, 1);
  return NextResponse.json({ message: 'تم حذف المقرر' });
}