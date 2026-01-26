import React from 'react';
import { motion } from 'framer-motion';
import { ABOUT_FACTS } from '../constants';
import { User, Heart } from 'lucide-react';

const AboutMe: React.FC = () => {
  return (
    <section id="about" className="py-24 px-6 bg-white overflow-hidden">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
          
          {/* Visual Side - Entry animation: Slide from left */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full md:w-1/2 relative flex justify-center"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80">
                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-pink-100 rounded-[2rem] transform rotate-3 transition-transform duration-500 hover:rotate-6" />
                <div className="absolute inset-0 bg-pink-50 rounded-[2rem] transform -rotate-3 border-2 border-pink-200" />
                
                {/* Center Icon/Placeholder */}
                <div className="absolute inset-4 bg-white rounded-3xl shadow-sm flex items-center justify-center border border-pink-100 overflow-hidden group">
                    <User className="w-32 h-32 text-pink-300 group-hover:text-pink-400 transition-colors duration-300" />
                    
                    {/* Floating Heart Overlay */}
                    <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md">
                        <Heart className="w-5 h-5 text-pink-500 fill-current animate-pulse" />
                    </div>
                </div>

                {/* Funny sticker tags */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -bottom-4 -right-4 bg-white text-pink-600 text-sm font-bold px-4 py-2 rounded-full shadow-lg border border-pink-100"
                >
                    Top Tier Human ✨
                </motion.div>
            </div>
          </motion.div>

          {/* Text Side - Entry animation: Slide from right */}
          <motion.div 
            className="w-full md:w-1/2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <div className="inline-block px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold tracking-wider mb-4 uppercase">
              The Subject
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-display leading-tight">
              A Brief <span className="text-pink-500">Analysis</span>
            </h2>
            
            <div className="space-y-4 text-gray-600 text-lg mb-8 leading-relaxed">
                <p>
                    Known for having better style than everyone else in the room and an ability to make any situation slightly more fun just by showing up.
                </p>
                <p>
                   If you are reading this, you probably already know she is out of everyone's league. Experts (me) agree that she is pretty great.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ABOUT_FACTS.map((fact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + (index * 0.1) }}
                  className="bg-pink-50/50 p-4 rounded-xl border border-pink-100 hover:bg-pink-50 transition-colors duration-300"
                >
                  <div className="flex items-center gap-3 mb-1">
                    {fact.icon}
                    <span className="font-bold text-gray-800 text-sm">{fact.label}</span>
                  </div>
                  <div className="text-pink-600 font-medium text-sm pl-8">
                    {fact.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AboutMe;