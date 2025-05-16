import { useState, useEffect } from "react";
import Papa from "papaparse";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { FaBook, FaStar, FaBookOpen } from "react-icons/fa";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/books.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setBooks(results.data);
            setFilteredBooks(results.data);
            setLoading(false);
          },
        });
      });
  }, []);

  useEffect(() => {
    let filtered = books;
    if (searchTerm) {
      filtered = filtered.filter(book => 
        (book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         book.author?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (languageFilter) {
      filtered = filtered.filter(book => book.language === languageFilter);
    }
    if (yearFilter) {
      filtered = filtered.filter(book => book.publicationYear === yearFilter);
    }
    setFilteredBooks(filtered);
  }, [searchTerm, languageFilter, yearFilter, books]);

  // Get unique languages and years for filters
  const languages = Array.from(new Set(books.map(b => b.language).filter(Boolean)));
  const years = Array.from(new Set(books.map(b => b.publicationYear).filter(Boolean)));

  // Sort by ratingsCount and show only top 10
  const sortedBooks = [...filteredBooks]
    .sort((a, b) => Number(b.ratingsCount || 0) - Number(a.ratingsCount || 0))
    .slice(0, 10);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📚 Catálogo de Libros</h2>
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Buscar por título o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
        </div>
        <select
          className="p-2 border rounded-lg"
          value={languageFilter}
          onChange={e => setLanguageFilter(e.target.value)}
        >
          <option value="">Todos los idiomas</option>
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        <select
          className="p-2 border rounded-lg"
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
        >
          <option value="">Todos los años</option>
          {years.sort().map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedBooks.map((book, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow flex flex-col">
            {book.image_url ? (
              <img
                src={book.image_url}
                alt={book.title}
                className="w-full h-48 object-cover rounded mb-2"
                onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150x200?text=No+Image'; }}
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center mb-2">
                <FaBook className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
            <p className="text-gray-600 mb-1">Autor: {book.author}</p>
            <p className="text-sm text-gray-500 mb-1">Año: {book.publicationYear} | Idioma: {book.language}</p>
            <p className="text-sm text-gray-500 mb-1">ISBN: {book.isbn}</p>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <FaStar className="h-4 w-4 text-yellow-400 mr-1" />
              <span>{book.averageRating ? Number(book.averageRating).toFixed(1) : '0.0'} ({book.ratingsCount || 0} valoraciones)</span>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <FaBookOpen className="h-4 w-4 text-indigo-500 mr-1" />
              <span>{book.availableCopies || 0} ejemplares disponibles</span>
            </div>
            <div className="flex gap-2 mt-auto">
              <button
                className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm"
                onClick={() => setSelectedBook(book)}
              >
                Ver detalles
              </button>
              <button
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                onClick={() => alert('¡Reserva realizada (demo)!')}
              >
                Reservar
              </button>
            </div>
          </div>
        ))}
      </div>
      {filteredBooks.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No se encontraron libros que coincidan con la búsqueda
        </div>
      )}
      {/* Modal de detalles */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {selectedBook.coverUrl ? (
                  <img
                    src={selectedBook.coverUrl}
                    alt={selectedBook.title}
                    className="w-full rounded-lg shadow-lg"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'; }}
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
                    <h3 className="text-sm font-medium text-gray-500">Título</h3>
                    <p className="mt-1 text-gray-900">{selectedBook.title}</p>
                  </div>
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
                      {selectedBook.availableCopies || 0} ejemplares disponibles
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Calificación Promedio</h3>
                    <div className="mt-1 flex items-center">
                      <FaStar className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 text-gray-900">{selectedBook.averageRating ? Number(selectedBook.averageRating).toFixed(1) : '0.0'} ({selectedBook.ratingsCount || 0} valoraciones)</span>
                    </div>
                  </div>
                  <button
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition w-full"
                    onClick={() => alert('¡Reserva realizada (demo)!')}
                  >
                    Reservar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
