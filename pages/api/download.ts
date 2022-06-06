import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import initMiddleware from '../../lib/init-middleware'

const cors = initMiddleware(
    Cors({
        methods: ['GET', 'POST', 'OPTIONS'],
    }),
)

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await cors(req, res)

    if (!req.body) {
        return res.status(400).json({})
    }

    // Make sure its a POST request
    if (req.method !== 'POST') {
        return res.status(405).json({})
    }

    // Get data from unsplash API
    const response = await fetch(String(req.body), {
        method: 'GET',
        headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
    })

    res.status(200).json(await response.json())
}
