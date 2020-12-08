<template>
  <div>
    <br>
    <div class="air__utils__heading">
      <b-row>
        <b-col md="10" class="my-1">
          <h5>Edit Template</h5>
        </b-col>
        <b-col md="2" class="my-1">
          <button
            v-if="!isSmartTemplate"
            @click="showDeleteConfirm"
            type="button"
            class="btn btn-danger btn-with-addon mr-auto text-nowrap d-none d-md-block"
          >
            <span class="btn-addon">
              <i class="btn-addon-icon fe fe-trash-2" />
            </span>
            Remove Template
          </button>

        </b-col>
      </b-row>
    </div>
        <div class="card">
          <div class="card-body">
            <a-form :form="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">
              <a-form-item label="Name">
              <a-input
                :disabled="isSmartTemplate"
                v-decorator="['name', { rules: [{ required: true, message: 'Please input your template name' }] }]"
              />
              </a-form-item>
              <a-form-item label="Description">
              <a-input
                :disabled="isSmartTemplate"
                v-decorator="['description', { rules: [{ required: false, message: 'Input here your template description' }] }]"
              />
              </a-form-item>
              <a-form-item label="Type">
                <a-select
                  :disabled="isSmartTemplate"
                  v-decorator="[
                    'type',
                    { rules: [{ required: false, message: 'Please select your template type' }] },
                  ]"
                  placeholder="Select a type: Expense or Sale"
                >
                  <template>
                    <a-select-option value="expense"> Expense </a-select-option>
                    <a-select-option value="sale"> Sale </a-select-option>
                  </template>
                </a-select>
              </a-form-item>
              <a-form-item
                v-for="(k, index) in names"
                :key="index"
                v-bind="index === 0 ? formItemLayout : formItemLayoutWithOutLabel"
                :label="index === 0 ? 'Keys' : ''"
                :required="true"
                >
                  <a-input
                      :value= k.value
                      placeholder="key name"
                      style="width: 50%; margin-right: 8px"
                      :disabled="isSmartTemplate"
                      @change="e => handleChange(e, index)"

                  />
                  <a-select
                    :value=k.type
                    style="width: 10%; margin-right: 4px"
                    placeholder="Select a type for this key"
                    :disabled="isSmartTemplate"
                    @change="e => handleTypeChange(e, index)"
                  >
                    <a-select-option value="REF">
                      REF
                    </a-select-option>
                    <a-select-option value="TEXT">
                      TEXT
                    </a-select-option>
                    <a-select-option value="NUMBER">
                      NUMBER
                    </a-select-option>
                    <a-select-option value="DATE">
                      DATE
                    </a-select-option>
                  </a-select>
                  <a-icon
                      v-if="names.length > 1 && !isSmartTemplate"
                      class="dynamic-delete-button"
                      type="minus-circle-o"
                      :disabled="form.getFieldValue('keys').length === 1"
                      @click="() => remove(index)"
                  />
              </a-form-item>
        <a-form-item v-bind="formItemLayoutWithOutLabel">
        <a-button v-if="!isSmartTemplate" type="dashed" style="width: 60%" @click="add">
            <a-icon type="plus" /> Add field
        </a-button>
        </a-form-item>
        <a-form-item v-bind="formItemLayoutWithOutLabel">
        <a-button v-if="!isSmartTemplate" type="primary" html-type="submit">
            Save Changes
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
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          xs: { span: 24, offset: 0 },
          sm: { span: 20, offset: 4 },
        },
      },
      names: [],
      name: {
        type: String,
      },
      description: {
        type: String,
      },
      type: {
        type: String,
      },
      isSmartTemplate: true,
    }
  },
  beforeMount() {
    FilterService.getDefaultFilterId()
      .then(defaultFilterId => {
        FilterService.fetchFilter(this.filterId)
          .then((filter) => {
            this.isSmartTemplate = defaultFilterId === filter.id
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
  methods: {
    remove(index) {
      this.names.splice(index, 1)
    },

    add() {
      this.names.push({ type: null, value: null })
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

    handleTypeChange(e, index) {
      let newNames = cloneDeep(this.names)
      newNames[index].type = e
      this.names = newNames
    },

    goToFilterDashboard() {
      this.$router.push({ name: 'filters' })
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
