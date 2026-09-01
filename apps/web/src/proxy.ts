import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    request.nextUrl.pathname = '/dashboard'
    return NextResponse.redirect(request.nextUrl)
  }
}