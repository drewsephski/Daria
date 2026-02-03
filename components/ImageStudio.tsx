import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fal } from "@fal-ai/client";
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sparkles, Image as ImageIcon, Wand2, Download, X, ZoomIn, Palette, Crop, Check } from 'lucide-react';
import Button from './Button';

// ============================================================================
// BEST PRACTICE #1: Move helper functions outside component for reusability
// ============================================================================

const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const base64ToBlobUrl = (base64String: string): string => {
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  const blob = new Blob([u8arr], { type: mime });
  return URL.createObjectURL(blob);
};

// ============================================================================
// BEST PRACTICE #2: Use constants for aspect ratios and sizes
// ============================================================================

const ASPECT_RATIO_MAP = {
  '1:1': { width: 1024, height: 1024 },
  '3:4': { width: 768, height: 1024 },
  '4:3': { width: 1024, height: 768 },
  '9:16': { width: 576, height: 1024 },
  '16:9': { width: 1024, height: 576 },
} as const;

// ============================================================================
// BEST PRACTICE #3: Initialize Fal client once at module level
// ============================================================================

const initializeFalClient = (apiKey?: string) => {
  const key = apiKey || (import.meta.env?.VITE_FAL_API_KEY) || (process.env?.FAL_API_KEY);
  if (key) {
    fal.config({
      credentials: key,
    });
    return true;
  }
  return false;
};

// ============================================================================
// BEST PRACTICE #4: Separate API call logic with proper typing
// ============================================================================

interface GenerateInput {
  prompt: string;
  aspectRatio: keyof typeof ASPECT_RATIO_MAP;
}

interface EditInput {
  prompt: string;
  imageUrl: string;
}

const generateImage = async (input: GenerateInput): Promise<string | null> => {
  try {
    console.log("[Fal] Starting image generation with input:", {
      prompt: input.prompt,
      aspectRatio: input.aspectRatio,
    });

    const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
      input: {
        prompt: input.prompt,
        aspect_ratio: input.aspectRatio,
        num_images: 1,
        enable_safety_checker: true,
        output_format: "png",
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log("[Fal] Queue update:", update.status);
      },
    });

    console.log("[Fal] Generation result structure:", {
      hasData: !!(result as any).data,
      hasImages: !!(result as any).data?.images,
      imagesLength: (result as any).data?.images?.length,
      firstImageUrl: (result as any).data?.images?.[0]?.url
    });

    // Check both possible response structures
    const imageUrl = (result as any).data?.images?.[0]?.url || (result as any).images?.[0]?.url || null;
    
    if (!imageUrl) {
      console.error("[Fal] No image URL found in response:", result);
    }
    
    return imageUrl;
  } catch (error) {
    console.error("[Fal] Image generation failed:", error);
    throw error;
  }
};

const editImage = async (input: EditInput): Promise<string | null> => {
  try {
    console.log("[Fal] Starting image edit with input:", {
      prompt: input.prompt,
      hasImageUrl: !!input.imageUrl,
      imageUrlLength: input.imageUrl?.length
    });

    const result = await fal.subscribe("xai/grok-imagine-image/edit", {
      input: {
        image_url: input.imageUrl,
        prompt: input.prompt,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("[Fal] Edit queue update:", update.status);
        }
      },
    });

    console.log("[Fal] Edit result structure:", {
      hasData: !!(result as any).data,
      hasImages: !!(result as any).data?.images,
      imagesLength: (result as any).data?.images?.length,
      firstImageUrl: (result as any).data?.images?.[0]?.url,
      hasDirectImages: !!(result as any).images,
      directImagesLength: (result as any).images?.length,
      firstDirectImageUrl: (result as any).images?.[0]?.url
    });

    // Check both possible response structures
    const imageUrl = (result as any).data?.images?.[0]?.url || (result as any).images?.[0]?.url || null;
    
    if (!imageUrl) {
      console.error("[Fal] No image URL found in edit response:", result);
    }
    
    return imageUrl;
  } catch (error) {
    console.error("[Fal] Image editing failed:", error);
    throw error;
  }
};

// ============================================================================
// BEST PRACTICE #5: Separate component-level helper functions
// ============================================================================

const getFilterStyle = (filter: string) => {
  const filterMap: Record<string, { filter: string }> = {
    grayscale: { filter: 'grayscale(100%)' },
    sepia: { filter: 'sepia(100%)' },
    invert: { filter: 'invert(100%)' },
    none: { filter: 'none' },
  };
  return filterMap[filter] || filterMap.none;
};

