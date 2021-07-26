import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

function strokeBbox(context, canvas, bbox, color) {
  context.beginPath()
  context.rect(
    canvas.width * bbox.Left,
    canvas.height * bbox.Top,
    canvas.width * bbox.Width,
    canvas.height * bbox.Height
  )
  context.strokeStyle = color
  context.stroke()
}

export default {
  state: {
    pdfcontext: null,
    pdfActiveBbox: null,
  },
  mutations: {
    MUTATION_SET_PDF_CONTEXT(state, canvas) {
      state.pdfActiveBbox = null
      state.pdfcontext = canvas.getContext('2d')
    },
    MUTATION_SET_PDF_CONTEXT_SCALE(state, canvas) {
      state.pdfcontext.clearRect(0, 0, canvas.width, canvas.height)
      state.pdfActiveBbox = null
      state.pdfcontext.beginPath()
    },
    MUTATION_DRAW_PDF_BBOXES(state, payload) {
      for (let i = 0; i < payload.bboxes.length; i++) {
        state.pdfcontext.beginPath()
        state.pdfcontext.rect(
          payload.canvas.width * payload.bboxes[i].Left,
          payload.canvas.height * payload.bboxes[i].Top,
          payload.canvas.width * payload.bboxes[i].Width,
          payload.canvas.height * payload.bboxes[i].Height
        )
        state.pdfcontext.strokeStyle = 'purple'
        state.pdfcontext.stroke()
      }
    },
    MUTATION_SET_PDF_ACTIVE_BBOX(state, payload) {
      if (!state.pdfActiveBbox) {
        strokeBbox(state.pdfcontext, payload.canvas, payload.bbox, 'white')
        strokeBbox(state.pdfcontext, payload.canvas, payload.bbox, 'green')
      } else {
        strokeBbox(state.pdfcontext, payload.canvas, state.pdfActiveBbox, 'white')
        strokeBbox(state.pdfcontext, payload.canvas, state.pdfActiveBbox, 'purple')
        strokeBbox(state.pdfcontext, payload.canvas, payload.bbox, 'white')
        strokeBbox(state.pdfcontext, payload.canvas, payload.bbox, 'green')
      }
      state.pdfActiveBbox = payload.bbox
    },
  },
  actions: {
    ACTION_SET_PDF_CONTEXT({ commit }, canvas) {
      commit('MUTATION_SET_PDF_CONTEXT', canvas)
    },
    ACTION_SET_PDF_CONTEXT_SCALE({ commit }, canvas) {
      commit('MUTATION_SET_PDF_CONTEXT_SCALE', canvas)
    },
    ACTION_DRAW_PDF_BBOXES({ commit }, payload) {
      commit('MUTATION_DRAW_PDF_BBOXES', payload)
    },
    ACTION_SET_PDF_ACTIVE_BBOX({ commit }, payload) {
      commit('MUTATION_SET_PDF_ACTIVE_BBOX', payload)
    },
  },
  getters: {
    pdfcontext: state => state.pdfcontext,
  },
}
