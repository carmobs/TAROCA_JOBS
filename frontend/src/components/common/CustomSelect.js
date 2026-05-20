import React, { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ options = [], value, onChange, placeholder = 'Selecciona...', name, multiple = false }) {
  const isMulti = Array.isArray(value);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = (() => {
    if (isMulti) {
      if (!value.length) return placeholder;
      const labels = options
        .filter(o => value.some(v => String(v) === String(o.value)))
        .map(o => o.label);
      return labels.length <= 2 ? labels.join(', ') : `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`;
    }

    if (value === '' || value === null || value === undefined) return placeholder;
    const found = options.find(o => String(o.value) === String(value));
    return found ? found.label : placeholder;
  })();

  const hasSelection = isMulti ? value.length > 0 : value !== '' && value !== null && value !== undefined;

  const handleSelect = (val) => {
    if (isMulti) {
      if (val === '') {
        if (onChange) onChange({ target: { name, value: [] } });
        setOpen(false);
        return;
      }

      const next = value.some(v => String(v) === String(val))
        ? value.filter(v => String(v) !== String(val))
        : [...value, val];
      if (onChange) onChange({ target: { name, value: next } });
      return;
    }

    if (onChange) onChange({ target: { name, value: val } });
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 flex items-center justify-between"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`${hasSelection ? 'text-gray-900' : 'text-gray-500'}`}>{selectedLabel}</span>
        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-40 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-56 overflow-auto" role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={isMulti ? value.some(v => String(v) === String(opt.value)) : String(opt.value) === String(value)}
              onClick={() => handleSelect(opt.value)}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  isMulti
                    ? value.some(v => String(v) === String(opt.value))
                      ? 'bg-gray-100 font-semibold text-gray-900'
                      : 'text-gray-900'
                    : String(opt.value) === String(value)
                    ? 'bg-gray-100 font-semibold text-gray-900'
                    : 'text-gray-900'
                }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
