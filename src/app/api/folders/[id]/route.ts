import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Folder from '@/lib/models/Folder';
import Project from '@/lib/models/Project';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  const { name, description, color } = await req.json();

  const folder = await Folder.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { $set: { name, description, color } },
    { returnDocument: 'after' },
  );

  if (!folder) {
    return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
  }

  return NextResponse.json(folder);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  // Find folder first to get the name (if we want to clear references by name)
  const folder = await Folder.findOne({ _id: id, userId: session.user.id });
  if (!folder) {
    return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
  }

  // Clear folder references in projects
  await Project.updateMany(
    { userId: session.user.id, folder: folder.name },
    { $set: { folder: '' } },
  );

  await Folder.deleteOne({ _id: id });

  return NextResponse.json({ success: true });
}
