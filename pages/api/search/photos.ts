import { NextRequest, NextResponse } from 'next/server'
import cors from '../../../lib/cors'

export const config = { runtime: 'edge' }
export default async function SearchPhotos(req: NextRequest) {
    const params = req.nextUrl.searchParams
    const url =
        'https://api.unsplash.com/search/photos?order_by=latest&' +
        (params?.toString() ?? '')

    const start = Date.now()
    const response = await fetch(url, {
        headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
    })

    const totalPhotos = Number(response.headers.get('x-total'))
    const perPage = Number(response.headers.get('x-per-page'))
    const totalPages =
        totalPhotos && perPage ? Math.floor(totalPhotos / perPage) : undefined

    const json = await response.json()

    const data = {
        errors: json.errors,
        // This endpoint returns json.results
        photos: json?.errors?.length > 0 ? undefined : json?.results,
        total_photos: totalPhotos ?? undefined,
        total_pages: totalPages ?? undefined,
    }

    const headers = { 'X-Api-Latency': `${Date.now() - start}ms` }
    return cors(req, NextResponse.json(data, { status: 200, headers }))
}
