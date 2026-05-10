const TagInput = ({ tags, setTags }) => {
    const [input, setInput] = useState("");

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && input.trim()) {
            e.preventDefault();
            if (!tags.includes(input.trim())) {
                setTags([...tags, input.trim()]);
            }
            setInput("");
        }
    };

    const removeTag = (indexToRemove) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="tag-input-container">
            <div className="tags-flex">
                {tags.map((tag, index) => (
                    <span key={index} className="tag-bubble">
                        #{tag} <X size={12} onClick={() => removeTag(index)} />
                    </span>
                ))}
            </div>
            <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add tags (e.g. iPhone, Tech) and press Enter"
            />
        </div>
    );
};

export default TagInput;