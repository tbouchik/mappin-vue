<template>
  <div class="row">
     <div class="col-12">
        <div class="card">
          <div class="card-body">
            <img
                :src=src
                alt="Air UI Admin Template"
            />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SmelterImageWindow',
  mounted: function() {
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
