<template>
  <div :class="$style.auth">
    <div class="pt-5 pb-5 d-flex align-items-end mt-auto">
      <img src="resources/images/air-logo.png" alt="Smeltor" />
      <div class="air__utils__logo__text">
        <div class="air__utils__logo__name text-uppercase text-dark font-size-21">SMELTOR</div>
        <div class="air__utils__logo__descr text-uppercase font-size-12 text-gray-6">DATA EXTRACTION</div>
      </div>
    </div>
    <div class="pl-5 pr-5 pt-5 pb-5 bg-white text-center" :class="$style.container">
      <div class="text-dark font-size-30 mb-4">Inscription</div>
      <a-form class="mb-4" :form="form" @submit.prevent="register">
        <a-form-item>
          <a-input
            placeholder="Nom Complet"
            v-model="fullName"
            v-decorator="['fullName', {rules: [{ required: true, message: 'Please input your full name!' }]}]"
          />
        </a-form-item>
        <a-form-item>
          <a-input
            placeholder="Adresse Email"
            v-model="email"
            v-decorator="['email', {rules: [{ required: true, message: 'Please input your email address!' },  { type: 'email' }]}]"
          />
        </a-form-item>
        <a-form-item>
          <a-input
            placeholder="Nom de l'entreprise"
            v-model="company"
            v-decorator="['company', {rules: [{ required: true, message: 'Please input your email address!' }]}]"
          />
        </a-form-item>
        <a-form-item>
          <a-input
            placeholder="Mot de passe"
            v-model="password"
            type="password"
            v-decorator="['password', {rules: [{ required: true, message: 'Please input your Password!' }]}]"
          />
        </a-form-item>
        <button
          type="submit"
          name="button"
          class="text-center btn btn-success w-100 font-weight-bold font-size-18"
        >S'inscrire</button>
      </a-form>
      <!-- <div class="font-size-18">
        By signing up, you agree to the
        <a
          href="#"
          class="text-blue font-weight-bold font-size-18"
        >Terms of Service</a> and
        <a href="#" class="text-blue font-weight-bold font-size-18">Privacy Policy</a>
      </div> -->
    </div>
    <div class="text-center font-size-18 pt-4 mb-auto">
      Vous avez déjà un compte?
      <router-link to="/system/login" class="font-weight-bold text-blue text-underlined">
        <u>Se connecter</u>
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
  name: 'AirRegister',
  data: function () {
    return {
      form: this.$form.createForm(this),
      fullName: '',
      email: '',
      password: '',
      company: '',
    }
  },
  methods: {
    register() {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$nprogress.start()
          this.$store.dispatch('REGISTER', {
            name: this.fullName,
            email: this.email,
            password: this.password,
            company: this.company,
          }).then((data) => {
            this.$nprogress.done()
            this.$router.push({ name: 'documents' })
            this.$notification['success']({
              message: 'Signed Up',
              description: 'You have successfully signed up to Smeltor!',
              duration: 1,
            })
          }).catch((error) => {
            this.$nprogress.done()
            this.$notification['warning']({
              message: error.response.statusText,
              description: error.response.data.message,
              duration: 2,
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
