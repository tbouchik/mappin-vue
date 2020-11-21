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
  const { client, page, limit, sort, name, filter, status } = queryParams
  if (typeof cancelToken !== typeof undefined) {
    cancelToken.cancel('Operation canceled due to new request.')
  }
  // Save the cancel token for the current request
  cancelToken = axios.CancelToken.source()
  const params = {
    client,
    limit,
    sort,
    page: page - 1,
  }
  if (name && name !== '') {
    params.name = name
  }
  if (status) {
    params.status = status
  }
  if (filter) {
    params.filter = filter
  }
  try {
    return axios.get(`/v1/documents`, { params }, { cancelToken: cancelToken.token })
      .then(
        ({ data }) => data
      )
  } catch (error) {
    console.log(error)
  }
}

function fetchDocumentsCount(queryParams) {
  const { client, name, status, filter } = queryParams
  const params = {
    client,
  }
  if (name && name !== '') {
    params.name = name
  }
  if (status) {
    params.status = status
  }
  if (filter) {
    params.filter = filter
  }
  return axios.get('/v1/documents/count', { params })
    .then(
      ({ data }) => data
    )
}

function fetchDocumentsNext(queryParams) {
  const { client, name, status, filter, current } = queryParams
  const params = {
    client,
  }
  if (name && name !== '') {
    params.name = name
  }
  if (status) {
    params.status = status
  }
  if (filter) {
    params.filter = filter
  }
  if (current) {
    params.current = current
  }
  return axios.get('/v1/documents/next', { params })
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
    nextSmeltedId: null,
    nextSmeltedButtonIsEnabled: null,
    nextSmeltedButtonIsLoader: false,
    visitedIdsCache: [],
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
    MUTATION_FETCH_NEXT_SMELTED_ID(state, filters) {
      state.nextSmeltedButtonIsLoader = !!filters.loading
      if (filters.current) {
        const cacheLastIndex = state.visitedIdsCache.length - 1
        const currentVisitedIndexInCache = state.visitedIdsCache.findIndex(x => x === filters.current)
        if (currentVisitedIndexInCache &&
            cacheLastIndex > 0 &&
            currentVisitedIndexInCache < cacheLastIndex) {
          state.nextSmeltedId = state.visitedIdsCache[currentVisitedIndexInCache + 1]
          state.nextSmeltedButtonIsEnabled = true
        } else {
          fetchDocumentsNext(filters)
            .then(data => {
              state.nextSmeltedId = data.id
              state.nextSmeltedButtonIsEnabled = data.next
              state.nextSmeltedButtonIsLoader = false
            })
        }
      } else {
        fetchDocumentsNext(filters)
          .then(data => {
            state.nextSmeltedId = data.id
            state.nextSmeltedButtonIsEnabled = data.next
            state.nextSmeltedButtonIsLoader = false
          })
      }
    },
    MUTATION_RESET_VISITED_IDS_CACHE(state) {
      state.visitedIdsCache = []
    },
    MUTATION_PUSH_VISITED_IDS_CACHE(state, id) {
      state.visitedIdsCache.push(id)
    },
    MUTATION_ENABLE_NEXT_ID_CACHE(state) {
      state.nextSmeltedButtonIsEnabled = true
    },
    MUTATION_UPDATE_NEXT_ID_METADATA(state, payload) {
      state.nextSmeltedId = payload.id
      state.nextSmeltedButtonIsEnabled = payload.next
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
    ACTION_TOGGLE_CATMODE({ commit }) {
      commit('MUTATION_TOGGLE_CATMODE')
    },
    ACTION_FETCH_COUNT_DOCUMENTS({ commit }, filters) {
      commit('MUTATION_FETCH_COUNT_DOCUMENTS', filters)
    },
    ACTION_FETCH_NEXT_SMELTED_ID({ commit }, filters) {
      commit('MUTATION_FETCH_NEXT_SMELTED_ID', filters)
    },
    ACTION_RESET_VISITED_IDS_CACHE({ commit }) {
      commit('MUTATION_RESET_VISITED_IDS_CACHE')
    },
    ACTION_PUSH_VISITED_IDS_CACHE({ commit }, id) {
      commit('MUTATION_PUSH_VISITED_IDS_CACHE', id)
    },
    ACTION_ENABLE_NEXT_ID_CACHE({ commit }) {
      commit('MUTATION_ENABLE_NEXT_ID_CACHE')
    },
    ACTION_UPDATE_NEXT_ID_METADATA({ commit }, payload) {
      commit('MUTATION_UPDATE_NEXT_ID_METADATA', payload)
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
    nextSmeltedId: state => state.nextSmeltedId,
    nextSmeltedButtonIsEnabled: state => state.nextSmeltedButtonIsEnabled,
    nextSmeltedButtonIsLoader: state => state.nextSmeltedButtonIsLoader,
    visitedIdsCache: state => state.visitedIdsCache,
  },
}
