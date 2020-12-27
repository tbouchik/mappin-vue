import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { cloneDeep, pick } from 'lodash'

Vue.use(Vuex)

let cancelToken

function fetchClients(queryParams) {
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
    return axios.get(`/v1/clients`, { params }, { cancelToken: cancelToken.token })
      .then(
        ({ data }) => data
      )
  } catch (error) {
  }
}

function fetchClientsCount(queryParams) {
  const { name } = queryParams
  const params = {}
  if (name && name !== '') {
    params.name = name
  }
  return axios.get('/v1/clients/count', { params })
    .then(
      ({ data }) => data
    )
}

export default {
  state: {
    clientsList: [],
    pagination: {
      limit: 10,
      page: 1,
    },
    loading: false,
  },
  mutations: {
    MUTATION_SET_CLIENTS(state, payload) {
      state.loading = true
      Object.assign(state.pagination, pick(payload, ['limit', 'page']))
      fetchClients(payload)
        .then(data => {
          state.clientsList = data
          state.loading = false
        })
    },
    async MUTATION_UPDATE_CLIENT(state, payload) {
      let clientIdx = state.clientsList.findIndex(item => payload.id === item.id)
      let newClient = cloneDeep(state.clientsList[clientIdx])
      Object.assign(newClient, payload.body)
      state.clientsList[clientIdx] = newClient
    },
    MUTATION_ADD_CLIENT(state, response) {
      let newlist = cloneDeep(state.clientsList)
      newlist.push(response)
      state.clientsList = newlist
    },
    MUTATION_REMOVE_CLIENT(state, id) {
      state.clientsList = state.clientsList.filter(item => item.id !== id)
    },
    MUTATION_FETCH_COUNT_CLIENTS(state, payload) {
      fetchClientsCount(payload)
        .then(data => {
          const newPagination = Object.assign({}, state.pagination)
          newPagination.total = data.count
          state.pagination = newPagination
        })
    },
    MUTATION_START_CLIENT_LOADER(state) {
      state.loading = true
    },
    MUTATION_STOP_CLIENT_LOADER(state) {
      state.loading = false
    },
  },
  actions: {
    ACTION_FETCH_CLIENTS({ commit }, payload) {
      commit('MUTATION_SET_CLIENTS', payload)
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
    ACTION_FETCH_COUNT_CLIENTS({ commit }, filters) {
      commit('MUTATION_FETCH_COUNT_CLIENTS', filters)
    },
    ACTION_START_CLIENT_LOADER({ commit }) {
      commit('MUTATION_START_CLIENT_LOADER')
    },
    ACTION_STOP_CLIENT_LOADER({ commit }) {
      commit('MUTATION_STOP_CLIENT_LOADER')
    },
  },
  getters: {
    clients: state => state.clientsList,
    clientTableLoading: state => state.loading,
    clientTablePagination: state => state.pagination,
  },
}
