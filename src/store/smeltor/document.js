import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { cloneDeep, omit, get } from 'lodash'
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
    formattedDocument: {},
    page: 1,
    documentsList: [],
    viewerIdList: [],
    currentIdx: null,
  },
  mutations: {
    UPDATE_DOCUMENT_DATA(state, document) {
      state.formattedDocument = document
      for (let page of Object.keys(get(state, 'formattedDocument.metadata'))) {
        state.formattedDocument.metadata[page] = state.formattedDocument.metadata[page].map((item, index) => {
          item.key = index
          return item
        })
      }
    },
    async SAVE_CURRENT_DOCUMENT(state, filter) {
      Object.assign(state.formattedDocument, filter)
      const updatedDocument = {
        name: document.name,
        stdFilter: filter,
        status: 'validated',
      }
      await DocumentService.updateDocument(
        updatedDocument,
        state.formattedDocument.id
      )
      Object.assign(state.documentsList[state.documentsList.findIndex(x => x.id === document.id)], document)
    },
    CLEAR_DOCUMENT_DATA(state) {
      state.formattedDocument = null
    },
    SET_DOCUMENTS_LIST(state, documentsList) {
      documentsList.map((item, index) => { // TODO: Implement these properties in DB
        item.date = item.createdAt
        item.key = index
        return item
      })
      state.documentsList = documentsList.sort((a, b) => {
        return -(new Date(a.date) - new Date(b.date))
      },)
    },
    REMOVE_DOC_FROM_LIST(state, id) {
      state.documentsList = state.documentsList.filter(item => item.id !== id)
    },
    MUTATION_INCREMENT_PAGE(state) {
      state.page++
    },
    MUTATION_DECREMENT_PAGE(state) {
      state.page--
    },
    MUTATION_RESET_PAGE(state) {
      state.page = 1
    },
    MUTATION_UPDATE_INDEX(state, idx) {
      state.currentIdx = idx
    },
    MUTATION_UPDATE_ACTIVE_VALUE(state, value) {
      state.formattedDocument.stdFilter[state.currentIdx].Value = value
    },
  },
  actions: {
    UPDATE_DOCUMENT({ commit }, document) {
      commit('UPDATE_DOCUMENT_DATA', document)
    },
    SAVE_DOCUMENT({ commit }, filter) {
      commit('SAVE_CURRENT_DOCUMENT', filter)
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
    ACTION_INCREMENT_PAGE({ commit }) {
      commit('MUTATION_INCREMENT_PAGE')
    },
    ACTION_DERCREMENT_PAGE({ commit }) {
      commit('MUTATION_DECREMENT_PAGE')
    },
    ACTION_RESET_PAGE({ commit }) {
      commit('MUTATION_RESET_PAGE')
    },
    ACTION_UPDATE_ACTIVE_INDEX({ commit }, idx) {
      commit('MUTATION_UPDATE_INDEX', idx)
    },
    ACTION_UPDATE_ACTIVE_VALUE({ commit }, idx) {
      commit('MUTATION_UPDATE_ACTIVE_VALUE', idx)
    },
  },
  getters: {
    current: state => state.formattedDocument,
    currentPageData: state => get(state, 'formattedDocument.metadata', {})['page_' + state.page],
    currentPage: state => get(state, 'page'),
    documentsList: state => state.documentsList,
    documentsIdList: state => state.documentsList.map(x => x.id),
    smeltedIdList: state => state.documentsList.filter(x => {
      return x.status === 'smelted'
    }).map(x => x.id),

  },
}
