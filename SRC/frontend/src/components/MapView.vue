<script setup>
import { onMounted, onUnmounted, watch, ref } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default icon path broken by bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
})

const props = defineProps({
  markers: {
    type: Array,
    default: () => [],
    // [{lat, lng, label, color?}]
  },
  route: {
    type: Array,
    default: () => [],
    // [[lat, lng], ...] already converted from OSRM
  },
  zoom: {
    type: Number,
    default: 14,
  },
  height: {
    type: String,
    default: '300px',
  },
})

const emit = defineEmits(['map-click'])

const mapEl = ref(null)
let map = null
let markerLayer = null
let routeLayer = null

const ICONS = {
  red: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  }),
  blue: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  }),
  green: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  }),
  orange: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  }),
}

function getIcon(color) {
  return ICONS[color] || ICONS.blue
}

function renderMarkers() {
  if (!map || !markerLayer) return
  markerLayer.clearLayers()
  const validMarkers = (props.markers || []).filter((m) => m?.lat && m?.lng)
  validMarkers.forEach((m) => {
    L.marker([Number(m.lat), Number(m.lng)], { icon: getIcon(m.color) })
      .addTo(markerLayer)
      .bindPopup(m.label || '')
  })
  if (validMarkers.length === 1) {
    map.setView([Number(validMarkers[0].lat), Number(validMarkers[0].lng)], props.zoom)
  } else if (validMarkers.length > 1) {
    const bounds = L.latLngBounds(validMarkers.map((m) => [Number(m.lat), Number(m.lng)]))
    map.fitBounds(bounds, { padding: [40, 40] })
  }
}

function renderRoute() {
  if (!map || !routeLayer) return
  routeLayer.clearLayers()
  const coords = props.route || []
  if (coords.length < 2) return
  L.polyline(coords, { color: '#f8143f', weight: 4, opacity: 0.8 }).addTo(routeLayer)
}

onMounted(() => {
  const el = mapEl.value
  if (!el) return
  map = L.map(el, { zoomControl: true, scrollWheelZoom: true })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)
  markerLayer = L.layerGroup().addTo(map)
  routeLayer = L.layerGroup().addTo(map)

  // Default center (Vietnam)
  map.setView([10.8231, 106.6297], 12)

  map.on('click', (e) => {
    emit('map-click', { lat: e.latlng.lat, lng: e.latlng.lng })
  })

  renderMarkers()
  renderRoute()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

watch(() => props.markers, renderMarkers, { deep: true })
watch(() => props.route, renderRoute, { deep: true })
</script>

<template>
  <div class="map-wrap" :style="{ height }">
    <div ref="mapEl" class="map-inner"></div>
  </div>
</template>

<style scoped>
.map-wrap {
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e5eaf2;
}
.map-inner {
  width: 100%;
  height: 100%;
}
</style>
