<style lang="sass">
@import ../../../assets/sass/variables

#flagged-variants-card

  #clinvar-symbol
    display: inline-block
    vertical-align: top
    margin-top: 2px


  .variant-toolbar
    width: calc(100% - 1px)
    padding-right: 20px
    background-color: white
    margin-bottom: 20px

    #mygene2-basic-title
      word-break: break-word
      display: inline-block
      white-space: normal
      line-height: 18px

    #close-button
      padding-right: 0px
      position: absolute
      right: 0px
      display: inline-block
      margin-left: 0px
      min-width: 22px
      margin-top: 0px
      top: 5px

      i.material-icons
        font-size: 22px

    .toolbar__title
      font-family: inherit
      font-size: 15px
      min-width: initial
      padding-right: 30px
      padding-top: 10px
      display: inline-block
      color:  $text-color

    .toolbar-button
      min-width: 70px
      color: $text-color
      margin-right: 5px
      margin-left: 0px
      font-size: 13px
      height: 30px
      margin-top: -7px

      .btn__content
        padding: 0px

      i.material-icons
        font-size: 16px
        padding-right: 4px


  .filtered-variants-panel
    margin-top: 10px
    margin-left: 10px

  .user-flagged-variants-panel
    margin-top: 30px
    margin-left: 10px


  #mygene2-basic-none
    display: inline-block
    white-space: normal
    line-height: 18px
    font-style: italic
    margin-left: 20px

  .gene-list

  .subheader
    color: $text-color
    height: initial

    span
      width: 100%
      text-align: left;
      margin-left: -2px;

  .list--three-line
    margin-bottom: 30px
    padding-top: 5px
    .subheader
      height: initial
      font-size: 13px
      margin-left: -3px
      text-color: $text-color
      margin-top: 5px
      padding: 0 12px 0 5px

    .avatar
      width: 32px !important
      height: 32px !important

    li
      margin-left: 10px

    .list__tile__avatar
      margin-left: 0px

    .list__tile__content
      margin-left: 0px

    hr
      margin-bottom: 4px
      margin-top: 4px

    .divider--inset
      margin-left: 22px
      width: calc(100% - 42px)

    .list__tile
      padding: 0px
      height: initial
      padding-left: 3px
      padding-top: 10px

    .list__tile__avatar
      min-width: initial

    .list__tile__sub-title
      height: initial
      line-height: 18px

    .list__tile__title
      height: 22px
      line-height: 22px

    .variant-number
      margin-right: 4px
      margin-left: 0px
      display: inline-block
      vertical-align: top
      margin-bottom: 0px
      background-color: transparent
      width: 18px !important
      height: 18px !important

      .chip__content
        width: 18px !important
        height: 18px !important
        justify-content: space-around
        padding: 0px
        font-size: 11px
        background-color: $light-badge-color

    .variant-label
      font-size: 12px
      color: $text-color !important


      .coord
        display: inline-block
        width: 115px
        line-height: 12px
        vertical-align: top
      .hgvsp
        display: inline-block
        width: 115px
        line-height: 12px
        vertical-align: top


      .vep-consequence
        display: inline-block
        width: 103px
        line-height: 12px
        vertical-align: top
      .rsid
        display: inline-block
        width: 103px
        line-height: 12px
        vertical-align: top

      .af
        display: inline-block
        width: 60px
        vertical-align: top
        line-height: 12px


      .hgvsc
        display: inline-block
        width: 228px
        line-height: 12px
        vertical-align: top


    .variant-symbols
      .gene-name
        display: inline-block
        vertical-align: top
        width: 125px
        font-weight: bold
        font-size: 13px

      .has-called-variants
        font-size: 15px
        color: $called-variant-color
        margin-top: -3px
        margin-left: 2px



.variant-file-body
  padding-top: 0px
  padding-bottom: 18px
  margin-bottom: 20px
  margin-top: 20px

  .radio-group.radio-group--column
    margin-top: 0px
    padding-top: 0px
    padding-bottom: 0px

    >.input-group__input
      margin-top: 0px

  .input-group--select
    .input-group__selections__comma
      font-size: 14px
      padding: 0px 0px 0px 0px

  .input-group
    label
      font-size: 14px
      line-height: 20px
      height: 20px

  .input-group__input
    min-height: 0px
    margin-top: 10px

  .input-group__input
    .input-group__selections__comma
      font-size: 14px

  .input-group--text-field
    label
      top: 6px

  .input-group.input-group--selection-controls
    height: 24px
    .input-group__input
      .icon--selection-control
        height: 0px

