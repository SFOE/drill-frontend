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
    <h2 class="warning">Warning: Do NOT use in production</h2>
    <AddressFulltextSearchComponent />
    <InfoboxComponent />
    <MapComponent />
    <StaticElementsComponent />
  </div>
  <FooterComponent />
</template>

<style scoped>
:root {
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: inherit;
}

html,
body {
  margin: 0;
  padding: 0;
  max-width: 100%;
  overflow-x: hidden;
}

.app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
  box-sizing: border-box;
}

.warning {
  color: red;
  text-align: center;
}
</style>
