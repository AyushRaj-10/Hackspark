import React, { useState, useRef, useEffect } from 'react'
import { searchLocations } from '../data/delhiLocations'

const AutocompleteInput = ({ label, value, onChange, placeholder, disabled, id }) => {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  useEffect(() => {
    if (value && value.length > 0) {
      const results = searchLocations(value)
      setSuggestions(results)
      setShowSuggestions(results.length > 0 && value !== getLocationName(value))
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
    setSelectedIndex(-1)
  }, [value])

  const getLocationName = (val) => {
    const location = searchLocations(val).find(loc => 
      loc.name.toLowerCase() === val.toLowerCase()
    )
    return location ? location.name : val
  }

  const handleInputChange = (e) => {
    onChange(e.target.value)
  }

  const handleSuggestionClick = (location) => {
    onChange(location.name)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSuggestionClick(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex]
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  const handleBlur = (e) => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  return (
    <div className="autocomplete-container">
      {label && <label htmlFor={id}>{label}</label>}
      <div className="autocomplete-input-wrapper">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="autocomplete-input"
          disabled={disabled}
          autoComplete="off"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-list" ref={suggestionsRef}>
            {suggestions.map((location, index) => (
              <li
                key={location.name}
                className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSuggestionClick(location)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{location.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default AutocompleteInput

