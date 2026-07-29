import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const { useThemeStore } = await import('@/stores/theme')
const themeStore = useThemeStore()
themeStore.init()

app.mount('#app')
