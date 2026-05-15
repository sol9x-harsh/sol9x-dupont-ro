import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import WaterLibrary from '@/lib/models/WaterLibrary';

type Params = { params: Promise<{ id: string }> };

// DELETE /api/library/[id] — delete user's own entry; global entries cannot be deleted
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const entry = await WaterLibrary.findById(id).lean();
  if (!entry) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (entry.isGlobal) {
    return NextResponse.json({ error: 'Cannot delete a global library entry' }, { status: 403 });
  }
  if (entry.userId?.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await WaterLibrary.deleteOne({ _id: id });
  return NextResponse.json({ success: true });
}
