import { ReactNode } from 'react';

export interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export interface ReasonProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface AboutFact {
  label: string;
  value: string;
  icon: ReactNode;
}
