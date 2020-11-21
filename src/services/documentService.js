import axios from 'axios'

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

  static fetchDocumentsNext(queryParams) {
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
}

export default DocumentService
