import { PrismaClient } from "@prisma/client"
import { getRandomUserName, alwaysRandomUsernames, getRandomUserImageURL } from "../utils";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient().$extends({
    query: {
        user: {
            async create({ args, query }) {
                const email = args.data.email;

                let username = "";
                if (email) {
                    username = email.split('@')[0];
                }
                if (email || alwaysRandomUsernames) {
                    username = getRandomUserName();
                }
                args.data.username = username;

                if (args.data.email?.endsWith("@gamessty.eu")) {
                    args.data.userAuthorized = true;
                    args.data.roles = {
                        connectOrCreate: [
                            {
                                where: {
                                    name: "admin"
                                },
                                create: {
                                    name: "admin",
                                    category: "ADMIN",
                                    permissions: ["admin:panel", "user:readAll", "developer:debug", "user:manage"],
                                }
                            },
                            {
                                where: {
                                    name: "user"
                                },
                                create: {
                                    name: "user",
                                }
                            }
                        ],
                    };
                } else {
                    args.data.roles = {
                        connectOrCreate: {
                            where: {
                                name: "user"
                            },
                            create: {
                                name: "user",
                            }
                        },
                    };
                }

                if (process.env.ALWAYS_USE_AVATARS === "true" && !args.data.image || args.data.image === "") {
                    args.data.image = getRandomUserImageURL(username);
                }

                return query(args);
            }
        }
    },
    /*result: {
        user: {
            roles: {
                needs: { id: true },
                compute: async ({ id }) => {
                    return await prisma.role.findMany({
                        where: {
                            userIDs: {
                                hasSome: [id]
                            }
                        }
                    });
                }
            }
        }
    }*/
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;