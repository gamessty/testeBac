
import { auth } from '../../../../../auth'
import { NextAuthRequest } from 'next-auth/lib'
import { NextResponse } from 'next/server'

export const GET = auth(function GET(req: NextAuthRequest) {
    if (req.auth) return NextResponse.json(req.auth)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
})