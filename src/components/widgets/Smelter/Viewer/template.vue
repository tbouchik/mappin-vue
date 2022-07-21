<template>
  <div>
    <br>
    <div v-if="showImputationAlert && currentActivePane==='templatePane'">
        <a-alert  :message="currentImputationAlert" type="info" close-text="Fermer" />
    </div>
  <br>
    <a-form layout="inline" v-if="!document.vendor.confirmed" >
      <div class="spin-content" v-if="confirmVendorLoading">

      </div>
      <div v-else>

        <a-form-item
            label="Veuillez confirmer le nom du Fournisseur"
          >
            <a-input placeholder="Nom Fournisseur"
                :value="vendorName"
                :disabled="document.vendor.confirmed"/>
          </a-form-item>
          <a-form-item>
          <a-button type="primary"
            @click="handleConfirmNewVendor"
            ghost>
            Confirmer
          </a-button>
        </a-form-item>
      </div>
    </a-form>
    <br>
    <a-button type="primary" icon="rollback"
      v-if="!osmiumSnapshotsEmpty"
      style="margin-bottom:1%"
      :disabled="osmiumSnapshotsEmpty" ghost>
      <a
      @click.prevent="rollbackChange"
      >&nbsp; Annuler
      </a>
    </a-button>
    &nbsp;
    <b-button v-if="!isBankStatement && !document.rulesValidated"
        variant="btn btn-outline-warning"
        @click="showFixSuggestionsCard"
        >
        <div>Anomalies détectées</div>
    </b-button>
    <div class="mt-2 collapse show" v-if="vatCardVisible && !isBankStatement && !document.rulesValidated">
      <div class="card">
        <div class="card-body" v-if="document.rules.isAllFieldsPopulated && document.rules.isAllFieldsPopulated.value === true">
        <p class="card-text" v-if="document.rules.isAllFieldsPopulated.fields.length !== 0"><b>Champs non renseignés:</b></p>
        <ul>
          <li v-for="field in  document.rules.isAllFieldsPopulated.fields" :key="field">
            <p>{{field}}</p>
          </li>
        </ul>
        <p class="card-text" v-if="document.rules.isAllFieldsPopulated.imputations.length !== 0"><b>Imputations non remplies:</b></p>
        <ul>
          <li v-for="imputation in  document.rules.isAllFieldsPopulated.imputations" :key="imputation">
            <p>{{imputation}}</p>
          </li>
        </ul>
        </div>
        <div class="card-body" v-if="document.rules.isTotalBalanced && document.rules.isTotalBalanced.value === true">
          <p class="card-text"><b>Bilan non équilibré:</b></p>
        <p><b>Débit:</b> (Total Références) {{document.rules.isTotalBalanced.refs}} + (TVA) {{document.rules.isTotalBalanced.vat}} = <b>{{debitFieldsSum}}</b></p>
        <p><b>Crédit:</b> (TTC) <b>{{document.rules.isTotalBalanced.ttc}}</b></p>
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
      vendorName: '',
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
    this.vendorName = this.document.vendor.name
    this.activateIndex(0, 'Value')
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
    ...mapGetters(['osmiumSnapshotsEmpty', 'currentPage', 'currentActiveIndex', 'currentActivePane', 'currentActiveColumn', 'catMode', 'showImputationAlert', 'currentImputationAlert', 'confirmVendorLoading']),
    adjustedColumns: function() {
      return this.document.isBankStatement ? columns.slice(0, 2) : columns
    },
    debitFieldsSum() {
      if (this.document.rules.isTotalBalanced.value) {
        let sum = parseFloat(this.document.rules.isTotalBalanced.vat) + parseFloat(this.document.rules.isTotalBalanced.refs)
        return sum.toFixed(2)
      }
      return 0
    },
  },
  watch: {
    document: function () {
      this.pageData = this.document.osmium.map(x => { return { Key: x.Key, Value: x.Value, Imputation: x.Imputation } })
      this.vendorName = this.document.vendor.name
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
    handleConfirmNewVendor() {
      let newVendor = { name: this.vendorName, confirmed: true }
      this.$store.dispatch('ACTION_CONFIRM_VENDOR', { id: this.document.vendor.id, body: newVendor })
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
    showFixSuggestionsCard() {
      this.vatCardVisible = !this.vatCardVisible
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
