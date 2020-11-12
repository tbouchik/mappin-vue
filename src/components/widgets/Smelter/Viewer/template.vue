<template>
  <div>
  <br>
      <div :class="$style.subbar">
        <div>
          Concatenation Mode:
          <a-switch
          :checked="catMode"
          @change="toggleCatMode"
           />
        </div>
      </div>
      <a-table  :columns="columns"
                :data-source="pageData"
                :pagination=false
                bordered>
        <template v-for="col in ['Key', 'Value']" :slot="col"   slot-scope="text, record, dataIndex" style="background:blue">
          <div :key="col"  v-if="col==='Key'" @click="activateIndex(dataIndex)" >
            {{text}}
          </div>
          <div :key="col"  v-if="col==='Value' && isActive(dataIndex)" @click="activateIndex(dataIndex)">
            <a-input
              style="margin: -5px 0; background:#CCCCFF"
              :value="text"
              @change="e => handleChange(e.target.value, dataIndex, col)"
            />
          </div>
          <div :key="col"  v-if="col==='Value' && !isActive(dataIndex)" @click="activateIndex(dataIndex)">
            <a-input
              style="margin: -5px 0"
              :value="text"
              @change="e => handleChange(e.target.value, dataIndex, col)"
            />
          </div>
        </template>
      </a-table>
      <br>
    <br>
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
    this.activateIndex(0)
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
    ...mapGetters(['currentPage', 'currentActiveIndex', 'catMode']),
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
    // async saveVersion() {
    //   await this.$store.dispatch('SAVE_DOCUMENT', this.pageData)
    // },
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
    isActive(dataIndex) {
      return dataIndex === this.currentActiveIndex
    },
    toggleCatMode() {
      this.$store.dispatch('ACTION_TOGGLE_CATMODE')
    },
  },
  destroyed() {
    this.$store.dispatch('CLEAR_DOCUMENT')
  },
}
</script>

<style lang="scss" module>
@import "./style.module.scss";
</style>
