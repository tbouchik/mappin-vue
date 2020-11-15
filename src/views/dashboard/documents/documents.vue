<template>
  <div>
    <br>
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
        <div class="d-flex flex-column justify-content-center col-2"
        style="float: right">
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
            <span class="btn-addon">
              <i class="btn-addon-icon fe fe-edit" />
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
      <div class="card-body">
        <div class="air__utils__scrollTable">
          <a-table  :data-source="documentsList"
                    :columns="columns"
                    :pagination="docTablePagination"
                    :loading="docTableLoading"
                    @change="handleTableChange">
            <!-- <div
              slot="filterDropdown"
              slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
              style="padding: 8px"
            >
              <a-input
                v-ant-ref="c => (searchInput = c)"
                :placeholder="`Search ${column.dataIndex}`"
                :value="selectedKeys[0]"
                style="width: 188px; margin-bottom: 8px; display: block;"
                @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
              />
              <a-button
                type="primary"
                icon="search"
                size="small"
                style="width: 90px; margin-right: 8px"
                @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
              >Search</a-button>
              <a-button
                size="small"
                style="width: 90px"
                @click="() => handleReset(clearFilters)"
              >Reset</a-button>
            </div>
            <a-icon
              slot="filterIcon"
              slot-scope="filtered"
              type="search"
              :style="{ color: filtered ? '#108ee9' : undefined }"
            /> -->
            <!-- <template slot="customRender" slot-scope="text, record, index, column">
              <span v-if="searchText && searchedColumn === column.dataIndex">
                <template
                  v-for="(fragment, i) in text
            .toString()
            .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
                >
                  <mark
                    v-if="fragment.toLowerCase() === searchText.toLowerCase()"
                    :key="i"
                    class="highlight"
                  >{{ fragment }}</mark>
                  <template v-else>{{ fragment }}</template>
                </template>
              </span>
              <template v-else>{{ text }}</template>
            </template> -->
            <template slot="customRenderComposed" slot-scope="text, record, index, column">
              <span v-if="searchText && searchedColumn === column.dataIndex">
                <template
                  v-for="(fragment, i) in text
            .toString()
            .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
                >
                  <mark
                    v-if="fragment.toLowerCase() === searchText.toLowerCase()"
                    :key="i"
                    class="highlight"
                  >{{ fragment.name }}</mark>
                  <template v-else>{{ fragment.name }}</template>
                </template>
              </span>
              <template v-else>{{ text.name }}</template>
            </template>
            <span slot="date" slot-scope="text">{{text | timestamp}}</span>
            <span slot="status" slot-scope="text">
              <a-tag
                :key="text"
                :color="text === 'pending' ? 'volcano' : text === 'smelted' ? 'geekblue' : 'green'"
              >
                {{ text.toUpperCase() }}
              </a-tag>
            </span>
            <!-- <span slot="status" slot-scope="text" >{{text}}</span> -->
            <span slot="action" slot-scope="record">
              <button @click="view(record)" :disabled="record.status === 'pending'" class="btn btn-sm btn-light mr-2">
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
import { pick } from 'lodash'

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    scopedSlots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
      customRender: 'customRender',
    },
    // sorter: (a, b) => {
    //   return a.name.localeCompare(b.name)
    // },
    // sortDirections: ['descend', 'ascend'],
    // onFilter: (value, record) =>
    //   record.name
    //     .toString()
    //     .toLowerCase()
    //     .includes(value.toLowerCase()),
    // onFilterDropdownVisibleChange: visible => {
    //   if (visible) {
    //     setTimeout(() => {
    //       this.searchInput.focus()
    //     }, 0)
    //   }
    // },
  },
  {
    title: 'Template',
    dataIndex: 'filter',
    scopedSlots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
      customRender: 'customRenderComposed',
    },
    // sorter: (a, b) => {
    //   return a.name.localeCompare(b.name)
    // },
    // onFilter: (value, record) =>
    //   record.filter.name
    //     .toString()
    //     .toLowerCase()
    //     .includes(value.toLowerCase()),
    // onFilterDropdownVisibleChange: visible => {
    //   if (visible) {
    //     setTimeout(() => {
    //       this.searchInput.focus()
    //     }, 0)
    //   }
    // },
  },
  {
    title: 'Client',
    dataIndex: 'client',
    scopedSlots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
      customRender: 'customRenderComposed',
    },
    // sorter: (a, b) => {
    //   return a.name.localeCompare(b.name)
    // },
    // onFilter: (value, record) =>
    //   record.client.name
    //     .toString()
    //     .toLowerCase()
    //     .includes(value.toLowerCase()),
    // onFilterDropdownVisibleChange: visible => {
    //   if (visible) {
    //     setTimeout(() => {
    //       this.searchInput.focus()
    //     }, 0)
    //   }
    // },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    scopedSlots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
      customRender: 'status',
    },
    // sorter: (a, b) => {
    //   return a.name.localeCompare(b.name)
    // },
    // onFilter: (value, record) =>
    //   record.status
    //     .toString()
    //     .toLowerCase()
    //     .includes(value.toLowerCase()),
    // onFilterDropdownVisibleChange: visible => {
    //   if (visible) {
    //     setTimeout(() => {
    //       this.searchInput.focus()
    //     }, 0)
    //   }
    // },
  },
  {
    title: 'Date Added',
    dataIndex: 'date',
    scopedSlots: { customRender: 'date' },
    // sorter: (a, b) => {
    //   return new Date(a.date) - new Date(b.date)
    // },
  },
  {
    title: 'Action',
    scopedSlots: { customRender: 'action' },
  },
]
export default {
  name: 'Documents',
  data: function() {
    return {
      // searchText: '',
      // searchInput: null,
      // searchedColumn: '',
      timeInterval: null,
      columns,

    }
  },
  props: {
    clientId: {
      type: String,
      required: false,
    },
  },
  computed: {
    ...mapGetters(['documentsList', 'smeltedIdList', 'docTablePagination', 'docTableLoading']),
    everythingIsValidated: function () {
      return this.smeltedIdList.length === 0
    },
    clientViz: function () {
      return this.clientId !== undefined && this.clientId !== null
    },
  },
  created() {
    if (this.clientId) {
      this.$store.dispatch('ACTION_FETCH_CLIENT_DOCUMENTS', this.clientId)
      this.$store.dispatch('ACTION_FETCH_COUNT_DOCUMENTS', { client: this.clientId,
      })
    } else {
      this.$store.dispatch('ACTION_FETCH_DOCUMENTS_WITH_PARAMS', {
        limit: this.docTablePagination.limit,
        page: this.docTablePagination.page,
        loading: true,
      })
      this.$store.dispatch('ACTION_FETCH_COUNT_DOCUMENTS', {
      })
      this.timeInterval = setInterval(() => {
        this.$store.dispatch('ACTION_FETCH_DOCUMENTS_WITH_PARAMS', {
          limit: this.docTablePagination.limit,
          page: this.docTablePagination.page,
          loading: false,
        })
      }, 10000)
    }
  },
  destroyed() {
    if (!this.clientId) {
      clearInterval(this.timeInterval)
    }
  },
  methods: {
    // handleSearch(selectedKeys, confirm, dataIndex) {
    //   confirm()
    //   this.searchText = selectedKeys[0]
    //   this.searchedColumn = dataIndex
    // },
    // handleReset(clearFilters) {
    //   clearFilters()
    //   this.searchText = ''
    // },
    view(record) {
      this.$router.push({ name: 'viewer', params: { documentId: record.id } })
    },
    remove(record) {
      this.$nprogress.start()
      this.$store.dispatch('REMOVE_DOCUMENT', record.id)
      this.$nprogress.done()
    },
    goToValidation() {
      this.$router.push({ name: 'viewer', params: { documentId: this.smeltedIdList[0], smeltedValidation: true } })
    },
    goToUpload() {
      this.$router.push({ name: 'upload' })
    },
    bulkExportToCSV() {
      let zip = JSZip()
      console.log(this.documentsList.length)
      this.documentsList.map((document, idx) => {
        let documentCsvContent = ''
        let arrData = ['Key;Value']
        document.osmium.map(item => {
          arrData.push(Object.values(pick(item, ['Key', 'Value'])).join(';'))
        })
        documentCsvContent += arrData.join('\n').replace(/(^\[)|(\]$)/gm, '')
        zip.file(`${document.name}-${idx}.csv`, documentCsvContent)
      })
      zip.generateAsync({
        type: 'base64',
      }).then(function(content) {
        window.location.href = 'data:application/zip;base64,' + content
      })
    },
    handleTableChange(pagination, filters, sorter) {
      console.log(pagination, filters, sorter)
      const pager = { ...this.pagination }
      pager.current = pagination.current
      this.pagination = pager
      // this.$store.({
      //   limit: pagination.pageSize,
      //   page: pagination.current,
      //   // sortField: sorter.field,
      //   // sortOrder: sorter.order,
      //   // ...filters,
      // });
      this.$store.dispatch('ACTION_FETCH_DOCUMENTS_WITH_PARAMS', {
        limit: pagination.pageSize,
        page: pagination.current,
        loading: true,
      })
      this.$store.dispatch('ACTION_FETCH_COUNT_DOCUMENTS', {
      })
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
