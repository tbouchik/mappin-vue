<template>
  <div id="app">
    <localization></localization>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Localization from '@/localization'

export default {
  name: 'app',
  components: { Localization },
  computed: {
    ...mapGetters(['user']),
    nextRoute() {
      return this.$route.query.redirect || '/'
    },
  },
  watch: {
    user(auth) {
      if (auth) {
        this.$router.replace(this.nextRoute)
      }
    },
    '$route'(to, from) {
      const query = Object.assign({}, to.query)
      this.$store.commit('SETUP_URL_SETTINGS', query)
    },
  },
}
</script>
