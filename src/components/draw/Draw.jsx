import React, { useRef, useState, useEffect } from "react";

const Draw = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // State for controls
  const [isDrawing, setIsDrawing] = useState(false);
  const [penSize, setPenSize] = useState(2);
  const [penColor, setPenColor] = useState("#000000");
  const [shape, setShape] = useState("freehand");
  const [startPos, setStartPos] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    // Set canvas size to 75% of the window's width and height (with a max height for usability)
    const width = Math.floor(window.innerWidth * 0.75);
    const height = Math.floor(window.innerHeight * 0.75);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.style.border = "2px solid #333";
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctxRef.current = ctx;
  }, [penColor, penSize]);

  // Drawing handlers
  const startDraw = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (shape === "freehand") {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    } else {
      setStartPos({ x: offsetX, y: offsetY });
      setIsDrawing(true);
    }
  };

  const drawing = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    if (shape === "freehand") {
      ctxRef.current.lineTo(offsetX, offsetY);
      ctxRef.current.stroke();
    }
  };

  const stopDraw = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (shape !== "freehand" && startPos) {
      const { offsetX, offsetY } = e.nativeEvent;
      const ctx = ctxRef.current;
      ctx.beginPath();
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
      if (shape === "line") {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
      } else if (shape === "rectangle") {
        ctx.strokeRect(
          startPos.x,
          startPos.y,
          offsetX - startPos.x,
          offsetY - startPos.y
        );
      } else if (shape === "circle") {
        const radius = Math.sqrt(
          Math.pow(offsetX - startPos.x, 2) + Math.pow(offsetY - startPos.y, 2)
        );
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      ctx.closePath();
      setStartPos(null);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="container text-center mt-4">
      <h3 className="text-primary">Canvas Drawing Board</h3>
      {/* Navbar-like controls */}
      <div className="d-flex justify-content-center align-items-center mb-3" style={{ gap: "1rem" }}>
        {/* Shapes Dropdown */}
        <div>
          <label htmlFor="shape-select" className="me-2">Shape:</label>
          <select
            id="shape-select"
            className="form-select d-inline-block w-auto"
            value={shape}
            onChange={e => setShape(e.target.value)}
          >
            <option value="freehand">Freehand</option>
            <option value="line">Line</option>
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
          </select>
        </div>
        {/* Pen Size Dropdown */}
        <div>
          <label htmlFor="pen-size-select" className="me-2">Pen Size:</label>
          <select
            id="pen-size-select"
            className="form-select d-inline-block w-auto"
            value={penSize}
            onChange={e => setPenSize(Number(e.target.value))}
          >
            <option value="2">2px</option>
            <option value="4">4px</option>
            <option value="8">8px</option>
            <option value="12">12px</option>
          </select>
        </div>
        {/* Color Dropdown */}
        <div>
          <label htmlFor="color-select" className="me-2">Color:</label>
          <select
            id="color-select"
            className="form-select d-inline-block w-auto"
            value={penColor}
            onChange={e => setPenColor(e.target.value)}
          >
            <option value="#000000">Black</option>
            <option value="#ff0000">Red</option>
            <option value="#00ff00">Green</option>
            <option value="#0000ff">Blue</option>
            <option value="#ffff00">Yellow</option>
          </select>
        </div>
      </div>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDraw}
        onMouseMove={drawing}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        style={{ background: "#fff", cursor: "crosshair", display: "block", margin: "0 auto" }}
      />
      <div className="mt-3">
        <button className="btn btn-danger me-2" onClick={clearCanvas}>Clear</button>
      </div>
    </div>
  );
};

export default Draw;