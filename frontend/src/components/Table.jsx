import React from 'react';

const Table = ({ headers, children, columnStyles, textAlignments, stickyHeader = true }) => {
  return (
    <table className="w-full text-left">
       <thead className={`${stickyHeader ? 'sticky top-0' : ''} bg-gradient-to-r from-custom-blue to-lime-green text-white shadow-sm z-10`}>
        <tr>
          {headers.map((header, index) => (
            <th key={index} className={`py-2 ${textAlignments[index] || 'text-center'}`} style={columnStyles[index]}>
              {header.includes('(') ? (
                <>
                  <span className="font-bold">{header.split('(')[0].trim()}</span>
                  <span className="font-normal text-sm whitespace-nowrap"> ({header.split('(')[1]}</span>
                </>
              ) : (
                header
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {React.Children.map(children, (child, index) =>
          React.cloneElement(child, {
            className: `${child.props.className} ${index % 2 === 0 ? 'bg-blue-300 bg-opacity-40' : ''}`,
            columnStyles,
            textAlignments,
          })
        )}
      </tbody>
    </table>
  );
};

export default Table;