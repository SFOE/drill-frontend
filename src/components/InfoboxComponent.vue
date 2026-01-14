<template>
  <section>
    <div v-if="mapStore.loadingGroundCategory" class="info-box loading-overlay">
      <div class="spinner"></div>
    </div>

    <div v-else-if="data" :class="['info-box', suitabilityInfo.color]">
      <div class="icon">
        <img :src="suitabilityInfo.icon" alt="icon" />
      </div>

      <div class="text">
        <h2 v-html="suitabilityInfo.title"></h2>

        <div class="mobile-collapse-wrapper" v-if="isMobile">
          <button class="expand-cta" @click="toggleExpanded">
            {{ isExpanded ? t('hide_details') : t('show_details') }}
          </button>
          <div v-show="isExpanded" class="details">
            <p v-html="suitabilityInfo.body"></p>
            <div v-if="mapStore.wmsConfig" class="geoportal-link-container">
              <p class="infobox-information-title">{{ t('infobox_information_title') }}:</p>
              <div class="links-container">
                <a
                  :href="mapStore.wmsConfig.cantonal_energy_service_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link-with-icon"
                >
                  {{ t('cantonal_energy_service_cta') }}
                </a>
                <a
                  :href="t('suitability_heating_url')"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link-with-icon"
                >
                  {{ t('suitability_heating_cta') }}
                </a>
                <a
                  :href="mapStore.wmsConfig.thematic_geoportal_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link-with-icon"
                >
                  {{ t('thematic_geoportal_cta') }}
                </a>
                <p v-if="data.source_values" class="source-values">
                  {{ t('source_values') }}: "{{ data.source_values }}"
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="desktop-details" v-else>
          <p v-html="suitabilityInfo.body"></p>
          <div v-if="mapStore.wmsConfig" class="geoportal-link-container">
            <p class="infobox-information-title">{{ t('infobox_information_title') }}:</p>
            <div class="links-container">
              <a
                :href="mapStore.wmsConfig.cantonal_energy_service_url"
                target="_blank"
                rel="noopener noreferrer"
                class="link-with-icon"
              >
                {{ t('cantonal_energy_service_cta') }}
              </a>
              <a
                :href="t('suitability_heating_url')"
                target="_blank"
                rel="noopener noreferrer"
                class="link-with-icon"
              >
                {{ t('suitability_heating_cta') }}
              </a>
              <a
                :href="mapStore.wmsConfig.thematic_geoportal_url"
                target="_blank"
                rel="noopener noreferrer"
                class="link-with-icon"
              >
                {{ t('thematic_geoportal_cta') }}
              </a>
              <p v-if="data.source_values" class="source-values">
                {{ t('source_values') }}: "{{ data.source_values }}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMapStore } from '../stores/mapStore'

import IconGreen from '@/assets/images/oblique/checkmark.svg?url'
import IconOrange from '@/assets/images/oblique/exclamation.svg?url'
import IconRed from '@/assets/images/oblique/xmark.svg?url'
import IconBlue from '@/assets/images/oblique/question.svg?url'

const { t } = useI18n()
const mapStore = useMapStore()

const isExpanded = ref(false)
const isMobile = ref(false)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

const data = computed(() => mapStore.groundCategory)
const suitabilityInfo = computed(() => {
  if (!data.value) return { color: '', icon: '', title: '', body: '' }
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
  padding: 1rem;
  border-radius: 8px;
  color: #333;
  margin: 1rem 0;
  border: 2px solid transparent;
  background-color: #fff;
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

.info-box .text h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.6rem;
  font-weight: 600;
}

.details {
  margin-top: 0.5rem;
}

.expand-cta {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
  border: 1px solid #2f4356;
  border-radius: 4px;
  background: #fff;
  color: #2f4356;
  cursor: pointer;
}

.expand-cta:hover {
  background: #2f4356;
  color: #fff;
}

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

.link-with-icon::after {
  content: url('@/assets/images/oblique/link_external.svg');
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-left: 0.25em;
}

.source-values {
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.5rem;
}

.green {
  border-color: #3ff069;
}
.orange {
  border-color: #fd9846;
}
.red {
  border-color: #ff0000;
}
.blue {
  border-color: #88bbf2;
}

.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 2rem;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2f4356;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .info-box {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .info-box .icon {
    margin: 0 0 0.5rem 0;
  }

  .info-box .text h2 {
    font-size: 1.2rem;
  }

  .info-box .text p {
    text-align: left;
    width: 100%;
  }

  .links-container {
    align-items: flex-start;
    width: 100%;
  }
}
</style>
