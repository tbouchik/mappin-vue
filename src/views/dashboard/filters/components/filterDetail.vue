<template>
  <div>
    <br>
    <div class="air__utils__heading">
      <b-row>
        <b-col md="10" class="my-1">
          <h5>{{ $t('template.edit') }}</h5>
        </b-col>
        <b-col md="2" class="my-1">
          <button
            @click="showDeleteConfirm"
            type="button"
            class="btn btn-danger btn-with-addon mr-auto text-nowrap d-none d-md-block"
          >
            <span class="btn-addon">
              <i class="btn-addon-icon fe fe-trash-2" />
            </span>
            {{ $t('template.delete') }}
          </button>

        </b-col>
      </b-row>
    </div>
        <div class="card">
          <div class="card-body">
            <a-form :form="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 12 }" @submit.prevent="handleSubmit">
              <a-form-item label="Name">
              <a-input
                v-decorator="['name', { rules: [{ required: true, message: 'Veuillez renseigner le nom du template' }] }]"
              />
              </a-form-item>
              <a-form-item label="Description">
              <a-input
                v-decorator="['description', { rules: [{ required: false, message: 'Veuillez renseigner la description' }] }]"
              />
              </a-form-item>
              <a-form-item label="Type">
              <a-select
                  @change="e => handleTypeChange(e)"
                  v-decorator="[
                    'type',
                    { rules: [{ required: true, message: 'Veuillez renseigner le type' }] },
                  ]"
                  :placeholder="$t('template.typeSelect')"
                >
                  <template>
                    <a-select-option value="invoice">{{ $t('accounting.invoice') }} </a-select-option>
                    <a-select-option value="bankStatement"> {{ $t('accounting.bankStatement') }} </a-select-option>
                  </template>
                </a-select>
              </a-form-item>
              <a-form-item
                v-for="(k, index) in names"
                :key="index"
                v-bind="index === 0 ? formItemLayout : formItemLayoutWithOutLabel"
                :label="index === 0 ? $t('template.keys') : ''"
                :required="true"
                >
                  <a-input
                      :value= k.value
                      :placeholder="$t('template.placeholder.keyName')"
                      style="width: 25%; margin-right: 8px"
                      @change="e => handleChange(e, index)"

                  />
                  <a-select
                    :value=k.type
                    style="width: 15%; margin-right: 4px"
                    :placeholder="$t('template.placeholder.keyType')"
                    @change="e => handleKeyTypeChange(e, index)"

                  >
                    <a-select-option value="REF">
                      {{ $t('template.type.ref') }}
                    </a-select-option>
                    <a-select-option value="TEXT">
                      {{ $t('template.type.text') }}
                    </a-select-option>
                    <a-select-option value="NUMBER">
                      {{ $t('template.type.number') }}
                    </a-select-option>
                    <a-select-option value="DATE">
                      {{ $t('template.type.date') }}
                    </a-select-option>
                  </a-select>
                  <a-cascader
                    v-if="displayBankRoles"
                    :options="bankOptions"
                    :value=k.role
                    :display-render="displayRender"
                    expand-trigger="hover"
                    placeholder="Role"
                    style="width: 10%; margin-right: 4px"
                    @change="e => handleRoleChange(e, index)"
                  />
                  <a-cascader
                    v-else
                    :options="invoiceOptions"
                    :value=k.role
                    :display-render="displayRender"
                    expand-trigger="hover"
                    placeholder="Role"
                    style="width: 10%; margin-right: 4px"
                    @change="e => handleRoleChange(e, index)"
                  />
                  <a-checkbox @change="e => imputationChange(e, index)" :checked="k.isImputable"  style="color:black">
                    IMPUTABLE
                  </a-checkbox>
                  <a-icon
                      v-if="names.length > 1"
                      class="dynamic-delete-button"
                      type="minus-circle-o"
                      :disabled="form.getFieldValue('keys').length === 1"
                      @click="() => remove(index)"
                  />
                  <div v-if="k.type !== 'REF'">
                    <template v-for="tag in k.tags">
                      <a-tooltip v-if="tag.length > 20" :key="tag" :title="tag">
                        <a-tag :key="tag" :closable="true" color="purple" @close="() => handleTagClose(index, tag)">
                          {{ `${tag.slice(0, 20)}...` }}
                        </a-tag>
                      </a-tooltip>
                      <a-tag v-else :key="tag" :closable="true" color="purple" @close="() => handleTagClose(index, tag)">
                        {{ tag }}
                      </a-tag>
                    </template>
                    <a-input
                      v-if="tagInputIsActive(index)"
                      type="text"
                      size="small"
                      :ref="hash(index)"
                      :style="{ width: '78px' }"
                      :value="inputValue"
                      @change="handleTagInputChange"
                      @blur="() => handleTagInputConfirm(index)"
                      @keypress.enter.prevent="() => handleTagInputConfirm(index)"
                    />
                    <a-tag v-else style="background: #fff; borderStyle: dashed;"
                      @click="() => showTagInput(index)">
                      <a-icon type="plus" /> {{ $t('template.newTag') }}
                    </a-tag>
                  </div>
              </a-form-item>
        <a-form-item v-bind="formItemLayoutWithOutLabel">
        <a-button  type="dashed" style="width: 60%" @click="add">
            <a-icon type="plus" /> {{ $t('template.addField') }}
        </a-button>
        </a-form-item>
        <a-form-item v-bind="formItemLayoutWithOutLabel">
        <a-button type="primary" html-type="submit">
            {{ $t('template.save') }}
        </a-button>
        </a-form-item>
          </a-form>
        </div>
          </div>
      </div>

</template>

