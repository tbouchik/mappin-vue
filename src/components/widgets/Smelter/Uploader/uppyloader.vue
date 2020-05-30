<template>
    <form>
        <div class="row">
            <div class="col-2"></div>
                <div class="card col-8">
                    <div class="card-body">
                        <div ref="dashboardContainer"></div>
                    </div>
                </div>
            <div class="col-2"></div>
        </div>
    </form>
</template>

<script>
import Uppy from '@uppy/core'
import Dashboard from '@uppy/dashboard'
import AwsS3Multipart from '@uppy/aws-s3-multipart'
import uuidv4 from 'uuid/v4'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import SmelterService from '../../../../services/smelterService'

export default {
  props: {
    maxFileSizeInBytes: {
      type: Number,
      required: true,
      default: 100000000,
    },
  },
  data() {
    return {
      files: [],
    }
  },
  mounted() {
    this.files = []
    this.instantiateUppy()
  },
  methods: {
    instantiateUppy() {
      this.uppy = Uppy({
        debug: true,
        autoProceed: false,
        restrictions: {
          maxFileSize: this.maxFileSizeInBytes,
          minNumberOfFiles: 1,
          maxNumberOfFiles: 100,
          allowedFileTypes: ['image/png', 'image/jpeg', 'application/pdf'],
        },
        onBeforeUpload: (files) => {
          // We’ll be careful to return a new object, not mutating the original `files`
          const updatedFiles = {}
          Object.keys(files).forEach(fileID => {
            let newName = uuidv4()
            let ext = files[fileID].extension
            updatedFiles[fileID] = {
              ...files[fileID],
              name: `${newName}.${ext}`,
            }
            updatedFiles[fileID].meta.name = `${newName}.${ext}`
            this.files.push({
              name: files[fileID].name,
              mimeType: files[fileID].type,
              alias: `${newName}.${ext}`,
              businessPurpose: files[fileID].meta.businessPurpose ? files[fileID].meta.businessPurpose : 'Not specified',
              extractionType: 'FORMS',
              metadata: {},
            })
          })
          return updatedFiles
        },
      })
        .use(
          AwsS3Multipart, {
            limit: 0,
            companionUrl: 'http://localhost:3000',
          }
        )
        .use(Dashboard, {
          hideUploadButton: false,
          inline: true,
          height: 450,
          target: this.$refs.dashboardContainer,
          replaceTargetContent: true,
          showProgressDetails: true,
          browserBackButtonClose: true,
          metaFields: [
            { id: 'name', name: 'Name', placeholder: 'File name' },
            { id: 'businessReason', name: 'Business tag', placeholder: 'Invoice, Bill, Balance Sheet...' },
          ],
        })
      this.uppy.on('complete', (event) => {
        SmelterService.postBulkSmelter(this.files).then(
          () => { this.$store.dispatch('FETCH_DOCUMENTS') }
        )
        this.files = []
        this.$store.dispatch('FETCH_DOCUMENTS')
      })
    },
    updatePreviewPath({ path }) {
      this.previewPath = path

      return this
    },
    resetUploader() {
      this.uppy.reset()
      this.disabled = true

      return this
    },
  },
}
</script>

<style scoped>
    .image-container {
        height: 150px;
        width: 150px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: auto;
        margin-left: auto;
    }

    .image-container > img {
        width: inherit;
        height: inherit;
    }
</style>
