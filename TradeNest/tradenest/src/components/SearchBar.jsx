import { useState, useEffect } from "react";
import { Search, X, ShoppingBag, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const SearchBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    
    const urlSearch = searchParams.get("search") || "";
    // Default search type to "products" if it's missing from the URL
    const urlType = searchParams.get("type") || "products"; 

    const [query, setQuery] = useState(urlSearch);
    const [searchType, setSearchType] = useState(urlType);

    // Keep input field and active tab synced if URL changes externally
    useEffect(() => {
        setQuery(urlSearch);
        setSearchType(urlType);
    }, [urlSearch, urlType]);

    // Handle updating URL params safely
    const updateSearchParams = (newQuery, newType) => {
        const params = new URLSearchParams(location.search);
        const trimmedQuery = newQuery.trim();

        // Always sync the search type
        params.set("type", newType);

        if (trimmedQuery.length > 2) {
            params.set("search", trimmedQuery);
            navigate(`/explore?${params.toString()}`, { replace: true });
        } else if (trimmedQuery.length === 0) {
            params.delete("search");
            const newQueryString = params.toString();
            navigate(`/explore${newQueryString ? `?${newQueryString}` : ""}`, { replace: true });
        }
    };

    // Debounce logic for typing
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // Only trigger automatically if query has changed from URL state or is cleared
            if (query.trim() !== urlSearch) {
                updateSearchParams(query, searchType);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    // Handle manual tab switching instantly
    const handleTypeChange = (type) => {
        setSearchType(type);
        updateSearchParams(query, type);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        updateSearchParams(query, searchType);
    };

    return (
        <div className="search-component-wrapper" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Search Input Box */}
            <form className="search-bar" onSubmit={handleFormSubmit} style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%' }}>
                <Search size={18} className="search-icon" style={{ position: 'absolute', left: '12px', color: '#666' }} />
                <input 
                    type="text" 
                    placeholder={searchType === "products" ? "Search products..." : "Search creators & shops..."} 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                    style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '24px', border: '1px solid #e0e0e0', outline: 'none', backgroundColor: '#f5f5f5', fontSize: '14px' }}
                />
                {query && (
                    <X 
                        size={16} 
                        className="clear-icon" 
                        onClick={() => {
                            setQuery("");
                            updateSearchParams("", searchType);
                        }} 
                        style={{ position: 'absolute', right: '14px', cursor: 'pointer', color: '#666' }} 
                    />
                )}
            </form>

            {/* Segmented Control / Type Selector Tabs */}
            <div className="search-type-tabs" style={{ display: 'flex', background: '#f0f0f0', borderRadius: '12px', padding: '3px', width: '100%' }}>
                <button
                    type="button"
                    onClick={() => handleTypeChange("products")}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '9px',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: searchType === "products" ? '6px' : '400',
                        cursor: 'pointer',
                        background: searchType === "products" ? '#ffffff' : 'transparent',
                        color: searchType === "products" ? '#000000' : '#666666',
                        boxShadow: searchType === "products" ? '0px 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <ShoppingBag size={14} />
                    Products
                </button>
                <button
                    type="button"
                    onClick={() => handleTypeChange("creators")}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '9px',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: searchType === "creators" ? '6px' : '400',
                        cursor: 'pointer',
                        background: searchType === "creators" ? '#ffffff' : 'transparent',
                        color: searchType === "creators" ? '#000000' : '#666666',
                        boxShadow: searchType === "creators" ? '0px 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Users size={14} />
                    Creators
                </button>
            </div>
        </div>
    );
};

export default SearchBar;