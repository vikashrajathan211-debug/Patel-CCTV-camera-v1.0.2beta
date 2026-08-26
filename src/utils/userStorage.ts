import { UserOrderRecord } from '../types';

export function getOrdersForPhone(phone: string): UserOrderRecord[] {
  if (!phone) return [];
  const cleanPhone = phone.replace(/\D/g, '');
  try {
    const raw = localStorage.getItem(`patel_cctv_orders_${cleanPhone}`) || localStorage.getItem(`prince_cctv_orders_${cleanPhone}`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to get user orders', err);
    return [];
  }
}

export function addOrderForPhone(phone: string, order: UserOrderRecord): void {
  if (!phone) return;
  const cleanPhone = phone.replace(/\D/g, '');
  try {
    const current = getOrdersForPhone(cleanPhone);
    const updated = [order, ...current];
    localStorage.setItem(`patel_cctv_orders_${cleanPhone}`, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to add user order', err);
  }
}
