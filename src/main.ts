import '@/assets/main.css'

import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'

import OpenLayersMap from 'vue3-openlayers'
import { createI18n } from 'vue-i18n'
import router from '@/router'

import en from '@/locales/en.json'
import fr from '@/locales/fr.json'
import de from '@/locales/de.json'
import it from '@/locales/it.json'

const i18n = createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'de',
  messages: {
    en,
    fr,
    de,
    it,
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(OpenLayersMap /*, options */)
app.use(i18n)
app.use(router)

app.mount('#app')

watch(
  () => i18n.global.locale.value,
  () => {
    document.title = i18n.global.t('pagetitle')
  },
)
