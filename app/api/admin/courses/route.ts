import { NextResponse } from 'next/server';

// Mock Course interface aligned with backend shape
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

function seedIfEmpty() {
  const db = getDB();
  if (db.courses.length === 0) {
    db.courses = [
      {
        id: 1,
        title: 'مقدمة في البرمجة',
        description: 'تعلم أساسيات البرمجة باستخدام JavaScript.',
        price: 0,
        instructor_id: 10,
        category_id: 3,
        cover_image: '/banner.jpg',
        video_url: null,
        is_free: true,
        status: 'published',
        created_at: nowISO(),
        updated_at: nowISO(),
        duration: 30,
        chapters_count: 8,
        rating: 4.7,
        students_count: 1240,
      },
      {
        id: 2,
        title: 'Laravel من الصفر',
        description: 'دورة عملية لبناء تطبيقات ويب باستخدام Laravel.',
        price: 199,
        instructor_id: 12,
        category_id: 5,
        cover_image: '/public/14643482_5490957.jpg',
        video_url: null,
        is_free: false,
        status: 'draft',
        created_at: nowISO(),
        updated_at: nowISO(),
        duration: 45,
        chapters_count: 12,
        rating: 4.5,
        students_count: 320,
      },
    ];
    db.nextId = 1001;
  }
}

export async function GET(req: Request) {
  seedIfEmpty();
  const db = getDB();
  const { searchParams } = new URL(req.url);
  const perPage = Number(searchParams.get('per_page') ?? 1000);
  const search = (searchParams.get('search') ?? '').trim().toLowerCase();

  let data = db.courses;
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
  const category_id = Number(form.get('category_id') ?? 0);
  // is_free may come as '1'/'0' or boolean-like string
  const isFreeRaw = form.get('is_free') ?? form.get('isFree');
  const is_free = String(isFreeRaw ?? '0') === '1' || String(isFreeRaw).toLowerCase() === 'true';
  const status = (String(form.get('status') ?? 'draft') as Course['status']);

  const file = form.get('cover_image');
  // We simulate storing the file and just keep a placeholder/static path
  const cover_image = file instanceof File ? `/public/${file.name}` : '/banner.jpg';

  if (!title) {
    return NextResponse.json(
      { message: 'العنوان مطلوب', errors: { title: ['حقل العنوان مطلوب'] } },
      { status: 422 }
    );
  }

  const course: Course = {
    id: db.nextId++,
    title,
    description,
    price,
    instructor_id,
    category_id,
    cover_image,
    video_url: null,
    is_free,
    status,
    created_at: nowISO(),
    updated_at: nowISO(),
    duration: 0,
    chapters_count: 0,
    rating: 0,
    students_count: 0,
  };

  db.courses.unshift(course);

  return NextResponse.json(
    { data: course, message: 'تم إنشاء المقرر بنجاح' },
    { status: 201 }
  );
}