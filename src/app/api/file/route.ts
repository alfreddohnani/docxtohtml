import mammoth from "mammoth";

export async function POST(request: Request): Promise<Response> {
  const blob = await request.blob();

  const result = await mammoth.convertToHtml({
    buffer: Buffer.from(await blob.arrayBuffer()),
  });

  const html = result.value; // The generated HTML

  const messages = result.messages;
  console.log({ messages });

  return Response.json({ html });
}
