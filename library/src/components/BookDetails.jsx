import { useState } from 'react';
import { FaStar, FaBookOpen, FaCalendarAlt, FaLanguage, FaUser, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

export default function BookDetails({ book, onClose, onBorrow, onRate }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    onRate({ rating, review });
    setRating(0);
    setReview('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Cerrar</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                }}
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg flex items-center justify-center">
                <FaBookOpen className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{book.title}</h2>
              <p className="text-xl text-gray-600 mt-2">{book.author}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Año de Publicación</h3>
                <p className="mt-1 text-gray-900">{book.publicationYear}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Idioma</h3>
                <p className="mt-1 text-gray-900">{book.language}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">ISBN</h3>
                <p className="mt-1 text-gray-900">{book.isbn}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Disponibilidad</h3>
                <p className="mt-1 text-gray-900">
                  {book.availability?.availableCopies || 0} de {book.availability?.totalCopies || 0} ejemplares disponibles
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Calificación Promedio</h3>
              <div className="mt-1 flex items-center">
                <FaStar className="h-5 w-5 text-yellow-400" />
                <span className="ml-1 text-gray-900">{book.averageRating?.toFixed(1) || '0.0'} ({book.ratingsCount || 0} valoraciones)</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onBorrow}
                disabled={!book.availability?.availableCopies}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reservar
              </button>
            </div>

            {/* Rating and Review Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Deja tu valoración</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Calificación</label>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="focus:outline-none"
                      >
                        <FaStar
                          className={`h-8 w-8 ${
                            star <= (hoveredRating || rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="review" className="block text-sm font-medium text-gray-700">
                    Reseña
                  </label>
                  <textarea
                    id="review"
                    rows={4}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Escribe tu reseña..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={!rating}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar Valoración
                </button>
              </form>
            </div>

            {/* Reviews List */}
            {book.reviews && book.reviews.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Reseñas</h3>
                <div className="space-y-4">
                  {book.reviews.map((review, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FaUser className="h-5 w-5 text-gray-400" />
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {review.userName}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FaStar className="h-4 w-4 text-yellow-400" />
                          <span className="ml-1 text-sm text-gray-600">{review.rating}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{review.text}</p>
                      <div className="mt-2 flex items-center space-x-4">
                        <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                          <FaThumbsUp className="h-4 w-4 mr-1" />
                          {review.likes}
                        </button>
                        <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                          <FaThumbsDown className="h-4 w-4 mr-1" />
                          {review.dislikes}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 