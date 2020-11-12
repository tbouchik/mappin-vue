<template>
  <div :class="$style.subbar">
    <ul :class="$style.breadcrumbs" class="mr-4">
      <b-nav @click="goToClient">
        <b-nav-item>{{ current.client.name }}</b-nav-item>
      </b-nav>
    </ul>
    <div :class="$style.divider" class="mr-4 d-none d-xl-block" />
    <ul :class="$style.breadcrumbs" class="mr-4">
      <li :class="$style.breadcrumb">
        <a
          href="#"
          :class="[$style.breadcrumbLink, $style.breadcrumbLink__current]"
          >{{ current.name }}</a
        >
      </li>
    </ul>
    <div :class="$style.divider" class="mr-4 d-none d-xl-block" />
    <p
      class="color-gray-4 text-uppercase font-size-28 mb-0 mr-6 d-none d-xl-block"
    ></p>
    <div>
      <a-tag
        :color="
          current.status === 'pending'
            ? 'volcano'
            : current.status === 'smelted'
            ? 'geekblue'
            : 'green'
        "
      >
        {{ current.status }}
      </a-tag>
      <a-button-group>
        <a-tooltip placement="topLeft" title="Export CSV" arrowPointAtCenter>
          <a-button
            type="primary"
            icon="cloud-download"
            @click="csvExport"
            ghost
          />
        </a-tooltip>
      </a-button-group>
    </div>
    <div :class="$style.amount" class="mr-3 ml-auto d-none d-sm-flex">
      <a-button-group>
        <a-button
          type="link"
          :disabled="currentIndexIsFirst"
          @click="goPrevious"
        >
          <a-icon type="left" />Previous</a-button
        >
        <a-button type="link" :disabled="currentIndexIsLast" @click="goNext">
          Next<a-icon type="right" />
        </a-button>
      </a-button-group>
      <a-button-group> </a-button-group>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { pick } from 'lodash'

export default {
  name: 'SmelterSubbar',
  computed: {
    ...mapGetters(['smeltedIdList', 'documentsIdList']),
    currentIndex: function () {
      if (this.smeltedValidation) {
        return this.smeltedIdList.indexOf(this.current.id)
      }
      return this.documentsIdList.indexOf(this.current.id)
    },
    lastIndex: function () {
      if (this.smeltedValidation) {
        return this.smeltedIdList.length - 1
      }
      return this.documentsIdList.length - 1
    },
    currentIndexIsLast: function () {
      return this.currentIndex === this.lastIndex
    },
    currentIndexIsFirst: function () {
      return this.currentIndex === 0
    },
  },
  props: {
    smeltedValidation: {
      type: Boolean,
      default: false,
    },
    current: {
      type: Object,
      required: true,
    },
  },
  methods: {
    goNext() {
      if (this.smeltedValidation) {
        this.$router.push({
          name: 'viewer',
          params: {
            documentId: this.smeltedIdList[this.currentIndex + 1],
            smeltedValidation: this.smeltedValidation,
          },
        })
      } else {
        this.$router.push({
          name: 'viewer',
          params: {
            documentId: this.documentsIdList[this.currentIndex + 1],
            smeltedValidation: this.smeltedValidation,
          },
        })
      }
    },
    goPrevious() {
      if (this.smeltedValidation) {
        this.$router.push({
          name: 'viewer',
          params: {
            documentId: this.smeltedIdList[this.currentIndex - 1],
            smeltedValidation: this.smeltedValidation,
          },
        })
      } else {
        this.$router.push({
          name: 'viewer',
          params: {
            documentId: this.documentsIdList[this.currentIndex - 1],
            smeltedValidation: this.smeltedValidation,
          },
        })
      }
    },
    csvExport() {
      let csvContent = 'data:text/csv;charset=utf-8,'
      let arrData = ['Key;Value']
      this.current.osmium.map((item) => {
        arrData.push(Object.values(pick(item, ['Key', 'Value'])).join(';'))
      })
      csvContent += arrData.join('\n').replace(/(^\[)|(\]$)/gm, '')
      const data = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', data)
      link.setAttribute('download', `${this.current.name.split('.')[0]}.csv`)
      link.click()
    },
    goToClient() {
      this.$router.push({ name: 'client', params: { clientId: this.current.client._id } })
    },
  },
}
</script>
<style lang="scss" module>
@import "./style.module.scss";
</style>
