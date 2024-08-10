import React from 'react';

const Table = ({ columns, data, onEdit, onDelete }) => (
  <div className="overflow-x-auto mb-4">
    <table className="min-w-full bg-white">
      <thead>
        <tr className="bg-gray-200">
          {columns.map((col) => (
            <th key={col.key} className={`py-2 px-4 border ${col.className || ''}`} onClick={col.onSort}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td className="py-2 px-4 border">
              <button
                onClick={() => onEdit(item)}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              >
                Delete
              </button>
            </td>
            {columns.slice(1).map((col) => (
              <td key={col.key} className="py-2 px-4 border">
                {item[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Table;
