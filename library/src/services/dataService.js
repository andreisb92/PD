import Papa from 'papaparse';

const loadCSV = async (filePath) => {
  try {
    const response = await fetch(filePath);
    const csvText = await response.text();
    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          resolve(results.data);
        },
      });
    });
  } catch (error) {
    console.error('Error loading CSV:', error);
    return [];
  }
};

export const loadBooks = () => loadCSV('/books.csv');
export const loadRatings = () => loadCSV('/ratings.csv');
export const loadCopies = () => loadCSV('/copies.csv');
export const loadUsers = () => loadCSV('/user_info.csv'); 