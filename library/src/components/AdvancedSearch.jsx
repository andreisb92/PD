import { useState } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

export default function AdvancedSearch({ onSearch }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    title: '',
    author: '',
    genre: '',
    language: '',
    yearFrom: '',
    yearTo: '',
    minRating: '',
    availableOnly: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      title: '',
      author: '',
      genre: '',
      language: '',
      yearFrom: '',
      yearTo: '',
      minRating: '',
      availableOnly: false,
    });
    onSearch({});
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Búsqueda Avanzada</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {showFilters ? (
            <>
              <FaTimes className="mr-2" />
              Ocultar Filtros
            </>
          ) : (
            <>
              <FaFilter className="mr-2" />
              Mostrar Filtros
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.title}
                onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Buscar por título..."
              />
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Limpiar
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                Autor
              </label>
              <input
                type="text"
                id="author"
                value={filters.author}
                onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
                Género
              </label>
              <select
                id="genre"
                value={filters.genre}
                onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Todos los géneros</option>
                <option value="fiction">Ficción</option>
                <option value="non-fiction">No Ficción</option>
                <option value="mystery">Misterio</option>
                <option value="science-fiction">Ciencia Ficción</option>
                <option value="fantasy">Fantasía</option>
                <option value="romance">Romance</option>
                <option value="biography">Biografía</option>
              </select>
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Idioma
              </label>
              <select
                id="language"
                value={filters.language}
                onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Todos los idiomas</option>
                <option value="es">Español</option>
                <option value="en">Inglés</option>
                <option value="fr">Francés</option>
                <option value="de">Alemán</option>
                <option value="it">Italiano</option>
              </select>
            </div>

            <div>
              <label htmlFor="yearFrom" className="block text-sm font-medium text-gray-700">
                Año desde
              </label>
              <input
                type="number"
                id="yearFrom"
                value={filters.yearFrom}
                onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <label htmlFor="yearTo" className="block text-sm font-medium text-gray-700">
                Año hasta
              </label>
              <input
                type="number"
                id="yearTo"
                value={filters.yearTo}
                onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <label htmlFor="minRating" className="block text-sm font-medium text-gray-700">
                Calificación mínima
              </label>
              <select
                id="minRating"
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Cualquier calificación</option>
                <option value="4">4+ estrellas</option>
                <option value="3">3+ estrellas</option>
                <option value="2">2+ estrellas</option>
                <option value="1">1+ estrella</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="availableOnly"
                checked={filters.availableOnly}
                onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="availableOnly" className="ml-2 block text-sm text-gray-900">
                Solo libros disponibles
              </label>
            </div>
          </div>
        )}
      </form>
    </div>
  );
} 