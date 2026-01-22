"use client";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function PaymentCancelPage() {
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
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10"
      >
        <Card className="w-full max-w-[400px] shadow-xl border-2 border-red-500/20 bg-card/95 backdrop-blur-sm">
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
                className="absolute w-24 h-24 bg-red-500/20 rounded-full blur-xl"
              />

              {/* Icon container */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 90 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="relative flex items-center justify-center"
              >
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.8,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-red-500/30 rounded-full blur-md" />
                  <XIcon className="relative size-16 p-3 bg-gradient-to-br from-red-500/20 to-red-600/20 text-red-500 rounded-full border-2 border-red-500/30 shadow-lg" />
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
                className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent"
              >
                Payment Cancelled
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-sm text-muted-foreground mt-2 tracking-tight text-balance leading-relaxed"
              >
                No worries! You can try again later. Your payment was not processed.
              </motion.p>

              {/* Button with animations */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-6"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/"
                    className={buttonVariants({
                      className:
                        "w-full shadow-md hover:shadow-lg transition-all duration-200 group",
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
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}