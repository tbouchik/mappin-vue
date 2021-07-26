<template>
  <div>
    <br />
    <div class="row">
      <div class="col-md-4"></div>
      <div class="col-md-5">
        <a-button-group>
          <a-button type="primary" id="prev-page" @click="showPrevPage">
            <a-icon type="left" />
          </a-button>
          <a-button type="primary">
            <span class="page-info">
              Page
              <span id="page-num"></span> {{ $t('windows.of') }}
              <span id="page-count"></span>
            </span>
          </a-button>
          <a-button type="primary" id="next-page" @click="showNextPage">
            <a-icon type="right" />
          </a-button>
          <br />
        </a-button-group>
      </div>
      <div class="col-md-2">
        <a-button-group>
          <a-button type="primary" icon="download" ghost>
            <a
            @click.prevent="downloadItem">{{ $t('windows.downloadPdf') }}
            </a>
        </a-button>
        </a-button-group>
      </div>
    </div>
    <br />
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body" id="pdf-card">
            <canvas id="pdf-render" @click="updateOsmium"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DocumentService from '../../../../services/documentService.js'
import { mapGetters } from 'vuex'

let pdfjsLib = require('pdfjs-dist')
export default {
  name: 'SmelterPdfWindow',
  mounted: async function() {
    this.renderPdf()
  },
  props: {
    name: {
      type: String,
    },
    currentPageData: {
      required: true,
    },
    isBankStatement: {
      type: Boolean,
      required: true,
    },
  },
  watch: {
    name: async function() {
      this.renderPdf()
    },
  },
  computed: {
    src: function() {
      return `/media/${this.name}`
    },
    ...mapGetters(['current', 'pdfcontext']),
  },
  data: function () {
    return {
      pageNumIsPending: null,
      pageIsRendering: false,
      pdfDoc: null,
      pageNum: 1,
    }
  },
  methods: {
    updateOsmium(event) {
      let x = event.layerX
      let y = event.layerY
      const canvas = document.querySelector('#pdf-render')
      let selectedTextSection = this.currentPageData.filter((textInfo) => {
        let leftBoundary = canvas.width * textInfo.Left
        let topBoundary = canvas.height * textInfo.Top
        let rightBoundary = canvas.width * (parseFloat(textInfo.Left) + parseFloat(textInfo.Width))
        let bottomBoundary = canvas.height * (parseFloat(textInfo.Top) + parseFloat(textInfo.Height))
        return (x > leftBoundary && x < rightBoundary) && (y > topBoundary && y < bottomBoundary)
      })
      if (selectedTextSection[0] && selectedTextSection[0].Text) {
        this.$store.dispatch('ACTION_SET_PDF_ACTIVE_BBOX', { canvas, bbox: selectedTextSection[0] })
        if (!this.isBankStatement) {
          this.$store.dispatch('ACTION_DO_AUTO_CHANGES_TO_INVOICE', selectedTextSection[0])
        } else {
          this.$store.dispatch('ACTION_AUTO_CHANGES_TO_STATEMENT', selectedTextSection[0])
        }
      }
    },
    renderPage(num) {
      this.pageIsRendering = true
      let canvParent = document.querySelector('#pdf-card')
      let oldcanv = document.querySelector('#pdf-render')
      canvParent.removeChild(oldcanv)

      let canv = document.createElement('canvas')
      canv.id = 'pdf-render'
      canvParent.appendChild(canv)
      canv.addEventListener('click', this.updateOsmium)

      const canvas = document.querySelector('#pdf-render')
      this.$store.dispatch('ACTION_SET_PDF_CONTEXT', canvas)
      // Get page
      this.pdfDoc.getPage(num).then(page => {
        // Set scale
        if (this.pdfcontext) {
          this.$store.dispatch('ACTION_SET_PDF_CONTEXT_SCALE', canvas)
        }
        const viewport = page.getViewport(
          document.querySelector('.card-body').offsetWidth /
            page.getViewport(1.0).width
        )
        canvas.height = viewport.height
        canvas.width = viewport.width
        const renderCtx = {
          canvasContext: this.pdfcontext,
          viewport,
        }
        page.render(renderCtx).promise.then(() => {
          this.pageIsRendering = false

          if (this.pageNumIsPending !== null) {
            this.renderPage(this.pageNumIsPending)
            this.pageNumIsPending = null
          }
          if (this.currentPageData) {
            this.$store.dispatch('ACTION_DRAW_PDF_BBOXES', { canvas, bboxes: this.currentPageData })
          }
        })
        // Output current page
        document.querySelector('#page-num').textContent = num
      })
    },
    // Check for pages rendering
    queueRenderPage(num) {
      if (this.pageIsRendering) {
        this.pageNumIsPending = num
      } else {
        this.renderPage(num)
      }
    },
    // Show Prev Page
    showPrevPage() {
      if (this.pageNum <= 1) {
        return
      }
      this.pageNum--
      this.$store.dispatch('ACTION_DERCREMENT_PAGE')
      this.queueRenderPage(this.pageNum)
    },
    // Show Next Page
    showNextPage() {
      if (this.pageNum >= this.pdfDoc.numPages) {
        return
      }
      this.pageNum++
      this.$store.dispatch('ACTION_INCREMENT_PAGE')
      this.queueRenderPage(this.pageNum)
    },
    async renderPdf() {
      this.pdfDoc = null
      this.pageNum = 1
      this.pageIsRendering = false
      this.$store.dispatch('ACTION_RESET_PAGE')
      // Get Document
      pdfjsLib
        .getDocument(`/media/${this.name}`)
        .promise.then(pdfDoc_ => {
          if (this.pdfDoc) {
            this.pdfDoc.destroy()
          }
          this.pdfDoc = pdfDoc_
          document.querySelector('#page-count').textContent = this.pdfDoc.numPages
          this.renderPage(this.pageNum)
        })
        .catch(err => {
          console.log(err)
        })
    },
    downloadItem() {
      DocumentService.downloadPDF(this.src).then(response => {
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = this.current.name
        link.click()
        URL.revokeObjectURL(link.href)
      }).catch(console.error)
    },
  },
}
</script>
<style >
div.card-body {
  overflow: auto;
}
div.card-body {
  overflow: hidden;
}
</style>
