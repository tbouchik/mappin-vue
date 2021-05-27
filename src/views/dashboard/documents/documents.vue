<template>
  <div>
    <br />
    <div class="air__utils__heading">
      <b-row>
        <b-col md="3" class="my-1">
          <h5 v-if="isBankViz">{{ $t('dashboard.document.bankTitle') }}</h5>
          <h5 v-else>{{ $t('dashboard.document.invoiceTitle') }}</h5>
        </b-col>
      </b-row>
    </div>
    <div class="card">
      <div v-if="!clientViz && !isArchiveViz" class="card-header card-header-flex row">
        <div class="d-flex flex-column justify-content-center mr-auto col-4">
          <h5 class="mb-0">{{ $t('dashboard.document.extractions') }}</h5>
        </div>
        <div class="d-flex flex-column justify-content-center">
          <button class="btn btn-primary btn-with-addon"
                  @click="goToUpload"
          >
            <span class="btn-addon">
              <i class="btn-addon-icon fe fe-upload" />
            </span>
            {{ $t('dashboard.document.upload') }}
          </button>
        </div>
        &nbsp;	&nbsp;
        <div class="d-flex flex-column justify-content-center">
          <button class="btn btn-success btn-with-addon"
                  :disabled="everythingIsValidated"

            @click="goToValidation"
          >
           <span v-if="!validatorIsLoading" class="btn-addon">
              <i class="btn-addon-icon fe fe-edit" />
            </span>
            <span v-if="validatorIsLoading" class="btn-addon" style>
              <i class="btn-addon-icon" >
                <div class="spinner-grow spinner-grow-sm text-light" role="status">
                <span class="sr-only">{{ $t('dashboard.document.loading') }}</span>
                </div>
              </i>
            </span>
            {{ $t('dashboard.document.validate') }}
          </button>
        </div>

      </div>
      <div v-if="clientViz" class="card-header card-header-flex row">
        <div class="d-flex flex-column justify-content-center col-2">
          <button
            type="button"
            class="btn btn-success btn-with-addon mr-auto text-nowrap d-none d-md-block"
            :disabled="!documentsList.length||bulkCsvExportIsLoading"
            @click="() => bulkExportToCSV()"
          >
            <span v-if="!bulkCsvExportIsLoading" class="btn-addon">
              <i class="btn-addon-icon fe fe-download-cloud" />
            </span>
            <span v-if="bulkCsvExportIsLoading" class="btn-addon" style>
              <i class="btn-addon-icon" >
                <div class="spinner-grow spinner-grow-sm text-light" role="status">
                <span class="sr-only">{{ $t('dashboard.document.loading') }}</span>
                </div>
              </i>
            </span>
            {{ $t('dashboard.document.bulkDownload') }}
          </button>
        </div>
      </div>
      <br />
      <div v-if="!clientViz" class="card-body">
        <a-collapse expand-icon-position="right" style="background: #eef3fc">
          <a-collapse-panel key="1" :header=" $t('dashboard.document.filterSettings') ">
            <br>
            <a-form
              :form="form"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 12 }"
            >
              <a-form-item :label="$t('dashboard.document.name')">
                <a-input
                  :placeholder="$t('dashboard.document.placeholder.name')"
                  v-model="searchedName"
                />
              </a-form-item>
              <a-form-item :label="$t('dashboard.document.template')">
                <a-select
                  v-model="searchedTemplate"
                  :placeholder="$t('dashboard.document.placeholder.template')"
                >
                  <template v-for="(template, index) in filters">
                    <a-select-option :key="index" :value="template._id"> {{template.name}} </a-select-option>
                  </template>
                </a-select>
              </a-form-item>
              <a-form-item v-if="isArchiveViz !== true" :label="$t('dashboard.document.status')">
                <a-select
                  v-model="searchedStatus"
                  :placeholder="$t('dashboard.document.placeholder.status')"
                >
                  <template>
                    <a-select-option value="pending"> {{ $t('dashboard.document.states.pending') }} </a-select-option>
                    <a-select-option value="smelted"> {{ $t('dashboard.document.states.smelted') }} </a-select-option>
                    <a-select-option value="validated"> {{ $t('dashboard.document.states.validated') }} </a-select-option>
                  </template>
                </a-select>
              </a-form-item>
              <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
                <a-button type="primary" @click="resetFilterSettings" ghost> {{ $t('dashboard.document.resetSettings') }} </a-button>
              </a-form-item>
            </a-form>
            <a-icon slot="extra" type="filter" />
          </a-collapse-panel>
        </a-collapse>
      </div>
      <div class="card-body">
        <div class="air__utils__scrollTable">
          <div style="margin-bottom: 16px">
            <a-dropdown  :disabled="!hasSelectedDocuments">
              <a-button>Actions</a-button>
              <a-menu slot="overlay">
                <a-menu-item @click="validateSelected" v-if="!isArchiveViz">
                  <div>Valider</div>
                </a-menu-item>
                <a-menu-item @click="archiveSelected">
                  <div>{{archiveOption}}</div>
                </a-menu-item>
                <a-menu-item @click="deleteSelected">
                  <div>Supprimer</div>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </div>
          <a-table
            :row-selection="{ selectedRowKeys: selectedDocuments, onChange: onSelectChange }"
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
                :color="getColor(text)"
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
                {{ $t('dashboard.document.view') }}
              </button>
              <button @click="showSingleDeleteModal(record)"
                       class="btn btn-sm btn-light">
                <small>
                  <i class="fe fe-trash mr-2" />
                </small>
                {{ $t('dashboard.document.remove') }}
              </button>
            </span>
          </a-table>
        </div>
      </div>
    </div>
    <a-modal
      :title=" $t('dashboard.document.modal.deleteSingleTitle')"
      :visible="singleDeletionModalVisible"
      :confirm-loading="confirmLoading"
      okType="danger"
      @ok="handleDeleteSingleDoc"
      @cancel="handleCancelAction"
    >
      <p>{{ singleDeletionMessage }}</p>
    </a-modal>
    <a-modal
      :title="$t('dashboard.document.modal.deleteBulkTitle')"
      :visible="bulkDeletionModalVisible"
      :confirm-loading="confirmLoading"
      okType="danger"
      @ok="handleBulkDeleteDoc"
      @cancel="handleCancelAction"
    >
      <p>{{ modalMessage }}</p>
    </a-modal>
    <a-modal
      :title="$t('dashboard.document.modal.archiveBulk')"
      :visible="bulkArchiveModalVisible"
      :confirm-loading="confirmLoading"
      okType="success"
      @ok="handleBulkArchiveDoc"
      @cancel="handleCancelAction"
    >
      <p>{{ modalMessage }}</p>
    </a-modal>
    <a-modal
      :title="$t('dashboard.document.modal.validateBulk')"
      :visible="bulkValidateModalVisible"
      :confirm-loading="confirmLoading"
      okType="success"
      @ok="handleBulkValidateDoc"
      @cancel="handleCancelAction"
    >
      <p>{{ modalMessage }}</p>
    </a-modal>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import JSZip from 'jszip'
