import { NextRequest, NextResponse } from 'next/server'
import cors from '../../../lib/cors'
import randomWords from 'random-words'

export const config = { runtime: 'edge' }
export default async function SearchPhotos(req: NextRequest) {
    if (req.method !== 'GET')
        return cors(req, NextResponse.json({}, { status: 405 }))

    const params = req.nextUrl.searchParams
    const q = params.get('query')
    const source = params.get('imageSource') || 'unsplash'
    const lexica = source === 'lexica'
    const page = params.get('page') || 1

    // If lexica, we can fake pagination by just adding a ranodm word to the end of the query
    const url = lexica
        ? `https://lexica.art/api/v1/search?q=${q}${
              Number(page) > 1
                  ? ` ${randomWords({
                        seed: `lexica-${q}-${page}-search`,
                        exactly: 1,
                        wordsPerString: 4,
                    }).at(0)}`
                  : ''
          }`
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
                {
                    message: `Too many requests. Please wait ${
                        response.headers.get('retry-after') || 'a few'
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
    const results = (lexica ? json?.images : json?.results) || []

    const data = {
        errors: json.errors,
        // This endpoint returns json.results
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
