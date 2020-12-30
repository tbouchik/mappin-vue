<template>
  <a-dropdown :trigger="['click']" placement="bottomRight">
    <div :class="$style.dropdown">
      <span class="text-uppercase"><img :src="countryFlagPath" class="mb-1" alt="Smeltor" />  {{ language }}</span>
    </div>

    <a-menu slot="overlay" @click="selectLocale">
      <a-menu-item key="en-US">

        <span class="text-uppercase font-size-12 mr-2">EN</span>
        English
      </a-menu-item>
      <a-menu-item key="fr-FR">
        <span class="text-uppercase font-size-12 mr-2">FR</span>
        French
      </a-menu-item>
    </a-menu>
  </a-dropdown>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['settings']),
    language() {
      return this.settings.locale.substr(0, 2)
    },
    countryFlagPath() {
      return this.language === 'fr' ? 'resources/images/france.png' : 'resources/images/united-kingdom.png'
    },
  },
  methods: {
    selectLocale(item) {
      const setting = 'locale'
      this.$store.commit('CHANGE_SETTING', { setting, value: item.key })
    },
  },
}
</script>

<style lang="scss" module>
@import "./style.module.scss";
.container {
    width: 20px;
    height: 12px;
}

/* resize images */
.container img {
    width: 100%;
    height: auto;
}
</style>
