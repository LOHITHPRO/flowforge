// components/draw/Draw.jsx

import React, { useRef, useState, useEffect } from "react";
import "./Draw.css";

const Draw = () => {
  // Canvas refs
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageCacheRef = useRef(new Map());

  // Drawing states
  const [isDrawing, setIsDrawing] = useState(false);
  const [penSize, setPenSize] = useState(2);
  const [penColor, setPenColor] = useState("#000000");
  const [shape, setShape] = useState("freehand");
  const [startPos, setStartPos] = useState(null);

  // Image states
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [resizeStart, setResizeStart] = useState(null);

  // Canvas dimensions
  const [canvasDims, setCanvasDims] = useState({
    width: Math.floor(window.innerWidth * 0.75),
    height: Math.floor(window.innerHeight * 0.75),
  });

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Set canvas dimensions
    canvas.width = canvasDims.width;
    canvas.height = canvasDims.height;
    
    // Configure context
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctxRef.current = ctx;

    // Handle window resize
    const handleResize = () => {
      const newDims = {
        width: Math.floor(window.innerWidth * 0.75),
        height: Math.floor(window.innerHeight * 0.75),
      };
      setCanvasDims(newDims);
      
      // Update canvas size
      canvas.width = newDims.width;
      canvas.height = newDims.height;
      
      // Redraw everything
      redrawCanvas();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update canvas context when pen properties change
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = penColor;
      ctxRef.current.lineWidth = penSize;
    }
  }, [penColor, penSize]);

  // Drawing functions
  const startDraw = (e) => {
    if (selectedImage) return; // Don't draw if interacting with an image
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setIsDrawing(true);
    
    if (shape === "freehand") {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(x, y);
    } else {
      setStartPos({ x, y });
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    if (shape === "freehand") {
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();
    }
  };

  const endDraw = (e) => {
    if (!isDrawing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    if (shape !== "freehand" && startPos) {
      const ctx = ctxRef.current;
      ctx.beginPath();
      
      switch (shape) {
        case "line":
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(x, y);
          break;
        case "rectangle":
          ctx.rect(
            startPos.x,
            startPos.y,
            x - startPos.x,
            y - startPos.y
          );
          break;
        case "circle":
          const radius = Math.sqrt(
            Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)
          );
          ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
          break;
        default:
          break;
      }
      
      ctx.stroke();
    }
    
    setIsDrawing(false);
    setStartPos(null);
  };

  // Image functions
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = canvasDims.width * 0.8;
        const maxHeight = canvasDims.height * 0.8;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        const newImage = {
          id: Date.now(),
          src: e.target.result,
          x: (canvasDims.width - width) / 2,
          y: (canvasDims.height - height) / 2,
          width,
          height,
          rotation: 0,
        };

        // Cache the image
        imageCacheRef.current.set(newImage.id, img);
        
        setImages(prev => [...prev, newImage]);
        setSelectedImage(newImage.id);
        redrawCanvas();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const redrawCanvas = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all images
    images.forEach(imgData => {
      const img = imageCacheRef.current.get(imgData.id);
      if (!img) return;

      ctx.save();
      ctx.translate(imgData.x + imgData.width / 2, imgData.y + imgData.height / 2);
      ctx.rotate(imgData.rotation * Math.PI / 180);
      ctx.drawImage(
        img,
        -imgData.width / 2,
        -imgData.height / 2,
        imgData.width,
        imgData.height
      );
      
      // Draw selection border
      if (imgData.id === selectedImage) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          -imgData.width / 2,
          -imgData.height / 2,
          imgData.width,
          imgData.height
        );
        
        // Draw resize handles
        const handleSize = 8;
        const handles = [
          { x: -imgData.width / 2, y: -imgData.height / 2 },
          { x: imgData.width / 2, y: -imgData.height / 2 },
          { x: imgData.width / 2, y: imgData.height / 2 },
          { x: -imgData.width / 2, y: imgData.height / 2 }
        ];
        
        handles.forEach(handle => {
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#00ff00';
          ctx.beginPath();
          ctx.arc(handle.x, handle.y, handleSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      }
      ctx.restore();
    });
  };

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    let clickedOnImage = false;

    // Check if clicked on an image
    images.forEach(imgData => {
      const dx = x - (imgData.x + imgData.width / 2);
      const dy = y - (imgData.y + imgData.height / 2);
      const rotatedX = dx * Math.cos(-imgData.rotation * Math.PI / 180) - dy * Math.sin(-imgData.rotation * Math.PI / 180);
      const rotatedY = dx * Math.sin(-imgData.rotation * Math.PI / 180) + dy * Math.cos(-imgData.rotation * Math.PI / 180);

      if (Math.abs(rotatedX) < imgData.width / 2 && Math.abs(rotatedY) < imgData.height / 2) {
        clickedOnImage = true;
        setSelectedImage(imgData.id);
      }
    });

    if (!clickedOnImage) {
      setSelectedImage(null);
      startDraw(e);
    }
  };

  const handleMouseDown = (e) => {
    if (!selectedImage) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const selectedImg = images.find(img => img.id === selectedImage);
    if (!selectedImg) return;

    // Check if clicked on resize handle
    const handleSize = 8;
    const handles = [
      { x: selectedImg.x, y: selectedImg.y },
      { x: selectedImg.x + selectedImg.width, y: selectedImg.y },
      { x: selectedImg.x + selectedImg.width, y: selectedImg.y + selectedImg.height },
      { x: selectedImg.x, y: selectedImg.y + selectedImg.height }
    ];

    const clickedHandle = handles.findIndex(handle => {
      const dx = x - handle.x;
      const dy = y - handle.y;
      return Math.sqrt(dx * dx + dy * dy) < handleSize;
    });

    if (clickedHandle !== -1) {
      setIsResizing(true);
      setResizeStart({ x, y, handle: clickedHandle });
    } else {
      setIsDragging(true);
      setDragStart({ x, y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDrawing) {
      draw(e);
    } else if (selectedImage && (isDragging || isResizing)) {
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;
      
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      if (isResizing && resizeStart) {
        const dx = x - resizeStart.x;
        setImages(prev => prev.map(img => {
          if (img.id === selectedImage) {
            const newWidth = Math.max(50, img.width + dx);
            const newHeight = (img.height / img.width) * newWidth;
            return { ...img, width: newWidth, height: newHeight };
          }
          return img;
        }));
        setResizeStart({ ...resizeStart, x });
      } else if (isDragging && dragStart) {
        const dx = x - dragStart.x;
        const dy = y - dragStart.y;
        setImages(prev => prev.map(img => {
          if (img.id === selectedImage) {
            return { ...img, x: img.x + dx, y: img.y + dy };
          }
          return img;
        }));
        setDragStart({ x, y });
      }
      redrawCanvas();
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      endDraw();
    } else {
      setIsDragging(false);
      setIsResizing(false);
      setDragStart(null);
      setResizeStart(null);
    }
  };

  const clearCanvas = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setImages([]);
    setSelectedImage(null);
    imageCacheRef.current.clear();
  };

  return (
    <div className="container-fluid p-4 bg-dark min-vh-100">
      <h3 className="text-white text-center fw-bold font-monospace mb-4">
        <span className="border-bottom border-danger pb-2">FLOW <span className="text-danger">BOARD</span></span>
      </h3>

      <div className="d-flex flex-row w-100 gap-4" style={{ minHeight: "80vh" }}>
        <div className="flex-grow-1 position-relative">
          <canvas
            ref={canvasRef}
            width={canvasDims.width}
            height={canvasDims.height}
            onMouseDown={(e) => {
              if (!selectedImage) {
                startDraw(e);
              } else {
                handleMouseDown(e);
              }
            }}
            onMouseMove={(e) => {
              if (isDrawing) {
                draw(e);
              } else if (selectedImage) {
                handleMouseMove(e);
              }
            }}
            onMouseUp={(e) => {
              if (isDrawing) {
                endDraw(e);
              } else if (selectedImage) {
                handleMouseUp();
              }
            }}
            onMouseLeave={(e) => {
              if (isDrawing) {
                endDraw(e);
              } else if (selectedImage) {
                handleMouseUp();
              }
            }}
            style={{
              backgroundColor: "#ffffff",
              border: "2px solid #2c2c2c",
              borderRadius: "8px",
              cursor: isDragging ? "grabbing" : "crosshair",
              display: "block",
              width: "100%",
              height: "100%",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
            }}
          />
        </div>

        <div style={{
          width: "280px",
          background: "#2c2c2c",
          borderRadius: "8px",
          padding: "1.5rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}>
          <div className="control-group">
            <label className="form-label text-white mb-3 fw-bold">Drawing Tools</label>
            <div className="btn-group w-100" role="group">
              <button 
                type="button" 
                className={`btn ${shape === 'freehand' ? 'btn-primary' : 'btn-outline-light'}`}
                onClick={() => setShape('freehand')}
                title="Freehand"
              >
                ✍️
              </button>
              <button 
                type="button" 
                className={`btn ${shape === 'line' ? 'btn-primary' : 'btn-outline-light'}`}
                onClick={() => setShape('line')}
                title="Line"
              >
                —
              </button>
              <button 
                type="button" 
                className={`btn ${shape === 'rectangle' ? 'btn-primary' : 'btn-outline-light'}`}
                onClick={() => setShape('rectangle')}
                title="Rectangle"
              >
                ⬜
              </button>
              <button 
                type="button" 
                className={`btn ${shape === 'circle' ? 'btn-primary' : 'btn-outline-light'}`}
                onClick={() => setShape('circle')}
                title="Circle"
              >
                ⚪
              </button>
            </div>
          </div>

          <div className="control-group">
            <label className="form-label text-white mb-3 fw-bold">Pen Size</label>
            <div className="input-group">
              <button 
                type="button" 
                className="btn btn-outline-light"
                onClick={() => setPenSize(prev => Math.max(1, prev - 1))}
              >
                <i className="fas fa-minus"></i>
              </button>
              <input
                type="number"
                value={penSize}
                onChange={(e) => setPenSize(Math.max(1, Number(e.target.value)))}
                className="form-control text-center bg-dark text-white border-secondary"
                min="1"
              />
              <button 
                type="button" 
                className="btn btn-outline-light"
                onClick={() => setPenSize(prev => prev + 1)}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <div className="control-group">
            <label className="form-label text-white mb-3 fw-bold">Color</label>
            <input
              type="color"
              value={penColor}
              onChange={(e) => setPenColor(e.target.value)}
              className="form-control form-control-color w-100 bg-dark border-secondary"
            />
          </div>

          <div className="control-group">
            <label className="form-label text-white mb-3 fw-bold">Upload Image</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              accept="image/*"
            />
            <button 
              type="button" 
              className="btn btn-primary w-100"
              onClick={() => fileInputRef.current.click()}
            >
              <i className="fas fa-upload me-2"></i>Upload Image
            </button>
          </div>

          <button 
            className="btn btn-danger w-100 mt-auto"
            onClick={clearCanvas}
          >
            <i className="fas fa-trash me-2"></i>Clear Canvas
          </button>
        </div>
      </div>
    </div>
  );
};

export default Draw;
