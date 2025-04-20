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

    // Calculate the score for the question based on the selected answers
    const score = calculateQuestionScore(question, answerIds);

    // Get current score or initialize it
    const currentScore = userTest.score || 0;
    const newScore = currentScore + score;

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
            score: newScore,
        },
        include: userTestWithQuestions.include
    })

    // Return the updated user test
    return updatedUserTest ?? { message: "NOT_FOUND" };
}

/**
 * Calculate the score for a question based on user's answers
 * Scoring is based on the number of concordances between correct answers and user selections
 * 
 * @param question The question object
 * @param selectedAnswerIds The answer IDs selected by the user
 * @returns The calculated score
 */
function calculateQuestionScore(question: any, selectedAnswerIds: string[]): number {
    // Total possible points is equal to the number of options
    const totalOptions = question.options.length;
    
    // Get correct answer IDs from the question
    const correctAnswerIds = question.options
        .filter((option: any) => option.isCorrect)
        .map((option: any) => option.id);
    
    // Single answer question
    if (correctAnswerIds.length === 1) {
        // If user selected the correct answer, award full points
        return selectedAnswerIds.includes(correctAnswerIds[0]) ? totalOptions : 0;
    }
    
    // Multiple answer question
    let concordances = 0;
    
    // Count correct selections (user selected a correct answer)
    for (const answerId of selectedAnswerIds) {
        if (correctAnswerIds.includes(answerId)) {
            concordances++;
        }
    }
    
    // Count correct non-selections (user correctly did not select a wrong answer)
    for (const option of question.options) {
        if (!option.isCorrect && !selectedAnswerIds.includes(option.id)) {
            concordances++;
        }
    }
    
    return concordances;
}

/**
 * Check if all questions in the test have been answered
 * 
 * @param userTest The user test object
 * @param currentQuestionId The ID of the question being answered
 * @returns Boolean indicating if all questions have been answered
 */
function isAllQuestionsAnswered(userTest: UserTestWithQuestions, currentQuestionId: string): boolean {
    // Count existing answers
    const answeredCount = userTest.selectedAnswers ? userTest.selectedAnswers.length : 0;
    
    // Add 1 for the current answer being submitted
    const totalAnswered = answeredCount + 1;
    
    // Check if this equals the total number of questions
    return totalAnswered >= userTest.questions.length;
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