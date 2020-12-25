import axios from 'axios'

class UserService {
  static sendResetPasswordMail(email) {
    return axios.post(`/v1/auth/forgot-password`, { email })
  }
}

export default UserService
