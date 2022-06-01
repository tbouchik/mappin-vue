<template>
  <div>
    <br>
    <div v-if="showImputationAlert && currentActivePane==='templatePane'">
        <a-alert  :message="currentImputationAlert" type="info" close-text="Fermer" />
    </div>
  <br>
    <a-button type="primary" icon="rollback"
      style="margin-bottom:1%"
      :disabled="osmiumSnapshotsEmpty" ghost>
      <a
      @click.prevent="rollbackChange"
      >&nbsp; Annuler
      </a>
    </a-button>
    &nbsp;
    <b-button v-if="!isBankStatement && discrepencyExist"
        variant="btn btn-outline-warning"
        @click="showFixSuggestionsCard"
        >
        <div v-if="proposedTotalHt || proposedVat">Valeurs incorrectes</div>
        <div v-else>Total incorrect</div>
    </b-button>
    <div class="mt-2 collapse show" v-if="vatCardVisible && !isBankStatement && discrepencyExist">
      <div class="card">
        <div class="card-body" v-if="proposedTotalHt">
        <p class="card-text">Suggestion possible pour le total Hors Taxes</p>
        <p><button type="button" class="btn btn-secondary btn-sm" @click="adjustHt">Total HT</button> &nbsp; Ajuster à:<b> {{proposedTotalHt}}</b></p>
        </div>
        <div class="card-body" v-if="proposedVat">
          <p class="card-text">Suggestion possible pour la T.V.A</p>
        <p><button type="button" class="btn btn-secondary btn-sm" @click="adjustVat">T.V.A</button> &nbsp;Ajuster à:<b>
          {{proposedVat}}</b></p>
        </div>
        <div class="card-body" v-if="proposedTotalTtc">
        <p class="card-text">La somme totale est différente de l'addition de la somme HT et de la T.V.A</p>
        <p ><b-button size="sm" @click="adjustMissingItem">Ajuster</b-button> &nbsp;Somme proposée: <b> {{proposedTotalTtc}} </b> =  {{document.vat}} + {{document.totalHt}}</p>
        </div>
      </div>
    </div>
      <a-table  :columns="adjustedColumns"
                :data-source="pageData"
                :pagination=false
                bordered>
        <template v-for="col in ['Key', 'Value', 'Imputation']" :slot="col"   slot-scope="text, record, dataIndex" style="background:blue">
          <div :key="col"  v-if="col==='Key'" @click="activateIndex(dataIndex, col)" >
            {{text}}
          </div>
          <div :key="col"  v-if="col==='Value' && isActive(dataIndex, col)" @click="activateIndex(dataIndex, col)">
            <a-input
              style="margin: -5px 0; background:#CCCCFF"
              :value="text"
              @change="e => handleChange(e.target.value, dataIndex, col)"
              :ref="hash(dataIndex,col)"
              :disabled="document.isArchived"
            />
          </div>
          <div :key="col"  v-if="col==='Value' && !isActive(dataIndex, col)" @click="activateIndex(dataIndex, col)">
            <a-input
              style="margin: -5px 0"
              :value="text"
              @change="e => handleChange(e.target.value, dataIndex, col)"
              :ref="hash(dataIndex,col)"
              :disabled="document.isArchived"
            />
          </div>
          <div :key="col"  v-if="col==='Imputation' && isActive(dataIndex, col) && !document.isArchived" @click="activateIndex(dataIndex, col)">
            <template v-if="record.Imputation !== undefined && record.Imputation !== null">
              <vue-simple-suggest
                @input="e => changeLibelle(e, dataIndex)"
                @select="e => updateImputation(e, dataIndex)"
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
          <div :key="col"  v-if="col==='Imputation' && !isActive(dataIndex, col) && !document.isArchived" @click="activateIndex(dataIndex, col)">
            <template v-if="record.Imputation !== undefined && record.Imputation !== null">
              <vue-simple-suggest
              :value="text"
              :list="simpleSuggestionList"
              :filter-by-query="true"
              :ref="hash(dataIndex,col)">
          </vue-simple-suggest>
            </template>
          </div>
          <div :key="col"  v-if="col==='Imputation' && document.isArchived" @click="activateIndex(dataIndex, col)">
            <template v-if="record.Imputation !== undefined && record.Imputation !== null">
              <a-input
                style="margin: -5px 0"
                :value="text"
                :disabled="document.isArchived"
              />
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
      vatRate: null,
      proposedVat: null,
      proposedTotalHt: null,
      proposedTotalTtc: null,
      vatCardVisible: false,
      discrepencyExist: false,
      missingItem: null,
    }
  },
  created() {
    this.pageData = this.document.osmium.map(x => { return { Key: x.Key, Value: x.Value, Imputation: x.Imputation } })
    this.activateIndex(0, 'Value')
    this.findDiscrepencies()
  },
  props: {
    document: {
      required: true,
    },
    isBankStatement: {
      type: Boolean,
    },
  },
  computed: {
    ...mapGetters(['osmiumSnapshotsEmpty', 'currentPage', 'currentActiveIndex', 'currentActivePane', 'currentActiveColumn', 'catMode', 'showImputationAlert', 'currentImputationAlert']),
    adjustedColumns: function() {
      return this.document.isBankStatement ? columns.slice(0, 2) : columns
    },
    sumsChangeTrigger() {
      return `${this.document.vat}|${this.document.totalHt}|${this.document.totalTtc}`
    },
  },
  watch: {
    document: function () {
      this.pageData = this.document.osmium.map(x => { return { Key: x.Key, Value: x.Value, Imputation: x.Imputation } })
      this.findDiscrepencies()
    },
    sumsChangeTrigger: function() {
      this.findDiscrepencies()
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
      this.$store.dispatch('ACTION_UPDATE_ACTIVE_INDEX', { idx, col, pane: 'templatePane' })
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
    changeLibelle(input, idx) {
      this.$store.dispatch('ACTION_CHANGE_LIBELLE', input)
      clearTimeout(this.debounce)
      this.debounce = setTimeout(() => {
        const payload = {
          itemIdx: idx,
          imputation: input,
        }
        this.$store.dispatch('ACTION_DO_IMPUTATION_CHANGES_TO_INVOICE', payload)
      }, 600)
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
    rollbackChange() {
      this.$store.dispatch('ACTION_ROLLBACK_CHANGE', { target: 'invoice' })
    },
    isValidNumber(num) {
      try {
        return Boolean((num && !isNaN(parseFloat(num))) || parseInt(num) === 0)
      } catch (e) {
        return false
      }
    },
    findDiscrepencies() {
      let vat = this.document.vat
      let ht = this.document.totalHt
      let ttc = this.document.totalTtc
      if (this.isValidNumber(vat) && this.isValidNumber(ht) && this.isValidNumber(ttc)) {
        this.missingItem = null
        let vatHtRespected = this.vatHtRespected(vat, ht)
        let vatTtcRespected = this.vatTtcRespected(vat, ttc)
        let htTtcRespected = this.htTtcRespected(ht, ttc)
        let sumRelationRespected = this.sumRelationRespected(ht, vat, ttc)
        if (sumRelationRespected) {
          this.discrepencyExist = false
        } else {
          if (vatHtRespected && !vatTtcRespected) {
            // fix ttc
            this.proposeNewSet(null, null, parseFloat(ht + vat).toFixed(2))
            this.discrepencyExist = true
          } else if (!vatHtRespected && vatTtcRespected) {
            // fix ht
            this.proposeNewSet(parseFloat(ttc - vat).toFixed(2), null, null)
            this.discrepencyExist = true
          } else if (htTtcRespected && !vatTtcRespected && !vatHtRespected) {
            // fix vat
            this.proposeNewSet(null, parseFloat(ttc - ht).toFixed(2), null)
            this.discrepencyExist = true
          } else {
            // enforce sum precision
            this.proposedTotalTtc = parseFloat(parseFloat(ht + vat).toFixed(2))
            this.discrepencyExist = true
          }
        }
      } else if (this.isValidNumber(vat) && !this.isValidNumber(ht) && this.isValidNumber(ttc)) {
        // missing TOTAL HT
        this.missingItem = 'totalHt'
        this.discrepencyExist = true
        let vatTtcRespected = this.vatTtcRespected(vat, ttc)
        if (!vatTtcRespected) {
          this.proposeNewSet(null, parseFloat(ttc / 6).toFixed(2), parseFloat(6 * vat).toFixed(2))
        } else {
          this.proposeNewSet(parseFloat(ttc - vat).toFixed(2), null, null)
        }
      } else if (!this.isValidNumber(vat) && this.isValidNumber(ht) && this.isValidNumber(ttc)) {
        // missing VAT
        this.missingItem = 'vat'
        this.discrepencyExist = true
        let htTtcRespected = this.htTtcRespected(ht, ttc)
        if (!htTtcRespected) {
          this.proposeNewSet(parseFloat((5 / 6) * ttc).toFixed(2), null, parseFloat((6 / 5) * ht).toFixed(2))
        } else {
          this.proposeNewSet(null, parseFloat(ttc - ht).toFixed(2), null)
        }
      } else if (this.isValidNumber(vat) && this.isValidNumber(ht) && !this.isValidNumber(ttc)) {
        // missing TOTAL TTC
        this.missingItem = 'totalTtc'
        this.discrepencyExist = true
        let vatHtRespected = this.vatHtRespected(vat, ht)
        if (!vatHtRespected) {
          this.proposeNewSet(parseFloat(5 * vat).toFixed(2), parseFloat(ht / 5).toFixed(2), null)
        } else {
          this.proposeNewSet(null, null, parseFloat(ht + vat).toFixed(2))
        }
      }
    },
    proposeNewSet(ht, vat, ttc) {
      this.proposedTotalHt = parseFloat(ht)
      this.proposedVat = parseFloat(vat)
      this.proposedTotalTtc = parseFloat(ttc)
    },
    approximatelyEqual(ref, val) {
      return parseFloat(Math.abs(ref - val)) / parseFloat(ref) < 0.1
    },
    vatHtRespected(vat, ht) {
      return this.approximatelyEqual(parseFloat(ht / 5), vat)
    },
    vatTtcRespected(vat, ttc) {
      return this.approximatelyEqual(parseFloat(ttc / 6), vat)
    },
    htTtcRespected(ht, ttc) {
      return this.approximatelyEqual(parseFloat(ht / 5), parseFloat(ttc / 6))
    },
    sumRelationRespected(ht, vat, ttc) {
      return parseFloat(ht + vat).toFixed(2) === parseFloat(ttc).toFixed(2)
    },
    resetProposedTotals() {
      this.proposedTotalHt = null
      this.proposedTotalTtc = null
      this.proposedVat = null
    },
    showFixSuggestionsCard() {
      this.vatCardVisible = !this.vatCardVisible
    },
    adjustMissingItem() {
      let role, value
      switch (this.missingItem) {
        case 'totalHt':
          role = ['INVOICE', 'TOTAL_HT']
          value = this.proposedTotalHt
          break
        case 'vat':
          role = ['INVOICE', 'VAT']
          value = this.proposedVat
          break
        default:
          role = ['INVOICE', 'TOTAL_TTC']
          value = this.proposedTotalTtc
          break
      }
      this.$store.dispatch('ACTION_DO_ADJUSTMENT_TO_INVOICE', { role, value })
    },
    adjustHt() {
      this.$store.dispatch('ACTION_DO_ADJUSTMENT_TO_INVOICE', {
        role: ['INVOICE', 'TOTAL_HT'],
        value: this.proposedTotalHt,
      })
    },
    adjustVat() {
      this.$store.dispatch('ACTION_DO_ADJUSTMENT_TO_INVOICE', {
        role: ['INVOICE', 'VAT'],
        value: this.proposedVat,
      })
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
