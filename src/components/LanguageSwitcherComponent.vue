<template>
  <div class="language-switcher">
    <label for="language-select" class="visually-hidden">Language</label>
    <select id="language-select" v-model="languageStore.currentLocale">
      <option v-for="(label, locale) in locales" :key="locale" :value="locale">
        {{ label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useLanguageStore } from '@/stores/languageStore'

const languageStore = useLanguageStore()

const locales = {
  fr: 'FR',
  de: 'DE',
  it: 'IT',
  en: 'EN',
}
</script>

<style scoped>
.language-switcher {
  position: relative;
  display: inline-block;
  font-size: 14px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.language-switcher select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  padding: 10px 36px 10px 12px;
  min-width: 48px;
  min-height: 48px;
  background-color: transparent;
  color: #000;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  cursor: pointer;

  /* Chevron icon from assets */
  background-image: url('@/assets/images/oblique/chevron_down.svg');
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px 14px;
  filter: invert(100%);
}

.language-switcher select:focus {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.language-switcher option {
  color: #fff;
  background-color: #6c757d;
}
</style>
