import axios from 'axios'

class DocumentService {
  static updateDocument(body, documentId) {
    return axios.patch(`http://localhost:3000/v1/documents/${documentId}`, {
      ...body,
    })
  }
  static fetchDocument(documentId) {
    return axios.get(`http://localhost:3000/v1/documents/${documentId}`)
  }
}

export default DocumentService
