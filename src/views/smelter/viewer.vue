<template>
  <div>
    <a-layout-header>
      <smelter-subbar :smeltedValidation=smeltedValidation />
    </a-layout-header>
    <a-layout-content>
      <div class="air__utils__content">
    <div class="row">
      <div class="col-md-6">
        <smelter-viewer :current="current" />
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
    </div>
    </a-layout-content>
  </div>
</template>
<script>
import SmelterViewer from '@/components/widgets/Smelter/Viewer/viewer.vue'
import SmelterPdfWindow from '@/components/widgets/Smelter/Window/pdfwindow.vue'
import SmelterImageWindow from '@/components/widgets/Smelter/Window/imgwindow.vue'
import SmelterSubbar from '@/components/widgets/Smelter/Viewer/subbar.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    SmelterSubbar,
    SmelterViewer,
    SmelterPdfWindow,
    SmelterImageWindow,
  },
  props: {
    smeltedValidation: {
      type: Boolean,
      default: false,
    },
  },
  created() {
    if (!this.documentExist && this.documentsIdList.length) {
      this.$store.dispatch('UPDATE_DOCUMENT', this.documentsIdList[0])
    }
  },
  computed: {
    ...mapGetters(['documentExist', 'current', 'documentsIdList']),
    documentName: function() {
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
