import axios from 'axios'

class ClientService {
  static fetchClient(clientId) {
    return axios.get(`/v1/clients/${clientId}`)
      .then(res => res.data)
  }
  static deleteClient(clientId) {
    return axios.delete(`/v1/clients/${clientId}`)
      .then(res => res.data)
  }
  static updateClient(body, clientId) {
    return axios.patch(`/v1/clients/${clientId}`, {
      ...body,
    })
  }
}

export default ClientService
