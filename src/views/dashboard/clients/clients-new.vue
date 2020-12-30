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
          <h5 class="mb-0">{{ $t('client.dashboardTitle') }}</h5>
        </div>
        <div class="d-flex flex-column justify-content-center">
          <button class="btn btn-success"
            v-if="!addMode"
            @click="openAddMode"
          >
            {{ $t('client.add') }}
          </button>
          <button class="btn btn-outline-info"
            @click="closeAddMode"
            v-if="addMode"
          >
           {{ $t('client.cancel') }}
          </button>
        </div>
      </div>
      <br/>
        <div class="card-body">
        <a-collapse expand-icon-position="right" style="background: #eef3fc">
          <a-collapse-panel key="1" :header="$t('dashboard.document.filterSettings')">
            <br>
            <a-form
              :form="form"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 12 }"
            >
              <a-form-item label="Name">
                <a-input
                  :placeholder="$t('client.searchClient')"
                  v-model="searchedName"
                />
              </a-form-item>

              <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
                <a-button type="primary" @click="resetFilterSettings" ghost> {{ $t('dashboard.document.resetSettings') }} </a-button>
              </a-form-item>
            </a-form>
            <a-icon slot="extra" type="filter" />
          </a-collapse-panel>
        </a-collapse>
      </div>
      <div class="card" v-if="addMode">
          <div class="card-body">
            <br/>
      <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit.prevent="handleSubmit">
    <a-form-item :label="$t('client.fullName')">
      <a-input
        v-decorator="['name', { rules: [{ required: true, message: 'Please input your client full name' }] }]"
      />
    </a-form-item>
    <a-form-item :label="$t('client.clientref')">
      <a-input
        v-decorator="['reference', { rules: [{ required: true, message: 'Please input your client reference' }] }]"
      />
    </a-form-item>
    <a-form-item :label="$t('client.email')">
      <a-input
        v-decorator="['email', { rules: [{ required: false, message: 'Please input your client email address' }] }]"
      />
    </a-form-item>
    <a-form-item :label="$t('client.company')">
      <a-input
        v-decorator="['company', { rules: [{ required: false, message: 'Please input your client company name' }] }]"
      />
    </a-form-item>
    <a-form-item :label="$t('client.number')">
      <a-input
        v-decorator="['number', { rules: [{ required: false, message: 'Please input your client phone number' }] }]"
      />
    </a-form-item>

    <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
      <a-button type="primary" html-type="submit">
        {{ $t('util.submit') }}
      </a-button>
    </a-form-item>
  </a-form>
          </div></div>
      <div class="card-body">
        <div class="air__utils__scrollTable">
          <a-table :data-source="clients"
                    :columns="columns"
                    :pagination="clientTablePagination"
                    :loading="clientTableLoading"
                    @change="handleTableChange">
            <template slot="customRender" slot-scope="text">
              <template >{{ text }}</template>
            </template>
            <!-- <span slot="status" slot-scope="text" >{{text}}</span> -->
            <span slot="action" slot-scope="record">
              <button @click="view(record)" :disabled="record.status === 'pending'" class="btn btn-sm btn-light mr-2">
                <i class="fe fe-edit mr-2" />
                {{ $t('util.view') }}
              </button>
              <button @click="remove(record)" class="btn btn-sm btn-light">
                <small>
                  <i class="fe fe-trash mr-2" />
                </small>
                {{ $t('util.remove') }}
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
import ClientService from '../../../services/clientService'
export default {
  name: 'ClientsNewDashboard',
  data: function() {
    return {
      searchedName: null,
      addMode: false,
      form: this.$form.createForm(this, { name: 'coordinated' }),
      columns: [
        {
          title: this.$t('client.fullName'),
          dataIndex: 'name',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender',
          },
        },
        {
          title: this.$t('client.email'),
          dataIndex: 'email',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRenderComposed',
          },
        },
        {
          title: this.$t('client.ref'),
          dataIndex: 'reference',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRenderComposed',
          },
        },
        {
          title: this.$t('client.company'),
          dataIndex: 'company',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRenderComposed',
          },
        },
        {
          title: this.$t('client.number'),
          dataIndex: 'number',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRenderComposed',
          },
        },
        {
          title: 'Action',
          scopedSlots: { customRender: 'action' },
        },
      ],
    }
  },
  watch: {
    searchedName: function() {
      this.$store.dispatch('ACTION_FETCH_CLIENTS', {
        limit: this.clientTablePagination.limit,
        page: this.clientTablePagination.page,
        name: this.searchedName,
      })
      this.$store.dispatch('ACTION_FETCH_COUNT_CLIENTS', {
        name: this.searchedName,
      })
    },
  },
  computed: {
    ...mapGetters(['clients', 'clientTableLoading', 'clientTablePagination']),
  },
  created() {
    this.$store.dispatch('ACTION_FETCH_CLIENTS', {
      limit: this.clientTablePagination.limit,
      page: this.clientTablePagination.page,
    })
    this.$store.dispatch('ACTION_FETCH_COUNT_CLIENTS', {})
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
      ClientService.deleteClient(record.id)
        .then(() => {
          this.$store.dispatch('ACTION_REMOVE_CLIENT', record.id)
        })
        .finally(() => {
          this.$nprogress.done()
        })
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
        this.$nprogress.start()
        if (!err) {
          ClientService.addClient(values)
            .then((response) => {
              if (!response.error) {
                this.$store.dispatch('ACTION_ADD_CLIENT', response)
                this.closeAddMode()
              } else {
                this.$notification['warning']({
                  message: response.message,
                  description: response.description,
                  duration: 2,
                })
              }
            }).finally(() => {
              this.$nprogress.done()
            })
        }
      })
    },
    handleTableChange(pagination, filters, sorter) {
      const pager = { ...this.clientTablePagination }
      pager.current = pagination.current
      this.clientTablePagination = pager
      this.$store.dispatch('ACTION_FETCH_CLIENTS', {
        limit: pagination.pageSize,
        page: pagination.current,
      })
      this.$store.dispatch('ACTION_FETCH_COUNT_CLIENTS', {
      })
    },
    resetFilterSettings() {
      this.searchedName = null
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
