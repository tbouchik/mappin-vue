import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

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
    LOGOUT({ commit }) {
      commit('CLEAR_USER_DATA')
    },
  },
  getters: {
    user: state => state.user.user,
    loggedIn: state => !!state.user,
    userIsClient: state => !!state.user.user.isClient,
  },
}
