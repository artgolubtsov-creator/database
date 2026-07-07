import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, direction = "en-ar" } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "No text provided" }, { status: 400 });

  const apiKey = process.env.TRANSLATEPLEASE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Translation not configured" }, { status: 500 });

  const res = await fetch("https://translateplease.com/api/mcp", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "translateplease_translate",
        arguments: { sourceText: text, direction },
      },
    }),
  });

  const data = await res.json();

  if (data.result?.isError) {
    return NextResponse.json({ error: data.result.content?.[0]?.text ?? "Translation failed" }, { status: 502 });
  }

  const raw: string = data.result?.content?.[0]?.text ?? "";

  // The response starts with the translated text on the first line(s),
  // followed by a blank line and then the structured analysis.
  const blankLineIndex = raw.indexOf("\n\n");
  const translation = blankLineIndex > 0 ? raw.slice(0, blankLineIndex).trim() : raw.trim();

  return NextResponse.json({ translation });
}
