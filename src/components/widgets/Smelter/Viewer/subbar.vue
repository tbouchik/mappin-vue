<template>
  <div :class="$style.subbar">
    <ul :class="$style.breadcrumbs" class="mr-4">

      <li :class="$style.breadcrumb">
        <a href="#" :class="[$style.breadcrumbLink, $style.breadcrumbLink__current]">{{current.name}}</a>
      </li>
    </ul>
    <div :class="$style.divider" class="mr-4 d-none d-xl-block" />
    <p class="color-gray-4 text-uppercase font-size-18 mb-0 mr-4 d-none d-xl-block">
        <div>
            <a-tag :color="current.status === 'pending' ? 'volcano' : current.status === 'smelted' ? 'geekblue' : 'green'">
                {{current.status}}
            </a-tag>
        </div>
    <div :class="$style.amount" class="mr-3 ml-auto d-none d-sm-flex">
      <a-button-group>
      <a-button type="link" :disabled="currentIndexIsFirst" @click="goPrevious"> <a-icon type="left" />Previous</a-button>
      <a-button type="link" :disabled="currentIndexIsLast" @click="goNext"> Next<a-icon type="right" /> </a-button>
    </a-button-group>
    <a-button-group>
    </a-button-group>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SmelterSubbar',
  computed: {
    ...mapGetters(['smeltedIdList', 'documentsIdList']),
    currentIndex: function() {
      if (this.smeltedValidation) {
        return this.smeltedIdList.indexOf(this.current.id)
      }
      return this.documentsIdList.indexOf(this.current.id)
    },
    lastIndex: function() {
      if (this.smeltedValidation) {
        return this.smeltedIdList.length - 1
      }
      return this.documentsIdList.length - 1
    },
    currentIndexIsLast: function() {
      return this.currentIndex === this.lastIndex
    },
    currentIndexIsFirst: function() {
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
        this.$router.push({ name: 'viewer', params: { documentId: this.smeltedIdList[this.currentIndex + 1], smeltedValidation: this.smeltedValidation } })
      } else {
        this.$router.push({ name: 'viewer', params: { documentId: this.documentsIdList[this.currentIndex + 1], smeltedValidation: this.smeltedValidation } })
      }
    },
    goPrevious() {
      if (this.smeltedValidation) {
        this.$router.push({ name: 'viewer', params: { documentId: this.smeltedIdList[this.currentIndex - 1], smeltedValidation: this.smeltedValidation } })
      } else {
        this.$router.push({ name: 'viewer', params: { documentId: this.documentsIdList[this.currentIndex - 1], smeltedValidation: this.smeltedValidation } })
      }
    },
  },
}
</script>
<style lang="scss" module>
@import "./style.module.scss";
</style>
