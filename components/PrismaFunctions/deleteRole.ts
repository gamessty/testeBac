"use server";

import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import { Role } from "@prisma/client";
import { chkP } from "../../utils";
import { revalidatePath } from "next/cache";


export default async function deleteRole({ id }: { id: string }): Promise<Role | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "Not authenticated" };
    }
    if (!chkP("role:delete", session.user)) {
        return { message: "Unauthorized" };
    }
    let role = await prisma.role.delete({
        where: {
            id: id
        }
    });
    revalidatePath('/[slug]/app', "page");
    return role;
}