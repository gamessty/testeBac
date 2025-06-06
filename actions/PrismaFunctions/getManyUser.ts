"use server";
import { prisma } from "../../lib/prisma";
import { auth } from "../../auth";
import { Prisma } from "@prisma/client";
import { chkP } from "../../utils";
import { type User, type Role } from "@prisma/client";

interface UserRoles extends User {
    roles: Role[]
}

export default async function getManyUser(where?: Prisma.UserWhereInput): Promise<UserRoles[] | { message: string }> {
    let session = await auth();
    if (!session?.user) {
        return { message: "UNAUTHENTICATED" };
    }
    if (!chkP("user:readAll", session.user)) {
        return { message: "UNAUTHORIZED" };
    }
    let roles = await prisma.role.findMany();
    let users = await prisma.user.findMany({
        where
    });
    let usersRoles = users.map(user => {
        let copyUser: UserRoles = { ...user, roles: [] };
        copyUser.roles = roles.filter(role => user.rolesIDs.includes(role.id));
        return copyUser;
    });
    return usersRoles;
}

export { getManyUser };