<template>
  <div>
    <br>
    <div class="air__utils__heading">
      <b-row>
        <b-col md="1" class="my-1">
          <h5>Journaux </h5>
        </b-col>
        <b-col md="6" class="my-1">

        </b-col>
      </b-row>
    </div>
    <div>
      <button
            type="button"
            class="btn btn-success btn-with-addon mr-auto text-nowrap d-none d-md-block"
            style="margin-bottom:1%"
            @click="addJournal"
          >
            <span class="btn-addon">
              <i class="btn-addon-icon fe fe-plus-circle" />
            </span>
            Ajouter Journal
          </button>
        <a-table
            :columns="columns"
            :row-key="record => record.id"
            :data-source="pageData"
        >
        <template
            v-for="col in ['name', 'code', 'type']"
            :slot="col"
            slot-scope="text, record, index"
          >
            <div :key="col">
              <a-input
                style="margin: -5px 0"
                :value="text"
                v-if="record.editable"
                @change="e => handleChange(e.target.value, index, col)"
              />
              <template v-else>
                {{ text }}
              </template>
            </div>
        </template>

        <template slot="operation" slot-scope="text, record, index">
        <div class="editable-row-operations">
          <span v-if="record.editable">
            <a @click="() => saveChange(index)">Confirmer</a>
            <a-divider type="vertical" />
            <a-popconfirm title="Êtes-vous sûr d'annuler?" @confirm="() => cancelChange(index)">
              <a>Annuler</a>
            </a-popconfirm>
          </span>
          <span v-else>
            <a @click="() => onEdit(index)">Modifier</a>
              <a-divider type="vertical" />
              <a-popconfirm
                title="Êtes-vous sûr de supprimer?"
                @confirm="() => onDelete(index)"
              >
                <a>Supprimer</a>
              </a-popconfirm>
          </span>
        </div>
      </template>
        </a-table>
    </div>
 </div>
</template>
<script>
import { cloneDeep, pick } from 'lodash'
import axios from 'axios'

const columns = [
  {
    title: 'Nom',
    dataIndex: 'name',
    width: '30%',
    scopedSlots: { customRender: 'name' },
  },
  {
    title: 'Code',
    dataIndex: 'code',
    width: '30%',
    scopedSlots: { customRender: 'code' },
  },
  {
    title: 'Type',
    dataIndex: 'type',
    filters: [
      { text: 'Achats', value: 'achats' },
      { text: 'Ventes', value: 'ventes' },
      { text: 'Trésorerie', value: 'tresorerie' },
      { text: 'Général', value: 'general' },
      { text: 'Situation', value: 'situation' },
    ],
    width: '20%',
    scopedSlots: { customRender: 'type' },
  },
  {
    title: 'Operation',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  data() {
    return {
      pagination: {},
      editingKey: '',
      cache: [],
      pageData: [],
      columns,
    }
  },
  created() {
    this.fetchJournals()
  },
  methods: {
    handleChange(value, index, col) {
      this.pageData[index][col] = value
    },
    addJournal() {
      this.pageData.forEach(element => {
        element.editable = false
      })
      this.cache = cloneDeep(this.pageData)
      let newJournal = {
        type: 'achats',
        code: '',
        name: '',
        editable: true,
      }
      this.pageData = [...this.pageData, newJournal]
    },
    saveChange(index) {
      let newPageData = cloneDeep(this.pageData)
      newPageData[index].editable = false
      this.pageData = newPageData
      this.cache = newPageData
      if (this.pageData[index]._id) {
        this.updateJournal(index, this.pageData[index])
      } else {
        this.postNewJournal(index, this.pageData[index])
      }
    },
    cancelChange(index) {
      this.pageData = cloneDeep(this.cache)
    },
    onEdit (idx) {
      let newPageData = cloneDeep(this.pageData)
      newPageData.forEach(element => {
        element.editable = false
      })
      this.cache = cloneDeep(newPageData)
      newPageData[idx].editable = true
      this.pageData = newPageData
    },
    onDelete (idx) {
      const journalId = this.pageData[idx]._id
      this.pageData.splice(idx, 1)
      this.deleteJournal(journalId)
    },
    postNewJournal(idx, journal) {
      return axios.post(`/v1/journals`, pick(journal, ['name', 'code', 'type']))
        .then(
          ({ data }) => {
            this.pageData[idx] = data
            this.cache = cloneDeep(this.pageData)
            console.log('post req', data)
          }
        )
    },
    fetchJournals() {
      return axios.get(`/v1/journals`, { page: 1, limit: 100 })
        .then(
          ({ data }) => {
            this.pageData = cloneDeep(data)
            this.cache = cloneDeep(data)
          }
        )
    },
    updateJournal(idx, journal) {
      return axios.patch(`/v1/journals/${journal._id}`, pick(journal, ['name', 'code', 'type']))
        .then(
          ({ data }) => {
            this.pageData[idx] = data
            this.cache = cloneDeep(this.pageData)
            console.log('put req', data)
          }
        )
    },
    deleteJournal(journalId) {
      return axios.delete(`/v1/journals/${journalId}`)
        .then(
          ({ data }) => {
            console.log('delete req', data)
          }
        )
    },
  },
}
</script>
<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>
