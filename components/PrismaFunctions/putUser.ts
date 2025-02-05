"use server";

import { prisma } from "../../lib/prisma";
import { auth, unstable_update } from "../../auth";
import { revalidatePath } from "next/cache";

export default async function putUser({ id, data }: { id: any, data: any }) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    if (!session?.user?.roles.includes("admin") && session?.user?.id != id) throw new Error("Unauthorized");
    if(data.roles && !session?.user?.roles.includes("owner")) data.roles = undefined;// Only owners can change roles of other users
    //ADD MORE BETTER ROLES EVALUATION AND CHECKS (FOR EXAMPLE NOW AN ADMIN CAN REMOVE ROLES FROM ANYONE)
    const user = await prisma.user.update({
        where: { id },
        data
    });
    // Update the session 
    // This will be moved to a Route Handler in the future to assure cookies are updated
    // and the session is updated in the database before. Right now a refresh is necesary 
    // to update the session in the server side an respectively on the client 
    // in the way my app is constructed by passing props to the pages
    if(session?.user?.id == id) await unstable_update({ user: user });
    revalidatePath('/[slug]/app', "page");
    return user;
}

/// OPTIMIZATION NEEDED, THE APP HAS HIGH BUILD TIMES OF 2.3s. UP FROM A couple of ms a few days ago