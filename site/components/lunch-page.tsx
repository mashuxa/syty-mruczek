'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Locale, MealType } from '@/lib/lead-schema';
import { localePaths, seoContent } from '@/lib/site-content';
import VisitTracker from '@/components/visit-tracker';
import FoodGallery from '@/components/food-gallery';

const copy = {
  pl: {
    area: 'Pruszków + do 5 km', nav: 'Zapytaj o obiady', badge: 'DOMOWE OBIADY DLA TWOJEJ EKIPY',
    title: 'Dobry obiad.\nSpokojna przerwa.', intro: 'W pracy, na budowie czy w biurze — zbierz ekipę, a my ustalimy domowe obiady z dostawą w jedno miejsce.',
    cta: 'Nakarm swoją ekipę', small: 'Bez płatności online. Najpierw ustalamy szczegóły.',
    step: ['Wybierz zestaw', 'Podaj miejsce i liczbę osób', 'Ustalmy dostawę'],
    stepText: ['Samo danie główne, zupa lub coś na później.', 'Jeden adres, wspólna przerwa na obiad.', 'Menu, cenę i termin potwierdzimy indywidualnie.'],
    eyebrow: 'ZACZNIJMY OD DOBREGO OBIADU', formTitle: 'Co podać Twojej ekipie?', formIntro: 'Zostaw zapytanie. Dostępność, menu i cenę ustalimy przed zamówieniem.',
    meals: ['Danie główne', 'Danie główne + zupa', 'Danie główne + zupa + przekąska'],
    descriptions: ['Konkretny obiad na przerwę.', 'Pełny, domowy zestaw.', 'Obiad i coś na później.'],
    mealLabel: 'Wybierz zestaw', place: 'Gdzie dostarczyć?', placeHint: 'Miejscowość, ulica i nazwa firmy lub budowy', areaHint: 'Pruszków i okolice do 5 km od miasta. Możliwość dojazdu potwierdzimy dla podanego adresu.',
    people: 'Dla ilu osób?', contact: 'Telefon lub e-mail', name: 'Jak się do Ciebie zwracać?', optional: 'opcjonalnie', notes: 'Co jeszcze warto wiedzieć?', notesHint: 'Np. preferowana godzina, dni dostaw lub pytanie o menu. Nie wpisuj danych medycznych.',
    consent: 'Zgadzam się na kontakt w sprawie tego zapytania.', privacy: 'Podane dane służą obsłudze zapytania. Nie zapisujemy Cię do newslettera.',
    submit: 'Wyślij zapytanie', sending: 'Zapisujemy…', error: 'Nie udało się zapisać zapytania. Spróbuj ponownie za chwilę.', limit: 'Zbyt wiele zapytań. Spróbuj ponownie później.',
    success: 'Zapytanie zapisane!', successText: 'Dziękujemy! Twoje zapytanie trafiło na naszą listę. To jeszcze nie jest potwierdzone zamówienie.', again: 'Wyślij kolejne zapytanie',
    footer: 'Domowo. Lokalnie. Do syta.', footnote: 'Zapytanie nie zobowiązuje do zakupu. Dostawę, skład i alergeny potwierdzamy przed zamówieniem.',
  },
  ru: {
    area: 'Прушкув + до 5 км', nav: 'Запросить обеды', badge: 'ДОМАШНИЕ ОБЕДЫ ДЛЯ ВАШЕЙ КОМАНДЫ',
    title: 'Вкусный обед.\nСпокойный перерыв.', intro: 'На работе, стройке или в офисе — соберите команду, а мы договоримся о домашних обедах с доставкой в одно место.',
    cta: 'Накормить команду', small: 'Без оплаты онлайн. Сначала согласуем детали.',
    step: ['Выберите набор', 'Укажите место и количество людей', 'Договоримся о доставке'],
    stepText: ['Горячее, суп или что-нибудь на потом.', 'Один адрес и общий обеденный перерыв.', 'Меню, цену и дату подтвердим индивидуально.'],
    eyebrow: 'НАЧНЁМ С ХОРОШЕГО ОБЕДА', formTitle: 'Что приготовить вашей команде?', formIntro: 'Оставьте запрос. Возможность доставки, меню и цену согласуем до заказа.',
    meals: ['Горячее', 'Горячее + суп', 'Горячее + суп + перекус'], descriptions: ['Сытный обед на перерыв.', 'Полный домашний набор.', 'Обед и что-нибудь на потом.'],
    mealLabel: 'Выберите набор', place: 'Куда доставить?', placeHint: 'Город, улица и название компании или стройки', areaHint: 'Прушкув и до 5 км от города. Возможность доставки подтвердим для вашего адреса.',
    people: 'На сколько человек?', contact: 'Телефон или e-mail', name: 'Как к вам обращаться?', optional: 'необязательно', notes: 'Что ещё нам стоит знать?', notesHint: 'Например, желаемое время, дни доставки или вопрос о меню. Не указывайте медицинские данные.',
    consent: 'Согласен на связь по этому запросу.', privacy: 'Данные нужны для обработки запроса. Подписки на рассылку нет.',
    submit: 'Отправить запрос', sending: 'Сохраняем…', error: 'Не удалось сохранить запрос. Попробуйте ещё раз чуть позже.', limit: 'Слишком много запросов. Попробуйте позже.',
    success: 'Запрос сохранён!', successText: 'Спасибо! Ваш запрос добавлен в наш список. Это ещё не подтверждённый заказ.', again: 'Отправить ещё один запрос', footer: 'По-домашнему. Рядом. Досыта.', footnote: 'Запрос не обязывает к покупке. Доставку, состав и аллергены подтвердим до заказа.',
  },
  uk: {
    area: 'Прушкув + до 5 км', nav: 'Запитати про обіди', badge: 'ДОМАШНІ ОБІДИ ДЛЯ ВАШОЇ КОМАНДИ',
    title: 'Смачний обід.\nСпокійна перерва.', intro: 'На роботі, будівництві чи в офісі — зберіть команду, а ми домовимося про домашні обіди з доставкою в одне місце.',
    cta: 'Нагодувати команду', small: 'Без оплати онлайн. Спочатку узгодимо деталі.',
    step: ['Оберіть набір', 'Вкажіть місце та кількість людей', 'Домовимося про доставку'],
    stepText: ['Основна страва, суп або щось на потім.', 'Одна адреса та спільна обідня перерва.', 'Меню, ціну та дату підтвердимо індивідуально.'],
    eyebrow: 'ПОЧНІМО З ХОРОШОГО ОБІДУ', formTitle: 'Що приготувати вашій команді?', formIntro: 'Залиште запит. Доставку, меню та ціну узгодимо до замовлення.',
    meals: ['Основна страва', 'Основна страва + суп', 'Основна страва + суп + перекус'], descriptions: ['Ситний обід на перерву.', 'Повний домашній набір.', 'Обід і щось на потім.'],
    mealLabel: 'Оберіть набір', place: 'Куди доставити?', placeHint: 'Місто, вулиця та назва компанії або будівництва', areaHint: 'Прушкув і до 5 км від міста. Можливість доставки підтвердимо для вашої адреси.',
    people: 'На скільки людей?', contact: 'Телефон або e-mail', name: 'Як до вас звертатися?', optional: 'необов’язково', notes: 'Що ще нам варто знати?', notesHint: 'Наприклад, бажаний час, дні доставки або запитання про меню. Не вказуйте медичних даних.',
    consent: 'Погоджуюся на зв’язок щодо цього запиту.', privacy: 'Дані потрібні для обробки запиту. Підписки на розсилку немає.',
    submit: 'Надіслати запит', sending: 'Зберігаємо…', error: 'Не вдалося зберегти запит. Спробуйте ще раз трохи пізніше.', limit: 'Забагато запитів. Спробуйте пізніше.',
    success: 'Запит збережено!', successText: 'Дякуємо! Ваш запит додано до нашого списку. Це ще не підтверджене замовлення.', again: 'Надіслати ще один запит', footer: 'По-домашньому. Поруч. Досхочу.', footnote: 'Запит не зобов’язує до покупки. Доставку, склад та алергени підтвердимо до замовлення.',
  },
};
const meals: MealType[] = ['hot', 'hot_soup', 'hot_soup_snack'];

