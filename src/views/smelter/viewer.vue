<template>
  <div>
      <smelter-viewer />
  </div>
</template>
<script>
import SmelterViewer from '@/components/widgets/Smelter/Viewer/viewer.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    SmelterViewer,
  },
  computed: {
    ...mapGetters(['documentExist', 'current']),
    pdfName: function () {
      // `this` points to the vm instance
      return this.current.name
    },
  },
}
</script>
