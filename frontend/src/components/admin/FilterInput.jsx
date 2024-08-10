import React from 'react';

const FilterInput = ({ name, placeholder, value, onChange }) => (
  <input
    type="text"
    placeholder={placeholder}
    name={name}
    value={value}
    onChange={onChange}
    className="w-1/3 p-2 border rounded mr-2"
  />
);

export default FilterInput;
