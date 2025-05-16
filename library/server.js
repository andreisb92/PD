import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { getRecommendationsEndpoint } from './src/api/recommendations.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = 3000

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')))

// API endpoints
app.get('/api/recommendations/:userId', getRecommendationsEndpoint)

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
}) 