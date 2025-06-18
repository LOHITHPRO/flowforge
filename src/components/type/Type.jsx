import React, { useState, useEffect, useRef } from "react";
import "./type.css"; // Optional: for custom styles

const Type = () => {
  const [content, setContent] = useState("");
  const [isOpen, setIsOpen] = useState(false); // State to manage panel visibility
  const editorRef = useRef(null);
  const [currentFontSize, setCurrentFontSize] = useState('3'); // Default to medium

  // Load content from localStorage on mount and initialize editor
  useEffect(() => {
    const savedContent = localStorage.getItem("notebookContent");
    if (editorRef.current) {
      if (savedContent) {
        editorRef.current.innerHTML = savedContent;
      } else {
        editorRef.current.innerHTML = "";
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  // Save content to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("notebookContent", content);
  }, [content]);

  const handleInput = () => {
    // Only update the state when the content changes to sync with localStorage
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleClear = () => {
    setContent("");
    localStorage.removeItem("notebookContent");
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  };

  const formatText = (command, value = null) => {
    if (!editorRef.current) return;

    // Save current selection range before command
    const selection = window.getSelection();
    let currentRange = null;
    if (selection && selection.rangeCount > 0) {
      currentRange = selection.getRangeAt(0);
    }

    document.execCommand(command, false, value);

    // Restore selection after command if possible
    if (currentRange && editorRef.current.contains(currentRange.startContainer) && editorRef.current.contains(currentRange.endContainer)) {
      selection.removeAllRanges();
      selection.addRange(currentRange);
    } else if (editorRef.current) { // Fallback to focus at the end if range becomes invalid
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false); // Collapse to the end
      selection.removeAllRanges();
      selection.addRange(range);
    }

    // Update content state after formatting to sync with localStorage
    setContent(editorRef.current.innerHTML);
    console.log("Editor HTML after formatting:", editorRef.current.innerHTML);
  };

  const handleFontSizeChange = (e) => {
    const size = e.target.value;
    setCurrentFontSize(size);
    formatText('fontSize', size);
  };

  const toggleForgeBook = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className={`notebook-wrapper ${isOpen ? 'forge-book-open' : ''}`}>
        <h5 className="notebook-title mb-4">
          <span className="border-bottom border-danger pb-2">FORGE <span className="text-danger">BOOK</span></span>
        </h5>
        
        <div className="formatting-toolbar mb-3">
          <button 
            onClick={() => formatText('bold')}
            title="Bold"
            className="format-btn btn btn-outline-light"
          >
            <i className="fas fa-bold"></i>
          </button>
          <button 
            onClick={() => formatText('italic')}
            title="Italic"
            className="format-btn btn btn-outline-light"
          >
            <i className="fas fa-italic"></i>
          </button>
          <button 
            onClick={() => formatText('underline')}
            title="Underline"
            className="format-btn btn btn-outline-light"
          >
            <i className="fas fa-underline"></i>
          </button>
          <button 
            onClick={() => formatText('backColor', '#ffeb3b')}
            title="Highlight"
            className="format-btn btn btn-outline-light"
          >
            <i className="fas fa-highlighter"></i>
          </button>
          <input
            type="color"
            onChange={(e) => formatText('foreColor', e.target.value)}
            title="Text Color"
            className="color-picker form-control form-control-color bg-dark border-secondary"
            defaultValue="#000000"
          />
          <select
            onChange={handleFontSizeChange}
            value={currentFontSize}
            title="Font Size"
            className="font-size-select form-select bg-dark text-white border-secondary"
          >
            <option value="1">Small</option>
            <option value="2">Medium</option>
            <option value="3">Large</option>
            <option value="4">X-Large</option>
            <option value="5">XX-Large</option>
            <option value="6">3XL</option>
            <option value="7">4XL</option>
          </select>
        </div>

        <div 
          ref={editorRef}
          className="notebook-editor"
          contentEditable={true}
          onInput={handleInput}
          suppressContentEditableWarning={true}
          style={{ 
            direction: 'ltr',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        />

        <div className="notebook-footer mt-3">
          <button 
            className="clear-btn btn btn-danger"
            onClick={handleClear}
          >
            <i className="fas fa-trash me-2"></i>Clear Notes
          </button>
          <span className="save-status text-muted">
            <i className="fas fa-check-circle me-2"></i>Auto-saved
          </span>
        </div>
      </div>
      <button 
        className={`forge-book-toggle btn btn-primary ${isOpen ? 'forge-book-open' : ''}`}
        onClick={toggleForgeBook}
      >
        <i className={`fas fa-chevron-${isOpen ? 'right' : 'left'}`}></i>
      </button>
    </>
  );
};

export default Type;