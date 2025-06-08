// components/draw/Draw.jsx

import React, { useRef, useState, useEffect } from "react";

const Draw = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [penSize, setPenSize] = useState(2);
  const [penColor, setPenColor] = useState("#000000");
  const [shape, setShape] = useState("freehand");
  const [startPos, setStartPos] = useState(null);

  const [canvasDims, setCanvasDims] = useState({
    width: Math.floor(window.innerWidth * 0.75),
    height: Math.floor(window.innerHeight * 0.75),
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setCanvasDims({
        width: Math.floor(window.innerWidth * 0.75),
        height: Math.floor(window.innerHeight * 0.75),
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Setup canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctxRef.current = ctx;
  }, [penColor, penSize, canvasDims]);

  const startDraw = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (shape === "freehand") {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(offsetX, offsetY);
    } else {
      setStartPos({ x: offsetX, y: offsetY });
    }
    setIsDrawing(true);
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
      <h3 className="text-primary text-center">🎨 Flow Forge Drawing Board</h3>

      {/* Control Bar */}
      <div className="d-flex flex-wrap justify-content-center align-items-center mb-3 gap-3">
        <div>
          <label htmlFor="shape-select" className="form-label text-white me-2">Shape:</label>
          <select
            id="shape-select"
            className="form-select d-inline-block w-auto"
            value={shape}
            onChange={(e) => setShape(e.target.value)}
          >
            <option value="freehand">Freehand</option>
            <option value="line">Line</option>
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
          </select>
        </div>

        <div>
          <label htmlFor="pen-size-select" className="form-label text-white me-2">Pen Size:</label>
          <select
            id="pen-size-select"
            className="form-select d-inline-block w-auto"
            value={penSize}
            onChange={(e) => setPenSize(Number(e.target.value))}
          >
            <option value="2">2px</option>
            <option value="4">4px</option>
            <option value="8">8px</option>
            <option value="12">12px</option>
          </select>
        </div>

        <div>
          <label htmlFor="color-select" className="form-label text-white me-2">Color:</label>
          <input
            type="color"
            id="color-select"
            value={penColor}
            onChange={(e) => setPenColor(e.target.value)}
            className="form-control form-control-color d-inline-block w-auto"
          />
        </div>
      </div>

      {/* Main Area: Canvas + Side Panel */}
      <div className="d-flex flex-row w-100" style={{ minHeight: "75vh" }}>
        <div className="flex-grow-1 me-3">
          <canvas
            ref={canvasRef}
            width={canvasDims.width}
            height={canvasDims.height}
            onMouseDown={startDraw}
            onMouseMove={drawing}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            style={{
              backgroundColor: "#f2f2f2",
              border: "2px solid #333",
              cursor: "crosshair",
              display: "block",
              width: "100%",
              height: "100%",
            }}
          />
        </div>

        {/* Side Panel */}
        <div style={{
          width: "25%",
          background: "#7d7979",
          borderLeft: "1px solid #ccc",
          padding: "1rem",
          overflowY: "auto"
        }}>
          {/* <Type /> - Removed duplicate rendering */}
        </div>
      </div>

      <div className="text-center mt-3">
        <button className="btn btn-danger" onClick={clearCanvas}>
          🗑️ Clear Canvas
        </button>
      </div>
    </div>
  );
};

export default Draw;