<script>
import { cloneDeep } from 'lodash'
import { Modal } from 'ant-design-vue'
import FilterService from '../../../../services/filterService'
// eslint-disable-next-line
let id = 0

export default {
  components: {
    // eslint-disable-next-line
    Modal,
  },
  name: 'FilterDetailComponent',
  props: {
    filterId: {
      type: String,
    },
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: 'dynamic_form_item' })
    this.form.getFieldDecorator('keys', { initialValue: [], preserve: true })
    this.form.getFieldDecorator('names', { initialValue: [], preserve: true })
    this.form.getFieldDecorator('description', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('type', { initialValue: '', preserve: true })
    this.form.getFieldDecorator('name', { initialValue: '', preserve: true })
  },
  data() {
    return {
      formItemLayout: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 20 },
        },
      },
      bankOptions: [
        {
          value: 'BANK',
          label: 'Relevé bancaires',
          children: [
            {
              value: 'BANK_NAME',
              label: 'Nom de la banque',
            },
            {
              value: 'DATE_FROM',
              label: 'Date début',
            },
            {
              value: 'DATE_TO',
              label: 'Date fin',
            },
          ],
        },
        {
          value: 'N/A',
          label: 'Aucun',
        }],
      invoiceOptions: [{
        value: 'INVOICE',
        label: 'Factures',
        children: [
          {
            value: 'INVOICE_REF',
            label: 'Référence Facture',
          },
          {
            value: 'TOTAL_HT',
            label: 'Total HT',
          },
          {
            value: 'TOTAL_TTC',
            label: 'Total TTC',
          },
          {
            value: 'VAT',
            label: 'TVA',
          },
          {
            value: 'DATE_REF',
            label: 'Date Référence',
          },
          {
            value: 'DUE_DATE',
            label: 'Date d\'échéance',
          },
          {
            value: 'PAYMENT_TERMS',
            label: 'Moyen de paiement',
          },
        ],
      },
      {
        value: 'N/A',
        label: 'Aucun',
      },
      ],
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          xs: { span: 24, offset: 0 },
          sm: { span: 20, offset: 4 },
        },
      },
      names: [],
      inputValue: '',
      activatedTagIndex: -1,
      name: {
        type: String,
      },
      description: {
        type: String,
      },
      type: {
        type: String,
      },
    }
  },
  beforeMount() {
    FilterService.getDefaultFilterId()
      .then(defaultFilterIds => {
        FilterService.fetchFilter(this.filterId)
          .then((filter) => {
            this.name = filter.name
            this.description = filter.description
            this.type = filter.type
            this.names = filter.keys
            this.form.setFieldsValue({
              name: this.name,
              description: this.description,
              type: this.type,
              names: this.names,
            })
            id = this.names.length || 0
          })
      })
  },
  created() {
  },
  computed: {
    displayBankRoles() {
      return this.type === 'bankStatement'
    },
  },
  methods: {
    remove(index) {
      this.names.splice(index, 1)
    },
    add() {
      this.names.push({ type: undefined, value: null, isImputable: false, tags: [] })
    },
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          const { description, name, type } = values
          const payloadBody = {
            name,
            description,
            type,
            keys: this.names,
          }
          this.$store.dispatch('ACTION_UPDATE_FILTER', {
            id: this.filterId,
            body: payloadBody,
          })
        }
      })
      this.$router.push({ name: 'filters' })
    },

    handleChange(e, index) {
      e.preventDefault()
      let newNames = cloneDeep(this.names)
      newNames[index].value = e.target.value
      this.names = newNames
    },
    handleTypeChange(e) {
      this.type = e
    },
    handleKeyTypeChange(e, index) {
      let newNames = cloneDeep(this.names)
      newNames[index].type = e
      this.names = newNames
    },
    handleRoleChange(e, index) {
      let newNames = cloneDeep(this.names)
      if (e[e.length - 1] === 'N/A') {
        newNames[index].role = undefined
      } else {
        newNames[index].role = e
      }
      this.names = newNames
    },
    displayRender({ labels }) {
      return labels[labels.length - 1]
    },
    goToFilterDashboard() {
      this.$router.push({ name: 'filters' })
    },
    handleTagClose(index, removedTag) {
      this.names[index].tags = this.names[index].tags.filter(tag => tag !== removedTag)
    },
    showTagInput(index) {
      this.activatedTagIndex = index
      this.$nextTick(function() {
        console.log(this.$refs)
        this.$refs[this.hash(index)][0].focus()
      })
    },
    handleTagInputChange(e) {
      e.preventDefault()
      this.inputValue = e.target.value
    },
    handleTagInputConfirm(index) {
      this.activatedTagIndex = -1
      const inputValue = this.inputValue
      this.inputValue = ''
      let tags = this.names[index].tags
      if (inputValue && tags.indexOf(inputValue) === -1) {
        this.names[index].tags = [...tags, inputValue]
      }
    },
    tagInputIsActive(index) {
      return this.activatedTagIndex === index
    },
    hash(index) {
      return `input_${index}`
    },
    showDeleteConfirm() {
      const id = this.filterId
      const router = this.$router
      Modal.confirm({
        title: 'Are you sure delete this template?',
        content: `Name: ${this.name}`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk() {
          FilterService.deleteFilter(id)
          router.push({ name: 'filters' })
        },
      })
    },
    imputationChange(e, index) {
      e.preventDefault()
      let newNames = cloneDeep(this.names)
      newNames[index].isImputable = e.target.checked
      this.names = newNames
    },
  },
}
</script>
<style>
.dynamic-delete-button {
  cursor: pointer;
  position: relative;
  top: 4px;
  font-size: 24px;
  color: #999;
  transition: all 0.3s;
}
.dynamic-delete-button:hover {
  color: #777;
}
.dynamic-delete-button[disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
