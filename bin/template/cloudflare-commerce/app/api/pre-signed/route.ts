import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID as string
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID as string
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY as string
const BUCKET_NAME = process.env.R2_BUCKET_NAME as string

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
})

// Get Pre-Signed URL for Upload
export async function POST(request: NextRequest) {
  const { filename, contentType, path }: { filename: string; contentType: string; path?: string } = await request.json()

  try {
    const key = path ? `${path}/${filename}` : filename
    const url = await getSignedUrl(
      S3,
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      }),
      {
        expiresIn: 60 * 60 * 24 * 7, // 7d
      },
    )
    return Response.json({ url, key })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// Get Pre-Signed URL for Download
export async function GET(request: NextRequest) {
  const filename = request.nextUrl.searchParams.get('filename') as string
  try {
    const url = await getSignedUrl(
      S3,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename,
      }),
      {
        expiresIn: 600,
      },
    )
    return Response.json({ url })
  } catch (error: any) {
    return Response.json({ error: error.message })
  }
}
