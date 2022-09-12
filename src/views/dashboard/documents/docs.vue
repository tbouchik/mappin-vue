<template>
    <a-tabs :default-active-key="currentActivePaneId" @change="onChangeTab">
        <a-tab-pane v-for="pane in panes" :isArchiveViz="isArchiveViz" :clientId="clientId" :key="pane.key" :tab="pane.title" >
        <span slot="tab">
            <a-icon :type="pane.icon" />
            {{pane.title}}
        </span>
        <documents :isBankViz="pane.bankViz" :isArchiveViz="isArchiveViz" :clientId="clientId" :ref="pane.ref"></documents>
        </a-tab-pane>
  </a-tabs>
</template>

<script>
import Documents from './documents'
import DocumentService from '../../../services/documentService'
import { mapGetters } from 'vuex'
export default {
  name: 'Docs',
  components: {
    Documents,
  },
  props: {
    clientId: {
      type: String,
      required: false,
    },
    isArchiveViz: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    ...mapGetters(['currentActivePaneId']),
  },
  data() {
    const panes = [
      { title: this.$t('topBar.panesInvoice'), key: '0', ref: 'invoices', icon: 'home', bankViz: false },
      // { title: this.$t('topBar.panesStatement'), key: '1', ref: 'statements', icon: 'home', bankViz: true },
    ]
    return {
      activeKey: panes[0].key,
      panes,
    }
  },
  methods: {
    onChangeTab(activeTab) {
      const activeTabIdx = parseInt(activeTab)
      this.$store.dispatch('ACTION_RESET_SMELTED_IDS')
      const params = {
        client: this.clientId,
        isArchived: this.isArchiveViz,
        isBankStatement: this.panes[activeTabIdx].bankViz,
      }
      DocumentService.fetchNextSmeltedDocuments(params)
        .then(idsArray => {
          this.$store.dispatch('ACTION_CACHE_SMELTED_IDS', { idsArray,
            concat: false })
          this.validatorIsLoading = false
          const setting = 'currentActivePane'
          const value = activeTab
          this.$store.commit('CHANGE_SETTING', { setting, value })
        })
    },
  },
}
</script>
