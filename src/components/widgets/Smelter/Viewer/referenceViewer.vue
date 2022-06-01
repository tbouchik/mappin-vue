<template>
  <div>
    <br>
      <div style="margin-bottom: 16px">
        <a-dropdown :disabled="!hasSelectedReferences" >
          <a-button>{{ $t('template.actions') }}</a-button>
          <a-menu slot="overlay">
            <a-menu-item @click="setInsertModalVisible(-1)" v-if="hasNoReferences">
              <div>{{ $t('template.insertLine') }}</div>
            </a-menu-item>
            <a-menu-item @click="setInsertModalVisible(0)" v-if="!hasNoReferences">
              <div>{{ $t('template.insertAbove') }}</div>
            </a-menu-item>
            <a-menu-item @click="setInsertModalVisible(1)" v-if="!hasNoReferences">
              <div>{{ $t('template.insertBelow') }}</div>
            </a-menu-item>
            <a-menu-item @click="deleteReferences" v-if="!hasNoReferences">
              <div>{{ $t('template.deleteAction') }}</div>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
      <br>
      <div v-if="showImputationAlert && currentActivePane==='expensePane'">
          <a-alert  :message="currentImputationAlert" type="info" close-text="Fermer" />
      </div>
      <br>
      <a-table  :columns="columns"
                :data-source="pageData"
                :pagination=false
                :scroll="{ x: 600 }"
                :row-selection="{ selectedRowKeys: selectedReferences, onChange: onSelectChange }"
                bordered>
        <template v-for="col in ['DisplayedLibelle', 'Price', 'Imputation']" :slot="col"   slot-scope="text, record, dataIndex" style="background:blue">
          <div :key="col"  v-if="(col==='DisplayedLibelle' || col==='Price') && isActive(dataIndex, col)" @click="activateIndex(dataIndex, col)">
            <a-input
              style="margin: -5px 0; background:#CCCCFF"
              :value="text"
              @change="e => handleChange(e.target.value, dataIndex, col)"
              :ref="hash(dataIndex,col)"
              :disabled="isArchived"
            />
          </div>
          <div :key="col"  v-if="(col==='DisplayedLibelle' || col==='Price') && !isActive(dataIndex, col)" @click="activateIndex(dataIndex, col)">
            <a-input
              style="margin: -5px 0"
              :value="text"
              @change="e => handleChange(e.target.value, dataIndex, col)"
              :ref="hash(dataIndex,col)"
              :disabled="isArchived"
            />
          </div>
          <div :key="col"  v-if="col==='Imputation' && isActive(dataIndex, col)" @click="activateIndex(dataIndex, col)">
            <template v-if="record.Imputation !== undefined && record.Imputation !== null">
              <vue-simple-suggest
                @input="e => changeLibelle(e, dataIndex)"
                @select="e => updateImputation(e, dataIndex)"
                :value="text"
                :max-suggestions="10"
                :list="simpleSuggestionList"
                :filter-by-query="true"
                :filter="suggestFilter"
                :ref="hash(dataIndex,col)">
              </vue-simple-suggest>
            </template>
          </div>
          <div :key="col"  v-if="col==='Imputation' && !isActive(dataIndex, col) " @click="activateIndex(dataIndex, col)">
            <template>
              <vue-simple-suggest
                :value="text"
                :list="simpleSuggestionList"
                :filter-by-query="true"
                :ref="hash(dataIndex,col)">
              </vue-simple-suggest>
            </template>
          </div>
        </template>
      </a-table>
      <br>
    <br>
    <a-modal v-model="insertModalVisible" title="Confirmation de Date" @ok="confirmInsertStatements">
      <div>
        <p>Choisissez le nombre de lignes à insérer: </p>
        <a-dropdown>
          <a-menu slot="overlay" @click="handleNumberOfLinesChange">
            <a-menu-item key="1"> 1 </a-menu-item>
            <a-menu-item key="2"> 2 </a-menu-item>
            <a-menu-item key="3"> 3 </a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px"> Nombre de lignes <a-icon type="down" /> </a-button>
        </a-dropdown>
      </div>
    </a-modal>
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
    title: 'Libelle',
    dataIndex: 'DisplayedLibelle',
    width: '58%',
    scopedSlots: { customRender: 'DisplayedLibelle' },
  },
  {
    title: 'Prix',
    dataIndex: 'Price',
    width: '15%',
    scopedSlots: { customRender: 'Price' },
  },
  {
    title: 'Imputation',
    dataIndex: 'Imputation',
    width: '27%',
    scopedSlots: { customRender: 'Imputation' },
  },
]
export default {
  components: {
    VueSimpleSuggest,
  },
  name: 'StatementViewer',
  data() {
    return {
      pageData: [],
      chosen: '',
      columns,
      selectedReferences: [],
      insertModalVisible: false,
      offset: null,
      numberOfLines: 0,
      debounce: null,
    }
  },
  created() {
    this.pageData = this.references.map(x => { return { Libelle: x.DisplayedLibelle, DisplayedLibelle: x.Libelle, Price: x.Price, Imputation: x.Imputation } })
  },
  props: {
    references: {
      required: true,
    },
    isArchived: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    ...mapGetters(['currentPage', 'currentActiveIndex', 'currentActivePane', 'currentActiveColumn', 'catMode', 'showImputationAlert', 'currentImputationAlert', 'referencesSnapshotsEmpty']),
    hasSelectedReferences() {
      return this.selectedReferences.length > 0 || this.references.length === 0
    },
    hasNoReferences() {
      return this.references.length === 0
    },
  },
  watch: {
    references: function() {
      this.pageData = this.references.map(x => { return { Libelle: x.DisplayedLibelle, DisplayedLibelle: x.Libelle, Price: x.Price, Imputation: x.Imputation } })
      this.dates = []
    },
    currentActiveIndex: function() {
      const pageNotEmpty = this.references.length > 0
      if (this.currentActivePane === 'expensePane' && pageNotEmpty) {
        if (this.currentActiveColumn !== 'Imputation') {
          this.$refs[this.hash(this.currentActiveIndex, this.currentActiveColumn)][0].$el.focus()
        } else {
          this.$refs[this.hash(this.currentActiveIndex, this.currentActiveColumn)][0].$el.children[0].children[0].focus()
        }
      }
    },
    currentActiveColumn: function() {
      const pageNotEmpty = this.references.length > 0
      if (this.currentActivePane === 'expensePane' && pageNotEmpty) {
        if (this.currentActiveColumn !== 'Imputation') {
          this.$refs[this.hash(this.currentActiveIndex, this.currentActiveColumn)][0].$el.focus()
        } else {
          this.$refs[this.hash(this.currentActiveIndex, this.currentActiveColumn)][0].$el.children[0].children[0].focus()
        }
      }
    },
  },
  methods: {
    handleChange(value, itemIdx, column) {
      this.pageData[itemIdx][column] = value
      clearTimeout(this.debounce)
      this.debounce = setTimeout(() => {
        this.$store.dispatch('ACTION_MANUAL_CHANGES_TO_REFERENCE', { value, itemIdx, column })
      }, 600)
    },
    activateIndex(idx, col) {
      this.$store.dispatch('ACTION_UPDATE_ACTIVE_INDEX', { idx, col, pane: 'expensePane' })
    },
    isActive(dataIndex, column) {
      return dataIndex === this.currentActiveIndex && column === this.currentActiveColumn && this.currentActivePane === 'expensePane'
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
    changeLibelle(input, idx) {
      this.$store.dispatch('ACTION_CHANGE_LIBELLE', input)
      clearTimeout(this.debounce)
      this.debounce = setTimeout(() => {
        const payload = {
          itemIdx: idx,
          imputation: input,
        }
        this.$store.dispatch('ACTION_DO_IMPUTATION_CHANGES_TO_REFERENCE', payload)
      }, 600)
    },
    updateImputation(input, idx) {
      this.$store.dispatch('ACTION_CHANGE_LIBELLE', input)
      const payload = {
        itemIdx: idx,
        imputation: input,
      }
      this.$store.dispatch('ACTION_DO_IMPUTATION_CHANGES_TO_REFERENCE', payload)
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
    onSelectChange(selectedReferences) {
      this.selectedReferences = selectedReferences.sort((a, b) => a - b)
    },
    setInsertModalVisible (offset) {
      this.insertModalVisible = true
      this.offset = offset
    },
    handleNumberOfLinesChange(e) {
      this.numberOfLines = parseInt(e.key)
    },
    confirmInsertStatements() {
      this.insertModalVisible = false
      this.$store.dispatch('ACTION_INSERT_REFERENCES', { offset: this.offset, selectedReferences: this.selectedReferences, lines: this.numberOfLines })
      this.selectedReferences = []
    },
    deleteReferences() {
      this.$store.dispatch('ACTION_DELETE_REFERENCES', { selectedReferences: this.selectedReferences })
      this.selectedReferences = []
    },
    handleDateChange(dates) {
      this.dates = dates
    },
  },
  destroyed() {
    this.$store.dispatch('CLEAR_DOCUMENT')
  },
}
</script>

<style lang="scss" module>
@import "./style.module.scss";
.aqua {
  background: aqua;
}
</style>
