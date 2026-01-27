"use client";

import { motion } from "motion/react";
import { BookOpen, Users, Award, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: BookOpen,
    value: "1000+",
    label: "Courses Available",
    description: "Comprehensive curriculum across multiple domains",
  },
  {
    icon: Users,
    value: "50K+",
    label: "Active Students",
    description: "Join our growing community of learners",
  },
  {
    icon: Award,
    value: "95%",
    label: "Completion Rate",
    description: "Students successfully complete their courses",
  },
  {
    icon: TrendingUp,
    value: "200+",
    label: "Expert Instructors",
    description: "Learn from industry professionals",
  },
];

export const StatsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Our Impact in Numbers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how we're making a difference in online education
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow"
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon className="h-8 w-8 text-primary" />
                </motion.div>
                <motion.div
                  className="text-4xl md:text-5xl font-bold text-primary mb-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  {stat.value}
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">{stat.label}</h3>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
