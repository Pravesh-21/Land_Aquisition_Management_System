import { NextRequest, NextResponse } from 'next/server';

const ROLE_USER_MAP: Record<string, { email: string; full_name: string; roles: string[]; permissions: string[]; departments: string[]; designation: string }> = {
  AGENCY: {
    email: 'agency@gov.in',
    full_name: 'Sh. Jagdish Deshmukh',
    roles: ['AGENCY'],
    permissions: ['all'],
    departments: ['NHAI - PIU Nagpur'],
    designation: 'Project Director',
  },
  LAO: {
    email: 'lao@gov.in',
    full_name: 'Smt. Meera Kulkarni',
    roles: ['LAO'],
    permissions: ['all'],
    departments: ['Revenue Dept. - Pune Division'],
    designation: 'Land Acquisition Officer',
  },
  FOREST: {
    email: 'forest@gov.in',
    full_name: 'Dr. Anil Sharma',
    roles: ['FOREST'],
    permissions: ['all'],
    departments: ['MoEFCC - Western Region'],
    designation: 'Divisional Forest Officer',
  },
  COLLECTOR: {
    email: 'collector@gov.in',
    full_name: 'Sh. Ramesh Kumar, IAS',
    roles: ['COLLECTOR'],
    permissions: ['all'],
    departments: ['District Administration - Nagpur'],
    designation: 'District Collector',
  },
  TEHSILDAR: {
    email: 'tehsildar@gov.in',
    full_name: 'Sh. Vikram Singh',
    roles: ['TEHSILDAR'],
    permissions: ['all'],
    departments: ['Revenue Court - Sikar Tehsil'],
    designation: 'Tehsildar',
  },
  CITIZEN: {
    email: 'citizen@gov.in',
    full_name: 'Sh. Rajendra Patel',
    roles: ['CITIZEN'],
    permissions: ['all'],
    departments: ['Citizen G2C'],
    designation: 'Landowner',
  },
};

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim().toLowerCase();

  let roleKey = 'AGENCY';
  if (token.includes('lao')) roleKey = 'LAO';
  else if (token.includes('forest')) roleKey = 'FOREST';
  else if (token.includes('collector')) roleKey = 'COLLECTOR';
  else if (token.includes('tehsildar')) roleKey = 'TEHSILDAR';
  else if (token.includes('citizen')) roleKey = 'CITIZEN';

  const user = ROLE_USER_MAP[roleKey] || ROLE_USER_MAP.AGENCY;
  return NextResponse.json(user);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
