"use server";

import { auth, UserActiveTest } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { Prisma, UserTest } from "@prisma/client";
import { chkP } from "../../../../utils";
import { JsonObject } from "next-auth/adapters";

const userTestWithQuestions = Prisma.validator<Prisma.UserTestDefaultArgs>()({
    include: { questions: { include: { question: true } } }
})

type UserTestWithQuestions = Prisma.UserTestGetPayload<typeof userTestWithQuestions>



export default async function sendAnswer({ userTestId, questionId, answerIds }: { userTestId: string, questionId: string, answerIds: string[] }): Promise<UserTestWithQuestions | { message: string, userTest?: UserTest }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };
    }
    if (!userTestId || !questionId || !answerIds) {
        return { message: "INVALID_INPUT" };
    }

    let userTest = await prisma.userTest.findUnique({
        where: {
            id: String(userTestId),
        },
        include: { questions: { include: { question: true } } } // Include related questions
    });

    if (!chkP("test:updateAll", session.user) && userTest?.userId !== session.user.id) {
        return { message: "UNAUTHORIZED" };
    }
    if (!userTest) {
        return { message: "NOT_FOUND" };
    }
    // Check if the test is started and that startedAt is valid DateTime
    if (!userTest.startedAt || !isValidDate(userTest.startedAt) || isNaN(new Date(userTest.startedAt).getTime())) {
        return { message: "NOT_STARTED" };
    }
    // Check if the test is already finished
    if (userTest.finishedAt) {
        return { message: "ALREADY_ENDED" };
    }
    //Check if the test is not "expired" - timeLimit is in minutes (timeLimit is in a variable prisma JsonValue object named configurations) and startedAt is a valid DateTime
    // Update the test to set the startedAt timestamp
    const configurations = userTest.configurations as JsonObject;
    const timeLimit = configurations.timeLimit as (number | undefined);
    if (configurations && timeLimit && isTestTimeExpired(userTest.startedAt, timeLimit)) {
        let updatedUserTest = await prisma.userTest.update({
            where: {
                id: String(userTestId)
            },
            data: {
                finishedAt: new Date()
            }
        });
        // also end the test here
        return { message: "TIME_LIMIT_EXCEEDED", userTest: updatedUserTest };
    }

    // Check if the questionId is valid and exists in the test's questions
    const question = userTest.questions.find((utq) => utq.questionId === questionId)?.question;
    if (!question) {
        return { message: "QUESTION_NOT_FOUND" };
    }
    // Check if the answerIds are valid and exist in the question's answers
    const questionAnswers = question.options.map((answer) => answer.id);
    const invalidAnswerIds = answerIds.filter((answerId) => !questionAnswers.includes(answerId));
    if (invalidAnswerIds.length > 0) {
        return { message: "INVALID_ANSWER_IDS" };
    }

    if (userTest.selectedAnswers) {
        // Check if the questionId already exists in selectedAnswers
        const existingAnswerIndex = userTest.selectedAnswers.findIndex((selectedAnswer) => selectedAnswer.questionId === questionId);
        if (existingAnswerIndex !== -1) {
            // If it exists, don't allow this, error
            return { message: "ALREADY_ANSWERED" };
        }
    }

    let updatedUserTest = await prisma.userTest.update({
        where: {
            id: String(userTestId)
        },
        data: {
            selectedAnswers: {
                push: {
                    questionId: questionId,
                    answerIds: answerIds
                }
            },
            finishedAt: new Date()
        },
        include: userTestWithQuestions.include
    })

    // Return the updated user test
    return updatedUserTest ?? { message: "NOT_FOUND" };
}

function isValidDate(date: Date | null): boolean {
    return date instanceof Date && !isNaN(date.getTime());
}

function isTestTimeExpired(startedAt: Date, timeLimit: number): boolean {
    if (!isValidDate(startedAt)) return false;
    const currentTime = new Date().getTime();
    const startedAtTime = startedAt.getTime();
    const timeLimitInMs = timeLimit * 60 * 1000; // Convert minutes to milliseconds
    return currentTime - startedAtTime > timeLimitInMs;
}

export { sendAnswer };