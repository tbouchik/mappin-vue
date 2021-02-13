import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { cloneDeep, get, pick } from 'lodash'
import uuidv4 from 'uuid/v4'
import moment from 'moment'
Vue.use(Vuex)

let cancelToken

function saveDocToAPI(mbc, osmium, ggMetadata, imput, id) {
  const updatedDocument = {
    mbc: mbc,
    imput: imput || null,
    osmium: osmium,
    ggMetadata: ggMetadata,
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
  }
}

function filterAlpha (str) {
  if (typeof str === 'string') {
    return str.replace(',', '.').replace(/[^\d.-]/g, '')
  }
  return str
}

function parseDate (value) {
  if (!value) return ''
  let parsedInput = ''
  try {
    moment.locale('fr')
    parsedInput = moment(value, ['D MMMM YYYY', 'DD MMMM YYYY', 'D MMM YYYY', 'DD MMM YYYY', 'D MMMM YY', 'DD MMMM YY', 'D MMM YY', 'DD MMM YY', 'DD/MM/YYYY', 'DD-MM-YYYY', 'dddd, MMMM Do YYYY', 'dddd [the] Do [of] MMMM', 'YYYY-MM-DD', 'MMM DD, YYYY']).format('DD/MM/YYYY')
  } catch (error) {
    console.log('erroe', error)
  }
  return parsedInput
}

function formatValue (value, keyType, entryType) {
  let parsedValue = null
  switch (keyType) {
    case 'NUMBER':
      parsedValue = filterAlpha(value)
      break
    case 'DATE':
      parsedValue = entryType === 'auto' ? parseDate(value) : value
      break
    default:
      parsedValue = value
  }
  return parsedValue
}

