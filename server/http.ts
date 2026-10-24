export const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } })

export const fail = (error: string, status: number) => json({ ok: false, error }, status)

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}
