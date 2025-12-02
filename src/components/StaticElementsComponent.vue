<template>
  <section class="info-block">
    <h2 class="info-block__title">{{ t('info_section_title') }}</h2>

    <div class="info-block__body">
      <hr class="divider" />
      <div class="map-icon-bg"></div>
      <h3 class="info-block__heading">
        {{ t('TitelLinkKanton') }}
      </h3>
      <div class="info-block__text" v-html="t('textMapCanton')"></div>

      <hr class="divider" />
      <div class="info-icon-bg"></div>
      <h3 class="info-block__heading">
        {{ t('TitelLinkInfos') }}
      </h3>

      <!-- UPDATED LINKS -->
      <div class="info-block__links">
        <a class="info-block__link" :href="t('WeiterInfos1Url')" target="_blank" rel="noopener">
          <span>{{ t('WeiterInfos1Title') }}</span>
          <img
            src="@/assets/images/oblique/link_external.svg"
            alt="external link"
            class="link-icon"
          />
        </a>

        <a class="info-block__link" :href="t('WeiterInfos2Url')" target="_blank" rel="noopener">
          <span>{{ t('WeiterInfos2Title') }}</span>
          <img
            src="@/assets/images/oblique/link_external.svg"
            alt="external link"
            class="link-icon"
          />
        </a>

        <a class="info-block__link" :href="t('WeiterInfos3Url')" target="_blank" rel="noopener">
          <span>{{ t('WeiterInfos3Title') }}</span>
          <img
            src="@/assets/images/oblique/link_external.svg"
            alt="external link"
            class="link-icon"
          />
        </a>
      </div>

      <div class="info-block__text" v-html="t('hint1')"></div>
      <div class="info-block__text" v-html="t('hint2')"></div>
      <div class="info-block__text" v-html="t('hint3')"></div>
      <div class="info-block__text" v-html="t('hint4')"></div>

      <a
        href="https://www.chauffezrenouvelable.ch/"
        target="_blank"
        rel="noopener"
        class="hint-button"
      >
        {{ t('hintButton') }}
        <img
          src="@/assets/images/oblique/link_external.svg"
          alt="external link"
          class="link-icon"
        />
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.divider {
  border: none;
  border-top: 2px solid #ccc;
  margin: 1.5rem 0;
}

.info-block {
  margin: 2rem 0;
  background-color: #ffffff;
}

.info-block__title {
  margin: 0 0 1.5rem 0;
  font-size: 1.75rem;
  font-weight: 600;
  text-align: center;
}

.info-block__body {
  font-size: 1rem;
}

.info-block__heading {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  margin: 1.5rem 0 0.75rem 0;
  font-weight: 500;
  text-align: center;
}

.info-block__text {
  margin: 0.5rem 0 1.5rem 0;
  text-align: justify;
}

.info-block__links {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-block__link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #005ea5;
  text-decoration: none;
  transition: color 0.2s ease;
}

.info-block__link:hover,
.info-block__link:focus {
  color: #003a6d;
}

.map-icon-bg,
.info-icon-bg {
  width: 50px;
  height: 50px;
  background-size: contain;
  margin: 0 auto;
}

.map-icon-bg {
  background: url('@/assets/images/oblique/map.svg') no-repeat center center;
}

.info-icon-bg {
  background: url('@/assets/images/oblique/info_circle.svg') no-repeat center center;
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

  .info-block__title {
    font-size: 1.5rem;
  }

  .info-block__heading {
    font-size: 1.1rem;
  }
}
</style>
