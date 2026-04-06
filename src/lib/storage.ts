/**
 * Unified media upload handler.
 * Reads STORAGE_PROVIDER from env: "local" | "s3" | "cloudinary"
 * Returns a public URL for the uploaded file.
 */

import path from 'path'
import { randomUUID } from 'crypto'

export type UploadResult = {
  url: string
  filename: string
  storage: 'local' | 's3' | 'cloudinary'
}

const PROVIDER = (process.env.STORAGE_PROVIDER ?? 'local') as 'local' | 's3' | 'cloudinary'

function ext(originalName: string) {
  return path.extname(originalName).toLowerCase()
}

function uniqueName(originalName: string) {
  return `${randomUUID()}${ext(originalName)}`
}

// ─── LOCAL ────────────────────────────────────────────────────────────────────

async function uploadLocal(buffer: Buffer, originalName: string, folder = 'uploads'): Promise<UploadResult> {
  const fs = await import('fs/promises')
  const uploadDir = path.join(process.cwd(), 'public', folder)
  await fs.mkdir(uploadDir, { recursive: true })

  const filename = uniqueName(originalName)
  await fs.writeFile(path.join(uploadDir, filename), buffer)

  const baseUrl = process.env.UPLOAD_BASE_URL ?? `/${folder}`
  return { url: `${baseUrl}/${filename}`, filename, storage: 'local' }
}

// ─── S3 ───────────────────────────────────────────────────────────────────────

async function uploadS3(buffer: Buffer, originalName: string, folder = 'uploads'): Promise<UploadResult> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
  const mime = await import('mime-types')

  const client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  const filename = `${folder}/${uniqueName(originalName)}`
  const contentType = mime.lookup(originalName) || 'application/octet-stream'

  await client.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  }))

  const url = `${process.env.AWS_S3_BASE_URL}/${filename}`
  return { url, filename, storage: 's3' }
}

// ─── CLOUDINARY ───────────────────────────────────────────────────────────────

async function uploadCloudinary(buffer: Buffer, originalName: string, folder = 'metro-voyage'): Promise<UploadResult> {
  const cloudinary = await import('cloudinary')
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.v2.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error || !result) reject(error)
        else resolve(result as { secure_url: string; public_id: string })
      }
    ).end(buffer)
  })

  return { url: result.secure_url, filename: result.public_id, storage: 'cloudinary' }
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  folder?: string
): Promise<UploadResult> {
  switch (PROVIDER) {
    case 's3':          return uploadS3(buffer, originalName, folder)
    case 'cloudinary':  return uploadCloudinary(buffer, originalName, folder)
    default:            return uploadLocal(buffer, originalName, folder)
  }
}

export async function uploadFromFormData(formData: FormData, fieldName = 'file', folder?: string): Promise<UploadResult> {
  const file = formData.get(fieldName) as File | null
  if (!file) throw new Error('No file in form data')

  const buffer = Buffer.from(await file.arrayBuffer())
  return uploadFile(buffer, file.name, folder)
}
