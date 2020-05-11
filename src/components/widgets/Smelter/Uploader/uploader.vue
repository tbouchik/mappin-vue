<template>
  <div>
    <div class="air__utils__heading">
      <h5>Smeltor Uploader</h5>
    </div>
    <div class="card">
      <div class="card-body">
        <a-form :form="form" layout="vertical">
          <div class="row">
            <div class="col-12">
              <a-form-item>
                <a-upload-dragger
                  name="file"
                  :multiple="multiple"
                  @change="handleChange"
                  accept="image/jpeg, image/png, application/pdf"
                  :remove="handleRemove"
                  :before-upload="beforeUpload"
                  :file-list="fileList"
                >
                  <p class="ant-upload-drag-icon">
                    <a-icon type="inbox" />
                  </p>
                  <p class="ant-upload-text">Click or drag file to this area to upload</p>
                  <p class="ant-upload-hint">Only types supported are png, jpeg and pdf files</p>
                </a-upload-dragger>
              </a-form-item>
            </div>
            <div class="col-12">
              <a-form-item>
                <button
                  type="button"
                  htmlType="submit"
                  class="btn btn-light px-5"
                  :disabled="!uploadPossible"
                  @click="handleUpload"
                >
                  <strong>Smelt</strong>
                </button>
              </a-form-item>
            </div>
          </div>
        </a-form>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import SmelterService from '../../../../services/smelterService'

export default {
  name: 'SmelterUploader',
  data() {
    return {
      fileList: [],
      form: this.$form.createForm(this),
      multiple: false,
      uploadPossible: false,
      documentData: {},
      image: '',
      blobData: '',
    }
  },
  computed: {
    fileType: function() {
      return this.fileList[0] ? this.fileList[0].type : null
    },
  },
  destroyed() {
    this.$store.dispatch('CLEAR_DOCUMENT')
  },
  methods: {
    handleChange(info) {
      const status = info.file.status
      if (status !== 'uploading') {
      }
      if (status === 'done') {
        this.$message.success(`${info.file.name} file uploaded successfully.`)
      } else if (status === 'error') {
        this.$message.error(`${info.file.name} file upload failed.`)
      }
    },
    handleRemove() {
      this.uploadPossible = false
      this.fileList = []
    },
    beforeUpload(file) {
      this.transformImage(file)
      this.fileList = [file]
      this.uploadPossible = true
      return false
    },
    transformImage(file) {
      if (file.type === 'image/png' || file.type === 'image/jpeg') {
        let reader = new FileReader()
        reader.onload = e => {
          this.image = e.target.result
          // To binary + image transform
          let binary = atob(this.image.split(',')[1])
          let array = []
          for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i))
          }
          this.blobData = new Blob([new Uint8Array(array)], {
            type: 'image/jpeg',
          })
        }
        reader.readAsDataURL(file)
      }
    },
    async handleUpload() {
      this.$nprogress.start()
      this.uploadPossible = !this.uploadPossible
      let response = null
      let data = null
      if (this.fileType === 'image/png' || this.fileType === 'image/jpeg') {
        response = await axios.get('/mappin-test')
        data = this.blobData
      } else if (this.fileType === 'application/pdf') {
        response = await axios.get('/dev_test')
        data = this.fileList[0]
      } else {
        this.handleRemove()
        return
      }
      // Parse the URL
      let parsedUrl = new URL(response.data.uploadURL)
      // Get the file name
      let filename = parsedUrl.pathname.split('/')[1]
      // Upload to S3
      await fetch(response.data.uploadURL, {
        method: 'PUT',
        body: data,
      })
      this.documentData = await this.postFilename(filename) // TODO: move this operation to store level
      this.$store.dispatch('UPDATE_DOCUMENT', this.documentData.data)
      this.$nprogress.done()
      this.$message.success('Document smelted successfully')
      this.uploadPossible = !this.uploadPossible
    },
    /**
     * Send the name of the file to Backend for it to pass it to Textract
     */
    async postFilename(fileName) {
      try {
        return await SmelterService.postSmelter(fileName)
      } catch (err) {
        this.error = err.message
        this.$message.error('Smeltor failed')
        console.log(err)
      }
    },
  },
}
</script>
