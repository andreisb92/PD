import React, { useState, useEffect } from 'react';
import { FaBook, FaStar, FaUser, FaCalendarAlt, FaLanguage, FaBookOpen, FaInfoCircle } from 'react-icons/fa';
import { getRecommendations } from '../services/recommendationService';

const Recommendations = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRecommendations(userId);
        setRecommendations(data);
      } catch (err) {
        setError('Error al cargar las recomendaciones. Por favor, intenta de nuevo.');
        console.error('Error loading recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadRecommendations();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Cargando recomendaciones...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <FaBook className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No hay recomendaciones disponibles</h3>
        <p className="mt-1 text-gray-500">Intenta con otro ID de usuario o vuelve más tarde.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recommendations.map((book) => (
        <div
          key={book.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="aspect-w-2 aspect-h-3">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                }}
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                <FaBook className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{book.title}</h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <FaUser className="mr-1" />
              <span className="line-clamp-1">{book.author}</span>
            </div>
            {book.publicationYear && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <FaCalendarAlt className="mr-1" />
                <span>{book.publicationYear}</span>
              </div>
            )}
            {book.language && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <FaLanguage className="mr-1" />
                <span>{book.language}</span>
              </div>
            )}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <FaStar className="h-5 w-5 text-yellow-400" />
                <span className="ml-1 text-sm font-medium text-gray-900">
                  {book.averageRating.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${book.matchScore * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {Math.round(book.matchScore * 100)}%
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <FaBookOpen className="mr-1" />
                  <span>Disponibles: {book.availability?.availableCopies || 0}</span>
                </div>
                <button
                  onClick={() => setSelectedBook(book)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                >
                  <FaInfoCircle className="mr-1" />
                  Más detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedBook.title}</h2>
              <button
                onClick={() => setSelectedBook(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {selectedBook.coverUrl ? (
                  <img
                    src={selectedBook.coverUrl}
                    alt={selectedBook.title}
                    className="w-full rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg flex items-center justify-center">
                    <FaBook className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Autor</h3>
                    <p className="mt-1 text-gray-900">{selectedBook.author}</p>
                  </div>
                  {selectedBook.originalTitle && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Título Original</h3>
                      <p className="mt-1 text-gray-900">{selectedBook.originalTitle}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Año de Publicación</h3>
                    <p className="mt-1 text-gray-900">{selectedBook.publicationYear}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Idioma</h3>
                    <p className="mt-1 text-gray-900">{selectedBook.language}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">ISBN</h3>
                    <p className="mt-1 text-gray-900">{selectedBook.isbn}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Disponibilidad</h3>
                    <p className="mt-1 text-gray-900">
                      {selectedBook.availability?.availableCopies || 0} de {selectedBook.availability?.totalCopies || 0} ejemplares disponibles
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Calificación Promedio</h3>
                    <div className="mt-1 flex items-center">
                      <FaStar className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 text-gray-900">{selectedBook.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations; 