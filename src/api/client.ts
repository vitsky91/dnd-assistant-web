const BASE_URL = 'https://dnd.vitskylab.dev/api/v1'

function getToken(): string | null {
  return localStorage.getItem('jwt_token')
}

interface RequestOptions {
  method?: string
  body?: unknown
  queryParams?: Record<string, string>
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, queryParams } = options

  let url = `${BASE_URL}${path}`
  if (queryParams) {
    const params = new URLSearchParams(queryParams)
    url += `?${params.toString()}`
  }

  const headers: Record<string, string> = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ errors: { detail: res.statusText } }))
    throw Object.assign(new Error(err?.errors?.detail ?? 'Request failed'), {
      status: res.status,
      errors: err?.errors,
    })
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  get: <T>(path: string, queryParams?: Record<string, string>) =>
    request<T>(path, { queryParams }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
}
