"use server";

import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { UserTest } from "@prisma/client";
import { chkP } from "../../../../utils";

export default async function endUserTest({ userTestId }: { userTestId: string }): Promise<UserTest | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };
    }
    
    // Get the user test with related questions to calculate mark
    let userTest = await prisma.userTest.findUnique({
        where: {
            id: String(userTestId)
        },
        include: {
            questions: {
                include: {
                    question: true
                }
            }
        }
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
    
    // Calculate the maximum possible score for all questions
    const maxPossibleScore = calculateMaximumPossibleScore(userTest);
    
    // Calculate the mark using the formula: score/maximum_score * 9 + 1
    // Ensure we don't divide by zero
    let mark = 1.0; // Default minimum mark if no questions or max score is 0
    if (maxPossibleScore > 0) {
        mark = (userTest.score / maxPossibleScore) * 9 + 1;
        // Truncate to 2 decimal places without rounding
        mark = Math.floor(mark * 100) / 100;
    }
    
    // Update the test to set the finishedAt timestamp and the mark
    let updatedUserTest = await prisma.userTest.update({
        where: {
            id: String(userTestId)
        },
        data: {
            finishedAt: new Date(),
            mark: mark
        }
    });
    
    // Return the updated user test
    return updatedUserTest;
}

/**
 * Calculate the maximum possible score for all questions in the test
 * 
 * @param userTest The user test with included questions
 * @returns The maximum possible score
 */
function calculateMaximumPossibleScore(userTest: any): number {
    if (!userTest.questions || userTest.questions.length === 0) {
        return 0;
    }
    
    // Sum up the maximum possible score for each question
    // The maximum score for each question is equal to the number of options
    return userTest.questions.reduce((total: number, userTestQuestion: any) => {
        const question = userTestQuestion.question;
        if (question?.options) {
            return total + question.options.length;
        }
        return total;
    }, 0);
}

export { endUserTest };