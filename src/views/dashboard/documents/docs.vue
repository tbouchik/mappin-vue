<template>
    <a-tabs default-active-key="0">
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
  data() {
    const panes = [
      { title: 'Invoices', key: '0', ref: 'invoices', icon: 'apple', bankViz: false },
      { title: 'Bank Statements', key: '1', ref: 'statements', icon: 'android', bankViz: true },
    ]
    return {
      activeKey: panes[0].key,
      panes,
    }
  },
  methods: {
  },
}
</script>
