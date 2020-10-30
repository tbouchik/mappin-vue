<template>
  <div>
  <br>
      <div :class="$style.subbar">
        <button
          type="button"
          class="btn btn-primary btn-with-addon mr-auto text-nowrap d-none d-md-block"
          @click="saveVersion"
        >
          <span class="btn-addon">
            <i class="btn-addon-icon fe fe-check-circle" />
          </span>
          Validate Changes
        </button>
        <button
          type="button"
          class="btn btn-warning btn-with-addon mr-auto text-nowrap d-none d-md-block"
          @click="cancelChanges"
        >
          <span class="btn-addon">
            <i class="btn-addon-icon fe fe-x-circle" />
          </span>
          Cancel Changes
        </button>
      </div>
      <a-table :columns="columns" :data-source="pageData" :pagination=false bordered>
        <template v-for="col in ['Key', 'Value']" :slot="col" slot-scope="text, record, dataIndex" >
          <div :key="col" @click="activateIndex(dataIndex)">
            <a-input
              style="margin: -5px 0"
              :value="text"
              @change="e => handleChange(e.target.value, dataIndex, col)"
            />
          </div>
        </template>
        <template slot="operation" slot-scope="text, record, dataIndex">
          <div class="editable-row-operations">
            <span>
              <a-popconfirm title="Sure to delete?" @confirm="() => remove(record, dataIndex)">
                <a style="color:#b793c3">Delete</a>
              </a-popconfirm>
            </span>
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
  {
    title: 'operation',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
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
      await this.$store.dispatch('SAVE_DOCUMENT', this.pageData)
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
    addRecord() {
      this.$store.dispatch('ACTION_ADD_RECORD_AFTER_INDEX')
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
