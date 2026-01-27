<template>
  <section class="info-block">
    <h2 class="info-block-title">{{ t('information_title') }}</h2>

    <div class="info-block-body">
      <h3 class="info-block-heading">
        {{ t('app_goal_title') }}
      </h3>
      <div class="info-block-body" v-html="t('app_goal')"></div>
      <h3 class="info-block-heading">
        {{ t('TitelLinkKanton') }}
      </h3>
      <div class="info-block-body" v-html="t('textMapCanton')"></div>

      <h3 class="info-block-heading">
        {{ t('TitelLinkInfos') }}
      </h3>

      <div class="info-block-body" v-html="t('hint1')"></div>
      <div class="info-block-body" v-html="t('hint4')"></div>

      <div class="info-block-links">
        <a :href="t('suitability_heating_url')" target="_blank" rel="noopener" class="hint-button">
          {{ t('suitability_heating_cta') }}
        </a>
        <a class="info-block-link" :href="t('WeiterInfos1Url')" target="_blank" rel="noopener">
          <span>{{ t('WeiterInfos1Title') }}</span>
        </a>
        <a class="info-block-link" :href="t('WeiterInfos2Url')" target="_blank" rel="noopener">
          <span>{{ t('WeiterInfos2Title') }}</span>
        </a>
        <a class="info-block-link" :href="t('WeiterInfos3Url')" target="_blank" rel="noopener">
          <span>{{ t('WeiterInfos3Title') }}</span>
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
  background-color: #ffffff;
}

.info-block-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.75rem;
  font-weight: 600;
  text-align: center;
}

.info-block-body {
  font-size: 1rem;
}

.info-block-heading {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  margin: 2rem 0 1.5rem 0;
  font-weight: 500;
  text-align: center;
}

.info-block-body {
  margin: 0.5rem 0 1.5rem 0;
  text-align: justify;
}

.info-block-links {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-block-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #005ea5;
  text-decoration: none;
  transition: color 0.2s ease;
}

.info-block-link:hover,
.info-block-link:focus {
  color: #003a6d;
}

.hint-button {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #005ea5;
  text-decoration: none;
}

.hint-button:hover,
.hint-button:focus {
  color: #003a6d;
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
