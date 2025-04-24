'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { chkP } from "@/utils";
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

// Helper: fetch a random sample of up to `limit` questions matching `where`
async function sampleQuestions(where: object, limit: number): Promise<Question[]> {
    if (limit <= 0) return [];
    const ids = (await prisma.question.findMany({ where, select: { id: true } }))
        .map(q => q.id);
    // Fisher–Yates shuffle
    for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    const slice = ids.slice(0, limit);
    return prisma.question.findMany({ where: { id: { in: slice } } });
}

// Select questions using the distribution provided
async function selectByDistribution(config: TestConfiguration) {
    const dist = config.questionDistribution ?? {};
    if (!Object.keys(dist).length) return null;

    const picks: Question[] = [];

    // Get questions from subject question IDs
    for (const subjectId of config.subjectQuestionIds || []) {
        const count = dist[subjectId] || 0;
        if (count <= 0) continue;

        const questions = await sampleQuestions({ subjectId }, count);
        picks.push(...questions);
    }

    // Get questions from chapter IDs
    for (const chapterId of config.chapterIds || []) {
        const count = dist[chapterId] || 0;
        if (count <= 0) continue;

        const questions = await sampleQuestions({ chapterId }, count);
        picks.push(...questions);
    }

    return picks;
}

// Select by total number (for backward compatibility)
async function selectByTotal(config: TestConfiguration) {
    const raw = config.configurations?.numberOfQuestions;
    const total = Number.isInteger(raw) ? Number(raw) : NaN;

    if (isNaN(total)) return null;

    // If we have a distribution, we should use it instead
    if (config.questionDistribution && Object.keys(config.questionDistribution).length > 0) {
        return null;
    }

    const where = {
        OR: [
            { subjectId: { in: config.subjectQuestionIds } },
            { chapterId: { in: config.chapterIds } }
        ]
    };

    const pool = await prisma.question.count({ where });
    return sampleQuestions(where, Math.min(total, pool));
}

// Fallback strategy - get all matching questions
async function selectFallback(config: TestConfiguration) {
    const where = {
        OR: [
            { subjectId: { in: config.subjectQuestionIds } },
            { chapterId: { in: config.chapterIds } }
        ]
    };
    return prisma.question.findMany({ where });
}

export async function generateTest(config: TestConfiguration): Promise<UnitedTestResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, message: "UNAUTHENTICATED" };
    if (!chkP("general:*", session.user)) return { success: false, message: "UNAUTHORIZED" };

    try {
        // Check if we have question distribution and at least one selection
        const hasDistribution = config.questionDistribution &&
            Object.keys(config.questionDistribution).length > 0 &&
            Object.values(config.questionDistribution).some(count => count > 0);

        // Try distribution strategy first, then fall back to total, then fallback
        let selected = (hasDistribution ? await selectByDistribution(config) : null)
            ?? await selectByTotal(config)
            ?? await selectFallback(config);

        if (!selected || selected.length === 0) {
            return { success: false, message: "NO_QUESTIONS" };
        }

        // If numberOfQuestions is specified and less than selected, trim the selection
        if (config.configurations?.numberOfQuestions &&
            Number(config.configurations.numberOfQuestions) < selected.length) {
            // Fisher-Yates shuffle the selected questions
            for (let i = selected.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [selected[i], selected[j]] = [selected[j], selected[i]];
            }
            // Trim to requested size
            selected = selected.slice(0, Number(config.configurations.numberOfQuestions));
        }

        const test = await prisma.userTest.create({
            data: {
                userId: session.user.id,
                folderId: config.folderId ?? "",
                subjectId: Array.from(new Set([...(config.subjectIds ?? []), ...(config.subjectQuestionIds ?? [])])),
                chapterId: Array.from(new Set(config.chapterIds ?? [])),
                testType: TestType[config.testType?.toUpperCase() as TestType] ?? TestType.SIMPLE,
                configurations: config.configurations ?? {},
                questions: { create: selected.map(q => ({ question: { connect: { id: q.id } } })) }
            }
        });

        return {
            success: true,
            message: `Test generated successfully with ${selected.length} questions`,
            testId: test.id
        };
    } catch (err: any) {
        console.error("Error generating test:", err);
        return { success: false, message: err.message };
    }
}
