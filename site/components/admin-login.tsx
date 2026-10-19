'use client';
import { useState,type FormEvent } from 'react';
export default function AdminLogin(){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(busy)return;setBusy(true);setError('');const password=new FormData(event.currentTarget).get('password');try{const r=await fetch('/api/superuser/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});if(r.ok){location.assign('/superuser/');return;}setError(r.status===429?'Слишком много попыток. Попробуйте через 15 минут.':r.status===401?'Неверный пароль.':'Вход временно недоступен. Попробуйте позже.');}catch{setError('Не удалось соединиться с сервером.');}setBusy(false);}
 return <main className="admin-login"><a className="wordmark" href="/">syty kotek<span>ЗАЯВКИ НА ОБЕДЫ</span></a><h1>Вход для владельца</h1><form onSubmit={submit}><div className="field"><label htmlFor="password">Пароль</label><input id="password" name="password" type="password" required maxLength={256} autoComplete="current-password" disabled={busy}/></div>{error&&<p className="error" role="alert">{error}</p>}<button className="button primary submit" disabled={busy}>{busy?'Проверяем…':'Войти'}</button></form></main>;
}
