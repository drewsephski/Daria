import React from 'react';
import { motion } from 'framer-motion';
import { ReasonProps } from '../types';

const ReasonCard: React.FC<ReasonProps & { index: number }> = ({ title, description, icon, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ 
        y: -8,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
      }}
      className="bg-white p-6 rounded-2xl shadow-lg border border-pink-50 relative overflow-hidden group cursor-default"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-100 rounded-bl-full -mr-12 -mt-12 transition-colors group-hover:bg-pink-200" />
      
      <div className="relative z-10">
        <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mb-4 text-pink-500 group-hover:rotate-12 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed text-sm">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default ReasonCard;
