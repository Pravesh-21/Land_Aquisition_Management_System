import { NextRequest, NextResponse } from 'next/server';

// ─── Mock User Database (mirrors backend/app/main.py) ────────────────────────
const USER_DATABASE: Record<string, { email: string; password: string; role: string; user: Record<string, string> }> = {
  'agency@gov.in': {
    email: 'agency@gov.in',
    password: 'password123',
    role: 'AGENCY',
    user: { name: 'Sh. Jagdish Deshmukh', designation: 'Project Director', department: 'NHAI - PIU Nagpur', email: 'agency@gov.in' },
  },
  'lao@gov.in': {
    email: 'lao@gov.in',
    password: 'password123',
    role: 'LAO',
    user: { name: 'Smt. Meera Kulkarni', designation: 'Land Acquisition Officer', department: 'Revenue Dept. - Pune Division', email: 'lao@gov.in' },
  },
  'forest@gov.in': {
    email: 'forest@gov.in',
    password: 'password123',
    role: 'FOREST',
    user: { name: 'Dr. Anil Sharma', designation: 'Divisional Forest Officer', department: 'MoEFCC - Western Region', email: 'forest@gov.in' },
  },
  'collector@gov.in': {
    email: 'collector@gov.in',
    password: 'password123',
    role: 'COLLECTOR',
    user: { name: 'Sh. Ramesh Kumar, IAS', designation: 'District Collector', department: 'District Administration - Nagpur', email: 'collector@gov.in' },
  },
  'tehsildar@gov.in': {
    email: 'tehsildar@gov.in',
    password: 'password123',
    role: 'TEHSILDAR',
    user: { name: 'Sh. Vikram Singh', designation: 'Tehsildar', department: 'Revenue Court - Sikar Tehsil', email: 'tehsildar@gov.in' },
  },
  'citizen@gov.in': {
    email: 'citizen@gov.in',
    password: 'password123',
    role: 'CITIZEN',
    user: { name: 'Sh. Rajendra Patel', designation: 'Landowner', department: 'Citizen G2C', aadhaar: 'XXXX XXXX 4920', email: 'citizen@gov.in' },
  },
};

// Role detection from identifier string
function detectRole(id: string): string {
  const lower = id.toLowerCase();
  if (lower.includes('lao') || lower.includes('revenue')) return 'LAO';
  if (lower.includes('forest') || lower.includes('moefcc')) return 'FOREST';
  if (lower.includes('collector') || lower.includes('district')) return 'COLLECTOR';
  if (lower.includes('tehsildar') || lower.includes('court')) return 'TEHSILDAR';
  if (lower.includes('citizen')) return 'CITIZEN';
  return 'AGENCY';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = (body.email_or_id || '').trim().toLowerCase();
    const providedPassword = body.password_or_otp || '';

    if (!identifier || !providedPassword) {
      return NextResponse.json({ detail: 'User ID and password are required.' }, { status: 422 });
    }

    // Check known users first
    if (identifier in USER_DATABASE) {
      const record = USER_DATABASE[identifier];
      const validPass = record.password === providedPassword || providedPassword === 'password123' || providedPassword === '123456';
      if (!validPass) {
        return NextResponse.json({ detail: 'Invalid password provided for this account.' }, { status: 401 });
      }
      return NextResponse.json({
        status: 'success',
        message: 'Authentication successful. User authorized from database.',
        token: `jwt-token-verified-${record.role.toLowerCase()}`,
        role: record.role,
        user: record.user,
      });
    }

    // Unknown user — infer role from identifier and allow any password (demo mode)
    const role = detectRole(identifier);
    return NextResponse.json({
      status: 'success',
      message: 'Authentication successful (demo mode).',
      token: `jwt-token-demo-${role.toLowerCase()}`,
      role,
      user: { name: identifier, designation: role, department: 'Government of India', email: identifier },
    });
  } catch {
    return NextResponse.json({ detail: 'Invalid request body.' }, { status: 400 });
  }
}

// Handle CORS preflight
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
