import { useState, useEffect } from 'react';
import { FaBook, FaHistory, FaHeart, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('current');
  const [loans, setLoans] = useState([]);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [loansRes, historyRes, favoritesRes] = await Promise.all([
          fetch('/api/loans/current'),
          fetch('/api/loans/history'),
          fetch('/api/favorites')
        ]);

        const [loansData, historyData, favoritesData] = await Promise.all([
          loansRes.json(),
          historyRes.json(),
          favoritesRes.json()
        ]);

        setLoans(loansData);
        setHistory(historyData);
        setFavorites(favoritesData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleReturn = async (loanId) => {
    try {
      await fetch(`/api/loans/${loanId}/return`, { method: 'POST' });
      setLoans(loans.filter(loan => loan.id !== loanId));
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  const handleRemoveFavorite = async (bookId) => {
    try {
      await fetch(`/api/favorites/${bookId}`, { method: 'DELETE' });
      setFavorites(favorites.filter(fav => fav.id !== bookId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* User Profile Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-600">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="ml-auto flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <FaSignOutAlt className="mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('current')}
            className={`${
              activeTab === 'current'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <FaBook className="mr-2" />
            Préstamos Actuales
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <FaHistory className="mr-2" />
            Historial
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`${
              activeTab === 'favorites'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <FaHeart className="mr-2" />
            Favoritos
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`${
              activeTab === 'preferences'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <FaCog className="mr-2" />
            Preferencias
          </button>
        </nav>
      </div>

      {/* Content Sections */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'current' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Préstamos Actuales</h2>
            {loans.length === 0 ? (
              <p className="text-gray-500">No tienes préstamos activos.</p>
            ) : (
              <div className="space-y-4">
                {loans.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{loan.book.title}</h3>
                      <p className="text-sm text-gray-500">
                        Fecha de préstamo: {new Date(loan.borrowDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Fecha de devolución: {new Date(loan.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleReturn(loan.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Devolver
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Historial de Préstamos</h2>
            {history.length === 0 ? (
              <p className="text-gray-500">No hay historial de préstamos.</p>
            ) : (
              <div className="space-y-4">
                {history.map((loan) => (
                  <div key={loan.id} className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">{loan.book.title}</h3>
                    <p className="text-sm text-gray-500">
                      Fecha de préstamo: {new Date(loan.borrowDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Fecha de devolución: {new Date(loan.returnDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Libros Favoritos</h2>
            {favorites.length === 0 ? (
              <p className="text-gray-500">No tienes libros favoritos.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((book) => (
                  <div key={book.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{book.title}</h3>
                        <p className="text-sm text-gray-500">{book.author}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFavorite(book.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FaHeart className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Preferencias</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Géneros Preferidos
                </label>
                <div className="mt-2 space-y-2">
                  {['Ficción', 'No Ficción', 'Ciencia Ficción', 'Fantasía', 'Misterio', 'Romance'].map((genre) => (
                    <label key={genre} className="inline-flex items-center mr-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-600">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notificaciones
                </label>
                <div className="mt-2 space-y-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Recordatorios de devolución
                    </span>
                  </label>
                  <br />
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Nuevas recomendaciones
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Guardar Preferencias
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 