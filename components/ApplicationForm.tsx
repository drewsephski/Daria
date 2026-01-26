import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import CustomDropdown from './CustomDropdown';
import { Send, CheckCircle } from 'lucide-react';

const ApplicationForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [hoverCount, setHoverCount] = useState(0);
  const [activity, setActivity] = useState("Getting Coffee (Classic)");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleNoHover = () => {
    setHoverCount(prev => prev + 1);
  };

  const noButtonText = hoverCount === 0 ? "No thanks" :
                       hoverCount === 1 ? "Are you sure?" :
                       hoverCount === 2 ? "Really sure?" :
                       hoverCount === 3 ? "Don't click this" :
                       "Okay fine";

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg mx-auto border border-pink-100 relative z-10">
      {!submitted ? (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Official Hangout Application</h2>
          <p className="text-gray-500 text-center mb-8 text-sm">Strictly for professional coffee-drinking purposes.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Applicant Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
                placeholder="Enter your name..."
                required
              />
            </div>
            
            <div className="relative z-20">
              <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Activity</label>
              <CustomDropdown 
                options={[
                  "Getting Coffee (Classic)",
                  "Getting Food (Essential)",
                  "Walking around aimlessly", 
                  "Watching a terrible movie"
                ]}
                value={activity}
                onChange={setActivity}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Why should I say yes?</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all h-24 resize-none"
                placeholder="List your qualifications (e.g. 'I have a dog', 'I pay for snacks')..."
                required
              />
            </div>

            <div className="pt-4 flex gap-4">
               <Button type="submit" fullWidth className="flex-1">
                 <Send className="w-4 h-4" />
                 Submit
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
            Your application is being processed by the Daria Administration. <br/>
            Expected wait time: 2-5 business minutes.
          </p>
          <Button 
            variant="outline" 
            className="mt-8"
            onClick={() => setSubmitted(false)}
          >
            Submit Another?
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default ApplicationForm;