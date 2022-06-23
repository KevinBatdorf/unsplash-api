import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import initMiddleware from '../../lib/init-middleware'

const cors = initMiddleware(Cors({ methods: ['GET', 'OPTIONS'] }))

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await cors(req, res)

    const params = new URLSearchParams(req.query as { [key: string]: string })
    const url = 'https://api.unsplash.com/photos?' + params?.toString()

    if (req.method !== 'GET') {
        return res.status(405).json({})
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

    return res.status(200).json(data)
}
