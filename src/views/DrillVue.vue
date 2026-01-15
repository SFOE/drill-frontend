<script setup lang="ts">
import { useRoute } from 'vue-router'
import { watch } from 'vue'
import { useLanguageStore } from '@/stores/languageStore'

import MapComponent from '@/components/MapComponent.vue'
import AddressFulltextSearchComponent from '@/components/AddressFulltextSearchComponent.vue'
import InfoboxComponent from '@/components/InfoboxComponent.vue'
import StaticElementsComponent from '@/components/StaticElementsComponent.vue'
import FooterComponent from '@/components/FooterComponent.vue'
import HeaderComponent from '@/components/HeaderComponent.vue'

const route = useRoute()
const languageStore = useLanguageStore()

if (typeof route.query.lang === 'string') {
  languageStore.currentLocale = route.query.lang
}

watch(
  () => route.query.lang,
  (newLang) => {
    if (typeof newLang === 'string') {
      languageStore.currentLocale = newLang
    }
  },
)
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
