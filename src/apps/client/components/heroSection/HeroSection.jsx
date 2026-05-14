import { useEffect, useState } from "react";
import hero from "../../assets/hero-image.jpg";
import SupportButton from "../SupportButton";

function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] lg:h-[750px] overflow-hidden">
      {/* Background Image with Parallax */}
      <img
        src={hero}
        alt="Delicious Azzipizza"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          transition: "transform 0.1s ease-out",
        }}
      />

      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 border-4 border-amber-400/30 rounded-full animate-float"></div>
      <div
        className="absolute bottom-20 right-20 w-16 h-16 border-4 border-red-400/30 rounded-full animate-float"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Content */}
      <div className="md:top-0 relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        {/* Main Heading */}
        <div className="animate-slide-down">
          <h1 className="!text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold drop-shadow-2xl leading-tight max-w-4xl md:mb-4">
            Azzipizza
          </h1>
          <p className="text-amber-300 text-2xl sm:text-3xl md:text-4xl font-serif italic mb-2">
            Mica Pizza e Fichi
          </p>
        </div>

        {/* Tagline */}
        <p
          className="text-white/90 text-lg sm:text-xl md:text-2xl font-light max-w-2xl mb-3 md:mb-8 animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          Authentic Italian Pizza, Crafted with Passion
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-row-reverse gap-2 md:gap-4 animate-slide-up"
          style={{ animationDelay: "0.5s" }}
        >
          <button
            onClick={() => (window.location.href = "/menu")}
            className="btn-primary !text-sm md:text-lg !px-5 !py-3 !md:px-8 md:py-4 transform hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            Order Now
          </button>
          <button
            onClick={() => (window.location.href = "/about")}
            className="bg-white/10 backdrop-blur-md text-white border-2 border-white/30 !px-3 !py-3 !md:px-8 md:py-4 rounded-lg font-medium !text-sm md:text-lg hover:bg-white/20 transition-all duration-300 cursor-pointer"
          >
            Our Story
          </button>
        </div>

        {/* Features */}
        <div
          className="hidden md:grid  grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-3xl animate-fade-in"
          style={{ animationDelay: "0.7s" }}
        >
          <div className="flex flex-col items-center text-white">
            <div className="text-4xl mb-2">🔥</div>
            <p className="font-semibold">Wood-Fired</p>
            <p className="text-sm text-white/80">Traditional Oven</p>
          </div>
          <div className="flex flex-col items-center text-white">
            <div className="text-4xl mb-2">🇮🇹</div>
            <p className="font-semibold">100% Italian</p>
            <p className="text-sm text-white/80">Authentic Recipes</p>
          </div>
          <div className="flex flex-col items-center text-white">
            <div className="text-4xl mb-2">⚡</div>
            <p className="font-semibold">Fast Delivery</p>
            <p className="text-sm text-white/80">Hot & Fresh</p>
          </div>
        </div>
      </div>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="#FFFBEB"
          />
        </svg>
      </div>

      <SupportButton />
    </div>
  );
}

export default HeroSection;
