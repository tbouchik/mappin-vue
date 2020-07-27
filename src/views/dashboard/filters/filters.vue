<template>
 <div>
   <div class="air__utils__heading">
      <h5>Filters Dashboard</h5>
    </div>
     <div class="mb-5">
      <div class="row">
        <div class="col-xl-6 col-lg-12">
          <div class="card">
            <div class="card-body">
              <filter-card :name="nameVar" :description="descrVar"/>
            </div>
          </div>
        </div>
        <div class="col-xl-6 col-lg-12">
          <div class="card">
            <div class="card-body">
              <filter-card :name="nameVar" :description="descrVar"/>
            </div>
          </div>
        </div>
        <div class="col-xl-6 col-lg-12">
          <div class="card">
            <div class="card-body">
              <filter-card :name="nameVar" :description="descrVar"/>
            </div>
          </div>
        </div>
        <div class="col-xl-6 col-lg-12">
          <div class="card">
            <div class="card-body">
              <filter-card :name="nameVar" :description="descrVar"/>
            </div>
          </div>
        </div>
      </div>
     </div>
 </div>
</template>

<script>
import FilterCard from '@/views/dashboard/filters/components/filterCard.vue'

export default {
  components: {
    FilterCard,
  },
  name: 'FiltersComponent',
  props: {

  },
  data() {
    return {
      nameVar: 'Card Title',
      descrVar: 'Lorem ipsum dolor sit amit,consectetur eiusmdd tempory incididunt ut labore et dolore magna elit',
    }
  },
  created() {
  },
  computed: {

  },
  mounted() {
  },
  methods: {

  },
}
</script>
