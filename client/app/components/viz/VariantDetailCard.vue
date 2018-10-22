<style lang="sass" >
@import ../../../assets/sass/variables
#variant-detail
  padding-left: 0px
  max-height: 182px
  padding-top: 0px
  overflow-x: scroll
  min-width: 700px


  .layout.row
    margin-bottom: 5px

  .layout.row.no-bottom-margin
    margin-bottom: 0px

  .field-label.last-col
    padding-left: 16px
    min-width: 80px

  .field-label.revel
    color: $app-color
    font-weight: bold

  .field-value.revel
    color: $app-color
    font-weight: bold

  #user-flag-buttons
    position: absolute
    bottom: 0px
    right: 0px
    margin-bottom: 0px

  .scroll-button
    color: $link-color !important
    height: 24px
    padding: 0px
    width: 100px

    .btn__content
      color: $link-color !important
      padding: 0px


    .material-icons
      font-size: 17px

  a
    color:  $link-color !important

  .flag-button
    padding: 0px
    margin-bottom: 3px
    margin-left: 2px
    height: 24px

    .material-icons
      font-size: 17px
      color: $link-color !important

  .content
    font-size: 12px
    padding-left: 10px
    margin-bottom: 10px
    float: left
    max-width: 350px
    min-width: 350px

  .field-label
    color: #9c9a9a
    font-style: italic
    padding-left: 6px
    text-align: left
    font-size: 12px
    line-height: 13px

  .field-value
    padding-right: 35px
    word-break: break-word
    font-size: 12px
    line-height: 13px

  #inheritance
    height: 18px

  #coverage-svg
    float: left

    rect
      &.alt-count
        stroke: black !important

      &.ref-count
        stroke: black !important
        fill: none !important

      &.alt-count
        fill: $app-color-light !important

      &.other-count
        stroke: black !important
        fill: rgb(132,132,132) !important

    text
      font-size: 12px !important

      &.alt-count
        fill: white !important

      &.alt-count-under
        fill: $text-color !important

      &.other-count
        fill: white  !important
        font-style: italic !important

      &.other-count-under
        fill: $text-color  !important
        font-style: italic !important

      &.ref-count
        fill: $text-color  !important

    .header-small
      overflow-wrap: break-word
      text-align: left
      width: 85px
      float: left
      color: $tooltip-label-color
      fill:  $tooltip-label-color

    .allele-count-bar
      text
        font-size: 11px !important
        fill:  $text-color

    #allele-count-legend
      padding-top: 0px


    .affected-symbol
      font-size: 14px
      color: $danger-color !important
      float: right
      padding-right: 2px


    .allele-count-bar
      overflow-wrap: break-word
      float: left
      width: 120px
      min-height: 25px

    .ped-info
      width: 270px
      clear: both
      line-height: 13px !important

    .ped-label
      padding-top: 0px
      vertical-align: top
      text-align: left
      width: 69px
      float: left
      font-size: 12px
      color: $text-color

    .ped-zygosity
      width: 75px
      float: left

    .zygosity
      float: left
      font-size: 9px
      font-weight: bold !important
      padding-top: 1px !important
      padding-bottom: 0px !important
      padding-right: 0px !important
      padding-left: 0px !important
      background-color: #D3D5D8 !important
      margin-right: 2px
      margin-top: 0px !important
      width: 39px !important
      color: black
      border: solid thin rgba(0, 0, 0, 0.22)
      cursor: none
      pointer-events: none

    .zygosity
      &.hom
        background-color: $hom-color !important
        color: white
        width: 29px !important
        margin-right: 10px

      &.het
        background-color: $het-color !important
        color: white
        width: 29px !important
        margin-right: 10px


      &.homref
        background-color: $homref-color !important
        color: $text-color !important

      &.unknown
        background-color: $info-color !important

      &.none
        background-color: transparent !important
        border: solid thin $info-color !important



