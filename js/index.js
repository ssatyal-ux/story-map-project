import { SlideDeck } from './slidedeck.js';
// ##Philly coordinates + zoomsnap to make map zoom between slides so each map/slide fits better and zooms for narratie purposes
const map = L.map('map', { scrollWheelZoom: false, zoomSnap: 0 }).setView([39.95, -75.16], 20);


// ## The Base Tile Layer - Esri dark gray basemap (no API key needed). my original choice did not work online
const baseTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 20,
  maxNativeZoom: 16,
  attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
}).addTo(map);
/* Map legend: adapted from the professor's accessibility demo (initLegend) */

// ## legend now shows up constantly on every slide and sets it to the bottom left
const legend = L.control({ position: 'bottomleft' });

// ## setting up the legend where the <li> picks up legend feature from css. added lines for separation
legend.onAdd = (map) => {
  const div = L.DomUtil.create('div', 'legend');
  div.innerHTML = `
    <h2>Map Key</h2>
    <ul>
      <li class = "__"_____________________</li>
      <li class = "legend-item xx"> ____________________</li>
      <li class = "legend-item xx"> City Level: </li>
      <li class ="legend-item city"> Philadelphia City Limits </li>
      <li class = "legend-item xx"> ____________________</li>
      <li class = "legend-item xx"> Market Indicators: </li>
      <li class = "">  </li>
      <li class =""       </li>
      <li class="legend-item strong">Stronger market (1–2)</li>
      <li class="legend-item middle">Middle market (3)</li>
      <li class="legend-item weak">Weaker market (4–5)</li>
      <li class = "legend-item xx"> ____________________</li>
      <li class = "legend-item xx"> Housing:</li>
      
      <li class="legend-item housing">Subsidized housing</li>
      <li class="legend-item gap">Gap area</li>
      <li class = "legend-item xx"> ____________________</li>
      <li class = "legend-item xx"> Neighborhood Level:</li>
      <li class="legend-item packer">Packer Park Boundary</li>
       <li class="legend-item permit">Permit</li>
      <li class="legend-item vacant">Vacant parcel</li>
    </ul>
  `;
  return div;
};

// ## legend sits on map
legend.addTo(map);

// ## mostly from template

// ## Interface Elements - grabbing from html for each slide
const container = document.querySelector('.slide-section');
const slides = document.querySelectorAll('.slide');

// ## matching slide contetn and map content
const slideOptions = {
  // ## shows philly boundary
  'City_Limits': {
    style: (feature) => {
      return {
        color: 'black',
        weight: 1,
        fillColor: 'orange',
        fillOpacity: 0.99,
      };
    },
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(feature.properties.label);
    },
  },
  // coded by myself - syntax and debugging by claude
  // slide 2 showing divide in market using mva data and then assigning colors
  'market-divide': {
    style: (feature) => {
      const mk = Number(feature.properties.mva_class);

      if (mk === 1 || mk === 2) {
        return { color: 'golden', weight: 0.1, fillColor: 'gold', fillOpacity: 1 };
      } else if (mk === 4 || mk === 5) {
        return { color: 'gray', weight: 0.1, fillColor: 'lightgoldenrodyellow', fillOpacity: 1 };
      } else {
        return { color: 'gray', weight: 0.07, fillColor: 'white', fillOpacity: 0.3 };
      }
    },
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(feature.properties.label);
    },
  },
  // coded by myself - syntax and debugging by claude
  // placing affordable housing stock on the map
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
  // coded by myself - syntax and debugging by claude
  // gap in affordable housing - all of these codes are repitive

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
  // coded by myself - syntax and debugging by claude
  'neighborhood': {
    style: (feature) => {
      return { color: 'pink', weight: 4, fillColor: 'red', fillOpacity: 0.1 };
    },
  },
  // coded by myself - syntax and debugging by claude
  'packer-park': {
    pointToLayer: (feature, latlng) => {
      return L.circleMarker(latlng, {
        radius: 10,
        fillColor: 'white',
        color: 'brown',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8,
      });
    },
  },
  'specific': {
    pointToLayer: (feature, latlng) => {
      return L.circleMarker (latlng, {
        radius: 20,
        fillColor: 'white',
        color: 'brown',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8,
      });
    },
  },
  'vacant-land': {
    style: (feature) => {
      return { color: 'white', weight: 0.03, fillColor: 'darkgreen', fillOpacity: 1 };
    },
  },
  'specific_vacant': {
    style: (feature) => {
      return { color: 'white', weight: 0.03, fillColor: 'darkgreen', fillOpacity: 1 };
    },
  },
};

// I wanted this to be a constant layer in the background. I asked ChatGPT tp tell me how I could. While I did see some of the lessons/examples and videos I did need help to figure this out using chat*/
const marketResponse = await fetch('data/market-divide.json');
const marketData = await marketResponse.json();
L.geoJSON(marketData, slideOptions['market-divide']).addTo(map);

// ## The SlideDeck object
const deck = new SlideDeck(container, slides, map, slideOptions);

document.addEventListener('scroll', () => deck.calcCurrentSlideIndex());

deck.preloadFeatureCollections();
deck.syncMapToCurrentSlide();
