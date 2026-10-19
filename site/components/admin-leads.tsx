'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export type Lead={id:string;place:string;meal_type:string;people:number;contact:string;contact_name:string;notes:string;locale:string;status:string;created_at:string};
const mealNames:Record<string,string>={hot:'Горячее',hot_soup:'Горячее + суп',hot_soup_snack:'Горячее + суп + перекус'};
const statusNames:Record<string,string>={new:'Новая',contacted:'Связались',qualified:'Подходит',closed:'Закрыта',test:'ТЕСТ'};
const date=(value:string)=>new Intl.DateTimeFormat('ru-RU',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Warsaw'}).format(new Date(value));
export default function AdminLeads({leads}:{leads:Lead[]}){
 const router=useRouter();
 const [mode,setMode]=useState(false);
 const [picked,setPicked]=useState<string[]>([]);
 const [status,setStatus]=useState('contacted');
 const [confirming,setConfirming]=useState(false);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const selected=picked.filter(id=>leads.some(lead=>lead.id===id));
 const allSelected=leads.length>0&&selected.length===leads.length;
 const toggle=(id:string)=>{setConfirming(false);setPicked(selected.includes(id)?selected.filter(x=>x!==id):[...selected,id]);};
 const toggleAll=()=>{setConfirming(false);setPicked(allSelected?[]:leads.map(lead=>lead.id));};
 const toggleMode=()=>{setMode(!mode);setPicked([]);setConfirming(false);setMessage('');};
 async function run(body:{action:'delete'}|{action:'status';status:string}){
  setBusy(true);setMessage('');
  try{
   const response=await fetch('/superuser/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,ids:selected})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(String(data.error??'failed'));
   setPicked([]);setConfirming(false);
   setMessage(body.action==='delete'?`Удалено: ${data.count??selected.length}`:`Статус изменён: ${data.count??selected.length}`);
   router.refresh();
  }catch{setMessage('Не удалось выполнить действие. Обнови страницу и попробуй ещё раз.');}
  finally{setBusy(false);}
 }
 return <>
  <div className="admin-toolbar" role="group" aria-label="Выбор заявок">
   <button type="button" className="admin-btn" disabled={busy||!leads.length} onClick={toggleMode}>{mode?'Отмена':'Выбрать'}</button>
   {mode&&selected.length>0&&<>
    <span className="admin-count">Выбрано: <strong>{selected.length}</strong></span>
    <select className="admin-select" aria-label="Новый статус" value={status} disabled={busy} onChange={event=>setStatus(event.target.value)}>{Object.entries(statusNames).map(([value,name])=><option key={value} value={value}>{name}</option>)}</select>
    <button type="button" className="admin-btn" disabled={busy} onClick={()=>run({action:'status',status})}>Сменить статус</button>
    {confirming
     ?<><button type="button" className="admin-btn danger" disabled={busy} onClick={()=>run({action:'delete'})}>Да, удалить {selected.length}</button><button type="button" className="admin-btn" disabled={busy} onClick={()=>setConfirming(false)}>Нет</button></>
     :<button type="button" className="admin-btn danger" disabled={busy} onClick={()=>setConfirming(true)}>Удалить</button>}
   </>}
   <span className="admin-message" role="status" aria-live="polite">{message}</span>
  </div>
  <div className="admin-table"><table><caption>Новые заявки сверху · по 20 на страницу</caption><thead><tr>{mode&&<th className="admin-check"><input type="checkbox" aria-label="Выбрать все на странице" checked={allSelected} disabled={busy} onChange={toggleAll}/></th>}<th>Когда</th><th>Место</th><th>Набор / люди</th><th>Контакт</th><th>Комментарий</th><th>Статус</th></tr></thead>
   <tbody>{leads.map(lead=><tr key={lead.id} className={selected.includes(lead.id)?'selected':undefined}>{mode&&<td className="admin-check"><input type="checkbox" aria-label={`Выбрать заявку: ${lead.place}`} checked={selected.includes(lead.id)} disabled={busy} onChange={()=>toggle(lead.id)}/></td>}<td>{date(lead.created_at)}<small>{lead.locale.toUpperCase()}</small></td><td>{lead.place}</td><td>{mealNames[lead.meal_type]??lead.meal_type}<strong>{lead.people} чел.</strong></td><td>{lead.contact_name&&<strong>{lead.contact_name}</strong>}<span>{lead.contact}</span></td><td className="admin-notes">{lead.notes||'—'}</td><td><span className={`status-badge ${lead.status==='test'?'test':''}`}>{statusNames[lead.status]??lead.status}</span></td></tr>)}</tbody></table>{!leads.length&&<p className="empty">Заявок пока нет.</p>}</div>
 </>;
}
