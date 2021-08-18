<template>
  <div>
    <br>
    <div v-if="showImputationAlert && currentActivePane==='templatePane'">
        <a-alert  :message="currentImputationAlert" type="info" close-text="Fermer" />
    </div>
  <br>
      <a-table  :columns="adjustedColumns"
                :data-source="pageData"
                :pagination=false
                bordered>
        <template v-for="col in ['Key', 'Value', 'Imputation', 'Libelle']" :slot="col"   slot-scope="text, record, dataIndex" style="background:blue">
          <div :key="col"  v-if="col==='Key'" @click="activateIndex(dataIndex, col)" >
            {{text}}
          </div>
          <div :key="col"  v-if="col==='Value' && isActive(dataIndex, col)" @click="activateIndex(dataIndex, col)">
            <a-input
              style="margin: -5px 0; background:#CCCCFF"
              :value="text"
              @change="e => handleChange(e.target.value, dataIndex, col)"
              :ref="hash(dataIndex,col)"
              :disabled="isArchived"
            />
          </div>
          <div :key="col"  v-if="col==='Value' && !isActive(dataIndex, col)" @click="activateIndex(dataIndex, col)">
            <a-input
              style="margin: -5px 0"
              :value="text"
              @change="e => handleChange(e.target.value, dataIndex, col)"
              :ref="hash(dataIndex,col)"
              :disabled="isArchived"
            />
          </div>
          <div :key="col"  v-if="col==='Imputation' && isActive(dataIndex, col) && !isArchived" @click="activateIndex(dataIndex, col)">
            <template v-if="record.Imputation !== undefined && record.Imputation !== null">
              <vue-simple-suggest
                @input="e => changeLibelle(e)"
                @hover="e => changeLibelle(e)"
                @select="e => updateImputation(e, dataIndex)"
                @blur="e => updateImputationFromBlur(e, dataIndex)"
                @request-start="e => changeLibelle(e)"
                :value="text"
                :max-suggestions="10"
                :min-length="1"
                :list="simpleSuggestionList"
                :filter-by-query="true"
                :filter="suggestFilter"
                :ref="hash(dataIndex,col)">
              </vue-simple-suggest>
            </template>
          </div>
          <div :key="col"  v-if="col==='Imputation' && !isActive(dataIndex, col) && !isArchived" @click="activateIndex(dataIndex, col)">
            <template v-if="record.Imputation !== undefined && record.Imputation !== null">
              <vue-simple-suggest
              :value="text"
              :list="simpleSuggestionList"
              :filter-by-query="true"
              :ref="hash(dataIndex,col)">
          </vue-simple-suggest>
            </template>
          </div>
          <div :key="col"  v-if="col==='Imputation' && isArchived" @click="activateIndex(dataIndex, col)">
            <template v-if="record.Imputation !== undefined && record.Imputation !== null">
              <a-input
                style="margin: -5px 0"
                :value="text"
                :disabled="isArchived"
              />
            </template>
          </div>
          <div :key="col"  v-if="col==='Libelle'" @click="activateIndex(dataIndex, col)">
            {{text}}
          </div>
        </template>
      </a-table>
      <br>
    <br>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { accountNumbers1,
  accountNumbers2,
  accountNumbers3,
  accountNumbers4,
  accountNumbers5,
  accountNumbers6,
  accountNumbers7,
  accountNumbers8,
  accountNumbers9,
  accountNumbers0 } from '../../../../assets/accounting/imputations'
import VueSimpleSuggest from 'vue-simple-suggest'
import 'vue-simple-suggest/dist/styles.css' // Optional CSS

