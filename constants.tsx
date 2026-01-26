import React from 'react';
import { Crown, Coffee, Sparkles, Zap, Heart, Star, MapPin, Music, GraduationCap, Utensils, AlertCircle, Smile } from 'lucide-react';
import { ReasonProps, AboutFact } from './types';

export const REASONS: ReasonProps[] = [
  {
    title: "Certified Cool™",
    description: "Studies show a 99.9% probability of being the coolest person in the room. Margin of error: 0%.",
    icon: <Crown className="w-6 h-6 text-pink-500" />,
  },
  {
    title: "Caffeine Connoisseur",
    description: "Can distinguish between 15 types of iced lattes with eyes closed. A true talent.",
    icon: <Coffee className="w-6 h-6 text-pink-500" />,
  },
  {
    title: "Sarcasm Level: Expert",
    description: "Fluent in three languages: English, Emoji, and rigorous Sarcasm.",
    icon: <Zap className="w-6 h-6 text-pink-500" />,
  },
  {
    title: "Vibe Curator",
    description: "Simply existing improves the ambient mood of any location by a factor of 10.",
    icon: <Sparkles className="w-6 h-6 text-pink-500" />,
  },
  {
    title: "Smile Radiance",
    description: "Warning: Direct eye contact with the smile may cause temporary blindness due to sheer brightness.",
    icon: <Heart className="w-6 h-6 text-pink-500" />,
  },
  {
    title: "Playlist Wizard",
    description: "Possesses a music taste that scientists are calling 'objectively correct'.",
    icon: <Star className="w-6 h-6 text-pink-500" />,
  },
];

export const COMPLIMENTS = [
  "You have impeccable taste (mostly because you're reading this).",
  "If being awesome was a crime, you'd be serving a life sentence.",
  "Your smile could power a small city.",
  "You're smarter than Google and prettier than a Pinterest board.",
  "10/10 would recommend hanging out with you.",
  "You're the human version of a pink starburst.",
];

export const ABOUT_FACTS: AboutFact[] = [
  {
    label: "Current Location",
    value: "Living rent-free in my head",
    icon: <MapPin className="w-5 h-5 text-pink-500" />,
  },
  {
    label: "Superpower",
    value: "Looking good in literally anything",
    icon: <Sparkles className="w-5 h-5 text-pink-500" />,
  },
  {
    label: "Hazard Warning",
    value: "May cause butterflies",
    icon: <AlertCircle className="w-5 h-5 text-pink-500" />,
  },
  {
    label: "Known For",
    value: "Impeccable vibes & great hair",
    icon: <Smile className="w-5 h-5 text-pink-500" />,
  },
];