"use server";

import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { UserTest } from "@prisma/client";
import { chkP } from "../../../utils";


export default async function getUserTestDetails({ userTestId }: { userTestId: string }): Promise<UserTest | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };
    }
    let userTest = await prisma.userTest.findUnique({
        where: {
            id: String(userTestId)
        }
    });
    if (!chkP("test:readAll", session.user) && userTest?.userId !== session.user.id) {
        return { message: "UNAUTHORIZED" };
    }
    if(!userTest) {
        return { message: "NOT_FOUND" };
    }
    return userTest;
}

export { getUserTestDetails };