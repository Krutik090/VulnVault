// =======================================================================
// FILE: src/components/MultiSelect.jsx (NEW FILE)
// PURPOSE: A user-friendly multi-select component with tag display.
// =======================================================================
import { useState, useRef, useEffect } from 'react';

const MultiSelect = ({ label, options, selected, onChange, placeholder = "Select options..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref]);

    const handleSelect = (optionValue) => {
        if (selected.includes(optionValue)) {
            onChange(selected.filter(item => item !== optionValue));
        } else {
            onChange([...selected, optionValue]);
        }
    };

    const getOptionLabel = (value) => {
        const option = options.find(opt => opt.value === value);
        return option ? option.label : '';
    };

    return (
        <div ref={ref}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full p-2 border rounded bg-white text-left flex items-center justify-between">
                    <span className="flex flex-wrap gap-2">
                        {selected.length > 0 ? selected.map(value => (
                            <span key={value} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center">
                                {getOptionLabel(value)}
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleSelect(value); }}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    &times;
                                </button>
                            </span>
                        )) : <span className="text-gray-500">{placeholder}</span>}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {isOpen && (
                    <ul className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-y-auto">
                        {options.map(option => (
                            <li key={option.value} onClick={() => handleSelect(option.value)} className={`p-2 cursor-pointer hover:bg-gray-100 ${selected.includes(option.value) ? 'bg-blue-50' : ''}`}>
                                {option.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default MultiSelect;