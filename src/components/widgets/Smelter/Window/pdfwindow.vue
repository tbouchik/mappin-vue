<template>
  <div>
    <br />
    <div class="row">
      <div class="col-md-4"></div>
      <div class="col-md-6">
        <a-button-group>
          <a-button type="primary" id="prev-page">
            <a-icon type="left" />
          </a-button>
          <a-button type="primary">
            <span class="page-info">
              Page
              <span id="page-num"></span> of
              <span id="page-count"></span>
            </span>
          </a-button>
          <a-button type="primary" id="next-page">
            <a-icon type="right" />
          </a-button>
          <br />
        </a-button-group>
      </div>
      <div class="col-md-2">
        <a-button-group>
          <a-button type="primary" icon="download" :size="size">
            <a
            @click.prevent="downloadItem" >Download PDF
            </a>
        </a-button>
        </a-button-group>
      </div>
    </div>
    <br />
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <canvas id="pdf-render"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DocumentService from '../../../../services/documentService.js'
import { mapGetters } from 'vuex'

var pdfjsLib = require('pdfjs-dist')
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
  },
  watch: {
    name: async function() {
      this.renderPdf()
    },
  },
  computed: {
    src: function() {
      return `http://localhost:3000/media/${this.name}`
    },
    ...mapGetters(['current']),
  },
  methods: {
    async renderPdf() {
      let pdfDoc = null
      let pageNum = 1
      let pageIsRendering = false
      let pageNumIsPending = null
      this.$store.dispatch('ACTION_RESET_PAGE')

      const canvas = document.querySelector('#pdf-render')
      const ctx = canvas.getContext('2d')

      // Render the page
      const renderPage = num => {
        pageIsRendering = true

        // Get page
        pdfDoc.getPage(num).then(page => {
          // Set scale
          const viewport = page.getViewport(
            document.querySelector('.card-body').offsetWidth /
              page.getViewport(1.0).width
          )
          canvas.height = viewport.height
          canvas.width = viewport.width

          const renderCtx = {
            canvasContext: ctx,
            viewport,
          }

          page.render(renderCtx).promise.then(() => {
            pageIsRendering = false

            if (pageNumIsPending !== null) {
              renderPage(pageNumIsPending)
              pageNumIsPending = null
            }
            if (this.currentPageData) {
              for (var i = 0; i < this.currentPageData.length; i++) {
                ctx.beginPath()
                ctx.rect(
                  canvas.width * this.currentPageData[i].KeyLeft,
                  canvas.height * this.currentPageData[i].KeyTop,
                  canvas.width * this.currentPageData[i].KeyWidth,
                  canvas.height * this.currentPageData[i].KeyHeight
                )
                ctx.strokeStyle = 'purple'
                ctx.stroke()
                ctx.beginPath()
                ctx.rect(
                  canvas.width * this.currentPageData[i].ValueLeft,
                  canvas.height * this.currentPageData[i].ValueTop,
                  canvas.width * this.currentPageData[i].ValueWidth,
                  canvas.height * this.currentPageData[i].ValueHeight
                )
                ctx.strokeStyle = 'blue'
                ctx.stroke()
              }
            }
          })
          // Output current page
          document.querySelector('#page-num').textContent = num
        })
      }

      // Check for pages rendering
      const queueRenderPage = num => {
        if (pageIsRendering) {
          pageNumIsPending = num
        } else {
          renderPage(num)
        }
      }

      // Show Prev Page
      const showPrevPage = () => {
        if (pageNum <= 1) {
          return
        }
        pageNum--
        this.$store.dispatch('ACTION_DERCREMENT_PAGE')
        queueRenderPage(pageNum)
      }

      // Show Next Page
      const showNextPage = () => {
        if (pageNum >= pdfDoc.numPages) {
          return
        }
        pageNum++
        this.$store.dispatch('ACTION_INCREMENT_PAGE')
        queueRenderPage(pageNum)
      }

      // Get Document
      pdfjsLib
        .getDocument(`http://localhost:3000/media/${this.name}`)
        .promise.then(pdfDoc_ => {
          pdfDoc = pdfDoc_
          document.querySelector('#page-count').textContent = pdfDoc.numPages
          renderPage(pageNum)
        })
        .catch(err => {
          // Display error
          const div = document.createElement('div')
          div.className = 'error'
          div.appendChild(document.createTextNode(err.message))
          document.querySelector('body').insertBefore(div, canvas)
          // Remove top bar
          document.querySelector('.top-bar').style.display = 'none'
        })

      // Button Events
      document
        .querySelector('#prev-page')
        .addEventListener('click', showPrevPage)
      document
        .querySelector('#next-page')
        .addEventListener('click', showNextPage)
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
