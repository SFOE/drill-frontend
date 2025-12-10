<template>
  <section>
    <div v-if="mapStore.loadingGroundCategory" class="info-box loading">
      <div class="text">
        <div class="spinner"></div>
      </div>
    </div>
    <div v-else-if="data" :class="['info-box', suitabilityInfo.color]">
      <div class="icon">
        <img :src="suitabilityInfo.icon" alt="icon" />
      </div>
      <div class="text">
        <h2 v-html="suitabilityInfo.title"></h2>
        <p v-html="suitabilityInfo.body"></p>
        <div v-if="mapStore.wmsConfig" class="geoportal-link-container">
          <p class="infobox-information-title">{{ t('infobox_information_title') }}:</p>
          <div class="links-container">
            <a
              :href="mapStore.wmsConfig.cantonal_energy_service_url"
              target="_blank"
              rel="noopener noreferrer"
              title="Open cantonal energy service website in new tab"
            >
              {{ t('cantonal_energy_service_cta') }}
              <img
                src="@/assets/images/oblique/link_external.svg"
                alt="external link"
                class="link-icon"
              />
            </a>
            <a
              href="{{ t('suitability_heating_url') }}"
              target="_blank"
              rel="noopener noreferrer"
              title="Open cantonal energy service website in new tab"
            >
              {{ t('suitability_heating_cta') }}
              <img
                src="@/assets/images/oblique/link_external.svg"
                alt="external link"
                class="link-icon"
              />
            </a>
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
            <p v-if="data.source_values" class="source-values">
              {{ t('source_values') }}: "{{ data.source_values }}"
            </p>
          </div>
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
  align-items: flex-start;
  width: 100%;
  padding: 1rem; /* Increased padding for a more spacious look */
  border-radius: 8px; /* Slightly rounded corners for a softer look */
  color: #333;
  margin-top: 1rem;
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
  font-size: 1rem; /* Consistent base font size */
}

.info-box .text h2 {
  margin: 0 0 0.5rem 0; /* Increased margin for more space below the title */
  font-size: 1.6rem; /* Harmonized font size for better hierarchy */
  font-weight: 600; /* Slightly heavier font for emphasis */
  line-height: 1.4; /* Adjusted line height for better readability */
}

.info-box .text p {
  margin: 0 0 1rem 0; /* Vertical spacing between paragraphs */
  font-size: 1rem;
  line-height: 1.6; /* Increase line height for readability */
}

.infobox-information-title {
  font-weight: bold;
  font-size: 1.1rem; /* Slightly larger font for section title */
  margin-bottom: 0.5rem; /* Vertical spacing between title and links */
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

/* Loading state */
.info-box.loading {
  justify-content: center;
  text-align: center;
}

.geoportal-link-container {
  margin-top: 1rem; /* Increase top margin for better separation */
}

.links-container {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Slightly increased gap for better readability */
}

.links-container a {
  display: flex;
  align-items: center;
  font-size: 1rem; /* Standard font size for links */
  text-decoration: none;
  color: #0073e6; /* Blue color for links */
  transition: color 0.3s ease; /* Smooth transition for hover effect */
}

.links-container a:hover {
  color: #005bb5; /* Darker blue on hover */
}

.link-icon {
  width: 16px;
  height: 16px;
  margin-left: 8px; /* Space between link text and icon */
}

.source-values {
  font-size: 0.75rem; /* Smaller font size */
  color: #999; /* Lighter gray color */
  margin-top: 1rem;
}
/* Spinner */
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2f4356;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem; /* Adjusted margin to harmonize with other vertical spacings */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-weight: bold;
  font-size: 1.1rem; /* Same font size as other headers */
}
</style>
