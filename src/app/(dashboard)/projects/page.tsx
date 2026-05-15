import DashboardLayout from '@/components/layout/dashboard/DashboardLayout';
import { ProjectsView } from '@/features/dashboard';

export default function ProjectsPage() {
  return (
    <DashboardLayout>
      <ProjectsView />
    </DashboardLayout>
  );
}
