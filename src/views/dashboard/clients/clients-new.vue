<template>
  <div>
    <br>
    <div class="air__utils__heading">
      <b-row>
        <b-col md="3" class="my-1">
          <h5>Clients</h5>
        </b-col>
      </b-row>
    </div>
    <div class="card">
      <div class="card-header card-header-flex">
        <div class="d-flex flex-column justify-content-center mr-auto">
          <h5 class="mb-0">Your clients</h5>
        </div>
        <div class="d-flex flex-column justify-content-center">
          <button class="btn btn-success"
            v-if="!addMode"
            @click="openAddMode"
          >
            Add New Client
          </button>
          <button class="btn btn-outline-info"
            @click="closeAddMode"
            v-if="addMode"
          >
           Cancel
          </button>
        </div>
      </div>
      <div class="card" v-if="addMode">
          <div class="card-body">
      <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">
    <a-form-item label="Full Name">
      <a-input
        v-decorator="['name', { rules: [{ required: true, message: 'Please input your client full name' }] }]"
      />
    </a-form-item>
    <a-form-item label="Email Address">
      <a-input
        v-decorator="['email', { rules: [{ required: true, message: 'Please input your client email address' }] }]"
      />
    </a-form-item>
    <a-form-item label="Company Name">
      <a-input
        v-decorator="['company', { rules: [{ required: true, message: 'Please input your client company name' }] }]"
      />
    </a-form-item>
    <a-form-item label="Password" style="margin-bottom:0;">
      <a-input :style="{ display: 'inline-block', width: 'calc(75% - 6px)' }"
        v-decorator="['password', { rules: [{ required: true, message: 'Please input or generate a password' }] }]"
      />
      <span :style="{ display: 'inline-block', width: '12px', textAlign: 'center' }">

      </span>
      <a-form-item :style="{ display: 'inline-block', width: 'calc(25% - 6px)' }">
       <a-button type="primary" icon="thunderbolt" style="width: 100%" @click="generatePassword">
        Generate
      </a-button>
      </a-form-item>
    </a-form-item>
    <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
      <a-button type="primary" html-type="submit">
        Submit
      </a-button>
    </a-form-item>
  </a-form>
          </div></div>
      <div class="card-body">
        <div class="air__utils__scrollTable">
          <a-table :data-source="clients" :columns="columns">
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

const columns = [
  {
    title: 'Full Name',
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
    title: 'Email Address',
    dataIndex: 'email',
    scopedSlots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
      customRender: 'customRenderComposed',
    },
    sorter: (a, b) => {
      return a.name.localeCompare(b.name)
    },
    onFilter: (value, record) =>
      record.filter.name
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
    title: 'Company',
    dataIndex: 'company',
    scopedSlots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
      customRender: 'customRenderComposed',
    },
    sorter: (a, b) => {
      return a.name.localeCompare(b.name)
    },
    onFilter: (value, record) =>
      record.client.name
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
    title: 'Action',
    scopedSlots: { customRender: 'action' },
  },
]
export default {
  data: function() {
    return {
      searchText: '',
      searchInput: null,
      searchedColumn: '',
      timeInterval: null,
      columns,
      addMode: false,
      form: this.$form.createForm(this, { name: 'coordinated' }),
    }
  },
  computed: {
    ...mapGetters(['clients']),
  },
  created() {
    this.$store.dispatch('ACTION_FETCH_CLIENTS')
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
    view(record) {
      this.$router.push({ name: 'client', params: { clientId: record.id } })
    },
    remove(record) {
      this.$nprogress.start()
      this.$store.dispatch('ACTION_REMOVE_CLIENT', record.id)
      this.$nprogress.done()
    },
    openAddMode() {
      this.addMode = true
    },
    closeAddMode() {
      this.addMode = false
    },
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$store.dispatch('ACTION_ADD_CLIENT', values)
          this.closeAddMode()
        }
      })
    },
    generatePassword() {
      this.form.setFieldsValue({
        password: 'Generate1',
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
