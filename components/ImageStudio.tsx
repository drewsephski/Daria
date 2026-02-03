import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sparkles, Image as ImageIcon, Wand2, Download, X, ZoomIn, Palette, Ratio, Crop, Check } from 'lucide-react';
import Button from './Button';

// Helper to convert file to base64
const fileToGenerativePart = async (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        data: base64Data,
        mimeType: file.type,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const ImageStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'edit' | 'generate'>('generate');
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('1:1');
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeFilter, setActiveFilter] = useState('none');
  
  // Cropping State
  const [isCropping, setIsCropping] = useState(false);
  const [cropSelection, setCropSelection] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleTabChange = (tab: 'edit' | 'generate') => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    // Clear state on tab switch
    setPrompt('');
    setGeneratedImage(null);
    setSelectedImage(null);
    setSelectedFile(null);
    setIsZoomed(false);
    setActiveFilter('none');
    setIsCropping(false);
    setCropSelection(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target?.result as string);
      reader.readAsDataURL(file);
      setGeneratedImage(null); // Clear previous result
      setActiveFilter('none');
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    if (activeTab === 'edit' && !selectedFile) return;

    setLoading(true);
    setGeneratedImage(null);
    setIsZoomed(false);
    setActiveFilter('none');
    setIsCropping(false);
    setCropSelection(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (activeTab === 'generate') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: { parts: [{ text: prompt }] },
          config: {
            imageConfig: {
              imageSize: imageSize,
              aspectRatio: aspectRatio
            }
          }
        });

        // Extract image
        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (part?.inlineData) {
            setGeneratedImage(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        }
      } else {
        // Edit mode
        if (!selectedFile) return;
        const imagePart = await fileToGenerativePart(selectedFile);
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: imagePart },
              { text: prompt }
            ]
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio
            }
          }
        });

        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (part?.inlineData) {
            setGeneratedImage(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        }
      }

    } catch (error) {
      console.error("Error generating image:", error);
      alert("Oops! The creative juices got stuck. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const img = new Image();
    img.src = generatedImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Apply active filters to the canvas context before drawing
      if (activeFilter !== 'none') {
        switch(activeFilter) {
            case 'grayscale': ctx.filter = 'grayscale(100%)'; break;
            case 'sepia': ctx.filter = 'sepia(100%)'; break;
            case 'invert': ctx.filter = 'invert(100%)'; break;
        }
      }

      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `daria-studio-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  // Crop Handlers
  const handleCropMouseDown = (e: React.MouseEvent) => {
    if (!isCropping || !imageRef.current) return;
    e.preventDefault();
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDraggingCrop(true);
    setDragStart({ x, y });
    setCropSelection({ x, y, w: 0, h: 0 });
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCrop || !dragStart || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const currentY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    const width = currentX - dragStart.x;
    const height = currentY - dragStart.y;

    setCropSelection({
        x: width > 0 ? dragStart.x : currentX,
        y: height > 0 ? dragStart.y : currentY,
        w: Math.abs(width),
        h: Math.abs(height)
    });
  };

  const handleCropMouseUp = () => {
    setIsDraggingCrop(false);
    setDragStart(null);
  };

  const applyCrop = () => {
    if (!cropSelection || !imageRef.current || !generatedImage) return;
    
    const imgElement = imageRef.current;
    const naturalWidth = imgElement.naturalWidth;
    const naturalHeight = imgElement.naturalHeight;
    const displayedWidth = imgElement.width;
    const displayedHeight = imgElement.height;
    
    const scaleX = naturalWidth / displayedWidth;
    const scaleY = naturalHeight / displayedHeight;

    const canvas = document.createElement('canvas');
    canvas.width = cropSelection.w * scaleX;
    canvas.height = cropSelection.h * scaleY;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const img = new Image();
    img.src = generatedImage;
    img.onload = () => {
        ctx.drawImage(
            img,
            cropSelection.x * scaleX,
            cropSelection.y * scaleY,
            cropSelection.w * scaleX,
            cropSelection.h * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );
        setGeneratedImage(canvas.toDataURL('image/png'));
        setIsCropping(false);
        setCropSelection(null);
    };
  };

  const getFilterStyle = (filter: string) => {
    switch(filter) {
        case 'grayscale': return { filter: 'grayscale(100%)' };
        case 'sepia': return { filter: 'sepia(100%)' };
        case 'invert': return { filter: 'invert(100%)' };
        default: return { filter: 'none' };
    }
  };

  return (
    <>
      <section id="studio" className="py-24 px-6 bg-pink-50 relative overflow-hidden">
          {/* Background blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

          <div className="container mx-auto max-w-4xl relative z-10">
              <div className="text-center mb-12">
                  <span className="inline-block px-3 py-1 bg-white text-pink-500 rounded-full text-xs font-bold tracking-wider mb-4 border border-pink-100 shadow-sm uppercase">
                      The Studio
                  </span>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-display">
                      Create <span className="text-pink-500">Something Beautiful</span>
                  </h2>
                  <p className="text-gray-600 text-lg max-w-xl mx-auto">
                      Make art. Edit photos. Try to impress her.
                  </p>
              </div>

              <div className="bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
                  {/* Tabs */}
                  <div className="flex border-b border-pink-100">
                      <button 
                          onClick={() => handleTabChange('generate')}
                          className={`flex-1 py-4 text-center font-bold text-sm md:text-base transition-colors flex items-center justify-center gap-2
                              ${activeTab === 'generate' ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-500' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                          <Sparkles className="w-4 h-4" />
                          Create
                      </button>
                      <button 
                          onClick={() => handleTabChange('edit')}
                          className={`flex-1 py-4 text-center font-bold text-sm md:text-base transition-colors flex items-center justify-center gap-2
                              ${activeTab === 'edit' ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-500' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                          <Wand2 className="w-4 h-4" />
                          Remix
                      </button>
                  </div>

                  <div className="p-8">
                      <div className="flex flex-col md:flex-row gap-8">
                          {/* Controls */}
                          <div className="flex-1">
                              <AnimatePresence mode="wait">
                                  <motion.div
                                      key={activeTab}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 20 }}
                                      transition={{ duration: 0.2 }}
                                      className="space-y-6"
                                  >
                                      {activeTab === 'edit' && (
                                          <div 
                                              onClick={() => fileInputRef.current?.click()}
                                              className={`border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group
                                                  ${selectedImage ? 'border-pink-300 bg-pink-50' : 'border-gray-200 hover:border-pink-400 hover:bg-pink-50/50'}`}
                                          >
                                              {selectedImage ? (
                                                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                              ) : (
                                                  <div className="text-center p-6">
                                                      <div className="bg-white p-3 rounded-full shadow-sm inline-block mb-3">
                                                          <Upload className="w-6 h-6 text-pink-400" />
                                                      </div>
                                                      <p className="text-gray-500 font-medium text-sm">Upload a photo to fix</p>
                                                  </div>
                                              )}
                                              {selectedImage && (
                                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                      <span className="bg-white/90 px-4 py-2 rounded-full text-pink-600 font-bold text-sm shadow-sm">Change Image</span>
                                                  </div>
                                              )}
                                              <input 
                                                  type="file" 
                                                  ref={fileInputRef} 
                                                  className="hidden" 
                                                  accept="image/*" 
                                                  onChange={handleImageSelect} 
                                              />
                                          </div>
                                      )}

                                      <div>
                                          <label className="block text-sm font-bold text-gray-700 mb-2">
                                              {activeTab === 'generate' ? 'Your Vision' : 'The Edit'}
                                          </label>
                                          <textarea
                                              value={prompt}
                                              onChange={(e) => setPrompt(e.target.value)}
                                              placeholder={activeTab === 'generate' ? "Surprise her with something artistic..." : "Make it cooler, add glitter, remove the ex..."}
                                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all resize-none h-32"
                                          />
                                      </div>

                                      {activeTab === 'generate' && (
                                          <div>
                                              <label className="block text-sm font-bold text-gray-700 mb-2">Resolution</label>
                                              <div className="flex gap-2">
                                                  {(['1K', '2K', '4K'] as const).map(size => (
                                                      <button
                                                          key={size}
                                                          onClick={() => setImageSize(size)}
                                                          className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all
                                                              ${imageSize === size 
                                                                  ? 'bg-pink-100 text-pink-700 border-pink-300' 
                                                                  : 'bg-white text-gray-500 border-gray-200 hover:border-pink-200'}`}
                                                      >
                                                          {size}
                                                      </button>
                                                  ))}
                                              </div>
                                          </div>
                                      )}

                                      <div>
                                          <label className="block text-sm font-bold text-gray-700 mb-2">Aspect Ratio</label>
                                          <div className="flex gap-2 flex-wrap">
                                              {(['1:1', '3:4', '4:3', '9:16', '16:9'] as const).map(ratio => (
                                                  <button
                                                      key={ratio}
                                                      onClick={() => setAspectRatio(ratio)}
                                                      className={`flex-1 min-w-[60px] py-2 rounded-lg text-xs font-bold border transition-all
                                                          ${aspectRatio === ratio 
                                                              ? 'bg-pink-100 text-pink-700 border-pink-300' 
                                                              : 'bg-white text-gray-500 border-gray-200 hover:border-pink-200'}`}
                                                  >
                                                      {ratio}
                                                  </button>
                                              ))}
                                          </div>
                                      </div>

                                      {generatedImage && (
                                          <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4"
                                          >
                                              <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                                                        <Palette className="w-4 h-4 text-pink-500" />
                                                        Filters
                                                    </label>
                                                    
                                                    <button
                                                        onClick={() => {
                                                            setIsCropping(!isCropping);
                                                            setCropSelection(null);
                                                        }}
                                                        className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 transition-colors ${isCropping ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                    >
                                                        <Crop className="w-3 h-3" />
                                                        {isCropping ? 'Cancel Crop' : 'Crop Tool'}
                                                    </button>
                                                </div>
                                                <div className={`flex flex-wrap gap-2 transition-opacity ${isCropping ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                                    {['none', 'grayscale', 'sepia', 'invert'].map(f => (
                                                        <button
                                                            key={f}
                                                            onClick={() => setActiveFilter(f)}
                                                            className={`flex-1 min-w-[70px] py-2 rounded-lg text-xs font-bold border transition-all capitalize
                                                                ${activeFilter === f 
                                                                    ? 'bg-pink-100 text-pink-700 border-pink-300' 
                                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-pink-200'}`}
                                                        >
                                                            {f}
                                                        </button>
                                                    ))}
                                                </div>
                                              </div>

                                              <Button 
                                                  variant="secondary" 
                                                  fullWidth 
                                                  onClick={handleDownload}
                                                  disabled={isCropping}
                                                  className={`border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 ${isCropping ? 'opacity-50' : ''}`}
                                              >
                                                  <Download className="w-4 h-4" />
                                                  Download Masterpiece
                                              </Button>
                                          </motion.div>
                                      )}

                                      <Button 
                                          fullWidth 
                                          onClick={handleGenerate}
                                          disabled={loading || !prompt || (activeTab === 'edit' && !selectedFile)}
                                          className={loading ? 'opacity-70 cursor-wait' : ''}
                                      >
                                          {loading ? (
                                              <span className="flex items-center gap-2">
                                                  <Sparkles className="w-4 h-4 animate-spin" />
                                                  Working magic...
                                              </span>
                                          ) : (
                                              <span className="flex items-center gap-2">
                                                  <Wand2 className="w-4 h-4" />
                                                  {activeTab === 'generate' ? 'Manifest It' : 'Fix It'}
                                              </span>
                                          )}
                                      </Button>
                                  </motion.div>
                              </AnimatePresence>
                          </div>

                          {/* Result Area */}
                          <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center min-h-[300px] relative overflow-hidden select-none">
                              <AnimatePresence mode="wait">
                                  {loading ? (
                                      <motion.div
                                          key="loader"
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          className="w-full h-full p-8 flex flex-col items-center justify-center"
                                      >
                                          <div className="w-full max-w-sm aspect-square bg-white rounded-xl overflow-hidden relative shadow-inner border border-gray-100">
                                              <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 translate-x-[-150%] animate-[shimmer_1.5s_infinite]" />
                                              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                                  <Sparkles className="w-12 h-12 text-pink-300 animate-pulse" />
                                              </div>
                                          </div>
                                          <p className="mt-6 text-pink-500 font-bold text-sm animate-pulse flex items-center gap-2">
                                              <Sparkles className="w-4 h-4 animate-spin" />
                                              Consulting the creative spirits...
                                          </p>
                                      </motion.div>
                                  ) : generatedImage ? (
                                      <motion.div 
                                          key="result"
                                          initial={{ opacity: 0, scale: 0.9 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0 }}
                                          className="relative w-full h-full flex items-center justify-center p-2"
                                          onMouseDown={isCropping ? handleCropMouseDown : undefined}
                                          onMouseMove={isCropping ? handleCropMouseMove : undefined}
                                          onMouseUp={isCropping ? handleCropMouseUp : undefined}
                                          onMouseLeave={isCropping ? handleCropMouseUp : undefined}
                                      >
                                          <div 
                                              className={`relative group ${isCropping ? 'cursor-crosshair' : 'cursor-zoom-in'}`}
                                              onClick={!isCropping ? () => setIsZoomed(true) : undefined}
                                          >
                                              <img 
                                                  ref={imageRef}
                                                  src={generatedImage} 
                                                  alt="Generated" 
                                                  className="max-w-full max-h-[400px] rounded-lg shadow-lg transition-all duration-300 select-none drag-none" 
                                                  style={getFilterStyle(activeFilter)}
                                                  draggable={false}
                                              />
                                              
                                              {/* Zoom Overlay (Only if not cropping) */}
                                              {!isCropping && (
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center pointer-events-none">
                                                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                                </div>
                                              )}

                                              {/* Crop Overlay */}
                                              {isCropping && (
                                                <div className="absolute inset-0 z-10 rounded-lg overflow-hidden">
                                                    {/* Dimmed Overlay */}
                                                    <div className="absolute inset-0 bg-black/50 pointer-events-none" />
                                                    
                                                    {/* Selection Box */}
                                                    {cropSelection && cropSelection.w > 0 && (
                                                        <div 
                                                            className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none"
                                                            style={{
                                                                left: cropSelection.x,
                                                                top: cropSelection.y,
                                                                width: cropSelection.w,
                                                                height: cropSelection.h
                                                            }}
                                                        >
                                                            {/* Grid Lines */}
                                                            <div className="absolute inset-0 flex flex-col">
                                                                <div className="flex-1 border-b border-white/30" />
                                                                <div className="flex-1 border-b border-white/30" />
                                                                <div className="flex-1" />
                                                            </div>
                                                            <div className="absolute inset-0 flex">
                                                                <div className="flex-1 border-r border-white/30" />
                                                                <div className="flex-1 border-r border-white/30" />
                                                                <div className="flex-1" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                              )}

                                              {/* Crop Actions */}
                                              {isCropping && cropSelection && cropSelection.w > 20 && (
                                                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                                                      <button 
                                                          onClick={(e) => {
                                                              e.stopPropagation();
                                                              applyCrop();
                                                          }}
                                                          className="bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-600 transition-colors"
                                                          title="Apply Crop"
                                                      >
                                                          <Check className="w-5 h-5" />
                                                      </button>
                                                      <button 
                                                          onClick={(e) => {
                                                              e.stopPropagation();
                                                              setCropSelection(null);
                                                          }}
                                                          className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                                          title="Clear Selection"
                                                      >
                                                          <X className="w-5 h-5" />
                                                      </button>
                                                  </div>
                                              )}
                                          </div>
                                          
                                          {!isCropping && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownload();
                                                }}
                                                className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow-md text-gray-700 hover:text-pink-600 transition-colors z-10"
                                                title="Download"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                          )}
                                      </motion.div>
                                  ) : (
                                      <motion.div
                                          key="placeholder"
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          className="text-center p-8"
                                      >
                                          <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
                                              <ImageIcon className="w-8 h-8 text-gray-300" />
                                          </div>
                                          <p className="text-gray-400 font-medium">
                                              Greatness awaits.
                                          </p>
                                      </motion.div>
                                  )}
                              </AnimatePresence>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Zoom Modal Overlay */}
      <AnimatePresence>
          {isZoomed && generatedImage && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                  onClick={() => setIsZoomed(false)}
              >
                  <button
                      onClick={() => setIsZoomed(false)}
                      className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full z-[110]"
                  >
                      <X className="w-8 h-8" />
                  </button>
                  
                  <motion.img
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      src={generatedImage}
                      alt="Generated Fullscreen"
                      className="max-w-full max-h-full rounded-lg shadow-2xl cursor-zoom-out object-contain"
                      style={getFilterStyle(activeFilter)}
                      onClick={(e) => {
                          e.stopPropagation();
                          setIsZoomed(false);
                      }}
                  />
              </motion.div>
          )}
      </AnimatePresence>
    </>
  );
};

export default ImageStudio;