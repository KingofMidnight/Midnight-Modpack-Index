import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';

export default async function AdminPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  return <AdminDashboard />;
}
