<template>
<div >
  <div v-if="currentIsReady" v-shortkey.push="['ctrl']" @shortkey="toggleCatMode">
    <a-layout-header>
      <smelter-subbar :smeltedValidation="smeltedValidation" :current="currentDocument" :isBankStatement="currentDocument.isBankStatement"/>
    </a-layout-header>
    <a-layout-content>
      <div  class="container-fluid"
            v-shortkey="{up: ['tab'], down: ['shift', 'tab']}"
            @shortkey="updateActiveIndex">
        <template v-if="settings.viewerVerticalSplit">
          <div class="row">
            <div class="col-md-6">
              <div :class="{ sticky: !isBankViz }">
                <template-viewer ref="statement" :document="currentDocument" :isBankStatement="currentDocument.isBankStatement" v-if="!currentDocument.isBankStatement"/>
                <br>
                <reference-viewer ref="reference" :references="references" :isBankStatement="currentDocument.isBankStatement" v-if="!currentDocument.isBankStatement"/>
                <a-collapse ref="statement"  class="top-5" :activeKey="[1, 2]" :bordered="true" v-else>
                  <a-collapse-panel key="1" header="En-tête">
                    <template-viewer  :document="currentDocument" :isBankStatement="currentDocument.isBankStatement"/>
                  </a-collapse-panel>
                  <a-collapse-panel key="2" header="Détails du relevé" :disabled="false">
                    <statement-viewer :bankOsmium="currentBankOsmium" :isArchived="current.isArchived" :dateBeg="current.dateBeg" :dateEnd="current.dateEnd"/>
                  </a-collapse-panel>
                </a-collapse>
              </div>
            </div>
            <div ref="window1" v-if="documentIsPdf"  class="col-md-6">
              <div :class="{ sticky: isBankViz }">
              <smelter-pdf-window  :name="documentName" :currentPageData="currentPageData" :isBankStatement="currentDocument.isBankStatement"/>
              </div>
            </div>
            <div ref="window2" v-else class="col-md-6 container-fluid">
                <smelter-image-window  :name="documentName" :currentPageData="currentPageData" :isBankStatement="currentDocument.isBankStatement"/>
            </div>
          </div>
        </template>
        <template v-else>
         <div class="row">
          <div class="col-md-12">
            <div class="sticky">
              <template-viewer :document="currentDocument" :isBankStatement="currentDocument.isBankStatement" v-if="!currentDocument.isBankStatement"/>
              <a-collapse class="top-5" :activeKey="[1, 2]" :bordered="true" v-else>
                  <a-collapse-panel key="1" header="En-tête">
                    <template-viewer :document="currentDocument" :isBankStatement="currentDocument.isBankStatement"/>
                  </a-collapse-panel>
                  <a-collapse-panel key="2" header="Détails du relevé" :disabled="false">
                    <statement-viewer :bankOsmium="currentBankOsmium" :isArchived="current.isArchived" :dateBeg="current.dateBeg" :dateEnd="current.dateEnd"/>
                  </a-collapse-panel>
                </a-collapse>
            </div>
          </div>
         </div>
         <div class="row">
          <div v-if="documentIsPdf" class="col-md-12">
            <div>
            <smelter-pdf-window  :name="documentName" :currentPageData="currentPageData" :isBankStatement="currentDocument.isBankStatement"/>
            </div>
          </div>
          <div v-else class="col-md-5 container-fluid">
              <smelter-image-window  :name="documentName" :currentPageData="currentPageData" :isBankStatement="currentDocument.isBankStatement"/>
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
import ReferenceViewer from '@/components/widgets/Smelter/Viewer/referenceViewer.vue'
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
    StatementViewer,
    ReferenceViewer,
  },
  data() {
    return {
      currenOsmium: [],
      currentDocument: {},
      currentBankOsmium: {},
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
      this.currenOsmium = this.currentDocument.osmium
      this.currentBankOsmium = this.currentDocument.bankOsmium
      this.references = this.currentDocument.references
      this.$store.dispatch('ACTION_RESET_CHANGE_SNAPSHOTS')
    })
  },
  watch: {
    documentId: function() {
      return DocumentService.fetchDocument(this.documentId).then(doc => {
        this.$store.dispatch('UPDATE_DOCUMENT', doc)
        this.currentDocument = doc
        const firstActiveCell = this.currentDocument.isBankStatement ? { idx: 0, col: 'Date', pane: 'statementPane' } : { idx: 0, col: 'Value', pane: 'templatePane' }
        this.$store.dispatch('ACTION_UPDATE_ACTIVE_INDEX', firstActiveCell)
        this.$store.dispatch('ACTION_RESET_CHANGE_SNAPSHOTS')
      })
    },
    currentDocument: function() {
      this.currentBankOsmium = this.currentDocument.bankOsmium
      this.currenOsmium = this.currentDocument.osmium
    },
    current: function() {
      this.currentDocument = this.current
      this.currentBankOsmium = this.currentDocument.bankOsmium
      this.currenOsmium = this.current.osmium
    },
  },
  computed: {
    ...mapState(['settings']),
    ...mapGetters(['current', 'documentsIdList', 'currentPageData', 'currentActivePane']),
    documentName: function() {
      return get(this.currentDocument, 'alias')
    },
    documentIsPdf: function() {
      return get(this.currentDocument, 'mimeType') === 'application/pdf'
    },
    currentIsReady: function() {
      return Object.values(this.currentDocument).length > 0
    },
    isBankViz: function() {
      return get(this.currentDocument, 'isBankStatement')
    },
  },
  methods: {
    updateActiveIndex(event) {
      switch (event.srcKey) {
        case 'up':
          this.$store.dispatch('ACTION_UPDATE_ACTIVE_INDEX', { move: 'inc', pane: this.currentActivePane })
          break
        case 'down':
          this.$store.dispatch('ACTION_UPDATE_ACTIVE_INDEX', { move: 'dec', pane: this.currentActivePane })
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
  top: 25px;
}
.center {
  text-align: center;
  background: white;
  border-radius: 4px;
  margin-bottom: 20px;
  padding: 30px 50px;
  margin: 20px 0;
}
.top-5 {
  margin-top: 2%;
}

</style>
