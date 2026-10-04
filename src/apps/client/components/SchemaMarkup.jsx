import React from 'react';

export const RestaurantSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Azzipizza",
    "image": "https://azzipizza.it/assets/logo-pizza.png",
    "@id": "https://azzipizza.it/",
    "url": "https://azzipizza.it/",
    "telephone": "+393713985810",
    "email": "azzipizzamicapizzaefichi@gmail.com",
    "priceRange": "€",
    "menu": "https://azzipizza.it/menu",
    "servesCuisine": ["Pizza", "Fritti", "Italian"],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Via Frassinago, 16b",
      "addressLocality": "Bologna",
      "postalCode": "40123",
      "addressRegion": "BO",
      "addressCountry": "IT"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 44.4908,
      "longitude": 11.3340
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "18:00",
        "closes": "23:00"
      }
    ],
    "sameAs": [
      "https://www.instagram.com/azzipizzamicapizzaefichi",
      "https://maps.app.goo.gl/R5K5RN5gCXK7TSox9"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const MenuSchema = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "name": "Menu Azzipizza",
    "url": "https://azzipizza.it/menu",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://azzipizza.it/menu"
    },
    "hasMenuSection": [
      {
        "@type": "MenuSection",
        "name": "Pizze e Fritti",
        "hasMenuItem": items.slice(0, 15).map(item => ({
          "@type": "MenuItem",
          "name": item.name,
          "description": item.description || `Deliziosa ${item.name} preparata con ingredienti freschi.`,
          "offers": {
            "@type": "Offer",
            "price": item.price,
            "priceCurrency": "EUR"
          }
        }))
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
