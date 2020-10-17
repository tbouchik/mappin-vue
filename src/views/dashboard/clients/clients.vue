<template>
  <b-container fluid>
    <!-- User Interface controls -->
    <b-row>
      <b-col md="6" class="my-1">
        <b-form-group label-cols-sm="3" label="Search Client" class="mb-0">
          <b-input-group>
            <b-form-input v-model="filter" placeholder="Type to Search"></b-form-input>
            <b-input-group-append>
              <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col md="6" class="my-1">
        <button
          v-if="!readOnlyMode"
          type="button"
          class="btn btn-success btn-with-addon mr-auto text-nowrap d-none d-md-block"
          @click="openAddMode"
        >
          <span class="btn-addon">
            <i class="btn-addon-icon fe fe-plus-circle" />
          </span>
          Add New Client
        </button>
      </b-col>
    </b-row>
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
    <!-- Main table element -->
    <b-table
      show-empty
      selectable
      stacked="md"
      responsive="sm"
      selectedVariant="success"
      :select-mode="selectMode"
      :items="clients"
      :fields="fields"
      :current-page="currentPage"
      :per-page="perPage"
      :filter="filter"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :sort-direction="sortDirection"
      @filtered="onFiltered"
      @row-selected="rowSelected"
    >
      <template slot="name" slot-scope="row">
        {{ row.value.first }} {{ row.value.last }}
      </template>

      <template slot="isActive" slot-scope="row">
        {{ row.value ? 'Yes :)' : 'No :(' }}
      </template>

      <template slot="actions" slot-scope="row">
        <b-button size="sm" @click="info(row.item, row.index, $event.target)" class="mr-1">
          Info modal
        </b-button>
        <b-button size="sm" @click="row.toggleDetails">
          {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
        </b-button>
      </template>

      <template slot="row-details" slot-scope="row">
        <b-card>
          <ul>
            <li v-for="(value, key) in row.item" :key="key">{{ key }}: {{ value }}</li>
          </ul>
        </b-card>
      </template>
    </b-table>

    <b-row>
      <b-col md="6" class="my-1">
        <b-pagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          class="my-0"
        ></b-pagination>
      </b-col>
    </b-row>
    <!-- Info modal -->
    <b-modal :id="infoModal.id" :title="infoModal.title" ok-only @hide="resetInfoModal">
      <pre>{{ infoModal.content }}</pre>
    </b-modal>
  </b-container>
</template>

<script>
import { mapGetters } from 'vuex'
import uuidv4 from 'uuid/v4'

export default {
  name: 'ClientsDashboard',
  props: {
    readOnlyMode: {
      type: Boolean,
      default: false,
    },
    perPage: {
      type: Number,
      default: 105,
    },
  },
  data() {
    return {
      fields: [
        { key: 'name', label: 'Full name', sortable: true, sortDirection: 'desc' },
        { key: 'email', label: 'Email address', sortable: true, class: 'text-center' },
        { key: 'company', label: 'Client Company', sortable: true, class: 'text-center' },
      ],
      items: [],
      totalRows: 1,
      currentPage: 1,
      sortBy: null,
      sortDesc: false,
      sortDirection: 'asc',
      filter: null,
      infoModal: {
        id: 'info-modal',
        title: '',
        content: '',
      },
      selectMode: 'single',
      selected: [],
      formLayout: 'horizontal',
      form: this.$form.createForm(this, { name: 'coordinated' }),
      addMode: false,
    }
  },
  created() {
    this.$store.dispatch('ACTION_FETCH_CLIENTS')
  },
  computed: {
    ...mapGetters(['clients']),
    sortOptions() {
      // Create an options list from our fields
      return this.fields
        .filter(f => f.sortable)
        .map(f => {
          return { text: f.label, value: f.key }
        })
    },
  },
  mounted() {
    // Set the initial number of items
    this.totalRows = this.items.length
  },
  methods: {
    info(item, index, button) {
      this.infoModal.title = `Row index: ${index}`
      this.infoModal.content = JSON.stringify(item, null, 2)
      this.$root.$emit('bv::show::modal', this.infoModal.id, button)
    },
    resetInfoModal() {
      this.infoModal.title = ''
      this.infoModal.content = ''
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    rowSelected(items, i) {
      if (this.readOnlyMode) {
        this.$store.dispatch('ACTION_SELECT_UPLOADER_CLIENT', items[0])
        this.$store.dispatch('ACTION_INCREMENT_UPLOADER_INDEX')
      }
    },
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$store.dispatch('ACTION_ADD_CLIENT', values)
          this.closeAddMode()
          console.log('Received values of form: ', values)
        }
      })
    },
    openAddMode() {
      this.addMode = true
    },
    closeAddMode() {
      this.addMode = false
    },
    generatePassword() {
      const startIdx = Math.floor(Math.random() * 10)
      const endIdx = startIdx + 10
      this.form.setFieldsValue({
        password: uuidv4().slice(startIdx, endIdx),
      })
    },
  },
}
</script>
