<template>
<div >
  <div v-if="currentIsReady" v-shortkey.push="['ctrl']" @shortkey="toggleCatMode">
    <a-layout-header>
      <smelter-subbar :smeltedValidation="smeltedValidation" :current="currentDocument"/>
    </a-layout-header>
    <a-layout-content>
      <div  class="container-fluid"
            v-shortkey="{up: ['tab'], down: ['shift', 'tab']}"
            @shortkey="updateActiveIndex">
        <template v-if="settings.viewerVerticalSplit">
          <div class="row">
            <div class="col-md-6">
              <div class="sticky">
                <!-- <template-viewer :filter="currentFilter" :isArchived="current.isArchived"/> -->
                <statement-viewer :isArchived="current.isArchived"/>
              </div>
            </div>
            <div v-if="documentIsPdf" class="col-md-6">
              <div>
              <smelter-pdf-window  :name="documentName" :currentPageData="currentPageData" />
              </div>
            </div>
            <div v-else class="col-md-6 container-fluid">
                <smelter-image-window  :name="documentName" :currentPageData="currentPageData" />
            </div>
          </div>
        </template>
        <template v-else>
         <div class="row">
          <div class="col-md-12">
            <div class="sticky">
              <!-- <template-viewer :filter="currentFilter" :isArchived="current.isArchived"/> -->
              <statement-viewer :isArchived="current.isArchived"/>
            </div>
          </div>
         </div>
         <div class="row">
          <div v-if="documentIsPdf" class="col-md-12">
            <div>
            <smelter-pdf-window  :name="documentName" :currentPageData="currentPageData" />
            </div>
          </div>
          <div v-else class="col-md-5 container-fluid">
              <smelter-image-window  :name="documentName" :currentPageData="currentPageData" />
          </div>
        </div>
        </template>
      </div>
    </a-layout-content>
  </div>
  <div v-else>
    <a-layout-content>
      <div class="center ">
        <a-spin  size="large"/>
      </div>
    </a-layout-content>
  </div>
</div>
</template>
<script>
import TemplateViewer from '@/components/widgets/Smelter/Viewer/template.vue'
import StatementViewer from '@/components/widgets/Smelter/Viewer/statementViewer.vue'
import SmelterPdfWindow from '@/components/widgets/Smelter/Window/pdfwindow.vue'
import SmelterImageWindow from '@/components/widgets/Smelter/Window/imgwindow.vue'
import SmelterSubbar from '@/components/widgets/Smelter/Viewer/subbar.vue'
import DocumentService from '@/services/documentService.js'
import { mapGetters, mapState } from 'vuex'
import { get } from 'lodash'

export default {
  components: {
    SmelterSubbar,
    SmelterPdfWindow,
    SmelterImageWindow,
    TemplateViewer,
    StatementViewer
  },
  data() {
    return {
      currentFilter: [],
      currentDocument: {},
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
      this.$store.dispatch('UPDATE_DOCUMENT', doc)
      this.currentDocument = doc
      this.currentFilter = this.currentDocument.osmium
    })
  },
  watch: {
    documentId: function() {
      return DocumentService.fetchDocument(this.documentId).then(doc => {
        this.$store.dispatch('UPDATE_DOCUMENT', doc)
        this.currentDocument = doc
        this.$store.dispatch('ACTION_UPDATE_ACTIVE_INDEX', { idx: 0, col: 'Value' })
      })
    },
    currentDocument: function() {
      this.currentFilter = this.currentDocument.osmium
    },
    current: function() {
      this.currentDocument = this.current
      this.currentFilter = this.current.osmium
    },
  },
  computed: {
    ...mapState(['settings']),
    ...mapGetters(['current', 'documentsIdList', 'currentPageData']),
    documentName: function() {
      return get(this.currentDocument, 'alias')
    },
    documentIsPdf: function() {
      return get(this.currentDocument, 'mimeType') === 'application/pdf'
    },
    currentIsReady: function() {
      return Object.values(this.currentDocument).length > 0
    },
  },
  methods: {
    updateActiveIndex(event) {
      switch (event.srcKey) {
        case 'up':
          this.$store.dispatch('ACTION_UPDATE_ACTIVE_INDEX', { move: 'inc' })
          break
        case 'down':
          this.$store.dispatch('ACTION_UPDATE_ACTIVE_INDEX', { move: 'dec' })
          break
      }
    },
    toggleCatMode() {
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
.center {
  text-align: center;
  background: white;
  border-radius: 4px;
  margin-bottom: 20px;
  padding: 30px 50px;
  margin: 20px 0;
}

</style>
