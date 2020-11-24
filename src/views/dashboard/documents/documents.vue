<template>
  <div>
    <br />
    <div class="air__utils__heading">
      <b-row>
        <b-col md="3" class="my-1">
          <h5>Documents</h5>
        </b-col>
      </b-row>
    </div>
    <div class="card">
      <div v-if="!clientViz" class="card-header card-header-flex row">
        <div class="d-flex flex-column justify-content-center mr-auto col-4">
          <h5 class="mb-0">Your extractions</h5>
        </div>
        <div
          class="d-flex flex-column justify-content-center col-2"
          style="float: right"
        >
          <button
            type="button"
            class="btn btn-primary btn-with-addon mr-auto text-nowrap d-none d-md-block"
            @click="goToUpload"
          >
            <span class="btn-addon">
              <i class="btn-addon-icon fe fe-upload" />
            </span>
            Upload Documents
          </button>
        </div>
        <div class="d-flex flex-column justify-content-center col-2">
          <button
            type="button"
            class="btn btn-success btn-with-addon mr-auto text-nowrap d-none d-md-block"
            :disabled="everythingIsValidated"
            @click="() => goToValidation()"
          >
            <span v-if="!validatorIsLoading" class="btn-addon">
              <i class="btn-addon-icon fe fe-edit" />
            </span>
            <span v-if="validatorIsLoading" class="btn-addon" style>
              <i class="btn-addon-icon" >
                <div class="spinner-grow spinner-grow-sm text-light" role="status">
                <span class="sr-only">Loading...</span>
                </div>
              </i>
            </span>
            Validate Smelted
          </button>
        </div>

      </div>
      <div v-if="clientViz" class="card-header card-header-flex row">
        <div class="d-flex flex-column justify-content-center col-2">
          <button
            type="button"
            class="btn btn-success btn-with-addon mr-auto text-nowrap d-none d-md-block"
            :disabled="!documentsList.length"
            @click="() => bulkExportToCSV()"
          >
            <span class="btn-addon">
              <i class="btn-addon-icon fe fe-download-cloud" />
            </span>
            Bulk Download
          </button>
        </div>
      </div>
      <br />
      <div v-if="!clientViz" class="card-body">
        <a-collapse expand-icon-position="right" style="background: #eef3fc">
          <a-collapse-panel key="1" header="Filter Settings">
            <br>
            <a-form
              :form="form"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 12 }"
            >
              <a-form-item label="Name">
                <a-input
                  placeholder="Type the Document's name"
                  v-model="searchedName"
                />
              </a-form-item>
              <a-form-item label="Template">
                <a-select
                  v-model="searchedTemplate"
                  placeholder="Select a Template"
                >
                  <template v-for="(template, index) in filters">
                    <a-select-option :key="index" :value="template._id"> {{template.name}} </a-select-option>
                  </template>
                </a-select>
              </a-form-item>
              <a-form-item label="Status">
                <a-select
                  v-model="searchedStatus"
                  placeholder="Select a Status"
                >
                  <template>
                    <a-select-option value="pending"> Pending </a-select-option>
                    <a-select-option value="smelted"> Smelted </a-select-option>
                    <a-select-option value="validated"> Validated </a-select-option>
                  </template>
                </a-select>
              </a-form-item>
              <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
                <a-button type="primary" @click="resetFilterSettings" ghost> Reset Settings </a-button>
              </a-form-item>
            </a-form>
            <a-icon slot="extra" type="filter" />
          </a-collapse-panel>
        </a-collapse>
      </div>
      <div class="card-body">
        <div class="air__utils__scrollTable">
          <a-table
            :data-source="documentsList"
            :columns="columns"
            :pagination="tablePagination"
            :loading="loading"
            @change="handleTableChange"
          >
            <a-icon
              slot="filterIcon"
              slot-scope="filtered"
              type="search"
              :style="{ color: filtered ? '#108ee9' : undefined }"
            />
            <template slot="customRenderComposed" slot-scope="text">
              <template>{{ text.name }}</template>
            </template>
            <span slot="date" slot-scope="text">{{ text | timestamp }}</span>
            <span slot="status" slot-scope="text">
              <a-tag
                :key="text"
                :color="
                  text === 'pending'
                    ? 'volcano'
                    : text === 'smelted'
                    ? 'geekblue'
                    : 'green'
                "
              >
                {{ text.toUpperCase() }}
              </a-tag>
            </span>
            <span slot="action" slot-scope="record">
              <button
                @click="view(record)"
                :disabled="record.status === 'pending'"
                class="btn btn-sm btn-light mr-2"
              >
                <i class="fe fe-edit mr-2" />
                View
              </button>
              <button @click="remove(record)" class="btn btn-sm btn-light">
                <small>
                  <i class="fe fe-trash mr-2" />
                </small>
                Remove
              </button>
            </span>
          </a-table>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import JSZip from 'jszip'
