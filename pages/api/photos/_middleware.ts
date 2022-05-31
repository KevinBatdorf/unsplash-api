import { NextRequest } from 'next/server'

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
    const data = await fetch(url, {
        headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
    })

    // Return data to client
    return new Response(JSON.stringify(await data.json()), {
        headers: {
            'Content-Type': 'application/json',
        },
    })
}
