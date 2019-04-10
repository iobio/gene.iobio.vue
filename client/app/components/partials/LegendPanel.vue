<style lang="sass">
@import ../../../assets/sass/variables

#legend
  margin-left: 10px
  margin-right: 10px
  margin-top: 5px
  margin-bottom: 0px

#legend-tooltip.tooltip
  font-size: 11px

#legend-placeholder.level-basic
  display: block !important

#legend.level-basic
  display: block !important
  margin-top: 40px
  margin-bottom: 40px


.legend-help-link
  font-size: 12px
  display: inline-block
  vertical-align: top

.legend-help
  font-size: 11px

.legend-symbol
  stroke: #000 !important
  stroke-width: 1.5px !important
  stroke-opacity: 0.3 !important

#close-legend
  float: right
  font-size: 15px
  color: $text-color !important

#show-legend
  color: $text-color !important
  font-size: 13px
  margin-left: 80px
  float: left


#close-legend
  float: right
  color: $text-color
  font-size: 18px

#legend
  .legend-element
    cursor: auto
    padding: 1px

    text
      cursor: auto
      fill:  $text-color
      font-size: 12px

  .somatic-variant
    font-size: 15px
    color: $somatic-variant-color
    vertical-align: top

  .legend-text
    color:  $text-color
    font-size: 12px
    cursor: auto
    vertical-align: top


  .legend-label
    font-size: 13px
    color: $text-color
    margin-bottom: 5px
    cursor: auto
    line-height: 15px


#legend

  .legend-symbol.exon
    cursor: pointer
    fill: rgba(93, 128, 157, 0.63)
    stroke: rgb(93, 128, 157)

  .exon-symbol
    text
      font-size: 14px
      fill: $text-color


.legend-wrap-text
  display: inline-block !important
  line-height: 12px !important

.clinvar-legend
  .legend-text
    padding-top: 2px
    display: inline-block

</style>