.variant-file-button
  color: $text-color !important
  height: 28px
  margin-top: 10px
  margin-bottom: 10px
  margin-left: 0px
  padding-left: 0px
  padding-right: 0px
  padding-top: 0px
  padding-bottom: 0px


  i.material-icons
    font-size: 16px
    padding-right: 4px

#flagged-variants-card.basic
  .list--three-line
    li
      margin-left: 0px




</style>

<template>
  <v-card  style="padding: 0px" id="flagged-variants-card" :class="{basic: isBasicMode}">


    <div class="variant-toolbar">
      <v-btn id="close-button" class="toolbar-button" flat @click="$emit('close-left-drawer')">
        <v-icon >close</v-icon>
      </v-btn>
      <v-toolbar-title >
        <span v-show="!isBasicMode">
          Variants
        </span>
        <span id="mygene2-basic-title" v-show="isBasicMode && flaggedVariants">
          Clinvar Pathogenic/Likely Pathogenic Variants &lt; 1% frequency
        </span>
      </v-toolbar-title>
      <v-btn  v-if="!isBasicMode" flat
        class="toolbar-button"
        @click="importInProgress = false;clearFileInputs();showOpenDialog = true">
        <v-icon>open_in_browser</v-icon>
        Open
      </v-btn>

      <v-btn v-if="!isBasicMode && flaggedVariants && flaggedVariants.length > 0" flat
        class="toolbar-button"
        @click="onClickSave">
        <v-icon>save</v-icon>
        Save
      </v-btn>
    </div>


    <span id="mygene2-basic-none" v-show="isBasicMode && flaggedVariants && flaggedVariants.length == 0">
      (none)
    </span>


    <template v-for="geneList in geneLists">
      <v-subheader
      :key="geneList.label"
      v-if="geneList.show"
      v-show="!isBasicMode"
      class="gene-list"
      >
        <span v-show="geneList.genes.length > 0">
          <filter-icon :icon="geneList.name"></filter-icon>
          {{ geneList.label }}
        </span>
      </v-subheader>
      <v-list three-line>
        <template
         v-for="flaggedGene in geneList.genes">

          <!-- <v-subheader :key="flaggedGene.gene.gene_name">{{ flaggedGene.gene.gene_name }}</v-subheader>
        -->

          <template v-for="(variant, index) in flaggedGene.variants">

            <v-list-tile
            :key="variant.start + ' ' + variant.ref + ' ' + variant.alt"
            ripple
            @click="onVariantSelected(variant)">


              <v-list-tile-avatar >
               <v-chip class="variant-number" >
                {{ variant.index + 1 }}
               </v-chip>
              </v-list-tile-avatar>

              <v-list-tile-content>

                <v-list-tile-title>

                  <div class="variant-symbols">

                    <span class="gene-name"> {{ flaggedGene.gene.gene_name }}</span>
                    <app-icon
                     icon="clinvar"
                     v-if="clinvar(variant) == 'clinvar_path' || clinvar(variant) == 'clinvar_lpath'"
                     :level="clinvar(variant) == 'clinvar_path' ? 'high' : 'likely-high'"
                     class="clinvar-badge" height="13" width="13">
                    </app-icon>

                    <app-icon
                     :icon="variant.inheritance"
                     v-if="!isBasicMode && variant.inheritance && variant.inhertance != '' && variant.inheritance != 'none'"
                     class="inheritance-badge" height="15" width="15">
                    </app-icon>

                    <app-icon
                     icon="impact"
                     :type="variant.type.toLowerCase()"
                     :clazz="highestImpactClass(variant)"
                     class="impact-badge" height="15" width="15">
                    </app-icon>

                   <app-icon
                     icon="zygosity" v-if="!isBasicMode"
                     :type="zygosity(variant).toLowerCase()"
                     height="14" width="24">
                    </app-icon>

                    <v-icon v-if="variant.fbCalled == 'Y'" class="has-called-variants">
                      check_circle
                    </v-icon>

                  </div>
                </v-list-tile-title>

                <v-list-tile-sub-title >
                  <div class="variant-label">
                    <div style="display:inline-block;" >
                      <span class="coord"> {{ coord(flaggedGene, variant) }} </span>
                    </div>
                    <div style="display:inline-block;vertical-align:top">
                      <span class="vep-consequence">{{ vepConsequence(variant) }}</span>
                    </div>
                    <span class="af">{{ afDisplay(variant) }}</span>
                  </div>
                  <div class="variant-label" v-if="isBasicMode">
                    <div style="display:inline-block;" >
                      <span class="hgvsc">  {{ hgvsC(variant) }} </span>
                    </div>
                  </div>
                  <div class="variant-label">
                    <div style="display:inline-block;" >
                      <span class="hgvsp">  {{ hgvsP(variant) }} </span>
                    </div>
                    <div style="display:inline-block;vertical-align:top">
                      <span v-if="!isBasicMode" class="rsid">{{ rsId(variant) }}</span>
                    </div>
                  </div>
                </v-list-tile-sub-title>

              </v-list-tile-content>

            </v-list-tile>


          </template>

        </template>
      </v-list>
    </template>

    <v-menu
    offset-y
    :close-on-content-click="false"
    :nudge-width="400"
    bottom
    v-model="showOpenDialog"
    >



      <v-card>
        <v-card-title class="headline">Open variants file</v-card-title>
        <v-card-text class="variant-file-body">
          <div id="open-variant-file" >
            <v-radio-group hide-details v-model="fileType" >
                  <v-radio label="gene.iobio (comma separated)" value="gene"></v-radio>
                  <v-radio label="gemini (tab delimited)" value="gemini"></v-radio>
                  <v-radio label="Tab delimited" value="tsv"></v-radio>
            </v-radio-group>





            <div style="margin-top:10px;margin-bottom:20px">


              <file-chooser
                v-if="fileType == 'gene'"
                title="Choose .csv file"
                :isMultiple="false" :accept="`.csv`"
                showLabel="true"
                @file-selected="onFileSelected">
              </file-chooser>

              <file-chooser
                v-if="fileType != 'gene'"
                title="Choose .txt file"
                :isMultiple="false"
                :accept="`.txt, .tsv`"
                showLabel="true"
                @file-selected="onFileSelected">
              </file-chooser>

              <div style="text-align:center;margin-top:10px"
              v-if="importInProgress" >
                <img style="width:22px;height:22px"
                     class="loader  glyph" src="../../../assets/images/wheel.gif"/>
                Loading variants...
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn raised class="variant-file-button" @click.native="showOpenDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>





    <v-menu
    offset-y
    :close-on-content-click="false"
    :nudge-width="400"
    bottom
    v-model="showSaveDialog"
    >

      <v-card>
        <v-card-title class="headline">
         Save variants file
        </v-card-title>
        <v-card-text class="variant-file-body">
          <div id="save-format" >
            <v-radio-group hide-details v-model="exportFormat" >
                  <v-radio label="Comma separated" value="csv"></v-radio>
                  <v-radio label="VCF" value="vcf"></v-radio>
            </v-radio-group>

          </div>
          <div style="text-align:center;margin-top:10px"
            v-if="exportInProgress" >
              <img style="width:22px;height:22px"
                   class="loader  glyph" src="../../../assets/images/wheel.gif"/>
              Saving variants to file...
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            v-if="!readyToDownload"
            class="variant-file-button" raised @click="onSaveFile">
            <v-icon>save</v-icon>
            Save
          </v-btn>
          <a id="download-file"
          v-bind:class="(!readyToDownload ? 'hide' : '') + ' btn variant-file-button'"
          download="gene-iobio-variants.csv" href="#">
            <i class="material-icons" style="padding-right:0px;font-size:20px">file_download</i>
            <span style="padding-right:8px">Download file</span>
          </a>
          <v-btn class="variant-file-button" raised @click="showSaveDialog = false;readyToDownload = false;">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>

  </v-card>
