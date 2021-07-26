import Vue from 'vue'
import Vuex from 'vuex'
import user from './user'
import settings from './settings'
import document from './smeltor/document.js'
import client from './clients/clients.js'
import filter from './filters/filters.js'
import uploader from './uploader/uploader.js'
import viewer from './viewer/viewer.js'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    settings,
    document,
    client,
    filter,
    uploader,
    viewer,
  },
  state: {},
  mutations: {},
  actions: {},
})
