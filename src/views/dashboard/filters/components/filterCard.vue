<template>
  <div class="text-center">
    <p class="text-dark font-size-48 font-weight-bold mb-2">
      {{name}}
    </p>
    <p class="text-uppercase text-muted mb-3">
    </p>
    <p class="mb-4">
      {{description}}
    </p>
    <a href="javascript: void(0);" class="btn btn-outline-primary mb-1">View Filter</a>
  </div>
</template>
<script>
export default {
  name: 'FilterCard',
  props: {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
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
  mounted() {
  },
  methods: {

  },
}
</script>
