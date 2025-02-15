"use server";

import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import { Role } from "@prisma/client";
import { chkP } from "../../utils";


export default async function getManyRole(): Promise<Role[] | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "Not authenticated" };
    }
    if (!chkP("user:readAll", session.user)) {
        return { message: "Unauthorized" };
    }
    let roles = await prisma.role.findMany();
    return roles;
}

export { getManyRole };