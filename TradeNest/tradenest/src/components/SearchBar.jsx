import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const SearchBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const urlSearch = searchParams.get("search") || "";

    const [query, setQuery] = useState(urlSearch);

    // Keep input field synced if URL changes externally (e.g., clearing filters)
    useEffect(() => {
        setQuery(urlSearch);
    }, [urlSearch]);

    // Debounce logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const params = new URLSearchParams(location.search);
            const trimmedQuery = query.trim();

            if (trimmedQuery.length > 2) {
                params.set("search", trimmedQuery);
                navigate(`/explore?${params.toString()}`, { replace: true });
            } else if (trimmedQuery.length === 0 && urlSearch) {
                params.delete("search");
                const newQueryString = params.toString();
                navigate(`/explore${newQueryString ? `?${newQueryString}` : ""}`, { replace: true });
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [query, navigate, location.search, urlSearch]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(location.search);
        if (query.trim()) {
            params.set("search", query.trim());
            navigate(`/explore?${params.toString()}`);
        }
    };

    return (
        <form className="search-bar" onSubmit={handleFormSubmit} style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search size={18} className="search-icon" style={{ position: 'absolute', left: '12px', color: '#666' }} />
            <input 
                type="text" 
                placeholder="Search products or creators..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '24px', border: '1px solid #e0e0e0', outline: 'none', backgroundColor: '#f5f5f5' }}
            />
            {query && (
                <X 
                    size={16} 
                    className="clear-icon" 
                    onClick={() => setQuery("")} 
                    style={{ position: 'absolute', right: '14px', cursor: 'pointer', color: '#666' }} 
                />
            )}
        </form>
    );
};

export default SearchBar;