const QUERY = `
  query GetOpportunities($companyId: ID!, $startDate: DateTime!) {
    opportunities(
      filter: {
        companyId: { eq: $companyId }
        createdAt: { gte: $startDate }
      }
      orderBy: { createdAt: DescNullsLast }
      first: 500
    ) {
      edges {
        node {
          id
          name
          stage
          createdAt
          pointOfContact {
            id
            name { firstName lastName }
            phones { primaryPhoneNumber }
          }
        }
      }
    }
  }
`

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { companyId, startDate } = req.query
  if (!companyId) return res.status(400).json({ error: 'companyId is required' })

  const apiUrl = process.env.TWENTY_API_URL
  const apiKey = process.env.TWENTY_API_KEY

  if (!apiUrl || !apiKey) {
    return res.status(500).json({ error: 'TWENTY_API_URL and TWENTY_API_KEY must be set' })
  }

  const now = new Date()
  const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  try {
    const response = await fetch(`${apiUrl}/api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { companyId, startDate: start },
      }),
    })

    if (!response.ok) throw new Error(`Twenty API error: ${response.status}`)

    const data = await response.json()
    if (data.errors) throw new Error(data.errors[0]?.message || 'GraphQL error')

    const opportunities = data.data?.opportunities?.edges?.map(e => e.node) ?? []
    res.status(200).json(opportunities)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
