import { redirect } from 'next/navigation';
import AdminLogin from '@/components/admin-login';
import { authenticated } from '@/lib/admin-auth';
export const dynamic='force-dynamic';
export default async function Page(){if(await authenticated())redirect('/superuser/');return <AdminLogin/>;}
