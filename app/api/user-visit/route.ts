import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { visitorId } = await req.json();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingVisit = await prisma.visit.findFirst({
      where: { date: today, visitors: { has: visitorId } },
    });

    if (existingVisit) {
      return NextResponse.json({ success: true, message: "Visit already logged today." }, { status: 200 });
    }

    const userAgent = req.headers.get("user-agent") || "";
    const isMobile = /mobile/i.test(userAgent);

    await prisma.visit.upsert({
      where: { date: today },
      update: {
        desktopVisits: isMobile ? undefined : { increment: 1 },
        mobileVisits: isMobile ? { increment: 1 } : undefined,
        visitors: { push: visitorId },
      },
      create: {
        date: today,
        desktopVisits: isMobile ? 0 : 1,
        mobileVisits: isMobile ? 1 : 0,
        visitors: [visitorId],
      },
    });

    return NextResponse.json({ success: true, message: "Visit logged successfully." }, { status: 200 });
  } catch {
    return NextResponse.error();
  }
}
