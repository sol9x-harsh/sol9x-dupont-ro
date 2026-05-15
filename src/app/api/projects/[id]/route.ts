import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Project from '@/lib/models/Project';

type Params = { params: Promise<{ id: string }> };

// GET /api/projects/[id] — load full project state
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const project = await Project.findOne({ _id: id, userId: session.user.id }).lean();
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: project._id.toString(),
    projectNo: project.projectNo,
    folder: project.folder,
    hot: project.hot,
    metadata: {
      id: project._id.toString(),
      name: project.name,
      client: project.client,
      location: project.location,
      description: project.description,
      status: project.status,
      recovery: project.recovery,
      notes: project.notes,
      designer: project.designer || '',
      company: project.company || '',
      currency: project.currency || 'USD ($)',
      exchangeRate: project.exchangeRate || 1,
      unitSystem: project.unitSystem || 'METRIC',
      userUnits: project.userUnits || {},
      createdAt: (project.createdAt as Date).toISOString(),
      updatedAt: (project.updatedAt as Date).toISOString(),
    },
    feed: project.feed,
    roConfig: project.roConfig,
    report: project.report,
  });
}

// PUT /api/projects/[id] — save full project state
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const body = await req.json();
  const { metadata, feed, roConfig, report } = body;

  const update: Record<string, unknown> = {};

  if (metadata) {
    if (metadata.name) update.name = metadata.name;
    if (metadata.client !== undefined) update.client = metadata.client;
    if (metadata.location !== undefined) update.location = metadata.location;
    if (metadata.description !== undefined) update.description = metadata.description;
    if (metadata.status) update.status = metadata.status;
    if (metadata.recovery !== undefined) update.recovery = metadata.recovery;
    if (metadata.notes !== undefined) update.notes = metadata.notes;
    
    // New Profile Fields
    if (metadata.designer !== undefined) update.designer = metadata.designer;
    if (metadata.company !== undefined) update.company = metadata.company;
    if (metadata.currency !== undefined) update.currency = metadata.currency;
    if (metadata.exchangeRate !== undefined) update.exchangeRate = metadata.exchangeRate;
    if (metadata.unitSystem !== undefined) update.unitSystem = metadata.unitSystem;
    if (metadata.userUnits !== undefined) update.userUnits = metadata.userUnits;
  }

  if (feed) update.feed = feed;
  if (roConfig) update.roConfig = roConfig;
  if (report) update.report = report;

  const project = await Project.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { $set: update },
    { returnDocument: 'after', lean: true },
  );

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    savedAt: (project.updatedAt as Date).toISOString(),
  });
}

// DELETE /api/projects/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const result = await Project.deleteOne({ _id: id, userId: session.user.id });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
