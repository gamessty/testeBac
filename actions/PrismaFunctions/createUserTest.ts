'use server';

import { prisma } from "../../lib/prisma";
import { auth } from "../../auth";
import { chkP } from "../../utils";
import { Question, UserTest, TestType } from "@prisma/client";

interface TestConfiguration {
    category?: string;
    folderId?: string;
    subjectIds?: string[];
    subjectQuestionIds?: string[];
    chapterIds?: string[];
    testType?: string;
    configurations?: Record<string, any>;
    questionDistribution?: Record<string, number>;
}

interface TestResponse {
    success: boolean;
}

interface TestErrorResponse extends TestResponse {
    success: false;
    message: string;
}

interface TestSuccessResponse extends TestResponse {
    success: true;
    message: string;
    testId: string;
}

type UnitedTestResponse = TestErrorResponse | TestSuccessResponse;

export async function generateTest(config: TestConfiguration): Promise<UnitedTestResponse> {
    const session = await auth();
    if (!session?.user || !session.user.id) {
        return { success: false, message: "Not authenticated" };
    }
    if (!chkP("general:*", session.user)) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        // Get questions based on distribution configuration
        const selectedQuestions: Question[] = [];
        
        // Process question distribution if specified
        if (config.questionDistribution && Object.keys(config.questionDistribution).length > 0) {
            // Process subject questions
            for (const subjectId of config.subjectQuestionIds || []) {
                // Requested count from distribution
                const requestedCount = config.questionDistribution[subjectId] || 0;
                if (requestedCount > 0) {
                    // Find out how many questions are available in the database
                    const available = await prisma.question.count({ where: { subjectId } });
                    const finalCount = Math.min(requestedCount, available);
                    
                    if(finalCount > 0) {
                        const questions = await prisma.question.findMany({
                            where: { subjectId },
                            take: finalCount,
                            orderBy: { createdAt: 'desc' } // random logic can be applied here
                        });
                        selectedQuestions.push(...questions);
                    }
                }
            }
            
            // Process chapter questions
            for (const chapterId of config.chapterIds || []) {
                const requestedCount = config.questionDistribution[chapterId] || 0;
                if (requestedCount > 0) {
                    const available = await prisma.question.count({ where: { chapterId } });
                    const finalCount = Math.min(requestedCount, available);
                    
                    if(finalCount > 0) {
                        const questions = await prisma.question.findMany({
                            where: { chapterId },
                            take: finalCount,
                            orderBy: { createdAt: 'desc' }
                        });
                        selectedQuestions.push(...questions);
                    }
                }
            }
        } 
        // Fallback behavior if no distribution specified
        else {
            const questions = await prisma.question.findMany({
                where: {
                    OR: [
                        { subjectId: { in: config.subjectQuestionIds } },
                        { chapterId: { in: config.chapterIds } },
                    ],
                },
            });
            selectedQuestions.push(...questions);
        }
        
        if (selectedQuestions.length === 0) {
            return { success: false, message: "No questions found for the selected criteria" };
        }

        const userTest = await prisma.userTest.create({
            data: {
                userId: session.user.id,
                folderId: config.folderId ?? "",
                subjectId: config.subjectIds ?? [],
                testType: TestType[config.testType?.toUpperCase() as TestType] ?? TestType.SIMPLE,
                configurations: config.configurations ?? {},
                questions: {
                    create: selectedQuestions.map((q) => ({
                        question: { connect: { id: q.id } }
                    }))
                }
            },
        });

        return { 
            success: true, 
            message: `Test generated successfully with ${selectedQuestions.length} questions`, 
            testId: userTest.id 
        };
    } catch (error: any) {
        console.error("Error generating test:", error);
        return { success: false, message: error.message };
    }
}
