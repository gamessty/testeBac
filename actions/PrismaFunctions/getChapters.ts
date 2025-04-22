"use server";

import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import { Chapter } from "@prisma/client";
import { chkP } from "../../utils";


export default async function getChapters({ subjectId }: { subjectId: string }): Promise<Chapter[] | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };
    }
    if (!chkP("general:*", session.user)) {
        return { message: "UNAUTHORIZED" };
    }
    let chapters = await prisma.chapter.findMany({
        where: {
            subjectId: subjectId
        }
    });
    return chapters;
}

export { getChapters };