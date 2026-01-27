"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { motion } from "motion/react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Software Developer",
    image: "https://avatar.vercel.sh/sarah",
    rating: 5,
    comment:
      "TunaLMS has transformed my learning experience. The courses are comprehensive and the instructors are top-notch. I've gained valuable skills that directly helped me advance in my career.",
  },
  {
    name: "Michael Chen",
    role: "Marketing Manager",
    image: "https://avatar.vercel.sh/michael",
    rating: 5,
    comment:
      "The flexibility to learn at my own pace while having access to expert guidance is incredible. The platform is intuitive and the content quality is outstanding.",
  },
  {
    name: "Emily Rodriguez",
    role: "Designer",
    image: "https://avatar.vercel.sh/emily",
    rating: 5,
    comment:
      "I've completed multiple courses on TunaLMS and each one exceeded my expectations. The practical projects and real-world examples make learning engaging and effective.",
  },
  {
    name: "David Thompson",
    role: "Business Analyst",
    image: "https://avatar.vercel.sh/david",
    rating: 5,
    comment:
      "The certificate I earned from TunaLMS helped me land my dream job. The courses are well-structured and the community support is amazing.",
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            What Our Students Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied learners who have transformed their careers with our courses
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "{testimonial.comment}"
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
