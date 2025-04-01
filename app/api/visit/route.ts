import { Visit } from '@prisma/client';
import { prisma } from "@/lib/prisma";
import { serialize, parse } from 'cookie';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { NextResponse, NextRequest } from 'next/server';

const SECRET_KEY = process.env.JWT_SECRET;

interface VisitResponse {
  message: string;
  deviceType: 'mobile' | 'desktop';
  visitRecord: Visit;
  token: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<VisitResponse | { error: string }>> {
  if (!SECRET_KEY) {
    return NextResponse.json({ error: 'JWT_SECRET is not defined' }, { status: 500 });
  }

  const { token } = await req.json() as { token?: string };
  const cookies = parse(req.headers.get('cookie') || '');
  let visitorId: string | undefined = cookies.visitor_id;

  if (token) {
    return NextResponse.json({ message: 'Session active, no new visit recorded', deviceType: 'desktop', visitRecord: {} as Visit, token: "" }, { status: 200 });
  }

  if (!visitorId) {
    visitorId = uuidv4();
  }

  const userAgent = req.headers.get('user-agent');
  const isMobile = /Mobi|Android|iPhone/i.test(userAgent || '');

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let visitRecord: Visit = await prisma.visit.upsert({
    where: { date: today },
    update: {
      [isMobile ? 'mobileVisits' : 'desktopVisits']: { increment: 1 },
      visitors: { push: visitorId },
    },
    create: {
      date: today,
      mobileVisits: isMobile ? 1 : 0,
      desktopVisits: isMobile ? 0 : 1,
      visitors: [visitorId],
    },
  });

  const sessionToken = jwt.sign({ visitorId, device: isMobile ? 'mobile' : 'system' }, SECRET_KEY, {
    expiresIn: '1h',
  });

  const response = NextResponse.json({
    message: 'Visit recorded',
    deviceType: isMobile ? 'mobile' : 'desktop',
    visitRecord,
    token: sessionToken,
  }, { status: 200 });

  if (!cookies.visitor_id) {
    response.cookies.set({
      name: 'visitor_id',
      value: visitorId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}
