<template>
    <a-card v-if='userData' :title="userData.name">
        <p>Email: {{userData.email}}</p>
        <p>Crédits utilisés: {{userData.counter}}</p>
      </a-card>
</template>
<script>
import { cloneDeep } from 'lodash'

export default {
  data() {
    return {
      userData: null,
    }
  },
  props: {
    user: {
      type: Object,
      required: false,
    },
  },
  mounted() {
    this.userData = cloneDeep(this.user)
  },
  computed: {},
  methods: {},
}
</script>
