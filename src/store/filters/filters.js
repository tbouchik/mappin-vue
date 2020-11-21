import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { cloneDeep } from 'lodash'
import FilterService from '../../services/filterService.js'

Vue.use(Vuex)

export default {
  state: {
    filtersList: [],
    loading: false,
  },
  mutations: {
    MUTATION_SET_FILTERS(state) {
      state.loading = true
      return axios.get(`/v1/filters`,)
        .then(({ data }) => {
          state.filtersList = data
          state.loading = false
        })
    },
    async MUTATION_UPDATE_FILTER(state, payload) {
      FilterService.updateFilter(
        payload.body,
        payload.id
      ).then(() => {
        let filterIdx = state.filtersList.findIndex(item => payload.id === item.id)
        let newFilter = cloneDeep(state.filtersList[filterIdx])
        Object.assign(newFilter, payload.body)
        state.filtersList[filterIdx] = newFilter
      })
    },
    MUTATION_ADD_FILTER(state, payload) {
      return axios.post(`/v1/filters/`,
        payload)
        .then((response) => {
          let newlist = cloneDeep(state.filtersList)
          newlist.push(response.data)
          state.filtersList = newlist
        })
    },
    MUTATION_REMOVE_FILTER(state, id) {
      return axios.delete(`/v1/filters/${id}`)
        .then(() => {
          state.filtersList.filter(item => item.id !== id)
        })
    },
  },
  actions: {
    ACTION_FETCH_FILTERS({ commit }) {
      commit('MUTATION_SET_FILTERS')
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
    templateLoading: state => state.loading,
  },
}
