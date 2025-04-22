"use server";

import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { UserTest } from "@prisma/client";
import { chkP } from "../../../utils";

export default async function deleteUserTest({ userTestId }: { userTestId: string }): Promise<{ success: true } | { message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };
    }
    
    const userTest = await prisma.userTest.findUnique({
        where: {
            id: String(userTestId)
        }
    });

    if (!userTest) {
        return { message: "NOT_FOUND" };
    }

    // Check if the user has permission to delete this test
    // Users can delete their own tests, admins can delete any test
    if (!chkP("test:deleteAll", session.user) && userTest.userId !== session.user.id) {
        return { message: "UNAUTHORIZED" };
    }

    try {
        // Delete the test and all its related data
        await prisma.userTest.delete({
            where: {
                id: String(userTestId)
            }
        });
        
        // Return success
        return { success: true };
    } catch (error) {
        console.error("Error deleting test:", error);
        return { message: "UNKNOWN" };
    }
}

export { deleteUserTest };