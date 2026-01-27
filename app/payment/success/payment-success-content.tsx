"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftIcon, CheckCircle2Icon, BookOpenIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { useConfetti } from "@/hooks/use-confetti";

export default function PaymentSuccessContent() {
  const { triggerConfetti } = useConfetti();
  const searchParams = useSearchParams();
  const courseSlug = searchParams.get("course");

  // Generate random positions once on mount using lazy initializer
  const [particlePositions] = useState(() =>
    Array.from({ length: 12 }, () => ({
      x: `${50 + (Math.random() - 0.5) * 100}%`,
      y: `${30 + Math.random() * 100}%`,
    }))
  );

  // Trigger fireworks on mount with delay
  useEffect(() => {
    const timer1 = setTimeout(() => {
      // Main confetti burst
      triggerConfetti();
    }, 500);

    const timer2 = setTimeout(() => {
      // Additional fireworks from center
      const count = 200;
      const defaults = {
        origin: { y: 0.5, x: 0.5 },
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
          colors: ["#10b981", "#059669", "#34d399", "#6ee7b7", "#a7f3d0"],
        });
      };

      // Multiple bursts for celebration effect
      fire(0.3, {
        spread: 70,
        startVelocity: 55,
        decay: 0.9,
      });
      fire(0.25, {
        spread: 100,
        startVelocity: 45,
        decay: 0.92,
      });
      fire(0.2, {
        spread: 120,
        startVelocity: 35,
        decay: 0.91,
      });
    }, 1000);

    const timer3 = setTimeout(() => {
      // Final burst from top
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.2 },
        colors: ["#10b981", "#059669", "#34d399"],
        startVelocity: 30,
        decay: 0.9,
      });
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [triggerConfetti]);
  return (
    <div className="w-full min-h-screen flex flex-1 justify-center items-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10"
      >
        <Card className="w-full max-w-[400px] shadow-xl border-2 border-green-500/20 bg-card/95 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Icon container with animations */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
              className="flex items-center justify-center w-full mb-6"
            >
              {/* Outer glow effect */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute w-24 h-24 bg-green-500/20 rounded-full blur-xl"
              />

              {/* Icon container */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="relative flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.5,
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-green-500/30 rounded-full blur-md" />
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 0.6,
                      delay: 0.8,
                      ease: "easeInOut",
                    }}
                  >
                    <CheckCircle2Icon className="relative size-16 p-3 bg-gradient-to-br from-green-500/20 to-emerald-600/20 text-green-500 rounded-full border-2 border-green-500/30 shadow-lg" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Content with staggered animations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-center space-y-4"
            >
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent"
              >
                Payment Successful!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-sm text-muted-foreground mt-2 tracking-tight text-balance leading-relaxed"
              >
                Thank you for your purchase! Your payment has been processed successfully. You can now access your course.
              </motion.p>

              {/* Confetti-like particles effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {particlePositions.map((position, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-green-500/40 rounded-full"
                    initial={{
                      x: "50%",
                      y: "30%",
                      scale: 0,
                    }}
                    animate={{
                      x: position.x,
                      y: position.y,
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.8 + i * 0.1,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </motion.div>

              {/* Button with animations */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-6 space-y-3"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/"
                    className={buttonVariants({
                      className:
                        "w-full shadow-md hover:shadow-lg transition-all duration-200 group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
                    })}
                  >
                    <motion.div
                      animate={{ x: [0, -4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: "easeInOut",
                      }}
                      className="flex items-center justify-center gap-2"
                    >
                      <ArrowLeftIcon className="size-4 group-hover:-translate-x-1 transition-transform duration-200" />
                      Go to Home
                    </motion.div>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {courseSlug ? (
                    <Link
                      href={`/courses/${courseSlug}`}
                      className={buttonVariants({
                        variant: "outline",
                        className:
                          "w-full shadow-sm hover:shadow-md transition-all duration-200 group border-green-500/30 hover:border-green-500/50",
                      })}
                    >
                      <BookOpenIcon className="size-4 group-hover:scale-110 transition-transform duration-200" />
                      View Course
                    </Link>
                  ) : (
                    <Link
                      href="/courses"
                      className={buttonVariants({
                        variant: "outline",
                        className:
                          "w-full shadow-sm hover:shadow-md transition-all duration-200 group border-green-500/30 hover:border-green-500/50",
                      })}
                    >
                      Browse Courses
                    </Link>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
