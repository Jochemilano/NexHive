import React, { useEffect, useRef } from "react";
import { FaSearch, FaTimes, FaChevronUp, FaChevronDown } from "react-icons/fa";
import "./ChatSearch.css";

const ChatSearch = ({ 
  showSearch, 
  setShowSearch, 
  searchTerm, 
  onSearch, 
  results, 
  currentIndex, 
  onNavigate 
}) => {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    if (showSearch) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearch, setShowSearch]);

  return (
    <div className="chat-search-wrapper" ref={wrapperRef}>
      {showSearch && (
        <div className="search-box-container">
          <input 
            type="text" 
            autoFocus
            className="chat-search-input" 
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
          
          {searchTerm && (
            <div className="search-nav-controls">
              <span className="search-index-text">
                {results.length > 0 ? `${currentIndex + 1}/${results.length}` : "0/0"}
              </span>
              <button onClick={() => onNavigate("up")} type="button">
                <FaChevronUp />
              </button>
              <button onClick={() => onNavigate("down")} type="button">
                <FaChevronDown />
              </button>
            </div>
          )}
        </div>
      )}
      
      <button 
        className={`call-start-btn ${showSearch ? "active" : ""}`}
        onClick={() => { 
          if(showSearch) onSearch("");
          setShowSearch(!showSearch); 
        }}
        type="button"
      >
        {showSearch ? <FaTimes /> : <FaSearch />}
      </button>
    </div>
  );
};

export default ChatSearch;