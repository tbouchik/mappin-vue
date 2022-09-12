import axios from 'axios'

class CompanyService {
  static getCompany(id) {
    return axios.get(`/v1/companies/${id}`)
  }

  static getCompanyRemainingCredits() {
    return axios.get(`/v1/companies/count`)
  }
}

export default CompanyService
