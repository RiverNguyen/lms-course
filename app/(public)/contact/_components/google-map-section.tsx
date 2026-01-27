"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

// Google Maps embed URL - Replace with your actual office address
// Format: https://www.google.com/maps/embed?pb=...
// Or use: https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=YOUR_ADDRESS
const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.123456789!2d106.6297!3d10.8231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ5JzIzLjEiTiAxMDbCsDM3JzQ3LjEiRQ!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus";

export const GoogleMapSection = () => {
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Tìm Đường Đến Văn Phòng
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Đến thăm văn phòng của chúng tôi hoặc xem bản đồ để tìm đường đi dễ dàng nhất.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <Card className="overflow-hidden border-2">
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
              <iframe
                src={MAP_EMBED_URL}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
                title="TunaLMS Office Location"
              />
            </div>
            <div className="p-6 bg-muted/30">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Địa Chỉ Văn Phòng</p>
                  <p className="text-sm text-muted-foreground">
                    123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Alternative: If you want to use Google Maps API instead of embed */}
        {/* 
        <div className="max-w-6xl mx-auto">
          <Card className="overflow-hidden border-2">
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
              <GoogleMap
                center={{ lat: 10.8231, lng: 106.6297 }}
                zoom={15}
                mapContainerStyle={{ width: "100%", height: "100%" }}
              >
                <Marker position={{ lat: 10.8231, lng: 106.6297 }} />
              </GoogleMap>
            </div>
          </Card>
        </div>
        */}
      </div>
    </section>
  );
};
