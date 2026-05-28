import '@/assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'

import App from '@/App.vue'
import i18n, { setLocale } from '@/i18n'
import { wakeUpLambda } from '@/stores/mapStore'

const app = createApp(App)

app.use(createPinia())
app.use(i18n)
app.use(router)

app.mount('#app')

// Warm up the Lambda backend after app is mounted
wakeUpLambda()

// Pre-load saved locale if not the default
const savedLocale = localStorage.getItem('app-locale')
if (savedLocale && savedLocale !== 'de') {
  setLocale(savedLocale)
}
