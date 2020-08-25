import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { cloneDeep } from 'lodash'

Vue.use(Vuex)

export default {
  state: {
    filtersList: [],
  },
  mutations: {
    MUTATION_SET_FILTERS(state, data) {
      state.filtersList = data
    },
    MUTATION_UPDATE_FILTER(state, payload) {
      return axios.patch(`http://localhost:3000/v1/filters/${payload.id}`,
        ...payload.body)
        .then(() => {
          let filterIdx = state.findIdex(item => payload.id === item.id)
          let newFilter = cloneDeep(state.filtersList[filterIdx])
          Object.assign(newFilter, payload.body)
          state.filtersList[filterIdx] = newFilter
        })
    },
    MUTATION_ADD_FILTER(state, payload) {
      return axios.post(`http://localhost:3000/v1/filters/`,
        payload)
        .then((response) => {
          let newlist = cloneDeep(state.filtersList)
          newlist.push(response.data)
          state.filtersList = newlist
        })
    },
    MUTATION_REMOVE_FILTER(state, id) {
      return axios.delete(`http://localhost:3000/v1/filters/${id}`)
        .then(() => {
          state.filtersList.filter(item => item.id !== id)
        })
    },
  },
  actions: {
    ACTION_FETCH_FILTERS({ commit }) {
      return axios.get('http://localhost:3000/v1/filters',)
        .then(({ data }) => {
          commit('MUTATION_SET_FILTERS', data)
        })
    },
    ACTION_UPDATE_FILTER({ commit }, payload) {
      commit('MUTATION_UPDATE_FILTER', payload)
    },
    ACTION_ADD_FILTER({ commit }, payload) {
      commit('MUTATION_ADD_FILTER', payload)
    },
    ACTION_REMOVE_FILTER({ commit }, payload) {
      commit('MUTATION_REMOVE_FILTER', payload)
    },
  },
  getters: {
    filters: state => state.filtersList,
  },
}
