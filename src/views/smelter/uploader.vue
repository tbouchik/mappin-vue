<template>
  <div>
      <smelter-uploader />
      <smelter-viewer v-if="documentExist" insideUploaderView="true"/>
  </div>
</template>
<script>
import SmelterUploader from '@/components/widgets/Smelter/Uploader/uploader.vue'
import SmelterViewer from '@/components/widgets/Smelter/Viewer/viewer.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    SmelterUploader,
    SmelterViewer,
  },
  computed: {
    ...mapGetters(['documentExist']),
  },
}
</script>
