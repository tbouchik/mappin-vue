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

  static fetchDocumentsByClient(clienId) {
    return axios.get(`/v1/documents/client/${clienId}`)
      .then(res => {
        return res.data
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
    const { client, name, filter, skip } = queryParams
    if (typeof cancelToken !== typeof undefined) {
      cancelToken.cancel('Operation canceled due to new request.')
    }
    // Save the cancel token for the current request
    cancelToken = axios.CancelToken.source()
    const params = {
      client,
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
    try {
      return axios.get(`/v1/documents/next`, { params }, { cancelToken: cancelToken.token })
        .then(
          ({ data }) => data
        )
    } catch (error) {
      console.log(error)
    }
  }
}

export default DocumentService
