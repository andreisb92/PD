import Papa from 'papaparse'

// Load and process the data
let books = []
let ratings = []
let userInfo = []
let copies = []

// Load books data
fetch('/books.csv')
  .then(response => response.text())
  .then(csv => {
    const { data } = Papa.parse(csv, { header: true })
    books = data.map(book => ({
      id: book.book_id,
      title: book.title,
      author: book.authors,
      coverUrl: book.image_url,
      publicationYear: book.original_publication_year,
      averageRating: parseFloat(book.average_rating) || 0,
      language: book.language_code,
      isbn: book.isbn,
      originalTitle: book.original_title
    }))
  })

// Load copies data
fetch('/copies.csv')
  .then(response => response.text())
  .then(csv => {
    const { data } = Papa.parse(csv, { header: true })
    copies = data.map(copy => ({
      copyId: copy.copy_id,
      bookId: copy.book_id
    }))
    // After copies are loaded, load ratings
    fetch('/ratings.csv')
      .then(response => response.text())
      .then(csv => {
        const { data } = Papa.parse(csv, { header: true })
        ratings = data.map(rating => {
          const copy = copies.find(c => c.copyId === rating.copy_id)
          return copy ? {
            userId: rating.user_id,
            bookId: copy.bookId,
            rating: parseFloat(rating.rating)
          } : null
        }).filter(Boolean)
      })
  })

// Load user info data
fetch('/user_info.csv')
  .then(response => response.text())
  .then(csv => {
    const { data } = Papa.parse(csv, { header: true })
    userInfo = data.map(user => ({
      userId: user.user_id,
      gender: user.sexo,
      birthDate: user.fecha_nacimiento,
      preferences: user.comentario
    }))
  })

// Helper function to calculate similarity between users
function calculateUserSimilarity(user1Ratings, user2Ratings) {
  const commonBooks = user1Ratings.filter(r1 => 
    user2Ratings.some(r2 => r2.bookId === r1.bookId)
  )

  if (commonBooks.length === 0) return 0

  let sumSquaredDiff = 0
  commonBooks.forEach(r1 => {
    const r2 = user2Ratings.find(r => r.bookId === r1.bookId)
    sumSquaredDiff += Math.pow(r1.rating - r2.rating, 2)
  })

  return 1 / (1 + Math.sqrt(sumSquaredDiff / commonBooks.length))
}

// Get user information
export async function getUserInfo(userId) {
  if (userInfo.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  return userInfo.find(u => u.userId === userId)
}

// Get user's reading history
export async function getUserHistory(userId) {
  if (ratings.length === 0 || books.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  const userRatings = ratings.filter(r => r.userId === userId)
  return userRatings.map(rating => {
    const book = books.find(b => b.id === rating.bookId)
    return {
      ...book,
      userRating: rating.rating,
      ratingDate: new Date().toISOString() // In a real app, this would come from the database
    }
  }).sort((a, b) => b.userRating - a.userRating)
}

// Get book availability
export async function getBookAvailability(bookId) {
  if (copies.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  const bookCopies = copies.filter(c => c.bookId === bookId)
  return {
    totalCopies: bookCopies.length,
    availableCopies: bookCopies.length // In a real app, this would check loan status
  }
}

// Get recommendations for a user
export async function getRecommendations(userId) {
  // Wait for data to be loaded
  if (books.length === 0 || ratings.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Find user's ratings
  const userRatings = ratings.filter(r => r.userId === userId)
  if (userRatings.length === 0) return []

  // Get user info
  const user = userInfo.find(u => u.userId === userId)

  // Find similar users
  const similarUsers = ratings
    .filter(r => r.userId !== userId)
    .reduce((acc, rating) => {
      if (!acc[rating.userId]) {
        acc[rating.userId] = []
      }
      acc[rating.userId].push(rating)
      return acc
    }, {})

  const userSimilarities = Object.entries(similarUsers).map(([otherUserId, otherUserRatings]) => ({
    userId: otherUserId,
    similarity: calculateUserSimilarity(userRatings, otherUserRatings)
  }))

  // Sort by similarity
  userSimilarities.sort((a, b) => b.similarity - a.similarity)

  // Get top similar users
  const topSimilarUsers = userSimilarities.slice(0, 5)

  // Get books rated by similar users
  const recommendedBooks = new Map()
  topSimilarUsers.forEach(({ userId: similarUserId, similarity }) => {
    const similarUserRatings = ratings.filter(r => r.userId === similarUserId)
    similarUserRatings.forEach(rating => {
      if (!userRatings.some(r => r.bookId === rating.bookId)) {
        const book = books.find(b => b.id === rating.bookId)
        if (book) {
          const existing = recommendedBooks.get(book.id)
          if (existing) {
            existing.score += rating.rating * similarity
            existing.count++
          } else {
            recommendedBooks.set(book.id, {
              ...book,
              score: rating.rating * similarity,
              count: 1
            })
          }
        }
      }
    })
  })

  // Convert to array and calculate final scores
  return Array.from(recommendedBooks.values())
    .map(book => ({
      ...book,
      matchScore: book.score / book.count / 5, // Normalize to 0-1 range
      availability: getBookAvailability(book.id)
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 12) // Return top 12 recommendations
}

// Get most popular books (by number of ratings, with at least 1 rating)
export async function getPopularBooks(limit = 12) {
  if (books.length === 0 || ratings.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  // Count ratings per book
  const ratingCounts = {}
  const ratingSums = {}
  ratings.forEach(r => {
    if (!ratingCounts[r.bookId]) {
      ratingCounts[r.bookId] = 0
      ratingSums[r.bookId] = 0
    }
    ratingCounts[r.bookId]++
    ratingSums[r.bookId] += r.rating
  })
  // Filter books with at least 1 rating (was 5)
  const popularBooks = books
    .filter(b => ratingCounts[b.id] >= 1)
    .map(b => ({
      ...b,
      ratingsCount: ratingCounts[b.id],
      averageRating: ratingSums[b.id] / ratingCounts[b.id]
    }))
    .sort((a, b) => b.ratingsCount - a.ratingsCount || b.averageRating - a.averageRating)
    .slice(0, limit)
  return popularBooks
}

// Get all books with ratings and availability
export async function getAllBooks() {
  if (books.length === 0 || ratings.length === 0 || copies.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  // Count ratings per book
  const ratingCounts = {}
  const ratingSums = {}
  ratings.forEach(r => {
    if (!ratingCounts[r.bookId]) {
      ratingCounts[r.bookId] = 0
      ratingSums[r.bookId] = 0
    }
    ratingCounts[r.bookId]++
    ratingSums[r.bookId] += r.rating
  })
  // Get availability per book
  const availabilityMap = {}
  copies.forEach(c => {
    if (!availabilityMap[c.bookId]) availabilityMap[c.bookId] = 0
    availabilityMap[c.bookId]++
  })
  return books.map(b => ({
    ...b,
    ratingsCount: ratingCounts[b.id] || 0,
    averageRating: ratingCounts[b.id] ? ratingSums[b.id] / ratingCounts[b.id] : 0,
    availableCopies: availabilityMap[b.id] || 0
  }))
} 