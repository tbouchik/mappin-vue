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
                  @click="showDrawer"
          >
            <span class="btn-addon">
              <i class="btn-addon-icon fe fe-filter" />
            </span>
            Filtrer
          </button>
        </div>
      </div>
      <div v-else-if="clientViz" class="card-header card-header-flex row">
        <div class="d-flex flex-column justify-content-center mr-auto col-4">
          <h5 class="mb-0">{{ $t('dashboard.document.extractions') }}</h5>
        </div>
        <div class="d-flex flex-column justify-content-center">
          <button class="btn btn-primary btn-with-addon"
                  @click="showDrawer"
          >
            <span class="btn-addon">
              <i class="btn-addon-icon fe fe-filter" />
            </span>
            {{$t('dashboard.document.filterSettings') }}
          </button>
        </div>
        &nbsp;	&nbsp;
        <div class="d-flex flex-column justify-content-center">
          <button class="btn btn-success btn-with-addon"
                  v-if="userIsAdmin"
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
      <div class="card-body">
        <a-drawer
          :title="$t('dashboard.document.filterSettings')"
          :width="720"
          :visible="visible"
          :body-style="{ paddingBottom: '80px' }"
          @close="onDrawerClose"
        >
      <a-form :form="form" layout="vertical" hide-required-mark>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Nom de fichier">
              <a-input v-decorator="[
                  'searchedName',
                  {
                    rules: [{ required: false, message: 'Choisissez la relation d\'ordre' }],
                  },
                ]"
                  @input="e => debounceFilterSearchedItem(e, 'name')" placeholder="Entrez le nom du fichier"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
              <a-form-item label="Fournisseur" v-if="!isBankViz">
                <a-select
                  show-search
                  :value="searchedVendor"
                  placeholder="Entrez le nom du Fournisseur"
                  :default-active-first-option="false"
                  :show-arrow="false"
                  :filter-option="false"
                  :not-found-content="null"
                  @search="handleVendorSearch"
                  @change="handleVendorSelect"
                >
                  <a-select-option v-for="vd in suggestedVendors" :key="vd.id">
                    {{ vd.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="Nom de la Banque" v-else>
                <a-input
                v-decorator="[
                  'searchedBankEntity',
                  {
                    rules: [{ required: false, message: 'Entrez le nom du banque' }],
                  },
                ]"
                @input="e => debounceFilterSearchedItem(e, 'bankEntity')" placeholder="Entrez le nom du banque"/>
              </a-form-item>
            </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Référence">
              <a-input v-decorator="[
                  'searchedRef',
                  {
                    rules: [{ required: false, message: 'Entrez la référence de la facture/avoir' }],
                  },
                ]"
                  @input="e => debounceFilterSearchedItem(e, 'ref')" placeholder="Entrez la référence"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12" v-if="!isBankViz">
            <a-form-item :label="$t('dashboard.document.template')" >
                <a-select
                  @change="e => handleFilterDropdownChange(e, 'template')"
                  v-decorator="[
                  'searchedTemplate',
                  {
                    rules: [{ required: false, message: 'Choisissez la relation d\'ordre' }],
                  },
                ]"
                  :placeholder="$t('dashboard.document.placeholder.template')"
                >
                  <template v-for="(template, index) in filters">
                    <a-select-option :key="index" :value="template._id"> {{template.name}} </a-select-option>
                  </template>
                </a-select>
              </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :span="12" v-if="isArchiveViz !== true" :label="$t('dashboard.document.status')">
                <a-select
                  @change="e => handleFilterDropdownChange(e, 'status')"
                  v-decorator="[
                  'searchedStatus',
                  {
                    rules: [{ required: false, message: 'Choisissez la relation d\'ordre' }],
                  },
                ]"
                  :placeholder="$t('dashboard.document.placeholder.status')"
                >
                  <template>
                    <a-select-option value="pending"> {{ $t('dashboard.document.states.pending') }} </a-select-option>
                    <a-select-option value="smelted"> {{ $t('dashboard.document.states.smelted') }} </a-select-option>
                    <a-select-option value="validated"> {{ $t('dashboard.document.states.validated') }} </a-select-option>
                  </template>
                </a-select>
              </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16" v-if="!isBankViz">
          <a-col :span="12">
            <a-form-item label="TVA">
              <a-input
                v-decorator="[
                'searchedVat',
                  {
                    rules: [{ required: false, message: 'Entrez le montant de TVA' }],
                  },
                ]"
                placeholder="Entrez le montant de TVA"
                @input="e => debounceFilterSearchedItem(e, 'vat')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Operation">
              <a-select
                v-decorator="[
                  'vatOperator',
                  {
                    rules: [{ required: false, message: 'Choisissez la relation d\'ordre' }],
                  },
                ]"
                placeholder="Choisissez la relation d'ordre"
                @change="e => handleFilterDropdownChange(e, 'vat')"
              >
                <a-select-option value="gt">
                  Supérieur à
                </a-select-option>
                <a-select-option value="lt">
                  Inférieur à
                </a-select-option>
                <a-select-option value="eq">
                  Égale à
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16" v-if="!isBankViz">
          <a-col :span="12">
            <a-form-item label="Total HT">
              <a-input
                v-decorator="[
                'searchedTotalHt',
                  {
                    rules: [{ required: false, message: 'Entrez le montant Hors Taxes' }],
                  },
                ]"
                placeholder="Entrez le montant Hors Taxes"
                @input="e => debounceFilterSearchedItem(e, 'totalHt')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Operation">
              <a-select
                v-decorator="[
                  'totalHtOperator',
                  {
                    rules: [{ required: false, message: 'Choisissez la relation d\'ordre' }],
                  },
                ]"
                placeholder="Choisissez la relation d'ordre"
                @change="e => handleFilterDropdownChange(e, 'hto')"
              >
                <a-select-option value="gt">
                  Supérieur à
                </a-select-option>
                <a-select-option value="lt">
                  Inférieur à
                </a-select-option>
                <a-select-option value="eq">
                  Égale à
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          </a-row>
          <a-row :gutter="16" v-if="!isBankViz">
          <a-col :span="12">
            <a-form-item label="Total TTC">
              <a-input
                v-decorator="[
                  'searchedTotalTtc',
                  {
                    rules: [{ required: false, message: 'Entrez le montant TTC' }],
                  },
                ]"
                placeholder="Entrez le montant TTC"
                @input="e => debounceFilterSearchedItem(e, 'totalTtc')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Operation">
              <a-select
                v-decorator="[
                  'totalTtcOperator',
                  {
                    rules: [{ required: false, message: 'Choisissez la relation d\'ordre' }],
                  },
                ]"
                placeholder="Choisissez la relation d'ordre"
                @change="e => handleFilterDropdownChange(e, 'ttco')"
              >
                <a-select-option value="gt">
                  Supérieur à
                </a-select-option>
                <a-select-option value="lt">
                  Inférieur à
                </a-select-option>
                <a-select-option value="eq">
                  Égale à
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          </a-row>
        <a-row :gutter="16">
          <a-form-item label="Date Référence">
            <a-range-picker
              v-decorator="[
                  'searchedDates',
                  {
                    rules: [{ required: false, message: 'Choisissez une ou plusieurs dates' }],
                  },
                ]"
              format="DD/MM/YYYY"
              :placeholder="['Date de début', 'Date de fin']"
              @change="onDateChange"
              @ok="onDateOk"
            />
          </a-form-item>
        </a-row>
      </a-form>
      <div
        :style="{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right',
          zIndex: 1,
        }"
      >
        <a-button :style="{ marginRight: '8px' }" @click="onDrawerClose">
          Fermer
        </a-button>
        <a-button type="primary" @click="onReset" ghost>
          Réinitialiser
        </a-button>
      </div>
    </a-drawer>
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
            <span slot="invoiceDate" slot-scope="text">{{ text | statementDate }}</span>
            <span slot="dateEnd" slot-scope="text">{{ text | statementDate }}</span>
            <span slot="dateBeg" slot-scope="text">{{ text | statementDate }}</span>
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
import VendorService from '../../../services/vendorService'
import { invoiceColumns, bankColumns } from './columns'

