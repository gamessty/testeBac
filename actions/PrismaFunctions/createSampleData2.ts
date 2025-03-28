'use server';

import { QuestionType } from '@prisma/client';
import { prisma } from "../../lib/prisma";
import questions from '@/sampleData/questions.json';
import answers from '@/sampleData/answers.json';
import chapters from '@/sampleData/chapters.json';
import { auth } from '@/auth';
import { chkP } from '@/utils';

type QuestionInput = {
    chapter: number;
    questionNumber: number;
    question: string;
    options: string[];
};

type AnswerInput = {
    chapter: number;
    questionNumber: number;
    answerKey: string[];
};

type ChapterInput = {
    chapter: number;
    name: string;
};

const LETTERS = ['a', 'b', 'c', 'd', 'e'];

export async function importQuestionsFromJson() {
    const session = await auth();
    if (!session?.user) {
        return { message: "Not authenticated" };
    }
    if (!chkP("developer:database", session.user)) {
        return { message: "Unauthorized" };
    }
    const folder = await prisma.folder.create({
        data: {
            name: 'UMF Craiova',
            category: 'ADMITERE',
            additionalData: {
                country: 'Romania',
                year: 2023,
                description: 'Medicina - Întrebări admitere Facultatea de Medicină 2023',
            },
        },
    });

    const subject = await prisma.subject.create({
        data: {
            name: 'Biologie',
            folderId: folder.id,
        },
    });

    const chapterMap = new Map<number, string>();

    for (const chapter of chapters as ChapterInput[]) {
        const created = await prisma.chapter.create({
            data: {
                name: chapter.name,
                subjectId: subject.id,
            },
        });
        chapterMap.set(chapter.chapter, created.id);
    }

    const answerMap = new Map<string, string[]>();
    for (const answer of answers as AnswerInput[]) {
        const key = `${answer.chapter}-${answer.questionNumber}`;
        answerMap.set(key, answer.answerKey);
    }

    for (const q of questions as QuestionInput[]) {
        const key = `${q.chapter}-${q.questionNumber}`;
        const answerKeys = answerMap.get(key) ?? [];
        const correctIndexes = answerKeys.map(letter => LETTERS.indexOf(letter));

        const type: QuestionType =
            correctIndexes.length === 1
                ? 'singleChoice'
                : 'simpleMultipleChoice';

        const options = q.options.map((opt, idx) => ({
            id: crypto.randomUUID(),
            option: opt,
            isCorrect: correctIndexes.includes(idx),
            image: null,
            code: [],
            localization: [
                {
                    locale: 'ro',
                    text: opt,
                },
            ],
        }));

        await prisma.question.create({
            data: {
                question: q.question,
                type,
                chapterId: chapterMap.get(q.chapter),
                subjectId: subject.id,
                options,
                additionalData: {
                    localization: [
                        {
                            locale: 'ro',
                            text: q.question,
                        },
                    ],
                    code: [],
                },
            },
        });
    }

    return { success: true };
}
