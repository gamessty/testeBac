import { cookies } from "next/headers";

export default async function FontSizeUpdaterAction(fontSize: number = 100) {
    (await cookies()).set('fontSize', fontSize.toString());
    return fontSize;
}