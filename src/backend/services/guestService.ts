import { executeQuery } from '../config/db';
import { Guest, GuestCreate, GuestUpdate, GUEST_QUERIES } from '../models/guestModel';

export async function getAllGuests(): Promise<Guest[]> {
  return executeQuery<Guest[]>(GUEST_QUERIES.GET_ALL);
}

export async function getGuestById(id: number): Promise<Guest | null> {
  const guests = await executeQuery<Guest[]>(GUEST_QUERIES.GET_BY_ID, [id]);
  return guests.length > 0 ? guests[0] : null;
}

export async function createGuest(guest: GuestCreate): Promise<number> {
  const { name, email, phone, message, purpose } = guest;
  const result = await executeQuery<any>(
    GUEST_QUERIES.CREATE, 
    [name, email, phone || null, message, purpose]
  );
  return result.insertId;
}

export async function updateGuest(id: number, guest: GuestUpdate): Promise<boolean> {
  const result = await executeQuery<any>(GUEST_QUERIES.UPDATE, [guest, id]);
  return result.affectedRows > 0;
}

export async function deleteGuest(id: number): Promise<boolean> {
  const result = await executeQuery<any>(GUEST_QUERIES.DELETE, [id]);
  return result.affectedRows > 0;
}

export async function checkOutGuest(id: number): Promise<boolean> {
  const result = await executeQuery<any>(GUEST_QUERIES.CHECK_OUT, [id]);
  return result.affectedRows > 0;
}

export async function initGuestTable(): Promise<void> {
  await executeQuery(GUEST_QUERIES.CREATE_TABLE);
}
