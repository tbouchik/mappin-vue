import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { cloneDeep, pick } from 'lodash'

Vue.use(Vuex)

let cancelToken

function fetchVendors(queryParams) {
  const { page, limit, name, current } = queryParams
  if (typeof cancelToken !== typeof undefined) {
    cancelToken.cancel('Operation canceled due to new request.')
  }
  // Save the cancel token for the current request
  cancelToken = axios.CancelToken.source()
  const params = {
    limit,
    current,
    page: page - 1,
  }
  if (name && name !== '') {
    params.name = name
  }

  try {
    return axios.get(`/v1/vendors`, { params }, { cancelToken: cancelToken.token })
      .then(
        ({ data }) => data
      )
  } catch (error) {
  }
}

function fetchVendorsCount(queryParams) {
  const { name } = queryParams
  const params = {}
  if (name && name !== '') {
    params.name = name
  }
  return axios.get('/v1/vendors/count', { params })
    .then(
      ({ data }) => data
    )
}

export default {
  state: {
    vendorsList: [],
    pagination: {
      limit: 10,
      page: 1,
    },
    loading: false,
  },
  mutations: {
    MUTATION_SET_VENDORS(state, payload) {
      state.loading = true
      Object.assign(state.pagination, pick(payload, ['limit', 'page']))
      fetchVendors(payload)
        .then(data => {
          state.vendorsList = data.results
          const newPagination = Object.assign({}, state.pagination)
          newPagination.total = data.totalResults
          state.pagination = newPagination
          state.loading = false
        })
    },
    async MUTATION_UPDATE_VENDOR(state, payload) {
      let vendorIdx = state.vendorsList.findIndex(item => payload.id === item.id)
      let newVendor = cloneDeep(state.vendorsList[vendorIdx])
      Object.assign(newVendor, payload.body)
      state.vendorsList[vendorIdx] = newVendor
    },
    MUTATION_ADD_VENDOR(state, response) {
      let newlist = cloneDeep(state.vendorsList)
      newlist.push(response)
      state.vendorsList = newlist
    },
    MUTATION_REMOVE_VENDOR(state, id) {
      state.vendorsList = state.vendorsList.filter(item => item.id !== id)
    },
    MUTATION_FETCH_COUNT_VENDORS(state, payload) {
      fetchVendorsCount(payload)
        .then(data => {
          const newPagination = Object.assign({}, state.pagination)
          newPagination.total = data.count
          state.pagination = newPagination
        })
    },
    MUTATION_START_VENDOR_LOADER(state) {
      state.loading = true
    },
    MUTATION_STOP_VENDOR_LOADER(state) {
      state.loading = false
    },
  },
  actions: {
    ACTION_FETCH_VENDORS({ commit }, payload) {
      commit('MUTATION_SET_VENDORS', payload)
    },
    ACTION_UPDATE_VENDOR({ commit }, payload) {
      commit('MUTATION_UPDATE_VENDOR', payload)
    },
    ACTION_ADD_VENDOR({ commit }, payload) {
      commit('MUTATION_ADD_VENDOR', payload)
    },
    ACTION_REMOVE_VENDOR({ commit }, payload) {
      commit('MUTATION_REMOVE_VENDOR', payload)
    },
    ACTION_FETCH_COUNT_VENDORS({ commit }, filters) {
      commit('MUTATION_FETCH_COUNT_VENDORS', filters)
    },
    ACTION_START_VENDOR_LOADER({ commit }) {
      commit('MUTATION_START_VENDOR_LOADER')
    },
    ACTION_STOP_VENDOR_LOADER({ commit }) {
      commit('MUTATION_STOP_VENDOR_LOADER')
    },
  },
  getters: {
    vendors: state => state.vendorsList,
    vendorTableLoading: state => state.loading,
    vendorTablePagination: state => state.pagination,
  },
}
