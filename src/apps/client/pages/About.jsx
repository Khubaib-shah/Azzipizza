import ingredientsImage from "../assets/hero-image.jpg";
import Team from "../assets/meet-our.png";
import { FaAward, FaHeart, FaLeaf } from "react-icons/fa";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-slide-down">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Our Story
            </h1>
            <p className="text-xl md:text-2xl text-amber-200 italic max-w-3xl mx-auto">
              From passion to perfection, one pizza at a time
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Our Story Section */}
        <section className="card-premium p-10 mb-12 animate-slide-up">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="decorative-line flex-grow max-w-[100px]"></div>
            <h2 className="text-4xl font-bold text-gray-800 text-center">
              The Art of Pizza Making
            </h2>
            <div className="decorative-line flex-grow max-w-[100px]"></div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-lg leading-relaxed">
              La nostra pizza nasce da un impasto ricco, rustico e saporito,
              realizzato con una miscela di farine selezionate. Usiamo infatti
              <strong className="text-red-600"> 3-4 tipi di farina diversi</strong>, tra cui la semola di grano duro, la
              farina integrale, la farina di segale, avena, e una speciale
              miscela chiamata "pane farro e grano saraceno", che conferisce
              all'impasto un gusto unico e un profilo nutrizionale più
              completo.
            </p>
            <p className="text-lg leading-relaxed">
              Il nostro impasto viene lavorato con una <strong className="text-red-600">lievitazione lunga, di
                oltre 48 ore</strong>, per garantire una pizza leggera, digeribile e
              fragrante. Utilizziamo una tecnica tradizionale chiamata <em className="text-amber-600">"biga"</em>,
              un preimpasto che richiede tempo, cura e attenzione.
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
              <h3 className="text-2xl font-bold text-amber-800 mb-3">Cos'è la biga?</h3>
              <p className="text-gray-700">
                La biga è un preimpasto fatto con farina, acqua e
                una piccola quantità di lievito. Viene lasciata fermentare
                lentamente per 16-24 ore a temperatura controllata. Questo
                processo sviluppa aromi complessi, migliora la struttura
                dell'impasto finale e rende la pizza più leggera e profumata.
                Dopo la maturazione della biga, viene impastata nuovamente con
                il resto degli ingredienti per creare l'impasto definitivo, che
                poi continua la sua lunga lievitazione prima di essere steso e
                cotto.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="card-premium p-8 bg-gradient-to-br from-red-50 to-white border-l-4 border-red-600">
            <div className="flex items-center gap-3 mb-4">
              <FaHeart className="text-4xl text-red-600" />
              <h2 className="text-3xl font-bold text-red-700">Our Mission</h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Portare gioia a ogni amante della pizza con sapori autentici e
              ingredienti freschi, preparati con amore e perfezione.
            </p>
          </div>
          <div className="card-premium p-8 bg-gradient-to-br from-amber-50 to-white border-l-4 border-amber-600">
            <div className="flex items-center gap-3 mb-4">
              <FaAward className="text-4xl text-amber-600" />
              <h2 className="text-3xl font-bold text-amber-700">Our Vision</h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Diventare il punto di riferimento per gli amanti della pizza in
              tutto il mondo, offrendo un'esperienza deliziosa in ogni morso.
            </p>
          </div>
        </div>

        {/* Quality Ingredients */}
        <section className="card-premium p-10 mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="decorative-line flex-grow max-w-[100px]"></div>
            <div className="text-center">
              <FaLeaf className="text-5xl text-green-600 mx-auto mb-2" />
              <h2 className="text-4xl font-bold text-gray-800">
                Quality Ingredients
              </h2>
            </div>
            <div className="decorative-line flex-grow max-w-[100px]"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <img
                src={ingredientsImage}
                alt="Fresh Ingredients"
                className="rounded-2xl shadow-xl w-full transform hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="order-1 md:order-2 space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                Ogni pizza inizia con una scelta accurata degli ingredienti.
                Utilizziamo solo prodotti <strong className="text-red-600">freschi, genuini e di alta
                  qualità</strong>, selezionati con cura ogni giorno.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Dalle verdure di stagione ai salumi artigianali, dai formaggi autentici alla
                passata di pomodoro profumata, ogni componente è scelto per
                esaltare il sapore e garantire un'esperienza autentica.
              </p>
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <p className="text-red-800 font-semibold italic">
                  "Crediamo che la qualità si senta al primo morso, ed è per
                  questo che non scendiamo mai a compromessi sulla selezione
                  dei nostri ingredienti."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="card-premium p-10 mb-12 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="decorative-line flex-grow max-w-[100px]"></div>
            <h2 className="text-4xl font-bold text-blue-800">Our Team</h2>
            <div className="decorative-line flex-grow max-w-[100px]"></div>
          </div>
          <div className="text-center">
            <img
              src={Team}
              alt="Our Team"
              className="rounded-2xl shadow-xl w-full mb-6"
            />
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              <strong className="text-blue-800">Passione, qualità e gusto:</strong> il nostro team lavora ogni giorno per
              offrirti la pizza perfetta, morso dopo morso. Ogni membro del
              nostro staff è dedicato a mantenere gli alti standard che ci
              distinguono.
            </p>
          </div>
        </section>

        {/* Featured Article */}
        <section className="mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="decorative-line flex-grow max-w-[100px]"></div>
            <h2 className="text-4xl font-bold text-red-600 text-center">
              Featured Article About Us
            </h2>
            <div className="decorative-line flex-grow max-w-[100px]"></div>
          </div>
          <div className="card-premium overflow-hidden">
            <div className="h-96 w-full">
              <iframe
                className="w-full h-full"
                src="https://corrieredibologna.corriere.it/notizie/cronaca/24_febbraio_04/bologna-hussain-e-hassan-la-fuga-dalla-guerra-poi-l-apertura-di-due-pizzerie-tutte-loro-ora-una-casa-64c290f4-b54a-43b8-9701-336586389xlk.shtml"
                title="Corriere di Bologna Article"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                loading="lazy"
              ></iframe>
            </div>
            <div className="p-6 bg-gradient-to-r from-red-50 to-amber-50">
              <p className="text-center text-gray-700 mb-4">
                Scopri la nostra storia ispiratrice in questo articolo del
                Corriere di Bologna – dalla fuga dalla guerra all'apertura di
                due pizzerie di successo a Bologna.
              </p>
              <div className="text-center">
                <a
                  href="https://corrieredibologna.corriere.it/notizie/cronaca/24_febbraio_04/bologna-hussain-e-hassan-la-fuga-dalla-guerra-poi-l-apertura-di-due-pizzerie-tutte-loro-ora-una-casa-64c290f4-b54a-43b8-9701-336586389xlk.shtml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-block"
                >
                  📰 Read Full Article
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Location Map */}
        <section>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="decorative-line flex-grow max-w-[100px]"></div>
            <h2 className="text-4xl font-bold text-green-700 text-center">
              Visit Us in Bologna
            </h2>
            <div className="decorative-line flex-grow max-w-[100px]"></div>
          </div>
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
              ></iframe>
            </div>
            <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
              <p className="text-center text-gray-700 mb-4">
                Vuoi gustare una pizza autentica e fresca nel cuore di Bologna?
                Vieni a trovarci in una delle nostre due accoglienti pizzerie,
                dove la tradizione incontra il sapore. 🍕
              </p>
              <p className="text-center text-gray-700 mb-4">
                Che tu voglia uno spuntino veloce o una cena in compagnia di
                amici e famiglia, le nostre porte sono sempre aperte e i forni
                sempre caldi!
              </p>
              <div className="text-center">
                <a
                  href="https://www.google.com/maps/place/Pizzeria+AZZIPIZZA+mica+pizza+e+fichi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-accent inline-block"
                >
                  📍 Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