import { pick, isEqual, cloneDeep } from 'lodash'
import DocumentService from '../../../services/documentService'
import { invoiceColumns, bankColumns } from './columns'

export default {
  name: 'Documents',
  data: function () {
    return {
      documentsList: [],
      form: this.$form.createForm(this, { name: 'filter_form' }),
      timeInterval: null,
      searchedName: null,
      searchedStatus: null,
      searchedTemplate: null,
      loading: false,
      validatorIsLoading: false,
      confirmLoading: false,
      singleDeletionModalVisible: false,
      bulkDeletionModalVisible: false,
      bulkArchiveModalVisible: false,
      bulkValidateModalVisible: false,
      currentDeletableId: null,
      bulkCsvExportIsLoading: false,
      singleDeletionMessage: '',
      modalMessage: '',
      selectedDocuments: [],
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
    isArchiveViz: {
      type: Boolean,
      required: false,
      default: false,
    },
    isBankViz: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  watch: {
    searchedName: function() {
      this.fetchDocuments()
    },
    searchedStatus: function() {
      this.fetchDocuments()
    },
    searchedTemplate: function() {
      this.fetchDocuments()
    },
    page: function() {
      this.selectedDocuments = []
    },
  },
  computed: {
    ...mapGetters([
      'smeltedIdList',
      'filters',
      'docSmeltedCache',
    ]),
    hasSelectedDocuments() {
      return this.selectedDocuments.length > 0
    },
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
        isArchived: this.isArchiveViz,
        isBankStatement: this.isBankViz,
      }
    },
    tablePagination: function () {
      return {
        limit: this.limit,
        page: this.page,
        total: this.total,
      }
    },
    archiveOption: function() {
      return this.isArchiveViz ? 'Désarchiver' : 'Archiver'
    },
    columns: function() {
      if (this.isBankViz) {
        return this.setColumns(bankColumns)
      }
      return this.setColumns(invoiceColumns)
    },
  },
  created() {
    this.fetchDocumentsOnCreated(this.clientId)
    if (!this.clientId) {
      this.validatorIsLoading = true
      this.setRegularDocumentFetching()
      this.validatorIsLoading = false
      this.$store.dispatch('ACTION_FETCH_FILTERS', {})
    }
  },
  destroyed() {
    this.destroyPolling()
  },
  methods: {
    setColumns(baseColumns) {
      return baseColumns.map((x) => {
        let result = {
          title: this.$t(x.title),
          dataIndex: x.dataIndex,
        }
        if (x.customRender) {
          result.scopedSlots = { customRender: x.customRender }
        }
        return result
      })
    },
    onSelectChange(selectedDocuments) {
      this.selectedDocuments = selectedDocuments
    },
    setRegularDocumentFetching() {
      this.timeInterval = setInterval(() => {
        const paramsUsedInQuery = Object.assign({}, this.queryParams)
        DocumentService.fetchDocuments(paramsUsedInQuery)
          .then(documentsList => {
            // console.log('set Interval is goinnnnnn to ....')
            if (isEqual(paramsUsedInQuery, this.queryParams)) {
              // console.log('DOOOONE: number: Time interval')
              this.documentsList = documentsList.map((item, index) => { // TODO: Implement these properties in DB
                item.date = item.createdAt
                item.key = index
                return item
              })
              this.$store.dispatch('ACTION_UPDATE_DOCUMENTS_LIST', { documentsList, queryParams: paramsUsedInQuery })
            }
          })
        DocumentService.fetchNextSmeltedDocuments(this.queryParams)
          .then(idsArray => {
            this.$store.dispatch('ACTION_CACHE_SMELTED_IDS', { idsArray,
              concat: false })
            this.validatorIsLoading = false
          })
      }, 10000)
      DocumentService.fetchDocumentsCount(pick(this.queryParams, ['name', 'filter', 'status', 'isArchived', 'isBankStatement']))
        .then(data => {
          this.total = data.count
          this.$store.dispatch('ACTION_UPDATE_TOTAL_DOC_COUNT', this.total)
        })
    },
    fetchDocumentsOnCreated(clientId) {
      this.loading = true
      const queryParams = pick(this.queryParams, ['client', 'limit', 'page', 'isArchived', 'isBankStatement'])
      DocumentService.fetchDocuments(queryParams)
        .then(documentsList => {
          this.documentsList = documentsList.map((item, index) => { // TODO: Implement these properties in DB
            item.date = item.createdAt
            item.key = index
            return item
          })
          this.$store.dispatch('ACTION_UPDATE_DOCUMENTS_LIST', { documentsList, queryParams })
          this.loading = false
        })
      DocumentService.fetchDocumentsCount(clientId ? { client: this.clientId } : {})
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
    fetchDocuments() {
      this.loading = true
      this.validatorIsLoading = true
      DocumentService.fetchDocuments(this.queryParams)
        .then(documentsList => {
          this.page = this.queryParams.page || 1
          this.documentsList = documentsList.map((item, index) => { // TODO: Implement these properties in DB
            item.date = item.createdAt
            item.key = index
            return item
          })
          this.$store.dispatch('ACTION_UPDATE_DOCUMENTS_LIST', { documentsList, queryParams: this.queryParams })
          this.loading = false
        })
      DocumentService.fetchDocumentsCount(pick(this.queryParams, ['name', 'filter', 'status', 'isArchived', 'isBankStatement']))
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
      if (this.isBankViz) {
        this.bulkExportBankStatementsToCSV()
      } else {
        this.bulkExportInvoicesToCSV()
      }
    },
    bulkExportInvoicesToCSV() {
      this.bulkCsvExportIsLoading = true
      let zip = JSZip()
      let downloadQueryParams = cloneDeep(this.queryParams)
      DocumentService.bulkExportCSV(downloadQueryParams)
        .then((templateAggregates) => {
          templateAggregates.map((templateAggregate) => {
            let templateCsvContent = ''
            let arrData = []
            arrData.push(templateAggregate.header.join(';'))
            templateAggregate.osmiums.map((osmiumEntries) => {
              osmiumEntries.map(osmiumEntry => {
                arrData.push(osmiumEntry.join(';'))
              })
            })
            templateCsvContent += arrData.join('\n').replace(/(^\[)|(\]$)/gm, '')
            zip.file(`${templateAggregate.template}.csv`, templateCsvContent)
            this.bulkCsvExportIsLoading = false
          })
          zip
            .generateAsync({
              type: 'base64',
            })
            .then(function (content) {
              window.location.href = 'data:application/zip;base64,' + content
            })
        })
    },
    bulkExportBankStatementsToCSV() {
      this.bulkCsvExportIsLoading = true
      let zip = JSZip()
      let downloadQueryParams = cloneDeep(this.queryParams)
      DocumentService.bulkBankExportCSV(downloadQueryParams)
        .then((docsData) => {
          docsData.map((docData) => {
            let templateCsvContent = ''
            let arrData = []
            arrData.push(docData.header.join(';'))
            docData.content.map((entrySegments) => {
              arrData.push(entrySegments.join(';'))
            })
            templateCsvContent += arrData.join('\n').replace(/(^\[)|(\]$)/gm, '')
            zip.file(`${docData.title}.csv`, templateCsvContent)
            this.bulkCsvExportIsLoading = false
          })
          zip
            .generateAsync({
              type: 'base64',
            })
            .then(function (content) {
              window.location.href = 'data:application/zip;base64,' + content
            })
        })
    },
    handleTableChange(pagination, filters, sorter) {
      this.limit = pagination.pageSize
      this.page = pagination.current
      this.loading = true
      DocumentService.fetchDocuments(this.queryParams)
        .then(documentsList => {
          // console.log('number: HANDLE TABLE CHANGE')
          this.documentsList = documentsList.map((item, index) => { // TODO: Implement these properties in DB
            item.date = item.createdAt
            item.key = index
            return item
          })
          this.$store.dispatch('ACTION_UPDATE_DOCUMENTS_LIST', { documentsList, queryParams: this.queryParams })
          this.loading = false
        })
      DocumentService.fetchDocumentsCount(pick(this.queryParams, ['client', 'name', 'filter', 'status', 'isArchived', 'isBankStatement']))
        .then(data => {
          this.total = data.count
        })
    },
    resetFilterSettings() {
      this.searchedName = ''
      this.searchedStatus = null
      this.searchedTemplate = null
    },
    showSingleDeleteModal(e) {
      this.currentDeletableId = e.id
      this.singleDeletionMessage = `${this.$t('dashboard.document.modal.askSingleDelete')} ${e.name}`
      this.singleDeletionModalVisible = true
    },
    handleDeleteSingleDoc() {
      this.ModalText = this.$t('dashboard.document.modal.singleDeleteLoading')
      this.confirmLoading = true
      DocumentService.deleteDocument(this.currentDeletableId)
        .then(id => {
          if (this.currentDeletableId) {
            this.documentsList = this.documentsList.filter(item => item.id !== this.currentDeletableId)
            this.$store.dispatch('REMOVE_DOCUMENT', id)
          }
          this.confirmLoading = false
          this.singleDeletionModalVisible = false
        })
    },
    deleteSelected() {
      this.modalMessage = `${this.$t('dashboard.document.modal.askBulkDelete')} ${this.selectedDocuments.length} \n ${this.$t('dashboard.document.modal.irreversibleAction')}`
      this.bulkDeletionModalVisible = true
    },
    handleBulkDeleteDoc() {
      this.ModalText = this.$t('dashboard.document.modal.singleDeleteLoading')
      this.confirmLoading = true
      const idsArray = this.selectedDocuments.map(i => this.documentsList[i].id)
      DocumentService.deleteMany(idsArray)
        .then(() => {
          this.fetchDocuments()
          this.confirmLoading = false
          this.bulkDeletionModalVisible = false
          this.selectedDocuments = []
        })
    },
    archiveSelected() {
      const archive = `${this.$t('dashboard.document.modal.askBulkArchive')} ${this.selectedDocuments.length}`
      const dearchive = `${this.$t('dashboard.document.modal.askBulkDearchive')} ${this.selectedDocuments.length}`
      this.modalMessage = this.isArchiveViz ? dearchive : archive
      this.bulkArchiveModalVisible = true
    },
    handleBulkArchiveDoc() {
      this.ModalText = this.$t('dashboard.document.modal.archiveLoading')
      this.confirmLoading = true
      const idsArray = this.selectedDocuments.map(i => this.documentsList[i].id)
      const archiveBody = this.isArchiveViz ? { isArchived: false, status: 'validated' } : { isArchived: true, status: 'archived' }
      DocumentService.updateMany(idsArray, { ...archiveBody })
        .then(() => {
          this.fetchDocuments()
          this.confirmLoading = false
          this.bulkArchiveModalVisible = false
          this.selectedDocuments = []
        })
    },
    validateSelected() {
      this.modalMessage = `${this.$t('dashboard.document.modal.askBulkValidate')} ${this.selectedDocuments.length}`
      this.bulkValidateModalVisible = true
    },
    handleBulkValidateDoc() {
      this.ModalText = this.$t('dashboard.document.modal.validateLoading')
      this.confirmLoading = true
      const idsArray = this.selectedDocuments.map(i => this.documentsList[i].id)
      DocumentService.updateMany(idsArray, { status: 'validated' })
        .then(() => {
          this.fetchDocuments()
          this.confirmLoading = false
          this.bulkValidateModalVisible = false
          this.selectedDocuments = []
        })
    },
    handleCancelAction () {
      this.singleDeletionModalVisible = false
      this.bulkDeletionModalVisible = false
      this.bulkArchiveModalVisible = false
      this.bulkValidateModalVisible = false
      this.confirmLoading = false
      this.modalMessage = ''
    },
    getColor(status) {
      switch (status) {
        case 'pending':
          return 'orange'
        case 'smelted':
          return 'geekblue'
        case 'validated':
          return 'green'
        case 'archived':
          return 'grey'
        case 'error':
          return 'red'
      }
    },
    destroyPolling() {
      if (!this.clientId) {
        clearInterval(this.timeInterval)
      }
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
