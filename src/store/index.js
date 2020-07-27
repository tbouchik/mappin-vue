import Vue from 'vue'
import Vuex from 'vuex'
import user from './user'
import settings from './settings'
import document from './smeltor/document.js'
import client from './clients/clients.js'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    settings,
    document,
    client,
  },
  state: {},
  mutations: {},
  actions: {},
})
