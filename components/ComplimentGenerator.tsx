import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import Button from './Button';
import { COMPLIMENTS } from '../constants';

const ComplimentGenerator: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleNext = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 500);
    setIndex((prev) => (prev + 1) % COMPLIMENTS.length);
  };

  return (
    <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full translate-x-1/4 translate-y-1/4" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <motion.div 
            animate={{ rotate: isSpinning ? 180 : 0 }}
            className="bg-white/20 p-4 rounded-full backdrop-blur-sm"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-8">Your Daily Validation</h2>

        <div className="h-32 flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl md:text-2xl font-medium font-display"
            >
              "{COMPLIMENTS[index]}"
            </motion.p>
          </AnimatePresence>
        </div>

        <Button 
          onClick={handleNext} 
          variant="secondary"
          className="mx-auto"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isSpinning ? 'animate-spin' : ''}`} />
          Tell Me More
        </Button>
      </div>
    </div>
  );
};

export default ComplimentGenerator;