import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { cloneDeep, get, pick, pickBy } from 'lodash'
import uuidv4 from 'uuid/v4'
import moment from 'moment'
Vue.use(Vuex)

let cancelToken

function saveDocToAPI(mbc, osmium, ggMetadata, imput, isBankStatement, id) {
  let updatedDocument = {
    mbc: mbc || null,
    imput: imput || null,
    osmium: isBankStatement ? null : osmium,
    bankOsmium: isBankStatement ? osmium : null,
    ggMetadata: ggMetadata || null,
    status: 'validated',
  }
  updatedDocument = pickBy(updatedDocument, (v, _) => { return !!v })
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

function getGraphNextMove(osmium, currentIdx, currentCol, move) {
  const graphDepth = osmium.length
  if (move === 'inc') {
    const nextIndex = currentIdx < graphDepth - 1 ? currentIdx + 1 : 0
    if (currentCol === 'Imputation') {
      return { idx: nextIndex, col: 'Value' }
    } else {
      if (osmium[currentIdx].Imputation !== undefined && osmium[currentIdx].Imputation !== null) {
        return { idx: currentIdx, col: 'Imputation' }
      } else {
        return { idx: nextIndex, col: 'Value' }
      }
    }
  } else {
    const previousIndex = currentIdx > 0 ? currentIdx - 1 : graphDepth - 1
    if (currentCol === 'Imputation') {
      return { idx: currentIdx, col: 'Value' }
    } else {
      if (osmium[previousIndex].Imputation !== undefined && osmium[previousIndex].Imputation !== null) {
        return { idx: previousIndex, col: 'Imputation' }
      } else {
        return { idx: previousIndex, col: 'Value' }
      }
    }
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
    moment.locale('en-US')
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
    currentCol: 'Value',
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
    MUTATION_UPDATE_INDEX(state, payload) {
      if (payload.idx !== undefined && payload.col !== undefined) {
        state.currentIdx = payload.idx
        state.currentCol = payload.col
      } else {
        let nextCoords = getGraphNextMove(state.formattedDocument.osmium, state.currentIdx, state.currentCol, payload.move)
        state.currentIdx = nextCoords.idx
        state.currentCol = nextCoords.col
      }
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
      saveDocToAPI(Object.fromEntries(mbcData), updateFormattedDoc.osmium, updateFormattedDoc.ggMetadata, false, false, state.formattedDocument.id)
    },
    MUTATION_DO_CHANGES_TO_DOCUMENT(state, changeData) {
      let { value, itemIdx, column } = changeData
      let mbcData = new Map()
      const keyType = state.formattedDocument.filter.keys[itemIdx].type
      let tempDoc = cloneDeep(state.formattedDocument)
      tempDoc.osmium[itemIdx][column] = formatValue(value, keyType, 'manual')
      state.formattedDocument = tempDoc
      saveDocToAPI(Object.fromEntries(mbcData), state.formattedDocument.osmium, state.formattedDocument.ggMetadata, false, false, state.formattedDocument.id)
    },
    MUTATION_AUTO_CHANGES_TO_STATEMENT(state, bbox) {
      let updateFormattedDoc = cloneDeep(state.formattedDocument)
      const newVal = bbox.Text
      if (state.catMode) {
        let appendix = ' '.concat(newVal)
        let currentValue = updateFormattedDoc.bankOsmium[`page_${state.page}`][state.currentIdx][state.currentCol]
        updateFormattedDoc.bankOsmium[`page_${state.page}`][state.currentIdx][state.currentCol] = currentValue ? currentValue.concat(appendix) : appendix.trim()
      } else {
        updateFormattedDoc.bankOsmium[`page_${state.page}`][state.currentIdx][state.currentCol] = newVal
      }
      state.formattedDocument = updateFormattedDoc
      console.log(updateFormattedDoc.bankOsmium[`page_${state.page}`][state.currentIdx])
      saveDocToAPI(null, updateFormattedDoc.bankOsmium, null, null, true, state.formattedDocument.id)
    },
    MUTATION_MANUAL_CHANGES_TO_STATEMENT(state, changeData) {
      let { value } = changeData
      let tempDoc = cloneDeep(state.formattedDocument)
      tempDoc.bankOsmium[`page_${state.page}`][state.currentIdx][state.currentCol] = value
      state.formattedDocument = tempDoc
      console.log(state.formattedDocument.bankOsmium[`page_${state.page}`][state.currentIdx][state.currentCol])
      saveDocToAPI(null, state.formattedDocument.bankOsmium, null, null, true, state.formattedDocument.id)
    },
    MUTATION_DO_IMPUTATION_CHANGES_TO_STATEMENT(state, changeData) {
      let { imputation } = changeData
      let tempDoc = cloneDeep(state.formattedDocument)
      tempDoc.bankOsmium[`page_${state.page}`][state.currentIdx]['Compte'] = imputation
      state.formattedDocument = tempDoc
      saveDocToAPI({}, state.formattedDocument.bankOsmium, null, null, true, state.formattedDocument.id)
    },
    MUTATION_INSERT_STATEMENTS(state, changeData) {
      let { offset, selectedStatements } = changeData
      let tempDoc = cloneDeep(state.formattedDocument)
      const emptyStatement = {
        'Date': '',
        'Designation': '',
        'Debit': '',
        'Credit': '',
        'Compte': '',
      }
      let counter = 0
      if (offset === -1) {
        tempDoc.bankOsmium[`page_${state.page}`].push(emptyStatement)
      } else {
        selectedStatements.forEach(idx => {
          tempDoc.bankOsmium[`page_${state.page}`].splice([idx + offset + counter], 0, emptyStatement)
          counter++
        })
      }
      state.formattedDocument = tempDoc
      saveDocToAPI({}, state.formattedDocument.bankOsmium, null, null, true, state.formattedDocument.id)
    },
    MUTATION_DELETE_STATEMENTS(state, changeData) {
      let { selectedStatements } = changeData
      let tempDoc = cloneDeep(state.formattedDocument)
      let counter = 0
      selectedStatements.forEach(idx => {
        tempDoc.bankOsmium[`page_${state.page}`].splice([idx - counter], 1)
        counter++
      })
      state.formattedDocument = tempDoc
      saveDocToAPI({}, state.formattedDocument.bankOsmium, null, null, true, state.formattedDocument.id)
    },
    MUTATION_DO_IMPUTATION_CHANGES_TO_INVOICE(state, changeData) {
      let { itemIdx, imputation, libelle } = changeData
      let tempDoc = cloneDeep(state.formattedDocument)
      tempDoc.osmium[itemIdx]['Imputation'] = imputation
      tempDoc.osmium[itemIdx]['Libelle'] = libelle
      state.formattedDocument = tempDoc
      saveDocToAPI({}, state.formattedDocument.osmium, state.formattedDocument.ggMetadata, true, false, state.formattedDocument.id)
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
    ACTION_UPDATE_ACTIVE_INDEX({ commit }, payload) {
      commit('MUTATION_UPDATE_INDEX', payload)
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
    ACTION_DO_IMPUTATION_CHANGES_TO_INVOICE({ commit }, payload) {
      commit('MUTATION_DO_IMPUTATION_CHANGES_TO_INVOICE', payload)
    },
    ACTION_DO_IMPUTATION_CHANGES_TO_STATEMENT({ commit }, payload) {
      commit('MUTATION_DO_IMPUTATION_CHANGES_TO_STATEMENT', payload)
    },
    ACTION_AUTO_CHANGES_TO_STATEMENT({ commit }, bbox) {
      commit('MUTATION_AUTO_CHANGES_TO_STATEMENT', bbox)
    },
    ACTION_MANUAL_CHANGES_TO_STATEMENT({ commit }, payload) {
      commit('MUTATION_MANUAL_CHANGES_TO_STATEMENT', payload)
    },
    ACTION_INSERT_STATEMENTS({ commit }, payload) {
      commit('MUTATION_INSERT_STATEMENTS', payload)
    },
    ACTION_DELETE_STATEMENTS({ commit }, payload) {
      commit('MUTATION_DELETE_STATEMENTS', payload)
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
    currentActiveColumn: state => state.currentCol,
    catMode: state => state.catMode,
    docTableLoading: state => state.loading, // TODO: eliminate
    docQueryParams: state => state.queryParams,
    docSmeltedCache: state => state.smeltedCache,
    docPagination: state => pick(state.queryParams, ['page', 'limit']),
    totalDocumentsCount: state => state.totalDocumentsCount, // TODO REMOVE IF NOT USABLE IN SUBBAR
  },
}
