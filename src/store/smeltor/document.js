import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import dateFormats from '../helpers'
import labels from '../../assets/accounting/labels'
import { cloneDeep, get, pick, pickBy } from 'lodash'
import uuidv4 from 'uuid/v4'
import moment from 'moment'
Vue.use(Vuex)

let cancelToken

function saveDocToAPI(mbc, document, { imput, bankOsmiumChanged, keyAttributes }) {
  let updatedDocument = {
    mbc: mbc || null,
    imput: imput || null,
    osmium: bankOsmiumChanged ? null : document.osmium,
    bankOsmium: bankOsmiumChanged ? document.bankOsmium : null,
    ggMetadata: bankOsmiumChanged ? null : document.ggMetadata,
    status: 'validated',
  }
  if (keyAttributes) {
    Object.assign(updatedDocument, keyAttributes)
  }
  updatedDocument = pickBy(updatedDocument, (v, _) => { return typeof v === 'number' || typeof v === 'boolean' || !!v })
  if (typeof cancelToken !== typeof undefined) {
    cancelToken.cancel('Operation canceled due to new request.')
  }
  // Save the cancel token for the current request
  cancelToken = axios.CancelToken.source()
  try {
    return axios.patch(`/v1/documents/${document.id}`, {
      ...updatedDocument,
    }, { cancelToken: cancelToken.token }) // Pass the cancel token to the current request)
  } catch (error) {
  }
}

function getActivePane(columnName) {
  const templateColumns = ['Key', 'Value', 'Imputation', 'Libelle']
  return templateColumns.includes(columnName) ? 'templatePane' : 'statementPane'
}

