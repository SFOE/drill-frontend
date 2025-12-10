<script setup lang="ts">
import MapComponent from './components/MapComponent.vue'
import AddressFulltextSearchComponent from './components/AddressFulltextSearchComponent.vue'
import InfoboxComponent from './components/InfoboxComponent.vue'
import StaticElementsComponent from './components/StaticElementsComponent.vue'
import FooterComponent from './components/FooterComponent.vue'
import HeaderComponent from './components/HeaderComponent.vue'
</script>

<template>
  <HeaderComponent />
  <div class="app-container">
    <AddressFulltextSearchComponent />
    <InfoboxComponent />
    <MapComponent />
    <StaticElementsComponent />
  </div>
  <FooterComponent />
</template>
