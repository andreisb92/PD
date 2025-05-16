import { useState, useEffect } from "react";
import Papa from "papaparse";

export default function CopyList() {
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, available, borrowed

  useEffect(() => {
    fetch("/copies(ejemplares).csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setCopies(results.data);
            setLoading(false);
          },
        });
      });
  }, []);

  const filteredCopies = copies.filter(copy => {
    if (filter === "all") return true;
    if (filter === "available") return copy.status === "available";
    if (filter === "borrowed") return copy.status === "borrowed";
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📖 Ejemplares</h2>

      <div className="mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded ${
              filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("available")}
            className={`px-4 py-2 rounded ${
              filter === "available" ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
          >
            Disponibles
          </button>
          <button
            onClick={() => setFilter("borrowed")}
            className={`px-4 py-2 rounded ${
              filter === "borrowed" ? "bg-yellow-600 text-white" : "bg-gray-200"
            }`}
          >
            Prestados
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCopies.map((copy, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">Ejemplar #{copy.copy_id}</h3>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  copy.status === "available"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {copy.status === "available" ? "Disponible" : "Prestado"}
              </span>
            </div>
            <p className="text-gray-600 mb-2">Libro ID: {copy.book_id}</p>
            {copy.location && (
              <p className="text-sm text-gray-500">Ubicación: {copy.location}</p>
            )}
            {copy.condition && (
              <p className="text-sm text-gray-500">Estado: {copy.condition}</p>
            )}
          </div>
        ))}
      </div>

      {filteredCopies.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No se encontraron ejemplares con el filtro seleccionado
        </div>
      )}
    </div>
  );
}
