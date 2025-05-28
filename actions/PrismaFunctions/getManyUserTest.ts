"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserTest } from "@prisma/client";
import { chkP } from "@/utils";


export default async function getManyUserTest({ userId }: { userId: string }): Promise<UserTest[] | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };
    }
    if (!chkP("test:readAll", session.user) && session?.user?.id != userId) {
        return { message: "UNAUTHORIZED" };
    }
    let userTests = await prisma.userTest.findMany({
        where: {
            userId
        }
    });
    return userTests;
}

export { getManyUserTest };