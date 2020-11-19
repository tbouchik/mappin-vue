<template>
  <div>
    <br>
    <div class="air__utils__heading">
      <b-row>
        <b-col md="3" class="my-1">
          <h5>Upload Documents</h5>
        </b-col>
      </b-row>
    </div>
      <a-steps :current="uploaderStep">
        <a-step v-for="item in steps" :key="item.title" :title="item.title" />
      </a-steps>
      <br>
      <div>
        <template v-if="steps[uploaderStep].title == 'Client'">
        <a-input-search placeholder="Search Client" v-model="searchedClient" />
        <br> <br> <br>
        </template>
          <div v-if="steps[uploaderStep].title == 'Client'">
            <!-- <clients-dashboard
              class="card-body steps-content"
              :readOnlyMode="clientsComponentReadMode"
              :perPage="perPage">
            </clients-dashboard> -->
            <div class="demo-infinite-container ">
              <a-list :data-source="clients">
                <a-list-item  slot="renderItem" slot-scope="item">
                  <a-list-item-meta :description="item.email">
                    <a slot="title">{{ item.name }} | </a>
                    <a slot="title"> {{ item.company }}</a>
                  </a-list-item-meta>
                  <a-button type="primary" @click="selectClient(item)" ghost>
                    select
                  </a-button>
                </a-list-item>
              </a-list>
            </div>
          </div>
          <div v-if="steps[uploaderStep].title == 'Template'">
            <div class="demo-infinite-container ">
              <a-list :data-source="filters">
                <a-list-item  slot="renderItem" slot-scope="item">
                  <a-list-item-meta :description="item.description">
                    <a slot="title">{{ item.name }}</a>
                  </a-list-item-meta>
                  <a-button type="primary" @click="selectFilter(item)" ghost>
                    select
                  </a-button>
                </a-list-item>
              </a-list>
            </div>
          </div>
          <div v-if="steps[uploaderStep].title == 'Files'">
            <smelter-uppy-loader :maxFileSizeInBytes=10000000></smelter-uppy-loader>
          </div>
      </div>
      <div class="steps-action">
        <a-button v-if="uploaderStep > 0" style="margin-left: 8px" @click="prev">
          Previous
        </a-button>
      </div>

  </div>
</template>
<script>
import SmelterUppyLoader from '@/components/widgets/Smelter/Uploader/uppyloader.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    SmelterUppyLoader,
  },
  data: function() {
    return {
      clientsComponentReadMode: true,
      perPage: 5,
      nextIsEnabled: false,
      searchedClient: null,
      steps: [
        {
          title: 'Client',
        },
        {
          title: 'Template',
        },
        {
          title: 'Files',
        },
      ],
    }
  },
  watch: {
    searchedClient: function() {
      console.log(this.searchedClient)
      this.$store.dispatch('ACTION_FETCH_CLIENTS', {
        limit: 100,
        page: 1,
        name: this.searchedClient,
      })
    },
  },
  computed: {
    ...mapGetters(['uploaderStep', 'uploaderClient', 'uploaderFilter', 'uploaderNextIsEnabled', 'filters', 'clients']),
  },
  created() {
    this.$store.dispatch('ACTION_FETCH_CLIENTS', {
      limit: 100,
      page: 1,
      name: this.searchedClient,
    })
    this.$store.dispatch('ACTION_FETCH_FILTERS')
  },
  destroyed() {
    this.$store.dispatch('ACTION_RESET_STEPS')
  },
  methods: {
    selectFilter(item) {
      this.$store.dispatch('ACTION_SELECT_UPLOADER_FILTER', item)
      this.$store.dispatch('ACTION_INCREMENT_UPLOADER_INDEX')
    },
    prev() {
      this.$store.dispatch('ACTION_DECREMENT_UPLOADER_INDEX')
    },
    selectClient(item) {
      this.$store.dispatch('ACTION_SELECT_UPLOADER_CLIENT', item)
      this.$store.dispatch('ACTION_INCREMENT_UPLOADER_INDEX')
    },
  },
}
</script>
<style>
.demo-infinite-container {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: auto;
  padding: 8px 24px;
  height: 300px;
}
.demo-loading-container {
  position: absolute;
  bottom: 40px;
  width: 100%;
  text-align: center;
}
.steps-content {
  margin-top: 16px;
  border: 1px dashed #e9e9e9;
  border-radius: 6px;
  background-color: #fafafa;
  min-height: 200px;
  text-align: center;
  padding-top: 80px;
}

.steps-action {
  margin-top: 24px;
}
</style>
