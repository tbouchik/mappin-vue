import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default {
  state: {
    selectedClient: {},
    selectedFilter: {},
    currentStep: 0,
    nextIsEnabled: false,
  },
  mutations: {
    MUTATION_SELECT_UPLOADER_CLIENT(state, client) {
      if (client) {
        Object.assign(state.selectedClient, client)
      } else {
        state.selectedClient = {}
      }
      if (state.currentStep === 0) {
        if (client === undefined || client === {}) {
          state.nextIsEnabled = false
        } else {
          state.nextIsEnabled = true
        }
      }
    },
    MUTATION_SELECT_UPLOADER_FILTER(state, filter) {
      if (filter) {
        Object.assign(state.selectedFilter, filter)
      } else {
        state.selectedFilter = {}
      }

      if (state.currentStep === 1) {
        if (filter === undefined || filter === {}) {
          state.nextIsEnabled = false
        } else {
          state.nextIsEnabled = true
        }
      }
    },
    MUTATION_INCREMENT_UPLOADER_INDEX(state) {
      ++state.currentStep
      state.nextIsEnabled = false
    },
    MUTATION_DECREMENT_UPLOADER_INDEX(state) {
      --state.currentStep
      state.nextIsEnabled = false
    },
    MUTATION_UPDATE_NEXT_STATUS(state) {
      state.nextIsEnabled = true
    },
    MUTATION_DISABLE_NEXT(state) {
      state.nextIsEnabled = false
    },
    MUTATION_RESET_STEPS(state) {
      state.selectedClient = undefined
      state.selectedFilter = undefined
      state.nextIsEnabled = false
      state.currentStep = 0
    },
  },
  actions: {
    ACTION_SELECT_UPLOADER_CLIENT({ commit }, client) {
      commit('MUTATION_SELECT_UPLOADER_CLIENT', client)
    },
    ACTION_SELECT_UPLOADER_FILTER({ commit }, filter) {
      commit('MUTATION_SELECT_UPLOADER_FILTER', filter)
    },
    ACTION_INCREMENT_UPLOADER_INDEX({ commit }) {
      commit('MUTATION_INCREMENT_UPLOADER_INDEX')
    },
    ACTION_DECREMENT_UPLOADER_INDEX({ commit }) {
      commit('MUTATION_DECREMENT_UPLOADER_INDEX')
    },
    ACTION_ENABLE_NEXT({ commit }) {
      commit('MUTATION_ENABLE_NEXT')
    },
    ACTION_DISABLE_NEXT({ commit }) {
      commit('MUTATION_DISABLE_NEXT')
    },
    ACTION_RESET_STEPS({ commit }) {
      commit('MUTATION_RESET_STEPS')
    },
  },
  getters: {
    uploaderClient: state => state.selectedClient,
    uploaderFilter: state => state.selectedFilter,
    uploaderStep: state => state.currentStep,
    uploaderNextIsEnabled: state => state.nextIsEnabled,
  },
}
