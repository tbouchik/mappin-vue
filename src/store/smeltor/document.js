import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { cloneDeep, omit, get, pick } from 'lodash'
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

let cancelToken

function saveDocToAPI(osmium, id) {
  const updatedDocument = {
    osmium: osmium,
    status: 'validated',
  }
  if (typeof cancelToken !== typeof undefined) {
    cancelToken.cancel('Operation canceled due to new request.')
  }
  // Save the cancel token for the current request
  cancelToken = axios.CancelToken.source()
  try {
    return axios.patch(`/v1/documents/${id}`, {
      ...updatedDocument,
    }, { cancelToken: cancelToken.token }) // Pass the cancel token to the current request)
  } catch (error) {
    console.log(error)
  }
}

function fetchDocuments(queryParams) {
  console.log(queryParams)
  const { client, page, limit, sort } = queryParams
  return axios.get(`/v1/documents`, { params: {
    client,
    limit,
    sort,
    page: page - 1,
  } })
    .then(
      ({ data }) => data
    )
}

function fetchDocumentsCount(queryParams) {
  const { client } = queryParams
  return axios.get('/v1/documents/count', { params: {
    client,
  } })
    .then(
      ({ data }) => data
    )
}

export default {
  state: {
    formattedDocument: {},
    page: 1,
    documentsList: [],
    viewerIdList: [],
    currentIdx: 0,
    catMode: false,
    pagination: {
      limit: 10,
      page: 1,
    },
    loading: false,
  },
  mutations: {
    UPDATE_DOCUMENT_DATA(state, document) {
      state.formattedDocument = document
      state.formattedDocument.osmium = state.formattedDocument.osmium.map((item, index) => {
        item.key = index // This is to avoid ant design spitting on your face for
        return item // inserting items from osmium in ant table <a-table> without a unique key
      })
    },
    SAVE_CURRENT_DOCUMENT(state, filter) {
      Object.assign(state.formattedDocument.osmium, filter)
      const updatedDocument = {
        name: document.name,
        osmium: omitKeyFromFilter(filter),
        status: 'validated',
      }
      state.documentsList[state.documentsList.findIndex(x => x.id === state.formattedDocument.id)].osmium = filter
      DocumentService.updateDocument(
        updatedDocument,
        state.formattedDocument.id
      )
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
      let updateFormattedDoc = cloneDeep(state.formattedDocument)
      if (state.catMode) {
        let appendix = ' '.concat(value)
        let currentValue = updateFormattedDoc.osmium[state.currentIdx].Value
        updateFormattedDoc.osmium[state.currentIdx].Value = currentValue ? currentValue.concat(appendix) : appendix.trim()
      } else {
        updateFormattedDoc.osmium[state.currentIdx].Value = value
      }
      state.formattedDocument = updateFormattedDoc
      saveDocToAPI(updateFormattedDoc.osmium, state.formattedDocument.id)
    },
    MUTATION_DO_CHANGES_TO_DOCUMENT(state, changeData) {
      let { value, itemIdx, column } = changeData
      let tempDoc = cloneDeep(state.formattedDocument)
      tempDoc.osmium[itemIdx][column] = value
      state.formattedDocument = tempDoc
      saveDocToAPI(state.formattedDocument.osmium, state.formattedDocument.id)
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
    MUTATION_TOGGLE_CATMODE(state) {
      state.catMode = !state.catMode
    },
    MUTATION_FETCH_DOCUMENTS_WITH_PARAMS(state, payload) {
      Object.assign(state.pagination, pick(payload, ['limit', 'page']))
      const queryParams = omit(payload, ['loading'])
      state.loading = !!payload.loading
      fetchDocuments(queryParams)
        .then(documentsList => {
          documentsList.map((item, index) => { // TODO: Implement these properties in DB
            item.date = item.createdAt
            item.key = index
            return item
          })
          state.documentsList = documentsList.sort((a, b) => {
            return -(new Date(a.date) - new Date(b.date))
          },)
          state.loading = false
        })
    },
    MUTATION_FETCH_COUNT_DOCUMENTS(state, filters) {
      fetchDocumentsCount(filters)
        .then(data => {
          const newPagination = Object.assign({}, state.pagination)
          newPagination.total = data.count
          state.pagination = newPagination
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
    ACTION_FETCH_DOCUMENTS_WITH_PARAMS({ commit }, payload) {
      commit('MUTATION_FETCH_DOCUMENTS_WITH_PARAMS', payload)
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
    ACTION_DO_CHANGES_TO_DOCUMENT({ commit }, changeData) {
      commit('MUTATION_DO_CHANGES_TO_DOCUMENT', changeData)
    },
    ACTION_ADD_RECORD_AFTER_INDEX({ commit }) {
      commit('MUTATION_ADD_RECORD_AFTER_INDEX')
    },
    ACTION_FETCH_CLIENT_DOCUMENTS({ commit }, clientId) {
      commit('MUTATION_FETCH_CLIENT_DOCUMENTS', clientId)
    },
    ACTION_TOGGLE_CATMODE({ commit }) {
      commit('MUTATION_TOGGLE_CATMODE')
    },
    ACTION_FETCH_COUNT_DOCUMENTS({ commit }, filters) {
      commit('MUTATION_FETCH_COUNT_DOCUMENTS', filters)
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
    catMode: state => state.catMode,
    docTableLoading: state => state.loading,
    docTablePagination: state => state.pagination,
  },
}
