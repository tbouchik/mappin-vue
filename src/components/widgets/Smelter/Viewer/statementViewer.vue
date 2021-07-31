<template>
  <div>
    <br>
      <div style="margin-bottom: 16px">
        <a-dropdown :disabled="!hasSelectedStatements" >
          <a-button>{{ $t('template.actions') }}</a-button>
          <a-menu slot="overlay">
            <a-menu-item @click="setInsertModalVisible(-1)" v-if="hasNoStatements">
              <div>{{ $t('template.insertLine') }}</div>
            </a-menu-item>
            <a-menu-item @click="setInsertModalVisible(0)" v-if="!hasNoStatements">
              <div>{{ $t('template.insertAbove') }}</div>
            </a-menu-item>
            <a-menu-item @click="setInsertModalVisible(1)" v-if="!hasNoStatements">
              <div>{{ $t('template.insertBelow') }}</div>
            </a-menu-item>
            <a-menu-item @click="deleteStatements" v-if="!hasNoStatements">
              <div>{{ $t('template.deleteAction') }}</div>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
        <a-button type="primary" style="margin-left:1%" @click="setBalanceModalVisible" ghost>
          Bilan
        </a-button>
        <a-button type="primary" style="margin-left:1%" @click="setDateModalVisible" ghost>
          Formater Date
        </a-button>
        <a-modal
          v-model="balanceModalVisible"
          title="Totaux des mouvements"
          centered
          :cancelText="null"
          @ok="() => (balanceModalVisible = false)"
        >
          <div v-if="assessment.balanced">
            <p>Total Débit: {{ assessment.debit  }}</p>
            <p>Total Crédit: {{ assessment.credit }}</p>
          </div>
          <div v-else>
            <p>La ligne suivante n'est pas équilibrée:</p>
            <p>Date: {{ assessment.error.Date }} </p>
            <p>Désignation: {{ assessment.error.Designation }} </p>
            <p>Débit: {{ assessment.error.Debit }} </p>
            <p>Crédit: {{ assessment.error.Credit }} </p>
          </div>
        </a-modal>
      </div>
      <br>
      <div v-if="showImputationAlert && currentActivePane==='statementPane'">
          <a-alert  :message="currentImputationAlert" type="info" close-text="Fermer" />
      </div>
      <br>
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
          <div :key="col"  v-if="col==='Compte' && isActive(dataIndex, col)" @click="activateIndex(dataIndex, col)">
            <template v-if="record.Compte !== undefined && record.Compte !== null">
              <vue-simple-suggest
                @input="e => changeLibelle(e)"
                @hover="e => changeLibelle(e)"
                @blur="e => updateImputationFromBlur(e, dataIndex)"
                @request-start="e => changeLibelle(e)"
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
          <div :key="col"  v-if="col==='Compte' && !isActive(dataIndex, col)" @click="activateIndex(dataIndex, col)">
            <template v-if="record.Compte !== undefined && record.Compte !== null">
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
    <a-modal v-model="dateModalVisible" title="Confirmation de Date" @ok="confirmDate">
      <a-range-picker
        :placeholder="['Mois début', 'Mois fin']"
        format="MM/YYYY"
        :value="dates"
        :mode="datePickerMode"
        @panelChange="handleDatePickerPanelChange"
        @change="handleDateChange"
      />
    </a-modal>
    <a-modal v-model="insertModalVisible" title="Confirmation de Date" @ok="confirmInsertStatements">
      <div>
        <p>Choisissez le nombre de lignes à insérer: </p>
        <a-dropdown>
          <a-menu slot="overlay" @click="handleNumberOfLinesChange">
            <a-menu-item key="1"> 1 </a-menu-item>
            <a-menu-item key="2"> 2 </a-menu-item>
            <a-menu-item key="3"> 3 </a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px"> Button <a-icon type="down" /> </a-button>
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
import labels from '../../../../assets/accounting/labels'
import VueSimpleSuggest from 'vue-simple-suggest'
import 'vue-simple-suggest/dist/styles.css' // Optional CSS
import moment from 'moment'
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
      balanceModalVisible: false,
      dateModalVisible: false,
      insertModalVisible: false,
      offset: null,
      numberOfLines: 0,
      datePickerMode: ['month', 'month'],
      dates: [],
      assessment: {
        balanced: true,
        credit: 0.00,
        debit: 0.00,
      },
    }
  },
  created() {
    this.pageData = this.bankOsmium[`page_${this.currentPage}`].map(x => { return { Date: x.Date.Text, Designation: x.Designation.Text, Compte: x.Compte.Text, Debit: x.Debit.Text, Credit: x.Credit.Text } })
    this.getTotalStreams()
  },
  props: {
    bankOsmium: {
      required: true,
    },
    dateEnd: {
      required: false,
    },
    dateBeg: {
      required: false,
    },
    isArchived: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    ...mapGetters(['currentPage', 'currentActiveIndex', 'currentActivePane', 'currentActiveColumn', 'catMode', 'showImputationAlert', 'currentImputationAlert']),
    hasSelectedStatements() {
      return this.selectedStatements.length > 0 || this.bankOsmium[`page_${this.currentPage}`].length === 0
    },
    hasNoStatements() {
      return this.bankOsmium[`page_${this.currentPage}`].length === 0
    },
  },
  watch: {
    bankOsmium: function() {
      this.pageData = this.bankOsmium[`page_${this.currentPage}`].map(x => { return { Date: x.Date.Text, Designation: x.Designation.Text, Compte: x.Compte.Text, Debit: x.Debit.Text, Credit: x.Credit.Text } })
      this.getTotalStreams()
    },
    currentPage: function() {
      this.selectedStatements = []
      this.pageData = this.bankOsmium[`page_${this.currentPage}`].map(x => { return { Date: x.Date.Text, Designation: x.Designation.Text, Compte: x.Compte.Text, Debit: x.Debit.Text, Credit: x.Credit.Text } })
      this.setActiveBboxes()
    },
    currentActiveIndex: function() {
      const pageNotEmpty = this.bankOsmium[`page_${this.currentPage}`].length > 0
      if (this.currentActivePane === 'statementPane' && pageNotEmpty) {
        this.setActiveBboxes()
        if (this.currentActiveColumn !== 'Compte') {
          this.$refs[this.hash(this.currentActiveIndex, this.currentActiveColumn)][0].$el.focus()
        } else {
          this.$refs[this.hash(this.currentActiveIndex, this.currentActiveColumn)][0].$el.children[0].children[0].focus()
        }
      }
    },
    currentActiveColumn: function() {
      const pageNotEmpty = this.bankOsmium[`page_${this.currentPage}`].length > 0
      if (this.currentActivePane === 'statementPane' && pageNotEmpty) {
        if (this.currentActiveColumn !== 'Compte') {
          this.$refs[this.hash(this.currentActiveIndex, this.currentActiveColumn)][0].$el.focus()
        } else {
          this.$refs[this.hash(this.currentActiveIndex, this.currentActiveColumn)][0].$el.children[0].children[0].focus()
        }
      }
    },
  },
  methods: {
    setBalanceModalVisible() {
      this.getTotalStreams()
      this.balanceModalVisible = true
    },
    getTotalStreams() {
      const allStatements = Object.values(this.bankOsmium).map(statementsArray => statementsArray).flat()
      let totalDebit = '0.00'
      let totalCredit = '0.00'
      let balanced = true
      const maxJumps = 2
      let counter = 1
      let indicesToJump = new Set()
      allStatements.forEach((st, i, arr) => {
        if (!indicesToJump.has(i)) {
          let debitData = this.getStatementPrice(st.Debit.Text)
          let creditData = this.getStatementPrice(st.Credit.Text)
          if (debitData.isNull && !creditData.isNull) {
            counter = 1
            let debitCounterparty = '0.00'
            while (counter <= maxJumps && debitCounterparty < creditData.value) {
              let nextDebit = this.getStatementPrice(arr[i + counter].Debit.Text).value
              debitCounterparty = (parseFloat(debitCounterparty) + parseFloat(nextDebit))
              debitCounterparty = debitCounterparty.toFixed(2)
              counter += 1
            }
            if (debitCounterparty === creditData.value) {
              totalCredit = (parseFloat(totalCredit) + parseFloat(creditData.value)).toFixed(2)
              while (counter > 1) {
                indicesToJump.add(i + counter - 1)
                counter -= 1
              }
            } else {
              balanced = false
              this.assessment.error = st
            }
          } else if (creditData.isNull && !debitData.isNull) {
            counter = 1
            let creditCounterparty = '0.00'
            while (counter <= maxJumps && creditCounterparty < debitData.value) {
              creditCounterparty = (parseFloat(creditCounterparty) + parseFloat(this.getStatementPrice(arr[i + counter].Credit.Text).value)).toFixed(2)
              counter += 1
            }
            if (creditCounterparty === debitData.value) {
              totalDebit = (parseFloat(totalDebit) + parseFloat(debitData.value)).toFixed(2)
              while (counter > 1) {
                indicesToJump.add(i + counter - 1)
                counter -= 1
              }
            } else {
              balanced = false
              this.assessment.error = st
            }
          }
        }
      })
      this.assessment.balanced = balanced
      this.assessment.credit = totalCredit
      this.assessment.debit = totalDebit
    },
    getStatementPrice(value) {
      const pattern = /^([\d .]+)([.,]\d{1,2})*/gi
      let currentDebitDigits = '0.00'
      try {
        let valueIsNull = value === null || value === undefined || value === ''
        currentDebitDigits = !valueIsNull ? value.match(pattern) ? value.match(pattern)[0] : '0.00' : '0.00'
        currentDebitDigits = this.parsePrice(currentDebitDigits)
      } catch (error) {
        console.log(error)
      }
      return { isNull: currentDebitDigits === '0.00', value: currentDebitDigits }
    },
    parsePrice(value) {
      if (!value) return value
      let result = value
      let commaIdx = value.indexOf(',')
      let pointIdx = value.indexOf('.')
      if (commaIdx !== -1 && pointIdx !== -1) {
        if (commaIdx < pointIdx) {
          result = result.replace(',', '')
        } else {
          result = result.replace('.', '')
        }
      }
      return parseFloat(result.replace(' ', '').replace(',', '.')).toFixed(2)
    },
    setActiveBboxes() {
      if (this.bankOsmium[`page_${this.currentPage}`] && this.bankOsmium[`page_${this.currentPage}`].length) {
        let bboxes = Object.values(this.bankOsmium[`page_${this.currentPage}`][this.currentActiveIndex]).map(x => x.Bbox)
        this.$store.dispatch('ACTION_SET_PDF_ACTIVE_BBOXES', bboxes)
      }
    },
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
      return dataIndex === this.currentActiveIndex && column === this.currentActiveColumn && this.currentActivePane === 'statementPane'
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
        imputation: input,
        itemIdx: idx,
        libelle: labels[parseInt(input)],
      }
      this.$store.dispatch('ACTION_DO_IMPUTATION_CHANGES_TO_STATEMENT', payload)
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
      this.$store.dispatch('ACTION_DO_IMPUTATION_CHANGES_TO_STATEMENT', payload)
    },
    onSelectChange(selectedStatements) {
      this.selectedStatements = selectedStatements.sort((a, b) => a - b)
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
      this.$store.dispatch('ACTION_INSERT_STATEMENTS', { offset: this.offset, selectedStatements: this.selectedStatements, lines: this.numberOfLines })
      this.selectedStatements = []
    },
    deleteStatements() {
      this.$store.dispatch('ACTION_DELETE_STATEMENTS', { selectedStatements: this.selectedStatements })
      this.selectedStatements = []
    },
    setDateModalVisible () {
      this.setMonths()
      this.dateModalVisible = true
    },
    confirmDate(e) {
      this.dateModalVisible = false
      this.$store.dispatch('ACTION_FORMAT_STATEMENT_DATES', this.dates)
    },
    handleDateChange(dates) {
      this.dates = dates
    },
    handleDatePickerPanelChange(dates, mode) {
      this.dates = dates
      this.datePickerMode = [mode[0] === 'date' ? 'month' : mode[0], mode[1] === 'date' ? 'month' : mode[1]]
    },
    setMonths() {
      if (this.dateBeg) {
        this.dates[0] = moment(this.dateBeg)
      }
      if (this.dateEnd) {
        this.dates[1] = moment(this.dateEnd)
      }
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
