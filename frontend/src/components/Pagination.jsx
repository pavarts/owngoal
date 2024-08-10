// src/components/Pagination.jsx

import React from 'react';

const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
  const pageCount = Math.ceil(totalItems / itemsPerPage);
  
  if (pageCount <= 1) {
    return null; // Don't render pagination if there's only one page or no items
  }

  const pageNumbers = [];
  for (let i = 1; i <= pageCount; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="mt-1 mb-1 text-md flex justify-center items-center space-x-4">
      <button
        onClick={() => paginate(1)}
        disabled={currentPage === 1}
        className="text-blue-200 hover:text-white disabled:text-gray-400"
      >
        &#171; {/* Double left arrow */}
      </button>
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        className="text-blue-200 hover:text-white disabled:text-gray-400"
      >
        &#8249; {/* Single left arrow */}
      </button>
      <ul className="flex space-x-2">
        {pageNumbers.map(number => (
          <li key={number}>
            <button
              onClick={() => paginate(number)}
              className={`px-2 py-1 ${currentPage === number ? 'text-white font-bold' : 'text-blue-200 hover:text-white'}`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === pageCount}
        className="text-blue-200 hover:text-white disabled:text-gray-400"
      >
        &#8250; {/* Single right arrow */}
      </button>
      <button
        onClick={() => paginate(pageCount)}
        disabled={currentPage === pageCount}
        className="text-blue-200 hover:text-white disabled:text-gray-400"
      >
        &#187; {/* Double right arrow */}
      </button>
    </nav>
  );
};

export default Pagination;