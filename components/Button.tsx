import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  // 'group' allows children to animate on hover
  // Removed transform/scale effects to comply with "no scale effects"
  const baseStyle = "group px-6 py-3 rounded-xl font-bold transition-colors duration-300 flex items-center justify-center gap-2 relative overflow-hidden";
  
  const variants = {
    primary: "bg-pink-500 text-white hover:bg-pink-600 shadow-md hover:shadow-pink-300/50",
    secondary: "bg-white text-pink-600 hover:bg-pink-50 shadow-sm border border-pink-100",
    outline: "border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white",
  };

  return (
    <motion.button
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      // Only generic tap feedback (opacity or slight color shift could go here, but keeping it simple)
      whileTap={{ opacity: 0.9 }} 
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;