<template>
  <div :class="$style.auth">
    <div class="pt-5 pb-5 d-flex align-items-end mt-auto">
      <img src="resources/images/air-logo.png" alt="Smeltor" />
      <div class="air__utils__logo__text">
        <div class="air__utils__logo__name text-uppercase text-dark font-size-21">Smeltor</div>
        <div class="air__utils__logo__descr text-uppercase font-size-12 text-gray-6">Data Extraction</div>
      </div>
    </div>
    <div class="pl-5 pr-5 pt-5 pb-5 bg-white text-center" :class="$style.container">
      <div class="text-dark font-size-30 mb-4">Réinitialiser le mot de passe</div>
      <a-form class="mb-4" :form="form">
        <a-form-item>
          <a-input
            placeholder="Adresse Email"
            v-decorator="['email', {rules: [{ required: true, message: 'Please input your Email!', type: 'email' }]}]"
          />
        </a-form-item>
        <button
          type="button"
          class="text-center btn btn-success w-100 font-weight-bold font-size-18"
          @click="sendResetPasswordMail"
          :disabled="hasErrors(form.getFieldsError())"
        >Reset my password</button>
      </a-form>
    </div>
    <div class="text-center font-size-18 pt-4 mb-auto">
      <router-link to="/system/login" class="font-weight-bold text-blue">
        <i class="fe fe-arrow-left align"></i> Go Back
      </router-link>
    </div>
    <div class="mt-auto pb-5 pt-5">
      <!-- <ul
        class="list-unstyled d-flex mb-2 flex-wrap justify-content-center"
        :class="$style.footerNav"
      >
        <li>
          <a href="#">Terms of Use</a>
        </li>
        <li>
          <a href="#">Compliance</a>
        </li>
        <li>
          <a href="#">Support</a>
        </li>
        <li>
          <a href="#">Contacts</a>
        </li>
      </ul> -->
      <div class="text-gray-4 text-center">© 2019 Smeltor. All rights reserved.</div>
    </div>
  </div>
</template>
<script>
import UserService from '../../../services/userService.js'

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field])
}
export default {
  name: 'AirForgotPassword',
  data: function () {
    return {
      form: this.$form.createForm(this),
      hasErrors,
    }
  },
  methods: {
    sendResetPasswordMail() {
      this.form.validateFields((err, values) => {
        if (!err) {
          const { email } = values
          this.$nprogress.start()
          UserService.sendResetPasswordMail(email)
            .then(() => {
              this.$nprogress.done()
              this.$notification['success']({
                message: 'Reset Password',
                description: `If there's an account associated with this email, we'll send the password reset instructions immediately`,
                duration: 4,
              })
            })
        } else {
        }
      })
    },
  },
}
</script>
<style lang="scss" module>
@import "@/components/system/Auth/style.module.scss";
</style>
