"use server";

import { prisma } from "../../lib/prisma";
import { unstable_update } from "../../auth";

export default async function userUpdate({ id, data }: { id: any, data: any }) {
    await prisma.user.update({
        where: { id },
        data
    });
    // Update the session 
    // This will be moved to a Route Handler in the future to assure cookies are updated
    // and the session is updated in the database before. Right now a refresh is necesary 
    // to update the session in the server side an respectively on the client 
    // in the way my app is constructed by passing props to the pages
    unstable_update({ user: data });
}

/// OPTIMIZATION NEEDED, THE APP HAS HIGH BUILD TIMES OF 2.3s. UP FROM A couple of ms a few days ago