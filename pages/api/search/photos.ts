import { NextRequest, NextResponse } from 'next/server'
import cors from '../../../lib/cors'

export const config = { runtime: 'edge' }
export default async function SearchPhotos(req: NextRequest) {
    if (req.method !== 'GET') return NextResponse.json({}, { status: 405 })

    const params = req.nextUrl.searchParams
    const q = params.get('query')
    const source = params.get('imageSource') || 'unsplash'

    const url =
        source === 'lexica'
            ? `https://lexica.art/api/v1/search?q=${q}`
            : `https://api.unsplash.com/search/photos?order_by=latest&${
                  params?.toString() ?? ''
              }`

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
                { message: 'Too many requests' },
                { status: 429 },
            ),
        )
    }

    const totalPhotos = Number(response.headers.get('x-total') || 0)
    const perPage = Number(response.headers.get('x-per-page') || 0)
    const totalPages =
        totalPhotos && perPage ? Math.floor(totalPhotos / perPage) : undefined

    const json = await response.json()
    const results = (source === 'lexica' ? json?.images : json?.results) || []

    const data = {
        errors: json.errors,
        // This endpoint returns json.results
        photos:
            json?.errors?.length > 0
                ? undefined
                : results?.map((photo: any) => ({ ...photo, source })),
        total_photos: totalPhotos ?? undefined,
        total_pages: totalPages ?? undefined,
    }

    const headers = { 'X-Api-Latency': `${Date.now() - start}ms` }
    return cors(req, NextResponse.json(data, { status: 200, headers }))
}
