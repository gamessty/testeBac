"use server";

import { prisma } from "../../lib/prisma";
import { auth, signOut } from "../../auth";
import { revalidatePath } from "next/cache";
import { chkP } from "../../utils";
import { type User } from "@prisma/client";

export default async function deleteUser({ id }: { id: any }): Promise<User | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "Not authenticated" };
    }
    if (!chkP("user:delete", session.user) && session?.user?.id != id) {
        return { message: "Unauthorized" };
    }
    const user = await prisma.user.delete({
        where: { id }
    });
    if(session?.user?.id == id) return await signOut({ redirectTo: '/' });
    revalidatePath('/[slug]/app', "page");
    return user;
}

export { deleteUser };