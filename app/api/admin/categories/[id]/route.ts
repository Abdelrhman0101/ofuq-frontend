import { NextResponse } from 'next/server';

// Share the same in-memory DB by attaching to globalThis
interface Category {
  id: number;
  title: string;
  description: string;
  price: number;
  instructor_id: number;
  cover_image?: string;
  video_url?: string | null;
  is_free: boolean;
  status: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
  duration?: number;
  courses_count?: number;
  rating?: number | string;
  students_count?: number;
}

type DB = { categories: Category[]; nextId: number };
const getDB = (): DB => {
  const g = globalThis as any;
  if (!g.__mockCategoriesDB) {
    g.__mockCategoriesDB = { categories: [], nextId: 2001 } as DB;
  }
  return g.__mockCategoriesDB as DB;
};

const nowISO = () => new Date().toISOString();

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params;
  const db = getDB();
  const category = db.categories.find((c) => c.id === Number(id));
  if (!category) {
    return NextResponse.json({ success: false, message: 'الدبلوم غير موجود' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: category });
}

async function updateFromForm(category: Category, form: FormData): Promise<Category> {
  const title = form.get('title');
  const description = form.get('description');
  const price = form.get('price');
  const instructor_id = form.get('instructor_id');
  const isFreeRaw = form.get('is_free') ?? form.get('isFree');
  const status = form.get('status');
  const file = form.get('cover_image');

  if (title) category.title = String(title);
  if (description) category.description = String(description);
  if (price) category.price = Number(price);
  if (instructor_id) category.instructor_id = Number(instructor_id);
  if (isFreeRaw !== null) {
    category.is_free = String(isFreeRaw) === '1' || String(isFreeRaw).toLowerCase() === 'true';
  }
  if (status) category.status = String(status) as Category['status'];
  if (file instanceof File) {
    category.cover_image = `/public/${file.name}`;
  }
  category.updated_at = nowISO();
  return category;
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params;
  const db = getDB();
  const category = db.categories.find((c) => c.id === Number(id));
  if (!category) {
    return NextResponse.json({ message: 'الدبلوم غير موجود' }, { status: 404 });
  }

  const form = await req.formData();
  const updated = await updateFromForm(category, form);
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
  const idx = db.categories.findIndex((c) => c.id === Number(id));
  if (idx === -1) {
    return NextResponse.json({ message: 'الدبلوم غير موجود' }, { status: 404 });
  }
  db.categories.splice(idx, 1);
  return NextResponse.json({ message: 'تم حذف الدبلوم' });
}