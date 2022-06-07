import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { cloneDeep, pick } from 'lodash'

Vue.use(Vuex)

let cancelToken

function fetchJournals(queryParams) {
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
    return axios.get(`/v1/journals`, { params }, { cancelToken: cancelToken.token })
      .then(
        ({ data }) => data
      )
  } catch (error) {
  }
}

function fetchJournalsCount(queryParams) {
  const { name } = queryParams
  const params = {}
  if (name && name !== '') {
    params.name = name
  }
  return axios.get('/v1/journals/count', { params })
    .then(
      ({ data }) => data
    )
}

export default {
  state: {
    journalsList: [],
    pagination: {
      limit: 10,
      page: 1,
    },
    loading: false,
  },
  mutations: {
    MUTATION_SET_JOURNALS(state, payload) {
      state.loading = true
      Object.assign(state.pagination, pick(payload, ['limit', 'page']))
      fetchJournals(payload)
        .then(data => {
          state.journalsList = data
          state.loading = false
        })
    },
    async MUTATION_UPDATE_JOURNAL(state, payload) {
      let journalIdx = state.journalsList.findIndex(item => payload.id === item.id)
      let newJournal = cloneDeep(state.journalsList[journalIdx])
      Object.assign(newJournal, payload.body)
      state.journalsList[journalIdx] = newJournal
    },
    MUTATION_ADD_JOURNAL(state, response) {
      let newlist = cloneDeep(state.journalsList)
      newlist.push(response)
      state.journalsList = newlist
    },
    MUTATION_REMOVE_JOURNAL(state, id) {
      state.journalsList = state.journalsList.filter(item => item.id !== id)
    },
    MUTATION_FETCH_COUNT_JOURNALS(state, payload) {
      fetchJournalsCount(payload)
        .then(data => {
          const newPagination = Object.assign({}, state.pagination)
          newPagination.total = data.count
          state.pagination = newPagination
        })
    },
    MUTATION_START_JOURNAL_LOADER(state) {
      state.loading = true
    },
    MUTATION_STOP_JOURNAL_LOADER(state) {
      state.loading = false
    },
  },
  actions: {
    ACTION_FETCH_JOURNALS({ commit }, payload) {
      commit('MUTATION_SET_JOURNALS', payload)
    },
    ACTION_UPDATE_JOURNAL({ commit }, payload) {
      commit('MUTATION_UPDATE_JOURNAL', payload)
    },
    ACTION_ADD_JOURNAL({ commit }, payload) {
      commit('MUTATION_ADD_JOURNAL', payload)
    },
    ACTION_REMOVE_JOURNAL({ commit }, payload) {
      commit('MUTATION_REMOVE_JOURNAL', payload)
    },
    ACTION_FETCH_COUNT_JOURNALS({ commit }, filters) {
      commit('MUTATION_FETCH_COUNT_JOURNALS', filters)
    },
    ACTION_START_JOURNAL_LOADER({ commit }) {
      commit('MUTATION_START_JOURNAL_LOADER')
    },
    ACTION_STOP_JOURNAL_LOADER({ commit }) {
      commit('MUTATION_STOP_JOURNAL_LOADER')
    },
  },
  getters: {
    journals: state => state.journalsList,
    journalTableLoading: state => state.loading,
    journalTablePagination: state => state.pagination,
  },
}
