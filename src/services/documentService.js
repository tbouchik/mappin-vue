import axios from 'axios'

axios.interceptors.request.use(
  config => {
    console.log(
      `${config.method.toUpperCase()} request sent to ${
        config.url
      } at ${new Date().getTime()}`
    )

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

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
