import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { cloneDeep, omit, get } from 'lodash'
import DocumentService from '../../services/documentService.js'
import uuidv4 from 'uuid/v4'

Vue.use(Vuex)

function omitKeyFromFilter(filter) {
  let formattedCopy = cloneDeep(filter)
  formattedCopy = filter.map(item => {
    return omit(item, ['key'])
  })
  return formattedCopy
}

export default {
  state: {
    formattedDocument: {},
    formattedDocumentCache: {},
    page: 1,
    documentsList: [],
    viewerIdList: [],
    currentIdx: 0,
  },
  mutations: {
    UPDATE_DOCUMENT_DATA(state, document) {
      state.formattedDocument = document
      state.formattedDocument.osmium = state.formattedDocument.osmium.map((item, index) => {
        item.key = index // This is to avoid ant design spitting on your face for
        return item // inserting items from osmium in ant table <a-table> without a unique key
      })
      state.formattedDocumentCache = cloneDeep(state.formattedDocument)
    },
    async SAVE_CURRENT_DOCUMENT(state, filter) {
      Object.assign(state.formattedDocument.osmium, filter)
      Object.assign(state.formattedDocumentCache.osmium, filter)
      const updatedDocument = {
        name: document.name,
        osmium: omitKeyFromFilter(filter),
        status: 'validated',
      }
      await DocumentService.updateDocument(
        updatedDocument,
        state.formattedDocument.id
      )
      state.documentsList[state.documentsList.findIndex(x => x.id === state.formattedDocument.id)].osmium = filter
    },
    CLEAR_DOCUMENT_DATA(state) {
      state.formattedDocument = null
      state.formattedDocumentCache = null
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
      let updateFormattedDoc = cloneDeep(state.formattedDocument)
      updateFormattedDoc.osmium[state.currentIdx].Value = value
      state.formattedDocument = updateFormattedDoc
    },
    MUTATION_UNDO_CHANGES_TO_DOCUMENT(state) {
      state.formattedDocument = cloneDeep(state.formattedDocumentCache)
    },
    MUTATION_DO_CHANGES_TO_DOCUMENT(state, changeData) {
      let { value, itemIdx, column } = changeData
      let tempDoc = cloneDeep(state.formattedDocument)
      tempDoc.osmium[itemIdx][column] = value
      state.formattedDocument = tempDoc
    },
    MUTATION_ADD_RECORD_AFTER_INDEX(state) {
      const newElement = {
        'Key': '',
        'Value': '',
        'key': uuidv4(),
      }
      let tempDoc = cloneDeep(state.formattedDocument)
      if (state.currentIdx !== null) { // TODO Since currenIdx is no longer null as default, This condition is probably deprecated
        tempDoc.osmium.splice(state.currentIdx + 1, 0, newElement)
      } else {
        tempDoc.osmium.push(newElement)
      }
      state.formattedDocument = cloneDeep(tempDoc)
    },
    MUTATION_FETCH_CLIENT_DOCUMENTS(state, id) {
      DocumentService.fetchDocumentsByClient(id)
        .then(documentsList => {
          documentsList = documentsList.map((item, index) => { // TODO: Implement these properties in DB
            item.date = item.createdAt
            item.key = index
            return item
          })
          state.documentsList = documentsList.sort((a, b) => {
            return -(new Date(a.date) - new Date(b.date))
          },)
        })
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
      return axios.get(`/v1/documents`,)
        .then(({ data }) => {
          commit('SET_DOCUMENTS_LIST', data)
        })
    },
    REMOVE_DOCUMENT({ commit }, id) {
      return axios.delete(`/v1/documents/${id}`,)
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
    ACTION_UNDO_CHANGES_TO_DOCUMENT({ commit }) {
      commit('MUTATION_UNDO_CHANGES_TO_DOCUMENT')
    },
    ACTION_DO_CHANGES_TO_DOCUMENT({ commit }, changeData) {
      commit('MUTATION_DO_CHANGES_TO_DOCUMENT', changeData)
    },
    ACTION_ADD_RECORD_AFTER_INDEX({ commit }) {
      commit('MUTATION_ADD_RECORD_AFTER_INDEX')
    },
    ACTION_FETCH_CLIENT_DOCUMENTS({ commit }, clientId) {
      commit('MUTATION_FETCH_CLIENT_DOCUMENTS', clientId)
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
    currentActiveIndex: state => state.currentIdx,
  },
}
