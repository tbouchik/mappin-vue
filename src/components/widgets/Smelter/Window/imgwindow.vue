<template>
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
</template>

<script>

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
    this.renderImg()
  },
  computed: {
    src: function() {
      return `http://localhost:3000/media/${this.name}`
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
      this.renderImg()
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
          canvas.width * metadata[i].KeyLeft,
          canvas.height * metadata[i].KeyTop,
          canvas.width * metadata[i].KeyWidth,
          canvas.height * metadata[i].KeyHeight,
        )
        context.stroke()
        context.beginPath()
        context.rect(
          canvas.width * metadata[i].ValueLeft,
          canvas.height * metadata[i].ValueTop,
          canvas.width * metadata[i].ValueWidth,
          canvas.height * metadata[i].ValueHeight,
        )
        context.stroke()
      }
    },
    renderImg() {
      this.canvas = document.getElementById('can')
      this.context = this.canvas.getContext('2d')
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
        this.context.drawImage(img, 1, 1, img.naturalWidth, img.naturalHeight, 0, 0, imgWidth, imgHeight)
      }
      this.canvas.width = document.querySelector('.ant-layout-content').scrollWidth * 0.60
      this.canvas.height = document.querySelector('.ant-layout-content').scrollHeight
      this.drawbackground(this.canvas, this.context, this.drawKvpRect)
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
