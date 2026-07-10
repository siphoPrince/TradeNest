import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { X, SlidersHorizontal, MapPin } from "lucide-react";
import "../styles/FilterBar.css"; // Importing our new layout sheet

const FilterBar = ({ onApply }) => {
    const [searchParams] = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
    const [city, setCity] = useState(searchParams.get("city") || "");
    const [suburb, setSuburb] = useState(searchParams.get("suburb") || "");

    useEffect(() => {
        setMinPrice(searchParams.get("minPrice") || "");
        setMaxPrice(searchParams.get("maxPrice") || "");
        setCity(searchParams.get("city") || "");
        setSuburb(searchParams.get("suburb") || "");
    }, [searchParams]);

    const handleApply = () => {
        const updatedFilters = {
            minPrice: minPrice || null,
            maxPrice: maxPrice || null,
            city: city || null,
            suburb: suburb || null,
        };
        onApply(updatedFilters);
        setIsOpen(false);
    };

    const handleClearAll = () => {
        setMinPrice("");
        setMaxPrice("");
        setCity("");
        setSuburb("");
        onApply({ minPrice: null, maxPrice: null, city: null, suburb: null });
        setIsOpen(false);
    };

    const activeFilterCount = [
        searchParams.get("minPrice"), 
        searchParams.get("maxPrice"),
        searchParams.get("city"),
        searchParams.get("suburb")
    ].filter(Boolean).length;

    return (
        <>
            {/* Toggle Trigger Button */}
            <button className="filter-trigger-btn" onClick={() => setIsOpen(true)}>
                <SlidersHorizontal size={16} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                    <span className="filter-badge-count">{activeFilterCount}</span>
                )}
            </button>

            {/* Slide-In Overlay Sheet */}
            {isOpen && (
                <div className="filter-overlay" onClick={() => setIsOpen(false)}>
                    <div className="filter-drawer" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Drawer Header Layout */}
                        <div className="filter-drawer-header">
                            <h3>Filters</h3>
                            <button className="close-drawer-btn" onClick={() => setIsOpen(false)}>
                                <X size={22} />
                            </button>
                        </div>

                        {/* Content Scroll Wrapper */}
                        <div className="filter-drawer-content">
                            {/* Price Filter Segment */}
                            <div className="filter-group">
                                <h4>Price Range (ZAR)</h4>
                                <div className="price-input-range">
                                    <input 
                                        type="number" 
                                        placeholder="Min" 
                                        value={minPrice} 
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                    <span className="range-divider">—</span>
                                    <input 
                                        type="number" 
                                        placeholder="Max" 
                                        value={maxPrice} 
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Location Targeting Segment */}
                            <div className="filter-group">
                                <h4 className="location-heading">
                                    <MapPin size={14} /> Location Details
                                </h4>
                                <div className="location-input-row">
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Johannesburg" 
                                        value={city} 
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Sandton" 
                                        value={suburb} 
                                        onChange={(e) => setSuburb(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Control Panel */}
                        <div className="filter-drawer-actions">
                            <button className="filter-btn-reset" onClick={handleClearAll}>
                                Reset All
                            </button>
                            <button className="filter-btn-apply" onClick={handleApply}>
                                Apply Filters
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default FilterBar;