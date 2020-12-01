import axios from 'axios'

let cancelToken
class DocumentService {
  static updateDocument(body, documentId) {
    return axios.patch(`/v1/documents/${documentId}`, {
      ...body,
    })
  }

  static fetchDocument(documentId) {
    return axios.get(`/v1/documents/${documentId}`)
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
    const { client, name, filter, skip, status, side, current } = queryParams
    if (typeof cancelToken !== typeof undefined) {
      cancelToken.cancel('Operation canceled due to new request.')
    }
    // Save the cancel token for the current request
    cancelToken = axios.CancelToken.source()
    const params = {
      client,
      side,
      current,
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
      console.log(error)
    }
  }

  static fetchNextDocuments(queryParams) {
    const { client, limit, sort, name, filter, status, side, current } = queryParams
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
      console.log(error)
    }
  }

  static fetchDocuments(queryParams) {
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

  static fetchDocumentsCount(queryParams) {
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

  static deleteDocument(id) {
    try {
      return axios.delete(`/v1/documents/${id}`,)
        .then(() => id)
    } catch (error) {
      console.log(error)
    }
  }

  static bulkExportCSV(queryParams) {
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
      return axios.get(`/v1/documents/export`, { params }, { cancelToken: cancelToken.token })
        .then(
          ({ data }) => data
        )
    } catch (error) {
      console.log(error)
    }
  }
}

export default DocumentService
