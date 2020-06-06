<template>
  <div>
    <div class="row">
      <div class="col-md-4"></div>
    <a-button-group>
      <a-button type="primary" id="prev-page"> <a-icon type="left" /> </a-button>
      <a-button type="primary">
      <span class="page-info">
        Page <span id="page-num"></span> of <span id="page-count"></span>
      </span>
      </a-button>
      <a-button type="primary" id="next-page"> <a-icon type="right" /> </a-button>
    </a-button-group>
    </div>
    <br>
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
  },
  watch: {
    name: async function() {
      this.renderPdf()
    },
  },
  methods: {
    async renderPdf () {
      let pdfDoc = null
      let pageNum = 1
      let pageIsRendering = false
      let pageNumIsPending = null

      const scale = 1.0
      const canvas = document.querySelector('#pdf-render')
      const ctx = canvas.getContext('2d')

      // Render the page
      const renderPage = num => {
        pageIsRendering = true

        // Get page
        pdfDoc.getPage(num).then(page => {
          // Set scale
          const viewport = page.getViewport({ scale })
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
        queueRenderPage(pageNum)
      }

      // Show Next Page
      const showNextPage = () => {
        if (pageNum >= pdfDoc.numPages) {
          return
        }
        pageNum++
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
      document.querySelector('#prev-page').addEventListener('click', showPrevPage)
      document.querySelector('#next-page').addEventListener('click', showNextPage)
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
