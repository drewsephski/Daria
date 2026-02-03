import React from 'react';
import { Crown, Coffee, Sparkles, Zap, Heart, Star, MapPin, AlertCircle, Smile } from 'lucide-react';
import { ReasonProps, AboutFact } from './types';

export const REASONS: ReasonProps[] = [
  {
    title: "Main Character Energy",
    description: "It's not arrogance if it's true. She doesn't chase, she attracts.",
    icon: <Crown className="w-6 h-6 text-pink-500" />,
  },
  {
    title: "Professional Heartbreaker",
    description: "Unintentional, usually. But let's be honest, she breaks hearts.",
    icon: <Heart className="w-6 h-6 text-pink-500" />,
  },
  {
    title: "Sarcasm: Fluent",
    description: "Her love language is teasing you until you question your reality.",
    icon: <Zap className="w-6 h-6 text-pink-500" />,
  },
  {
    title: "Vibe Technician",
    description: "She doesn't just match the vibe, she sets it.",
    icon: <Sparkles className="w-6 h-6 text-pink-500" />,
  },
  {
    title: "Taste Level: High",
    description: "If she likes it, it's good. If she doesn't, try harder.",
    icon: <Star className="w-6 h-6 text-pink-500" />,
  },
  {
    title: "Coffee Dependent",
    description: "She's nicer after an iced latte. Buy her one?",
    icon: <Coffee className="w-6 h-6 text-pink-500" />,
  },
];

export const COMPLIMENTS = [
  "You have excellent taste. Obviously, you're here.",
  "She'd probably reply to your text. Maybe.",
  "You're almost as cool as her. Almost.",
  "She likes your vibe. Don't ruin it.",
  "You're doing great, sweetie.",
  "She'd share her fries with you. That's a big deal.",
  "Your outfit today? A solid 9/10. She's the 10, obviously.",
  "You're the main character, but she's the director.",
  "She'd pause her favorite song to listen to you.",
  "You’re smarter than you look. Which she appreciates.",
  "Her dog would probably like you. That’s high praise.",
  "You radiate 'good decision' energy. Keep it up.",
  "If sarcasm was a sport, you'd be teammates.",
  "You’re not like other people. You’re tolerable.",
  "She'd let you borrow her charger. Maybe.",
  "You have a nice face. It suits you.",
  "Your presence is surprisingly delightful.",
  "She bets you have great music taste.",
  "You’re definitely on the VIP list.",
  "The world is lucky to have you. Especially her.",
  "You make existing look easy."
];

export const ABOUT_FACTS: AboutFact[] = [
  {
    label: "Current Location",
    value: "Rent-free in your head",
    icon: <MapPin className="w-5 h-5 text-pink-500" />,
  },
  {
    label: "Superpower",
    value: "Always right",
    icon: <Sparkles className="w-5 h-5 text-pink-500" />,
  },
  {
    label: "Warning",
    value: "Highly addictive",
    icon: <AlertCircle className="w-5 h-5 text-pink-500" />,
  },
  {
    label: "Status",
    value: "Out of your league",
    icon: <Smile className="w-5 h-5 text-pink-500" />,
  },
];