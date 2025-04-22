"use server";

import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import { Subject } from "@prisma/client";
import { chkP } from "../../utils";


export default async function getSubjects({ folderId }: { folderId: string }): Promise<Subject[] | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };
    }
    if (!chkP("general:*", session.user)) {
        return { message: "UNAUTHORIZED" };
    }
    let subjects = await prisma.subject.findMany({
        where: {
            folderId: folderId
        }
    });
    return subjects;
}

export { getSubjects };

export async function getSubjectNamesByIds(subjectIds: string[]): Promise<{ [key: string]: string } | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };
    }
    if (!chkP("general:*", session.user)) {
        return { message: "UNAUTHORIZED" };
    }
    const subjects = await prisma.subject.findMany({
        where: {
            id: {
                in: subjectIds,
            },
        },
        select: {
            id: true,
            name: true,
        },
    });

    const subjectNames: { [key: string]: string } = {};
    subjects.forEach((subject) => {
        subjectNames[subject.id] = subject.name;
    });

    return subjectNames;
}