</template>


<script>


import FileChooser from '../partials/FileChooser.vue'
import AppIcon from '../partials/AppIcon.vue'
import FilterIcon from '../partials/FilterIcon.vue'


export default {
  name: 'flagged-variants-card',
  components: {
    FileChooser,
    AppIcon,
    FilterIcon
  },
  props: {
    isEduMode: null,
    isBasicMode: null,
    flaggedVariants: null,
    cohortModel: null,
    launchedFromClin: null
  },
  data() {
    return {
      showOpenDialog: false,
      showSaveDialog: false,
      exportFormat: 'csv',
      fileType: 'gene',
      readyToDownload: false,
      importInProgress: false,
      exportInProgress: false,
      geneLists: null
    }
  },
  methods: {
    onVariantSelected: function(variant) {
      this.$emit("flagged-variant-selected", variant);
    },
    onFileSelected: function(fileSelection) {
      let self = this;
      self.importInProgress = true;
      self.cohortModel.onFlaggedVariantsFileSelected(fileSelection, self.fileType,
      function() {
        self.importInProgress = false;
        self.$emit("flagged-variants-imported");
        self.showOpenDialog = false;
      });
    },
    onClickSave: function() {
      let self = this;
      if (self.launchedFromClin) {
        self.sendVariantsToClin();
      } else {
        self.showSaveDialog = true;
      }
    },
    sendVariantsToClin: function() {
      let self = this;
      self.$emit('send-flagged-variants-to-clin');
    },
    onSaveFile: function() {
      let self = this;
      self.exportInProgress = true;
      this.cohortModel.promiseExportFlaggedVariants(self.exportFormat)
      .then(function(output) {
        self.exportInProgress = false;
        self.globalApp.utility.createDownloadLink("#download-file",
          output,
          "gene-iobio-flagged-variants." + self.exportFormat );
        self.readyToDownload = true;
      })
    },
    clearFileInputs: function() {

      this.clearFileInput($("#input-csv-file")[0]);
      this.clearFileInput($("input-txt-file")[0]);
    },
    clearFileInput: function(ctrl) {
      try {
        ctrl.value = null;
      } catch(ex) { }
    },
    populateGeneLists: function() {
      let self = this;
      self.geneLists = [];

      var filters = self.cohortModel.organizeVariantsByFilterAndGene();
      self.geneLists = filters.map(function(filterObject) {
        return {
          name:  filterObject.key,
          label: filterObject.filter.title,
          show:  filterObject.genes.length > 0,
          genes: filterObject.genes
        }
      })
    },



    coord: function(flaggedGene, variant) {
      return this.globalApp.utility.stripRefName(flaggedGene.gene.chr) + ":" + variant.start + " " + variant.ref + ">" + variant.alt;
    },

    clinvar: function(variant) {
      if (variant.isProxy) {
        if (variant.clinvarClinSig === "pathogenic") {
          return "clinvar_path";
        } else if (variant.clinvarClinSig === "likely pathogenic") {
          return "clinvar_lpath";
        } else {
          return "";
        }
      } else {
        return variant.clinvar;
      }
    },
    rsId: function(variant) {
      if (variant.isProxy) {
        return variant.rsId;
      } else {
        return this.globalApp.utility.getRsId(variant);
      }
    },
    hgvsP: function(variant) {
      if (variant.isProxy) {
        return this.globalApp.utility.formatHgvsP(variant, variant.HGVSp);
      } else {
        return variant.extraAnnot ? this.globalApp.utility.formatHgvsP(variant, variant.vepHGVSp) : "";
      }
    },
    hgvsC: function(variant) {
      if (variant.isProxy) {
        return this.globalApp.utility.formatHgvsC(variant, variant.HGVSc, false);
      } else {
        return variant.extraAnnot ? this.globalApp.utility.formatHgvsC(variant, variant.vepHGVSc, false) : "";
      }
    },
    vepConsequence: function(variant) {
      if (variant.isProxy) {
        return variant.consequence;
      } else {
        return variant.vepConsequence ? Object.keys(variant.vepConsequence).join(" ").split("_").join(" ") : "";
      }
    },
    highestImpactClass: function(variant) {
      let clazz = "filter-symbol";
      if (variant.isProxy) {
        clazz += " impact_" + (variant.impact && variant.impact.length > 0 ? variant.impact.toUpperCase() : 'none');
      } else {
        for (var impact in variant.highestImpactVep) {
          if (clazz.length > 0) {
            clazz += " ";
          }
          clazz += "impact_" + impact.toUpperCase();
        }
      }
      return clazz;
    },
    afDisplay: function(variant) {
      var label = this.isBasicMode ? "freq " : "af ";
      if (variant.isProxy) {
        return  label +  this.globalApp.utility.percentage(variant.afgnomAD ? variant.afgnomAD : 0);
      } else {
        return  label +  this.globalApp.utility.percentage(variant.afHighest ? variant.afHighest : 0);
      }
    },
    zygosity: function(variant) {
      if (variant.isProxy) {
        return variant.zygosityProband.toUpperCase();
      } else {
        return variant.zygosity.toUpperCase();
      }
    }
  },
  mounted: function() {

  },
  computed: {

  },
  watch: {
    flaggedVariants: function() {
      let self = this;
      self.populateGeneLists();
    }
  }
}

</script>