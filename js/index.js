import { SlideDeck } from './slidedeck.js';
//#Philly coordinates
const map = L.map('map', { scrollWheelZoom: false }).setView([39.95, -75.16], 20);

// ## The Base Tile Layer - I asked ChatGPT to find me this base tile for gray background
const baseTileLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png', {
  maxZoom: 16,
  attribution: '&copy; <a href="https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
});
baseTileLayer.addTo(map);

// ## Interface Elements
const container = document.querySelector('.slide-section');
const slides = document.querySelectorAll('.slide');
//#asked AI how to add legend
const legend = document.querySelector('#map-legend');

const slideOptions = {
  'City_Limits': {
    style: (feature) => {
      return {
        color: 'black',
        weight: 1,
        fillColor: 'black',
        fillOpacity: 0.9,
      };
    },
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(feature.properties.label);
    },
  },
  /* coded by myself - syntax and debugging by claude */
  'market-divide': {
    style: (feature) => {
      const mk = Number(feature.properties.mva_class);

      if (mk === 1 || mk === 2) {
        return { color: 'black', weight: 0.1, fillColor: 'black', fillOpacity: 1 };
      } else if (mk === 4 || mk === 5) {
        return { color: 'gray', weight: 0.1, fillColor: 'darkgray', fillOpacity: 1 };
      } else {
        return { color: 'gray', weight: 0.07, fillColor: 'red', fillOpacity: 0.03 };
      }
    },
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(feature.properties.label);
    },
  },
  /* coded by myself - syntax and debugging by claude */
  'subsidized-stock': {
    pointToLayer: (feature, latlng) => {
      return L.circleMarker(latlng, {
        radius: 2,
        fillColor: 'white',
        color: 'red',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      });
    },
  },
  /* coded by myself - syntax and debugging by claude */
  'need_shown': {
    style: (feature) => {
      const ck = Number(feature.properties.class_of_market);

      if (ck === 10) {
        return { color: 'red', weight: 1, fillColor: 'red', fillOpacity: 0 };
      } else {
        return { color: 'gray', weight: 0.07, fillColor: 'white', fillOpacity: 0 };
      }
    },
  },
  /* coded by myself - syntax and debugging by claude */
  'neighborhood': {
    style: (feature) => {
      return { color: 'red', weight: 4, fillColor: 'red', fillOpacity: 0.1 };
    },
  },
};

/* I wanted this to be a constant layer in the background. I asked ChatGPT tp tell me how I could. While I did see some of the lessons/examples and videos I did need help to figure this out using chat*/

const marketResponse = await fetch('data/market-divide.json');
const marketData = await marketResponse.json();
L.geoJSON(marketData, slideOptions['market-divide']).addTo(map);

// ## The SlideDeck object
const deck = new SlideDeck(container, slides, map, slideOptions);

document.addEventListener('scroll', () => deck.calcCurrentSlideIndex());

deck.preloadFeatureCollections();
deck.syncMapToCurrentSlide();