<template>
  <div :class="$style.subbar"
        >
    <ul :class="$style.breadcrumbs" class=" xs-1 sm-2 col-lg-1">
      <b-nav @click="showClientModal">
        <b-nav-item>{{ current.client.name }}</b-nav-item>
        <a-modal  v-model="clientModalVisible"
                  title="Change client"
                  on-ok="handleOk"
                  :width="660"
                  >
          <template slot="footer">
            <a-button key="back" :disabled="clientTableLoading" @click="handleCancelClientChange">
              {{ $t('subbar.return') }}
            </a-button>
          </template>
          <div class="demo-infinite-container ">
            <a-input-search placeholder="Search Client" v-model="searchedClient" />
              <a-list :data-source="clients"
                      :loading="clientTableLoading">
                <a-list-item  slot="renderItem" slot-scope="item">
                  <a-list-item-meta :description="item.email">
                    <a slot="title">{{ item.name }} | </a>
                    <a slot="title"> {{ item.company }}</a>
                  </a-list-item-meta>
                  <a-button type="primary" @click="selectClient(item)" ghost>
                    {{ $t('subbar.select') }}
                  </a-button>
                </a-list-item>
              </a-list>
            </div>
        </a-modal>
      </b-nav>
    </ul>
    <div :class="$style.divider" class="mr-4 d-none d-xl-block"  v-if="!isBankStatement"/>
    <ul :class="$style.breadcrumbs" class=" xs-1 sm-2 col-lg-1" v-if="!isBankStatement">
      <b-nav @click="showTemplateModal">
        <b-nav-item>{{ current.filter.name }}</b-nav-item>
        <a-modal  v-model="templateModalVisible"
                  title="Change template"
                  on-ok="handleOk"
                  :width="660"
                  >
          <template slot="footer">
            <a-button key="back" :disabled="templateLoading" @click="handleCancelTemplateChange">
              {{ $t('subbar.return') }}
            </a-button>
          </template>
          <div class="demo-infinite-container ">
            <a-input-search placeholder="Search Template" v-model="searchedTemplate" />
              <a-list :data-source="filters"
                      :loading="templateLoading">

                  <a-list-item  slot="renderItem" slot-scope="item">
                    <a-list-item-meta :description="item.description">
                      <a slot="title">{{ item.name }}</a>
                    </a-list-item-meta>
                  <a-button type="primary" @click="selectTemplate(item)" ghost>
                    {{ $t('subbar.select') }}
                  </a-button>
                </a-list-item>
              </a-list>
            </div>
        </a-modal>
      </b-nav>
    </ul>
    <div :class="$style.divider" class="mr-4 d-none d-xl-block"  v-if="!isBankStatement"/>
    <ul :class="$style.breadcrumbs" class=" xs-1 sm-2 col-lg-1" v-if="!isBankStatement">
      <b-nav @click="showJournalModal">
        <b-nav-item v-if="current.journal">{{ current.journal.name }}</b-nav-item>
        <b-nav-item v-else>Sélectionner le Journal</b-nav-item>
        <a-modal  v-model="journalModalVisible"
                  title="Change Journal"
                  on-ok="handleOk"
                  :width="660"
                  >
          <template slot="footer">
            <a-button key="back" :disabled="journalTableLoading" @click="handleCancelJournalChange">
              {{ $t('subbar.return') }}
            </a-button>
          </template>
          <div class="demo-infinite-container ">
            <a-input-search placeholder="Search Journal" v-model="searchedJournal" />
              <a-list :data-source="journals"
                      :loading="journalTableLoading">
                  <a-list-item  slot="renderItem" slot-scope="item">
                    <a-list-item-meta :description="item.type">
                      <a slot="title">{{ item.name }} - {{item.code}}</a>
                    </a-list-item-meta>
                  <a-button type="primary" @click="selectJournal(item)" ghost>
                    {{ $t('subbar.select') }}
                  </a-button>
                </a-list-item>
              </a-list>
            </div>
        </a-modal>
      </b-nav>
    </ul>
    <div :class="$style.divider" class="mr-4 d-none d-xl-block" />
    <ul :class="$style.breadcrumbs" class=" xs-1 sm-2 col-lg-2" style="margin-left:10px; padding-right:0px;">
      <a-tooltip placement="topLeft" :title="current.name" arrowPointAtCenter>
      <li :class="$style.breadcrumb">
        <a
          href="#"
          :class="[$style.breadcrumbLink, $style.breadcrumbLink__current]"
          >{{ current.name| shortened }}</a>
      </li>
      </a-tooltip>
    </ul>
    <div :class="$style.divider" class="mr-4 d-none d-xl-block" />
    <p
      class="color-gray-4 text-uppercase font-size-28 mb-0 mr-6 d-none d-xl-block"
    ></p>
    <div>
      <a-tag
        :color="getColor(current.status)"
      >
        {{ current.status }}
      </a-tag>
      <a-button-group>
        <a-tooltip placement="topLeft" :title="$t('subbar.exportCSV')" arrowPointAtCenter>

          <button class="btn btn-outline-primary"
           @click="csvExport" >
            <span>
              <i class=" fa fa-download"/>
            </span>
          </button>
        </a-tooltip>
        <a-tooltip placement="topLeft" :title="$t('subbar.splitH')" style='margin-left : 10px' v-if="settings.viewerVerticalSplit">
         <button class="btn btn-outline-primary" @click="changeScreenSplit">
            <span>
              <i class="fa fa-arrows-h" />
            </span>
          </button>
        </a-tooltip>
        <a-tooltip placement="topLeft" :title="$t('subbar.splitV')" style='margin-left : 10px' v-else>
         <button class="btn btn-outline-primary" @click="changeScreenSplit">
            <span>
              <i class="fa fa-arrows-v" />
            </span>
          </button>
        </a-tooltip>

      </a-button-group>

      <a-button-group v-if="!current.isArchived" style='margin-left : 10px;'>
        <button v-if="currentStatusIsValidated"
                  class="btn btn-outline-primary"
                  @click="invalidateCurrent">
          {{ $t('subbar.invalidate') }}
        </button>
        <button
            v-else
            :enabled="!currentStatusIsPending"
            type="button"
            class="btn btn-success btn-with-addon mr-auto text-nowrap d-none d-md-block"
            @click="validateCurrent"
          >
            <span class="btn-addon">
              <i class="btn-addon-icon fe fe-check-circle" />
            </span>
            {{ $t('subbar.validate') }}
        </button>
      </a-button-group>
      <a-button-group v-if="current.isArchived">
        <a-button type="primary"
                  @click="unarchiveCurrent"
                  ghost>
          {{ $t('subbar.unarchive') }}
        </a-button>
      </a-button-group>
    </div>
    <div :class="$style.amount" class="mr-3 ml-auto d-none d-sm-flex">
      <a-button-group>
        <a-tooltip placement="topLeft" :title="$t('subbar.shortcutsView')" arrowPointAtCenter>
          <a-button
            type="link"
            @click="pullDrawer"
          >
           <span class="icmn-keyboard"
           size="large"
           >
                </span>
          </a-button>
        </a-tooltip>
        <a-button
          type="link"
          :disabled="currentIndexIsFirst"
          :loading="leftLoading"
          @click="goPrevious"
        >
          <a-icon type="left" />{{ $t('subbar.previous') }}</a-button
        >
        <a-button type="link"
                  :disabled="currentIndexIsLast"
                  :loading="rightLoading"
                  @click="goNext">
          {{ $t('subbar.next') }}<a-icon type="right" />
        </a-button>
      </a-button-group>
      <a-button-group> </a-button-group>
    </div>
    <a-drawer
      :title="$t('subbar.shortcutsTitle')"
      placement="right"
      :closable="false"
      :visible="drawerVisible"
      @close="onDrawerClose"
    >
      <p><b>{{ $t('subbar.keys.tab') }}</b>: {{ $t('subbar.keys.tabAction') }}</p>
      <p><b>{{ $t('subbar.keys.shift') }}</b>: {{ $t('subbar.keys.shiftAction') }}</p>
      <p><b>{{ $t('subbar.keys.ctrl') }}</b>: {{ $t('subbar.keys.ctrlAction') }}</p>
      <p><b>{{ $t('subbar.keys.enter') }}</b>: {{ $t('subbar.keys.enterAction') }}</p>
    </a-drawer>
  </div>