function getInvoiceGraphNextMove(osmium, currentIdx, currentCol, move) {
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

function getTableGraphNextMove(osmium, currentIdx, currentCol, move) {
  const graphDepth = osmium.length
  if (move === 'inc') {
    const nextIndex = currentIdx < graphDepth - 1 ? currentIdx + 1 : 0
    const adjacentColumn = getTableAdjacentColumn(currentCol, 1)
    if (adjacentColumn === 'Date') {
      return { idx: nextIndex, col: 'Date' }
    }
    return { idx: currentIdx, col: adjacentColumn }
  } else {
    const previousIndex = currentIdx > 0 ? currentIdx - 1 : graphDepth - 1
    const adjacentColumn = getTableAdjacentColumn(currentCol, -1)
    if (adjacentColumn === 'Credit') {
      return { idx: previousIndex, col: 'Credit' }
    }
    return { idx: currentIdx, col: adjacentColumn }
  }
}

function trimImputationQuery(query) {
  const pattern = /([^0]+[0][^0]+|^.[^0]+)/ // 19109002 matches with => 19109 | 12189001 matches with => 12189 |
  const trimedQuery = pattern.exec(query) ? pattern.exec(query)[0] : query
  return trimedQuery
}

function changeDisplayedLibelle(col, osmiumItem) {
  let result = 'Libellé d\'Imputation'
  if (col === 'Imputation' || col === 'Compte') {
    const trimedImputation = trimImputationQuery(osmiumItem[col])
    result = labels[parseInt(trimedImputation)]
  }
  return result
}

function getTableAdjacentColumn(currentCol, move) {
  const cols = ['Date', 'Designation', 'Compte', 'Debit', 'Credit']
  const currentIdx = cols.findIndex(x => x === currentCol)
  if (currentIdx + move > 4) {
    return cols[0]
  } else if (currentIdx + move < 0) {
    return cols[4]
  } else {
    return cols[currentIdx + move]
  }
}

function filterAlpha (str) {
  if (typeof str === 'string') {
    return str.replace(',', '.').replace(/[^\d.-]/g, '')
  }
  return str
}

function getUpdatedDocumentRoles (props) {
  let { keyRole, keyType, newVal } = props
  let result = {}
  let momentInstanceDate = moment()
  if (keyRole && keyRole.constructor === Array && keyRole.length > 0) {
    switch (keyRole[keyRole.length - 1]) {
      case 'BANK_NAME':
        result.bankEntity = newVal
        break
      case 'DATE_FROM':
        moment.locale('fr')
        parseDateRange(newVal)
        momentInstanceDate = moment(newVal, 'DD/MM/YYYY')
        result.dateBeg = momentInstanceDate._isValid ? momentInstanceDate.toDate() : null
        break
      case 'DATE_TO':
        moment.locale('fr')
        momentInstanceDate = moment(newVal, 'DD/MM/YYYY')
        result.dateEnd = momentInstanceDate._isValid ? momentInstanceDate.toDate() : null
        break
      case 'TOTAL_HT':
        result.totalHt = newVal
        break
      case 'TOTAL_TTC':
        result.totalTtc = newVal
        break
      case 'VENDOR':
        result.vendor = newVal
        break
      case 'VAT':
        result.vat = newVal
        break
    }
  }
  if (keyType === 'DATE') {
    momentInstanceDate = moment(newVal, 'DD/MM/YYYY')
    result.invoiceDate = momentInstanceDate._isValid ? momentInstanceDate.toDate() : null
  }
  return result
}

function parseDate (value) {
  if (!value) return ''
  let parsedInput = ''
  try {
    moment.locale('fr')
    parsedInput = moment(value, dateFormats).format('DD/MM/YYYY')
  } catch (error) {
    console.log('erroe', error)
  }
  return parsedInput
}

function parseDateRange (value, side) {
  let result = { value: '', hasRange: false }
  const pattern = /(du)(.*)(au)(.*)/gi
  const matches = [...value.matchAll(pattern)]
  if (matches && matches.length && matches[0].length >= 5) {
    const duIdx = matches[0].findIndex(x => x.trim() === 'du')
    const auIdx = matches[0].findIndex(x => x.trim() === 'au')
    if (side === 'DATE_FROM' && duIdx + 1 < matches[0].length) {
      result.value = matches[0][duIdx + 1]
      result.hasRange = true
      return result
    } else if (side === 'DATE_TO' && auIdx + 1 < matches[0].length) {
      result.value = matches[0][auIdx + 1]
      result.hasRange = true
      return result
    }
  }
  return result
}

function formatValue (value, keyType, keyRole, entryType) {
  let parsedValue = null
  switch (keyType) {
    case 'NUMBER':
      parsedValue = filterAlpha(value)
      break
    case 'DATE':
      if (keyRole && keyRole.length && (keyRole[keyRole.length - 1] === 'DATE_FROM' || keyRole[keyRole.length - 1] === 'DATE_TO')) {
        let parseResult = parseDateRange(value, keyRole[keyRole.length - 1])
        parsedValue = entryType === 'auto' ? (parseResult.hasRange ? parseResult.value : value) : value
      } else {
        parsedValue = entryType === 'auto' ? parseDate(value) : value
      }
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
    currentPane: 'templatePane',
    currentLibelle: 'Libellé d\'Imputation',
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
        state.currentPane = getActivePane(payload.col)
        state.currentIdx = payload.idx
        state.currentCol = payload.col
      } else {
        let nextCoords = state.currentPane === 'statementPane'
          ? getTableGraphNextMove(state.formattedDocument.bankOsmium[`page_${state.page}`], state.currentIdx, state.currentCol, payload.move)
          : getInvoiceGraphNextMove(state.formattedDocument.osmium, state.currentIdx, state.currentCol, payload.move)
        state.currentIdx = nextCoords.idx
        state.currentCol = nextCoords.col
        state.currentLibelle = state.currentPane === 'statementPane'
          ? changeDisplayedLibelle(state.currentCol, state.formattedDocument.bankOsmium[`page_${state.page}`][state.currentIdx])
          : changeDisplayedLibelle(state.currentCol, state.formattedDocument.osmium[state.currentIdx])
      }
    },
    MUTATION_DO_AUTO_CHANGES_TO_INVOICE(state, bbox) {
      let updateFormattedDoc = cloneDeep(state.formattedDocument)
      const keyType = state.formattedDocument.filter.keys[state.currentIdx].type
      const keyRole = state.formattedDocument.filter.keys[state.currentIdx].role
      const newVal = formatValue(bbox.Text, keyType, keyRole, 'auto')
      let mbcData = new Map()
      mbcData.set(updateFormattedDoc.osmium[state.currentIdx].Key, bbox)
      if (state.catMode) {
        let appendix = ' '.concat(newVal)
        let currentValue = updateFormattedDoc.osmium[state.currentIdx].Value
        updateFormattedDoc.osmium[state.currentIdx].Value = currentValue ? currentValue.concat(appendix) : appendix.trim()
      } else {
        updateFormattedDoc.osmium[state.currentIdx].Value = newVal
      }
      const updatedDocumentRoleAttributes = getUpdatedDocumentRoles({ keyRole, keyType, newVal })
      if (keyRole && keyRole.length && keyRole[keyRole.length - 1] === 'VENDOR') {
        updateFormattedDoc.osmium.forEach((x) => {
          if (x.Imputation !== null) {
            x.Libelle = newVal
          }
        })
      }
      state.formattedDocument = updateFormattedDoc
      let options = { imput: false, bankOsmiumChanged: false, keyAttributes: updatedDocumentRoleAttributes }
      saveDocToAPI(Object.fromEntries(mbcData), updateFormattedDoc, options)
    },
    MUTATION_DO_MANUAL_CHANGES_TO_INVOICE(state, changeData) {
      let { value } = changeData
      let mbcData = new Map()
      const keyType = state.formattedDocument.filter.keys[state.currentIdx].type
      const keyRole = state.formattedDocument.filter.keys[state.currentIdx].role
      let tempDoc = cloneDeep(state.formattedDocument)
      const newVal = formatValue(value, keyType, keyRole, 'manual')
      tempDoc.osmium[state.currentIdx][state.currentCol] = newVal
      const updatedDocumentRoleAttributes = getUpdatedDocumentRoles({ keyRole, keyType, newVal })
      if (keyRole && keyRole.length && keyRole[keyRole.length - 1] === 'VENDOR') {
        tempDoc.osmium.forEach((x) => {
          if (x.Imputation !== null) {
            x.Libelle = newVal
          }
        })
      }
      state.formattedDocument = tempDoc
      let options = { imput: false, bankOsmiumChanged: false, keyAttributes: updatedDocumentRoleAttributes }
      saveDocToAPI(Object.fromEntries(mbcData), state.formattedDocument, options)
    },
    MUTATION_DO_IMPUTATION_CHANGES_TO_INVOICE(state, changeData) {
      let { imputation, itemIdx } = changeData
      let tempDoc = cloneDeep(state.formattedDocument)
      tempDoc.osmium[itemIdx]['Imputation'] = imputation
      state.formattedDocument = tempDoc
      let options = { imput: true, bankOsmiumChanged: false, keyAttributes: null }
      saveDocToAPI({}, state.formattedDocument, options)
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
      let options = { imput: false, bankOsmiumChanged: true, keyAttributes: null }
      saveDocToAPI(null, updateFormattedDoc, options)
    },
    MUTATION_MANUAL_CHANGES_TO_STATEMENT(state, changeData) {
      let { value } = changeData
      let tempDoc = cloneDeep(state.formattedDocument)
      tempDoc.bankOsmium[`page_${state.page}`][state.currentIdx][state.currentCol] = value
      state.formattedDocument = tempDoc
      console.log(state.formattedDocument.bankOsmium[`page_${state.page}`][state.currentIdx][state.currentCol])
      let options = { imput: false, bankOsmiumChanged: true, keyAttributes: null }
      saveDocToAPI(null, state.formattedDocument, options)
    },
    MUTATION_DO_IMPUTATION_CHANGES_TO_STATEMENT(state, changeData) {
      let { imputation, itemIdx } = changeData
      let tempDoc = cloneDeep(state.formattedDocument)
      tempDoc.bankOsmium[`page_${state.page}`][itemIdx]['Compte'] = imputation
      state.formattedDocument = tempDoc
      let options = { imput: false, bankOsmiumChanged: true, keyAttributes: null }
      saveDocToAPI({}, state.formattedDocument, options)
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
      let options = { imput: false, bankOsmiumChanged: true, keyAttributes: null }
      saveDocToAPI({}, state.formattedDocument, options)
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
      let options = { imput: false, bankOsmiumChanged: true, keyAttributes: null }
      saveDocToAPI({}, state.formattedDocument, options)
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
    MUTATION_CHANGE_LIBELLE(state, imputation) {
      const trimedImputation = trimImputationQuery(imputation)
      state.currentLibelle = labels[parseInt(trimedImputation)]
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
      commit('MUTATION_DO_AUTO_CHANGES_TO_INVOICE', idx)
    },
    ACTION_DO_CHANGES_TO_DOCUMENT({ commit }, changeData) {
      commit('MUTATION_DO_MANUAL_CHANGES_TO_INVOICE', changeData)
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
    ACTION_DO_IMPUTATION_CHANGES_TO_STATEMENT({ state, commit }, payload) {
      if (state.currentPane === 'statementPane') {
        commit('MUTATION_DO_IMPUTATION_CHANGES_TO_STATEMENT', payload)
      } else {
        commit('MUTATION_DO_IMPUTATION_CHANGES_TO_INVOICE', payload)
      }
    },
    ACTION_AUTO_CHANGES_TO_STATEMENT({ state, commit }, bbox) {
      if (state.currentPane === 'statementPane') {
        commit('MUTATION_AUTO_CHANGES_TO_STATEMENT', bbox)
      } else {
        commit('MUTATION_DO_AUTO_CHANGES_TO_INVOICE', bbox)
      }
    },
    ACTION_MANUAL_CHANGES_TO_STATEMENT({ state, commit }, payload) {
      if (state.currentPane === 'statementPane') {
        commit('MUTATION_MANUAL_CHANGES_TO_STATEMENT', payload)
      } else {
        commit('MUTATION_DO_MANUAL_CHANGES_TO_INVOICE', payload)
      }
    },
    ACTION_INSERT_STATEMENTS({ commit }, payload) {
      commit('MUTATION_INSERT_STATEMENTS', payload)
    },
    ACTION_DELETE_STATEMENTS({ commit }, payload) {
      commit('MUTATION_DELETE_STATEMENTS', payload)
    },
    ACTION_CHANGE_LIBELLE({ commit }, libelle) {
      commit('MUTATION_CHANGE_LIBELLE', libelle)
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
    currentActivePane: state => state.currentPane,
    catMode: state => state.catMode,
    docTableLoading: state => state.loading, // TODO: eliminate
    docQueryParams: state => state.queryParams,
    docSmeltedCache: state => state.smeltedCache,
    docPagination: state => pick(state.queryParams, ['page', 'limit']),
    totalDocumentsCount: state => state.totalDocumentsCount, // TODO REMOVE IF NOT USABLE IN SUBBAR
    showImputationAlert: state => (state.currentCol === 'Imputation' || state.currentCol === 'Compte') && state.currentLibelle,
    currentImputationAlert: state => state.currentLibelle,
  },
}
