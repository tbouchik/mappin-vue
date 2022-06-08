<template>
  <div>
    <br>
    <div class="air__utils__heading">
      <b-row>
        <b-col md="1" class="my-1">
          <h5>Journaux </h5>
        </b-col>
        <b-col md="6" class="my-1">
          <button
            type="button"
            class="btn btn-success btn-with-addon mr-auto text-nowrap d-none d-md-block"
          >
            <span class="btn-addon">
              <i class="btn-addon-icon fe fe-plus-circle" />
            </span>
            Ajouter Journal
          </button>

        </b-col>
      </b-row>
    </div>
    <div>
        <a-table
            :columns="columns"
            :row-key="record => record.id"
            :data-source="journals"
            :pagination="pagination"
            :loading="loading"
            @change="handleTableChange"
        >
        </a-table>
    </div>
 </div>
</template>
<script>
import { mapGetters } from 'vuex'

const columns = [
  {
    title: 'Nom',
    dataIndex: 'name',
    sorter: true,
    width: '30%',
    scopedSlots: { customRender: 'name' },
  },
  {
    title: 'Code',
    dataIndex: 'code',
    width: '30%',
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
  },
]

export default {
  data() {
    return {
      pagination: {},
      loading: false,
      columns,
    }
  },
  created() {
    this.$store.dispatch('ACTION_FETCH_JOURNALS', { page: 1, limit: 10 })
  },
  computed: {
    ...mapGetters(['journals']),
  },
  methods: {
    handleTableChange(pagination, filters, sorter) {
      console.log(pagination)
      const pager = { ...this.pagination }
      pager.current = pagination.current
      this.pagination = pager
      this.fetch({
        results: pagination.pageSize,
        page: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order,
        ...filters,
      })
    },
    fetch(params = {}) {
      this.loading = true
    //   queryData({
    //     results: 10,
    //     ...params,
    //   }).then(({ data }) => {
    //     const pagination = { ...this.pagination }
    //     pagination.total = 200
    //     this.loading = false
    //     this.data = data.results
    //     this.pagination = pagination
    //   })
    },
  },
}
</script>
