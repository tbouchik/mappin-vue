<template>
<div>
  <div class="ml-auto d-flex flex-column text-right justify-content-center">
        <div class="dropdown d-inline-block">
          <a-dropdown placement="bottomRight" :trigger="['click']">
            <button type="button" class="btn btn-light">
              <i class="fe fe-more-vertical" />
            </button>
            <a-menu slot="overlay">
              <a-menu-item @click="constructCopy">
                <a>{{ $t('template.constructCopy') }}</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
      </div>
  <div class="text-center">
    <p class="text-dark font-size-48 font-weight-bold mb-2">
      {{template.name}}
    </p>
    <p class="text-uppercase text-muted mb-3">
    </p>
    <p class="mb-4">
      {{template.description}}
    </p>
    <a-button class="mr-2 mb-2" type="primary" @click="goEditFilter" ghost>{{ $t('template.view') }}</a-button>
  </div>
</div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'FilterCard',
  props: {
    template: {
      type: Object,
    },
  },
  data() {
    return {
    }
  },
  created() {
  },
  computed: {
    ...mapGetters(['filters']),
  },
  methods: {
    goEditFilter() {
      const params = {
        filterId: this.template.id,
        name: this.template.name,
        description: this.template.description,
        type: this.template.type,
        keys: this.template.keys,
      }
      this.$router.push({ name: 'filter', params })
    },
    constructCopy() {
      this.$store.dispatch('ACTION_ADD_FILTER', {
        name: `${this.template.name} - ${this.$t('template.copy')} `,
        description: this.template.description,
        type: this.template.type,
        keys: this.template.keys,
      })
    },
  },
}
</script>
