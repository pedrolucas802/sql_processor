import "./assets/theme/css/primeflex.css";
import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import InputNumber from "primevue/inputnumber";
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import Row from 'primevue/row';
import Button from "primevue/button";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import FloatLabel from "primevue/floatlabel";
import TabMenu from "primevue/tabmenu";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import Dialog from "primevue/dialog";
import FileUpload from "primevue/fileupload";
import Paginator from 'primevue/paginator';

createApp(App)
.use(PrimeVue)
.component('DataTable', DataTable)
.component('InputText', InputText)
.component('InputNumber', InputNumber)
.component('Column', Column)
.component('ColumnGroup', ColumnGroup)
.component('Row', Row)
.component('Button', Button)
.component('TabView', TabView)
.component('TabMenu', TabMenu)
.component('TabPanel', TabPanel)
.component('Accordion', Accordion)
.component('AccordionTab', AccordionTab)
.component('FloatLabel', FloatLabel)
.component('FileUpload', FileUpload)
.component('Paginator', Paginator)
.component('Dialog', Dialog)


    .mount('#app')
