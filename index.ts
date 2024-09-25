import jwt from "jsonwebtoken"

type ContentType = "application/json" | "application/x-www-form-urlencoded"

type Options = {
  token_url: string
  conten_type?: ContentType
  client_id: string
  client_secret: string
  audience?: string
  grant_type?: string
}

export default class {
  access_token?: string

  token_url: string
  conten_type: ContentType

  tokenFetchBody: {
    client_id: string
    client_secret: string
    audience?: string
    grant_type: string
  }

  constructor(options: Options) {
    const {
      token_url,
      conten_type = "application/json",
      grant_type = "client_credentials",
      client_id,
      client_secret,
      audience,
    } = options

    this.token_url = token_url
    this.conten_type = conten_type
    this.tokenFetchBody = { client_id, client_secret, audience, grant_type }
  }

  async fetchToken() {
    const init: RequestInit = {
      method: "POST",
      headers: {
        "content-type": this.conten_type,
      },
    }

    // Auth0 uses JSON, Keycloak uses x-www-form-urlencoded
    if (this.conten_type === "application/json")
      init.body = JSON.stringify(this.tokenFetchBody)
    else {
      init.body = Object.entries(this.tokenFetchBody)
        .map((e) => e.join("="))
        .join("&")
    }

    const response = await fetch(this.token_url, init)

    const { access_token } = (await response.json()) as any

    this.access_token = access_token
  }

  async fetch(input: string | URL, init: RequestInit = {}) {
    if (!this.access_token) await this.fetchToken()
    if (!this.access_token) throw new Error("Access token not available")

    const { exp }: any = jwt.decode(this.access_token)
    const now = new Date().getTime() / 1000

    if (now > exp) {
      await this.fetchToken()
      if (!this.access_token) throw new Error("Access token not available")
    }

    init.headers = {
      ...init.headers,
      authorization: `Bearer ${this.access_token}`,
    }

    return await fetch(input, init)
  }
}
