<template>
  <div v-if="current" v-shortkey.push="['alt']" @shortkey="theAction">
    <a-layout-header>
      <smelter-subbar :smeltedValidation="smeltedValidation" :current="current"/>
    </a-layout-header>
    <a-layout-content>
      <div  class="container-fluid"
            v-shortkey="{up: ['tab'], down: ['shift', 'tab']}"
            @shortkey="updateActiveIndex">
        <div class="row">
          <div class="col-md-4">
            <div class="sticky">
              <template-viewer :filter="currentFilter" />
            </div>
          </div>
          <div v-if="documentIsPdf" class="col-md-8">
            <div>
            <smelter-pdf-window  :name="documentName" :currentPageData="currentPageData" />
            </div>
          </div>
          <div v-else class="col-md-8 container-fluid">
              <smelter-image-window  :name="documentName" :currentPageData="currentPageData" />
          </div>
        </div>
      </div>
    </a-layout-content>
  </div>
</template>
<script>
import TemplateViewer from '@/components/widgets/Smelter/Viewer/template.vue'
import SmelterPdfWindow from '@/components/widgets/Smelter/Window/pdfwindow.vue'
import SmelterImageWindow from '@/components/widgets/Smelter/Window/imgwindow.vue'
import SmelterSubbar from '@/components/widgets/Smelter/Viewer/subbar.vue'
import DocumentService from '@/services/documentService.js'
import { mapGetters } from 'vuex'
import { get } from 'lodash'

export default {
  components: {
    SmelterSubbar,
    SmelterPdfWindow,
    SmelterImageWindow,
    TemplateViewer,
  },
  data() {
    return {
      currentFilter: [],
    }
  },
  props: {
    smeltedValidation: {
      type: Boolean,
      default: false,
    },
    documentId: {
      type: String,
      required: true,
    },
  },
  created() {
    DocumentService.fetchDocument(this.documentId).then(doc => {
      this.$store.dispatch('UPDATE_DOCUMENT', doc.data)
      this.currentFilter = this.current.osmium
    })
  },
  watch: {
    documentId: function() {
      return DocumentService.fetchDocument(this.documentId).then(doc => {
        this.$store.dispatch('UPDATE_DOCUMENT', doc.data)
        this.$store.dispatch('ACTION_UPDATE_ACTIVE_INDEX', 0)
      })
    },
    current: function() {
      this.currentFilter = this.current.osmium
    },
  },
  computed: {
    ...mapGetters(['current', 'documentsIdList', 'currentPageData', 'currentActiveIndex']),
    documentName: function() {
      return get(this.current, 'alias')
    },
    documentIsPdf: function() {
      return get(this.current, 'mimeType') === 'application/pdf'
    },
  },
  methods: {
    incrementActiveIndex() {
      if (this.currentActiveIndex < this.currentFilter.length - 1) {
        this.$store.dispatch('ACTION_UPDATE_ACTIVE_INDEX', this.currentActiveIndex + 1)
      } else {
        this.$store.dispatch('ACTION_UPDATE_ACTIVE_INDEX', 0)
      }
    },
    decrementActiveIndex() {
      if (this.currentActiveIndex > 0) {
        this.$store.dispatch('ACTION_UPDATE_ACTIVE_INDEX', this.currentActiveIndex - 1)
      } else {
        this.$store.dispatch('ACTION_UPDATE_ACTIVE_INDEX', this.currentFilter.length - 1)
      }
    },
    updateActiveIndex(event) {
      switch (event.srcKey) {
        case 'up':
          this.incrementActiveIndex()
          break
        case 'down':
          this.decrementActiveIndex()
          break
      }
    },
    theAction() {
      this.$store.dispatch('ACTION_TOGGLE_CATMODE')
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
