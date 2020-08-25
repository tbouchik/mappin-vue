<template>
  <div>
    <br>
    <div class="air__utils__heading">
      <b-row>
        <b-col md="3" class="my-1">
          <h5>Add New Template</h5>
        </b-col>

      </b-row>
    </div>
        <div class="card">
          <div class="card-body">
      <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">
        <a-form-item label="Name">
        <a-input
            v-decorator="['name', { rules: [{ required: true, message: 'Please input your template name' }] }]"
        />
        </a-form-item>
        <a-form-item label="Description">
        <a-input
            v-decorator="['description', { rules: [{ required: false, message: 'Input here your template description' }] }]"
        />
        </a-form-item>
        <a-form-item
        v-for="(k, index) in form.getFieldValue('keys')"
        :key="k"
        v-bind="index === 0 ? formItemLayout : formItemLayoutWithOutLabel"
        :label="index === 0 ? 'Keys' : ''"
        :required="false"
        >
        <a-input
            v-decorator="[
            `names[${k}]`,
            {
                validateTrigger: ['change', 'blur'],
                rules: [
                {
                    required: true,
                    whitespace: true,
                    message: 'Please input key\'s name or delete this field.',
                },
                ],
            },
            ]"
            placeholder="key name"
            style="width: 60%; margin-right: 8px"
        />
        <a-icon
            v-if="form.getFieldValue('keys').length > 1"
            class="dynamic-delete-button"
            type="minus-circle-o"
            :disabled="form.getFieldValue('keys').length === 1"
            @click="() => remove(k)"
        />
        </a-form-item>
        <a-form-item v-bind="formItemLayoutWithOutLabel">
        <a-button type="dashed" style="width: 60%" @click="add">
            <a-icon type="plus" /> Add field
        </a-button>
        </a-form-item>
        <a-form-item v-bind="formItemLayoutWithOutLabel">
        <a-button type="primary" html-type="submit">
            Submit
        </a-button>
        </a-form-item>
    </a-form>
        </div>
          </div>
      </div>

</template>

<script>
import { mapGetters } from 'vuex'
let id = 0

export default {
  components: {
  },
  name: 'FiltersComponent',
  props: {

  },
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: 'dynamic_form_item' })
    this.form.getFieldDecorator('keys', { initialValue: [], preserve: true })
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
    }
  },
  created() {

  },
  computed: {
    ...mapGetters(['filters']),
  },
  mounted() {
  },
  methods: {
    remove(k) {
      const { form } = this
      // can use data-binding to get
      const keys = form.getFieldValue('keys')
      // We need at least one key
      if (keys.length === 1) {
        return
      }

      // can use data-binding to set
      form.setFieldsValue({
        keys: keys.filter(key => key !== k),
      })
    },

    add() {
      const { form } = this
      // can use data-binding to get
      const keys = form.getFieldValue('keys')
      const nextKeys = keys.concat(id++)
      // can use data-binding to set
      // important! notify form to detect changes
      form.setFieldsValue({
        keys: nextKeys,
      })
    },

    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          const { names, description, name } = values
          console.log('Received values of form: ', values)

          this.$store.dispatch('ACTION_ADD_FILTER', {
            name,
            description,
            keys: names,
          })
        }
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
