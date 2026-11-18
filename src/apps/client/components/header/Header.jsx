import { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AiOutlineShoppingCart,
  AiOutlineHome,
  AiOutlineInfoCircle,
  AiOutlinePhone,
} from "react-icons/ai";
import { MdOutlineMenu } from "react-icons/md";
import { PiListBulletsBold } from "react-icons/pi";
import { Button } from "@mui/material";
import Context from "@shared/context/dataContext";
import HeaderModal from "../Modal/headerModal";
import logo from "../../assets/logo-pizza.png";
import { ShoppingBag, User } from "lucide-react";

function Header() {
  const { cartItems } = useContext(Context);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [activePage, setActivePage] = useState("Home");

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handlePageChange = (page) => {
    setActivePage(page);
    setOpen(false);
  };

  const marqueeMessages = [
    "Free delivery on every order",
    "Fresh wood-fired pizza made to order",
    "Warm crispy fritti delivered to your door",
    "Fast delivery across Bologna",
    "Special offers on selected pizzas",
  ];

  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        setScrolled(window.scrollY > 50);
        timeoutId = null;
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const navItems = [
    {
      path: "/",
      label: "Home",
      icon: <AiOutlineHome className="text-[24px]" />,
    },
    {
      path: "/about",
      label: "About Us",
      icon: <AiOutlineInfoCircle className="text-[24px]" />,
    },
    {
      path: "/contact",
      label: "Contact Us",
      icon: <AiOutlinePhone className="text-[24px]" />,

    },

    { path: "/my-orders", label: "My Orders", icon: <ShoppingBag className="text-[24px]" /> }
  ];

  const location = useLocation();

  useEffect(() => {
    const current = navItems.find((item) => item.path === location.pathname);
    if (current) {
      setActivePage(current.label);
    }
  }, [location.pathname]);

  return (
    <>
      {/* Top Mini Marquee Bar */}
      <div className="w-full bg-amber-400 text-gray-900 overflow-hidden py-1.5 border-b border-amber-500/30">
        <style>{`
          @keyframes azzipizza-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .azzipizza-marquee-track {
            display: flex;
            width: max-content;
            animation: azzipizza-marquee 26s linear infinite;
          }
          .azzipizza-marquee-track:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="azzipizza-marquee-track">
          {[0, 1].map((dupIndex) => (
            <div key={dupIndex} className="flex items-center shrink-0">
              {marqueeMessages.map((msg, idx) => (
                <span
                  key={`${dupIndex}-${idx}`}
                  className="inline-flex items-center gap-4 px-5 text-[11px] sm:text-xs font-semibold tracking-wide whitespace-nowrap"
                >
                  <span>{msg}</span>
                  <span aria-hidden="true" className="text-red-700">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-[background-color,box-shadow,padding] duration-300 h-12  md:h-20 flex items-center ${scrolled
          ? "bg-white shadow-sm"
          : "bg-red-600 shadow-sm"
          }`}
      >
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center gap-3 transition-transform hover:scale-105 h-10 md:h-14`}
          >
            <img
              src={logo}
              alt="Azzipizza Logo"
              className="object-contain h-full"
            />
            <div className="hidden sm:block">
              <h2 className={`font-serif font-bold text-xl md:text-2xl ${scrolled ? "text-black!" : "text-white"}`}>
                Azzipizza
              </h2>
              <p className={`text-xs italic ${scrolled ? "text-red-400" : "text-amber-300"}`}>
                Mica Pizza e Fichi
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex flex-1 justify-center items-center gap-4">
            <nav className="hidden lg:flex gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => handlePageChange(item.label)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-[background-color,color,border-color,transform] duration-300 ${activePage === item.label
                    ? scrolled
                      ? "bg-linear-to-r from-red-600 to-red-700 text-white shadow-md"
                      : "bg-white text-red-600 shadow-md"
                    : scrolled
                      ? "text-gray-700 hover:bg-red-50"
                      : "text-white/90 hover:bg-white/10"
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Cart and Menu */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative group"
              onMouseEnter={() => setIsCartHovered(true)}
              onMouseLeave={() => setIsCartHovered(false)}
            >
              <div className={`p-2 rounded-full transition-all duration-300 ${scrolled
                ? "hover:bg-red-50"
                : "hover:bg-white/10"
                }`}>
                <AiOutlineShoppingCart
                  className={`text-[22px] md:text-[28px] transition-all duration-300 ${isCartHovered
                    ? "text-amber-500 scale-110"
                    : scrolled
                      ? "text-red-600"
                      : "text-white"
                    }`}
                />
                {cartCount > 0 && (
                  <span className="absolute -top-px -right-px md:-top-1 md:-right-1  bg-linear-to-r from-amber-500 to-amber-600 text-white text-xs w-4 h-4 md:w-6 md:h-6 flex items-center justify-center rounded-full font-bold shadow-lg">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

            {/* Admin Login */}
            <Link
              to="/admin/login"
              className="relative group"
              title="Admin Login"
            >
              <div className={`p-2 rounded-full transition-all duration-300 ${scrolled
                ? "hover:bg-red-50"
                : "hover:bg-white/10"
                }`}>
                <User
                  className={`text-[22px] md:size-7 transition-all duration-300 ${scrolled
                    ? "text-red-600"
                    : "text-white"
                    } hover:text-amber-500`}
                />
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                onClick={() => setOpen(!open)}
                variant="text"
                className="min-w-[40px]! h-[40px]! p-0! rounded-full!"
              >
                <div
                  className={`w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all duration-300 ${scrolled
                    ? "text-red-600 hover:bg-red-50"
                    : "text-white hover:bg-white/10"
                    }`}
                >
                  <MdOutlineMenu className="text-[22px] md:text-[28px]" />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <HeaderModal open={open} setOpen={setOpen} navItems={navItems} />
    </>
  );
}

export default Header;
