import axios from 'axios'

class ClientService {
  static fetchClient(clientId) {
    return axios.get(`/v1/clients/${clientId}`)
      .then(res => res.data)
  }
  static addClient(payload) {
    return axios.post(`/v1/clients/`, payload)
      .then(res => res.data)
      .catch((error) => {
        return {
          error: true,
          message: error.response.statusText,
          description: error.response.data.message,
        }
      })
  }
  static deleteClient(clientId) {
    return axios.delete(`/v1/clients/${clientId}`)
      .then(res => res.data)
      .catch((error) => {
        return {
          error: true,
          message: error.response.statusText,
          description: error.response.data.message,
        }
      })
  }
  static updateClient(body, clientId) {
    return axios.patch(`/v1/clients/${clientId}`, {
      ...body,
    })
      .then(res => res.data)
      .catch((error) => {
        return {
          error: true,
          message: error.response.statusText,
          description: error.response.data.message,
        }
      })
  }
}

export default ClientService
