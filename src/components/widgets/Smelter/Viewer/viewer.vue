<template>
  <div>
      <div :class="$style.chat">
      <button
        type="button"
        :class="$style.toggleButton"
        class="btn btn-rounded btn-light text-nowrap text-dark font-weight-bold font-size-18"
        @click="saveVersion"
      >
        <i :class="$style.icon" class="fe fe-check-circle text-blue mr-md-2" />
        <span class="d-none d-md-inline">Save Version</span>
      </button>
      <button
        type="button"
        :class="$style.toggleButton"
        class="btn btn-rounded btn-light text-nowrap text-dark font-weight-bold font-size-18"
        @click="cancelChanges"
      >
        <i :class="$style.icon" class="fe fe-rotate-ccw text-blue mr-md-2" />
        <span class="d-none d-md-inline">Cancel Changes</span>
      </button>

    </div>

    <div v-if="!insideUploaderView" >
      <h5><strong> Smeltor Viewer </strong></h5>
      <div :class="$style.subbar">
      <ul :class="$style.breadcrumbs" class="mr-4">
      <li :class="$style.breadcrumb">
        <a href="#" class="style.breadcrumbLink">PDF</a>
      </li>
      <li :class="$style.breadcrumb">
        <a href="#" :class="[$style.breadcrumbLink, $style.breadcrumbLink__current]">{{document.name}}</a>
      </li>
    </ul>
    <div :class="$style.divider" class="mr-4 d-none d-xl-block" />
    <p class="color-gray-4 text-uppercase font-size-18 mb-0 mr-4 d-none d-xl-block">{{document.type}}</p>
    </div>
    </div>
    <div v-for="(page, index, i) in document.metadata" :key="i">
      <div :class="$style.subbar">
        <p class="color-gray-4 text-uppercase font-size-18 mb-0 mr-4 d-none d-xl-block">PAGE {{i+1}}</p>
        <button
          type="button"
          class="btn btn-primary btn-with-addon mr-auto text-nowrap d-none d-md-block"
          @click="() => addRecord(i)"
        >
          <span class="btn-addon">
            <i class="btn-addon-icon fe fe-plus-circle" />
          </span>
          New Record
        </button>
      </div>
      <a-table :columns="columns" :data-source="page" :pagination=false bordered>
        <template v-for="col in ['Key', 'Value']" :slot="col" slot-scope="text, record, dataIndex">
          <div :key="col">
            <a-input
              style="margin: -5px 0"
              :value="text"
              @change="e => handleChange(e.target.value, i, dataIndex, col)"
            />
          </div>
        </template>
        <template slot="operation" slot-scope="text, record, dataIndex">
          <div class="editable-row-operations">
            <span>
              <a-popconfirm title="Sure to delete?" @confirm="() => remove(record, i, dataIndex)">
                <a style="color:#b793c3">Delete</a>
              </a-popconfirm>
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
    this.cacheData = cloneDeep(this.current)
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
    async saveVersion() {
      await this.$store.dispatch('SAVE_DOCUMENT', this.document)
      this.cacheData = cloneDeep(this.document)
    },
    async cancelChanges() {
      this.document = cloneDeep(this.cacheData)
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
    async remove(record, pageIdx, itemIdx) {
      const page = Object.keys(this.document.metadata)[pageIdx]
      this.document.metadata[page].splice(itemIdx, 1)
      await this.$store.dispatch('SAVE_DOCUMENT', this.document)
    },
    addRecord(pageIdx) {
      const page = Object.keys(this.document.metadata)[pageIdx]
      const newElement = {
        'Key': '',
        'KeyConfidence': '100',
        'Value': '',
        'ValueConfidence': '100',
        'key': page.length,
      }
      this.document.metadata[page].push(newElement)
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
