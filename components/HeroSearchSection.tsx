'use client';

import { useState, useEffect } from 'react';
import '../styles/hero-search-section.css';

interface HeroSearchSectionProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
  searchQuery?: string;
  activeFilter?: string;
}

export default function HeroSearchSection({ 
  onSearch, 
  onFilterChange, 
  searchQuery = '', 
  activeFilter = 'الكل' 
}: HeroSearchSectionProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localActiveFilter, setLocalActiveFilter] = useState(activeFilter);

  // const filters = ['الكل', 'الأحدث', 'اللغة', 'المستوى', 'المجال'];

  // Update local state when props change
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setLocalActiveFilter(activeFilter);
  }, [activeFilter]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(localSearchQuery);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    // Real-time search
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleFilterClick = (filter: string) => {
    setLocalActiveFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(localSearchQuery.trim());
    }
  };

  return (
    <section className="hero-search-section">
      <div className="hero-background">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">برامجنا المميزة</h1>
          
          <div className="search-container">
            <div className="search-box" >
              <input
                type="text"
                placeholder="ابحث عن الكورسات، المدربين، أو المجالات..."
                value={localSearchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="search-input"
              />
              {/* <button 
                onClick={handleSearch}
                className="search-button"
              >
                بحث
              </button> */}
            </div>
          </div>

          {/* <div className="filters-container">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                className={`filter-button ${localActiveFilter === filter ? 'active' : ''}`}
              >
                {filter}
                <span className="dropdown-arrow">▼</span>
              </button>
            ))}
          </div> */}
        </div>
      </div>
    </section>
  );
}