import { pick, isEqual } from 'lodash'
import DocumentService from '../../../services/documentService'

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    scopedSlots: {
      customRender: 'customRender',
    },
  },
  {
    title: 'Template',
    dataIndex: 'filter',
    scopedSlots: {
      customRender: 'customRenderComposed',
    },
  },
  {
    title: 'Client',
    dataIndex: 'client',
    scopedSlots: {
      customRender: 'customRenderComposed',
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    scopedSlots: {
      customRender: 'status',
    },
    onFilter: (value, record) => console.log(value),
  },
  {
    title: 'Date Added',
    dataIndex: 'date',
    scopedSlots: { customRender: 'date' },
  },
  {
    title: 'Action',
    scopedSlots: { customRender: 'action' },
  },
]
export default {
  name: 'Documents',
  data: function () {
    return {
      documentsList: [],
      form: this.$form.createForm(this, { name: 'filter_form' }),
      columns: columns,
      timeInterval: null,
      searchedName: null,
      searchedStatus: null,
      searchedTemplate: null,
      loading: false,
      validatorIsLoading: false,
      limit: 10,
      page: 1,
      total: 10,
    }
  },
  props: {
    clientId: {
      type: String,
      required: false,
    },
  },
  watch: {
    searchedName: function() {
      this.loading = true
      this.validatorIsLoading = true
      DocumentService.fetchDocuments(this.queryParams)
        .then(documentsList => {
          console.log('number: searchedName')

          this.page = 1

          this.documentsList = documentsList.map((item, index) => { // TODO: Implement these properties in DB
            item.date = item.createdAt
            item.key = index
            return item
          })
          this.$store.dispatch('ACTION_UPDATE_DOCUMENTS_LIST', { documentsList, queryParams: this.queryParams })
          this.loading = false
        })
      DocumentService.fetchDocumentsCount({
        name: this.searchedName,
        filter: this.searchedTemplate,
        status: this.searchedStatus,
      })
        .then(data => {
          this.total = data.count
          this.$store.dispatch('ACTION_UPDATE_TOTAL_DOC_COUNT', this.total)
        })
      DocumentService.fetchNextSmeltedDocuments(this.queryParams)
        .then(idsArray => {
          this.$store.dispatch('ACTION_CACHE_SMELTED_IDS', { idsArray,
            concat: false })
          this.validatorIsLoading = false
        })
    },
    searchedStatus: function() {
      this.loading = true
      this.validatorIsLoading = true
      DocumentService.fetchDocuments(this.queryParams)
        .then(documentsList => {
          console.log('number: searchedStatus')
          this.page = 1

          this.documentsList = documentsList.map((item, index) => { // TODO: Implement these properties in DB
            item.date = item.createdAt
            item.key = index
            return item
          })
          this.$store.dispatch('ACTION_UPDATE_DOCUMENTS_LIST', { documentsList, queryParams: this.queryParams })
          this.loading = false
        })
      DocumentService.fetchDocumentsCount({
        name: this.searchedName,
        filter: this.searchedTemplate,
        status: this.searchedStatus,
      })
        .then(data => {
          this.total = data.count
          this.$store.dispatch('ACTION_UPDATE_TOTAL_DOC_COUNT', this.total)
        })
      DocumentService.fetchNextSmeltedDocuments(this.queryParams)
        .then(idsArray => {
          this.$store.dispatch('ACTION_CACHE_SMELTED_IDS', { idsArray,
            concat: false })
          this.validatorIsLoading = false
        })
    },
    searchedTemplate: function() {
      this.loading = true
      this.validatorIsLoading = true
      DocumentService.fetchDocuments(this.queryParams)
        .then(documentsList => {
          console.log('number: searchedTemplate',)
          this.page = 1
          this.documentsList = documentsList.map((item, index) => { // TODO: Implement these properties in DB
            item.date = item.createdAt
            item.key = index
            return item
          })
          this.$store.dispatch('ACTION_UPDATE_DOCUMENTS_LIST', { documentsList, queryParams: this.queryParams })
          this.loading = false
        })
      DocumentService.fetchDocumentsCount(pick(this.queryParams, ['name', 'filter', 'status']))
        .then(data => {
          this.total = data.count
          this.$store.dispatch('ACTION_UPDATE_TOTAL_DOC_COUNT', this.total)
        })
      DocumentService.fetchNextSmeltedDocuments(this.queryParams)
        .then(idsArray => {
          this.$store.dispatch('ACTION_CACHE_SMELTED_IDS', { idsArray,
            concat: false })
          this.validatorIsLoading = false
        })
    },
  },
  computed: {
    ...mapGetters([
      'smeltedIdList',
      'filters',
      'docSmeltedCache',
    ]),
    everythingIsValidated: function () {
      return this.docSmeltedCache.length === 0
    },
    clientViz: function () {
      return this.clientId !== undefined && this.clientId !== null
    },
    queryParams: function () {
      return {
        client: this.clientId,
        limit: this.limit,
        page: this.page,
        name: this.searchedName,
        filter: this.searchedTemplate,
        status: this.searchedStatus,
      }
    },
    tablePagination: function () {
      return {
        limit: this.limit,
        page: this.page,
        total: this.total,
      }
    },
  },
  created() {
    if (this.clientId) {
      this.loading = true
      const queryParams = pick(this.queryParams, ['client', 'limit', 'page'])
      DocumentService.fetchDocuments(queryParams)
        .then(documentsList => {
          console.log('number: @created inside first "if"')
          this.documentsList = documentsList.map((item, index) => { // TODO: Implement these properties in DB
            item.date = item.createdAt
            item.key = index
            return item
          })
          this.$store.dispatch('ACTION_UPDATE_DOCUMENTS_LIST', { documentsList, queryParams })
          this.loading = false
        })
      DocumentService.fetchDocumentsCount({
        client: this.clientId,
      })
        .then(data => {
          this.total = data.count
          this.$store.dispatch('ACTION_UPDATE_TOTAL_DOC_COUNT', this.total)
        })
    } else {
      this.loading = true
      this.validatorIsLoading = true
      const queryParams = pick(this.queryParams, ['client', 'limit', 'page'])
      DocumentService.fetchDocuments(queryParams)
        .then(documentsList => {
          console.log('number: @created inside first "else" ',)
          this.documentsList = documentsList.map((item, index) => { // TODO: Implement these properties in DB
            item.date = item.createdAt
            item.key = index
            return item
          })
          this.$store.dispatch('ACTION_UPDATE_DOCUMENTS_LIST', { documentsList, queryParams })
          this.loading = false
        })
      DocumentService.fetchDocumentsCount({})
        .then(data => {
          this.total = data.count
        })
      // this.$store.dispatch('ACTION_FETCH_COUNT_DOCUMENTS', {})
      this.timeInterval = setInterval(() => {
        const paramsUsedInQuery = Object.assign({}, this.queryParams)
        DocumentService.fetchDocuments(paramsUsedInQuery)
          .then(documentsList => {
            console.log('set Interval is goinnnnnn to ....')
            if (isEqual(paramsUsedInQuery, this.queryParams)) {
              console.log('DOOOONE: number: Time interval')
              this.documentsList = documentsList.map((item, index) => { // TODO: Implement these properties in DB
                item.date = item.createdAt
                item.key = index
                return item
              })
              this.$store.dispatch('ACTION_UPDATE_DOCUMENTS_LIST', { documentsList, queryParams: paramsUsedInQuery })
            }
          })
      }, 10000)
      this.$store.dispatch('ACTION_FETCH_FILTERS')
    }
    DocumentService.fetchNextSmeltedDocuments(this.queryParams)
      .then(idsArray => {
        this.$store.dispatch('ACTION_CACHE_SMELTED_IDS', { idsArray,
          concat: false })
        this.validatorIsLoading = false
      })
  },
  destroyed() {
    if (!this.clientId) {
      clearInterval(this.timeInterval)
    }
  },
  methods: {
    handleSearch(selectedKeys, confirm, dataIndex) {
      confirm()
      this.searchText = selectedKeys[0]
      this.searchedTemplate = dataIndex
    },
    handleReset(clearFilters) {
      clearFilters()
      this.searchText = ''
    },
    view(record) {
      this.$router.push({ name: 'viewer', params: { documentId: record.id } })
    },
    remove(record) {
      this.$nprogress.start()
      this.$store.dispatch('REMOVE_DOCUMENT', record.id)
      this.$nprogress.done()
    },
    goToValidation() {
      this.$router.push({
        name: 'viewer',
        params: { documentId: this.smeltedIdList[0], smeltedValidation: true },
      })
    },
    goToUpload() {
      this.$router.push({ name: 'upload' })
    },
    bulkExportToCSV() {
      let zip = JSZip()
      this.documentsList.map((document, idx) => {
        let documentCsvContent = ''
        let arrData = ['Key;Value']
        document.osmium.map((item) => {
          arrData.push(Object.values(pick(item, ['Key', 'Value'])).join(';'))
        })
        documentCsvContent += arrData.join('\n').replace(/(^\[)|(\]$)/gm, '')
        zip.file(`${document.name}-${idx}.csv`, documentCsvContent)
      })
      zip
        .generateAsync({
          type: 'base64',
        })
        .then(function (content) {
          window.location.href = 'data:application/zip;base64,' + content
        })
    },
    handleTableChange(pagination, filters, sorter) {
      console.log(pagination, filters, sorter)
      this.limit = pagination.pageSize
      this.page = pagination.current
      this.loading = true
      DocumentService.fetchDocuments(this.queryParams)
        .then(documentsList => {
          console.log('number: HANDLE TABLE CHANGE')
          this.documentsList = documentsList.map((item, index) => { // TODO: Implement these properties in DB
            item.date = item.createdAt
            item.key = index
            return item
          })
          this.$store.dispatch('ACTION_UPDATE_DOCUMENTS_LIST', { documentsList, queryParams: this.queryParams })
          this.loading = false
        })
      DocumentService.fetchDocumentsCount(pick(this.queryParams, ['client', 'name', 'filter', 'status']))
        .then(data => {
          this.total = data.count
        })
    },
    resetFilterSettings() {
      this.searchedName = ''
      this.searchedStatus = null
      this.searchedTemplate = null
    },
  },
}
</script>
<style scoped>
.custom-filter-dropdown {
  padding: 8px;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.highlight {
  background-color: rgb(255, 192, 105);
  padding: 0px;
}
</style>
