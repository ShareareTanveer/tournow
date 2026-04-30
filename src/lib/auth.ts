import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET!

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string }
  } catch {
    return null
  }
}

export async function getAuthUser(req: NextRequest) {
  const token =
    req.cookies.get('auth_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  })

  if (!user || !user.isActive) return null
  // CUSTOMER role users are managed via the Customer table, not the admin system
  if (user.role === 'CUSTOMER') return null
  return user
}

export function requireAuth(roles?: string[]) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req)
    if (!user) return { error: 'Unauthorized', status: 401 }
    if (roles && !roles.includes(user.role)) return { error: 'Forbidden', status: 403 }
    return { user }
  }
}

export async function getCustomerUser(req: NextRequest) {
  const token = req.cookies.get('customer_token')?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'CUSTOMER') return null

  const customer = await prisma.customer.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, phone: true, isActive: true },
  })

  if (!customer || !customer.isActive) return null
  return customer
}
