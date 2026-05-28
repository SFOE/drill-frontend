<template>
  <section>
    <LoadingSpinner v-if="mapStore.loadingGroundCategory" />

    <div v-else-if="data" :class="['info-box', suitabilityInfo.color]">
      <div class="icon">
        <img :src="suitabilityInfo.icon" alt="icon" />
      </div>

      <div class="text">
        <h2 v-html="suitabilityInfo.title"></h2>
        <p v-if="searchStore.selectedAddress" class="selected-address">
          {{ searchStore.selectedAddress }}
        </p>
        <div class="mobile-collapse-wrapper" v-if="isMobile">
          <button class="expand-cta" @click="toggleExpanded">
            {{ isExpanded ? t('hide_details') : t('show_details') }}
          </button>
          <div v-show="isExpanded" class="details">
            <p v-html="suitabilityInfo.body"></p>
            <InfoboxLinksComponent
              :harmonized-value="data.harmonized_value"
              :wms-config="mapStore.wmsConfig"
              :source-values="data.source_values"
            />
          </div>
        </div>

        <div class="desktop-details" v-else>
          <p v-html="suitabilityInfo.body"></p>
          <InfoboxLinksComponent
            :harmonized-value="data.harmonized_value"
            :wms-config="mapStore.wmsConfig"
            :source-values="data.source_values"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMapStore } from '@/stores/mapStore'
import { useSearchStore } from '@/stores/searchStore'
import { useDevice } from '@/composables/useDevice'
import InfoboxLinksComponent from '@/components/InfoboxLinksComponent.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

import IconGreen from '@/assets/images/oblique/checkmark.svg?url'
import IconOrange from '@/assets/images/oblique/exclamation.svg?url'
import IconRed from '@/assets/images/oblique/xmark.svg?url'
import IconBlue from '@/assets/images/oblique/question.svg?url'
import IconPurple from '@/assets/images/oblique/wrench.svg?url'

const { t } = useI18n()
const mapStore = useMapStore()
const searchStore = useSearchStore()

const isExpanded = ref(false)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const { isMobile } = useDevice()

const data = computed(() => mapStore.groundCategory)
const suitabilityInfo = computed(() => {
  if (!data.value) return { color: '', icon: '', title: '', body: '' }
  const harmonized_value = data.value.harmonized_value ?? 99
  const mapping: Record<number, { color: string; icon: string }> = {
    1: { color: 'green', icon: IconGreen },
    2: { color: 'orange', icon: IconOrange },
    3: { color: 'red', icon: IconRed },
    4: { color: 'blue', icon: IconBlue },
    5: { color: 'blue', icon: IconBlue },
    6: { color: 'blue', icon: IconPurple },
    98: { color: 'purple', icon: IconOrange },
    99: { color: 'purple', icon: IconPurple },
  }
  const key = `suitability_level_${harmonized_value}`
  const canton = mapStore.selectedCanton ?? ''
  return {
    color: mapping[harmonized_value]?.color ?? 'blue',
    icon: mapping[harmonized_value]?.icon ?? IconBlue,
    title: t(`${key}_short`, { canton }),
    body: t(key, { canton }),
    source_values: data.value.source_values,
  }
})

watch(data, () => {
  if (isMobile.value) {
    isExpanded.value = false
  }
})
</script>

<style scoped>
.info-box {
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: 1rem;
  border-radius: var(--radius-md);
  color: var(--color-text);
  margin: 1rem 0;
  border: 2px solid transparent;
  background-color: var(--color-bg);
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

.selected-address {
  font-weight: bold;
}

.details {
  margin-top: 0.5rem;
}

.expand-cta {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-primary);
  cursor: pointer;
}

.expand-cta:hover {
  background: var(--color-primary);
  color: #fff;
}

.green {
  border-color: var(--color-green);
}
.orange {
  border-color: var(--color-orange);
}
.red {
  border-color: var(--color-red);
}
.blue {
  border-color: var(--color-blue);
}
.purple {
  border-color: var(--color-purple);
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

  .info-box .text p.selected-address {
    text-align: center;
    width: 100%;
  }
}
</style>
