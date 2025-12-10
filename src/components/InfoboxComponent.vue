<template>
  <section>
    <div v-if="data" :class="['info-box', suitabilityInfo.color]">
      <div class="icon">
        <img :src="suitabilityInfo.icon" alt="icon" />
      </div>
      <div class="text">
        <h2 v-html="suitabilityInfo.title"></h2>
        <p v-html="suitabilityInfo.body"></p>
        <div v-if="mapStore.wmsConfig?.thematic_geoportal_url" class="geoportal-link-container">
          <p v-if="data.source_values">{{ t('source_values') }}: "{{ data.source_values }}"</p>
          <a
            :href="mapStore.wmsConfig.thematic_geoportal_url"
            target="_blank"
            rel="noopener noreferrer"
            title="Open thematic geoportal in a new tab"
          >
            {{ t('thematic_geoportal_cta') }}
            <img
              src="@/assets/images/oblique/link_external.svg"
              alt="external link"
              class="link-icon"
            />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMapStore } from '../stores/mapStore'

// Import SVGs from assets
import IconGreen from '@/assets/images/oblique/checkmark.svg?url'
import IconOrange from '@/assets/images/oblique/exclamation.svg?url'
import IconRed from '@/assets/images/oblique/xmark.svg?url'
import IconBlue from '@/assets/images/oblique/question.svg?url'

const { t } = useI18n()
const mapStore = useMapStore()

// Use groundCategory from store
const data = computed(() => mapStore.groundCategory)
const suitabilityInfo = computed(() => {
  if (!data.value) return { color: '', icon: '', title: '', body: '' }

  // Map harmonized_value to colors/icons
  const harmonized_value = data.value.harmonized_value ?? 4
  const mapping: Record<number, { color: string; icon: string }> = {
    1: { color: 'green', icon: IconGreen },
    2: { color: 'orange', icon: IconOrange },
    3: { color: 'red', icon: IconRed },
    4: { color: 'blue', icon: IconBlue },
  }

  const key = `suitability${harmonized_value}`
  return {
    color: mapping[harmonized_value]?.color ?? 'blue',
    icon: mapping[harmonized_value]?.icon ?? IconBlue,
    title: t(`${key}short`),
    body: t(key),
    source_values: data.value.source_values,
  }
})
</script>

<style scoped>
.info-box {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  color: #333;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  border: 2px solid transparent;
  background-color: #ffffff;
  box-sizing: border-box;
}

.info-box .icon {
  width: 50px;
  height: 50px;
  margin-right: 1rem;
  flex-shrink: 0;
}

.info-box .icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.info-box .text {
  text-align: left;
}

.info-box .text h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.4rem;
}

.info-box .text p {
  margin: 0;
}

/* Border colors based on drill_suitability */
.green {
  border-color: #3ff069;
}
.orange {
  border-color: #fd9846;
}
.red {
  border-color: rgba(255, 0, 0, 1);
}
.blue {
  border-color: #88bbf2;
}

.geoportal-link-container {
  margin-top: 10px;
}
</style>
