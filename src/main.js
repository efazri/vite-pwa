import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register'


// const intervalMS = 60 * 60 * 1000
const intervalMS = 3

const updateSW = registerSW({
  onRegistered(r) {
    r && setInterval(() => {
      r.update()
    }, intervalMS)
  }
})
registerSW({ immediate: true })

createApp(App).mount('#app')
