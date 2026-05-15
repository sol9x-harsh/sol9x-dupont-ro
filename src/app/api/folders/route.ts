import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Folder from '@/lib/models/Folder';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const folders = await Folder.find({ userId: session.user.id }).sort({ name: 1 }).lean();

  return NextResponse.json({
    folders: folders.map((f) => ({
      id: f._id.toString(),
      name: f.name,
      description: f.description,
      color: f.color,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { name, description, color } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
  }

  try {
    const folder = await Folder.create({
      userId: session.user.id,
      name: name.trim(),
      description,
      color,
    });
    return NextResponse.json(folder, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Folder already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
