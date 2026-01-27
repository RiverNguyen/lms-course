"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, Award, Globe, Users } from "lucide-react";
import { motion } from "motion/react";

const benefits = [
  {
    icon: Clock,
    title: "Learn Anytime, Anywhere",
    description:
      "Access courses whenever you want, from any device. Learn at your own pace without being limited by time or location.",
  },
  {
    icon: Globe,
    title: "Diverse Course Catalog",
    description:
      "Over 1000+ diverse courses across various fields, from information technology, business, design to personal development.",
  },
  {
    icon: Award,
    title: "Certificates Upon Completion",
    description:
      "Receive recognized certificates after completing courses, helping you enhance your profile and career opportunities.",
  },
  {
    icon: Users,
    title: "Learning Community",
    description:
      "Join a vibrant community of learners, exchange knowledge and connect with people who share your passion for learning.",
  },
];

export const LMSIntroSection = () => {
  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Why Choose TunaLMS?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            TunaLMS is a leading online learning platform designed to deliver the best learning experience. 
            We are committed to providing high-quality content, cutting-edge technology, and dedicated support to help you achieve your learning goals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <motion.div
                      className="flex flex-col items-center text-center space-y-4"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        className="p-4 rounded-full bg-primary/10"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="h-8 w-8 text-primary" />
                      </motion.div>
                      <h3 className="text-xl font-semibold">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
