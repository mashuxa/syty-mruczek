import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authenticated } from '@/lib/admin-auth';
import { restaurantRequest } from '@/lib/restaurant-server';
import { warsawDay } from '@/lib/http';
export const dynamic='force-dynamic';
type Lead={id:string;place:string;meal_type:string;people:number;contact:string;contact_name:string;notes:string;locale:string;status:string;created_at:string};
const mealNames:Record<string,string>={hot:'Горячее',hot_soup:'Горячее + суп',hot_soup_snack:'Горячее + суп + перекус'};
const date=(value:string)=>new Intl.DateTimeFormat('ru-RU',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Warsaw'}).format(new Date(value));
export default async function Page({searchParams}:{searchParams:Promise<{page?:string}>}){
 if(!await authenticated())redirect('/superuser/login');
 const raw=(await searchParams).page,parsed=Number(raw??1);const page=Number.isSafeInteger(parsed)&&parsed>0?Math.min(parsed,100000):1;
 let data:{leads:Lead[];total:number;visitsToday:number;visitsWeek:number};
 try{data=await restaurantRequest({action:'list_leads',page,day:warsawDay()});}catch{return <main className="admin wrap"><h1>Заявки</h1><p role="alert">Не удалось загрузить данные.</p><Link href="/superuser/">Обновить</Link></main>;}
 const pages=Math.max(1,Math.ceil(data.total/20));if(page>pages)redirect(`/superuser/?page=${pages}`);
 return <main className="admin wrap"><header className="admin-header"><div><a className="wordmark" href="/">syty kotek</a><h1>Заявки на обеды</h1></div><div className="admin-actions"><Link href={`/superuser/?page=${page}`}>Обновить</Link><form action="/api/superuser/logout" method="post"><button className="button primary">Выйти</button></form></div></header>
  <section className="admin-metrics"><div><strong>{data.total}</strong><span>заявок всего</span></div><div><strong>{data.visitsToday}</strong><span>уникальных посещений сегодня</span></div><div><strong>{data.visitsWeek}</strong><span>посещений за 7 дней*</span></div></section><p className="admin-note">* Сумма уникальных посещений по дням. Оценка по суточному хешу IP и браузера; известные роботы исключаются. Часовой пояс: Варшава.</p>
  <div className="admin-table"><table><caption>Новые заявки сверху · по 20 на страницу</caption><thead><tr><th>Когда</th><th>Место</th><th>Набор / люди</th><th>Контакт</th><th>Комментарий</th><th>Статус</th></tr></thead><tbody>{data.leads.map(lead=><tr key={lead.id}><td>{date(lead.created_at)}<small>{lead.locale.toUpperCase()}</small></td><td>{lead.place}</td><td>{mealNames[lead.meal_type]??lead.meal_type}<strong>{lead.people} чел.</strong></td><td>{lead.contact_name&&<strong>{lead.contact_name}</strong>}<span>{lead.contact}</span></td><td className="admin-notes">{lead.notes||'—'}</td><td><span className={`status-badge ${lead.status==='test'?'test':''}`}>{lead.status==='test'?'ТЕСТ':lead.status==='new'?'Новая':lead.status}</span></td></tr>)}</tbody></table>{!data.leads.length&&<p className="empty">Заявок пока нет.</p>}</div>
  <nav className="pagination" aria-label="Страницы заявок">{page>1?<Link href={`/superuser/?page=${page-1}`}>← Предыдущие 20</Link>:<span/>}<span>Страница {page} из {pages}</span>{page<pages?<Link href={`/superuser/?page=${page+1}`}>Следующие 20 →</Link>:<span/>}</nav></main>;
}
