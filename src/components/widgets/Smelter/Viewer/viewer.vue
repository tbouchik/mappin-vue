<template>
  <div>
    <div v-if="!insideUploaderView" class="air__utils__heading">
      <h5>Smeltor Viewer</h5>
    </div>
    <div class="card">
      <div v-if="current" class="card-body">
        <div v-for="(page, index, i) in current.metadata" :key="i">
          <div class="display-6">
            <strong>Page {{i + 1}}:</strong>
          </div>
          <b-form
            inline
            class="mb-3 mr-sm-3 mb-sm-3"
            :label="item.Key"
            v-for="item in page"
            :key="item.Key"
          >
            <b-input-group prepend="key" class="mb-3 mr-sm-3 mb-sm-0">
              <b-input
                :disabled="!editMode"
                id="inline-form-input-name"
                class="mb-3 mr-sm-3 mb-sm-0"
                placeholder="No key identified"
                v-model="item.Key"
              ></b-input>
            </b-input-group>

            <b-input-group prepend="value" class="mb-3 mr-sm-3 mb-sm-0">
              <b-input
                :disabled="!editMode"
                id="inline-form-input-username"
                placeholder="No Value identified"
                v-model="item.Value"
              ></b-input>
            </b-input-group>
          </b-form>
        </div>
        <div class="row">
          <b-button variant="btn btn-outline-primary  ml-sm-3 mr-sm-3 col-md-1" :disabled="editMode" @click="activateEditMode">Edit</b-button>
          <b-button variant="btn btn-success btn-lg btn-block col-md-1" :disabled="!editMode" @click="save">Save</b-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SmelterViewer',
  data() {
    return {
      editMode: false,
    }
  },
  props: {
    insideUploaderView: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters(['current']),
  },
  methods: {
    activateEditMode() {
      this.editMode = !this.editMode
    },
    save() {
      this.editMode = !this.editMode
    },
  },
  destroyed() {
      this.$store.dispatch('CLEAR_DOCUMENT')
  },
}
</script>
