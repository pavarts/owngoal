import React from 'react';

const Badge = ({ competition, colorClasses }) => {
  return (
    <div className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${colorClasses}`}>
      {competition}
    </div>
  );
};

export default Badge;