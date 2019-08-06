<style lang="css">

  #select-transcripts-box .theme--light .btn,
  #select-transcripts-box.application .theme--light.btn {
    color:  rgb(113,113,113);
  }



  .dialog__content hr {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .dialog__content .card__text {
    padding: 0px
  }


</style>

<style lang="sass">
@import "../../../assets/sass/_variables.sass";

#edit-transcript-button
  color:  $app-color
  margin: 0px 8px 0px 0px
  padding: 0px

  .btn__content
    color: $app-color
    padding: 0px

#select-transcript-viz

  .selected
    outline: solid 1px $current-color

    .selection-box
      cursor: pointer

  .current
    font-weight: bold
    outline: solid 2px $current-color

    .selection-box

#select-transcripts-box
  .btn--floating.btn--small
    height: 20px !important
    width: 22px !important
    padding: 0px !important
    margin: 0px;
    margin-left: 4px;

  .btn--floating.btn--small .btn__content
    padding: 0px

  .btn__content
    color: $text-color


  #gene-source-box
    display: block
    margin-top: 0px
    margin-bottom: 10px
    width: 200px


    .input-group--select
      .input-group__selections__comma
        font-size: 14px
        padding: 0px 0px 0px 0px


    .input-group
      label
        font-size: 14px
        line-height: 25px
        height: 25px

    .input-group__input
      min-height: 0px
      margin-top: 10px




</style>

<template>

 <v-menu
    offset-y
    :close-on-content-click="false"
    :nudge-width="500"
    bottom
    left
    v-model="showTranscriptsMenu"
    >


      <v-btn id="edit-transcript-button"
       slot="activator"
       flat>
         {{ `Transcript ` + selectedTranscript.transcript_id }}
         {{ !isCanonical ? ` (non canonical) ` : `` }}
      </v-btn>


      <v-card id="select-transcripts-box">
        <div id="gene-source-box" >
          <v-select
            v-bind:items="geneSources"
            v-model="geneSource"
            label="Gene source"
            item-value="text"
            @input="onGeneSourceSelected">
          </v-select>
        </div>

        <div style="min-height:100px;max-height: 300px;overflow-y:scroll">
            <gene-viz id="select-transcript-viz"
              :data="selectedGene.transcripts"
              :margin=margin
              :trackHeight=trackHeight
              :cdsHeight=cdsHeight
              :showLabel=true
              :fixedWidth=600
              :regionStart="selectedGene.start"
              :regionEnd="selectedGene.end"
              :showBrush=false
              :showXAxis=false
              @transcript-selected="onTranscriptSelected">
            </gene-viz>

        </div>
        <div class="text-xs-right">
            <v-btn small class="mb-0" raised @click.native="onTranscriptVizClose">Close</v-btn>
        </div>
      </v-card>



  </v-menu>



</template>

<script>

import GeneViz from '../viz/GeneViz.vue'


export default {
  name: 'transcripts-viz',
  components: {
    GeneViz
  },
  props: {
    selectedGene: {},
    selectedTranscript: {},
    geneSources: null,
    geneModel: null
  },
  data() {
    return {
      margin: {top: 5, right: 5, bottom: 5, left: 200},
      trackHeight: 20,
      cdsHeight: 15,
      showTranscriptsMenu: false,
      newTranscript: null,
      geneSource: null,
      isCanonical: true
    }
  },

  mounted: function() {
    this.geneSource = this.geneModel.geneSource;
  },

  methods: {
    onTranscriptSelected: function(theTranscript) {
      this.newTranscript = theTranscript;
      let canonical = this.geneModel.getCanonicalTranscript(this.selectedGene);
      this.isCanonical = canonical.transcript_id == this.newTranscript.transcript_id;
      this.onTranscriptVizClose();
    },
    onTranscriptVizClose: function() {
      var self = this;
      if (self.newTranscript == null) {
        self.newTranscript = self.selectedTranscript;
      }
      self.$emit('transcriptSelected', self.newTranscript);
      self.showTranscriptsMenu = false;
    },
    onGeneSourceSelected: function() {
      let self = this;
      self.$emit('gene-source-selected', self.geneSource);
    },

  },



}
</script>


