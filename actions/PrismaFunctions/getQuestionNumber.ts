"use server";

import { prisma } from "../../lib/prisma";
import { Folder, Subject, Chapter } from "@prisma/client";

interface GetQuestionNumberParams {
    type?: 'folder' | 'subject' | 'subjectQuestion' | 'chapter';
    id?: string;
    entity?: Folder | Subject | Chapter;
}

// Helper function to count questions in a folder
async function countQuestionsInFolder(folderId: string): Promise<number> {
    // Check if folder has any subjects first
    const subjectCount = await prisma.subject.count({
        where: { folderId }
    });
    
    if (subjectCount === 0) {
        return 0; // Folder has no subjects, so it has no questions
    }

    // Get all subjects in the folder
    const folderSubjects = await prisma.subject.findMany({
        where: { folderId },
        select: { id: true, chapters: { select: { id: true } } },
    });

    const subjectIds = folderSubjects.map(subject => subject.id);
    const chapterIds = folderSubjects.flatMap(subject => subject.chapters.map(chapter => chapter.id));

    if (subjectIds.length === 0 && chapterIds.length === 0) {
        return 0; // No subjects with questions or chapters with questions
    }

    // Count questions directly in subjects and in chapters
    return await prisma.question.count({
        where: {
            OR: [
                { subjectId: { in: subjectIds } },
                { chapterId: { in: chapterIds } },
            ],
        },
    });
}

// Helper function to count questions in a subject
async function countQuestionsInSubject(subjectId: string): Promise<number | { message: string; error: boolean }> {
    // Check if subject exists
    const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        include: { chapters: { select: { id: true } } }
    });

    if (!subject) {
        return { message: "Subject not found", error: true };
    }

    if (subject.chapters.length === 0) {
        // Only check for direct questions in subject
        return await prisma.question.count({
            where: { subjectId }
        });
    }

    const chapterIdsOfSubject = subject.chapters.map(chapter => chapter.id);
    
    return await prisma.question.count({
        where: {
            OR: [
                { subjectId },
                { chapterId: { in: chapterIdsOfSubject } }
            ]
        }
    });
}

// Helper function to count direct questions in a subject (not including chapters)
async function countDirectQuestionsInSubject(subjectId: string): Promise<number> {
    return await prisma.question.count({
        where: { subjectId }
    });
}

// Helper function to count questions in a chapter
async function countQuestionsInChapter(chapterId: string): Promise<number | { message: string; error: boolean }> {
    // Check if chapter exists first
    const chapterExists = await prisma.chapter.findUnique({
        where: { id: chapterId }
    });
    
    if (!chapterExists) {
        return { message: "Chapter not found", error: true };
    }
    
    // Count questions in the chapter
    return await prisma.question.count({
        where: { chapterId }
    });
}

// Process by type and ID
async function processTypeAndId(type: string, id: string): Promise<number | { message: string; error: boolean }> {
    switch (type) {
        case 'folder': 
            return await countQuestionsInFolder(id);
        case 'subject': 
            return await countQuestionsInSubject(id);
        case 'subjectQuestion': 
            return await countDirectQuestionsInSubject(id);
        case 'chapter': 
            return await countQuestionsInChapter(id);
        default:
            return { message: "Invalid type provided", error: true };
    }
}

// Process by entity object
async function processEntity(entity: Folder | Subject | Chapter): Promise<number | { message: string; error: boolean }> {
    // Check if it's a Folder
    if ('category' in entity) {
        return await countQuestionsInFolder(entity.id);
    } 
    // Check if it's a Subject
    else if ('folderId' in entity) {
        return await countQuestionsInSubject(entity.id);
    } 
    // Check if it's a Chapter
    else if ('subjectId' in entity) {
        return await countQuestionsInChapter(entity.id);
    } 
    else {
        return { message: "Invalid entity provided", error: true };
    }
}

export default async function getQuestionNumber(params: GetQuestionNumberParams): Promise<number | { message: string; error: boolean }> {
    try {
        // Process by type and ID if provided
        if (params.type && params.id) {
            return await processTypeAndId(params.type, params.id);
        } 
        // Process by entity if provided
        else if (params.entity) {
            return await processEntity(params.entity);
        } 
        // Invalid parameters
        else {
            return { message: "Invalid parameters provided", error: true };
        }
    } catch (error) {
        console.error("Error in getQuestionNumber:", error);
        return { message: "An error occurred while fetching the question count", error: true };
    }
}