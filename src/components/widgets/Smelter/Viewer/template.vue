<template>
  <div>
  <br>
      <div :class="$style.subbar">
        <div class="btn-group">
        <button
          type="button"
          style="margin-right: 5px"
          class="btn btn-primary btn-with-addon mr-auto text-nowrap d-none d-md-block"
          @click="saveVersion"
        >
          <span class="btn-addon">
            <i class="btn-addon-icon fe fe-check-circle"/>
          </span>
          Validate Changes
        </button>
        <button
          type="button"
          style="margin-left: 10px"
          class="btn btn-warning btn-with-addon mr-auto text-nowrap d-none d-md-block"
          @click="cancelChanges"
        >
          <span class="btn-addon">
            <i class="btn-addon-icon fe fe-x-circle" />
          </span>
          Cancel Changes
        </button>
        </div>
      </div>
      <a-table :columns="columns" :data-source="pageData" :pagination=false bordered>
        <template v-for="col in ['Key', 'Value']" :slot="col" slot-scope="text, record, dataIndex" >
          <div :key="col"  v-if="col==='Key'" @click="activateIndex(dataIndex)">
            {{text}}
          </div>
          <div :key="col"  v-if="col==='Value'" @click="activateIndex(dataIndex)">
            <a-input
              style="margin: -5px 0"
              :value="text"
              @change="e => handleChange(e.target.value, dataIndex, col)"
            />
          </div>
        </template>
      </a-table>
      <br><br>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
const columns = [
  {
    title: 'Key',
    dataIndex: 'Key',
    width: '40%',
    scopedSlots: { customRender: 'Key' },
  },
  {
    title: 'Value',
    dataIndex: 'Value',
    width: '45%',
    scopedSlots: { customRender: 'Value' },
  },
]
export default {
  name: 'TemplateViewer',
  data() {
    return {
      editMode: false,
      columns,
      pageData: [],
    }
  },
  created() {
    this.pageData = this.filter.map(x => { return { Key: x.Key, Value: x.Value } })
  },
  props: {
    insideUploaderView: {
      type: Boolean,
    },
    filter: {
      required: true,
    },
  },
  computed: {
    ...mapGetters(['currentPage']),
  },
  watch: {
    filter: function () {
      this.pageData = this.filter.map(x => { return { Key: x.Key, Value: x.Value } })
    },
  },
  methods: {
    switchEditMode() {
      this.editMode = !this.editMode
    },
    async saveVersion() {
      this.$nprogress.start()
      await this.$store.dispatch('SAVE_DOCUMENT', this.pageData)
      this.$nprogress.done()
      this.$notification['success']({
        message: 'Saved!',
        description: 'Changes were successfully saved',
      })
    },
    cancelChanges() {
      this.$store.dispatch('ACTION_UNDO_CHANGES_TO_DOCUMENT', this.pageData)
    },
    handleChange(value, itemIdx, column) {
      this.$store.dispatch('ACTION_DO_CHANGES_TO_DOCUMENT', { value, itemIdx, column })
    },
    async remove(record, itemIdx) {
      this.pageData.splice(itemIdx, 1)
      await this.$store.dispatch('SAVE_DOCUMENT', this.pageData)
    },
    activateIndex(idx) {
      this.$store.dispatch('ACTION_UPDATE_ACTIVE_INDEX', idx)
    },
  },
  destroyed() {
    this.$store.dispatch('CLEAR_DOCUMENT')
  },
}
</script>

<style lang="scss" module>
@import "./style.module.scss"
</style>
