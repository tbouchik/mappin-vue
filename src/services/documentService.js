import axios from 'axios'

let cancelToken
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
    const { client, name, filter, skip, status, side, current, isBankStatement } = queryParams
    if (typeof cancelToken !== typeof undefined) {
      cancelToken.cancel('Operation canceled due to new request.')
    }
    // Save the cancel token for the current request
    cancelToken = axios.CancelToken.source()
    const params = {
      client,
      side,
      current,
      isBankStatement,
      isArchived: false,
    }
    if (name && name !== '') {
      params.name = name
    }
    if (filter) {
      params.filter = filter
    }
    if (skip) {
      params.skip = skip
    }
    if (status) {
      params.status = status
    }
    try {
      return axios.get(`/v1/documents/nextsmelted`, { params }, { cancelToken: cancelToken.token })
        .then(
          ({ data }) => data
        )
    } catch (error) {
    }
  }

  static fetchNextDocuments(queryParams) {
    const { client, limit, sort, name, filter, status, side, current, isArchived, isBankStatement } = queryParams
    if (typeof cancelToken !== typeof undefined) {
      cancelToken.cancel('Operation canceled due to new request.')
    }
    // Save the cancel token for the current request
    cancelToken = axios.CancelToken.source()
    const params = {
      client,
      limit,
      sort,
      side,
      current,
      isArchived,
      isBankStatement,
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
      return axios.get(`/v1/documents/next`, { params }, { cancelToken: cancelToken.token })
        .then(
          ({ data }) => data
        )
    } catch (error) {
    }
  }

  static fetchDocuments(queryParams) {
    const { client, page, limit, sort, name, filter, status, isArchived, isBankStatement } = queryParams
    if (typeof cancelToken !== typeof undefined) {
      cancelToken.cancel('Operation canceled due to new request.')
    }
    // Save the cancel token for the current request
    cancelToken = axios.CancelToken.source()
    const params = {
      client,
      limit,
      isArchived,
      isBankStatement,
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
    }
  }

  static fetchDocumentsCount(queryParams) {
    const { client, name, status, filter, isArchived, isBankStatement } = queryParams
    const params = {
      client,
      isArchived,
      isBankStatement,
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
    const { client, page, limit, sort, name, filter } = queryParams
    if (typeof cancelToken !== typeof undefined) {
      cancelToken.cancel('Operation canceled due to new request.')
    }
    // Save the cancel token for the current request
    cancelToken = axios.CancelToken.source()
    const params = {
      client,
      limit,
      sort,
      isArchived: false,
      isBankStatement: false,
      status: 'validated',
      page: page - 1,
    }
    if (name && name !== '') {
      params.name = name
    }
    if (filter) {
      params.filter = filter
    }
    try {
      return axios.get(`/v1/documents/export`, { params }, { cancelToken: cancelToken.token })
        .then(
          ({ data }) => data
        )
    } catch (error) {
    }
  }

  static bulkBankExportCSV(queryParams) {
    const { client, page, limit, sort, name, filter } = queryParams
    if (typeof cancelToken !== typeof undefined) {
      cancelToken.cancel('Operation canceled due to new request.')
    }
    // Save the cancel token for the current request
    cancelToken = axios.CancelToken.source()
    const params = {
      client,
      limit,
      sort,
      isArchived: false,
      isBankStatement: true,
      status: 'validated',
      page: page - 1,
    }
    if (name && name !== '') {
      params.name = name
    }
    if (filter) {
      params.filter = filter
    }
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
