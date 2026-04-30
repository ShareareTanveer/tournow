import { NextResponse } from 'next/server'

// Admin user creation is done via the /admin/staff panel, not self-registration.
// Customer registration goes through /api/customer/register.
export async function POST() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
