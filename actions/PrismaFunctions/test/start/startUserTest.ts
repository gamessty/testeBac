"use server";

import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { UserTest } from "@prisma/client";
import { chkP } from "../../../../utils";


export default async function startUserTest({ userTestId }: { userTestId: string }): Promise<UserTest | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };
    }
    
    let userTest = await prisma.userTest.findUnique({
        where: {
            id: String(userTestId)
        }
    });

    if (!chkP("test:updateAll", session.user) && userTest?.userId !== session.user.id) {
        return { message: "UNAUTHORIZED" };
    }

    if(!userTest) {
        return { message: "NOT_FOUND" };
    }

    // Check if the test is already started
    if (userTest.startedAt) {
        return { message: "ALREADY_STARTED" };
    }

    // Update the test to set the startedAt timestamp
    userTest = await prisma.userTest.update({
        where: {
            id: String(userTestId)
        },
        data: {
            startedAt: new Date()
        }
    });

    // Return the updated user test
    return userTest;
}

export { startUserTest };