import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sparkles, Image as ImageIcon, Wand2, Download } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target?.result as string);
      reader.readAsDataURL(file);
      setGeneratedImage(null); // Clear previous result
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    if (activeTab === 'edit' && !selectedFile) return;

    setLoading(true);
    setGeneratedImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (activeTab === 'generate') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: { parts: [{ text: prompt }] },
          config: {
            imageConfig: {
              imageSize: imageSize,
              aspectRatio: "1:1"
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

  return (
    <section id="studio" className="py-24 px-6 bg-pink-50 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto max-w-4xl relative z-10">
            <div className="text-center mb-12">
                <span className="inline-block px-3 py-1 bg-white text-pink-500 rounded-full text-xs font-bold tracking-wider mb-4 border border-pink-100 shadow-sm uppercase">
                    New Feature
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-display">
                    Daria's <span className="text-pink-500">Digital Studio</span>
                </h2>
                <p className="text-gray-600 text-lg max-w-xl mx-auto">
                    Create art from thin air or remix your photos. Warning: Results may be too cool to handle.
                </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-pink-100">
                    <button 
                        onClick={() => { setActiveTab('generate'); setGeneratedImage(null); }}
                        className={`flex-1 py-4 text-center font-bold text-sm md:text-base transition-colors flex items-center justify-center gap-2
                            ${activeTab === 'generate' ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-500' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Sparkles className="w-4 h-4" />
                        Generate Art
                    </button>
                    <button 
                        onClick={() => { setActiveTab('edit'); setGeneratedImage(null); }}
                        className={`flex-1 py-4 text-center font-bold text-sm md:text-base transition-colors flex items-center justify-center gap-2
                            ${activeTab === 'edit' ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-500' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Wand2 className="w-4 h-4" />
                        Remix Photo
                    </button>
                </div>

                <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Controls */}
                        <div className="flex-1 space-y-6">
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
                                            <p className="text-gray-500 font-medium text-sm">Click to upload image</p>
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
                                    {activeTab === 'generate' ? 'Describe the masterpiece' : 'What should I change?'}
                                </label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={activeTab === 'generate' ? "A cat wearing sunglasses on Mars..." : "Add a retro filter, remove the background..."}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all resize-none h-32"
                                />
                            </div>

                            {activeTab === 'generate' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Image Size</label>
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

                            <Button 
                                fullWidth 
                                onClick={handleGenerate}
                                disabled={loading || !prompt || (activeTab === 'edit' && !selectedFile)}
                                className={loading ? 'opacity-70 cursor-wait' : ''}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 animate-spin" />
                                        Creating Magic...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Wand2 className="w-4 h-4" />
                                        {activeTab === 'generate' ? 'Generate Image' : 'Remix Image'}
                                    </span>
                                )}
                            </Button>
                        </div>

                        {/* Result Area */}
                        <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center min-h-[300px] relative overflow-hidden">
                            <AnimatePresence mode="wait">
                                {generatedImage ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="relative w-full h-full flex items-center justify-center p-2"
                                    >
                                        <img src={generatedImage} alt="Generated" className="max-w-full max-h-[400px] rounded-lg shadow-lg" />
                                        <a 
                                            href={generatedImage} 
                                            download={`daria-studio-${Date.now()}.png`}
                                            className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow-md text-gray-700 hover:text-pink-600 transition-colors"
                                            title="Download"
                                        >
                                            <Download className="w-5 h-5" />
                                        </a>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center p-8"
                                    >
                                        <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
                                            <ImageIcon className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-gray-400 font-medium">
                                            {loading ? "Consulting the creative spirits..." : "Your masterpiece will appear here"}
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
  );
};

export default ImageStudio;
