<template>
  <div class="row">
    <div class="col-md-6">
      <smelter-viewer />
    </div>
    <div class="col-md-6">
      <div class="sticky">
      <smelter-pdf-window  :name="pdfName" />
      </div>
    </div>
  </div>
</template>
<script>
import SmelterViewer from '@/components/widgets/Smelter/Viewer/viewer.vue'
import SmelterPdfWindow from '@/components/widgets/Smelter/Window/pdfwindow.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    SmelterViewer,
    SmelterPdfWindow,
  },
  computed: {
    ...mapGetters(['documentExist', 'current']),
    pdfName: function() {
      // `this` points to the vm instance
      return this.current.name
    },
  },
}
</script>
<style scoped>
div.sticky {
  position: -webkit-sticky; /* Safari */
  position: sticky;
  top: 10px;
}

</style>
