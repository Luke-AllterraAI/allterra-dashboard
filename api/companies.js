const QUERY = `
  query {
    companies(
      orderBy: { name: AscNullsLast }
      first: 50
    ) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const apiUrl = process.env.TWENTY_API_URL
  const apiKey = process.env.TWENTY_API_KEY

  if (!apiUrl || !apiKey) {
    return res.status(500).json({ error: 'TWENTY_API_URL and TWENTY_API_KEY must be set' })
  }

  try {
    const response = await fetch(`${apiUrl}/api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query: QUERY }),
    })

    if (!response.ok) throw new Error(`Twenty API error: ${response.status}`)

    const data = await response.json()
    if (data.errors) throw new Error(data.errors[0]?.message || 'GraphQL error')

    const companies = data.data?.companies?.edges?.map(e => e.node) ?? []
    res.status(200).json(companies)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
