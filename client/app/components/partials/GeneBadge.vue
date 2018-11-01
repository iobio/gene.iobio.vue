<style lang="sass">
@import ../../../assets/sass/variables


#gene-badge-button
  font-size: 13px
  padding: 3px 1px 1px 1px
  margin: 0px
  color: $text-color
  line-height: 15px
  border: thin solid #e8e6e6

  &.flagged
    border: 2px solid rgba(149, 149, 149, 0.65)

  #gene-badge-symbols
    height: 14px
    padding-left: 4px
    padding-top: 0px
    float: left
    padding-right: 2px


  .gene-badge-loader
    width: 14px
    height: 14px
    float: left
    padding-top: 1px
    display: none



#gene-badge
  margin-top: 0px
  margin-bottom: 8px
  margin-right: 10px
  height: 21px
  display: inline-block


  &.loaded
    #gene-badge-loaded
      display: inline

  &.called
    #gene-badge-called
      display: inline

  &.has-called-variants
    #gene-badge-has-called-variants
      display: inline

  &.is-flagged
    #gene-badge-bookmark
      display: none

  &.in-progress
    .gene-badge-loader
      display: inline


  &:hover #gene-badge-remove
    visibility: visible

  a
    color:  $text-color !important

    &:hover
      text-decoration: underline !important


#gene-badge.failed-filter
  opacity: .65

#gene-badge.loading
  border-left: #d8d8d8  solid 10px
  //height: 22px


#gene-badge.loading.selected
  border-left: $app-color solid 12px


#gene-badge.selected
  border-left:  $app-color solid 12px
  //height: 22px
  #gene-badge-button
    //box-shadow: 0 6px 10px rgba(0, 0, 0, 0.23), 0 10px 10px rgba(0, 0, 0, 0.19)

  #gene-badge-name, #gene-badge-danger-count, #gene-badge-remove i
    font-weight: bold

#gene-badge.phenolyzer
  #gene-badge-button
    border: solid 1px #9FC2D0

#gene-badge-loaded
  font-size: 14px
  color: $loaded-variant-color
  font-weight: bold
  float: left
  display: none

#gene-badge-called
  font-size: 14px
  font-weight: bold
  color: $called-variant-color-darker
  float: left
  display: none

#gene-badge-has-called-variants
  font-size: 14px
  color: $called-variant-color
  float: left
  display: none


#gene-badge-warning
  float: left
  font-size: 12px
  color: rgba(230, 126, 30, 0.84)
  padding-top: 0px
  padding-bottom: 1px
  padding-right: 2px
  display: none

#gene-badge-error
  float: left
  font-size: 12px
  color: rgba(204, 29, 7, 0.67)
  padding-top: 0px
  padding-right: 2px
  padding-left: 1px
  display: none

#gene-badge-coverage-problem
  font-size: 15px
  margin-top: -1px
  margin-left: 0px
  float: left
  color: $coverage-problem-color
  fill: $coverage-problem-color
  display: none

  &.dropdown-item
    display: inline-block
    margin-right: 3px
    margin-top: 1px

.coverage-problem-glyph
  fill: $coverage-problem-color



.impact-badge
  vertical-align: top

#gene-badge-remove
  i
    color: #E0292B !important
    font-weight: bold
    font-size: 13px

  visibility: hidden

</style>

<template>

<div id="gene-badge" v-bind:class="classObject" >

  <a id="gene-badge-button"
    href="javascript:void(0)"
    v-bind:class="gene.isFlagged ? 'flagged' : ''"
    style="display:inline-block" @click="selectGene"
    rel="tooltip"   data-html="true"
    data-placement="bottom">


        <img class="gene-badge-loader  glyph" src="../../../assets/images/wheel.gif">

        <i id="gene-badge-loaded" class="material-icons glyph">done</i>
        <i id="gene-badge-called" class="level-edu material-icons glyph">done</i>
        <i id="gene-badge-has-called-variants" class="level-edu material-icons glyph">check_circle</i>


        <i id="gene-badge-warning" class="material-icons glyph">warning</i>
        <i id="gene-badge-error" class="material-icons glyph">report_problem</i>


        <span id="gene-badge-name" style="float:left;margin-left:2px;margin-right:2px">
          {{ gene.name }}
        </span>





      <span id="gene-badge-symbols" class="glyph">

          <app-icon
           v-if="gene && gene.dangerSummary && gene.dangerSummary.badges.pathogenic.length > 0"
           icon="clinvar"
           level="high"
           id="gene-badge-clinvar"
           class=" level-edu glyph"
           width="13" height="14">
          </app-icon>

          <app-icon
           v-if="hasFilteredVariants('autosomalDominant')"
           icon="autosomal dominant"
           class=" level-edu glyph"
           width="15" height="15">
          </app-icon>


          <app-icon
           v-if="hasFilteredVariants('recessive')"
           icon="recessive"
           class=" level-edu glyph"
           width="15" height="15">
          </app-icon>

          <app-icon
           v-if="hasFilteredVariants('xlinked')"
           icon="xlinked"
           class=" level-edu glyph"
           width="15" height="15">
          </app-icon>


          <app-icon
           v-if="hasFilteredVariants('compoundHet')"
           icon="compound het"
           class=" level-edu glyph"
           width="15" height="15">
          </app-icon>



          <app-icon
           v-if="getImpactClass({'snp': true, 'mnp': true}) != null"
           icon="impact"
           type="snp"
           :clazz="getImpactClass({'snp': true, 'mnp': true})"
           width="15" height="15">
          </app-icon>


          <app-icon style="vertical-align:top"
           v-if="getImpactClass({'del': true}) != null"
           icon="impact"
           type="del"
           :clazz="getImpactClass({'del': true})"
           width="15" height="15">
          </app-icon>

          <app-icon style="vertical-align:top"
           v-if="getImpactClass({'ins': true}) != null"
           icon="impact"
           type="ins"
           :clazz="getImpactClass({'ins': true})"
           width="15" height="15">
          </app-icon>


          <app-icon style="vertical-align:top"
           v-if="getImpactClass({'complex': true}) != null"
           icon="impact"
           type="complex"
           :clazz="getImpactClass({'complex': true})"
            width="15" height="15">
          </app-icon>

          <app-icon style="vertical-align:top"
           v-if="hasCoverageProblem()"
           icon="coverage"
           class=" level-edu glyph"
           width="12" height="12">
          </app-icon>

      </span>





  </a>

  <div id="gene-badge-remove" href="javascript:void(0)"
    @click="removeGene"
    style="display: inline-block;cursor: pointer;float:right">
      <i style="vertical-align:middle" class="material-icons">close</i>

  </div>

