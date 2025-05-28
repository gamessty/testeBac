"use server";

import { prisma } from "@/lib/prisma";
import { auth, unstable_update } from "@/auth";
import { revalidatePath } from "next/cache";
import { chkP } from "@/utils";
import { type User } from "@prisma/client";

export default async function putUser({ id, data }: { id: any, data: any }): Promise<User | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };  
    }
    if (!chkP("user:readAll", session.user) && session?.user?.id != id && data.roles) {
        return { message: "UNAUTHORIZED" };
    }
    if (!chkP("user:manageRoles", session.user)) data.roles = undefined;
    const user = await prisma.user.update({
        where: { id },
        data
    });
    // Update the session 
    // This will be moved to a Route Handler in the future to assure cookies are updated
    // and the session is updated in the database before. Right now a refresh is necesary 
    // to update the session in the server side an respectively on the client 
    // in the way my app is constructed by passing props to the pages
    if (session?.user?.id == id) await unstable_update({ user: user });
    revalidatePath('/[slug]/app', "page");
    return user;
}

export { putUser };