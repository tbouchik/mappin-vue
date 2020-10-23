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
  static downloadPDF(url) {
    return axios({
      method: 'get',
      url,
      responseType: 'blob',
    })
  }
}

export default DocumentService
