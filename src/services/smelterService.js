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

class SmelterService {
  static postSmelter(file) {
    return axios.post('http://localhost:3000/v1/scan', {
      filename: file,
    })
  }
}

export default SmelterService
