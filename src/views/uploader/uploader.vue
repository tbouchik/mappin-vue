<template>
  <div>
    <br />
    <div class="air__utils__heading">
      <b-row>
        <b-col md="3" class="my-1">
          <h5>{{ $t("upload.title") }}</h5>
        </b-col>
      </b-row>
    </div>
    <a-steps :current="uploaderStep">
      <a-step v-for="item in steps" :key="item.title" :title="item.title" />
    </a-steps>
    <br/>
    <div>
      <template>
        <a-breadcrumb v-if="selectedUploadType">
          <a-breadcrumb-item>
            <a-icon type="snippets" />
            <span>{{selectedUploadType.name}}</span>
          </a-breadcrumb-item>
          <a-breadcrumb-item v-if="selectedClient">
            <a-icon type="user" />
            <span>{{selectedClient.name}}</span>
          </a-breadcrumb-item>
          <a-breadcrumb-item v-if="selectedTemplate">
            <a-icon type="filter"/>
            {{selectedTemplate.name}}
          </a-breadcrumb-item>
        </a-breadcrumb>
      </template>
      <br>
      <template v-if="steps[uploaderStep].title == 'Type'">
        <div style="margin-bottom:1%">
          {{ $t('upload.credits')}}
          <a-progress
            :stroke-color="{
              '0%': '#108ee9',
              '100%': 'red',
            }"
            :percent="creditRatio"
          />
        </div>
        <div class="row">
          <div class="col-xl-6 col-lg-12">
            <div class="card">
              <div class="card-body">
                <div class="text-center">
                  <p class="text-dark font-size-48 font-weight-bold mb-2">
                    Relevé bancaire
                  </p>
                  <p class="text-uppercase text-muted mb-3"></p>
                  <p class="mb-4">
                    Vous souhaitez uploader uniquement des relevés bancaires. <br>
                    - En cours de construction -
                  </p>
                  <a-button
                    class="mr-2 mb-2"
                    type="primary"
                    :disabled="true"
                    @click="() => selectBankUploadType(true)"
                    ghost
                    >Sélectionner</a-button
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="col-xl-6 col-lg-12">
            <div class="card">
              <div class="card-body">
                <div class="text-center">
                  <p class="text-dark font-size-48 font-weight-bold mb-2">
                    Facture
                  </p>
                  <p class="text-uppercase text-muted mb-3"></p>
                  <p class="mb-4">
                    Vous souhaitez uploader uniquement des factures. <br>
                    Formats acceptés (PDF, JPG, PNG)
                  </p>
                  <a-button
                    class="mr-2 mb-2"
                    type="primary"
                    @click="() => selectBankUploadType(false)"
                    ghost
                    >Sélectionner</a-button
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-if="steps[uploaderStep].title == 'Client'">
        <div style="margin-bottom:1%">
          {{ $t('upload.credits')}}
          <a-progress
            :stroke-color="{
              '0%': '#108ee9',
              '100%': 'red',
            }"
            :percent="creditRatio"
          />
        </div>
        <br />
        <a-input-search
          :placeholder="$t('upload.searchClient')"
          v-model="searchedClient"
        />
        <br />
        <br />
        <br />

        <div v-if="steps[uploaderStep].title == 'Client'">
          <div class="demo-infinite-container">
            <a-list :data-source="clients" :loading="clientTableLoading">
              <a-list-item slot="renderItem" slot-scope="item">
                <a-list-item-meta :description="item.email">
                  <a slot="title">{{ item.name }} | </a>
                  <a slot="title"> {{ item.company }}</a>
                </a-list-item-meta>
                <a-button
                  type="primary"
                  @click="selectClient(item)"
                  :disabled="!canUpload"
                  ghost
                >
                  {{ $t("subbar.select") }}
                </a-button>
              </a-list-item>
            </a-list>
          </div>
        </div>
      </template>
      <template v-if="steps[uploaderStep].title == 'Template'">
        <div style="margin-bottom:1%">
          {{ $t('upload.credits')}}
          <a-progress
            :stroke-color="{
              '0%': '#108ee9',
              '100%': 'red',
            }"
            :percent="creditRatio"
          />
        </div>
        <a-input-search
          placeholder="Search Template"
          v-model="searchedTemplate"
        />
        <br />
        <br />
        <br />
        <div v-if="steps[uploaderStep].title == 'Template'">
          <div class="demo-infinite-container">
            <a-list :data-source="filters" :loading="templateLoading">
              <a-list-item slot="renderItem" slot-scope="item">
                <a-list-item-meta :description="item.description">
                  <a slot="title">{{ item.name }}</a>
                </a-list-item-meta>
                <a-button type="primary" @click="selectFilter(item)" ghost>
                  {{ $t("subbar.select") }}
                </a-button>
              </a-list-item>
            </a-list>
          </div>
        </div>
      </template>
      <div v-if="steps[uploaderStep].title == 'Fichiers'">
        <div style="margin-bottom:1%">
          {{ $t('upload.credits')}}
          <a-progress
            :stroke-color="{
              '0%': '#108ee9',
              '100%': 'red',
            }"
            :percent="creditRatio"
          />
        </div>
        <a-row>
          <a-col :span="6" />
          <a-col :span="12">
            <smelter-uppy-loader
              :bankUpload="isBankUpload"
              :maxFileSizeInBytes="10000000"
            ></smelter-uppy-loader>
          </a-col>
          <a-col :span="6" />
        </a-row>
      </div>
    </div>
    <div class="steps-action">
      <a-button v-if="uploaderStep > 0" style="margin-left: 8px" @click="prev">
        {{ $t("subbar.previous") }}
      </a-button>
      <br /><br />
    </div>
  </div>
