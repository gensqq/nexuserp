import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!user.companyId) {
      return NextResponse.json({ openaiKey: "", anthropicKey: "", hasOpenai: false, hasAnthropic: false });
    }

    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { openaiKey: true, anthropicKey: true },
    });

    const openaiKey = company?.openaiKey || "";
    const anthropicKey = company?.anthropicKey || "";

    return NextResponse.json({
      openaiKey: openaiKey ? "••••••••" + openaiKey.slice(-4) : "",
      anthropicKey: anthropicKey ? "••••••••" + anthropicKey.slice(-4) : "",
      hasOpenai: !!openaiKey,
      hasAnthropic: !!anthropicKey,
    });
  } catch (error) {
    console.error("Get AI settings error:", error);
    return NextResponse.json({ error: "Failed to read settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.companyId) return NextResponse.json({ error: "No company associated" }, { status: 400 });

    const { openaiKey, anthropicKey } = await req.json();

    // Validate key format if provided
    if (openaiKey && openaiKey !== "" && !openaiKey.startsWith("sk-")) {
      return NextResponse.json({ error: "Invalid OpenAI API key format" }, { status: 400 });
    }
    if (anthropicKey && anthropicKey !== "" && !anthropicKey.startsWith("sk-ant-")) {
      return NextResponse.json({ error: "Invalid Anthropic API key format" }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (openaiKey !== undefined) {
      updateData.openaiKey = openaiKey === "" ? null : openaiKey;
    }
    if (anthropicKey !== undefined) {
      updateData.anthropicKey = anthropicKey === "" ? null : anthropicKey;
    }

    await prisma.company.update({
      where: { id: user.companyId },
      data: updateData,
    });

    // Also update process.env for the AI chat to use
    if (openaiKey !== undefined) {
      if (openaiKey === "") {
        delete process.env.OPENAI_API_KEY;
      } else {
        process.env.OPENAI_API_KEY = openaiKey;
      }
    }
    if (anthropicKey !== undefined) {
      if (anthropicKey === "") {
        delete process.env.ANTHROPIC_API_KEY;
      } else {
        process.env.ANTHROPIC_API_KEY = anthropicKey;
      }
    }

    return NextResponse.json({ success: true, message: "API keys saved to your company" });
  } catch (error) {
    console.error("Save AI settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
