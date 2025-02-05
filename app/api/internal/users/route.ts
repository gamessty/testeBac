
import { auth } from '../../../../auth'
import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export const GET = async function GET(req: NextRequest) {
    let session = await auth()
    if (!session?.user) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }
    if (!session?.user?.roles.includes("admin")) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }
    let users = await prisma.user.findMany({
        where: Object.fromEntries(req.nextUrl.searchParams.entries()) ?? undefined
    });
    return NextResponse.json(users);
}
