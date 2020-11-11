<template>
  <div class="text-center">
    <p class="text-dark font-size-48 font-weight-bold mb-2">
      {{template.name}}
    </p>
    <p class="text-uppercase text-muted mb-3">
    </p>
    <p class="mb-4">
      {{template.description}}
    </p>
    <a-button class="mr-2 mb-2" type="primary" @click="goEditFilter" ghost>View Template</a-button>
  </div>
</template>
<script>

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
  },
  methods: {
    goEditFilter() {
      const params = {
        filterId: this.template.id,
        name: this.template.name,
        description: this.template.description,
        keys: this.template.keys,
      }
      this.$router.push({ name: 'filter', params })
    },
  },
}
</script>
