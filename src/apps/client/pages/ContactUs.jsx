import { useState } from "react";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaInstagram,
  FaWhatsapp,
  FaClock,
} from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const whatsappMessage =
      `Name: ${formData.name}%0A` +
      `Email: ${formData.email}%0A` +
      `Message: ${formData.message}`;

    window.open(`https://wa.me/393713985810?text=${whatsappMessage}`, "_blank");

    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-slide-down">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Contattaci
            </h1>
            <p className="text-xl md:text-2xl text-amber-200 italic max-w-3xl mx-auto">
              Siamo qui per te! Domande, feedback o ordini speciali per le tue pizze e fritti da asporto a Bologna.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Contact Form & Info Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div className="card-premium p-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="decorative-line flex-grow max-w-[50px]"></div>
              <h2 className="text-3xl font-bold text-gray-800">Invia un Messaggio</h2>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Il Tuo Nome
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Mario Rossi"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  La Tua Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="mario@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Il Tuo Messaggio
                </label>
                <textarea
                  name="message"
                  placeholder="Dicci come possiamo aiutarti..."
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
              >
                <FaWhatsapp size={24} />
                Invia tramite WhatsApp
              </button>
            </form>
          </div>

          {/* Quick Contact Info */}
          <div className="space-y-6">
            <div className="card-premium p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-white border-l-4 border-red-600">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 p-4 rounded-full">
                  <FaMapMarkerAlt className="text-red-600 text-3xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-700 mb-2">
                    Dove Siamo
                  </h3>
                  <a
                    href="https://maps.app.goo.gl/R5K5RN5gCXK7TSox9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-red-600 transition-colors"
                  >
                    📍 Via Frassinago, 16b<br />
                    40123 Bologna BO, Italy
                  </a>
                </div>
              </div>
            </div>

            <div className="card-premium p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-white border-l-4 border-green-600">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <FaPhoneAlt className="text-green-600 text-3xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-700 mb-2">
                    Chiamaci
                  </h3>
                  <a
                    href="tel:393713985810"
                    className="text-gray-700 hover:text-green-600 transition-colors text-lg font-semibold"
                  >
                    📞 +39 371 398 5810
                  </a>
                </div>
              </div>
            </div>

            <div className="card-premium p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-white border-l-4 border-purple-600">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-4 rounded-full">
                  <FaEnvelope className="text-purple-600 text-3xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-purple-700 mb-2">
                    Scrivici
                  </h3>
                  <a
                    href="mailto:azzipizzamicapizzaefichi@gmail.com"
                    className="text-gray-700 hover:text-purple-600 transition-colors break-all"
                  >
                    ✉️ azzipizzamicapizzaefichi@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="card-premium p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-white border-l-4 border-amber-600">
              <div className="flex items-start gap-4">
                <div className="bg-amber-100 p-4 rounded-full">
                  <FaClock className="text-amber-600 text-3xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-700 mb-2">
                    Orari di Apertura
                  </h3>
                  <div className="text-gray-700 space-y-1">
                    <p>🕐 Mar-Dom: 18:00 - 23:00</p>
                    <p>🕐 Lunedì: Chiuso</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="card-premium p-10 mb-12 text-center bg-gradient-to-br from-pink-50 to-orange-50">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="decorative-line flex-grow max-w-[100px]"></div>
            <h2 className="text-4xl font-bold text-gray-800">
              Seguici sui Social
            </h2>
            <div className="decorative-line flex-grow max-w-[100px]"></div>
          </div>
          <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
            Resta aggiornato sulle nostre nuove pizze da asporto, offerte speciali e novità!
          </p>
          <div className="flex justify-center gap-6">
            <a
              href="https://www.instagram.com/azzipizzamicapizzaefichi?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">
                <FaInstagram className="text-white text-5xl" />
              </div>
              <p className="mt-3 font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">
                @azzipizzamicapizzaefichi
              </p>
            </a>
            <a
              href="https://wa.me/393713985810"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">
                <FaWhatsapp className="text-white text-5xl" />
              </div>
              <p className="mt-3 font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                Contattaci su WhatsApp
              </p>
            </a>
          </div>
        </div>

        {/* Map Section */}
        <div className="card-premium overflow-hidden">
          <div className="h-96 w-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2846.1529902922857!2d11.329174276641153!3d44.49153189780795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x477fd5fe539fb66b%3A0x63cfb4f9ab408962!2sPizzeria%20AZZIPIZZA%20mica%20pizza%20e%20fichi!5e0!3m2!1sen!2s!4v1744142734200!5m2!1sen!2s"
              width="100%"
              height="100%"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
              title="Azzipizza Location Map"
            ></iframe>
          </div>
          <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 text-center">
            <p className="text-gray-700 text-lg mb-4">
              🍕 Trovaci nel cuore di Bologna (zona Centro Storico e Saragozza)! Siamo sempre pronti a servirti la migliore pizza.
            </p>
            <a
              href="https://www.google.com/maps/place/Pizzeria+AZZIPIZZA+mica+pizza+e+fichi/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent inline-block"
            >
              📍 Ottieni Indicazioni
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
