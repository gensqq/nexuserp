export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    description: "Get started with basic features",
    features: {
      maxUsers: 3,
      maxProducts: 50,
      maxCustomers: 100,
      aiAssistant: false,
      googleSheets: false,
      prioritySupport: false,
    },
  },
  PRO: {
    name: "Pro",
    price: 29,
    description: "For growing businesses",
    features: {
      maxUsers: 25,
      maxProducts: 1000,
      maxCustomers: 5000,
      aiAssistant: true,
      googleSheets: true,
      prioritySupport: false,
    },
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 99,
    description: "For large organizations",
    features: {
      maxUsers: -1,
      maxProducts: -1,
      maxCustomers: -1,
      aiAssistant: true,
      googleSheets: true,
      prioritySupport: true,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

export function getPlan(plan: string) {
  return PLANS[plan as PlanType] || PLANS.FREE;
}

function getApiKey(): string | null {
  return process.env.PAYMONGO_SECRET_KEY || null;
}

function getAuthHeader(): string {
  const key = getApiKey();
  if (!key) throw new Error("PayMongo not configured");
  return "Basic " + Buffer.from(key + ":").toString("base64");
}

export async function createCheckoutSession(
  companyId: string,
  email: string,
  plan: PlanType
): Promise<string | null> {
  const key = getApiKey();
  if (!key) return null;

  const planConfig = PLANS[plan];
  if (planConfig.price === 0) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

  const response = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      data: {
        attributes: {
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          description: `${planConfig.name} Plan - NexusERP`,
          line_items: [
            {
              name: `${planConfig.name} Plan`,
              quantity: 1,
              amount: planConfig.price * 100, // PayMongo uses centavos
              currency: "PHP",
            },
          ],
          payment_method_types: [
            "gcash",
            "paymaya",
            "grab_pay",
            "card",
            "dob",
          ],
          success_url: `${appUrl}/settings?billing=success`,
          cancel_url: `${appUrl}/checkout?plan=${plan.toLowerCase()}&cancelled=1`,
          metadata: {
            companyId,
            plan,
            email,
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("PayMongo checkout error:", error);
    return null;
  }

  const data = await response.json();
  return data.data?.attributes?.checkout_url || null;
}

export async function createBillingPortal(
  companyId: string
): Promise<string | null> {
  // PayMongo doesn't have a customer portal like Stripe
  // Redirect to settings page instead
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  return `${appUrl}/settings?tab=billing`;
}
