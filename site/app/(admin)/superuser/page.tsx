import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authenticated } from '@/lib/admin-auth';
import { restaurantRequest } from '@/lib/restaurant-server';
import { warsawDay } from '@/lib/http';
import AdminLeads,{ type Lead } from '@/components/admin-leads';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{page?:string}>}){
 if(!await authenticated())redirect('/superuser/login');
 const raw=(await searchParams).page,parsed=Number(raw??1);const page=Number.isSafeInteger(parsed)&&parsed>0?Math.min(parsed,100000):1;
 let data:{leads:Lead[];total:number;visitsToday:number;visitsWeek:number};
 try{data=await restaurantRequest({action:'list_leads',page,day:warsawDay()});}catch{return <main className="admin wrap"><h1>Заявки</h1><p role="alert">Не удалось загрузить данные.</p><Link href="/superuser/">Обновить</Link></main>;}
 const pages=Math.max(1,Math.ceil(data.total/20));if(page>pages)redirect(`/superuser/?page=${pages}`);
 return <main className="admin wrap"><header className="admin-header"><div><a className="wordmark" href="/">syty kotek</a><h1>Заявки на обеды</h1></div><div className="admin-actions"><Link href={`/superuser/?page=${page}`}>Обновить</Link><form action="/api/superuser/logout" method="post"><button className="button primary">Выйти</button></form></div></header>
  <section className="admin-metrics"><div><strong>{data.total}</strong><span>заявок всего</span></div><div><strong>{data.visitsToday}</strong><span>уникальных посещений сегодня</span></div><div><strong>{data.visitsWeek}</strong><span>посещений за 7 дней*</span></div></section><p className="admin-note">* Сумма уникальных посещений по дням. Оценка по суточному хешу IP и браузера; известные роботы исключаются. Часовой пояс: Варшава.</p>
  <AdminLeads leads={data.leads}/>
  <nav className="pagination" aria-label="Страницы заявок">{page>1?<Link href={`/superuser/?page=${page-1}`}>← Предыдущие 20</Link>:<span/>}<span>Страница {page} из {pages}</span>{page<pages?<Link href={`/superuser/?page=${page+1}`}>Следующие 20 →</Link>:<span/>}</nav></main>;
}
