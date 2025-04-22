"use server";

import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { UserActiveTest } from "@/auth";
import { chkP } from "../../../../utils";

interface UserTestWithQuestions extends Omit<UserActiveTest, "folder" | "chapters" | "subjects"> {}

export default async function resumeUserTest({ userTestId }: { userTestId: string }): Promise<UserTestWithQuestions | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };
    }
    
    // Modify the query to include questions
    let userTest = await prisma.userTest.findUnique({
        where: {
            id: String(userTestId)
        },
        include: { questions: { include: { question: true } } }
    });

    if (!chkP("test:updateAll", session.user) && userTest?.userId !== session.user.id) {
        return { message: "UNAUTHORIZED" };
    }
    
    if(!userTest) {
        return { message: "NOT_FOUND" };
    }
    // Check if the test is started and that startedAt is valid DateTime
    if (!userTest.startedAt || isNaN(new Date(userTest.startedAt).getTime())) {
        return { message: "NOT_STARTED" };
    }
    // Check if the test is already finished
    if (userTest.finishedAt) {
        return { message: "ALREADY_ENDED" };
    }
    
    // Log the questions count to debug
    console.log(`Returning test with ${userTest.questions ? userTest.questions.length : 0} questions`);
    
    // Return the updated user test
    const questions = userTest?.questions.map(q => q.question);

    return {...userTest, questions };
}

export { resumeUserTest };