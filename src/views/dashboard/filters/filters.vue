<template>
  <div>
    <br>
    <div class="air__utils__heading">
      <b-row>
        <b-col md="3" class="my-1">
          <h5>Templates Dashboard</h5>
        </b-col>
        <b-col md="6" class="my-1">
          <button
            type="button"
            class="btn btn-success btn-with-addon mr-auto text-nowrap d-none d-md-block"
            @click="goAddNewTemplate"
          >
            <span class="btn-addon">
              <i class="btn-addon-icon fe fe-plus-circle" />
            </span>
            Add New Template
          </button>
        </b-col>
      </b-row>
    </div>
     <div class="mb-5">
      <div class="row">
        <div v-for="(filter, index) in filters" :key="index"  class="col-xl-6 col-lg-12">
          <div class="card">
            <div class="card-body">
              <filter-card :name="filter.name"  :description="filter.description"/>
            </div>
          </div>
        </div>
      </div>
     </div>
 </div>
</template>

<script>
import FilterCard from '@/views/dashboard/filters/components/filterCard.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    FilterCard,
  },
  name: 'FiltersComponent',
  props: {

  },
  data() {
    return {
    }
  },
  created() {
    this.$store.dispatch('ACTION_FETCH_CLIENTS')
  },
  computed: {
    ...mapGetters(['filters']),
  },
  mounted() {
  },
  methods: {
    goAddNewTemplate() {
      this.$router.push({ name: 'addNewFilter' })
    },
  },
}
</script>
