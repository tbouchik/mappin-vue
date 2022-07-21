import axios from 'axios'

class VendorService {
  static postNewVendor(vendor) {
    return axios.post(`/v1/vendors`, vendor)
  }

  static fetchVendors(options) {
    return axios.get(`/v1/vendors`, options)
  }

  static updateVendor(id, vendorBody) {
    return axios.patch(`/v1/vendors/${id}`, vendorBody)
  }

  static deleteVendor(vendorId) {
    return axios.delete(`/v1/vendors/${vendorId}`)
  }
}

export default VendorService
