import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import dateFormats from '../helpers'
import labels from '../../assets/accounting/labels'
import { cloneDeep, get, pick, pickBy, isEqual } from 'lodash'
import moment from 'moment'
Vue.use(Vuex)

let cancelToken
let debounce = null

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
  const templateColumns = ['Key', 'Value', 'Imputation']
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
  const graphDepth = osmium.length // TODO CHECK IF IS POSSIBLE TO CARRY ONLY OSMIUM.LENGTH AS ARGUMENT INSTEAD OF OSMIUM
  if (move === 'inc') {
    const nextIndex = currentIdx < graphDepth - 1 ? currentIdx + 1 : 0
    return { idx: nextIndex, col: 'Compte' }
  } else {
    const previousIndex = currentIdx > 0 ? currentIdx - 1 : graphDepth - 1
    return { idx: previousIndex, col: 'Compte' }
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
    const imputation = typeof osmiumItem[col] === 'object' ? osmiumItem[col].Text : osmiumItem[col]
    const trimedImputation = trimImputationQuery(imputation)
    result = labels[parseInt(trimedImputation)]
  }
  return result
}

function filterAlpha (str) {
  if (typeof str === 'string') {
    return str.replace(',', '.').replace(/[^\d.]/g, '')
  }
  return str
}

function getUpdatedDocumentRoles (props) {
  let { keyRole, keyType, newVal, isBank } = props
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
        result.dateBeg = momentInstanceDate._isValid ? momentInstanceDate.toDate().setHours(0, 0, 0, 0) : null
        break
      case 'DATE_TO':
        moment.locale('fr')
        momentInstanceDate = moment(newVal, 'DD/MM/YYYY')
        result.dateEnd = momentInstanceDate._isValid ? momentInstanceDate.toDate().setHours(0, 0, 0, 0) : null
        break
      case 'TOTAL_HT':
        result.totalHt = parseFloat(newVal)
        break
      case 'TOTAL_TTC':
        result.totalTtc = parseFloat(newVal)
        break
      case 'VENDOR':
        result.vendor = newVal
        break
      case 'VAT':
        result.vat = parseFloat(newVal)
        break
    }
  }
  if (keyType === 'DATE' && !isBank) {
    momentInstanceDate = moment(newVal, 'DD/MM/YYYY')
    result.invoiceDate = momentInstanceDate._isValid ? momentInstanceDate.toDate().setHours(0, 0, 0, 0) : null
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
  if (!value) return null
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
        parsedValue = entryType === 'auto' ? (parseResult.hasRange ? parseDate(parseResult.value) : parseDate(value)) : value
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
    document: {},
    osmiumChangeSnapshots: [],
    bankOsmiumChangeSnapshots: [],
    page: 1,
    documentsList: [],
    currentIdx: 0,
    catMode: false,
    loading: false,
    queryParams: {},
    currentCol: 'Value',
    currentPane: 'templatePane',
    currentLibelle: 'Libellé d\'Imputation',
    smeltedCache: [],
    documentsIdList: [],
    totalDocumentsCount: 0,
  },
  mutations: {
    UPDATE_DOCUMENT_DATA(state, document) {
      state.document = document
      state.document.osmium = state.document.osmium.map((item, index) => {
        item.key = index // This is to avoid ant design spitting on your face for
        return item // inserting items from osmium in ant table <a-table> without a unique key
      })
      state.documentsList[state.documentsList.findIndex(x => x.id === state.document.id)] = state.document
    },
    CLEAR_DOCUMENT_DATA(state) {
      state.document = null
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
          ? getTableGraphNextMove(state.document.bankOsmium[`page_${state.page}`], state.currentIdx, state.currentCol, payload.move)
          : getInvoiceGraphNextMove(state.document.osmium, state.currentIdx, state.currentCol, payload.move)
        state.currentIdx = nextCoords.idx
        state.currentCol = nextCoords.col
        state.currentLibelle = state.currentPane === 'statementPane'
          ? changeDisplayedLibelle(state.currentCol, state.document.bankOsmium[`page_${state.page}`][state.currentIdx])
          : changeDisplayedLibelle(state.currentCol, state.document.osmium[state.currentIdx])
      }
    },
    MUTATION_DO_AUTO_CHANGES_TO_INVOICE(state, bbox) {
      let newDoc = cloneDeep(state.document)
      const keyType = state.document.filter.keys[state.currentIdx].type
      const keyRole = state.document.filter.keys[state.currentIdx].role
      const newVal = formatValue(bbox.Text, keyType, keyRole, 'auto')
      let mbcData = new Map()
      mbcData.set(newDoc.osmium[state.currentIdx].Key, bbox)
      if (state.catMode) {
        let appendix = ' '.concat(newVal)
        let currentValue = newDoc.osmium[state.currentIdx].Value
        newDoc.osmium[state.currentIdx].Value = currentValue ? currentValue.concat(appendix) : appendix.trim()
      } else {
        newDoc.osmium[state.currentIdx].Value = newVal
      }
      const updatedDocumentRoleAttributes = getUpdatedDocumentRoles({ keyRole, keyType, newVal, isBank: state.document.isBankStatement })
      Object.assign(newDoc, updatedDocumentRoleAttributes)
      const snapshot = {
        index: state.currentIdx,
        column: state.currentCol,
        value: state.document.osmium[state.currentIdx].Value,
        keyAttributes: getUpdatedDocumentRoles({ keyRole, keyType, newVal: state.document.osmium[state.currentIdx].Value, isBank: state.document.isBankStatement }),
        imput: false,
        mbc: Object.fromEntries(mbcData),
      }
      if (!isEqual(snapshot, state.osmiumChangeSnapshots[state.osmiumChangeSnapshots.length - 1])) {
        state.osmiumChangeSnapshots.push(snapshot)
      }
      state.document = newDoc
      let options = { imput: false, bankOsmiumChanged: false, keyAttributes: updatedDocumentRoleAttributes }
      saveDocToAPI(Object.fromEntries(mbcData), newDoc, options)
    },
    MUTATION_DO_MANUAL_CHANGES_TO_INVOICE(state, changeData) {
      let { value } = changeData
      const keyType = state.document.filter.keys[state.currentIdx].type
      const keyRole = state.document.filter.keys[state.currentIdx].role
      let tempDoc = cloneDeep(state.document)
      const newVal = formatValue(value, keyType, keyRole, 'manual')
      tempDoc.osmium[state.currentIdx][state.currentCol] = newVal
      const updatedDocumentRoleAttributes = getUpdatedDocumentRoles({ keyRole, keyType, newVal, isBank: state.document.isBankStatement })
      Object.assign(tempDoc, updatedDocumentRoleAttributes)
      const snapshot = {
        index: state.currentIdx,
        column: state.currentCol,
        value: state.document.osmium[state.currentIdx].Value,
        keyAttributes: getUpdatedDocumentRoles({ keyRole, keyType, newVal: state.document.osmium[state.currentIdx].Value, isBank: state.document.isBankStatement }),
        imput: false,
        mbc: {},
      }
      if (!isEqual(snapshot, state.osmiumChangeSnapshots[state.osmiumChangeSnapshots.length - 1])) {
        state.osmiumChangeSnapshots.push(snapshot)
      }
      state.document = tempDoc
      clearTimeout(debounce)
      debounce = setTimeout(() => {
        let options = { imput: false, bankOsmiumChanged: false, keyAttributes: updatedDocumentRoleAttributes }
        saveDocToAPI({}, state.document, options)
      }, 600)
    },
    MUTATION_DO_IMPUTATION_CHANGES_TO_INVOICE(state, changeData) {
      let { imputation, itemIdx } = changeData
      let tempDoc = cloneDeep(state.document)
      const snapshot = {
        index: state.currentIdx,
        column: state.currentCol,
        value: state.document.osmium[state.currentIdx].Imputation,
        keyAttributes: null,
        imput: true,
        mbc: {},
      }
      if (!isEqual(snapshot, state.osmiumChangeSnapshots[state.osmiumChangeSnapshots.length - 1])) {
        state.osmiumChangeSnapshots.push(snapshot)
      }
      tempDoc.osmium[itemIdx]['Imputation'] = imputation
      state.document = tempDoc
      let options = { imput: true, bankOsmiumChanged: false, keyAttributes: null }
      saveDocToAPI({}, state.document, options)
    },
    MUTATION_AUTO_CHANGES_TO_STATEMENT(state, bbox) {
      let newDoc = cloneDeep(state.document)
      const newVal = bbox.Text
      const snapshot = {
        type: 'modify',
        index: state.currentIdx,
        column: state.currentCol,
        page: `page_${state.page}`,
        value: state.document.bankOsmium[`page_${state.page}`][state.currentIdx][state.currentCol].Text,
      }
      if (!isEqual(snapshot, state.bankOsmiumChangeSnapshots[state.bankOsmiumChangeSnapshots.length - 1])) {
        state.bankOsmiumChangeSnapshots.push(snapshot)
      }
      if (state.catMode) {
        let appendix = ' '.concat(newVal)
        let currentValue = newDoc.bankOsmium[`page_${state.page}`][state.currentIdx][state.currentCol].Text
        newDoc.bankOsmium[`page_${state.page}`][state.currentIdx][state.currentCol].Text = currentValue ? currentValue.concat(appendix) : appendix.trim()
      } else {
        newDoc.bankOsmium[`page_${state.page}`][state.currentIdx][state.currentCol].Text = newVal
      }
      state.document = newDoc
      let options = { imput: false, bankOsmiumChanged: true, keyAttributes: null }
      saveDocToAPI(null, newDoc, options)
    },
    MUTATION_MANUAL_CHANGES_TO_STATEMENT(state, changeData) {
      let { value } = changeData
      let tempDoc = cloneDeep(state.document)
      const snapshot = {
        type: 'modify',
        index: state.currentIdx,
        column: state.currentCol,
        page: `page_${state.page}`,
        value: state.document.bankOsmium[`page_${state.page}`][state.currentIdx][state.currentCol].Text,
      }
      if (!isEqual(snapshot, state.bankOsmiumChangeSnapshots[state.bankOsmiumChangeSnapshots.length - 1])) {
        state.bankOsmiumChangeSnapshots.push(snapshot)
      }
      tempDoc.bankOsmium[`page_${state.page}`][state.currentIdx][state.currentCol].Text = value
      state.document = tempDoc
      clearTimeout(debounce)
      debounce = setTimeout(() => {
        let options = { imput: false, bankOsmiumChanged: true, keyAttributes: null }
        saveDocToAPI(null, state.document, options)
      }, 600)
    },
    MUTATION_DO_IMPUTATION_CHANGES_TO_STATEMENT(state, changeData) {
      let { imputation, itemIdx } = changeData
      let tempDoc = cloneDeep(state.document)
      const snapshot = {
        type: 'modify',
        index: state.currentIdx,
        column: state.currentCol,
        page: `page_${state.page}`,
        value: state.document.bankOsmium[`page_${state.page}`][state.currentIdx][state.currentCol].Text,
      }
      if (!isEqual(snapshot, state.bankOsmiumChangeSnapshots[state.bankOsmiumChangeSnapshots.length - 1])) {
        state.bankOsmiumChangeSnapshots.push(snapshot)
      }
      tempDoc.bankOsmium[`page_${state.page}`][itemIdx]['Compte'].Text = imputation
      state.document = tempDoc
      let options = { imput: false, bankOsmiumChanged: true, keyAttributes: null }
      saveDocToAPI({}, state.document, options)
    },
    MUTATION_INSERT_STATEMENTS(state, changeData) {
      let { offset, selectedStatements, lines } = changeData
      let tempDoc = cloneDeep(state.document)
      const snapshot = {
        type: 'add',
        bankOsmium: cloneDeep(state.document.bankOsmium),
      }
      if (!isEqual(snapshot, state.bankOsmiumChangeSnapshots[state.bankOsmiumChangeSnapshots.length - 1])) {
        state.bankOsmiumChangeSnapshots.push(snapshot)
      }
      const emptyStatement = {
        'Date': { Text: '', Bbox: null },
        'Designation': { Text: '', Bbox: null },
        'Debit': { Text: '', Bbox: null },
        'Credit': { Text: '', Bbox: null },
        'Compte': { Text: '', Bbox: null },
      }
      let counter = 0
      if (offset === -1) {
        Array.from({ length: lines }, (_) => {
          const newEmptyStatement = cloneDeep(emptyStatement)
          tempDoc.bankOsmium[`page_${state.page}`].push(newEmptyStatement)
        })
      } else {
        selectedStatements.forEach(idx => {
          Array.from({ length: lines }, (_) => {
            const newEmptyStatement = cloneDeep(emptyStatement)
            tempDoc.bankOsmium[`page_${state.page}`].splice([idx + offset + counter], 0, newEmptyStatement)
            counter++
          })
        })
      }
      state.document = tempDoc
      let options = { imput: false, bankOsmiumChanged: true, keyAttributes: null }
      saveDocToAPI({}, state.document, options)
    },
    MUTATION_DELETE_STATEMENTS(state, changeData) {
      const snapshot = {
        type: 'remove',
        bankOsmium: cloneDeep(state.document.bankOsmium),
      }
      if (!isEqual(snapshot, state.bankOsmiumChangeSnapshots[state.bankOsmiumChangeSnapshots.length - 1])) {
        state.bankOsmiumChangeSnapshots.push(snapshot)
      }
      let { selectedStatements } = changeData
      let tempDoc = cloneDeep(state.document)
      let counter = 0
      selectedStatements.forEach(idx => {
        tempDoc.bankOsmium[`page_${state.page}`].splice([idx - counter], 1)
        counter++
      })
      state.document = tempDoc
      let options = { imput: false, bankOsmiumChanged: true, keyAttributes: null }
      saveDocToAPI({}, state.document, options)
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
    MUTATION_FORMAT_STATEMENT_DATES(state, dates) {
      let newDoc = cloneDeep(state.document)
      const snapshot = {
        type: 'remove',
        bankOsmium: cloneDeep(state.document.bankOsmium),
      }
      if (!isEqual(snapshot, state.bankOsmiumChangeSnapshots[state.bankOsmiumChangeSnapshots.length - 1])) {
        state.bankOsmiumChangeSnapshots.push(snapshot)
      }
      Object.values(newDoc.bankOsmium).forEach((statementPage) => {
        statementPage.forEach((statementItem) => {
          try {
            let fullDate = statementItem.Date.Text.replace(/\D+/g, '')
            if (fullDate.length && fullDate.length >= 2) {
              let date = parseInt(fullDate.substring(0, 2))
              if (!isNaN(date)) {
                let guessedDate = moment()
                guessedDate.set('date', date)
                guessedDate.set('month', dates[0].month())
                guessedDate.set('year', dates[0].year())
                if (dates[0].isBefore(guessedDate) && dates[1].isAfter(guessedDate)) {
                  statementItem.Date.Text = guessedDate.format('DD/MM/YYYY')
                } else {
                  guessedDate.set('month', dates[1].month())
                  guessedDate.set('year', dates[1].year())
                  if (dates[0].isBefore(guessedDate) && dates[1].isAfter(guessedDate)) {
                    statementItem.Date.Text = guessedDate.format('DD/MM/YYYY')
                  }
                }
              }
            }
          } catch (err) {
            console.log('Error parsing date', err)
          }
        })
      })
      state.document = newDoc
      let options = { imput: false, bankOsmiumChanged: true, keyAttributes: null }
      saveDocToAPI(null, newDoc, options)
    },
    MUTATION_ROLLBACK_CHANGE(state, payload) {
      let lastState
      let newDoc = cloneDeep(state.document)
      let options = {}
      if (payload.target === 'invoice') {
        lastState = state.osmiumChangeSnapshots.pop()
        if (lastState) {
          newDoc = cloneDeep(state.document)
          newDoc.osmium[lastState.index][lastState.column] = lastState.value
          if (lastState.keyAttributes) {
            let keyAttribute = Object.keys(lastState.keyAttributes)[0]
            newDoc[keyAttribute] = Object.values(lastState.keyAttributes)[0]
          }
          state.document = newDoc
          let options = { imput: lastState.imput, bankOsmiumChanged: false, keyAttributes: lastState.keyAttributes }
          saveDocToAPI(lastState.mbc, newDoc, options)
        }
      } else {
        lastState = state.bankOsmiumChangeSnapshots.pop()
        if (lastState) {
          if (lastState.type === 'modify') {
            newDoc.bankOsmium[lastState.page][lastState.index][lastState.column].Text = lastState.value
            state.document = newDoc
            options = { imput: false, bankOsmiumChanged: true, keyAttributes: null }
          } else {
            newDoc.bankOsmium = lastState.bankOsmium
            state.document = newDoc
            options = { imput: false, bankOsmiumChanged: true, keyAttributes: null }
          }
          saveDocToAPI({}, newDoc, options)
        }
      }
    },
    MUTATION_RESET_CHANGE_SNAPSHOTS(state) {
      state.bankOsmiumChangeSnapshots = []
      state.osmiumChangeSnapshots = []
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
    ACTION_DO_AUTO_CHANGES_TO_INVOICE({ commit }, idx) {
      commit('MUTATION_DO_AUTO_CHANGES_TO_INVOICE', idx)
    },
    ACTION_DO_CHANGES_TO_DOCUMENT({ commit }, changeData) {
      commit('MUTATION_DO_MANUAL_CHANGES_TO_INVOICE', changeData)
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
    ACTION_FORMAT_STATEMENT_DATES({ commit }, dates) {
      commit('MUTATION_FORMAT_STATEMENT_DATES', dates)
    },
    ACTION_ROLLBACK_CHANGE({ commit }, payload) {
      commit('MUTATION_ROLLBACK_CHANGE', payload)
    },
    ACTION_RESET_CHANGE_SNAPSHOTS({ commit }) {
      commit('MUTATION_RESET_CHANGE_SNAPSHOTS')
    },
  },
  getters: {
    current: state => state.document,
    currentPageData: state => get(state, 'document.metadata', {})['page_' + state.page],
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
    osmiumSnapshotsEmpty: state => state.osmiumChangeSnapshots.length === 0,
    bankOsmiumSnapshotsEmpty: state => state.bankOsmiumChangeSnapshots.length === 0,
  },
}
