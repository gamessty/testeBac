"use server";

import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import { Subject } from "@prisma/client";
import { chkP } from "../../utils";


export default async function getSubjects({ folderId }: { folderId: string }): Promise<Subject[] | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "Not authenticated" };
    }
    if (!chkP("general:*", session.user)) {
        return { message: "Unauthorized" };
    }
    let subjects = await prisma.subject.findMany({
        where: {
            folderId: folderId
        }
    });
    return subjects;
}

export { getSubjects };