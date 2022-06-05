import { NextRequest } from 'next/server'
import cors from '../../../lib/cors'

export async function middleware(req: NextRequest) {
    // Get download_location from post body
    let url
    try {
        const { download_location } = await req?.json()
        url = download_location
    } catch (e) {
        return new Response(JSON.stringify({}), {
            status: 400,
        })
    }

    if (!url) {
        return new Response(JSON.stringify({}), {
            status: 400,
        })
    }

    // Make sure its a POST request
    if (req.method !== 'POST') {
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

    return cors(
        req,
        new Response(JSON.stringify(await response.json()), {
            headers: {
                'Content-Type': 'application/json',
            },
        }),
    )
}
