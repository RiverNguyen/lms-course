"use client";

import { motion } from "motion/react";

interface SectionHeaderProps {
  title: string;
  description: string;
}

export const SectionHeader = ({ title, description }: SectionHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center space-y-4 mb-12"
    >
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
    </motion.div>
  );
};
