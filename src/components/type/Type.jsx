import React, { useState, useEffect } from "react";
import "./type.css"; // Optional: for custom styles

const Type = () => {
  const [notes, setNotes] = useState("");

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("projectNotes");
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("projectNotes", notes);
  }, [notes]);

  const handleChange = (e) => {
    setNotes(e.target.value);
  };

  const handleClear = () => {
    setNotes("");
    localStorage.removeItem("projectNotes");
  };

  return (
    <div className="notediv">
      <h5 className="font-monospace fw-bold fst-italic">FORGE <span className="fst-italic fw-bold text-danger">BOOK</span></h5>
      <textarea
        value={notes}
        onChange={handleChange}
        placeholder="Write your notes here..."
        style={{
          width: "100%",
          height: "60vh",
          resize: "vertical",
          padding: "0.5rem",
          fontSize: "1rem",
          border: "1px solid #ccc",
          borderRadius: "4px",
          background: "#fff"
        }}
      />
      <div className="mt-2">
        <button className="btn btn-secondary btn-sm" onClick={handleClear}>
          Clear Notes
        </button>
      </div>
    </div>
  );
};

export default Type;