</div>
</template>

<script>

import AppIcon         from '../partials/AppIcon.vue'


export default {
  name: 'gene-badge',
  components: {
    AppIcon
  },
  props: {
    gene: null,
    phenotypes: null,
    selectedGene: null,
  },
  data () {
    return {
    }
  },
  watch: {
  },
  methods: {
    selectGene: function() {
      this.$emit("gene-selected", this.gene.name);
    },
    removeGene: function() {
      let self = this;
      let theGeneName = self.gene.name;
      self.$emit("remove-gene", theGeneName);

    },
    getImpactClass: function(variantTypes) {
      var self = this;
      var clazz = null;
      if (self.gene.dangerSummary && this.gene.dangerSummary.badges.highOrModerate.length > 0 ) {
        for (var variantType in variantTypes) {


          this.gene.dangerSummary.badges.highOrModerate.forEach(function(variant) {
            if (variant.type.toUpperCase() == variantType.toUpperCase()) {
              if (variant.highestImpactVep.HIGH) {
                clazz = 'filter-symbol impact_HIGH';
              } else if (variant.highestImpactVep.MODERATE) {
                clazz = 'filter-symbol impact_MODERATE';
              }
            }
          })


          /*
          if (self.gene.dangerSummary.IMPACT.HIGH
            && (self.gene.dangerSummary.IMPACT.HIGH[theVariantType] || self.gene.dangerSummary.IMPACT.HIGH[variantType])) {
            clazz = 'filter-symbol impact_HIGH';
          } else if (self.gene.dangerSummary.IMPACT.MODERATE
            && (self.gene.dangerSummary.IMPACT.MODERATE[theVariantType] || self.gene.dangerSummary.IMPACT.MODERATE[variantType])) {
            clazz = 'filter-symbol impact_MODERATE';
          }
          */
        }
      }
      return clazz;
    },
    hasFilteredVariants: function(filterName) {
      return this.gene && this.gene.dangerSummary && this.gene.dangerSummary.badges[filterName].length > 0;
    },
    hasCoverageProblem: function() {
      return this.gene && this.gene.dangerSummary && this.gene.dangerSummary.geneCoverageProblem;
    }
  },
  computed: {
    classObject: function () {
      return {

        'selected':              this.selectedGene && this.selectedGene.gene_name == this.gene.name,
        'in-progress':           this.gene.inProgress,
        'loaded':                this.gene.dangerSummary != null,
        'called':                this.gene.dangerSummary && this.gene.dangerSummary.CALLED && this.gene.dangerSummary.calledCount == 0,
        'has-called-variants':   this.gene.dangerSummary && this.gene.dangerSummary.CALLED && this.gene.dangerSummary.calledCount > 0,
        'has-phenotypes':        false, //this.phenotypes && this.phenotypes.length > 0,
        'is-flagged':            this.gene.dangerSummary && this.gene.dangerSummary.badges && this.gene.dangerSummary.badges.flagged.length > 0,
        'is-pathogenic':         this.gene.dangerSummary && this.gene.dangerSummary.badges.pathogenic.length > 0,
        'inheritance-autosomal-dominant': this.gene.dangerSummary && this.gene.dangerSummary.badges.autosomalDominant.length > 0,
        'inheritance-recessive': this.gene.dangerSummary && this.gene.dangerSummary.badges.recessive.length > 0,
        'inheritance-x-linked':  this.gene.dangerSummary && this.gene.dangerSummary.badges.xlinked.length > 0,
        'inheritance-compound-het':
                                 this.gene.dangerSummary && this.gene.dangerSummary.badges.compoundHet.length > 0,
        'has-coverage-problem':  this.gene.dangerSummary && this.gene.dangerSummary.geneCoverageProblem
      }
    }

  },
  mounted: function() {
  }
}

</script>