</style>


<template>

  <div v-if="selectedVariant && info" tile id="variant-detail" class="app-card">
    <div style="width:100%;">
      <span style="display:inline-block" v-if="showTitle ">Variant</span>
    </div>

      <div  v-if="selectedVariant && !isEduMode" class="mt-1 text-xs-center" style="padding-bottom: 4px;">
        <span class="pr-1"v-if="!isBasicMode">
          <app-icon v-show="selectedVariantRelationship == 'known-variants'"
            :icon="selectedVariantRelationship == 'known-variants' ? 'clinvar' : ''"
            :significance="selectedVariant.clinvar" width="16" height="16">
          </app-icon>
          {{ selectedVariantRelationship | showRelationship }}
        </span>
        <span class="pl-1">{{ selectedGene.gene_name }}</span>
        <span class="pl-1">{{ selectedVariant.type ? selectedVariant.type.toUpperCase() : "" }}</span>
        <span class="pl-1 refalt">{{ refAlt  }}</span>
        <span class="pl-1">{{ info.HGVSpAbbrev }}</span>
        <span class="pl-3">{{ info.coord }}</span>
        <span class="pl-1" v-if="!isBasicMode">{{ info.exon }}</span>
        <span class="pl-3" v-if="info.dbSnpLink && !isBasicMode" v-html="info.dbSnpLink"></span>
      </div>

      <div id="user-flag-buttons" v-if="selectedVariant && !isEduMode && !isBasicMode && selectedVariantRelationship != 'known-variants'" >
        <v-btn class="flag-button" small raised
        v-if="!selectedVariant.isUserFlagged && !selectedVariant.isFlagged"
        @click="setUserFlag">
          <app-icon icon="user-flagged"></app-icon>
          Flag variant
        </v-btn>

        <v-btn class="flag-button" small raised
        v-if="selectedVariant.isUserFlagged"
        @click="removeUserFlag">
          <v-icon>outlined_flag</v-icon>
          Remove flag
        </v-btn>
      </div>


    <div v-if="isBasicMode" style="margin-left: 10px;float:left;min-width:220px;">

        <v-flex v-if="isBasicMode">
          <v-layout  row>
             <v-flex xs5 class="field-label">Transcript</v-flex>
             <v-flex xs7 class="field-value">{{ formatCanonicalTranscript() }}</v-flex>
          </v-layout>
        </v-flex>

        <v-flex v-if="isBasicMode">
          <v-layout  row>
             <v-flex xs5 class="field-label">cDNA</v-flex>
             <v-flex xs7 class="field-value">{{ info.HGVScAbbrev }}</v-flex>
          </v-layout>
        </v-flex>

        <v-flex v-if="isBasicMode">
          <v-layout  row>
             <v-flex xs5 class="field-label">Protein</v-flex>
             <v-flex xs7 class="field-value">{{ info.HGVSpAbbrev }}</v-flex>
          </v-layout>
        </v-flex>

        <v-flex v-if="isBasicMode">
          <v-layout  row>
             <v-flex xs5 class="field-label">Chr</v-flex>
             <v-flex xs7 class="field-value">{{ selectedVariant.chrom }}</v-flex>
          </v-layout>
        </v-flex>

        <v-flex v-if="isBasicMode">
          <v-layout  row>
             <v-flex xs5 class="field-label">Position</v-flex>
             <v-flex xs7 class="field-value">{{ selectedVariant.start }}</v-flex>
          </v-layout>
        </v-flex>

        <v-flex v-if="isBasicMode">
          <v-layout  row>
             <v-flex xs5 class="field-label">Reference</v-flex>
             <v-flex xs7 class="field-value">{{ selectedVariant.ref }}</v-flex>
          </v-layout>
        </v-flex>

        <v-flex v-if="isBasicMode">
          <v-layout  row>
             <v-flex xs5 class="field-label">Alternate</v-flex>
             <v-flex xs7 class="field-value">{{ selectedVariant.alt }}</v-flex>
          </v-layout>
        </v-flex>



    </div>


    <div style="float:left;width:33%;min-width:340px">


      <v-layout  v-if="selectedVariant && !isEduMode" class="content" column nowrap>


        <v-flex v-if="!isBasicMode && selectedVariant.inheritance != '' && selectedVariant.inheritance != 'none' ">
          <v-layout row class="no-bottom-margin">
             <v-flex xs3 class="field-label">Inheritance</v-flex>
             <v-flex id="inheritance" xs9 class="field-value">
               <app-icon :icon="selectedVariant.inheritance" height="16" width="16">
               </app-icon>
               {{ selectedVariant.inheritance == 'denovo' ? 'de novo' : selectedVariant.inheritance }}
             </v-flex>
          </v-layout>
        </v-flex>
        <v-flex>
          <v-layout row>
             <v-flex xs3 v-if="!isBasicMode" class="field-label">Impact</v-flex>
             <v-flex xs9 v-if="!isBasicMode"  class="field-value">{{ info.vepImpact }} - {{ info.vepConsequence }}</v-flex>

             <v-flex xs4 v-if="isBasicMode" class="field-label">Predicted Impact</v-flex>
             <v-flex xs8 v-if="isBasicMode" class="field-value">{{ info.vepImpact }}</v-flex>
          </v-layout>
        </v-flex>
        <v-flex v-if="info.vepHighestImpact != '' && !isBasicMode">
          <v-layout row >
             <v-flex xs3 class="field-label">Most severe impact</v-flex>
             <v-flex xs9 class="field-value">
                <span v-for="(impactRec, idx) in info.vepHighestImpactRecs" :key="impactRec.impact">
                 {{ getNonCanonicalImpactDisplay(idx, impactRec) }}
                  <span v-for="(effectRec, idx1) in impactRec.effects" :key="effectRec.key">
                    {{ getNonCanonicalEffectDisplay(idx1, effectRec) }}
                    <a v-for="transcriptId in effectRec.transcripts"
                     :key="transcriptId"
                     href="javascript:void(0)"
                     @click="selectTranscript(transcriptId)">
                      {{ transcriptId }}
                    </a>
                  </span>
                </span>

             </v-flex>
          </v-layout>
        </v-flex>
        <v-flex >
          <v-layout row :class="{'no-bottom-margin': info.phenotype != ''}" v-if="info.clinvarLink != ''">
             <v-flex xs3 v-if="!isBasicMode" class="field-label">Clinvar</v-flex>
             <v-flex xs9 v-if="!isBasicMode" class="field-value" v-html="info.clinvarLink"></v-flex>

             <v-flex xs4 v-if="isBasicMode" class="field-label">Clinvar</v-flex>
             <v-flex xs8 v-if="isBasicMode"class="field-value" v-html="info.clinvarLink"></v-flex>
          </v-layout>
        </v-flex>
        <v-flex >
          <v-layout row  v-if="info.phenotype != ''">
             <v-flex xs3 v-if="!isBasicMode" class="field-label"></v-flex>
             <v-flex xs9 v-if="!isBasicMode" class="field-value">{{ info.phenotype }}</v-flex>

             <v-flex xs4 v-if="isBasicMode" class="field-label"></v-flex>
             <v-flex xs8 v-if="isBasicMode" class="field-value">{{ info.phenotype }}</v-flex>
          </v-layout>
        </v-flex>
        <v-flex  v-if="info.revel != '' && info.revel != null && !isBasicMode" >
          <v-layout row class="no-bottom-margin">
             <v-flex xs3 class="field-label revel">REVEL</v-flex>
             <v-flex xs9 class="field-value revel">{{ info.revel }}</v-flex>
          </v-layout>
        </v-flex>
        <v-flex   v-if="info.polyphen != '' && !isBasicMode">
          <v-layout row class="no-bottom-margin" >
             <v-flex xs3 class="field-label">Polyphen</v-flex>
             <v-flex xs9 class="field-value">{{ info.polyphen }}</v-flex>
          </v-layout>
        </v-flex>
        <v-flex  v-if="info.sift != '' && !isBasicMode" >
          <v-layout row class="">
             <v-flex xs3 class="field-label">SIFT</v-flex>
             <v-flex xs9 class="field-value">{{ info.sift }}</v-flex>
          </v-layout>
        </v-flex>
        <v-flex  v-if="info.regulatory != '' & !isBasicMode">
          <v-layout row>
             <v-flex xs3 class="field-label">Regulatory</v-flex>
             <v-flex xs9  v-html="info.regulatory" class="field-value"></v-flex>
          </v-layout>
        </v-flex>



        <v-flex  v-if="!isBasicMode">
          <v-layout  row>
             <v-flex xs3 class="field-label">gnomAD</v-flex>
             <v-flex xs9 class="field-value" v-html="afGnomAD"></v-flex>
          </v-layout>
        </v-flex>

        <v-flex   v-if="genomeBuildHelper.getCurrentBuildName() != 'GRCh37' && !isBasicMode" xs6>
          <v-layout row>
             <v-flex xs3 class="field-label">ExAC</v-flex>
             <v-flex xs9 class="field-value" v-html="afExAC"></v-flex>
          </v-layout>
        </v-flex>


        <v-flex v-if="!isBasicMode">
          <v-layout  row>
             <v-flex xs3 class="field-label">1000G</v-flex>
             <v-flex xs9 class="field-value" v-html="af1000G"></v-flex>
          </v-layout>
        </v-flex>







      </v-layout>
    </div>

    <div style="float:left;width:33%;"
      v-if="selectedVariant && selectedVariant.genericAnnots && selectedVariant.genericAnnots.AVIA3">
      <span style="text-align:center;font-size:12px">AVIA3 Annotations</span>
      <v-layout row nowrap
       v-for="(annotValue, annotName) in selectedVariant.genericAnnots.AVIA3"
       :key="annotName">
           <v-flex xs5 class="field-label">{{ annotName }}</v-flex>
           <v-flex xs7 class="field-value">{{ annotValue }}</v-flex>
      </v-layout>
    </div>






    <div id="coverage-svg" v-if="selectedVariant" style="float:left;width:33%;min-width:300px" v-bind:class="{hide: isEduMode || isBasicMode }">

        <v-flex  v-if="!isBasicMode">
          <v-layout row class="no-bottom-margin">
             <v-flex xs3 class="field-label last-col" >Transcript</v-flex>
             <v-flex xs9 class="field-value">{{ selectedVariant.transcript ? selectedVariant.transcript.transcript_id : selectedTranscript.transcript_id }}</v-flex>
          </v-layout>
        </v-flex>

        <v-flex  v-if="!isBasicMode">
          <v-layout row class="no-bottom-margin">
             <v-flex xs3 class="field-label last-col"  >HGVSc </v-flex>
             <v-flex xs9 class="field-value">{{ info.HGVSc }}</v-flex>
          </v-layout>
        </v-flex>
        <v-flex   v-if="!isBasicMode">
          <v-layout row>
             <v-flex xs3 class="field-label last-col"  >HGVSp </v-flex>
             <v-flex xs9 class="field-value">{{ info.HGVSp }}</v-flex>
          </v-layout>
        </v-flex>






    </div>


    <div v-if="isBasicMode" style="float:left;width:33%;">

        <v-flex v-if="isBasicMode">
          <v-layout  row>
             <v-flex xs5 class="field-label  ">Frequency (1000G)</v-flex>
             <v-flex xs7 class="field-value">{{ info.af1000G }}</v-flex>
          </v-layout>
        </v-flex>

        <v-flex v-if="isBasicMode">
          <v-layout  row>
             <v-flex xs5 class="field-label ">Frequency (gnomAD)</v-flex>
             <v-flex xs7 class="field-value">{{ info.afgnomAD }}</v-flex>
          </v-layout>
        </v-flex>

    </div>



  </div>

