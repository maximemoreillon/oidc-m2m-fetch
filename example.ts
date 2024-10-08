import dotenv from "dotenv"
import Client from "."

dotenv.config()

const {
  OIDC_CLIENT_ID,
  OIDC_CLIENT_SECRET,
  OIDC_TOKEN_URL,
  OIDC_AUDIENCE,
  TARGET_ENDPOINT_URL = "http://localhost:8080",
} = process.env

if (!OIDC_CLIENT_ID || !OIDC_CLIENT_SECRET || !OIDC_TOKEN_URL)
  throw new Error("Misconfigured auth")

const client = new Client({
  client_id: OIDC_CLIENT_ID,
  client_secret: OIDC_CLIENT_SECRET,
  token_url: OIDC_TOKEN_URL,
  audience: OIDC_AUDIENCE,
})

async function main() {
  const response = await client.fetch(TARGET_ENDPOINT_URL)
  console.log(response.ok)
}

main()
