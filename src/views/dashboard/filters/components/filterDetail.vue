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
                  :placeholder="$t('template.typeSelect')"
                >
                  <template>
                    <a-select-option value="expense"> {{ $t('accounting.expense') }} </a-select-option>
                    <a-select-option value="sale">{{ $t('accounting.sale') }} </a-select-option>
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
                  <a-checkbox @change="e => imputationChange(e, index)" :checked="k.isImputable"  style="color:black">
                    IMPUTABLE
                  </a-checkbox>
                  <a-icon
                      v-if="names.length > 1 && !isSmartTemplate"
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
                      <a-icon type="plus" /> New Tag
                    </a-tag>
                  </div>
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
      isSmartTemplate: true,
    }
  },
  beforeMount() {
    FilterService.getDefaultFilterId()
      .then(defaultFilterIds => {
        FilterService.fetchFilter(this.filterId)
          .then((filter) => {
            this.isSmartTemplate = defaultFilterIds ? defaultFilterIds.includes(filter.id) : false
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
      this.names.push({ type: null, value: null, isImputable: false, tags: [] })
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