</template>

<script>

import Vue from 'vue'
import AppIcon from "../partials/AppIcon.vue"

export default {
  name: 'variant-detail-card',
  components: {
    AppIcon
  },
  props: {
    isEduMode: null,
    isBasicMode: null,
    selectedGene: null,
    selectedTranscript: null,
    selectedVariant: null,
    selectedVariantRelationship: null,
    genomeBuildHelper: null,
    cohortModel: null,
    variantTooltip: null,
    info: null,
    showTitle: null
  },
  data() {
    return {
      WIDTH_ALLELE_COUNT_BAR: 120,
      WIDTH_ALLELE_COUNT_ROW: 270,
      AFFECTED_GLYPH: "<i class='material-icons affected-symbol'>spellcheck</i>"

    }
  },


  methods: {
    formatPopAF: function(afObject) {
      let self = this;
      var popAF = "";
      if (afObject['AF'] != ".") {
        for (var key in afObject) {
          if (key != "AF") {
            var label = key.split("_")[0];
            if (popAF.length > 0) {
              popAF += ", ";
            }
            popAF += label + " " + (afObject[key] == "." ? "0%" : self.globalApp.utility.percentage(afObject[key]));
          }
        }
      }
      return popAF;
    },
    refreshGlyphs: function() {
      if (this.selectedVariant) {
        this.createAlleleCountsSVG();

      }
    },
    createAlleleCountsSVG: function() {
      let self = this;
      self.$nextTick(function() {
        var selection = d3.select("#variant-detail #coverage-svg");
        selection.selectAll(".ped-info").remove();
        self.createAlleleCountSVGTrio(selection,
          self.selectedVariant,
          'proband',   // FIXME - This needs to be passed in from event that sends variant selected event
          self.cohortModel.affectedInfo,
          self.cohortModel.mode,
          self.cohortModel.maxAlleleCount,
          self.WIDTH_ALLELE_COUNT_BAR);

      });

    },
    selectTranscript: function(transcriptId) {
      this.$emit("transcript-id-selected", transcriptId);
    },
    getNonCanonicalImpactDisplay: function(idx, impactRec) {
      let buf = "";
      if (idx > 0) {
        buf += " | ";
      }
      buf += impactRec.impact.toLowerCase() + ' impact - ';
      return buf;
    },
    getNonCanonicalEffectDisplay: function(idx, effectRec) {
      let buf = "";
      if (idx > 0) {
        buf += " ,";
      }
      buf += effectRec.display + " in transcripts ";
      return buf;
    },



    formatCanonicalTranscript: function() {
      if (this.selectedTranscript) {
        return this.globalApp.utility.stripTranscriptPrefix(this.selectedTranscript.transcript_id);
      } else {
        return "";
      }
    },



    createAlleleCountSVGTrio: function(container, variant, id, affectedInfo, cohortMode, maxAlleleCount, barWidth) {
      var me = this;

      var firstTime = true;
      affectedInfo.forEach(function(info) {

        var affectedStatus = info.status;
        var sampleName     = info.model.getSelectedSample();
        var genotype       = variant.genotypes[sampleName];

        if (genotype == null || genotype.absent) {
          // If vcf doesn't have any genotypes, skip showing this

        } else {

          var selectedClazz  = (info.model.id === id ? 'selected' : '');

          var rel      = info.id;
          var row = container.append("div")
                             .attr("class", rel + "-alt-count ped-info");

              if (firstTime) {
                me._appendReadCountHeading(row);
                firstTime = false;
              }
          row.append("div")
               .attr("class", rel + "-alt-count header-small ")
               .html("<span class='ped-label "
                + selectedClazz + "'>"
                + " " + (rel == 'sibling' ? 'Sib' : me.globalApp.utility.capitalizeFirstLetter(rel))
                + " " + (rel == 'sibling' ? sampleName : '')
                + "</span>"
                + (affectedStatus == 'affected' ? me.AFFECTED_GLYPH : ''));

              var zyg = genotype ? (!genotype.hasOwnProperty('zygosity') || genotype.zygosity == null || genotype.zygosity === "gt_unknown" ? "unknown" : genotype.zygosity.toLowerCase()) : "none";
          row.append("div")
             .attr("class",  "zygosity label " + zyg)
             .text(me.globalApp.utility.capitalizeFirstLetter(zyg));


          var barContainer = row.append("div")
                                  .attr("class", rel + "-alt-count allele-count-bar");
          if (genotype) {
            me._appendAlleleCountSVG(barContainer,
              genotype.altCount,
              genotype.refCount,
              genotype.genotypeDepth,
              null,
              barWidth,
              maxAlleleCount);
          }
        }


      });


    },




    _appendReadCountHeading: function(container) {
      var me = this;
      var svg = container.append("div")
                 .attr("id", "allele-count-legend")
                   .append("svg")
                   .attr("width", me.WIDTH_ALLELE_COUNT_ROW)
                       .attr("height", "20");
      svg.append("text")
           .attr("x", "0")
           .attr("y", "14")
           .attr("anchor", "start")
           .attr("class", "header-small")
           .text("Read Counts");

      var g = svg.append("g")
                 .attr("transform", "translate(86,1)");

      g.append("text")
           .attr("x", "13")
           .attr("y", "9")
           .attr("class", "alt-count-under")
           .attr("anchor", "start")
           .text("alt");
      g.append("text")
           .attr("x", "37")
           .attr("y", "9")
           .attr("class", "other-count-under")
           .attr("anchor", "start")
           .text("other");
      g.append("text")
           .attr("x", "70")
           .attr("y", "9")
           .attr("class", "ref-count")
           .attr("anchor", "start")
           .text("ref");
      g.append("text")
           .attr("x", "90")
           .attr("y", "14")
           .attr("class", "ref-count")
           .attr("anchor", "start")
           .text("total");

      g.append("rect")
         .attr("x", "1")
         .attr("y", "10")
         .attr("height", 4)
         .attr("width",28)
         .attr("class", "alt-count");
      g.append("rect")
         .attr("x", "29")
         .attr("y", "10")
         .attr("height", 4)
         .attr("width",28)
         .attr("class", "other-count");
      g.append("rect")
         .attr("x", "57")
         .attr("y", "10")
         .attr("height", 4)
         .attr("width",28)
         .attr("class", "ref-count");

    },

    _appendAlleleCountSVG: function(container, genotypeAltCount,
      genotypeRefCount, genotypeDepth, bamDepth, barWidth, maxAlleleCount) {
      var me = this;

      var MAX_BAR_WIDTH = barWidth ? barWidth : me.ALLELE_COUNT_BAR_WIDTH;
      var PADDING = 20;
      var BAR_WIDTH = 0;
      if ((genotypeDepth == null || genotypeDepth == '') && (genotypeAltCount == null || genotypeAltCount.indexOf(",") >= 0)) {
        container.text("");
        var svg = container
                  .append("svg")
                  .attr("width", MAX_BAR_WIDTH + PADDING)
                  .attr("height", "21");
          return;
      }



      if (genotypeAltCount == null || genotypeAltCount.indexOf(",") >= 0) {
        BAR_WIDTH = d3.round(MAX_BAR_WIDTH * (genotypeDepth / maxAlleleCount));
        container.select("svg").remove();
        var svg = container
                  .append("svg")
                  .attr("width", MAX_BAR_WIDTH + PADDING)
                  .attr("height", "12");
        svg.append("rect")
           .attr("x", "1")
               .attr("y", "1")
             .attr("height", 10)
           .attr("width",BAR_WIDTH)
           .attr("class", "ref-count");

        svg.append("text")
           .attr("x", BAR_WIDTH + 5)
           .attr("y", "9")
           .text(genotypeDepth);

        var g = svg.append("g")
                   .attr("transform", "translate(0,0)");
        g.append("text")
            .attr("x", BAR_WIDTH / 2)
            .attr("y", "9")
            .attr("text-anchor", "middle")
            .attr("class", "ref-count")
            .text("?");
        return;
      }

      var totalCount = genotypeDepth;
      var otherCount = totalCount - (+genotypeRefCount + +genotypeAltCount);

      // proportion the widths of alt, other (for multi-allelic), and ref
      BAR_WIDTH      = d3.round((MAX_BAR_WIDTH) * (totalCount / maxAlleleCount));
      if (BAR_WIDTH < 10) {
        BAR_WIDTH = 10;
      }
      if (BAR_WIDTH > PADDING + 10) {
        BAR_WIDTH = BAR_WIDTH - PADDING;
      }
      var altPercent = +genotypeAltCount / totalCount;
      var altWidth   = d3.round(altPercent * BAR_WIDTH);
      var refPercent = +genotypeRefCount / totalCount;
      var refWidth   = d3.round(refPercent * BAR_WIDTH);
      var otherWidth = BAR_WIDTH - (altWidth+refWidth);

      // Force a separate line if the bar width is too narrow for count to fit inside or
      // this is a multi-allelic.
      var separateLineForLabel = (altWidth > 0 && altWidth / 2 < 11) || (refWidth > 0 && refWidth / 2 < 11) || (otherWidth > 0);

      container.select("svg").remove();
      var svg = container
                  .append("svg")
                  .attr("width", MAX_BAR_WIDTH + PADDING)
                  .attr("height", separateLineForLabel ? "21" : "12");

      if (altWidth > 0) {
        svg.append("rect")
         .attr("x", "1")
         .attr("y", "1")
         .attr("height", 10)
         .attr("width",altWidth)
         .attr("class", "alt-count");

      }

      if (otherWidth > 0) {
        svg.append("rect")
           .attr("x", altWidth)
           .attr("y", "1")
           .attr("height", 10)
           .attr("width", otherWidth)
           .attr("class", "other-count");
      }

      if (refWidth > 0) {
        svg.append("rect")
         .attr("x",  altWidth + otherWidth)
         .attr("y", "1")
         .attr("height", 10)
         .attr("width", refWidth)
         .attr("class", "ref-count");
      }



      svg.append("text")
         .attr("x", BAR_WIDTH + 5)
         .attr("y", "9")
         .text(totalCount);



      var altX = 0;
      var otherX = 0;
      var refX = 0;
      var g = svg.append("g")
                 .attr("transform", (separateLineForLabel ? "translate(-6,11)" : "translate(0,0)"));
      if (altWidth > 0) {
        var altX = d3.round(altWidth / 2);
        if (altX < 6) {
          altX = 6;
        }
         g.append("text")
           .attr("x", altX)
           .attr("y", "9")
           .attr("text-anchor", separateLineForLabel ? "start" : "middle")
           .attr("class", separateLineForLabel ? "alt-count-under" : "alt-count")
           .text(genotypeAltCount);

      }

      if (otherCount > 0) {
        otherX = altWidth  + d3.round(otherWidth / 2);
        // Nudge the multi-allelic "other" count over to the right if it is
        // too close to the alt count.
        if (otherX - 11 < altX) {
          otherX = altX + 10;
        }
        g.append("text")
           .attr("x", otherX)
           .attr("y", "9")
           .attr("text-anchor", separateLineForLabel ? "start" : "middle")
           .attr("class", separateLineForLabel ? "other-count-under" : "other-count")
           .text(otherCount);

        var gNextLine = g.append("g")
                         .attr("transform", "translate(-15,9)");
        svg.attr("height", 31);
        gNextLine.append("text")
                 .attr("x", otherX < 20 ? 20 : otherX)
             .attr("y", "9")
             .attr("text-anchor", "start")
             .attr("class", "other-count-under" )
             .text("(multi-allelic)");
      }
      if (genotypeRefCount > 0  && (altWidth > 0 || otherWidth > 0)) {
        refX = altWidth + otherWidth + d3.round(refWidth / 2);
        if (refX - 11 < otherX || refX - 11 < altX) {
          refX = refX + 10;
        }
        g.append("text")
             .attr("x", refX)
             .attr("y", "9")
             .attr("text-anchor", separateLineForLabel ? "start" : "middle")
             .attr("class", "ref-count")
             .text(genotypeRefCount);
      }

    },
    setUserFlag: function() {
      let self = this;
      self.selectedVariant.isUserFlagged = true;
      self.$emit('flag-variant', self.selectedVariant);
    },
    removeUserFlag: function() {
      let self = this;
      self.selectedVariant.isUserFlagged = false;
      self.$emit('remove-flagged-variant', self.selectedVariant);
    }
  },


  computed: {
    refAlt: function() {
      let self = this;
      var refAlt = "";
      if (self.selectedGene && self.selectedGene.strand && self.selectedVariant) {
        if (self.isEduMode) {
          if (self.selectedGene.strand == "-") {
            refAlt = self.globalApp.utility.switchGenotype(self.selectedVariant.eduGenotype)
          } else {
            refAlt = self.selectedVariant.eduGenotype;
          }
        } else {
          refAlt =   self.info.refalt;
        }
      }
      return refAlt;
    },
    afGnomAD: function(af) {
      if (this.selectedVariant.vepAf.gnomAD.AF == null) {
        return "unknown";
      } else if (this.selectedVariant.vepAf.gnomAD.AF == ".") {
        return "0%";
      } else if (this.isBasicMode) {
        return this.globalApp.utility.percentage(this.selectedVariant.vepAf.gnomAD.AF);
      } else  {
        var af = this.globalApp.utility.percentage(this.selectedVariant.vepAf.gnomAD.AF);
        var link = "<a target='_gnomad' href='http://gnomad.broadinstitute.org/variant/" + this.selectedVariant.chrom + "-" + this.selectedVariant.start + "-" + this.selectedVariant.ref + "-" + this.selectedVariant.alt + "'>" + af + "</a>";
        link += "&nbsp;&nbsp;" + this.formatPopAF(this.selectedVariant.vepAf.gnomAD);
        return link;
      }
    },
    af1000G: function(af) {
      if (this.selectedVariant.af1000G == null) {
        return "0%";
      } else  {
        var af = this.globalApp.utility.percentage(this.selectedVariant.af1000G);
        var popAF = this.formatPopAF(this.selectedVariant.vepAf['1000G']);
        return af + "&nbsp;&nbsp;" + popAF;
      }
    },
    afExAC: function() {
      return this.selectedVariant.afExAC ? this.globalApp.utility.percentage(this.selectedVariant.afExAC) : "";
    }
  },

  watch: {
    selectedVariant: function() {
      if (this.selectedVariant) {
        this.createAlleleCountsSVG();
      }

    }
  },

  filters: {
    showRelationship: function(buf) {
      if (buf == null) {
        return "";
      } else if (buf == 'known-variants') {
        return 'ClinVar';
      } else {
        // Capitalize first letter
        return buf.charAt(0).toUpperCase() + buf.slice(1);
      }
    }


  },

  updated: function() {
    //if (this.selectedVariant) {
    //  this.createAlleleCountsSVG();
    //}
  },

  mounted: function() {
  },

  created: function() {
  }


}
</script>


