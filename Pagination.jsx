import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center gap-2 mt-4">
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`px-3 py-1 rounded ${
            currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
};

export default Pagination; 