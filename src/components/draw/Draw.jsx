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

  // Node and connection states
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingNodeId, setConnectingNodeId] = useState(null);

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

  // Redraw canvas whenever images, selection, or canvasDims change
  useEffect(() => {
    redrawCanvas();
    // eslint-disable-next-line
  }, [images, selectedImage, canvasDims]);

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
      const img = new window.Image();
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

        // Cache the image and then update state
        imageCacheRef.current.set(newImage.id, img);
        setImages(prev => [...prev, newImage]);
        setSelectedImage(newImage.id);
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

  // Helper: check if point is inside an image
  const getImageAtPoint = (x, y) => {
    for (let i = images.length - 1; i >= 0; i--) { // topmost first
      const imgData = images[i];
      const dx = x - (imgData.x + imgData.width / 2);
      const dy = y - (imgData.y + imgData.height / 2);
      const rotatedX = dx * Math.cos(-imgData.rotation * Math.PI / 180) - dy * Math.sin(-imgData.rotation * Math.PI / 180);
      const rotatedY = dx * Math.sin(-imgData.rotation * Math.PI / 180) + dy * Math.cos(-imgData.rotation * Math.PI / 180);
      if (Math.abs(rotatedX) < imgData.width / 2 && Math.abs(rotatedY) < imgData.height / 2) {
        return imgData;
      }
    }
    return null;
  };

  // Drawing and image manipulation logic
  const handleCanvasMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const img = getImageAtPoint(x, y);
    if (img) {
      setSelectedImage(img.id);
      // Check if clicked on resize handle
      const handleSize = 8;
      const handles = [
        { x: img.x, y: img.y },
        { x: img.x + img.width, y: img.y },
        { x: img.x + img.width, y: img.y + img.height },
        { x: img.x, y: img.y + img.height }
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
    } else {
      setSelectedImage(null);
      startDraw(e);
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
    setNodes([]);
    setConnections([]);
  };

  // Handle create node button
  const handleCreateNodeClick = () => {
    setIsCreatingNode(true);
  };

  // Handle placing a node on canvas (use pageX/pageY for absolute positioning)
  const handleCanvasForNode = (e) => {
    if (!isCreatingNode) return;
    const parentRect = e.target.getBoundingClientRect();
    const x = e.clientX - parentRect.left;
    const y = e.clientY - parentRect.top;
    const newNode = {
      id: Date.now(),
      x,
      y,
      width: 180,
      height: 100,
      title: 'Node',
      context: '',
    };
    setNodes(prev => [...prev, newNode]);
    setIsCreatingNode(false);
  };

  // Node dragging logic
  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setDraggedNodeId(nodeId);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    });
    // Add event listeners to document for dragging outside parent
    document.addEventListener('mousemove', handleNodeMouseMove);
    document.addEventListener('mouseup', handleNodeMouseUp);
  };

  const handleNodeMouseMove = (e) => {
    if (draggedNodeId === null) return;
    setNodes(prevNodes => prevNodes.map(node => {
      if (node.id === draggedNodeId) {
        return {
          ...node,
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        };
      }
      return node;
    }));
  };

  const handleNodeMouseUp = () => {
    setDraggedNodeId(null);
    document.removeEventListener('mousemove', handleNodeMouseMove);
    document.removeEventListener('mouseup', handleNodeMouseUp);
  };

  // Node editing
  const handleNodeTitleChange = (id, value) => {
    setNodes(prevNodes => prevNodes.map(node => node.id === id ? { ...node, title: value } : node));
  };
  const handleNodeContextChange = (id, value) => {
    setNodes(prevNodes => prevNodes.map(node => node.id === id ? { ...node, context: value } : node));
  };

  // Connection logic
  const handleConnectorClick = (nodeId) => {
    if (connectingNodeId === null) {
      setConnectingNodeId(nodeId);
    } else if (connectingNodeId !== nodeId) {
      setConnections(prev => [...prev, { from: connectingNodeId, to: nodeId }]);
      setConnectingNodeId(null);
    } else {
      setConnectingNodeId(null);
    }
  };

  // Delete node and its connections
  const handleDeleteNode = (nodeId) => {
    setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
    setConnections(prevConnections => prevConnections.filter(conn => conn.from !== nodeId && conn.to !== nodeId));
  };

  // Render connections as SVG lines
  const renderConnections = () => {
    return (
      <svg
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 50,
        }}
      >
        {connections.map((conn, idx) => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          if (!fromNode || !toNode) return null;
          const x1 = fromNode.x + fromNode.width / 2;
          const y1 = fromNode.y + fromNode.height / 2;
          const x2 = toNode.x + toNode.width / 2;
          const y2 = toNode.y + toNode.height / 2;
          return (
            <line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#007bff"
              strokeWidth={3}
              markerEnd="url(#arrowhead)"
            />
          );
        })}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L8,4 L0,8" fill="#007bff" />
          </marker>
        </defs>
      </svg>
    );
  };

  return (
    <div className="container-fluid p-4 bg-dark min-vh-100"
      onMouseMove={handleNodeMouseMove}
      onMouseUp={handleNodeMouseUp}
      onMouseLeave={handleNodeMouseUp}
    >
      <h3 className="text-white text-center fw-bold font-monospace mb-4">
        <span className="border-bottom border-danger pb-2">FLOW <span className="text-danger">BOARD</span></span>
      </h3>

      <div className="d-flex flex-row w-100 gap-4" style={{ minHeight: "80vh" }}>
        <div className="flex-grow-1 position-relative" style={{overflow: 'visible'}}>
          <canvas
            ref={canvasRef}
            width={canvasDims.width}
            height={canvasDims.height}
            onMouseDown={isCreatingNode ? handleCanvasForNode : handleCanvasMouseDown}
            onMouseMove={(e) => {
              if (isDrawing) {
                draw(e);
              } else if (selectedImage && (isDragging || isResizing)) {
                handleMouseMove(e);
              }
            }}
            onMouseUp={(e) => {
              if (isDrawing) {
                endDraw(e);
              } else if (selectedImage && (isDragging || isResizing)) {
                handleMouseUp();
              }
            }}
            onMouseLeave={(e) => {
              if (isDrawing) {
                endDraw(e);
              } else if (selectedImage && (isDragging || isResizing)) {
                handleMouseUp();
              }
            }}
            style={{
              backgroundColor: "#ffffff",
              border: "2px solid #2c2c2c",
              borderRadius: "8px",
              cursor: isCreatingNode ? "crosshair" : isDragging ? "grabbing" : "crosshair",
              display: "block",
              width: "100%",
              height: "100%",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
            }}
          />
          {/* Render connections (lines) here */}
          {renderConnections()}
          {/* Render nodes as overlays */}
          {nodes.map(node => (
            <div
              key={node.id}
              className="node-box"
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
                background: '#fff',
                border: connectingNodeId === node.id ? '2px solid #28a745' : '2px solid #007bff',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                zIndex: 100,
                cursor: draggedNodeId === node.id ? 'grabbing' : 'grab',
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                userSelect: 'none',
                pointerEvents: 'auto',
              }}
              onMouseDown={e => handleNodeMouseDown(e, node.id)}
            >
              {/* Delete button */}
              <button
                style={{
                  position: 'absolute',
                  top: -14,
                  left: -14,
                  width: 32,
                  height: 32,
                  border: 'none',
                  background: '#dc3545',
                  color: '#fff',
                  fontSize: 18,
                  cursor: 'pointer',
                  zIndex: 102,
                  padding: 0,
                  borderRadius: '50%',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: '2px solid #fff',
                }}
                title="Delete Node"
                onClick={e => { e.stopPropagation(); handleDeleteNode(node.id); }}
              >
                <i className="fas fa-trash" style={{fontSize: 18, color: '#fff'}} />
              </button>
              <input
                className="form-control form-control-sm mb-1 fw-bold"
                style={{ border: 'none', borderBottom: '1px solid #007bff', background: 'transparent' }}
                value={node.title}
                onChange={e => handleNodeTitleChange(node.id, e.target.value)}
                placeholder="Node Title"
                onMouseDown={e => e.stopPropagation()}
              />
              <textarea
                className="form-control form-control-sm"
                style={{ border: 'none', background: 'transparent', resize: 'none', minHeight: 40 }}
                value={node.context}
                onChange={e => handleNodeContextChange(node.id, e.target.value)}
                placeholder="Context..."
                onMouseDown={e => e.stopPropagation()}
              />
              {/* Connector handle */}
              <div
                style={{
                  position: 'absolute',
                  right: -12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 20,
                  height: 20,
                  zIndex: 101,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={e => { e.stopPropagation(); handleConnectorClick(node.id); }}
                title={connectingNodeId === null ? 'Start connection' : (connectingNodeId === node.id ? 'Cancel connection' : 'Connect to this node')}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: connectingNodeId === node.id ? '#28a745' : '#007bff',
                    border: '2px solid #fff',
                    boxShadow: '0 0 2px #000',
                  }}
                />
              </div>
            </div>
          ))}
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
          <button
            className="btn btn-success w-100 mb-3"
            onClick={handleCreateNodeClick}
            disabled={isCreatingNode}
          >
            <i className="fas fa-project-diagram me-2"></i>
            Create Node
          </button>
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
