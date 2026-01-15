<template>
  <div class="map-component-wrapper">
    <div class="map-component">
      <ol-map
        :loadTilesWhileAnimating="true"
        :loadTilesWhileInteracting="true"
        style="height: 400px"
        @click="getClickedCoordinates"
      >
        <!-- Projection Registration -->
        <ol-projection-register
          :projectionName="projectionName"
          :projectionDef="projectionDef"
          :projectionExtent="projectionExtent"
        />

        <!-- Map View -->
        <ol-view
          ref="view"
          :center="center"
          :projection="projectionName"
          :extent="viewExtent"
          :zoom="defaultZoom"
          :constrainOnlyCenter="false"
          :smoothExtentConstraint="true"
        />

        <!-- Base WMTS Layer -->
        <ol-tile-layer :zIndex="0">
          <ol-source-wmts
            :url="wmtsUrlBackground"
            :matrixSet="matrixSet"
            :format="format_jpeg"
            :tileGrid="tileGrid"
            :projection="projection"
            :styleName="styleName"
            :requestEncoding="requestEncoding"
            :attributions="attributions"
          />
        </ol-tile-layer>

        <!-- Multiple WMS Layers -->
        <ol-tile-layer
          v-for="layer in wmsLayers"
          :key="layer.key"
          :source="layer.source"
          :zIndex="500"
          :opacity="0.85"
        />

        <!-- Marker Layer (always on top) -->
        <ol-vector-layer :zIndex="1000">
          <ol-source-vector :features="features"> </ol-source-vector>
        </ol-vector-layer>

        <!-- Controls -->
        <ol-scale-line-control :bar="false" />
      </ol-map>
    </div>
    <!-- Legend Toggle CTA -->
    <button
      v-if="legendAvailable && mapStore.wmsConfig?.legend_url"
      class="legend-toggle-btn"
      @click="toggleLegend"
    >
      <img src="@/assets/images/oblique/info_circle.svg" alt="Menu" />
      {{ t('legend_cta') }}
    </button>

    <!-- Legend -->
    <transition name="slide-fade">
      <div class="legend-container" v-show="showLegend">
        <img
          v-if="legendAvailable && mapStore.wmsConfig"
          :src="mapStore.wmsConfig.legend_url"
          alt="Legend"
          @error="legendAvailable = false"
        />
        <div v-else class="legend-fallback">
          {{ t('legend_not_available') }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import WMTSTileGrid from 'ol/tilegrid/WMTS.js'
import TileWMS from 'ol/source/TileWMS'
import View from 'ol/View'
import Point from 'ol/geom/Point'
import Feature from 'ol/Feature'
import Style from 'ol/style/Style'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import MapBrowserEvent from 'ol/MapBrowserEvent'
import { useMapStore } from '../stores/mapStore'

const mapStore = useMapStore()
const { t } = useI18n()
// Marker
const features = ref<Feature[]>([])

const markerStyle = new Style({
  image: new CircleStyle({
    radius: 12,
    fill: new Fill({ color: 'red' }),
    stroke: new Stroke({ color: 'white', width: 2 }),
  }),
})

// Create a global marker object (this will persist)
const marker = ref<Feature | null>(null)

// Map view reference
const view = ref<InstanceType<typeof View> | null>(null)
const center = ref([2700000, 1200000])

// Projection setup
const matrixSet = '2056'
const projectionName = 'EPSG:2056'
const projectionDef =
  '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs'
const projectionExtent = [2485071.58, 1075346.31, 2828515.82, 1299941.79]
const viewExtent = [2480000, 1050000, 2838000, 1390000]
const defaultZoom = 3

// WMTS TileGrid setup
const resolutions = [
  4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000, 750, 650, 500, 250,
  100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5, 0.25, 0.1, 0.05,
]
const matrixIds = Array.from({ length: 29 }, (_, i) => i.toString())
const tileGrid = new WMTSTileGrid({
  extent: projectionExtent,
  origin: [2420000, 1350000],
  resolutions,
  matrixIds,
})

// WMTS source parameters
const wmtsUrlBackground =
  'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg'
const format_jpeg = 'image/jpeg'
const format_png = 'image/png'
const projection = 'EPSG:2056'
const styleName = 'default'
const requestEncoding = 'REST'
const attributions = ['© Data: swisstopo, cantons']

// Reactive array for multiple WMS layers
const wmsLayers = ref<{ key: string; source: TileWMS }[]>([])

// Legend state
const showLegend = ref(false)
const legendAvailable = ref(true)

// Toggle legend visibility
const toggleLegend = () => {
  showLegend.value = !showLegend.value
}

// Watch WMS config to create/update multiple layers
watch(
  () => mapStore.wmsConfig,
  (config) => {
    if (!config || !config.layers || config.layers.length === 0) {
      wmsLayers.value = []
      legendAvailable.value = false
      return
    }

    // Do not display WMS layers when disabled in configuration
    if (config && !config.active) {
      wmsLayers.value = []
      legendAvailable.value = false
      return
    }

    wmsLayers.value = config.layers.map((layer) => ({
      key: layer.name,
      source: new TileWMS({
        url: config.wms_url,
        params: { LAYERS: layer.name, TILED: true, FORMAT: format_png },
        crossOrigin: 'anonymous',
        projection: projection,
      }),
    }))

    legendAvailable.value = !!config.legend_url
  },
  { immediate: true },
)

watch(
  () => mapStore.coordinates,
  (coords) => {
    if (!coords || !view.value) {
      marker.value = null
      features.value = []
      return
    }

    const newCenter = [coords.y, coords.x]

    if (!marker.value) {
      marker.value = new Feature({ geometry: new Point(newCenter) })
      marker.value.setStyle(markerStyle)
    } else {
      marker.value.setGeometry(new Point(newCenter))
    }
    view.value.setCenter(newCenter)
    view.value.setZoom(15)

    features.value = [marker.value]
  },
  { immediate: true },
)

const getClickedCoordinates = (event: MapBrowserEvent) => {
  const coordinate = event.coordinate

  if (coordinate) {
    mapStore.clearSearchState()

    const x = coordinate[1]
    const y = coordinate[0]

    if (typeof x === 'number' && typeof y === 'number') {
      mapStore.fetchGroundCategory(x, y)
    } else {
      console.error('Invalid coordinates:', coordinate)
    }
  } else {
    console.error('Coordinate is undefined.')
  }
}
</script>

<style scoped>
.map-component {
  flex: 1;
  background-color: #ddd;
  border-radius: 8px;
  overflow: hidden;
}

/* Legend Toggle Button */
.legend-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: bold;
  margin-top: 8px;
}

.legend-toggle-btn:hover {
  background-color: #e6e6e6;
}

.legend-toggle-btn img {
  width: 18px;
  height: 18px;
}

/* Legend Container */
.legend-container {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: white;
  padding: 0.75rem;
  border-radius: 8px;
}

.legend-title {
  font-weight: bold;
}

.legend-container img {
  max-width: 400px;
}

.legend-fallback {
  font-style: italic;
  color: #555;
}

/* Transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
