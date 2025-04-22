"use server";
import { cookies } from 'next/headers';

export async function initiateFontSize(fontSize: number) {
    const cookiez = await cookies();
    cookiez.set('fontSize', fontSize.toString());
    return (cookiez.get('fontSize')?.value)
}