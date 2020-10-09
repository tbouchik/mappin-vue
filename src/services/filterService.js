import axios from 'axios'

class FilterService {
  static updateFilter(body, filterId) {
    return axios.patch(`http://localhost:3000/v1/filters/${filterId}`, {
      ...body,
    })
  }
  static fetchFilter(filterId) {
    return axios.get(`http://localhost:3000/v1/filters/${filterId}`)
      .then(res => res.data)
  }
  static deleteFilter(filterId) {
    return axios.delete(`http://localhost:3000/v1/filters/${filterId}`)
      .then(res => res.data)
  }

  static getDefaultFilterId() {
    return axios.get(`http://localhost:3000/v1/filters/default`)
      .then(res => res.data)
  }
}

export default FilterService
