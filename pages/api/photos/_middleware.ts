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

    const totalPages = Number(response.headers.get('x-total') ?? -1)
    const perPage = Number(response.headers.get('x-per-page') ?? -1)
    const remaingingPages = Math.floor(totalPages / perPage)

    const data = {
        photos: await response.json(),
        total_pages: totalPages,
        remaining_pages: remaingingPages,
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
