<template>
  <div>
    <br>
    <div class="air__utils__heading">
      <b-row>
        <b-col md="3" class="my-1">
          <h5>Client Details</h5>
        </b-col>
      </b-row>
    </div>
    <div class="card">
      <div class="card">
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
                <a-form-item label="Phone Number">
                <a-input
                    v-decorator="['number', { rules: [{ required: false, message: 'Please input your client company name' }] }]"
                />
                </a-form-item>
                <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
                <a-button type="primary" html-type="submit">
                    Apply Changes
                </a-button>
                <a-button type="warning" @click="cancelChanges">
                    Cancel
                </a-button>
                </a-form-item>
            </a-form>
        </div>
    </div>
      <div class="card-body">
        <div class="air__utils__scrollTable">
          <documents :clientId="clientId"></documents>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Documents from '@/views/dashboard/documents/documents.vue'
import ClientService from '@/services/clientService.js'
import { Modal } from 'ant-design-vue'

export default {
  components: {
    Documents,
    // eslint-disable-next-line
    Modal,
  },
  props: {
    clientId: {
      type: String,
    },
  },
  data() {
    return {
      form: this.$form.createForm(this, { name: 'coordinated' }),
      name: '',
      email: '',
      company: '',
      number: '',
    }
  },
  beforeMount() {
    ClientService.fetchClient(this.clientId)
      .then((client) => {
        this.name = client.name
        this.email = client.email
        this.company = client.company
        this.number = client.number
        this.form.setFieldsValue({
          name: this.name,
          email: this.email,
          company: this.company,
          number: this.number,
        })
      })
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$nprogress.start()
          const { name, company, email } = values
          const payloadBody = {
            name,
            company,
            email,
          }
          ClientService.updateClient(
            payloadBody,
            this.clientId,
          ).then((response) => {
            if (!response.error) {
              const payload = {
                body: payloadBody,
                id: this.clientId,
              }
              this.$store.dispatch('ACTION_UPDATE_CLIENT', payload)
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
      this.$router.push({ name: 'clients' })
    },
    cancelChanges() {
      this.$router.push({ name: 'clients' })
    },
  },
}
</script>
