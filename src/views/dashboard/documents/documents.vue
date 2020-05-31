<template>
  <div>
    <smelter-uppy-loader :maxFileSizeInBytes=10000000></smelter-uppy-loader>
    <div class="card">
      <div class="card-header card-header-flex">
        <div class="d-flex flex-column justify-content-center mr-auto">
          <h5 class="mb-0">Your extractions</h5>
        </div>
        <div class="d-flex flex-column justify-content-center">
          <button class="btn btn-primary"
                :disabled="everythingIsValidated"
                @click="() => goToValidation()"
          >
            Validate Smelted
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="air__utils__scrollTable">
          <a-table :data-source="documentsList" :columns="columns">
            <div
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
            />
            <template slot="customRender" slot-scope="text, record, index, column">
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
import SmelterUppyLoader from '@/components/widgets/Smelter/Uploader/uppyloader.vue'

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    scopedSlots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
      customRender: 'customRender',
    },
    sorter: (a, b) => {
      return a.name.localeCompare(b.name)
    },
    sortDirections: ['descend', 'ascend'],
    onFilter: (value, record) =>
      record.name
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => {
          this.searchInput.focus()
        }, 0)
      }
    },
  },
  {
    title: 'Type',
    dataIndex: 'businessPurpose',
    scopedSlots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
      customRender: 'customRender',
    },
    sorter: (a, b) => {
      return a.name.localeCompare(b.name)
    },
    onFilter: (value, record) =>
      record.type
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => {
          this.searchInput.focus()
        }, 0)
      }
    },
  },
  {
    title: 'Extraction',
    dataIndex: 'extractionType',
    scopedSlots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
      customRender: 'customRender',
    },
    sorter: (a, b) => {
      return a.name.localeCompare(b.name)
    },
    onFilter: (value, record) =>
      record.extraction
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => {
          this.searchInput.focus()
        }, 0)
      }
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    scopedSlots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
      customRender: 'status',
    },
    sorter: (a, b) => {
      return a.name.localeCompare(b.name)
    },
    onFilter: (value, record) =>
      record.status
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => {
          this.searchInput.focus()
        }, 0)
      }
    },
  },
  {
    title: 'Date Added',
    dataIndex: 'date',
    scopedSlots: { customRender: 'date' },
    sorter: (a, b) => {
      return new Date(a.date) - new Date(b.date)
    },
  },
  {
    title: 'Action',
    scopedSlots: { customRender: 'action' },
  },
]
export default {
  components: {
    SmelterUppyLoader,
  },
  data: function() {
    return {
      searchText: '',
      searchInput: null,
      searchedColumn: '',
      columns,
    }
  },
  computed: {
    ...mapGetters(['documentsList', 'smeltedIdList']),
    everythingIsValidated: function () {
      return this.smeltedIdList.length === 0
    },
  },
  created() {
    this.$store.dispatch('FETCH_DOCUMENTS')
  },
  methods: {
    handleSearch(selectedKeys, confirm, dataIndex) {
      confirm()
      this.searchText = selectedKeys[0]
      this.searchedColumn = dataIndex
    },

    handleReset(clearFilters) {
      clearFilters()
      this.searchText = ''
    },

    newUpload() {
      this.$router.push({ name: 'upload' })
    },

    view(record) {
      this.$store.dispatch('UPDATE_DOCUMENT', record.id)
      this.$router.push({ name: 'viewer' })
    },
    remove(record) {
      this.$nprogress.start()
      this.$store.dispatch('REMOVE_DOCUMENT', record.id)
      this.$nprogress.done()
    },
    goToValidation() {
      this.$store.dispatch('UPDATE_DOCUMENT', this.smeltedIdList[0])
      this.$router.push({ name: 'viewer', params: { smeltedValidation: true } })
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
