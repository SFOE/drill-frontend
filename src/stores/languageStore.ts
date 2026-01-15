import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export const useLanguageStore = defineStore('language', () => {
  const { locale } = useI18n()
  const currentLocale = ref(locale.value)

  watch(currentLocale, (newLocale) => {
    locale.value = newLocale
    localStorage.setItem('app-locale', newLocale)
  })

  const savedLocale = localStorage.getItem('app-locale')
  if (savedLocale) {
    currentLocale.value = savedLocale
    locale.value = savedLocale
  }

  return { currentLocale }
})
