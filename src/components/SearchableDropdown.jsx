// =======================================================================
// FILE: src/components/SearchableDropdown.jsx (FIXED)
// PURPOSE: A reusable dropdown component with a search filter.
// =======================================================================
import { useState, useEffect, useRef, useMemo } from 'react';

const SearchableDropdown = ({ options, value, onChange, placeholder = "Select an option" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const filteredOptions = useMemo(() => {
        // Ensure options is an array before filtering
        if (!Array.isArray(options)) {
            return [];
        }
        // The fix is here: we now check that option and option.label exist before filtering.
        return options.filter(option => 
            option && typeof option.label === 'string' &&
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const selectedOptionLabel = useMemo(() => {
        const selectedOption = options.find(option => option.value === value);
        return selectedOption ? selectedOption.label : placeholder;
    }, [options, value, placeholder]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative w-64" ref={dropdownRef}> {/* FIX: Changed w-full back to w-64 */}
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full p-2 border rounded-md bg-white text-left flex items-center justify-between">
                <span className="truncate">{selectedOptionLabel}</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg">
                    <div className="p-2">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <ul className="max-h-60 overflow-y-auto">
                        {filteredOptions.map(option => (
                            <li key={option.value} onClick={() => handleSelect(option.value)} className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${value === option.value ? 'bg-blue-50' : ''}`}>
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;