</template>
<script>
import SmelterUppyLoader from '@/components/widgets/Smelter/Uploader/uppyloader.vue'
import { mapGetters } from 'vuex'
import CompanyService from './../../services/companyService'

export default {
  components: {
    SmelterUppyLoader,
  },
  data: function () {
    return {
      clientsComponentReadMode: true,
      perPage: 5,
      nextIsEnabled: false,
      searchedClient: null,
      searchedTemplate: null,
      isBankUpload: false,
      selectedUploadType: null,
      selectedClient: null,
      selectedTemplate: null,
      companyLimit: 100,
      companyRemainingCredits: 100,
      steps: [
        {
          title: 'Type',
        },
        {
          title: 'Client',
        },
        {
          title: 'Template',
        },
        {
          title: 'Fichiers',
        },
      ],
    }
  },
  watch: {
    searchedClient: function () {
      this.$store.dispatch('ACTION_FETCH_CLIENTS', {
        limit: 100,
        page: 1,
        name: this.searchedClient,
      })
    },
    searchedTemplate: function () {
      this.$store.dispatch('ACTION_FETCH_FILTERS', {
        limit: 100,
        page: 1,
        name: this.searchedTemplate,
        type: this.selectedUploadType ? this.selectedUploadType.id : null,
      })
    },
  },
  computed: {
    ...mapGetters([
      'uploaderStep',
      'uploaderClient',
      'uploaderFilter',
      'uploaderNextIsEnabled',
      'filters',
      'clients',
      'clientTableLoading',
      'templateLoading',
      'user',
      'userId',
    ]),
    canUpload: function () {
      return this.companyRemainingCredits > 0
    },
    creditRatio: function () {
      if (this.companyRemainingCredits <= 0) return 100
      return parseInt(((this.companyLimit - this.companyRemainingCredits) / this.companyLimit) * 100)
    },
  },
  created() {
    this.getCurrentCreditCount()
    this.fetchCompany(this.user.company.id)
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
    getCurrentCreditCount() {
      CompanyService.getCompanyRemainingCredits()
        .then(
          ({ data }) => {
            this.companyRemainingCredits = data.credits
          }
        )
    },
    fetchCompany(id) {
      CompanyService.getCompany(id)
        .then(
          ({ data }) => {
            this.companyLimit = data.subscription.credits
          }
        )
    },
    selectFilter(item) {
      this.selectedTemplate = item
      this.$store.dispatch('ACTION_SELECT_UPLOADER_FILTER', item)
      this.$store.dispatch('ACTION_INCREMENT_UPLOADER_INDEX')
    },
    prev() {
      this.$store.dispatch('ACTION_DECREMENT_UPLOADER_INDEX')
      if (this.selectedTemplate) {
        this.selectedTemplate = null
      } else if (this.selectedClient) {
        this.selectedClient = null
      } else {
        this.selectedUploadType = null
      }
    },
    selectClient(item) {
      this.selectedClient = item
      this.$store.dispatch('ACTION_SELECT_UPLOADER_CLIENT', item)
      this.$store.dispatch('ACTION_INCREMENT_UPLOADER_INDEX')
    },
    selectBankUploadType(isBankUpload) {
      this.selectedUploadType = isBankUpload ? { name: 'Relevé Bancaire', id: 'bankStatement' } : { name: 'Facture', id: 'invoice' }
      this.$store.dispatch('ACTION_FETCH_FILTERS', {
        limit: 100,
        page: 1,
        name: this.searchedTemplate,
        type: this.selectedUploadType.id,
      })
      this.isBankUpload = isBankUpload
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
