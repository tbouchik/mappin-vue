import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

function strokeBboxes(context, canvas, bboxes, color) {
  bboxes.forEach(bbox => {
    if (bbox) {
      context.beginPath()
      context.rect(
        canvas.width * bbox.Left,
        canvas.height * bbox.Top,
        canvas.width * bbox.Width,
        canvas.height * bbox.Height
      )
      context.strokeStyle = 'white'
      context.stroke()
      context.strokeStyle = color
      context.stroke()
    }
  })
}

export default {
  state: {
    pdfcontext: null,
    pdfcanvas: null,
    pdfActiveBboxes: [],
  },
  mutations: {
    MUTATION_SET_PDF_CONTEXT(state, canvas) {
      state.pdfActiveBboxes = []
      state.pdfcontext = canvas.getContext('2d')
    },
    MUTATION_SET_PDF_CONTEXT_SCALE(state, canvas) {
      state.pdfcontext.clearRect(0, 0, canvas.width, canvas.height)
      state.pdfActiveBboxes = []
      state.pdfcontext.beginPath()
    },
    MUTATION_SET_PDF_CONTEXT_CANVAS(state, canvas) {
      state.pdfcanvas = canvas
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
    MUTATION_SET_PDF_ACTIVE_BBOXES(state, bboxes) {
      if (state.pdfActiveBboxes.length === 0) {
        strokeBboxes(state.pdfcontext, state.pdfcanvas, bboxes, 'green')
      } else {
        strokeBboxes(state.pdfcontext, state.pdfcanvas, state.pdfActiveBboxes, 'white')
        strokeBboxes(state.pdfcontext, state.pdfcanvas, bboxes, 'green')
      }
      state.pdfActiveBboxes = bboxes
    },
  },
  actions: {
    ACTION_SET_PDF_CONTEXT({ commit }, canvas) {
      commit('MUTATION_SET_PDF_CONTEXT', canvas)
    },
    ACTION_SET_PDF_CONTEXT_SCALE({ commit }, canvas) {
      commit('MUTATION_SET_PDF_CONTEXT_SCALE', canvas)
    },
    ACTION_SET_PDF_CONTEXT_CANVAS({ commit }, canvas) {
      commit('MUTATION_SET_PDF_CONTEXT_CANVAS', canvas)
    },
    ACTION_DRAW_PDF_BBOXES({ commit }, payload) {
      commit('MUTATION_DRAW_PDF_BBOXES', payload)
    },
    ACTION_SET_PDF_ACTIVE_BBOXES({ commit }, bboxes) {
      commit('MUTATION_SET_PDF_ACTIVE_BBOXES', bboxes)
    },
  },
  getters: {
    pdfcontext: state => state.pdfcontext,
  },
}
