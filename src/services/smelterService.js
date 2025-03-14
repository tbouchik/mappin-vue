import axios from 'axios'

// axios.interceptors.request.use(
//   config => {
//     console.log(
//       `${config.method.toUpperCase()} request sent to ${
//         config.url
//       } at ${new Date().getTime()}`
//     )

//     return config
//   },
//   error => {
//     return Promise.reject(error)
//   }
// )

class SmelterService {
  static postSmelter(file) {
    return axios.post(`/v1/smelt`, {
      filename: file,
    })
  }
  static postBulkSmelter(files) {
    return axios.post(`/v1/smelt/bulk`, {
      files: files,
    })
  }
}

export default SmelterService
