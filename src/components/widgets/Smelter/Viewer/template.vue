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
        <span class="d-none d-md-inline">Validate Changes</span>
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

      <div :class="$style.subbar">
        <p class="color-gray-4 text-uppercase font-size-18 mb-0 mr-4 d-none d-xl-block">PAGE: {{currentPage}}</p>
        <button
          type="button"
          class="btn btn-primary btn-with-addon mr-auto text-nowrap d-none d-md-block"
          @click="addRecord"
        >
          <span class="btn-addon">
            <i class="btn-addon-icon fe fe-plus-circle" />
          </span>
          New Record
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
  </div>
</template>
<script>
import { cloneDeep } from 'lodash'
import uuidv4 from 'uuid/v4'
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
      cacheData: {},
    }
  },
  created() {
    this.cacheData = cloneDeep(this.filter)
    this.pageData = cloneDeep(this.filter)
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
      this.cacheData = cloneDeep(this.filter)
      this.pageData = cloneDeep(this.filter)
    },
  },
  methods: {
    switchEditMode() {
      this.editMode = !this.editMode
    },
    async saveVersion() {
      await this.$store.dispatch('SAVE_DOCUMENT', this.pageData)
      this.cacheData = cloneDeep(this.pageData)
    },
    cancelChanges() {
      this.pageData = cloneDeep(this.cacheData)
    },
    handleChange(value, itemIdx, column) {
      this.pageData[itemIdx][column] = value
    },
    async remove(record, itemIdx) {
      this.pageData.splice(itemIdx, 1)
      await this.$store.dispatch('SAVE_DOCUMENT', this.pageData)
    },
    addRecord() {
      const newElement = {
        'Key': '',
        'Value': '',
        'key': uuidv4(),
      }
      this.pageData.push(newElement)
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
