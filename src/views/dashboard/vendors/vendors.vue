<template>
  <div>
    <br>
    <div class="air__utils__heading">
      <b-row>
        <b-col md="1" class="my-1">
          <h5>Fournisseurs </h5>
        </b-col>
        <b-col md="6" class="my-1">

        </b-col>
      </b-row>
    </div>
    <div>
      <!-- <button
        type="button"
        class="btn btn-success btn-with-addon mr-auto text-nowrap d-none d-md-block"
        style="margin-bottom:1%"
        @click="addVendor"
      >
        <span class="btn-addon">
          <i class="btn-addon-icon fe fe-plus-circle" />
        </span>
        Ajouter Fournisseur
      </button> -->
      <div class="d-flex flex-column justify-content-center">
          <button type="button"
        class="btn btn-success btn-with-addon mr-auto text-nowrap d-none d-md-block"
        style="margin-bottom:1%"
            @click="changeAddMode"
            v-if="!addMode"
          >
          <span class="btn-addon">
          <i class="btn-addon-icon fe fe-plus-circle" />
        </span>
            Ajouter Fournisseur
          </button>
          <button
          type="button"
        class="btn btn-outline-info  mr-auto d-md-block"
        style="margin-bottom:1%"
            @click="changeAddMode"
            v-if="addMode"
          >
           Annuler
          </button>
        </div>
        <div class="card" v-if="addMode">
          <div class="card-body">
            <br/>
          <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit.prevent="handleSubmit">
            <a-form-item label="Intitulé">
              <a-input
                v-decorator="['name', { rules: [{ required: true, message: 'l\'Intitulé doit être indiqué' }] }]"
              />
            </a-form-item>
            <a-form-item label="Référence">
              <a-input
                v-decorator="['reference', { rules: [{ required: true, message: 'la Référence doit être indiquée' }] }]"
              />
            </a-form-item>
            <a-form-item label="N° Compte">
              <a-input
                v-decorator="['code', { rules: [{ required: true, message: 'Numéro de compte requis' }] }]"
              />
            </a-form-item>
            <a-form-item label="Adresse">
              <a-input
                v-decorator="['address', { rules: [{ required: false, message: '' }] }]"
              />
            </a-form-item>
            <a-form-item label="Réf.tiers">
              <a-input
                v-decorator="['refTiers', { rules: [{ required: false, message: '' }] }]"
              />
            </a-form-item>
            <a-form-item label="Réf.tiers payeur">
              <a-input
                v-decorator="['refTiersPayer', { rules: [{ required: false, message: '' }] }]"
              />
            </a-form-item>
            <a-form-item label="Devise">
              <a-input
                v-decorator="['currency', { rules: [{ required: false, message: '' }] }]"
              />
            </a-form-item>
            <a-form-item label="Compte Général">
              <a-input
                v-decorator="['generalAccount', { rules: [{ required: false, message: '' }] }]"
              />
            </a-form-item>
            <a-form-item label="IBAN">
              <a-input
                v-decorator="['iban', { rules: [{ required: false, message: '' }] }]"
              />
            </a-form-item>
            <a-form-item label="BIC">
              <a-input
                v-decorator="['bic', { rules: [{ required: false, message: '' }] }]"
              />
            </a-form-item>

            <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
              <a-button type="primary" html-type="submit">
                Confirmer
              </a-button>
            </a-form-item>
          </a-form>
          </div></div>
        <a-table
            :columns="columns"
            :row-key="record => record.id"
            :data-source="pageData"
            :pagination="tablePagination"
            @change="handlePaginationChange"
        >
        <template
            v-for="col in ['name', 'code']"
            :slot="col"
            slot-scope="text, record, index"
          >
            <div :key="col">
              <a-input
                style="margin: -5px 0"
                :value="text"
                v-if="record.editable"
                @change="e => handleChange(e.target.value, index, col)"
              />
              <template v-else>
                {{ text }}
              </template>
            </div>
        </template>

        <template slot="operation" slot-scope="text, record, index">
        <div class="editable-row-operations">
          <span>
            <a @click="() => onEdit(record)">Modifier</a>
              <a-popconfirm
                title="Êtes-vous sûr de supprimer?"
                @confirm="() => onDelete(index)"
              >
                <a>Supprimer</a>
              </a-popconfirm>
          </span>
        </div>
      </template>
        </a-table>
    </div>
 </div>
