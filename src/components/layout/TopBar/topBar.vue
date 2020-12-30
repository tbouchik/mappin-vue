<template>
  <div :class="$style.topbar">
    <div class="mr-md-4 mr-auto">
    </div>
    <div class="mr-auto d-none d-md-block">
    </div>
    <div class="mb-0 mr-4 d-xl-block d-none">
      <air-status />
    </div>
    <div class="mr-4 d-none d-sm-block">
      <air-language-switcher />
    </div>
    <div class="mr-20 d-none d-sm-block">
    </div>
    <div class>
      <air-user-menu />
    </div>
  </div>
</template>

<script>
import AirUserMenu from '@/components/layout/TopBar/UserMenu/userMenu.vue'
import AirLanguageSwitcher from '@/components/layout/TopBar/LanguageSwitcher/languageSwitcher.vue'
import AirStatus from '@/components/layout/TopBar/Status'

export default {
  components: {
    AirStatus,
    AirUserMenu,
    AirLanguageSwitcher,
  },
}
</script>

<style lang="scss" module>
@import "./style.module.scss";
</style>
