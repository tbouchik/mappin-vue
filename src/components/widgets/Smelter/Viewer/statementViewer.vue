<template>
  <div>
    <br>
      <div style="margin-bottom: 16px">
        <a-dropdown :disabled="!hasSelectedStatements" >
          <a-button>Actions</a-button>
          <a-menu slot="overlay">
            <a-menu-item @click="insertStatements(-1)" v-if="hasNoStatements">
              <div>Insert line</div>
            </a-menu-item>
            <a-menu-item @click="insertStatements(0)" v-if="!hasNoStatements">
              <div>Insert empty line above</div>
            </a-menu-item>
            <a-menu-item @click="insertStatements(1)" v-if="!hasNoStatements">
              <div>Insert empty line below</div>
            </a-menu-item>
            <a-menu-item @click="deleteStatements" v-if="!hasNoStatements">
              <div>Delete</div>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
      <a-table  :columns="columns"
                :data-source="pageData"
                :pagination=false
                :scroll="{ x: 600 }"
                :row-selection="{ selectedRowKeys: selectedStatements, onChange: onSelectChange }"
                bordered>
        <template v-for="col in ['Date', 'Designation', 'Compte', 'Debit', 'Credit']" :slot="col"   slot-scope="text, record, dataIndex" style="background:blue">
          <div :key="col"  v-if="col==='Key'" @click="activateIndex(dataIndex, col)" >
            {{text}}
          </div>
          <div :key="col"  v-if="(col==='Date' || col==='Designation' || col==='Debit' ||  col==='Credit') && isActive(dataIndex, col)" @click="activateIndex(dataIndex, col)">
            <a-input
              style="margin: -5px 0; background:#CCCCFF"
              :value="text"
              @change="e => handleChange(e.target.value, dataIndex, col)"
              :ref="hash(dataIndex,col)"
              :disabled="isArchived"
            />
          </div>
          <div :key="col"  v-if="(col==='Date' || col==='Designation' || col==='Debit' ||  col==='Credit') && !isActive(dataIndex, col)" @click="activateIndex(dataIndex, col)">
            <a-input
              style="margin: -5px 0"
              :value="text"
              @change="e => handleChange(e.target.value, dataIndex, col)"
              :ref="hash(dataIndex,col)"
              :disabled="isArchived"
            />
          </div>
          <div :key="col"  v-if="col==='Compte'" @click="activateIndex(dataIndex, col)">
            <template v-if="record.Compte !== undefined && record.Compte !== null">
              <vue-simple-suggest
                @input="e => changeLibelle(e, dataIndex)"
                @hover="e => changeLibelle(e, dataIndex)"
                @select="e => updateImputation(e, dataIndex)"
                :value="text"
                :max-suggestions="0"
                :list="simpleSuggestionList"
                :filter-by-query="true"
                :filter="suggestFilter"
                :ref="hash(dataIndex,col)">
              </vue-simple-suggest>
            </template>
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
  accountNumbers0 } from '../../../../assets/accounting/accounts'
import labels from '../../../../assets/accounting/labels'
import VueSimpleSuggest from 'vue-simple-suggest'
import 'vue-simple-suggest/dist/styles.css' // Optional CSS
const columns = [
  {
    title: 'Date',
    dataIndex: 'Date',
    width: '17%',
    scopedSlots: { customRender: 'Date' },
  },
  {
    title: 'Designation',
    dataIndex: 'Designation',
    width: '41%',
    scopedSlots: { customRender: 'Designation' },
  },
  {
    title: 'Compte',
    dataIndex: 'Compte',
    width: '14%',
    scopedSlots: { customRender: 'Compte' },
  },
  {
    title: 'Debit',
    dataIndex: 'Debit',
    width: '14%',
    scopedSlots: { customRender: 'Debit' },
  },
  {
    title: 'Credit',
    dataIndex: 'Credit',
    width: '14%',
    scopedSlots: { customRender: 'Credit' },
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
      selectedStatements: [],
    }
  },
  created() {
    this.pageData = this.bankOsmium[`page_${this.currentPage}`].map(x => { return { Date: x.Date, Designation: x.Designation, Compte: x.Compte, Debit: x.Debit, Credit: x.Credit } })
    this.activateIndex(0, 'Date')
  },
  props: {
    bankOsmium: {
      required: true,
    },
    isArchived: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    ...mapGetters(['currentPage', 'currentActiveIndex', 'currentActiveColumn', 'catMode']),
    hasSelectedStatements() {
      return this.selectedStatements.length > 0 || this.bankOsmium[`page_${this.currentPage}`].length === 0
    },
    hasNoStatements() {
      return this.bankOsmium[`page_${this.currentPage}`].length === 0
    },
  },
  watch: {
    bankOsmium: function() {
      this.pageData = this.bankOsmium[`page_${this.currentPage}`].map(x => { return { Date: x.Date, Designation: x.Designation, Compte: x.Compte, Debit: x.Debit, Credit: x.Credit } })
    },
    currentPage: function() {
      this.selectedStatements = []
      this.pageData = this.bankOsmium[`page_${this.currentPage}`].map(x => { return { Date: x.Date, Designation: x.Designation, Compte: x.Compte, Debit: x.Debit, Credit: x.Credit } })
    },
    // currentActiveIndex: function() {
    //   if (this.currentActiveColumn === 'Value') {
    //     this.$refs[this.hash(this.currentActiveIndex, this.currentActiveColumn)][0].$el.focus()
    //   } else {
    //     this.$refs[this.hash(this.currentActiveIndex, this.currentActiveColumn)][0].$el.children[0].children[0].focus()
    //   }
    // },
    // currentActiveColumn: function() {
    //   if (this.currentActiveColumn === 'Value') {
    //     this.$refs[this.hash(this.currentActiveIndex, this.currentActiveColumn)][0].$el.focus()
    //   } else {
    //     this.$refs[this.hash(this.currentActiveIndex, this.currentActiveColumn)][0].$el.children[0].children[0].focus()
    //   }
    // },
  },
  methods: {
    switchEditMode() {
      this.editMode = !this.editMode
    },
    handleChange(value, itemIdx, column) {
      this.$store.dispatch('ACTION_MANUAL_CHANGES_TO_STATEMENT', { value, itemIdx, column })
    },
    activateIndex(idx, col) {
      this.$store.dispatch('ACTION_UPDATE_ACTIVE_INDEX', { idx, col })
    },
    isActive(dataIndex, column) {
      return dataIndex === this.currentActiveIndex && column === this.currentActiveColumn
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
      this.pageData[idx].Libelle = labels[parseInt(input)]
    },
    updateImputation(input, idx) {
      const payload = {
        imputation: input,
      }
      this.$store.dispatch('ACTION_DO_IMPUTATION_CHANGES_TO_STATEMENT', payload)
    },
    suggestFilter(singleItem, query) {
      return singleItem.indexOf(query) === 0 && singleItem.length === query.length + 1
    },
    onSelectChange(selectedStatements) {
      this.selectedStatements = selectedStatements.sort((a, b) => a - b)
    },
    insertStatements(offset) {
      this.$store.dispatch('ACTION_INSERT_STATEMENTS', { offset, selectedStatements: this.selectedStatements })
      this.selectedStatements = []
    },
    deleteStatements() {
      this.$store.dispatch('ACTION_DELETE_STATEMENTS', { selectedStatements: this.selectedStatements })
      this.selectedStatements = []
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
