import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get("paymongo-signature");
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

    // In production, verify webhook signature
    if (webhookSecret && sig) {
      // PayMongo signature verification would go here
      // For now, we trust the webhook in dev
    }

    const event = JSON.parse(body);
    await handleEvent(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleEvent(event: any) {
  const eventType = event.data?.attributes?.type;
  const data = event.data?.attributes?.data;

  switch (eventType) {
    case "checkout.session.payment.paid": {
      const metadata = data?.attributes?.metadata;
      const companyId = metadata?.companyId;
      const plan = metadata?.plan;

      if (companyId && plan) {
        await prisma.company.update({
          where: { id: companyId },
          data: {
            plan,
            paymongoCustomerId: data?.attributes?.customer_id || null,
          },
        });
        console.log(`Company ${companyId} upgraded to ${plan}`);
      }
      break;
    }

    case "checkout.session.expired": {
      const metadata = data?.attributes?.metadata;
      console.log("Checkout session expired for:", metadata?.companyId);
      break;
    }

    case "payment.paid": {
      // Handle direct payment events if needed
      const metadata = data?.attributes?.metadata;
      if (metadata?.companyId && metadata?.plan) {
        await prisma.company.update({
          where: { id: metadata.companyId },
          data: { plan: metadata.plan },
        });
      }
      break;
    }

    default:
      console.log("Unhandled PayMongo event:", eventType);
  }
}
