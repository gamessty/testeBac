"use server";

import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import { Role } from "@prisma/client";
import { chkP } from "../../utils";
import { revalidatePath } from "next/cache";


export default async function postRole({ roleData }: { roleData: Omit<Role, "id" | "userIDs" | "createdAt" | "updatedAt"> }): Promise<Role | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };
    }
    if (!chkP("role:create", session.user)) {
        return { message: "UNAUTHORIZED" };
    }
    let role = await prisma.role.create({
        data: roleData
    });
    revalidatePath('/[slug]/app', "page");
    return role;
}

export { postRole };