export default {
  state: {
    formattedDocument: {},
    page: 1,
    documentsList: [],
    viewerIdList: [],
    currentIdx: 0,
    catMode: false,
    loading: false,
    queryParams: {},
    smeltedCache: [],
    totalDocumentsCount: 0,
    documentsIdList: [],
  },
  mutations: {
    UPDATE_DOCUMENT_DATA(state, document) {
      state.formattedDocument = document
      state.formattedDocument.osmium = state.formattedDocument.osmium.map((item, index) => {
        item.key = index // This is to avoid ant design spitting on your face for
        return item // inserting items from osmium in ant table <a-table> without a unique key
      })
      state.documentsList[state.documentsList.findIndex(x => x.id === state.formattedDocument.id)] = state.formattedDocument
    },
    CLEAR_DOCUMENT_DATA(state) {
      state.formattedDocument = null
    },
    REMOVE_DOC_FROM_LIST(state, id) {
      state.documentsList = state.documentsList.filter(item => item.id !== id)
      state.documentsIdList = state.documentsList.map(x => x.id)
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
    MUTATION_UPDATE_ACTIVE_VALUE(state, bbox) {
      let updateFormattedDoc = cloneDeep(state.formattedDocument)
      const keyType = state.formattedDocument.filter.keys[state.currentIdx].type
      const newVal = formatValue(bbox.Text, keyType, 'auto')
      let mbcData = new Map()
      mbcData.set(updateFormattedDoc.osmium[state.currentIdx].Key, bbox)
      if (state.catMode) {
        let appendix = ' '.concat(newVal)
        let currentValue = updateFormattedDoc.osmium[state.currentIdx].Value
        updateFormattedDoc.osmium[state.currentIdx].Value = currentValue ? currentValue.concat(appendix) : appendix.trim()
      } else {
        updateFormattedDoc.osmium[state.currentIdx].Value = newVal
      }
      state.formattedDocument = updateFormattedDoc
      saveDocToAPI(Object.fromEntries(mbcData), updateFormattedDoc.osmium, updateFormattedDoc.ggMetadata, null, state.formattedDocument.id)
    },
    MUTATION_DO_CHANGES_TO_DOCUMENT(state, changeData) {
      let { value, itemIdx, column } = changeData
      let mbcData = new Map()
      const keyType = state.formattedDocument.filter.keys[itemIdx].type
      const imput = keyType === 'IMPUT' ? value : null
      let tempDoc = cloneDeep(state.formattedDocument)
      tempDoc.osmium[itemIdx][column] = formatValue(value, keyType, 'manual')
      state.formattedDocument = tempDoc
      saveDocToAPI(Object.fromEntries(mbcData), state.formattedDocument.osmium, state.formattedDocument.ggMetadata, imput, state.formattedDocument.id)
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
    MUTATION_UPDATE_DOCUMENTS_LIST(state, payload) {
      state.queryParams = payload.queryParams
      state.documentsList = payload.documentsList
      state.documentsIdList = state.documentsList.map(x => x.id)
    },
    MUTATION_CACHE_SMELTED_IDS(state, payload) {
      if (payload.right && payload.idsArray.length) {
        state.smeltedCache = state.smeltedCache.concat(payload.idsArray.map(x => x.id))
      } else if (payload.left && payload.idsArray.length) {
        state.smeltedCache = payload.idsArray.map(x => x.id).concat(state.smeltedCache)
      } else {
        state.smeltedCache = payload.idsArray.map(x => x.id)
      }
    },
    MUTATION_RESET_SMELTED_IDS(state) {
      state.smeltedCache = []
    },
    MUTATION_UPDATE_TOTAL_DOC_COUNT(state, count) {
      state.totalDocumentsCount = count
    },
    MUTATION_CACHE_IDS(state, payload) {
      if (payload.right && payload.idsArray.length) {
        state.documentsIdList = state.documentsIdList.concat(payload.idsArray.map(x => x.id))
      } else if (payload.left && payload.idsArray.length) {
        state.documentsIdList = payload.idsArray.map(x => x.id).concat(state.documentsIdList)
      }
    },
  },
  actions: {
    UPDATE_DOCUMENT({ commit }, document) {
      commit('UPDATE_DOCUMENT_DATA', document)
    },
    CLEAR_DOCUMENT({ commit }) {
      commit('CLEAR_DOCUMENT_DATA')
    },
    ACTION_UPDATE_DOCUMENTS_LIST({ commit }, payload) { // ACTION_FETCH_DOCUMENTS_WITH_PARAMS
      commit('MUTATION_UPDATE_DOCUMENTS_LIST', payload)
    },
    REMOVE_DOCUMENT({ commit }, id) {
      commit('REMOVE_DOC_FROM_LIST', id)
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
    ACTION_CACHE_SMELTED_IDS({ commit }, payload) {
      commit('MUTATION_CACHE_SMELTED_IDS', payload)
    },
    ACTION_RESET_SMELTED_IDS({ commit }) {
      commit('MUTATION_RESET_SMELTED_IDS')
    },
    ACTION_UPDATE_TOTAL_DOC_COUNT({ commit }, payload) { // TODO REMOVE IF NOT USABLE IN SUBBAR
      commit('MUTATION_UPDATE_TOTAL_DOC_COUNT', payload)
    },
    ACTION_CACHE_IDS({ commit }, payload) {
      commit('MUTATION_CACHE_IDS', payload)
    },
  },
  getters: {
    current: state => state.formattedDocument,
    currentPageData: state => get(state, 'formattedDocument.metadata', {})['page_' + state.page],
    currentPage: state => get(state, 'page'),
    documentsList: state => state.documentsList,
    documentsIdList: state => state.documentsIdList, // todo remove
    smeltedIdList: state => state.documentsList.filter(x => {
      return x.status === 'smelted'
    }).map(x => x.id),
    currentActiveIndex: state => state.currentIdx,
    catMode: state => state.catMode,
    docTableLoading: state => state.loading, // TODO: eliminate
    docQueryParams: state => state.queryParams,
    docSmeltedCache: state => state.smeltedCache,
    docPagination: state => pick(state.queryParams, ['page', 'limit']),
    totalDocumentsCount: state => state.totalDocumentsCount, // TODO REMOVE IF NOT USABLE IN SUBBAR
  },
}
