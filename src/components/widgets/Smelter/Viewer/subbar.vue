<template>
  <div :class="$style.subbar"
        v-shortkey="['enter']"
      @shortkey="goNext()">
    <ul :class="$style.breadcrumbs" class="mr-4">
      <b-nav @click="goToClient">
        <b-nav-item>{{ current.client.name }}</b-nav-item>
      </b-nav>
    </ul>
    <div :class="$style.divider" class="mr-4 d-none d-xl-block" />
    <ul :class="$style.breadcrumbs" class="mr-4">
      <b-nav>
        <b-nav-item>{{ templateType }}</b-nav-item>
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
          :loading="leftLoading"
          @click="goPrevious"
        >
          <a-icon type="left" />Previous</a-button
        >
        <a-button type="link"
                  :disabled="currentIndexIsLast"
                  :loading="rightLoading"
                  @click="goNext">
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
import DocumentService from '../../../../services/documentService'

export default {
  name: 'SmelterSubbar',
  data: function () {
    return {
      rightLoading: false,
      leftLoading: false,
      loadedAllSmeltedFromLeft: false,
      loadedAllSmeltedFromRight: false,
      loadedAllDocsFromRight: false,
      loadedAllDocsFromLeft: false,
    }
  },
  computed: {
    ...mapGetters([ 'documentsIdList',
      'docSmeltedCache',
      'docQueryParams',
      'docPagination']),
    currentIndex: function () {
      if (this.smeltedValidation) {
        return this.docSmeltedCache.indexOf(this.current.id)
      }
      return this.documentsIdList.indexOf(this.current.id)
    },
    lastIndex: function () {
      if (this.smeltedValidation) {
        return this.docSmeltedCache.length - 1
      }
      return this.documentsIdList.length - 1
    },
    currentIndexIsLast: function () {
      if (this.currentIndex === this.lastIndex && this.smeltedValidation && !this.loadedAllSmelted) {
        this.fetchNewSmeltedIds('right')
      } else if (this.currentIndex === this.lastIndex && !this.smeltedValidation && !this.loadedAllDocsFromRight) {
        this.fetchNewDocs('right')
      }
      return this.currentIndex === this.lastIndex
    },
    currentIndexIsFirst: function () {
      if (this.currentIndex === 0 && this.smeltedValidation && !this.loadedAllSmelted) {
        this.fetchNewSmeltedIds('left')
      } else if (this.currentIndex === 0 && !this.smeltedValidation && !this.loadedAllDocsFromLeft) {
        this.fetchNewDocs('left')
      }
      return this.currentIndex === 0
    },
    templateType: function () {
      let preffix = 'Invoice type: '
      let suffix = 'Not Specified'
      let type = this.current.filter.type
      if (type) {
        suffix = type.charAt(0).toUpperCase() + type.slice(1)
      }
      return preffix.concat(suffix)
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
            documentId: this.docSmeltedCache[this.currentIndex + 1],
            smeltedValidation: this.smeltedValidation,
          },
        })
      } else {
        console.log(this.currentIndex)
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
            documentId: this.docSmeltedCache[this.currentIndex - 1],
            smeltedValidation: this.smeltedValidation,
          },
        })
      } else {
        console.log(this.currentIndex)
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
      let lines = ['Key', 'Value']
      let arrData = []
      lines.map(line => {
        arrData.push(this.current.osmium.map(item => {
          return Object.values(pick(item, [line]))
        }).join(';'))
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

    fetchNewSmeltedIds(side) {
      // this.rightLoading = true
      // const cacheLength = this.docSmeltedCache.length
      // DocumentService.fetchNextSmeltedDocuments({
      //   ...this.docQueryParams,
      //   skip: cacheLength,
      // }).then((idsArray) => {
      //   if (idsArray.length) {
      //     this.$store.dispatch('ACTION_CACHE_SMELTED_IDS', { idsArray,
      //       concat: true })
      //   } else {
      //     this.loadedAllSmelted = true
      //   }
      //   this.rightLoading = false
      // }).catch(error => {
      //   console.log(error)
      //   this.rightLoading = false
      // })
      if (side === 'left') {
        this.leftLoading = true
        if (this.docPagination.page === 1) {
          this.loadedAllSmeltedFromLeft = true
          this.leftLoading = false
        } else {
          DocumentService.fetchNextSmeltedDocuments({
            ...this.docQueryParams,
            side: 'left',
            current: this.current.id,
          }).then((idsArray) => {
            if (idsArray.length) {
              this.$store.dispatch('ACTION_CACHE_SMELTED_IDS', { idsArray,
                left: true,
                right: false })
            } else {
              this.loadedAllSmeltedFromLeft = true
            }
            this.leftLoading = false
          }).catch(error => {
            console.log(error)
            this.leftLoading = false
          })
        }
      } else {
        this.rightLoading = true
        DocumentService.fetchNextSmeltedDocuments({
          ...this.docQueryParams,
          side: 'right',
          current: this.current.id,
        }).then((idsArray) => {
          if (idsArray.length) {
            this.$store.dispatch('ACTION_CACHE_SMELTED_IDS', { idsArray,
              left: false,
              right: true })
          } else {
            this.loadedAllSmeltedFromRight = true
          }
          this.rightLoading = false
        }).catch(error => {
          console.log(error)
          this.rightLoading = false
        })
      }
    },

    fetchNewDocs(side) {
      // this.docPagination
      if (side === 'left') {
        this.leftLoading = true
        if (this.docPagination.page === 1) {
          this.loadedAllDocsFromLeft = true
          this.leftLoading = false
        } else {
          DocumentService.fetchNextDocuments({
            ...this.docQueryParams,
            side: 'left',
            current: this.current.id,
          }).then((idsArray) => {
            if (idsArray.length) {
              this.$store.dispatch('ACTION_CACHE_IDS', { idsArray,
                left: true,
                right: false })
            } else {
              this.loadedAllDocsFromLeft = true
            }
            this.leftLoading = false
          }).catch(error => {
            console.log(error)
            this.leftLoading = false
          })
        }
      } else {
        this.rightLoading = true
        DocumentService.fetchNextDocuments({
          ...this.docQueryParams,
          side: 'right',
          current: this.current.id,
        }).then((idsArray) => {
          if (idsArray.length) {
            this.$store.dispatch('ACTION_CACHE_IDS', { idsArray,
              left: false,
              right: true })
          } else {
            this.loadedAllDocsFromRight = true
          }
          this.rightLoading = false
        }).catch(error => {
          console.log(error)
          this.rightLoading = false
        })
      }
    },
  },
  destroyed() {
    this.$store.dispatch('ACTION_RESET_SMELTED_IDS')
    this.loadedAllSmelted = false
  },
}
</script>
<style lang="scss" module>
@import "./style.module.scss";
</style>
