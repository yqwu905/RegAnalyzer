import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import { Button, Select, Tree } from 'primevue';

const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})
app.component('Button', Button)
app.component('Select', Select)
app.component('Tree', Tree)
app.mount('#app')
