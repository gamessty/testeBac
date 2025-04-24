"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Folder, Role } from "@prisma/client";
import { chkP } from "@/utils";


export default async function getManyFolder(): Promise<Folder[] | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };
    }
    if (!chkP("general:*", session.user)) {
        return { message: "UNAUTHORIZED" };
    }
    let folders = await prisma.folder.findMany();
    return folders;
}

export { getManyFolder };

export async function getFolderNamesByIds(folderIds: string[]): Promise<{ [key: string]: string } | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };
    }
    if (!chkP("general:*", session.user)) {
        return { message: "UNAUTHORIZED" };
    }
    const folders = await prisma.folder.findMany({
        where: {
            id: {
                in: folderIds,
            },
        },
        select: {
            id: true,
            name: true,
        },
    });

    const folderNames: { [key: string]: string } = {};
    folders.forEach((folder) => {
        folderNames[folder.id] = folder.name;
    });

    return folderNames;
}

export async function getFolderByIds(folderIds: string[]): Promise<Folder[] | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };
    }
    if (!chkP("general:*", session.user)) {
        return { message: "UNAUTHORIZED" };
    }
    const folders = await prisma.folder.findMany({
        where: {
            id: {
                in: folderIds,
            },
        },
    });
    return folders;
}