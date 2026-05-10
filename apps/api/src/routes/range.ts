export async function handleRange(): Promise<Response> {
  return new Response(
    JSON.stringify({ start: "1940-01-01", end: "2024-12-31" }),
    { headers: { "Content-Type": "application/json" } },
  );
}
