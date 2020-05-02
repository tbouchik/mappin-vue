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
      axios.defaults.headers.common['Authorization'] = `Bearer ${
        userData.tokens.access.token
      }`
    },
    CLEAR_USER_DATA() {
      localStorage.removeItem('user')
      location.reload()
    },
  },
  actions: {
    REGISTER({ commit }, credentials) {
      return axios.post('http://localhost:3000/v1/auth/register', credentials).then(
        ({ data }) => {
          commit('SET_USER_DATA', data)
        }
      )
    },
    LOGIN({ commit }, credentials) {
      return axios.post('http://localhost:3000/v1/auth/login', credentials).then(
        ({ data }) => {
          commit('SET_USER_DATA', data)
        }
      )
    },
    LOGOUT({ commit }) {
      commit('CLEAR_USER_DATA')
    },
  },
  getters: {
    user: state => state.user,
    loggedIn: state => !!state.user,
  },
}
