import { NextRequest, NextResponse, after } from 'next/server'
import cors from '../../../lib/cors'

export async function OPTIONS(req: NextRequest) {
    return cors(req, new NextResponse(null))
}

export async function POST(req: NextRequest) {
    const hasBody = req.headers.get('content-length') !== '0'
    if (!hasBody) return cors(req, NextResponse.json({}, { status: 400 }))

    const url = await req.text()
    after(
        fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
            },
        }),
    )

    return cors(req, NextResponse.json({ success: true }, { status: 200 }))
}
