"use server";

import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import { Folder, Role } from "@prisma/client";
import { chkP } from "../../utils";


export default async function getManyFolder(): Promise<Folder[] | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "Not authenticated" };
    }
    if (!chkP("general:*", session.user)) {
        return { message: "Unauthorized" };
    }
    let folders = await prisma.folder.findMany();
    return folders;
}

export { getManyFolder };