<template>
  <div class="language-switcher">
    <select v-model="languageStore.currentLocale">
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

.language-switcher select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  padding: 6px 36px 6px 12px;
  background-color: transparent;
  color: #000; /* black text */
  font-weight: 600;
  border: none;
  border-radius: 4px;
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
  outline: none;
}

.language-switcher option {
  color: #fff;
  background-color: #6c757d;
}
</style>
