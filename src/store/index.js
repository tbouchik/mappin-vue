import Vue from 'vue'
import Vuex from 'vuex'
import user from './user'
import settings from './settings'
import document from './smeltor/document.js'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    settings,
    document,
  },
  state: {},
  mutations: {},
  actions: {},
})
