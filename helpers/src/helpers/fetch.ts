export class HttpException extends Error {
  message: string
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.message = message
    this.status = status
  }
}

const request = async (url: RequestInfo, options: Partial<RequestInit>): Promise<Response> => {
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new HttpException(
      response.status,
      `Failed to fetch ${response.url}: ${response.status} ${response.statusText}`
    )
  }

  return response
}

export type FetchJsonOptions<ReqBody> = Partial<Omit<RequestInit, 'body'>> & { body?: ReqBody }

const fetchJson = async <Res, ReqBody = never>(
  url: string | URL,
  options: FetchJsonOptions<ReqBody> = {}
): Promise<Res> => {
  let urlPath = url.toString()
  // let urlPath = '';
  // if (url instanceof URL) {
  //   urlPath = new URL(url, process.env.REACT_APP_API_HOST).toString();
  // } else {
  //   urlPath = `${process.env.REACT_APP_API_HOST}${url}`;
  // }

  const body = options.body === undefined ? undefined : JSON.stringify(options.body)

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await request(urlPath, {
    ...options,
    body,
    headers,
  })

  if (response.status === 204) {
    return undefined as Res
  }

  return response.json()
  // or return response.text().then((text) => (text.length ? JSON.parse(text) : undefined))

  // const data =
  //   response.status !== 204 // Quick return if status code is 204 (No-Content)
  //     ? await response.text().then((text) => (text.length ? JSON.parse(text) : undefined))
  //     : undefined

  // return data as Res
}

export default fetchJson
