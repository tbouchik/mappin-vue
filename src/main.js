import Vue from 'vue'
import VuePageTitle from 'vue-page-title'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import NProgress from 'vue-nprogress'
import { i18n } from '@/localization'
import VueLayers from 'vuelayers'
import BootstrapVue from 'bootstrap-vue'
import moment from 'moment'
import {
  Avatar, TreeSelect, Rate, Breadcrumb, InputNumber, Steps, Message,
  Upload, Button, Layout, Table, Icon, Progress, Radio, Dropdown, Menu,
  Carousel, Input, Calendar, Badge, Slider, Form, Tooltip, Select, Switch,
  Tag, Affix, Spin, Alert, Checkbox, Tabs, Pagination, notification, Drawer,
  Cascader, DatePicker, TimePicker, Divider, Anchor, AutoComplete, BackTop, Collapse, Card, List, Popover,
  Tree, Timeline, Row, Col, Transfer, Modal, message, Popconfirm, Skeleton, ConfigProvider,
} from 'ant-design-vue'
import './global.scss'

Vue.filter('timestamp', function (value) {
  if (!value) return ''
  return moment(value).format('DD/MM/YYYY h:mm A')
})

Vue.use(BootstrapVue)
Vue.use(VueLayers)
Vue.use(Skeleton)
Vue.use(Avatar)
Vue.use(Popconfirm)
Vue.use(Transfer)
Vue.use(Modal)
Vue.use(Divider)
Vue.use(Row)
Vue.use(Col)
Vue.use(Timeline)
Vue.use(Tree)
Vue.use(Popover)
Vue.use(List)
Vue.use(Card)
Vue.use(Button)
Vue.use(Rate)
Vue.use(TreeSelect)
Vue.use(Breadcrumb)
Vue.use(Layout)
Vue.use(Table)
Vue.use(Icon)
Vue.use(Progress)
Vue.use(Radio)
Vue.use(Dropdown)
Vue.use(Menu)
Vue.use(Carousel)
Vue.use(Input)
Vue.use(Calendar)
Vue.use(Badge)
Vue.use(Slider)
Vue.use(Form)
Vue.use(Tooltip)
Vue.use(Select)
Vue.use(Tag)
Vue.use(Affix)
Vue.use(Spin)
Vue.use(Alert)
Vue.use(Checkbox)
Vue.use(Tabs)
Vue.use(Pagination)
Vue.use(Upload)
Vue.use(Message)
Vue.use(Steps)
Vue.use(InputNumber)
Vue.use(Drawer)
Vue.use(Switch)
Vue.use(Cascader)
Vue.use(DatePicker)
Vue.use(TimePicker)
Vue.use(Anchor)
Vue.use(AutoComplete)
Vue.use(Collapse)
Vue.use(BackTop)
Vue.use(ConfigProvider)

Vue.prototype.$notification = notification
Vue.prototype.$message = message

Vue.use(NProgress)
Vue.use(VuePageTitle, {
  prefix: 'Smeltor | ',
  router,
})

Vue.config.productionTip = false
const nprogress = new NProgress({ parent: 'body' })

new Vue({
  router,
  store,
  nprogress,
  i18n,
  created () {
    const userString = localStorage.getItem('user')
    if (userString) {
      const userData = JSON.parse(userString)
      this.$store.commit('SET_USER_DATA', userData)
    }
    axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response.status === 401) {
          this.$store.dispatch('LOGOUT')
        }
        return Promise.reject(error)
      }
    )
  },
  render: h => h(App),
}).$mount('#app')