export default {
  name: 'Documents',
  data: function () {
    return {
      documentsList: [],
      visible: false,
      timeInterval: null,
      searchedName: null,
      searchedRef: null,
      searchedStatus: '',
      searchedTemplate: '',
      searchedTotalHt: null,
      totalHtOperator: null,
      searchedTotalTtc: null,
      totalTtcOperator: null,
      searchedVat: null,
      vatOperator: null,
      searchedVendor: '',
      selectedVendor: null,
      searchedBankEntity: null,
      searchedWord: null,
      searchedDates: [],
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
      suggestedVendors: [],
      limit: 10,
      page: 1,
      total: 10,
      debounce: null,
      typing: null,
      message: null,
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this)
    this.form.getFieldDecorator('searchedName', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('searchedRef', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('searchedBankEntity', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('searchedTemplate', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('searchedStatus', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('searchedVat', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('searchedTotalHt', { initialValue: null, preserve: true })
    this.form.getFieldDecorator('totalHtOperator', { initialValue: 'eq', preserve: true })
    this.form.getFieldDecorator('searchedTotalTtc', { initialValue: null, preserve: true })
    this.form.getFieldDecorator('totalTtcOperator', { initialValue: 'eq', preserve: true })
    this.form.getFieldDecorator('vatOperator', { initialValue: 'eq', preserve: true })
    this.form.getFieldDecorator('searchedDates', { initialValue: null, preserve: true })
    this.form.getFieldDecorator('searchedWord', { initialValue: '', preserve: true })
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
    totalTtcOperator: function() {
      this.fetchDocuments()
    },
    vatOperator: function() {
      this.fetchDocuments()
    },
    totalHtOperator: function() {
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
      'filters',
      'docSmeltedCache',
      'userIsAdmin',
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
        totalHt: this.searchedTotalHt,
        ref: this.searchedRef,
        totalHtOperator: this.totalHtOperator,
        totalTtc: this.searchedTotalTtc,
        totalTtcOperator: this.totalTtcOperator,
        vatOperator: this.vatOperator,
        vat: this.searchedVat,
        bankEntity: this.searchedBankEntity,
        vendor: this.selectedVendor,
        contains: this.searchedWord,
        dates: this.searchedDates,
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
    handleFilterDropdownChange(e, field) {
      switch (field) {
        case 'status':
          this.searchedStatus = e
          break
        case 'template':
          this.searchedTemplate = e
          break
        case 'vat':
          this.vatOperator = e
          break
        case 'ttco':
          this.totalTtcOperator = e
          break
        case 'hto':
          this.totalHtOperator = e
          break
      }
      this.fetchDocuments()
    },
    debounceFilterSearchedItem(event, field) {
      clearTimeout(this.debounce)
      this.debounce = setTimeout(() => {
        switch (field) {
          case 'name':
            this.searchedName = event.target.value
            break
          case 'ref':
            this.searchedRef = event.target.value
            break
          case 'bankEntity':
            this.searchedBankEntity = event.target.value
            break
          case 'vat':
            this.searchedVat = event.target.value
            break
          case 'totalHt':
            this.searchedTotalHt = parseFloat(event.target.value)
            break
          case 'totalTtc':
            this.searchedTotalTtc = parseFloat(event.target.value)
            break
          case 'word':
            this.searchedWord = event.target.value
        }
        this.fetchDocuments()
      }, 600)
    },
    showDrawer() {
      this.visible = true
    },
    onReset() {
      this.form.setFieldsValue({
        searchedName: '',
        searchedTemplate: '',
        searchedStatus: '',
        searchedRef: '',
        searchedTotalHt: null,
        totalHtOperator: 'eq',
        searchedTotalTtc: null,
        totalTtcOperator: 'eq',
        vatOperator: 'eq',
        searchedVat: '',
        selectedVendor: null,
        searchedBankEntity: '',
        searchedWord: '',
        searchedDates: [],
      })
      this.searchedDates = []
      this.searchedWord = ''
      this.searchedBankEntity = ''
      this.searchedStatus = null
      this.searchedTemplate = null
      this.totalHtOperator = 'eq'
      this.totalTtcOperator = 'eq'
      this.vatOperator = 'eq'
      this.searchedVat = ''
      this.searchedVendor = ''
      this.searchedName = ''
      this.searchedRef = ''
      this.selectedVendor = null
      this.searchedTotalTtc = null
      this.searchedTotalHt = null
      this.fetchDocuments()
    },
    onDrawerClose() {
      this.visible = false
    },
    onDateChange(value, dateString) {
      this.searchedDates = value.map(x => x.toDate().setHours(0, 0, 0, 0))
      this.fetchDocuments()
    },
    onDateOk(value) {
      console.log('onOk: ', value)
    },
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
    view(record) {
      this.$router.push({ name: 'viewer', params: { documentId: record.id } })
    },
    remove(record) {
      this.$nprogress.start()
      this.$store.dispatch('REMOVE_DOCUMENT', record.id)
      this.$nprogress.done()
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
            let templateCsvContent = '\uFEFF'
            let arrData = []
            arrData.push(templateAggregate.header.join(';'))
            templateAggregate.osmiums.map((osmiumEntries) => {
              osmiumEntries.map(osmiumEntry => {
                arrData.push(osmiumEntry.join(';'))
              })
            })
            templateCsvContent += arrData.join('\n')
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
            let templateCsvContent = '\uFEFF'
            let arrData = []
            arrData.push(docData.header.join(';'))
            docData.content.map((entrySegments) => {
              arrData.push(entrySegments.join(';'))
            })
            templateCsvContent += arrData.join('\n')
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
    handleVendorSearch(name) {
      clearTimeout(this.debounce)
      this.debounce = setTimeout(() => {
        let queryParams = { name, confirmed: true }
        VendorService.fetchVendors(queryParams)
          .then((resp) => {
            this.suggestedVendors = resp.data
          })
      }, 600)
    },
    handleVendorSelect(vendorId) {
      this.selectedVendor = vendorId
      this.fetchDocuments()
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
