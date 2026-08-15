import { NextRequest, NextResponse } from 'next/server'
import cors from '../../../lib/cors'

export async function OPTIONS(req: NextRequest) {
    return cors(req, new NextResponse(null))
}

export async function GET(req: NextRequest) {
    const params = req.nextUrl.searchParams
    const url = `https://api.unsplash.com/photos?${params?.toString() ?? ''}`

    const start = Date.now()
    const response = await fetch(url, {
        headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
    })

    if (response?.status === 429) {
        return cors(
            req,
            NextResponse.json(
                {
                    message: `Too many requests. Please wait ${
                        response.headers.get('x-retry-after') || 'a few'
                    } seconds`,
                },
                { status: 429 },
            ),
        )
    }

    const totalPhotos = Number(response.headers.get('x-total'))
    const perPage = Number(response.headers.get('x-per-page'))
    const totalPages =
        totalPhotos && perPage ? Math.floor(totalPhotos / perPage) : undefined

    const json = await response.json()
    const results = json || []

    const data = {
        errors: json.errors,
        photos:
            json?.errors?.length > 0
                ? undefined
                : results?.map((photo: Record<string, unknown>) => ({
                      ...photo,
                      source: 'unsplash',
                  })),
        total_photos: totalPhotos ?? undefined,
        total_pages: totalPages ?? undefined,
    }

    const headers = { 'X-Api-Latency': `${Date.now() - start}ms` }
    return cors(req, NextResponse.json(data, { status: 200, headers }))
}
