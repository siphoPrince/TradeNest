import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const SearchBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    
    const urlSearch = searchParams.get("search") || "";
    const urlType = searchParams.get("type") || "products"; 

    const [query, setQuery] = useState(urlSearch);

    // Keep input field synced if URL changes externally
    useEffect(() => {
        setQuery(urlSearch);
    }, [urlSearch]);

    const updateSearchParams = (newQuery) => {
        const params = new URLSearchParams(location.search);
        const trimmedQuery = newQuery.trim();

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
            if (query.trim() !== urlSearch) {
                updateSearchParams(query);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        updateSearchParams(query);
    };

    return (
        <div className="search-component-wrapper" style={{ width: '100%' }}>
            <form className="search-bar" onSubmit={handleFormSubmit} style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%' }}>
                <Search size={18} className="search-icon" style={{ position: 'absolute', left: '12px', color: '#666' }} />
                <input 
                    type="text" 
                    placeholder={urlType === "products" ? "Search products..." : "Search creators & shops..."} 
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
                            updateSearchParams("");
                        }} 
                        style={{ position: 'absolute', right: '14px', cursor: 'pointer', color: '#666' }} 
                    />
                )}
            </form>
        </div>
    );
};

export default SearchBar;