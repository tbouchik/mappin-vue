import axios from 'axios'
import { pickBy, omit } from 'lodash'
let cancelToken

function filterParams(queryParams) {
  return pickBy(queryParams, (v, _) => { return (typeof v === 'number' && !isNaN(v)) || typeof v === 'boolean' || !!v })
}
class DocumentService {
  static updateDocument(body, documentId) {
    return axios.patch(`/v1/documents/${documentId}`, {
      ...body,
    }).then(
      ({ data }) => data
    )
  }

  static fetchDocument(documentId) {
    return axios.get(`/v1/documents/${documentId}`)
      .then(
        ({ data }) => data
      )
  }

  static downloadMedia(url) {
    return axios({
      method: 'get',
      url,
      responseType: 'arraybuffer',
    })
  }

  static downloadPDF(url) {
    return axios({
      method: 'get',
      url,
      responseType: 'blob',
    })
  }

  static fetchNextSmeltedDocuments(queryParams) {
    let params = omit(filterParams(queryParams), ['limit', 'page', 'isArchived'])
    params.isArchived = false
    if (typeof cancelToken !== typeof undefined) {
      cancelToken.cancel('Operation canceled due to new request.')
    }
    // Save the cancel token for the current request
    cancelToken = axios.CancelToken.source()
    try {
      return axios.get(`/v1/documents/nextsmelted`, { params }, { cancelToken: cancelToken.token })
        .then(
          ({ data }) => data
        )
    } catch (error) {
    }
  }

  static fetchNextDocuments(queryParams) {
    let params = omit(filterParams(queryParams), ['page'])
    if (typeof cancelToken !== typeof undefined) {
      cancelToken.cancel('Operation canceled due to new request.')
    }
    // Save the cancel token for the current request
    cancelToken = axios.CancelToken.source()
    try {
      return axios.get(`/v1/documents/next`, { params }, { cancelToken: cancelToken.token })
        .then(
          ({ data }) => data
        )
    } catch (error) {
    }
  }

  static fetchDocuments(queryParams) {
    let params = omit(filterParams(queryParams), ['page'])
    params.page = queryParams.page - 1
    if (typeof cancelToken !== typeof undefined) {
      cancelToken.cancel('Operation canceled due to new request.')
    }
    // Save the cancel token for the current request
    cancelToken = axios.CancelToken.source()
    try {
      return axios.get(`/v1/documents`, { params }, { cancelToken: cancelToken.token })
        .then(
          ({ data }) => data
        )
    } catch (error) {
    }
  }

  static fetchDocumentsCount(queryParams) {
    let params = omit(filterParams(queryParams), ['limit', 'page'])
    return axios.get('/v1/documents/count', { params })
      .then(
        ({ data }) => data
      )
  }

  static deleteDocument(id) {
    try {
      return axios.delete(`/v1/documents/${id}`,)
        .then(() => id)
    } catch (error) {
    }
  }

  static updateMany(idsArray, body) {
    try {
      return axios.put(`/v1/documents/updateMany`, { idsArray, body })
        .then(({ data }) => data)
    } catch (error) {
    }
  }

  static deleteMany(idsArray) {
    try {
      return axios.post(`/v1/documents/deleteMany`, { idsArray })
        .then(({ data }) => data)
    } catch (error) {
    }
  }

  static bulkExportCSV(queryParams) {
    let params = filterParams(queryParams)
    const fixedParams = {
      isArchived: false,
      isBankStatement: false,
      status: 'validated',
      page: queryParams.page - 1, // TODO for export should maybe ignore page, and export all
    }
    Object.assign(params, fixedParams)
    if (typeof cancelToken !== typeof undefined) {
      cancelToken.cancel('Operation canceled due to new request.')
    }
    // Save the cancel token for the current request
    cancelToken = axios.CancelToken.source()
    try {
      return axios.get(`/v1/documents/export`, { params }, { cancelToken: cancelToken.token })
        .then(
          ({ data }) => data
        )
    } catch (error) {
    }
  }

  static bulkBankExportCSV(queryParams) {
    let params = filterParams(queryParams)
    const fixedParams = {
      isArchived: false,
      isBankStatement: true,
      status: 'validated',
      page: queryParams.page - 1,
    }
    Object.assign(params, fixedParams)
    if (typeof cancelToken !== typeof undefined) {
      cancelToken.cancel('Operation canceled due to new request.')
    }
    // Save the cancel token for the current request
    cancelToken = axios.CancelToken.source()
    try {
      return axios.get(`/v1/documents/statementsdownload`, { params }, { cancelToken: cancelToken.token })
        .then(
          ({ data }) => data
        )
    } catch (error) {
    }
  }
}

export default DocumentService