</template>
<script>
import { cloneDeep, pick } from 'lodash'
import axios from 'axios'
import VendorService from '../../../services/vendorService'
const columns = [
  {
    title: 'Nom',
    dataIndex: 'name',
    width: '15%',
    scopedSlots: { customRender: 'name' },
  },
  {
    title: 'N° compte',
    dataIndex: 'code',
    width: '10%',
    scopedSlots: { customRender: 'code' },
  },
  {
    title: 'Référence',
    dataIndex: 'reference',
    width: '15%',
    scopedSlots: { customRender: 'reference' },
  },
  {
    title: 'Adresse',
    dataIndex: 'address',
    width: '10%',
    scopedSlots: { customRender: 'address' },
  },
  {
    title: 'Réf.Tiers',
    dataIndex: 'refTiers',
    width: '10%',
    scopedSlots: { customRender: 'refTiers' },
  },
  {
    title: 'Réf.Tiers Payeur',
    dataIndex: 'refTiersPayer',
    width: '10%',
    scopedSlots: { customRender: 'refTiersPayer' },
  },
  {
    title: 'Compte Général',
    dataIndex: 'generalAccount',
    width: '10%',
    scopedSlots: { customRender: 'generalAccount' },
  },
  {
    title: 'Opération',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: 'dynamic_form_item' })
    this.form.getFieldDecorator('name', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('reference', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('code', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('address', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('refTiers', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('refTiersPayer', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('currency', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('generalAccount', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('iban', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('bic', { initialValue: '', preserve: true })
  },
  data() {
    return {
      pagination: {},
      editingKey: '',
      cache: [],
      pageData: [],
      columns,
      limit: 10,
      page: 1,
      total: 10,
      addMode: false,
      editMode: false,
      editableItemId: '',
    }
  },
  created() {
    this.fetchVendors()
  },
  computed: {
    tablePagination: function () {
      return {
        limit: this.limit,
        page: this.page,
        total: this.total,
      }
    },
  },
  methods: {
    handleChange(value, index, col) {
      this.pageData[index][col] = value
    },
    handlePaginationChange(pagination, filters, sorter) {
      this.limit = pagination.pageSize
      this.page = pagination.current
      this.fetchVendors()
    },
    addVendor() {
      this.pageData.forEach(element => {
        element.editable = false
      })
      this.cache = cloneDeep(this.pageData)
      let newVendor = {
        code: '',
        name: '',
        editable: true,
      }
      this.pageData = [...this.pageData, newVendor]
    },
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        this.$nprogress.start()
        if (!err) {
          let newVendor = cloneDeep(values)
          newVendor.confirmed = true
          if (!this.editMode) {
            VendorService.postNewVendor(newVendor)
              .then(
                () => {
                  this.fetchVendors()
                  this.changeAddMode()
                }
              ).finally(() => {
                this.$nprogress.done()
              })
          } else {
            VendorService.updateVendor(this.editableItemId, newVendor)
              .then(
                () => {
                  this.fetchVendors()
                  this.changeAddMode()
                }
              ).finally(() => {
                this.$nprogress.done()
              })
          }
        }
      })
    },
    saveChange(index) {
      let newPageData = cloneDeep(this.pageData)
      newPageData[index].editable = false
      this.pageData = newPageData
      this.cache = newPageData
      if (this.pageData[index]._id) {
        this.updateVendor(index, this.pageData[index])
      } else {
        this.postNewVendor(index, this.pageData[index])
      }
    },
    cancelChange(index) {
      this.pageData = cloneDeep(this.cache)
    },
    onEdit (record) {
      this.addMode = true
      this.editMode = true
      this.editableItemId = record.id
      this.form.setFieldsValue({
        name: record.name,
        reference: record.reference,
        code: record.code,
        address: record.address,
        refTiers: record.refTiers,
        refTiersPayer: record.refTiersPayer,
        currency: record.currency,
        generalAccount: record.generalAccount,
        iban: record.iban,
        bic: record.bic,
      })
    },
    onDelete (idx) {
      const vendorId = this.pageData[idx]._id
      this.pageData.splice(idx, 1)
      this.deleteVendor(vendorId)
    },
    postNewVendor(idx, vendor) {
      let newVendor = Object.assign(pick(vendor, ['name', 'code']), { confirmed: true })
      return axios.post(`/v1/vendors`, ...newVendor)
        .then(
          ({ data }) => {
            this.pageData[idx] = data
            this.cache = cloneDeep(this.pageData)
          }
        )
    },
    fetchVendors() {
      return axios.get(`/v1/vendors`, { params: { page: this.page, limit: this.limit } })
        .then(
          ({ data }) => {
            this.total = data.totalResults
            this.pageData = cloneDeep(data.results)
            this.cache = cloneDeep(data.results)
          }
        )
    },
    updateVendor(idx, vendor) {
      return axios.patch(`/v1/vendors/${vendor._id}`, pick(vendor, ['name', 'code']))
        .then(
          ({ data }) => {
            this.pageData[idx] = data
            this.cache = cloneDeep(this.pageData)
          }
        )
    },
    deleteVendor(vendorId) {
      return axios.delete(`/v1/vendors/${vendorId}`)
        .then(
          () => {
          }
        )
    },
    changeAddMode() {
      if (this.addMode) this.editMode = false
      this.addMode = !this.addMode
    },
  },
}
</script>
<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>
