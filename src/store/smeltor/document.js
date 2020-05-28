import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { cloneDeep, omit } from 'lodash'
import DocumentService from '../../services/documentService.js'

Vue.use(Vuex)

function omitKeyFromMetadata(document) {
  let formattedCopy = cloneDeep(document)
  for (let page of Object.keys(formattedCopy.metadata)) {
    formattedCopy.metadata[page] = formattedCopy.metadata[page].map(item => {
      return omit(item, ['key'])
    })
  }
  return formattedCopy
}

export default {
  state: {
    formattedDocument: null,
    documentsList: [],
  },
  mutations: {
    UPDATE_DOCUMENT_DATA(state, document) {
      state.formattedDocument = document
      for (let page of Object.keys(state.formattedDocument.metadata)) {
        state.formattedDocument.metadata[page] = state.formattedDocument.metadata[page].map((item, index) => {
          item.key = index
          return item
        })
      }
    },
    async SAVE_CURRENT_DOCUMENT(state, document) {
      const updatedDocument = {
        name: state.formattedDocument.name,
        metadata: omitKeyFromMetadata(document).metadata,
      }
      await DocumentService.updateDocument(
        updatedDocument,
        state.formattedDocument.id
      )
      state.formattedDocument = document
    },
    CLEAR_DOCUMENT_DATA(state) {
      state.formattedDocument = null
    },
    SET_DOCUMENTS_LIST(state, documentsList) {
      documentsList.map(x => { // TODO: Implement these properties in DB
        x.date = x.createdAt
      })
      state.documentsList = documentsList.sort((a, b) => {
        return -(new Date(a.date) - new Date(b.date))
      },)
    },
    REMOVE_DOC_FROM_LIST(state, id) {
      state.documentsList = state.documentsList.filter(item => item.id !== id)
    },
  },
  actions: {
    UPDATE_DOCUMENT({ commit }, document) {
      commit('UPDATE_DOCUMENT_DATA', document)
    },
    SAVE_DOCUMENT({ commit }, document) {
      commit('SAVE_CURRENT_DOCUMENT', document)
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
    REMOVE_DOCUMENT({ commit }, id) {
      return axios.delete(`http://localhost:3000/v1/documents/${id}`,)
        .then(() => {
          commit('REMOVE_DOC_FROM_LIST', id)
        })
    },
  },
  getters: {
    current: state => state.formattedDocument,
    documentExist: state => !!state.formattedDocument,
    documentsList: state => state.documentsList,
  },
}
