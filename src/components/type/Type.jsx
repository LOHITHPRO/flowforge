import React, { useState, useEffect, useRef } from "react";
import "./type.css"; // Optional: for custom styles

const Type = () => {
  const [content, setContent] = useState("");
  const editorRef = useRef(null);

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
  };

  return (
    <div className="notebook-wrapper">
      <h5 className="notebook-title">
        FORGE <span className="text-danger">BOOK</span>
      </h5>
      
      <div className="formatting-toolbar">
        <button 
          onClick={() => formatText('bold')}
          title="Bold"
          className="format-btn"
        >
          B
        </button>
        <button 
          onClick={() => formatText('italic')}
          title="Italic"
          className="format-btn"
        >
          I
        </button>
        <button 
          onClick={() => formatText('underline')}
          title="Underline"
          className="format-btn"
        >
          U
        </button>
        <button 
          onClick={() => formatText('backColor', '#ffeb3b')}
          title="Highlight"
          className="format-btn"
        >
          H
        </button>
        <input
          type="color"
          onChange={(e) => formatText('foreColor', e.target.value)}
          title="Text Color"
          className="color-picker"
          defaultValue="#000000"
        />
      </div>

      <div 
        ref={editorRef}
        className="notebook-editor"
        contentEditable={true}
        onInput={handleInput}
        suppressContentEditableWarning={true}
        style={{ direction: 'ltr' }}
      />

      <div className="notebook-footer">
        <button 
          className="clear-btn"
          onClick={handleClear}
        >
          Clear Notes
        </button>
        <span className="save-status">Auto-saved</span>
      </div>
    </div>
  );
};

export default Type;