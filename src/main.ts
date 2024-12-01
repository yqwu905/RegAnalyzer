import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import { Button, Select, Tree, Toast } from 'primevue';
import ToastService from 'primevue/toastservice';

const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})
app.use(ToastService);
app.component('Button', Button)
app.component('Select', Select)
app.component('Tree', Tree)
app.component('Toast', Toast)
app.mount('#app')
