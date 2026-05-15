import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Project from '@/lib/models/Project';

function toRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function toDashboardStatus(status: string): 'Verified' | 'Draft' {
  return status === 'active' || status === 'completed' ? 'Verified' : 'Draft';
}

// GET /api/projects — list user's projects
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const projects = await Project.find(
    { userId: session.user.id },
    { name: 1, client: 1, location: 1, status: 1, folder: 1, projectNo: 1, hot: 1, updatedAt: 1 },
  )
    .sort({ updatedAt: -1 })
    .lean();

  const result = projects.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    client: p.client ?? '',
    projectNo: p.projectNo ?? '',
    status: toDashboardStatus(p.status),
    updated: toRelativeTime(p.updatedAt as Date),
    hot: p.hot ?? false,
    folder: p.folder ?? '',
  }));

  return NextResponse.json({ projects: result });
}

// POST /api/projects — create a new project
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const body = await req.json();
  const { 
    name, client, location, description, folder, notes,
    designer, company, currency, exchangeRate, unitSystem, userUnits 
  } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
  }

  // Auto-generate project number
  const count = await Project.countDocuments({ userId: session.user.id });
  const projectNo = `PRJ-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

  const project = await Project.create({
    userId: session.user.id,
    name: name.trim(),
    client: client?.trim() ?? '',
    location: location?.trim() ?? '',
    description: description?.trim() ?? '',
    notes: notes?.trim() ?? '',
    folder: folder?.trim() ?? '',
    projectNo,
    status: 'draft',
    hot: false,
    
    // New Fields
    designer: designer?.trim() ?? '',
    company: company?.trim() ?? '',
    currency: currency ?? 'USD ($)',
    exchangeRate: Number(exchangeRate) || 1,
    unitSystem: unitSystem ?? 'METRIC',
    userUnits: userUnits ?? {},
  });

  return NextResponse.json({ id: project._id.toString(), projectNo }, { status: 201 });
}