<template>
  <div id="legend" >



    <div :style="isBasicMode ? 'margin-bottom:5px;' : 'margin-bottom:20px'">
    Legend
    </div>
    <div style="display:flex;flex-wrap:wrap;justify-content:flex-start">


      <div v-if="isBasicMode" style="text-align:left;margin-right:10px">
        <div class="legend-label" style="width:130px">Exon (coding region)</div>
        <svg id="exon" class="exon-symbol legend-element pl-4" width="130" height="30">
          <rect class="legend-symbol exon" rx="1" ry="1" x="25" width="9" y="4" height="24">
          </rect>
          <line x1="0" x2="60" y1="17" y2="17" style="stroke: #b0b0b0;stroke-width: 1.5px;"></line>
        </svg>
      </div>

      <div style="text-align:left;width:80px;margin-right:10px;margin-bottom:15px">
        <div v-if="!isBasicMode" class="legend-label">Impact</div>
        <div v-if="isBasicMode" class="legend-label">Predicted Impact</div>


        <legend-icon
         icon="impact"
         type="snp"
         clazz="impact_HIGH"
         width="14"
         height="14"
         label="High">
        </legend-icon>
        <legend-icon
         icon="impact"
         type="snp"
         clazz="impact_MODERATE"
         width="14"
         height="14"
         label="Moderate">
        </legend-icon>
        <legend-icon
         icon="impact"
         type="snp"
         clazz="impact_MODIFIER"
         width="14"
         height="14"
         label="Modifier">
        </legend-icon>
        <legend-icon
         icon="impact"
         type="snp"
         clazz="impact_LOW"
         width="14"
         height="14"
         label="Low">
        </legend-icon>

      </div>
      <!--<div v-if="!isBasicMode" style="text-align:left;width:150px;margin-right:10px;margin-bottom:15px">-->
        <!--<div class="legend-label" style="width:130px">Inheritance</div>-->

        <!--<legend-icon-->
         <!--icon="autosomal dominant"-->
         <!--width="16"-->
         <!--height="16"-->
         <!--label="Autosomal dominant">-->
        <!--</legend-icon>-->
        <!--<legend-icon-->
         <!--icon="denovo"-->
         <!--width="16"-->
         <!--height="16"-->
         <!--label="De novo">-->
        <!--</legend-icon>-->
        <!--<legend-icon-->
         <!--icon="recessive"-->
         <!--width="16"-->
         <!--height="16"-->
         <!--label="Recessive">-->
        <!--</legend-icon>-->
        <!--<legend-icon-->
         <!--icon="x-linked"-->
         <!--width="16"-->
         <!--height="16"-->
         <!--label="X-linked">-->
        <!--</legend-icon>-->
        <!--<legend-icon-->
         <!--icon="compound-het"-->
         <!--width="16"-->
         <!--height="16"-->
         <!--label="Compound het">-->
        <!--</legend-icon>-->
     <!--</div>-->



      <div class="clinvar-legend" style="width:140px;margin-right:10px;margin-bottom:15px">
          <div class="legend-label">Clinvar</div>

          <legend-icon
          icon="clinvar"
          width="12"
          height="12"
          level="high"
          label="Pathogenic">
          </legend-icon>

          <legend-icon
          icon="clinvar"
          width="12"
          height="12"
          level="likely-high"
          label="Likely pathogenic">
          </legend-icon>

          <legend-icon v-if="!isBasicMode"
          icon="clinvar"
          width="12"
          height="12"
          level="unknown-significance"
          label="Unknown significance">
          </legend-icon>

          <legend-icon v-if="!isBasicMode"
          icon="clinvar"
          width="12"
          height="12"
          level="conflicting"
          label="Conflicting data">
          </legend-icon>

          <legend-icon v-if="!isBasicMode"
          icon="clinvar"
          width="12"
          height="12"
          level="other"
          label="Other">
          </legend-icon>

          <legend-icon v-if="!isBasicMode"
          icon="clinvar"
          width="12"
          height="12"
          level="low"
          label="Benign">
          </legend-icon>

          <legend-icon v-if="!isBasicMode"
          icon="clinvar"
          width="12"
          height="12"
          level="likely-low"
          label="Likely benign">
          </legend-icon>
      </div>

      <div style="text-align:left;width:80px;margin-right:10px;margin-bottom:15px">
          <div class="legend-label">Variant type</div>

        <legend-icon
         icon="impact"
         type="snp"
         level="none"
         width="14"
         height="14"
         label="SNP">
        </legend-icon>

        <legend-icon
         icon="impact"
         type="del"
         level="none"
         width="16"
         height="16"
         label="Deletion">
        </legend-icon>

        <legend-icon
         icon="impact"
         type="ins"
         level="none"
         width="16"
         height="16"
         label="Insertion">
        </legend-icon>

        <legend-icon
         icon="impact"
         type="complex"
         level="none"
         width="18"
         height="18"
         label="Complex">
        </legend-icon>

      </div>

      <!--<div v-if="!isBasicMode" style="width:70px;margin-right:10px;margin-bottom:15px">-->
        <!--<div class="legend-label">Allele Frequency</div>-->
        <!--<legend-icon-->
          <!--icon="af"-->
          <!--width="12"-->
          <!--height="12"-->
          <!--level="high"-->
          <!--label="< 5%">-->
        <!--</legend-icon>-->
      <!--</div>-->

      <div v-if="!isBasicMode" style="width:120px;margin-right:10px;">
        <div class="legend-label">Somatic variants</div>
        <legend-icon
          icon="somatic-variant"
          label="Variants not found in any normal sample"
          wrapLabel="true">
        </legend-icon>
      </div>

      <div v-if="!isBasicMode" style="width:80px;margin-right:0px;">
          <div class="legend-label">Coverage</div>
          <legend-icon
            icon="coverage"
            width="13"
            height="13"
            level="high"
            wrapLabel="true"
            label="Insufficient coverage in exons">
          </legend-icon>
      </div>




     <div v-if="!isBasicMode" style="width:170px;margin-right:10px;margin-bottom:15px">
       <div class="legend-label">Flagged</div>
        <legend-icon
         icon="system-flagged"
         width="16"
         height="16"
         label="Variant passes a filter">
        </legend-icon>
        <legend-icon
         icon="user-flagged"
         width="16"
         height="16"
         label="Flagged by User">
        </legend-icon>
      </div>




      <div v-if="!isBasicMode" style="width:170px;margin-right:10px;margin-bottom:10px">
        <div class="legend-label">Zygosity</div>

        <legend-icon
         icon="zygosity"
         type="het"
         height="14" width="24"
         iconStyle="margin-top:-2px"
         label="Heterozygous alternate">
        </legend-icon>


        <legend-icon
         icon="zygosity"
         type="hom"
         height="14" width="24"
         iconStyle="margin-top:-2px"
         label="Homozygous alternate">
        </legend-icon>
      </div>

     <!--<div v-if="!isBasicMode" style="width:150px;margin-right:10px;margin-bottom:15px">-->
       <!--<div class="legend-label">Affected Siblings</div>-->
        <!--<legend-icon id="thumbs-green-symbol"-->
         <!--icon="thumbs-up"-->
         <!--width="14"-->
         <!--height="14"-->
         <!--wrapWidth="130"-->
         <!--wrapLabel="true"-->
         <!--label="All affected sibs have variant">-->
        <!--</legend-icon>-->
        <!--<legend-icon-->
         <!--icon="thumbs-down"-->
         <!--width="14"-->
         <!--height="14"-->
         <!--wrapLabel="true"-->
         <!--wrapWidth="130"-->
         <!--label="None of affected sibs have variant">-->
        <!--</legend-icon>-->
        <!--<legend-icon-->
         <!--icon="question-mark"-->
         <!--width="14"-->
         <!--height="14"-->
         <!--wrapWidth="130"-->
         <!--wrapLabel="true"-->
         <!--label="Only some affected sibs have variant">-->
        <!--</legend-icon>-->
      <!--</div>-->


     <!--<div v-if="!isBasicMode" style="width:150px;margin-right:10px;margin-bottom:15px">-->
       <!--<div class="legend-label">Unaffected Siblings</div>-->
        <!--<legend-icon id="thumbs-green-symbol"-->
         <!--icon="thumbs-up"-->
         <!--width="14"-->
         <!--height="14"-->
         <!--wrapWidth="130"-->
         <!--wrapLabel="true"-->
         <!--label="None of unaffected sibs have variant">-->
        <!--</legend-icon>-->
        <!--<legend-icon-->
         <!--icon="thumbs-down"-->
         <!--width="14"-->
         <!--height="14"-->
         <!--wrapWidth="130"-->
         <!--wrapLabel="true"-->
         <!--label="All unaffected sibs have variant">-->
        <!--</legend-icon>-->
        <!--<legend-icon-->
         <!--icon="question-mark"-->
         <!--width="14"-->
         <!--height="14"-->
         <!--wrapWidth="130"-->
         <!--wrapLabel="true"-->
         <!--label="Some unaffected sibs have variant">-->
        <!--</legend-icon>-->
      <!--</div>-->

      <div v-if="!isBasicMode" v-show="false" style="width:150px;margin-right:10px;margin-bottom:10px">
        <div class="legend-label">PolyPhen</div>

          <legend-icon
            icon="polyphen"
            width="12"
            height="12"
            level="high"
            label="Probably damaging">
          </legend-icon>


          <legend-icon
            icon="polyphen"
            width="12"
            height="12"
            level="likely-high"
            label="Possibly damaging">
          </legend-icon>

          <legend-icon
            icon="polyphen"
            width="12"
            height="12"
            level="low"
            label="Benign">
          </legend-icon>
      </div>

      <div v-if="!isBasicMode" v-show="false" style="width:180px;margin-right:10px;margin-bottom:10px">
        <div class="legend-label">SIFT</div>


          <legend-icon
            icon="sift"
            width="12"
            height="12"
            level="high"
            label="Deleterious">
          </legend-icon>

          <legend-icon
            icon="sift"
            width="12"
            height="12"
            level="likely-high"
            label="Deleterious (low confidence)">
          </legend-icon>

          <legend-icon
            icon="sift"
            width="12"
            height="12"
            level="low"
            label="Tolerated">
          </legend-icon>

          <legend-icon
            icon="sift"
            width="12"
            height="12"
            level="medium"
            label="Tolerated (low confidence)">
          </legend-icon>
      </div>




    </div>


  </div>
</template>

<script>

import LegendIcon from "../partials/LegendIcon.vue"
import AppIcon from "../partials/AppIcon.vue"

export default {
  name: 'legend-panel',
  components: {
    AppIcon,
    LegendIcon
  },
  props: {
    isBasicMode: null
  },
  data () {
      return {
      }
  },
  watch: {
  },
  methods: {
  },
  mounted: function() {
  }
}

</script>