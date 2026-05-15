import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import mongoose from 'mongoose';

type Params = { params: Promise<{ id: string }> };

// POST /api/projects/[id]/save
// Saves full project state from all studio stores.
// Used by both auto-save (debounced) and manual save (SAVE button).
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  let body: {
    metadata?: Record<string, unknown>;
    feed?: Record<string, unknown>;
    roConfig?: Record<string, unknown>;
    report?: Record<string, unknown>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { metadata, feed, roConfig, report } = body;

  const update: Record<string, unknown> = {};

  if (metadata && typeof metadata === 'object') {
    if (metadata.name !== undefined) update.name = metadata.name;
    if (metadata.client !== undefined) update.client = metadata.client;
    if (metadata.location !== undefined) update.location = metadata.location;
    if (metadata.description !== undefined)
      update.description = metadata.description;
    if (metadata.status !== undefined) update.status = metadata.status;
    if (metadata.recovery !== undefined) update.recovery = metadata.recovery;
    if (metadata.notes !== undefined) update.notes = metadata.notes;
    if (metadata.designer !== undefined) update.designer = metadata.designer;
    if (metadata.company !== undefined) update.company = metadata.company;
    if (metadata.currency !== undefined) update.currency = metadata.currency;
    if (metadata.exchangeRate !== undefined)
      update.exchangeRate = metadata.exchangeRate;
    if (metadata.unitSystem !== undefined)
      update.unitSystem = metadata.unitSystem;
    if (metadata.userUnits !== undefined) update.userUnits = metadata.userUnits;
  }

  if (feed) update.feed = feed;
  if (roConfig) update.roConfig = roConfig;
  if (report) update.report = report;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to save' }, { status: 400 });
  }

  let projectId: mongoose.Types.ObjectId;
  let userId: mongoose.Types.ObjectId;
  try {
    projectId = new mongoose.Types.ObjectId(id);
    userId = new mongoose.Types.ObjectId(session.user.id);
  } catch {
    return NextResponse.json(
      { error: 'Invalid project or user ID' },
      { status: 400 },
    );
  }

  let project: { updatedAt?: Date } | null;
  try {
    project = await Project.findOneAndUpdate(
      { _id: projectId, userId },
      { $set: update },
      { returnDocument: 'after', lean: true },
    );
  } catch (err) {
    console.error('[save] findOneAndUpdate error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({
    savedAt: project.updatedAt
      ? project.updatedAt.toISOString()
      : new Date().toISOString(),
  });
}
