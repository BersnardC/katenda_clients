import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  console.log("[revalidate] hit", {
    secretMatch: secret === process.env.NEXT_REVALIDATE_SECRET,
    hasEnvSecret: !!process.env.NEXT_REVALIDATE_SECRET,
  });

  if (secret !== process.env.NEXT_REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    console.log("[revalidate] failed to parse body");
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { tags } = body as { tags?: unknown };
  console.log("[revalidate] tags:", tags);

  if (!Array.isArray(tags)) {
    return NextResponse.json({ error: "tags[] required" }, { status: 400 });
  }

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  console.log("[revalidate] done:", tags);
  return NextResponse.json({ revalidated: tags, timestamp: Date.now() });
}
