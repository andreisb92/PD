import { getRecommendations } from '../services/recommendationService'

export async function getRecommendationsEndpoint(req, res) {
  try {
    const userId = req.params.userId
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const recommendations = await getRecommendations(userId)
    res.json(recommendations)
  } catch (error) {
    console.error('Error getting recommendations:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
} 