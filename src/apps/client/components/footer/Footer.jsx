import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaInstagram,
  FaWhatsapp,
  FaClock,
} from "react-icons/fa";
import logo from "../../assets/logo-pizza.png";

function Footer() {
  return (
    <footer className="bg-gradient-to-br from-cream via-amber-50 to-orange-50 border-t-4 border-red-600">
      <div className="container mx-auto py-4 md:px-4 py-4 md:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-4 md:mb-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-2 md:mb-4">
              <img
                src={logo}
                alt="Azzipizza"
                className="h-12 w-12 object-contain"
              />
              <div>
                <h3 className="text-2xl font-bold font-serif text-gray-800">
                  Azzipizza
                </h3>
                <p className="text-red-600 text-sm italic font-semibold">
                  Mica Pizza e Fichi
                </p>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Authentic Italian pizza crafted with passion, using traditional
              methods and the finest ingredients.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/azzipizzamicapizzaefichi"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 p-3 rounded-lg hover:scale-110 transition-transform shadow-lg text-white"
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://wa.me/393713985810"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 p-3 rounded-lg hover:scale-110 transition-transform shadow-lg text-white"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-red-600 pb-2 inline-block">
              Quick Links
            </h4>
            <ul className="space-y-1 md:space-y-3 md:mt-4">
              <li>
                <Link
                  to="/"
                  className="footer-link text-gray-700 flex items-center gap-2 text-sm font-medium"
                >
                  <span className="text-red-600">▸</span> Home
                </Link>
              </li>
              <li>
                <Link
                  to="/menu"
                  className="footer-link text-gray-700 flex items-center gap-2 text-sm font-medium"
                >
                  <span className="text-red-600">▸</span> Our Menu
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="footer-link text-gray-700 flex items-center gap-2 text-sm font-medium"
                >
                  <span className="text-red-600">▸</span> About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="footer-link text-gray-700 flex items-center gap-2 text-sm font-medium"
                >
                  <span className="text-red-600">▸</span> Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="footer-link text-gray-700 flex items-center gap-2 text-sm font-medium"
                >
                  <span className="text-red-600">▸</span> Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-red-600 pb-2 inline-block">
              Contact Us
            </h4>
            <ul className="space-y-1 md:space-y-3 md:mt-4">
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="text-gray-700 flex-shrink-0" size={16} />
                <a
                  href="tel:393713985810"
                  className="footer-link text-gray-700 text-sm"
                >
                  +39 371 398 5810
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FaEnvelope
                  className="text-gray-700 mt-1 flex-shrink-0"
                  size={16}
                />
                <a
                  href="mailto:azzipizzamicapizzaefichi@gmail.com"
                  className="footer-link text-gray-700 text-sm break-all"
                >
                  azzipizzamicapizzaefichi@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt
                  className="text-gray-700 mt-1 flex-shrink-0"
                  size={16}
                />
                <a
                  href="https://maps.app.goo.gl/R5K5RN5gCXK7TSox9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link text-gray-700 text-sm"
                >
                  Via Frassinago, 16b 40123 Bologna BO, Italy
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-xl font-bold md:mb-4 text-gray-800 border-b-2 border-red-600 pb-2 inline-block">
              Opening Hours
            </h4>
            <ul className="space-y-1 md:space-y-3 mt-4">
              <li className="flex items-start gap-3">
                <FaClock
                  className="text-amber-600 mt-1 flex-shrink-0"
                  size={16}
                />
                <div className="text-sm">
                  <p className="text-gray-800 font-semibold">
                    Tuesday - Sunday
                  </p>
                  <p className="text-gray-600">6:00 PM - 11:00 PM</p>
                </div>
              </li>
            </ul>
            {/* <div className="mt-4 p-4 bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg">
              <p className="text-base text-white font-bold">🍕 Free Delivery</p>
              <p className="text-sm text-amber-200">On orders over €20</p>
            </div> */}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-red-300 my-6"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center md:gap-4 text-sm">
          <p className="text-gray-600">
            © 2025 Azzipizza. All rights reserved.
          </p>
          <div className="flex gap-4 md:gap-6 text-gray-600">
            <a href="#" className="footer-link font-medium">
              Privacy Policy
            </a>
            <a href="#" className="footer-link font-medium">
              Terms of Service
            </a>
          </div>
          <p className="text-gray-600">
            Developed by{" "}
            <a
              href="http://khubaib-portfolio-seven.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link text-red-600 font-semibold"
            >
              Khubaib Shah
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