export default function LunchPage({ locale }: { locale: Locale }) {
  const [meal, setMeal] = useState<MealType>('hot_soup');
  const [state, setState] = useState<'idle' | 'sending' | 'success'>('idle');
  const [error, setError] = useState('');
  const [formVisible,setFormVisible]=useState(false);
  const attempt = useRef<{ key: string; payload: string } | null>(null);
  const t = copy[locale];
  const seo = seoContent[locale];
  useEffect(() => {
    try {
      const saved=localStorage.getItem('syty-kotek-language');
      if (location.pathname==='/' && saved && saved!=='pl' && saved in localePaths) location.replace(localePaths[saved as Locale]);
    } catch { /* The selected URL still works if browser storage is disabled. */ }
  }, []);
  useEffect(()=>{const form=document.getElementById('zapytanie');if(!form)return;const observer=new IntersectionObserver(([entry])=>setFormVisible(entry.isIntersecting),{threshold:0.1});observer.observe(form);return()=>observer.disconnect();},[]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === 'sending') return;
    const data = new FormData(event.currentTarget);
    const payload = { place: data.get('place'), mealType: meal, people: Number(data.get('people')), contact: data.get('contact'), name: data.get('name'), notes: data.get('notes'), website: data.get('website'), locale, consent: data.get('consent') === 'on' };
    const serialized = JSON.stringify(payload);
    if (attempt.current?.payload !== serialized) attempt.current = { key: crypto.randomUUID(), payload: serialized };
    setState('sending'); setError('');
    try {
      const response = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, requestId: attempt.current!.key }) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(response.status === 429 ? 'limit' : 'save');
      setState('success');
    } catch (e) { setState('idle'); setError(e instanceof Error && e.message === 'limit' ? t.limit : t.error); }
  }
  function saveLanguage(next: Locale) { try { localStorage.setItem('syty-kotek-language',next); } catch {} }
  return <main lang={locale}>
    <VisitTracker locale={locale}/>
    <header className="header wrap">
      <a href="#" className="wordmark" aria-label="Syty Kotek — start">syty kotek<span>DOMOWE OBIADY</span></a>
      <div className="header-actions"><nav className="languages" aria-label="Language">{(['pl','ru','uk'] as Locale[]).map(l => <a href={localePaths[l]} hrefLang={l} key={l} aria-current={locale === l ? 'page' : undefined} onClick={() => saveLanguage(l)}>{l.toUpperCase()}</a>)}</nav><a className="nav-cta" href="#zapytanie">{t.nav}<span aria-hidden="true"> ↗</span></a></div>
    </header>
    <section className="hero wrap">
      <div className="hero-copy"><p className="eyebrow"><span className="dot" />{t.badge}</p><h1>{seo.heading}</h1><p className="intro">{t.intro}</p><a className="button primary" href="#zapytanie">{t.cta}<span aria-hidden="true">↗</span></a><p className="fine">{t.small}</p></div>
      <div className="hero-art"><span className="area-pill"><span aria-hidden="true">⌖</span> {t.area}</span><div className="art-circle"/><Image src="/syty-kotek.png" alt="Syty Kotek — uśmiechnięty, pulchny rudy kot z łyżką" width={1254} height={1254} priority className="cat"/><span className="art-caption">smacznego!</span></div>
    </section>
    <section className="steps wrap" aria-label={t.nav}>{t.step.map((title, i) => <div key={i}><span className="step-number">0{i+1}</span><div><h2>{title}</h2><p>{t.stepText[i]}</p></div></div>)}</section>
    <FoodGallery locale={locale}/>
    <section className="service-copy wrap"><h2>{seo.sectionTitle}</h2><div>{seo.paragraphs.map(p=><p key={p}>{p}</p>)}</div></section>
    <section className="order-section" id="zapytanie"><div className="wrap order-grid"><div className="order-copy"><p className="eyebrow">{t.eyebrow}</p><h2>{t.formTitle}</h2><p>{t.formIntro}</p><div className="delivery-note"><span aria-hidden="true">⌖</span><div><strong>{t.area}</strong><p>{t.areaHint}</p></div></div></div>
      <div className="form-card">{state === 'success' ? <div className="success" role="status"><span className="success-icon">✓</span><h3>{t.success}</h3><p>{t.successText}</p><button className="button primary" onClick={() => { setState('idle'); attempt.current = null; }}>{t.again}</button></div> : <form id="lunch-request" onSubmit={submit}>
        <fieldset disabled={state === 'sending'}><legend>{t.mealLabel}</legend><div className="meal-options">{meals.map((value, i) => <label className={`meal-option ${meal === value ? 'selected' : ''}`} key={value}><input type="radio" name="mealType" value={value} checked={meal === value} onChange={() => setMeal(value)}/><span><strong>{t.meals[i]}</strong><small>{t.descriptions[i]}</small></span><span className="radio-mark" aria-hidden="true"/></label>)}</div>
        <div className="field"><label htmlFor="place">{t.place}</label><input id="place" name="place" required minLength={5} maxLength={300} placeholder={t.placeHint} autoComplete="street-address"/></div>
        <div className="field-row"><div className="field"><label htmlFor="people">{t.people}</label><input id="people" name="people" type="number" min={1} max={1000} step={1} required defaultValue={10} inputMode="numeric"/></div><div className="field"><label htmlFor="contact">{t.contact}</label><input id="contact" name="contact" required maxLength={150} autoComplete="email" placeholder="+48 … / e-mail"/></div></div>
        <div className="field"><label htmlFor="name">{t.name} <span>({t.optional})</span></label><input id="name" name="name" maxLength={100} autoComplete="name"/></div>
        <div className="field"><label htmlFor="notes">{t.notes} <span>({t.optional})</span></label><textarea id="notes" name="notes" maxLength={1500} rows={3} placeholder={t.notesHint}/></div>
        <div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off"/></div>
        <label className="consent"><input name="consent" type="checkbox" required/><span>{t.consent}</span></label><p className="privacy">{t.privacy}</p>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="button primary submit">{state === 'sending' ? t.sending : t.submit}<span aria-hidden="true">↗</span></button><p className="fine form-fine">{t.small}</p></fieldset>
      </form>}</div></div></section>
    <section className="faq wrap"><h2>{seo.faqTitle}</h2><div>{seo.faq.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
    <footer className="wrap footer"><div className="wordmark">syty kotek<span>{t.footer}</span></div><div><p>{t.footnote}</p><p>{seo.analyticsNote}</p></div><span className="footer-area">{t.area}</span></footer>
    {state!=='success'&&<div className="mobile-cta">{formVisible?<button type="submit" form="lunch-request" className="button primary" disabled={state==='sending'}>{state==='sending'?t.sending:t.submit}<span aria-hidden="true">↗</span></button>:<a className="button primary" href="#zapytanie">{t.cta}<span aria-hidden="true">↗</span></a>}</div>}
  </main>;
}
