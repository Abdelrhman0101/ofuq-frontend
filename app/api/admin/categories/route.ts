import { NextResponse } from 'next/server';

// Mock Category interface aligned with backend shape
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

function seedIfEmpty() {
  const db = getDB();
  if (db.categories.length === 0) {
    db.categories = [
      {
        id: 1,
        title: 'دبلوم التصميم الجرافيكي',
        description: 'دبلوم شامل في التصميم الجرافيكي باستخدام أحدث البرامج والتقنيات.',
        price: 899,
        instructor_id: 15,
        cover_image: '/diploma-design.jpg',
        video_url: null,
        is_free: false,
        status: 'published',
        created_at: nowISO(),
        updated_at: nowISO(),
        duration: 120,
        courses_count: 15,
        rating: 4.8,
        students_count: 450,
      },
      {
        id: 2,
        title: 'دبلوم تطوير الويب',
        description: 'دبلوم متكامل لتعلم تطوير المواقع من الصفر حتى الاحتراف.',
        price: 1299,
        instructor_id: 18,
        cover_image: '/diploma-web.jpg',
        video_url: null,
        is_free: false,
        status: 'published',
        created_at: nowISO(),
        updated_at: nowISO(),
        duration: 180,
        courses_count: 22,
        rating: 4.9,
        students_count: 680,
      },
      {
        id: 3,
        title: 'دبلوم التسويق الرقمي',
        description: 'دبلوم شامل في التسويق الرقمي ووسائل التواصل الاجتماعي.',
        price: 699,
        instructor_id: 20,
        cover_image: '/diploma-marketing.jpg',
        video_url: null,
        is_free: false,
        status: 'draft',
        created_at: nowISO(),
        updated_at: nowISO(),
        duration: 90,
        courses_count: 12,
        rating: 4.6,
        students_count: 320,
      },
      {
        id: 4,
        title: 'دبلوم الأمن السيبراني',
        description: 'دبلوم متخصص في أمن المعلومات والحماية السيبرانية.',
        price: 1599,
        instructor_id: 22,
        cover_image: '/diploma-security.jpg',
        video_url: null,
        is_free: false,
        status: 'published',
        created_at: nowISO(),
        updated_at: nowISO(),
        duration: 150,
        courses_count: 18,
        rating: 4.7,
        students_count: 280,
      },
    ];
    db.nextId = 2001;
  }
}

export async function GET(req: Request) {
  seedIfEmpty();
  const db = getDB();
  const { searchParams } = new URL(req.url);
  const perPage = Number(searchParams.get('per_page') ?? 1000);
  const search = (searchParams.get('search') ?? '').trim().toLowerCase();

  let data = db.categories;
  if (search) {
    data = data.filter((c) => c.title.toLowerCase().includes(search));
  }

  return NextResponse.json({ data: data.slice(0, perPage) });
}

export async function POST(req: Request) {
  seedIfEmpty();
  const db = getDB();
  const form = await req.formData();

  const title = String(form.get('title') ?? '').trim();
  const description = String(form.get('description') ?? '').trim();
  const price = Number(form.get('price') ?? 0);
  const instructor_id = Number(form.get('instructor_id') ?? 0);
  // is_free may come as '1'/'0' or boolean-like string
  const isFreeRaw = form.get('is_free') ?? form.get('isFree');
  const is_free = String(isFreeRaw ?? '0') === '1' || String(isFreeRaw).toLowerCase() === 'true';
  const status = (String(form.get('status') ?? 'draft') as Category['status']);

  const file = form.get('cover_image');
  // We simulate storing the file and just keep a placeholder/static path
  const cover_image = file instanceof File ? `/public/${file.name}` : '/diploma-default.jpg';

  if (!title) {
    return NextResponse.json(
      { message: 'العنوان مطلوب', errors: { title: ['حقل العنوان مطلوب'] } },
      { status: 422 }
    );
  }

  const category: Category = {
    id: db.nextId++,
    title,
    description,
    price,
    instructor_id,
    cover_image,
    video_url: null,
    is_free,
    status,
    created_at: nowISO(),
    updated_at: nowISO(),
    duration: 0,
    courses_count: 0,
    rating: 0,
    students_count: 0,
  };

  db.categories.unshift(category);

  return NextResponse.json(
    { data: category, message: 'تم إنشاء الدبلوم بنجاح' },
    { status: 201 }
  );
}