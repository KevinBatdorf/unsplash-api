import { NextRequest } from 'next/server'
import cors from '../../../lib/cors'

export async function middleware(req: NextRequest) {
    const params = req.nextUrl.searchParams
    const url = 'https://api.unsplash.com/photos?' + params

    // Make sure its a GET request
    if (req.method !== 'GET') {
        return new Response(JSON.stringify({}), {
            status: 405,
        })
    }

    // Get data from unsplash API
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
        photos: json?.errors?.length > 0 ? undefined : json,
        total_photos: totalPhotos ?? undefined,
        total_pages: totalPages ?? undefined,
    }

    // Return data to client with cors headers
    return cors(
        req,
        new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
            },
        }),
    )
}