</template>
<script>
import { mapGetters, mapState } from 'vuex'
import DocumentService from '../../../../services/documentService'

export default {
  name: 'SmelterSubbar',
  data: function () {
    return {
      rightLoading: false,
      leftLoading: false,
      loadedAllSmeltedFromLeft: false,
      loadedAllSmeltedFromRight: false,
      loadedAllDocsFromRight: false,
      loadedAllDocsFromLeft: false,
      clientModalVisible: false,
      templateModalVisible: false,
      searchedClient: null,
      searchedTemplate: null,
      drawerVisible: false,
      searchedJournal: null,
      journalModalVisible: false,
    }
  },
  watch: {
    searchedClient: function() {
      this.$store.dispatch('ACTION_FETCH_CLIENTS', {
        limit: 100,
        page: 1,
        name: this.searchedClient,
        current: this.current.client._id,
      })
    },
    searchedTemplate: function() {
      this.$store.dispatch('ACTION_FETCH_FILTERS', {
        limit: 100,
        page: 1,
        name: this.searchedTemplate,
      })
    },
    searchedJournal: function() {
      this.$store.dispatch('ACTION_FETCH_JOURNALS', {
        limit: 100,
        page: 1,
        name: this.searchedJournal,
      })
    },
  },
  computed: {
    ...mapState(['settings']),
    ...mapGetters([ 'documentsIdList',
      'docSmeltedCache',
      'docQueryParams',
      'docPagination',
      'clients',
      'clientTableLoading',
      'filters',
      'templateLoading',
      'journals',
      'journalTableLoading']),
    currentIndex: function () {
      if (this.smeltedValidation) {
        return this.docSmeltedCache.indexOf(this.current.id)
      }
      return this.documentsIdList.indexOf(this.current.id)
    },
    lastIndex: function () {
      if (this.smeltedValidation) {
        return this.docSmeltedCache.length - 1
      }
      return this.documentsIdList.length - 1
    },
    currentIndexIsLast: function () {
      if (this.currentIndex === this.lastIndex && this.smeltedValidation && !this.loadedAllSmelted) {
        this.fetchNewSmeltedIds('right')
      } else if (this.currentIndex === this.lastIndex && !this.smeltedValidation && !this.loadedAllDocsFromRight) {
        this.fetchNewDocs('right')
      }
      return this.currentIndex === this.lastIndex
    },
    currentIndexIsFirst: function () {
      if (this.currentIndex === 0 && this.smeltedValidation && !this.loadedAllSmelted) {
        this.fetchNewSmeltedIds('left')
      } else if (this.currentIndex === 0 && !this.smeltedValidation && !this.loadedAllDocsFromLeft) {
        this.fetchNewDocs('left')
      }
      return this.currentIndex === 0
    },
    currentStatusIsPending: function() {
      return this.current.status === 'pending'
    },
    currentStatusIsValidated: function() {
      return this.current.status === 'validated'
    },
  },
  props: {
    smeltedValidation: {
      type: Boolean,
      default: false,
    },
    current: {
      type: Object,
      required: true,
    },
    isBankStatement: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    goNext() {
      this.$store.dispatch('ACTION_RESET_PAGE')
      if (this.smeltedValidation) {
        this.$router.push({
          name: 'viewer',
          params: {
            documentId: this.docSmeltedCache[this.currentIndex + 1],
            smeltedValidation: this.smeltedValidation,
          },
        })
      } else {
        this.$router.push({
          name: 'viewer',
          params: {
            documentId: this.documentsIdList[this.currentIndex + 1],
            smeltedValidation: this.smeltedValidation,
          },
        })
      }
    },
    goPrevious() {
      this.$store.dispatch('ACTION_RESET_PAGE')
      if (this.smeltedValidation) {
        this.$router.push({
          name: 'viewer',
          params: {
            documentId: this.docSmeltedCache[this.currentIndex - 1],
            smeltedValidation: this.smeltedValidation,
          },
        })
      } else {
        this.$router.push({
          name: 'viewer',
          params: {
            documentId: this.documentsIdList[this.currentIndex - 1],
            smeltedValidation: this.smeltedValidation,
          },
        })
      }
    },
    csvExport() {
      const bom = '\uFEFF' // https://stackoverflow.com/questions/43463923/javascript-how-to-download-csv-file-containing-french-text-with-utf-8-encoding
      let csvContent = 'data:text/csv;charset=utf-8,' + bom
      let arrData = []
      if (!this.current.isBankStatement) {
        let nonImputableOsmiumKeysIndices = this.current.filter.keys.map((x, i) => { if (x.isImputable !== true) return i }).filter(x => x !== undefined)
        let imputableOsmiumKeysIndices = this.current.filter.keys.map((x, i) => { if (x.isImputable === true) return i }).filter(x => x !== undefined)
        let fixedKeys = ['N° Compte', 'Valeur']
        const osmiumKeys = nonImputableOsmiumKeysIndices.map((keyIdx) => this.current.filter.keys[keyIdx].value).concat(fixedKeys)
        arrData.push(osmiumKeys.join(';'))
        let nonImputableEntrySegment = nonImputableOsmiumKeysIndices.map(nonImputableIdx => this.current.osmium[nonImputableIdx].Value)
        imputableOsmiumKeysIndices.forEach((imputableOsmiumKey) => {
          let imputableEntrySegment = [ this.current.osmium[imputableOsmiumKey].Imputation,
            this.current.osmium[imputableOsmiumKey].Value]
          let entrySegment = nonImputableEntrySegment.concat(imputableEntrySegment)
          arrData.push(entrySegment.join(';'))
        })
      } else {
        let fixedKeys = ['Date Opération', 'Désignation', 'Compte', 'Débit', 'Crédit']
        arrData.push(fixedKeys.join(';'))
        Object.keys(this.current.bankOsmium).forEach((docPage) => {
          const pageStatements = this.current.bankOsmium[docPage]
          pageStatements.forEach((statement) => {
            let entrySegment = [statement.Date.Text, statement.Designation.Text, statement.Compte.Text, statement.Debit.Text, statement.Credit.Text]
            arrData.push(entrySegment.join(';'))
          })
        })
      }
      csvContent += arrData.join('\n')
      const data = encodeURI(csvContent)
      const link = document.createElement('a')
      const fileName = this.current.isBankStatement ? this.getTitleForBankStatementDocument(this.current) : this.getTitleForInvoiceDocument(this.current)
      link.setAttribute('href', data)
      link.setAttribute('download', `${fileName}.csv`)
      link.click()
    },
    getTitleForBankStatementDocument(document) {
      const bankNameObj = document.osmium.find((x) => x.Role && x.Role.length && x.Role[x.Role.length - 1] === 'BANK_NAME')
      const bankName = bankNameObj ? '_'.concat(bankNameObj.Value) : undefined
      const dateFromObj = document.osmium.find((x) => x.Role && x.Role.length && x.Role[x.Role.length - 1] === 'DATE_FROM')
      const dateFrom = dateFromObj ? '_'.concat(dateFromObj.Value).replace(/\//g, '_') : undefined
      const clientName = document.client.name.replace(/\s/g, '_').toUpperCase()
      return clientName.concat(bankName || '').concat(dateFrom || '')
    },
    getTitleForInvoiceDocument(document) {
      const vendorObj = document.osmium.find((x) => x.Role && x.Role.length && x.Role[x.Role.length - 1] === 'VENDOR')
      const vendorName = vendorObj ? '_'.concat(vendorObj.Value) : undefined
      const invoiceDateIdx = document.filter.keys.findIndex((x) => x.type === 'DATE')
      const invoiceDate = invoiceDateIdx ? '_'.concat(document.osmium[invoiceDateIdx].Value).replace(/\//g, '_') : undefined
      const clientName = document.client.name.replace(/\s/g, '_').toUpperCase()
      return clientName.concat(vendorName || '').concat(invoiceDate || '')
    },
    goToClient() {
      this.$router.push({ name: 'client', params: { clientId: this.current.client._id } })
    },
    fetchNewSmeltedIds(side) {
      if (side === 'left') {
        this.leftLoading = true
        if (this.docPagination.page === 1) {
          this.loadedAllSmeltedFromLeft = true
          this.leftLoading = false
        } else {
          DocumentService.fetchNextSmeltedDocuments({
            ...this.docQueryParams,
            side: 'left',
            current: this.current.id,
          }).then((idsArray) => {
            if (idsArray.length) {
              this.$store.dispatch('ACTION_CACHE_SMELTED_IDS', { idsArray,
                left: true,
                right: false })
            } else {
              this.loadedAllSmeltedFromLeft = true
            }
            this.leftLoading = false
          }).catch(() => {
            this.leftLoading = false
          })
        }
      } else {
        this.rightLoading = true
        DocumentService.fetchNextSmeltedDocuments({
          ...this.docQueryParams,
          side: 'right',
          current: this.current.id,
        }).then((idsArray) => {
          if (idsArray.length) {
            this.$store.dispatch('ACTION_CACHE_SMELTED_IDS', { idsArray,
              left: false,
              right: true })
          } else {
            this.loadedAllSmeltedFromRight = true
          }
          this.rightLoading = false
        }).catch(() => {
          this.rightLoading = false
        })
      }
    },
    fetchNewDocs(side) {
      // this.docPagination
      if (side === 'left') {
        this.leftLoading = true
        if (this.docPagination.page === 1) {
          this.loadedAllDocsFromLeft = true
          this.leftLoading = false
        } else {
          DocumentService.fetchNextDocuments({
            ...this.docQueryParams,
            side: 'left',
            current: this.current.id,
          }).then((idsArray) => {
            if (idsArray.length) {
              this.$store.dispatch('ACTION_CACHE_IDS', { idsArray,
                left: true,
                right: false })
            } else {
              this.loadedAllDocsFromLeft = true
            }
            this.leftLoading = false
          }).catch(() => {
            this.leftLoading = false
          })
        }
      } else {
        this.rightLoading = true
        DocumentService.fetchNextDocuments({
          ...this.docQueryParams,
          side: 'right',
          current: this.current.id,
        }).then((idsArray) => {
          if (idsArray.length) {
            this.$store.dispatch('ACTION_CACHE_IDS', { idsArray,
              left: false,
              right: true })
          } else {
            this.loadedAllDocsFromRight = true
          }
          this.rightLoading = false
        }).catch(() => {
          this.rightLoading = false
        })
      }
    },
    showClientModal() {
      this.clientModalVisible = true
      this.$store.dispatch('ACTION_FETCH_CLIENTS', {
        limit: 100,
        page: 1,
        name: this.searchedClient,
        current: this.current.client._id,
      })
    },
    showTemplateModal() {
      this.templateModalVisible = true
      this.$store.dispatch('ACTION_FETCH_FILTERS', {
        limit: 100,
        page: 1,
        name: this.searchedTemplate,
        current: this.current.filter._id,
      })
    },
    showJournalModal() {
      this.journalModalVisible = true
      this.$store.dispatch('ACTION_FETCH_JOURNALS', {
        limit: 100,
        page: 1,
        name: this.searchedJournal,
        current: this.current.journal ? this.current.journal._id : null,
      })
    },
    handleCancelClientChange(e) {
      this.clientModalVisible = false
      this.searchedClient = null
    },
    handleCancelTemplateChange(e) {
      this.templateModalVisible = false
      this.searchedTemplate = null
    },
    handleCancelJournalChange(e) {
      this.journalModalVisible = false
      this.searchedJournal = null
    },
    selectClient(client) {
      this.$store.dispatch('ACTION_START_CLIENT_LOADER')
      const body = { client: client.id }
      DocumentService.updateDocument(body, this.current.id)
        .then(() => {
          DocumentService.fetchDocument(this.current.id)
            .then(doc => {
              this.$store.dispatch('UPDATE_DOCUMENT', doc)
              this.$store.dispatch('ACTION_STOP_CLIENT_LOADER')
              this.clientModalVisible = false
              this.searchedClient = null
            })
        })
    },
    selectTemplate(template) {
      this.$store.dispatch('ACTION_START_FILTER_LOADER')
      const body = { filter: template.id }
      DocumentService.updateDocument(body, this.current.id)
        .then(() => {
          DocumentService.fetchDocument(this.current.id)
            .then(doc => {
              this.$store.dispatch('UPDATE_DOCUMENT', doc)
              this.$store.dispatch('ACTION_STOP_FILTER_LOADER')
              this.templateModalVisible = false
              this.searchedClient = null
            })
        })
    },
    selectJournal(journal) {
      this.$store.dispatch('ACTION_START_FILTER_LOADER')
      const body = { newJournal: journal.id }
      DocumentService.updateDocument(body, this.current.id)
        .then(() => {
          DocumentService.fetchDocument(this.current.id)
            .then(doc => {
              this.$store.dispatch('UPDATE_DOCUMENT', doc)
              this.$store.dispatch('ACTION_STOP_FILTER_LOADER')
              this.journalModalVisible = false
              this.searchedJournal = null
            })
        })
    },
    validateCurrent() {
      const body = { status: 'validated' }
      DocumentService.updateDocument(body, this.current.id) // TODO factor repeted code
        .then(() => {
          DocumentService.fetchDocument(this.current.id)
            .then(doc => {
              this.$store.dispatch('UPDATE_DOCUMENT', doc)
            })
        })
    },
    invalidateCurrent() {
      const body = { status: 'smelted' }
      DocumentService.updateDocument(body, this.current.id) // TODO factor repeted code
        .then(() => {
          DocumentService.fetchDocument(this.current.id)
            .then(doc => {
              this.$store.dispatch('UPDATE_DOCUMENT', doc)
            })
        })
    },
    unarchiveCurrent() {
      const body = { isArchived: false, status: 'validated' }
      DocumentService.updateDocument(body, this.current.id) // TODO factor repeted code
        .then(() => {
          DocumentService.fetchDocument(this.current.id)
            .then(doc => {
              this.$store.dispatch('UPDATE_DOCUMENT', doc)
            })
        })
    },
    pullDrawer() {
      this.drawerVisible = true
    },
    onDrawerClose() {
      this.drawerVisible = false
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
    changeScreenSplit() {
      const setting = 'viewerVerticalSplit'
      const value = !this.settings[setting]
      this.$store.commit('CHANGE_SETTING', { setting, value })
    },
  },
  destroyed() {
    this.$store.dispatch('ACTION_RESET_SMELTED_IDS')
    this.loadedAllSmelted = false
  },
}
</script>
<style lang="scss" module>
@import "./style.module.scss";
</style>
