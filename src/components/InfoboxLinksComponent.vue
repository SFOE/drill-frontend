<template>
  <div v-if="harmonizedValue === 98 && wmsConfig" class="geoportal-link-container">
    <div class="links-container">
      <a
        :href="wmsConfig.cantonal_energy_service_url"
        target="_blank"
        rel="noopener noreferrer"
        class="link-with-icon"
      >
        {{ t('cantonal_energy_service_call_to_action') }}
      </a>
    </div>
  </div>
  <div v-if="wmsConfig && harmonizedValue !== 98" class="geoportal-link-container">
    <p class="infobox-information-title">{{ t('infobox_information_title') }}:</p>
    <div class="links-container">
      <a
        :href="wmsConfig.cantonal_energy_service_url"
        target="_blank"
        rel="noopener noreferrer"
        class="link-with-icon"
      >
        {{ t('cantonal_energy_service_call_to_action') }}
      </a>
      <a
        :href="wmsConfig.thematic_geoportal_url"
        target="_blank"
        rel="noopener noreferrer"
        class="link-with-icon"
      >
        {{ t('thematic_geoportal_call_to_action') }}
      </a>
      <a
        :href="t('suitability_heating_url')"
        target="_blank"
        rel="noopener noreferrer"
        class="link-with-icon"
      >
        {{ t('suitability_heating_call_to_action') }}
      </a>
      <p v-if="sourceValues" class="source-values">
        {{ t('source_values') }}: "{{ sourceValues }}"
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { CantonWmsConfig } from '@/types/wms'

const { t } = useI18n()

defineProps<{
  harmonizedValue: number
  wmsConfig: CantonWmsConfig | null
  sourceValues?: string
}>()
</script>

<style scoped>
.links-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-with-icon {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: #0073e6;
  font-size: 1rem;
}

.link-with-icon:hover {
  color: #005bb5;
}

.source-values {
  font-size: 0.75rem;
  color: #757575;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .links-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
