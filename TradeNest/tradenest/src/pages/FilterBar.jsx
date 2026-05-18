import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { X, SlidersHorizontal, MapPin } from "lucide-react";

const FilterBar = ({ onApply }) => {
    const [searchParams] = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    // Local state variables synced initially with URL search strings
    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
    const [city, setCity] = useState(searchParams.get("city") || "");
    const [suburb, setSuburb] = useState(searchParams.get("suburb") || "");

    // Update local state variables if the URL gets reset globally/externally
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
        // Make sure to cleanly update parent layout state to pull fresh data
        onApply({ minPrice: null, maxPrice: null, city: null, suburb: null });
        setIsOpen(false);
    };

    // Upgraded: Now dynamically monitors all 4 parameters for an accurate count
    const activeFilterCount = [
        searchParams.get("minPrice"), 
        searchParams.get("maxPrice"),
        searchParams.get("city"),
        searchParams.get("suburb")
    ].filter(Boolean).length;

    return (
        <>
            {/* Toggle Action Button */}
            <button 
                onClick={() => setIsOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '20px', border: '1px solid #e0e0e0', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            >
                <SlidersHorizontal size={16} />
                Filters {activeFilterCount > 0 && <span style={{ padding: '2px 6px', borderRadius: '50%', backgroundColor: '#000', color: '#fff', fontSize: '11px', marginLeft: '4px' }}>{activeFilterCount}</span>}
            </button>

            {/* Slide-Up Overlay Sheet */}
            {isOpen && (
                <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px', backgroundColor: '#fff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', boxSizing: 'border-box', animation: 'slideUp 0.3s ease-out' }}>
                        
                        {/* Drawer Header Layout */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Filters</h3>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
                        </div>

                        {/* Price Filter Segment */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>Price Range (ZAR)</h4>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <input 
                                    type="number" 
                                    placeholder="Min" 
                                    value={minPrice} 
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                                />
                                <span style={{ color: '#aaa' }}>—</span>
                                <input 
                                    type="number" 
                                    placeholder="Max" 
                                    value={maxPrice} 
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                                />
                            </div>
                        </div>

                        {/* Location Targeting Segment — Nestled safely inside the Drawer layout wrapper */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={14} /> Location Details
                            </h4>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Johannesburg" 
                                    value={city} 
                                    onChange={(e) => setCity(e.target.value)}
                                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none', fontSize: '14px' }}
                                />
                                <input 
                                    type="text" 
                                    placeholder="e.g. Sandton" 
                                    value={suburb} 
                                    onChange={(e) => setSuburb(e.target.value)}
                                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none', fontSize: '14px' }}
                                />
                            </div>
                        </div>

                        {/* Action Control Panel inside Drawer */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            <button onClick={handleClearAll} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>
                                Reset All
                            </button>
                            <button onClick={handleApply} style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#000', color: '#fff', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>
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