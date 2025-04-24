
import { auth } from "@/auth"
import { NextResponse } from 'next/server'

export const GET = async function GET() {
    let session = await auth()
    if (session && session.user) return NextResponse.json(session.user)
    return NextResponse.json({ message: "UNAUTHENTICATED" }, { status: 401 })
}
