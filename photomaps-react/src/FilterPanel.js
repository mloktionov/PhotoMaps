import React, { useState } from 'react';

const FilterPanel = ({ years, onYearChange, onMonthChange, onReset }) => {
    const months = [
        { value: 'all', label: 'All Months' },
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    return (
        <div className="filter-panel" style={{ padding: '10px', backgroundColor: '#f9f9f9' }}>
            <select onChange={(e) => onYearChange(e.target.value)} defaultValue="all">
                <option value="all">All Years</option>
                {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
            <select onChange={(e) => onMonthChange(e.target.value)} defaultValue="all">
                {months.map((month) => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                ))}
            </select>
            <button onClick={onReset}>Reset Filters</button>
        </div>
    );
};

export default FilterPanel;