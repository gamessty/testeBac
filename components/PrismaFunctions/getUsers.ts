"use server";
import { prisma } from "../../lib/prisma";
import { auth } from "../../auth";
import { type User } from "next-auth";
import { Prisma } from "@prisma/client";

export default async function getUsers(where?: Prisma.UserWhereInput): Promise<User[] | { message: string }> {
    let session = await auth();
    if (!session?.user) {
        return { message: "Not authenticated" };
    }
    if (!session?.user?.roles.includes("admin") && !session?.user?.roles.includes("owner")) {
        return { message: "Unauthorized" };
    }
    let users = await prisma.user.findMany({
        where
    });
    return users;
}