const downloadImage = async (imageUrl: string, activeFilter: string) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error("Failed to get canvas context");

    if (activeFilter !== 'none') {
      ctx.filter = getFilterStyle(activeFilter).filter;
    }

    ctx.drawImage(img, 0, 0);
    
    const link = document.createElement('a');
    link.download = `daria-studio-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    URL.revokeObjectURL(img.src);
  } catch (error) {
    console.error("[Download] Error:", error);
    throw error;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ImageStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'edit' | 'generate'>('generate');
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<keyof typeof ASPECT_RATIO_MAP>('1:1');
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeFilter, setActiveFilter] = useState('none');
  const [error, setError] = useState<string | null>(null);
  
  // Cropping State
  const [isCropping, setIsCropping] = useState(false);
  const [cropSelection, setCropSelection] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // ============================================================================
  // BEST PRACTICE #6: Initialize Fal once on mount using useEffect
  // ============================================================================

  useEffect(() => {
    const initialized = initializeFalClient();
    if (!initialized) {
      console.warn("[Fal] API key not found. Image generation will fail.");
      setError("API key not configured");
    }
  }, []);

  const handleTabChange = useCallback((tab: 'edit' | 'generate') => {
    if (tab === activeTab) return;
    
    setActiveTab(tab);
    setPrompt('');
    setGeneratedImage(null);
    setSelectedImage(null);
    setSelectedFile(null);
    setIsZoomed(false);
    setActiveFilter('none');
    setIsCropping(false);
    setCropSelection(null);
    setError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [activeTab]);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setGeneratedImage(null);
        setActiveFilter('none');
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // ============================================================================
  // BEST PRACTICE #7: Separate handle logic from API calls
  // ============================================================================

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }
    if (activeTab === 'edit' && !selectedFile) {
      setError("Please upload an image to edit");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImage(null);
    setIsZoomed(false);
    setActiveFilter('none');
    setIsCropping(false);
    setCropSelection(null);

    try {
      let imageUrl: string | null = null;

      if (activeTab === 'generate') {
        console.log("[ImageStudio] Starting generation process");
        imageUrl = await generateImage({
          prompt: prompt.trim(),
          aspectRatio,
        });
      } else if (selectedFile) {
        console.log("[ImageStudio] Starting edit process");
        const base64Image = await fileToBase64(selectedFile);
        imageUrl = await editImage({
          prompt: prompt.trim(),
          imageUrl: base64Image,
        });
      }

      console.log("[ImageStudio] API call completed, imageUrl:", !!imageUrl);

      if (!imageUrl) {
        console.error("[ImageStudio] No image URL returned from API");
        throw new Error("No image returned from API");
      }

      console.log("[ImageStudio] Successfully generated image, setting state");
      setGeneratedImage(imageUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate image";
      console.error("[ImageStudio] Generation error:", err);
      
      // Provide more specific error messages based on common issues
      if (errorMessage.includes("API key")) {
        setError("API key not configured. Please check your environment variables.");
      } else if (errorMessage.includes("policy") || errorMessage.includes("safety")) {
        setError("Content policy violation. Please modify your prompt and try again.");
      } else if (errorMessage.includes("timeout")) {
        setError("Request timed out. Please try again.");
      } else if (errorMessage.includes("No image returned")) {
        setError("Failed to generate image. The API returned no image. Please try a different prompt.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [prompt, activeTab, selectedFile, aspectRatio]);

  const handleDownload = useCallback(async () => {
    if (!generatedImage) return;

    try {
      setError(null);
      await downloadImage(generatedImage, activeFilter);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to download image";
      setError(errorMessage);
      console.error("[ImageStudio] Download error:", err);
    }
  }, [generatedImage, activeFilter]);

  // Crop Handlers
  const handleCropMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isCropping || !imageRef.current) return;
    e.preventDefault();
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDraggingCrop(true);
    setDragStart({ x, y });
    setCropSelection({ x, y, w: 0, h: 0 });
  }, [isCropping]);

  const handleCropMouseMove = useCallback((e: React.MouseEvent) => {
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
      h: Math.abs(height),
    });
  }, [isDraggingCrop, dragStart]);

  const handleCropMouseUp = useCallback(() => {
    setIsDraggingCrop(false);
    setDragStart(null);
  }, []);

  const applyCrop = useCallback(() => {
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
  }, [cropSelection, generatedImage]);

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
                className={`flex-1 py-4 text-center font-bold text-sm md:text-base transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'generate' 
                    ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-500' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Create
              </button>
              <button 
                onClick={() => handleTabChange('edit')}
                className={`flex-1 py-4 text-center font-bold text-sm md:text-base transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'edit' 
                    ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-500' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
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
                      {/* Error Display */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm font-medium"
                        >
                          {error}
                        </motion.div>
                      )}

                      {activeTab === 'edit' && (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${
                            selectedImage 
                              ? 'border-pink-300 bg-pink-50' 
                              : 'border-gray-200 hover:border-pink-400 hover:bg-pink-50/50'
                          }`}
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
                          onChange={(e) => {
                            setPrompt(e.target.value);
                            setError(null);
                          }}
                          placeholder={activeTab === 'generate' ? "Surprise her with something artistic..." : "Make it cooler, add glitter, remove the ex..."}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all resize-none h-32"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {activeTab === 'generate' ? 'Aspect Ratio' : 'The Edit'}
                        </label>
                        {activeTab === 'generate' ? (
                          <div className="flex gap-2 flex-wrap">
                            {(Object.keys(ASPECT_RATIO_MAP) as Array<keyof typeof ASPECT_RATIO_MAP>).map(ratio => (
                              <button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                className={`flex-1 min-w-[60px] py-2 rounded-lg text-xs font-bold border transition-all ${
                                  aspectRatio === ratio 
                                    ? 'bg-pink-100 text-pink-700 border-pink-300' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-pink-200'
                                }`}
                              >
                                {ratio}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                            Aspect ratio is preserved from original image
                          </div>
                        )}
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
                                className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                                  isCropping 
                                    ? 'bg-pink-500 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
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
                                  className={`flex-1 min-w-[70px] py-2 rounded-lg text-xs font-bold border transition-all capitalize ${
                                    activeFilter === f 
                                      ? 'bg-pink-100 text-pink-700 border-pink-300' 
                                      : 'bg-white text-gray-500 border-gray-200 hover:border-pink-200'
                                  }`}
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
                            disabled={isCropping || loading}
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
                        disabled={loading || !prompt.trim() || (activeTab === 'edit' && !selectedFile)}
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
                            crossOrigin="anonymous"
                          />
                          
                          {!isCropping && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center pointer-events-none">
                              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                            </div>
                          )}

                          {isCropping && (
                            <div className="absolute inset-0 z-10 rounded-lg overflow-hidden">
                              <div className="absolute inset-0 bg-black/50 pointer-events-none" />
                              
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
              crossOrigin="anonymous"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageStudio;