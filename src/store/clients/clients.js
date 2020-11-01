import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { cloneDeep } from 'lodash'
import ClientService from '@/services/clientService.js'

Vue.use(Vuex)

export default {
  state: {
    clientsList: [],
  },
  mutations: {
    MUTATION_SET_CLIENTS(state, data) {
      state.clientsList = data
    },
    async MUTATION_UPDATE_CLIENT(state, payload) {
      ClientService.updateClient(
        payload.body,
        payload.id
      ).then(() => {
        let clientIdx = state.clientsList.findIdex(item => payload.id === item.id)
        let newClient = cloneDeep(state.clientsList[clientIdx])
        Object.assign(newClient, payload.body)
        state.clientsList[clientIdx] = newClient
      })
    },
    MUTATION_ADD_CLIENT(state, payload) {
      return axios.post(`/v1/clients/`,
        payload)
        .then((response) => {
          let newlist = cloneDeep(state.clientsList)
          newlist.push(response.data)
          state.clientsList = newlist
        })
    },
    MUTATION_REMOVE_CLIENT(state, id) {
      return axios.delete(`/v1/clients/${id}`)
        .then(() => {
          state.clientsList.filter(item => item.id !== id)
        })
    },
  },
  actions: {
    ACTION_FETCH_CLIENTS({ commit }) {
      return axios.get(`/v1/clients`,)
        .then(({ data }) => {
          commit('MUTATION_SET_CLIENTS', data)
        })
    },
    ACTION_UPDATE_CLIENT({ commit }, payload) {
      commit('MUTATION_UPDATE_CLIENT', payload)
    },
    ACTION_ADD_CLIENT({ commit }, payload) {
      commit('MUTATION_ADD_CLIENT', payload)
    },
    ACTION_REMOVE_CLIENT({ commit }, payload) {
      commit('MUTATION_REMOVE_CLIENT', payload)
    },
  },
  getters: {
    clients: state => state.clientsList,
  },
}
