"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Question } from "@prisma/client";
import { chkP } from "@/utils";

interface SubjectQuestion {
    subjectId: string;
    chapterId?: never;
}

interface ChapterQuestion {
    chapterId: string;
    subjectId?: never;
}

export default async function getQuestions(params: Readonly<ChapterQuestion | SubjectQuestion>): Promise<Question[] | { message: string }> {
    const session = await auth();
    const { subjectId, chapterId } = 'chapterId' in params ? { subjectId: undefined, ...params} : { subjectId: params.subjectId, chapterId: undefined };
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };
    }
    if (!chkP("general:*", session.user)) {
        return { message: "UNAUTHORIZED" };
    }
    let questions = await prisma.question.findMany({
        where: {
            subjectId,
            chapterId
        }
    });
    return questions;
}

export { getQuestions };