import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import CustomDropdown from './CustomDropdown';
import { Send, CheckCircle } from 'lucide-react';

const ApplicationForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [hoverCount, setHoverCount] = useState(0);
  const [activity, setActivity] = useState("Buying her coffee (Required)");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleNoHover = () => {
    setHoverCount(prev => prev + 1);
  };

  const noButtonText = hoverCount === 0 ? "Pass" :
                       hoverCount === 1 ? "You sure?" :
                       hoverCount === 2 ? "Big mistake." :
                       hoverCount === 3 ? "Playing hard to get?" :
                       "Fine, your loss";

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg mx-auto border border-pink-100 relative z-10">
      {!submitted ? (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">The "Pick Me" Form</h2>
          <p className="text-gray-500 text-center mb-8 text-sm">Fill this out correctly and she might text back.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
                placeholder="Make it memorable..."
                required
              />
            </div>
            
            <div className="relative z-20">
              <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Activity</label>
              <CustomDropdown 
                options={[
                  "Buying her coffee (Required)",
                  "Dinner (You pay)",
                  "Adventures (She picks)", 
                  "Just vibing"
                ]}
                value={activity}
                onChange={setActivity}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Why do you qualify?</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all h-24 resize-none"
                placeholder="Tell her something she doesn't know..."
                required
              />
            </div>

            <div className="pt-4 flex gap-4">
               <Button type="submit" fullWidth className="flex-1">
                 <Send className="w-4 h-4" />
                 Apply Now
               </Button>
               
               <motion.button
                 type="button"
                 onMouseEnter={handleNoHover}
                 whileHover={{ 
                    x: (Math.random() - 0.5) * 100, 
                    y: (Math.random() - 0.5) * 100,
                    transition: { duration: 0.2 }
                 }}
                 className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors"
               >
                 {noButtonText}
               </motion.button>
            </div>
          </form>
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Application Received!</h3>
          <p className="text-gray-600">
            Her people will contact your people. <br/>
            (She is her people).
          </p>
          <Button 
            variant="outline" 
            className="mt-8"
            onClick={() => setSubmitted(false)}
          >
            Try Again?
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default ApplicationForm;