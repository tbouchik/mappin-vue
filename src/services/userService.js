import axios from 'axios'

class UserService {
  static sendResetPasswordMail(email) {
    return axios.post(`/v1/auth/forgot-password`, { email })
  }
  static resetPassword(token, password) {
    try {
      const params = { token }
      return axios.post(`/v1/auth/reset-password`, { password }, { params })
    } catch (error) {
    }
  }
}

export default UserService
