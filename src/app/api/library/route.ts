import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import WaterLibrary from '@/lib/models/WaterLibrary';

// GET /api/library — list global entries + user's own saved entries
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const entries = await WaterLibrary.find({
    $or: [{ isGlobal: true }, { userId: session.user.id }],
  })
    .sort({ isGlobal: -1, createdAt: -1 })
    .lean();

  return NextResponse.json(
    entries.map((e) => ({
      id:          e._id.toString(),
      name:        e.name,
      description: e.description,
      preset:      e.preset,
      chemistry:   e.chemistry,
      isGlobal:    e.isGlobal,
      tags:        e.tags,
    })),
  );
}

// POST /api/library — save current feed composition as a library entry
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    name?: string;
    description?: string;
    preset?: string;
    chemistry?: Record<string, unknown>;
    tags?: string[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, description = '', preset = 'custom', chemistry, tags = [] } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  if (!chemistry || typeof chemistry !== 'object') {
    return NextResponse.json({ error: 'chemistry is required' }, { status: 400 });
  }

  await connectDB();

  const entry = await WaterLibrary.create({
    name:        name.trim(),
    description,
    preset,
    chemistry,
    tags,
    isGlobal:    false,
    userId:      session.user.id,
  });

  return NextResponse.json({
    id:      entry._id.toString(),
    name:    entry.name,
    savedAt: entry.createdAt.toISOString(),
  });
}