const columns = [
  {
    title: 'Key',
    dataIndex: 'Key',
    width: '25%',
    scopedSlots: { customRender: 'Key' },
  },
  {
    title: 'Value',
    dataIndex: 'Value',
    width: '40%',
    scopedSlots: { customRender: 'Value' },
  },
  {
    title: 'Imputation',
    dataIndex: 'Imputation',
    width: '15%',
    scopedSlots: { customRender: 'Imputation' },
  },
  {
    title: 'Libelle',
    dataIndex: 'Libelle',
    width: '20%',
    scopedSlots: { customRender: 'Libelle' },
  },
]
export default {
  components: {
    VueSimpleSuggest,
  },
  name: 'TemplateViewer',
  data() {
    return {
      editMode: false,
      columns,
      pageData: [],
      chosen: '',
      debounce: null,
    }
  },
  created() {
    this.pageData = this.osmium.map(x => { return { Key: x.Key, Value: x.Value, Imputation: x.Imputation, Libelle: x.Libelle } })
    this.activateIndex(0, 'Value')
  },
  props: {
    osmium: {
      required: true,
    },
    isArchived: {
      type: Boolean,
      required: false,
      default: false,
    },
    isBankStatement: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    ...mapGetters(['currentPage', 'currentActiveIndex', 'currentActivePane', 'currentActiveColumn', 'catMode', 'showImputationAlert', 'currentImputationAlert']),
    adjustedColumns: function() {
      return this.isBankStatement ? columns.slice(0, 2) : columns
    },
  },
  watch: {
    osmium: function () {
      this.pageData = this.osmium.map(x => { return { Key: x.Key, Value: x.Value, Imputation: x.Imputation, Libelle: x.Libelle } })
    },
    currentActiveIndex: function() {
      if (this.currentActivePane === 'templatePane') {
        if (this.currentActiveColumn === 'Value') {
          this.$refs[this.hash(this.currentActiveIndex, this.currentActiveColumn)][0].$el.focus()
        } else {
          this.$refs[this.hash(this.currentActiveIndex, this.currentActiveColumn)][0].$el.children[0].children[0].focus()
        }
      }
    },
    currentActiveColumn: function() {
      if (this.currentActivePane === 'templatePane') {
        if (this.currentActiveColumn === 'Value') {
          this.$refs[this.hash(this.currentActiveIndex, this.currentActiveColumn)][0].$el.focus()
        } else {
          this.$refs[this.hash(this.currentActiveIndex, this.currentActiveColumn)][0].$el.children[0].children[0].focus()
        }
      }
    },
  },
  methods: {
    switchEditMode() {
      this.editMode = !this.editMode
    },
    handleChange(value, itemIdx, column) {
      this.pageData[itemIdx][column] = value
      clearTimeout(this.debounce)
      this.debounce = setTimeout(() => {
        this.$store.dispatch('ACTION_DO_CHANGES_TO_DOCUMENT', { value, itemIdx, column })
      }, 600)
    },
    activateIndex(idx, col) {
      this.$store.dispatch('ACTION_UPDATE_ACTIVE_INDEX', { idx, col })
    },
    isActive(dataIndex, column) {
      return dataIndex === this.currentActiveIndex && column === this.currentActiveColumn && this.currentActivePane === 'templatePane'
    },
    toggleCatMode() {
      this.$store.dispatch('ACTION_TOGGLE_CATMODE')
    },
    simpleSuggestionList() {
      return accountNumbers1.concat(accountNumbers2, accountNumbers3, accountNumbers4, accountNumbers5, accountNumbers6, accountNumbers7, accountNumbers8, accountNumbers9, accountNumbers0)
    },
    hash(idx, col) {
      return `${idx}_${col}`
    },
    changeLibelle(input) {
      this.$store.dispatch('ACTION_CHANGE_LIBELLE', input)
    },
    updateImputation(input, idx) {
      this.$store.dispatch('ACTION_CHANGE_LIBELLE', input)
      const payload = {
        itemIdx: idx,
        imputation: input,
      }
      this.$store.dispatch('ACTION_DO_IMPUTATION_CHANGES_TO_INVOICE', payload)
    },
    removeEndingZeros(input) {
      let result
      if (input && input.length) {
        result = input.replace(/0*$/, '')
      }
      return result
    },
    suggestFilter(singleItem, query) {
      const pattern = /([^0]+[0][^0]+|^.[^0]+)/
      const trimedQuery = pattern.exec(query) ? pattern.exec(query)[0] : query
      const trimedItem = this.removeEndingZeros(singleItem)
      return trimedQuery.length && trimedItem.indexOf(trimedQuery) === 0 && trimedItem.length - trimedQuery.length <= 2
    },
    updateImputationFromBlur(e, idx) {
      const payload = {
        itemIdx: idx,
        imputation: e.target.value,
      }
      this.$store.dispatch('ACTION_DO_IMPUTATION_CHANGES_TO_INVOICE', payload)
    },
  },
  destroyed() {
    this.$store.dispatch('CLEAR_DOCUMENT')
  },
}
</script>

<style lang="scss" module>
@import "./style.module.scss";

.c1 {
  background: #CCCCFF;
}
</style>
