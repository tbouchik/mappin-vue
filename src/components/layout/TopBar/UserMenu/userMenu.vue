<template>
  <a-dropdown :trigger="['click']" placement="bottomLeft">
    <div :class="$style.dropdown">
      <a-badge >
        <a-avatar shape="square" icon="user" size="large" :class="$style.avatar" />
      </a-badge>
    </div>
    <a-menu slot="overlay">
      <a-menu-item>
        <strong>{{ $t('topBar.profileMenu.hello') }}, {{user.name}}</strong>
        <div>
          <strong class="mr-1">{{ $t('topBar.profileMenu.company') }}:</strong>
          {{user.company}}
        </div>
        <div>
          <strong>{{ $t('topBar.profileMenu.role') }}:</strong>
          {{user.role}}
        </div>
      </a-menu-item>
      <a-menu-divider />
      <a-menu-item>
        <div>
          <strong class="mr-1">{{ $t('topBar.profileMenu.email') }}:</strong> {{user.email}}
        </div>
        <div>
          <strong class="mr-1">{{ $t('topBar.profileMenu.phone') }}:</strong> -
        </div>
      </a-menu-item>
      <a-menu-divider />
      <a-menu-item>
        <a href="javascript: void(0);">
          <i :class="$style.menuIcon" class="fe fe-user"></i>
          {{ $t('topBar.profileMenu.editProfile') }}
        </a>
      </a-menu-item>
      <a-menu-item>
        <a @click="logout">
          <i :class="$style.menuIcon" class="fe fe-log-out"></i>
          {{ $t('topBar.profileMenu.logout') }}
        </a>
      </a-menu-item>
    </a-menu>
  </a-dropdown>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data: function () {
    return {
      count: 7,
    }
  },
  computed: {
    ...mapGetters(['user']),
  },
  methods: {
    logout() {
      this.$store.dispatch('LOGOUT')
    },
  },
}
</script>

<style lang="scss" module>
@import "./style.module.scss";
</style>
