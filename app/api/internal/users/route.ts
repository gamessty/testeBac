
import { auth } from '../../../../auth'
import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { chkP } from '../../../../utils'

export const GET = async function GET(req: NextRequest) {
    let session = await auth()
    if (!session || !session.user) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }
    if (!chkP("user:readAll", session.user)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }
    let users = await prisma.user.findMany({
        where: Object.fromEntries(req.nextUrl.searchParams.entries()) ?? undefined
    });
    return NextResponse.json(users);
}
