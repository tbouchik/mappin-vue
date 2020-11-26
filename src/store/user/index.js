import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { cloneDeep } from 'lodash'

Vue.use(Vuex)

export default {
  state: {
    user: null,
  },
  mutations: {
    UPDATE_USER(state, { user }) {
      state.user = user
    },
    SET_USER_DATA(state, userData) {
      state.user = userData
      localStorage.setItem('user', JSON.stringify(userData))
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.tokens.access.token}`
    },
    SET_USER_COMPANY_NAME(state, companyName) {
      state.user.user.company = companyName
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    CLEAR_USER_DATA() {
      localStorage.removeItem('user')
      location.reload()
    },
    MUTATION_SET_USER_COUNTER(state, counter) {
      const newStateUser = cloneDeep(state.user)
      newStateUser.user.counter = counter
      state.user = newStateUser
    },
  },
  actions: {
    REGISTER({ commit }, credentials) {
      return axios
        .post(`/v1/auth/register`, credentials)
        .then(({ data }) => {
          commit('SET_USER_DATA', data)
          return axios.get(
            `/v1/companies/${data.user.company}`,
            credentials
          )
        })
        .then(({ data }) => {
          commit('SET_USER_COMPANY_NAME', data.name)
        })
    },
    LOGIN({ commit }, credentials) {
      return axios
        .post(`/v1/auth/login`, credentials)
        .then(({ data }) => {
          commit('SET_USER_DATA', data)
          if (!data.user.isClient) {
            return axios
              .get(
                `/v1/companies/${data.user.company}`,
                credentials
              )
              .then(({ data }) => {
                commit('SET_USER_COMPANY_NAME', data.name)
              })
          } else {
            commit('SET_USER_COMPANY_NAME', data.user.company)
          }
        })
    },
    ACTION_UPDATE_COUNTER({ commit }, userId) {
      return axios
        .get(`/v1/users/${userId}`)
        .then(({ data }) => {
          commit('MUTATION_SET_USER_COUNTER', data.counter)
        })
    },
    LOGOUT({ commit }) {
      commit('CLEAR_USER_DATA')
    },
  },
  getters: {
    user: state => {
      if (state.user) {
        return state.user.user
      }
    },
    userId: state => state.user.user.id,
    loggedIn: state => !!state.user,
    userIsClient: state => !!state.user.user.isClient,
    userCount: state => state.user.user.counter ? state.user.user.counter : 0,
    canUpload: state => state.user.user.counter ? state.user.user.counter < 100 : false,
  },
}
