<template>
  <div>
    <br />
    <div class="air__utils__heading">
      <b-row>
        <b-col md="1" class="my-1">
          <h5>Abonnement</h5>
        </b-col>

      </b-row>

    </div>
    <div style="margin-left:1%; width:100%">
        <b-row>
        <p><b>Type: </b> {{subscriptionName}}</p>
      </b-row>
      <b-row>
        <p><b>Total crédits: </b> {{companyLimit}}</p>
      </b-row>
      <b-row>
        <p><b>Statut de consommation: </b> {{companyCount}} / {{companyLimit}}</p>
      </b-row>
        <div style="margin-bottom:1%; margin-right:1%">

          <a-progress
            :stroke-color="{
              '0%': '#108ee9',
              '100%': 'purple',
            }"
            :percent="creditRatio"
          />
        </div>
    </div>
    <br />
    <div class="air__utils__heading">
      <b-row>
        <b-col md="1" class="my-1">
          <h5>Administrateurs</h5>
        </b-col>
        <b-col md="6" class="my-1"> </b-col>
      </b-row>
    </div>
    <div>
      <div class="card">
        <br />
        <a-list :grid="{ gutter: 16, column: 4 }" :data-source="admins">
          <a-list-item slot="renderItem" slot-scope="item">
            <operator :user="item"/>
          </a-list-item>
        </a-list>
      </div>
    </div>
    <br />
    <div class="air__utils__heading">
      <b-row>
        <b-col md="1" class="my-1">
          <h5>Opérateurs comptables</h5>
        </b-col>
        <b-col md="6" class="my-1"> </b-col>
      </b-row>
    </div>
    <div>
      <div class="card">
        <br />
        <a-list :grid="{ gutter: 16, column: 4 }" :data-source="operators">
          <a-list-item slot="renderItem" slot-scope="item">
            <operator :user="item"/>
          </a-list-item>
        </a-list>
      </div>
    </div>
  </div>
</template>
<script>
import Operator from '@/views/dashboard/operators/operator.vue'
import UserService from '../../../services/userService'
import CompanyService from '../../../services/companyService'
import { mapGetters } from 'vuex'
export default {
  components: {
    Operator,
  },
  data() {
    return {
      admins: [],
      operators: [],
      subscriptionName: '',
      companyLimit: 0,
    }
  },
  created() {
    this.fetchVendors()
  },
  mounted() {
    console.log(this.user)
    this.fetchCompany(this.user.company.id)
  },
  computed: {
    ...mapGetters([
      'user',
    ]),
    creditRatio: function () {
      return parseInt((this.companyCount / this.companyLimit) * 100)
    },
    companyCount: function() {
      if (!this.user) return this.companyLimit
      let result = 0
      result = this.admins.reduce((x, y) => x + y.counter, 0)
      result = this.operators.reduce((x, y) => x + y.counter, result)
      return result
    },
  },
  methods: {
    fetchVendors() {
      UserService.getUsers()
        .then(
          ({ data }) => {
            this.admins = [this.user].concat(data.filter(x => x.role === 'admin'))
            this.operators = data.filter(x => x.role === 'operator')
          }
        )
    },
    fetchCompany(id) {
      CompanyService.getCompany(id)
        .then(
          ({ data }) => {
            this.companyLimit = data.subscription.credits
            this.subscriptionName = data.subscription.type.toUpperCase()
          }
        )
    },
  },
}
</script>
<style scoped>
</style>
