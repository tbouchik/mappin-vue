<template>
  <div>
    <br>
    <div class="air__utils__heading">
      <b-row>
        <b-col md="3" class="my-1">
          <h5>{{ $t('upload.title') }}</h5>
        </b-col>
      </b-row>
    </div>
      <a-steps :current="uploaderStep">
        <a-step v-for="item in steps" :key="item.title" :title="item.title" />
      </a-steps>
      <br>
      <div>
        <template v-if="steps[uploaderStep].title == 'Client'">
        <div>
          {{ $t('upload.credits') }}:
        <a-progress
            :stroke-color="{
              '0%': '#108ee9',
              '100%': 'red',
            }"
            :percent="userCount"
          />
        </div>
        <br>
        <a-input-search :placeholder="$t('upload.searchClient')" v-model="searchedClient" />
        <br> <br> <br>

          <div v-if="steps[uploaderStep].title == 'Client'">
            <div class="demo-infinite-container ">
              <a-list :data-source="clients"
                      :loading="clientTableLoading">
                <a-list-item  slot="renderItem" slot-scope="item">
                  <a-list-item-meta :description="item.email">
                    <a slot="title">{{ item.name }} | </a>
                    <a slot="title"> {{ item.company }}</a>
                  </a-list-item-meta>
                  <a-button type="primary" @click="selectClient(item)" :disabled="!canUpload" ghost>
                    {{ $t('subbar.select') }}
                  </a-button>
                </a-list-item>
              </a-list>
            </div>
          </div>
          </template>
          <template v-if="steps[uploaderStep].title == 'Template'">
            <br>
            <a-input-search placeholder="Search Template" v-model="searchedTemplate" />
            <br> <br> <br>
            <div v-if="steps[uploaderStep].title == 'Template'">
              <div class="demo-infinite-container ">
                <a-list :data-source="filters"
                        :loading="templateLoading">
                  <a-list-item  slot="renderItem" slot-scope="item">
                    <a-list-item-meta :description="item.description">
                      <a slot="title">{{ item.name }}</a>
                    </a-list-item-meta>
                    <a-button type="primary" @click="selectFilter(item)" ghost>
                      {{ $t('subbar.select') }}
                    </a-button>
                  </a-list-item>
                </a-list>
              </div>
            </div>
          </template>
          <div v-if="steps[uploaderStep].title == 'Files'">
            <a-row>
              <a-col :span="6"/>
              <a-col :span="12">
                <smelter-uppy-loader :maxFileSizeInBytes=10000000></smelter-uppy-loader>
              </a-col>
              <a-col :span="6"/>
            </a-row>
          </div>
      </div>
      <div class="steps-action">
        <a-button v-if="uploaderStep > 0" style="margin-left: 8px" @click="prev">
          {{ $t('subbar.previous') }}
        </a-button>
        <br><br>
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
      searchedTemplate: null,
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
      this.$store.dispatch('ACTION_FETCH_CLIENTS', {
        limit: 100,
        page: 1,
        name: this.searchedClient,
      })
    },
    searchedTemplate: function() {
      this.$store.dispatch('ACTION_FETCH_FILTERS', {
        limit: 100,
        page: 1,
        name: this.searchedTemplate,
      })
    },
  },
  computed: {
    ...mapGetters([ 'uploaderStep',
      'uploaderClient',
      'uploaderFilter',
      'uploaderNextIsEnabled',
      'filters',
      'clients',
      'clientTableLoading',
      'templateLoading',
      'userCount',
      'canUpload',
      'userId']),
  },
  created() {
    this.$store.dispatch('ACTION_UPDATE_COUNTER', this.userId)
    this.$store.dispatch('ACTION_FETCH_CLIENTS', {
      limit: 100,
      page: 1,
      name: this.searchedClient,
    })
    this.$store.dispatch('ACTION_FETCH_FILTERS', {
      limit: 100,
      page: 1,
      name: this.searchedTemplate,
    })
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
