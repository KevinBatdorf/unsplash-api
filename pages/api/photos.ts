import { NextRequest, NextResponse } from 'next/server'
import cors from '../../lib/cors'
import randomWords from 'random-words'

export const config = { runtime: 'edge' }

export default async function Photos(req: NextRequest) {
    if (req.method !== 'GET')
        return cors(req, NextResponse.json({}, { status: 405 }))

    const params = req.nextUrl.searchParams
    const source = params.get('imageSource') || 'unsplash'
    const page = params.get('page') || 1
    const lexica = source === 'lexica'

    const url = lexica
        ? `https://lexica.art/api/v1/search?q=${randomWords({
              seed: `lexica-${page}`,
              exactly: 1,
              wordsPerString: 4,
          }).at(0)}`
        : `https://api.unsplash.com/photos?${params?.toString() ?? ''}`

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
    const results = (lexica ? json?.images : json) || []

    const data = {
        errors: json.errors,
        photos:
            json?.errors?.length > 0
                ? undefined
                : results?.map((photo: any) => ({ ...photo, source })),
        total_photos: lexica ? 10_000 : totalPhotos ?? undefined,
        total_pages: lexica ? 10_000 / 50 : totalPages ?? undefined,
    }

    const headers = { 'X-Api-Latency': `${Date.now() - start}ms` }
    return cors(req, NextResponse.json(data, { status: 200, headers }))
}
