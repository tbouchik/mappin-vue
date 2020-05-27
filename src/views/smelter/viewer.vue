<template>
  <div class="row">
    <div class="col-md-6">
      <smelter-viewer />
    </div>
    <div v-if="documentIsPdf" class="col-md-6">
      <div class="sticky">
      <smelter-pdf-window  :name="documentName" />
      </div>
    </div>
    <div v-else class="col-md-6">
      <div class="sticky">
        <smelter-image-window  :name="documentName" />
      </div>
    </div>
  </div>
</template>
<script>
import SmelterViewer from '@/components/widgets/Smelter/Viewer/viewer.vue'
import SmelterPdfWindow from '@/components/widgets/Smelter/Window/pdfwindow.vue'
import SmelterImageWindow from '@/components/widgets/Smelter/Window/imgwindow.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    SmelterViewer,
    SmelterPdfWindow,
    SmelterImageWindow,
  },
  computed: {
    ...mapGetters(['documentExist', 'current']),
    documentName: function() {
      // `this` points to the vm instance
      console.log(this.current.alias)
      return this.current.alias
    },
    documentIsPdf: function() {
      return this.current.mimeType === 'application/pdf'
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
