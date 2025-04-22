"use server";

import { auth, UserActiveTest } from "@/auth";
import { prisma } from "../../../../lib/prisma";
import { chkP } from "../../../../utils";

interface UserTestWithQuestions extends Omit<UserActiveTest, "folder" | "chapters" | "subjects"> {}

export default async function startUserTest({ userTestId }: { userTestId: string }): Promise<UserTestWithQuestions | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };
    }
    
    let userTest = await prisma.userTest.findUnique({
        where: {
            id: String(userTestId)
        }
    });

    if (!chkP("test:updateAll", session.user) && userTest?.userId !== session.user.id) {
        return { message: "UNAUTHORIZED" };
    }

    if(!userTest) {
        return { message: "NOT_FOUND" };
    }

    // Check if the test is already started
    if (userTest.startedAt) {
        try {
            // Just return the test with questions if it's already started instead of an error
            const fullUserTest = await prisma.userTest.findUnique({
                where: {
                    id: String(userTestId)
                },
                include: { questions: { include: { question: true } } }
            });
            
            if (fullUserTest) {
                return {
                    ...fullUserTest, 
                    questions: fullUserTest.questions.map(q => q.question)
                };
            }
        } catch (error) {
            console.error("Error fetching full test after ALREADY_STARTED:", error);
        }
        return { message: "ALREADY_STARTED" };
    }

    // Update the test to set the startedAt timestamp
    let updatedUserTest = await prisma.userTest.update({
        where: {
            id: String(userTestId)
        },
        data: {
            startedAt: new Date()
        },
        include: { questions: { include: { question: true } } } // Include related questions
    });

    // Return the updated user test
    return {...updatedUserTest, questions: updatedUserTest.questions.map(q => q.question) };
}

export { startUserTest };