'use server';

import { prisma } from "../../lib/prisma";
import { auth } from "../../auth";
import { chkP } from "../../utils";
import { Question, UserTest, TestType } from "@prisma/client";

interface TestConfiguration {
    category?: string;
    folder?: string;
    subjects?: string[];
    chapters?: string[];
    testType?: string;
    configurations?: Record<string, any>;
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
        const questions = await prisma.question.findMany({
            where: {
                OR: [
                    { subjectId: { in: config.subjects } },
                    { chapterId: { in: config.chapters } },
                ],
            },
        });

        const userTest = await prisma.userTest.create({
            data: {
                userId: session.user.id,
                folderId: config.folder ?? "",
                subjectId: config.subjects || [],
                questions: {
                    connect: questions.map((q) => ({ id: q.id })),
                },
                testType: config.testType as TestType,
                configurations: config.configurations || {}, // Ensure configurations are passed correctly
            },
        });

        return { success: true, message: "Test generated successfully", testId: userTest.id };
    } catch (error: any) {
        console.error(error);
        return { success: false, message: error.message };
    }
}
