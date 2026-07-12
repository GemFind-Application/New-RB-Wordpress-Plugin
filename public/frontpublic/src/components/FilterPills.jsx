import React from 'react';
import './FilterPills.css';

const FilterPills = ({ options, selectedValues, onSelect, labelKey = 'name', valueKey = 'id' }) => {
    if (!options || options.length === 0) return null;

    return (
        <div className="filter-pills-container">
            {options.map((option) => {
                const value = valueKey === 'index' ? options.indexOf(option) : option[valueKey];
                const displayText = option[labelKey];
                const isSelected = Array.isArray(selectedValues)
                    ? selectedValues.some((v) => String(v) === String(value))
                    : false;

                return (
                    <button
                        key={option.id || value}
                        className={`filter-pill ${isSelected ? 'active' : ''}`}
                        onClick={() => onSelect(value)}
                    >
                        {displayText}
                    </button>
                );
            })}
        </div>
    );
};

export default FilterPills;

