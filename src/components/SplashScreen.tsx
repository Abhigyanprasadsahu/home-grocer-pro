import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

const SPLASH_KEY = "flashkart_splash_shown";

const SplashScreen = () => {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(SPLASH_KEY);
  });

  useEffect(() => {
    if (!show) return;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      sessionStorage.setItem(SPLASH_KEY, "1");
      setShow(false);
    }, 2600);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.5, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
          }}
        >
          {/* Pulsing radial rings */}
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute rounded-full border-2 border-white/30"
              initial={{ width: 80, height: 80, opacity: 0.6 }}
              animate={{
                width: [80, 700],
                height: [80, 700],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 2.2,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Floating particles */}
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.span
              key={`p${i}`}
              className="absolute w-2 h-2 rounded-full bg-white/70"
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
              }}
              animate={{
                x: Math.cos((i / 14) * Math.PI * 2) * 220,
                y: Math.sin((i / 14) * Math.PI * 2) * 220,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.8,
                delay: 0.3 + (i % 5) * 0.1,
                repeat: Infinity,
                repeatDelay: 0.4,
              }}
            />
          ))}

          {/* Logo lockup */}
          <motion.div
            className="relative flex flex-col items-center gap-4"
            initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.15 }}
          >
            <motion.div
              className="w-28 h-28 rounded-3xl bg-white flex items-center justify-center shadow-2xl"
              animate={{
                rotate: [0, -8, 8, -4, 4, 0],
                scale: [1, 1.08, 1],
              }}
              transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
            >
              <Zap
                className="w-16 h-16"
                style={{ color: "hsl(var(--primary))", fill: "hsl(var(--primary))" }}
              />
            </motion.div>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg"
              style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
            >
              Flash Kart
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-white/90 text-base md:text-lg font-medium tracking-wide"
            >
              Groceries at the speed of light
            </motion.p>

            {/* Loading dots */}
            <motion.div
              className="flex gap-2 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-white"
                  animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
