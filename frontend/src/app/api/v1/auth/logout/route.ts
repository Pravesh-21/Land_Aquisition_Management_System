import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    status: 'success',
    message: 'Logged out successfully',
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
