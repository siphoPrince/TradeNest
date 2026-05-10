import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const SearchBar = () => {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim().length > 2) {
                navigate(`/explore?search=${encodeURIComponent(query)}`, { replace: true });
            } else if (query.trim().length === 0 && location.search.includes("search")) {
                // Reset to full explore feed if search is cleared
                navigate(`/explore`, { replace: true });
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [query, navigate, location.search]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/explore?search=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form className="search-bar" onSubmit={handleSearch}>
            <Search size={18} className="search-icon" />
            <input 
                type="text" 
                placeholder="Search products or creators..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
            />
            {query && (
                <X 
                    size={16} 
                    className="clear-icon" 
                    onClick={() => setQuery("")} 
                    style={{cursor: 'pointer'}} 
                />
            )}
        </form>
    );
};

export default SearchBar;