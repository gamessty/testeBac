"use server";

import { prisma } from "../../lib/prisma";
import { auth, signOut } from "../../auth";
import { revalidatePath } from "next/cache";

export default async function deleteUser({ id }: { id: any }) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    if(!session?.user?.roles.includes("owner") && session?.user?.id != id) throw new Error("Unauthorized");
    const user = await prisma.user.delete({
        where: { id }
    });
    // Update the session 
    // This will be moved to a Route Handler in the future to assure cookies are updated
    // and the session is updated in the database before. Right now a refresh is necesary 
    // to update the session in the server side an respectively on the client 
    // in the way my app is constructed by passing props to the pages
    if(session?.user?.id == id) return await signOut({ redirectTo: '/' });
    revalidatePath('/[slug]/app', "page");
    return user;
}

/// OPTIMIZATION NEEDED, THE APP HAS HIGH BUILD TIMES OF 2.3s. UP FROM A couple of ms a few days ago