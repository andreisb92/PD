import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import BookList from './components/BookList';
import Recommendations from './components/Recommendations';
import UserList from './components/UserList';
import CopyList from './components/CopyList';
import RatingList from './components/RatingList';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserDashboard from './components/UserDashboard';
import AdvancedSearch from './components/AdvancedSearch';
import BookDetails from './components/BookDetails';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { notificationService } from './services/notificationService';
import { FaBook, FaSearch, FaUser, FaStar, FaHistory, FaBookOpen, FaCalendarAlt, FaLanguage } from 'react-icons/fa';
import './App.css';

function AppContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedBook, setSelectedBook] = useState(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});

  const handleBookClick = (book) => {
    setSelectedBook(book);
  };

  const handleCloseBookDetails = () => {
    setSelectedBook(null);
  };

  const handleBorrow = async (bookId) => {
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId }),
      });

      if (!response.ok) {
        throw new Error('Failed to borrow book');
      }

      const data = await response.json();
      
      // Send loan confirmation notification
      notificationService.sendNotification(
        user.id,
        'LOAN_CONFIRMATION',
        {
          userName: user.name,
          bookTitle: selectedBook.title,
          borrowDate: data.borrowDate,
          dueDate: data.dueDate,
        }
      );

      // Schedule return reminder
      const reminderDate = new Date(data.dueDate);
      reminderDate.setDate(reminderDate.getDate() - 2); // 2 days before due date
      
      notificationService.scheduleNotification(
        user.id,
        'RETURN_REMINDER',
        {
          userName: user.name,
          bookTitle: selectedBook.title,
          dueDate: data.dueDate,
        },
        reminderDate
      );

      setSelectedBook(null);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error borrowing book:', error);
    }
  };

  const handleRate = async (ratingData) => {
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: selectedBook.id,
          rating: ratingData.rating,
          review: ratingData.review,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      setSelectedBook(null);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">
                Biblioteca
              </Link>
              <nav className="ml-10 space-x-4">
                <Link to="/" className="text-gray-600 hover:text-gray-900">
                  Inicio
                </Link>
                {user && (
                  <>
                    <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                      Mi Cuenta
                    </Link>
                    <Link to="/recommendations" className="text-gray-600 hover:text-gray-900">
                      Recomendaciones
                    </Link>
                  </>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-600">Hola, {user.name}</span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">Catálogo de Libros</h1>
                    <button
                      onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                      {showAdvancedSearch ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                    </button>
                  </div>
                  {showAdvancedSearch && (
                    <AdvancedSearch
                      onSearch={setSearchFilters}
                      className="mb-6"
                    />
                  )}
                </div>
                <BookList
                  onBookClick={handleBookClick}
                  filters={searchFilters}
                />
              </>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UserList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/copies"
            element={
              <ProtectedRoute>
                <CopyList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ratings"
            element={
              <ProtectedRoute>
                <RatingList />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Book Details Modal */}
      {selectedBook && (
        <BookDetails
          book={selectedBook}
          onClose={handleCloseBookDetails}
          onBorrow={handleBorrow}
          onRate={handleRate}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
