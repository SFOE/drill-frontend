<template>
  <section class="info-block">
    <h2 class="info-block-title">{{ t('information_title') }}</h2>

    <div class="info-block-body">
      <h3 class="info-block-heading">
        {{ t('app_goal_title') }}
      </h3>
      <div class="info-block-body" v-html="t('app_goal')"></div>
      <h3 class="info-block-heading">
        {{ t('title_link_canton') }}
      </h3>
      <div class="info-block-body" v-html="t('map_canton_text')"></div>

      <h3 class="info-block-heading">
        {{ t('title_link_infos') }}
      </h3>

      <div class="info-block-body" v-html="t('hint_1')"></div>
      <div class="info-block-body" v-html="t('hint_4')"></div>

      <div class="link-list info-block-links">
        <a :href="t('suitability_heating_url')" target="_blank" rel="noopener">
          {{ t('suitability_heating_call_to_action') }}
        </a>
        <a :href="t('additional_info_1_url')" target="_blank" rel="noopener">
          {{ t('additional_info_1_title') }}
        </a>
        <a :href="t('additional_info_2_url')" target="_blank" rel="noopener">
          {{ t('additional_info_2_title') }}
        </a>
        <a :href="t('additional_info_3_url')" target="_blank" rel="noopener">
          {{ t('additional_info_3_title') }}
        </a>
        <a :href="t('additional_info_4_url')" target="_blank" rel="noopener">
          {{ t('additional_info_4_title') }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.info-block {
  margin: 2rem 0;
  background-color: var(--color-bg);
}

.info-block-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.75rem;
  font-weight: 600;
  text-align: center;
}

.info-block-body {
  font-size: 1rem;
  margin: 0.5rem 0 1.5rem 0;
  text-align: justify;
}

.info-block-heading {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  margin: 2rem 0 1.5rem 0;
  font-weight: 600;
  text-align: center;
}

.info-block-links {
  margin: 1rem 0 0 0;
}

@media (max-width: 600px) {
  .info-block {
    padding: 1.5rem 1rem;
  }

  .info-block-title {
    font-size: 1.5rem;
  }

  .info-block-heading {
    font-size: 1.1rem;
  }
}
</style>
