<template>
  <div>
    <div v-if="!insideUploaderView" class="air__utils__heading">
      <h5>Smeltor Viewer</h5>
    </div>
    <div v-for="(page, index, i) in document.metadata" :key="i">
      <div class="display-6">Page {{i + 1}}:</div>
      <a-table :columns="columns" :data-source="page" bordered>
        <template
        v-for="col in ['Key', 'Value']"
        :slot="col"
        slot-scope="text, record, dataIndex">
          <div :key="col">
            <a-input
              v-if="record.editable"
              style="margin: -5px 0"
              :value="text"
              @change="e => handleChange(e.target.value, i, dataIndex, col)"
            />
            <template v-else>{{ text }}</template>
          </div>
        </template>
        <template slot="operation" slot-scope="text, record, dataIndex">
          <div class="editable-row-operations">
            <span v-if="record.editable">
              <a @click="() => save(record, i, dataIndex)">Save</a>
              <a-popconfirm title="Sure to cancel?" @confirm="() => cancel(record, i, dataIndex)">
                <a>Cancel</a>
              </a-popconfirm>
            </span>
            <span v-else>
              <a :disabled="editMode" @click="() => edit(record, i, dataIndex)">Edit</a>
            </span>
          </div>
        </template>
      </a-table>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { cloneDeep } from 'lodash'

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
  name: 'SmelterViewer',
  data() {
    return {
      editMode: false,
      columns,
      cacheData: null,
      document: null,
    }
  },
  created() {
    this.document = cloneDeep(this.current)
  },
  props: {
    insideUploaderView: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters(['current']),
  },
  methods: {
    switchEditMode() {
      this.editMode = !this.editMode
    },
    edit(record, pageIdx, itemIdx) {
      this.switchEditMode()
      this.cacheData = cloneDeep(this.document)
      const page = Object.keys(this.document.metadata)[pageIdx]
      this.document.metadata[page][itemIdx].editable = true
    },
    async save(record, pageIdx, itemIdx) {
      this.cacheData = null
      const page = Object.keys(this.document.metadata)[pageIdx]
      this.document.metadata[page][itemIdx].editable = false
      await this.$store.dispatch('SAVE_DOCUMENT', this.document)
      this.switchEditMode()
    },
    handleChange(value, pageIdx, itemIdx, column) {
      const page = Object.keys(this.document.metadata)[pageIdx]
      this.document.metadata[page][itemIdx][column] = value
    },
    cancel(record, pageIdx, itemIdx) {
      this.document = cloneDeep(this.cacheData)
      this.cacheData = null
      this.switchEditMode()
    },
  },
  destroyed() {
    this.$store.dispatch('CLEAR_DOCUMENT')
  },
}
</script>
<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>
