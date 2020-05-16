<template>
  <div>
    <div v-if="!insideUploaderView" class="air__utils__heading">
      <h5>Smeltor Viewer</h5>
    </div>
    <!-- <div class="card">
      <div v-if="current" class="card-body">
        <div v-for="(page, index, i) in current.metadata" :key="i">
          <div class="display-6">
            <strong>Page {{i + 1}}:
          </div>
          <b-form
            inline
            class="mb-3 mr-sm-3 mb-sm-3"
            :label="item.Key"
            v-for="(item, i) in page"
            :key="i"
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
          <b-button
            variant="btn btn-outline-primary  ml-sm-3 mr-sm-3 col-md-1"
            :disabled="editMode"
            @click="activateEditMode"
          >Edit</b-button>
          <b-button
            variant="btn btn-success btn-lg btn-block col-md-1"
            :disabled="!editMode"
            @click="save"
          >Save</b-button>
        </div>
      </div>
    </div>-->
    <div v-for="(page, index, i) in data.metadata" :key="i">
      <div class="display-6">Page {{i + 1}}:</div>
      <a-table :columns="columns" :data-source="page" bordered>
        <template 
        v-for="col in ['Key', 'Value']" 
        :slot="col" 
        slot-scope="text, record, dataIndex">
          <div :key="col">
            <a-input
              v-if="record.editable"
              style="margin: -5px 0"
              :value="text"
              @change="e => handleChange(e.target.value, i, dataIndex, col)"
            />
            <template v-else>{{ text }}</template>
          </div>
        </template>
        <template slot="operation" slot-scope="text, record, dataIndex">
          <div class="editable-row-operations">
            <span v-if="record.editable">
              <a @click="() => save(record, i, dataIndex)">Save</a>
              <a-popconfirm title="Sure to cancel?" @confirm="() => cancel(record, i, dataIndex)">
                <a>Cancel</a>
              </a-popconfirm>
            </span>
            <span v-else>
              <a :disabled="editMode" @click="() => edit(record, i, dataIndex)">Edit</a>
            </span>
          </div>
        </template>
      </a-table>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { cloneDeep, omit } from 'lodash'
import DocumentService from "../../../../services/documentService.js";
const data = {
    "id":"1",
    "name": "kaka.jpeg",
    "type": "Invoice",
    "extraction": "FORMS",
    "date":"23/12/2002 4:04 PM",
    "status": "Complete",
    "metadata":{
        "page_1": [
            {   key:1,
                "Key": "Test1",
                "KeyConfidence": "39.189903259277344",
                "Value": "Value1",
                "ValueConfidence": "39.189903259277344",
                "editable": false
            },
            {   
                key:2,
                "Key": "Test2",
                "KeyConfidence": "38.996761322021484",
                "Value": "Value2",
                "ValueConfidence": "38.996761322021484",
                "editable": false

            }
        ],
        "page_2": [
            {   key:1,
                "Key": "Test3",
                "KeyConfidence": "34.58271026611328", 
                "Value": "Value3",
                "ValueConfidence": "34.58271026611328",
                "editable": false

            }
        ]
    }
}

const columns = [
  {
    title: "Key",
    dataIndex: "Key",
    width: "40%",
    scopedSlots: { customRender: "Key" }
  },
  {
    title: "Value",
    dataIndex: "Value",
    width: "45%",
    scopedSlots: { customRender: "Value" }
  },
  {
    title: "operation",
    dataIndex: "operation",
    scopedSlots: { customRender: "operation" }
  }
];
export default {
  name: "SmelterViewer",
  data() {
    return {
      editMode: false,
      columns,
      editingKey: "",
      data,
      cacheData:null
    };
  },
  props: {
    insideUploaderView: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(["current"])
  },
  methods: {
    async save() {
      await DocumentService.updateDocument(
        {
          name: this.current.name,
          metadata: this.current.metadata
        },
        this.current.id
      );
      this.editMode = !this.editMode;
      this.$router.push("/dashboard/documents");
    },
    switchEditMode() {
      this.editMode = !this.editMode;
    },
    edit(record, pageIdx, itemIdx) {
      this.switchEditMode()
      this.cacheData = cloneDeep(this.data)
      const page = Object.keys(this.data.metadata)[pageIdx]
      this.data.metadata[page][itemIdx].editable = true
    },
    async save(record, pageIdx, itemIdx) {
      this.cacheData = null
      const page = Object.keys(this.data.metadata)[pageIdx]
      this.data.metadata[page][itemIdx].editable = false
      this.switchEditMode()
      await DocumentService.updateDocument(
        {
          name: this.current.name,
          metadata: this.omitEditableFromMetadata().metadata
        },
        this.current.id
      );
      this.switchEditMode()
    },
    handleChange(value, pageIdx, itemIdx, column) {
      const page = Object.keys(this.data.metadata)[pageIdx]
      this.data.metadata[page][itemIdx][column] = value
    },
    cancel(record, pageIdx, itemIdx) {
      this.data = cloneDeep(this.cacheData)
      this.cacheData = null
      this.switchEditMode()
    },
    omitEditableFromMetadata() {
      let formattedCopy = cloneDeep(this.data)
      for (let page of Object.keys(formattedCopy.metadata)) {
         formattedCopy.metadata[page] = formattedCopy.metadata[page].map(item => {
           return omit(item, ['editable', 'key'])
        })
      }
      return formattedCopy
    },
  },
  destroyed() {
    this.$store.dispatch("CLEAR_DOCUMENT");
  }
};
</script>
<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>