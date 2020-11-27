<template>
  <div :class="$style.auth">
    <div class="pt-5 pb-5 d-flex align-items-end mt-auto">
      <img src="resources/images/favicon.png" alt="Smeltor" />
      <div class="air__utils__logo__text">
        <div class="air__utils__logo__name text-uppercase text-dark font-size-21">SMELTOR</div>
        <div class="air__utils__logo__descr text-uppercase font-size-12 text-gray-6">DATA EXTRACTION</div>
      </div>
    </div>
    <div class="pl-5 pr-5 pt-5 pb-5 bg-white text-center" :class="$style.container">
      <div class="text-dark font-size-30 mb-2 text-center">Log In</div>
      <a-form class="mb-4" :form="form" @submit.prevent="login">
        <a-form-item>
          <a-input
            size="large"
            v-model="email"
            placeholder="Email"
            v-decorator="['email', { initialValue: '', rules: [{ required: true, message: 'Please input your username!' }]}]"
          />
        </a-form-item>
        <a-form-item>
          <a-input
            size="large"
            v-model="password"
            placeholder="Password"
            type="password"
            v-decorator="['password', {initialValue: '', rules: [{ required: true, message: 'Please input your Password!' }]}]"
          />
        </a-form-item>
        <button
          type="submit"
          name="button"
          size="large"
          class="text-center btn btn-success w-100 font-weight-bold font-size-18"
        >Log in</button>
      </a-form>

    </div>
    <div class="text-center font-size-18 pt-4 mb-auto">
      Don't have an account?
      <router-link to="/system/register" class="font-weight-bold text-blue text-underlined">
        <u>Sign Up</u>
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
export default {
  name: 'AirLogin',
  data: function () {
    return {
      form: this.$form.createForm(this),
      email: '',
      password: '',
    }
  },
  methods: {
    login() {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$nprogress.start()
          this.$store.dispatch('LOGIN', {
            email: this.email,
            password: this.password,
          }).then((data) => {
            this.$nprogress.done()
            this.$router.push({ name: 'documents' })
          }).catch((error) => {
            this.$nprogress.done()
            this.$notification['warning']({
              message: error.response.statusText,
              description: error.response.data.message,
              duration: 1,
            })
          })
        }
      })
    },
  },
}
</script>
<style lang="scss" module>
@import "@/components/system/Auth/style.module.scss";
</style>
