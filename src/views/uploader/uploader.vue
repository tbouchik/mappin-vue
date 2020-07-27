<template>
  <div class="row">
      <div class="col-6">
        <smelter-uppy-loader :maxFileSizeInBytes=10000000></smelter-uppy-loader>
      </div>
      <div class="col-6">
          <clients-dashboard
          :readOnlyMode="clientsComponentReadMode"
          :perPage="perPage">
          </clients-dashboard>
      </div>
  </div>
</template>
<script>
import SmelterUppyLoader from '@/components/widgets/Smelter/Uploader/uppyloader.vue'
import ClientsDashboard from '@/views/dashboard/clients/clients.vue'

export default {
  components: {
    SmelterUppyLoader,
    ClientsDashboard,
  },
  data: function() {
    return {
      clientsComponentReadMode: true,
      perPage: 7,
    }
  },
  computed: {

  },
  created() {

  },
  destroyed() {
  },
  methods: {

  },
}
</script>
<style scoped>

</style>
