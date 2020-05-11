import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default {
  state: {
    document: null,
    documentsList: [],
  },
  mutations: {
    UPDATE_DOCUMENT_DATA(state, document) {
      state.document = document
    },
    CLEAR_DOCUMENT_DATA(state) {
      state.document = null
    },
    SET_DOCUMENTS_LIST(state, documentsList) {
      documentsList.map(x => { // TODO: Implement these properties in DB
        x.type = 'Invoice'
        x.extraction = 'Forms'
        x.date = x.createdAt
        x.status = 'Complete'
      })
      state.documentsList = documentsList
    },
    REMOVE_DOC_FROM_LIST(state, id) {
    state.documentsList = state.documentsList.filter(item => item.id !== id)
    }
  },
  actions: {
    UPDATE_DOCUMENT({ commit }, document) {
      commit('UPDATE_DOCUMENT_DATA', document)
    },
    CLEAR_DOCUMENT({ commit }) {
      commit('CLEAR_DOCUMENT_DATA')
    },
    FETCH_DOCUMENTS({ commit }) {
      return axios.get('http://localhost:3000/v1/documents',)
        .then(({ data }) => {
          commit('SET_DOCUMENTS_LIST', data)
        })
    },
    REMOVE_DOCUMENT({commit}, id) {
      return axios.delete(`http://localhost:3000/v1/documents/${id}`,)
        .then(() => {
          commit('REMOVE_DOC_FROM_LIST', id)
        })
    }
  },
  getters: {
    current: state => state.document,
    documentExist: state => !!state.document,
    documentsList: state => state.documentsList,
  },
}
