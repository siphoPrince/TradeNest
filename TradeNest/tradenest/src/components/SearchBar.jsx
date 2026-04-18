import { useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/explore?search=${encodeURIComponent(query)}`);
        }
    };

    const clearSearch = () => setQuery("");

    return (
        <form className="search-bar" onSubmit={handleSearch}>
            <Search size={18} className="search-icon" />
            <input 
                type="text" 
                placeholder="Search items, categories..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
                <X size={16} className="clear-icon" onClick={clearSearch} style={{cursor: 'pointer'}} />
            )}
        </form>
    );
};

export default SearchBar;