export const mealTypes = ['hot', 'hot_soup', 'hot_soup_snack'] as const;
export type MealType = typeof mealTypes[number];
export type Locale = 'pl' | 'ru' | 'uk';
export type Lead = {
  requestId: string; place: string; mealType: MealType; people: number;
  contact: string; name: string; notes: string; locale: Locale; consent: true;
};
export type Validation = { ok: true; value: Lead } | { ok: false; field: string };
const clean = (v: unknown) => typeof v === 'string' ? v.trim().replace(/\r\n/g, '\n') : '';
export function validateLead(input: unknown): Validation {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, field: 'form' };
  const p = input as Record<string, unknown>;
  const requestId = clean(p.requestId);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) return { ok: false, field: 'requestId' };
  if (clean(p.website)) return { ok: false, field: 'form' };
  const place = clean(p.place), contact = clean(p.contact), name = clean(p.name), notes = clean(p.notes);
  if (place.length < 5 || place.length > 300) return { ok: false, field: 'place' };
  if (!mealTypes.includes(p.mealType as MealType)) return { ok: false, field: 'mealType' };
  if (typeof p.people !== 'number' || !Number.isSafeInteger(p.people) || p.people < 1 || p.people > 1000) return { ok: false, field: 'people' };
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const phone = /^[+()\d\s.-]+$/.test(contact) && contact.replace(/\D/g, '').length >= 7 && contact.replace(/\D/g, '').length <= 15;
  if (contact.length > 150 || (!email && !phone)) return { ok: false, field: 'contact' };
  if (name.length > 100) return { ok: false, field: 'name' };
  if (notes.length > 1500) return { ok: false, field: 'notes' };
  if (!['pl','ru','uk'].includes(p.locale as string)) return { ok: false, field: 'locale' };
  if (p.consent !== true) return { ok: false, field: 'consent' };
  return { ok: true, value: { requestId, place, mealType: p.mealType as MealType, people: p.people, contact, name, notes, locale: p.locale as Locale, consent: true } };
}
