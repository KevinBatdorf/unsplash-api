import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'
import cors from '../../lib/cors'

export const config = { runtime: 'edge' }
export default async function Download(
    req: NextRequest,
    context: NextFetchEvent,
) {
    if (req.method !== 'POST')
        return cors(req, NextResponse.json({}, { status: 405 }))
    const hasBody = req.headers.get('content-length') !== '0'
    if (!hasBody) return cors(req, NextResponse.json({}, { status: 400 }))

    const url = await req.text()
    context.waitUntil(
        fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
            },
        }),
    )

    return cors(req, NextResponse.json({ success: true }, { status: 200 }))
}
