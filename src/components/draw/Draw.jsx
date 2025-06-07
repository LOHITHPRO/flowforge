import React, { useRef, useState, useEffect } from "react";
import Type from '../type/type';

const Draw = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // State for controls
  const [isDrawing, setIsDrawing] = useState(false);
  const [penSize, setPenSize] = useState(2);
  const [penColor, setPenColor] = useState("#000000");
  const [shape, setShape] = useState("freehand");
  const [startPos, setStartPos] = useState(null);

  // Responsive canvas dimensions
  const [canvasDims, setCanvasDims] = useState({
    width: Math.floor(window.innerWidth * 0.75),
    height: Math.floor(window.innerHeight * 0.75)
  });

  useEffect(() => {
    const handleResize = () => {
      setCanvasDims({
        width: Math.floor(window.innerWidth * 0.75),
        height: Math.floor(window.innerHeight * 0.75)
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctxRef.current = ctx;
  }, [penColor, penSize, canvasDims]);

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
    <div className="container mt-4">
      <h3 className="text-primary text-center">Canvas Drawing Board</h3>
      {/* Navbar-like controls */}
      <div className="d-flex justify-content-center align-items-center mb-3" style={{ gap: "1rem" }}>
        <div>
          <label htmlFor="shape-select" className="me-2 text-white">Shape:</label>
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
        <div>
          <label htmlFor="pen-size-select" className="me-2 text-white">Pen Size:</label>
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
        <div>
          <label htmlFor="color-select" className="me-2 text-white">Color:</label>
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
      {/* Flex container for canvas and notebook */}
      <div style={{ display: "flex", width: "100%", minHeight: "75vh" }}>
        {/* Canvas section */}
        <div style={{ width: "75%", display: "flex", justifyContent: "flex-start" }}>
          <canvas
            ref={canvasRef}
            width={canvasDims.width}
            height={canvasDims.height}
            onMouseDown={startDraw}
            onMouseMove={drawing}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            style={{
              background: "#7d7979",
              cursor: "crosshair",
              border: "2px solid #333",
              display: "block"
            }}
          />
        </div>
        {/* Notebook placeholder */}
        <div style={{
          width: "25%",
          borderLeft: "1px solid #ccc",
          padding: "1rem",
          minHeight: "70vh",
          background: "#fafafa"
        }}>
          <Type />
        </div>
      </div>
      <div className="mt-3 text-center">
        <button className="btn btn-danger me-2" onClick={clearCanvas}>Clear</button>
      </div>
    </div>
  );
};

export default Draw;