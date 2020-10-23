<template>
<div>
<br>
 <div class="row">
    <div class="col-9"></div>
    <div class="col-3">
    <a-button-group>
      <a-button type="primary" icon="download">
      <a
      @click.prevent="downloadItem" >Download Image</a>
    </a-button>
    </a-button-group>
    </div>
    </div>
    <br>
  <div class="row">
    <div class="col-12">
      <div class="card">
        <div class="card-body">
          <canvas id="can"></canvas>
        </div>
      </div>
    </div>
    <div v-show=hackyAttribute>
      <img id="stub" :src=src>
    </div>
  </div>
  </div>
</template>

<script>
import DocumentService from '../../../../services/documentService.js'

export default {
  name: 'SmelterImageWindow',
  data: function() {
    return {
      canvas: null,
      context: null,
      hackyAttribute: false,
    }
  },
  mounted: function() {
    this.renderImg(this.currentPageData, this.$store)
  },
  computed: {
    src: function() {
      return `/media/${this.name}`
    },
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
    name: function() {
      this.renderImg(this.currentPageData, this.$store)
    },
  },
  methods: {
    drawbackground(canvas, context, onload) {
      var imagePaper = new Image(canvas.width, canvas.height)
      imagePaper.onload = function() {
        context.drawImage(imagePaper, 0, 0, canvas.width, canvas.height)
        onload(canvas, context)
      }
      imagePaper.src = this.src
    },
    drawKvpRect(canvas, context) {
      const metadata = this.currentPageData
      for (var i = 0; i < metadata.length; i++) {
        context.beginPath()
        context.rect(
          canvas.width * metadata[i].Left,
          canvas.height * metadata[i].Top,
          canvas.width * metadata[i].Width,
          canvas.height * metadata[i].Height,
        )
        context.strokeStyle = 'purple'
        context.stroke()
      }
    },
    renderImg(currentPageData, store) {
      let canvas = document.getElementById('can')
      let ctx = canvas.getContext('2d')
      canvas.addEventListener('click', function(event) {
        let x = event.layerX
        let y = event.layerY
        let selectedTextSection = currentPageData.filter((textInfo) => {
          let leftBoundary = canvas.width * textInfo.Left
          let topBoundary = canvas.height * textInfo.Top
          let rightBoundary = canvas.width * (parseFloat(textInfo.Left) + parseFloat(textInfo.Width))
          let bottomBoundary = canvas.height * (parseFloat(textInfo.Top) + parseFloat(textInfo.Height))
          return (x > leftBoundary && x < rightBoundary) && (y > topBoundary && y < bottomBoundary)
        })
        store.dispatch('ACTION_UPDATE_ACTIVE_VALUE', selectedTextSection[0].Text)
      })
      let img = document.getElementById('stub')
      img.onload = function() {
        let imgWidth = img.naturalWidth
        let screenWidth = document.querySelector('.ant-layout-content').scrollWidth
        let scaleX = 1
        if (imgWidth > screenWidth) { scaleX = screenWidth / imgWidth }
        let imgHeight = img.naturalHeight
        let screenHeight = document.querySelector('.ant-layout-content').scrollHeight
        let scaleY = 1
        if (imgHeight > screenHeight) { scaleY = screenHeight / imgHeight }
        let scale = scaleY
        if (scaleX < scaleY) { scale = scaleX }
        if (scale < 1) {
          imgHeight = imgHeight * scale
          imgWidth = imgWidth * scale
        }
      }
      canvas.width = document.querySelector('.ant-layout-content').scrollWidth * 0.60
      canvas.height = document.querySelector('.ant-layout-content').scrollHeight
      this.drawbackground(canvas, ctx, this.drawKvpRect)
    },
    downloadItem() {
      DocumentService.downloadMedia(this.src).then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', this.name)
        document.body.appendChild(link)
        link.click()
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
img {
  width: 100%;
}
</style>
