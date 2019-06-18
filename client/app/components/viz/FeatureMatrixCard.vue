/*
 * FeatureMatrixCard.vue
 *
 */
<style lang="sass">
@import ../../../assets/sass/variables

#matrix-card
  margin-bottom: 0px !important

  #show-legend
      margin-left: 40px
      i
        font-size: 18px
        vertical-align: middle


  .matrix-note-text
    margin-top: -7px
    color: $text-color
    font-style: italic


  #zero-variants
    color: white
    font-size: 14px
    text-align: center
    margin-bottom: 10px
    background-color:  $info-color
    border: thin solid $info-color-dark
    width: 300px
    margin-left: auto
    margin-right: auto

    &.zero-filtered-variants
      color: $text-color
      background-color: lightgrey
      border: solid thin lightgrey

  #feature-matrix-note
    padding-left: 50px
    font-size: 12px
    margin-top: -15px

  #move-rows
    float: right
    font-size: 13px !important
    color: $text-color !important
    margin-top: 0px

  .show-settings-button
    margin-left: 5px
    margin-right: 0px
    margin-top: -5px
    margin-bottom: 0px
    float: right

</style>

<template>

  <v-card tile id="matrix-card" class="app-card">
    <div style="width:100%">
        <span style="float:left">
          Ranked Variants for {{ selectedGene.gene_name }}
        </span>
        <div id="rank-variants-title" class="hide card-label" style="">Evaluate Variants</div>

      <!--TODO: took out for AACR, reincorporate-->
        <!--<v-btn flat fab small slot="activator" class="show-settings-button" @click="showSettings = !showSettings"-->
        <!--light>-->
          <!--<v-icon style="font-size:17px" >settings</v-icon>-->
        <!--</v-btn>-->
        <!--<a v-if="showSettings" id="move-rows" class="level-edu level-basic" v-bind:class="{ hide: featureMatrixModel.rankedVariants.length == 0 }" href="javascript:void(0)" @click="toggleMoveRows">-->
           <!--<i class="material-icons">swap_vert</i>-->
          <!--Reorder-->
        <!--</a>-->






    </div>

    <div style="clear:both;width:100%;margin-top:-10px">


      <div id="matrix-panel"  style="clear:both;min-height:30px"
        class="fullview" aria-expanded="true">


        <div id="feature-matrix" style="overflow-x: auto;">

          <feature-matrix-viz id="feature-matrix-viz"
            ref="featureMatrixVizRef"
            v-bind:class="{ hide: featureMatrixModel.rankedVariants.length === 0, 'basic' : isBasicMode}"
            :data="featureMatrixModel.rankedVariants"
            :annotationScheme="featureMatrixModel.cohort.annotationScheme"
            :matrixRows="featureMatrixModel.matrixRows"
            :width="width"
            :margin="margin"
            :cellSize="cellSize"
            :cellWidth="cellWidth"
            :cellHeights="featureMatrixModel.getCellHeights()"
            :columnLabel="columnLabel"
            :columnLabelHeight="columnLabelHeight"
            :columnLabelClass="columnLabelClass"
            :columnLabelSymbol="columnLabelSymbol"
            :rowLabelWidth="rowLabelWidth"
            :adjustTooltipCoordinates="adjustTooltipCoordinates"
            @featureMatrixRowUp="onFeatureMatrixRowUp"
            @featureMatrixRowDown="onFeatureMatrixRowDown"
            @variantClick="onVariantClick"
            @variantHover="onVariantHover"
            @variantHoverEnd="onVariantHoverEnd"
          >
          </feature-matrix-viz>
        </div>



        <div id="feature-matrix-note" v-bind:class="{ hide: featureMatrixModel.rankedVariants.length == 0 }" >

          <!--<div style="display:inline-block;margin-left:110px">-->
            <!--<svg style="height: 10px;width:108px">-->
              <!--<g transform="translate(8,6)">-->
                <!--<line x1="0" y1="0" x2="100" y2="0" style="stroke: lightgrey;stroke-width: 4;"></line>-->
              <!--</g>-->
              <!--<g transform="translate(-10,0),rotate(-90,10,0)">-->
                <!--<polygon points="0,8 4,2 8,8" style="fill: lightgrey; stroke: lightgrey; stroke-width: 1px; opacity: 1;"></polygon>-->
              <!--</g>-->
            <!--</svg>-->

            <!--TODO: rework wording here-->
            <!--<div class="matrix-note-text level-edu level-basic">-->
              <!--More likely causative-->
            <!--</div>-->
            <!--<div id="matrix-harmful-note" class="matrix-note-text hide level-basic level-edu">-->
              <!--Most harmful-->
            <!--</div>-->

          </div>


        </div>


      </div>

      <div style="text-align: center;clear: both;">
        <div class="loader featureMatrixLoader"
        v-bind:class="{hide: featureMatrixModel.inProgress
          && !featureMatrixModel.inProgress.loadingVariants
          && !featureMatrixModel.inProgress.rankingVariants}" style="display: inline-block;">
          <span class="loader-label">
            {{ featureMatrixModel.getProgressText() }}
          </span>
          <img src="../../../assets/images/wheel.gif">
        </div>
      </div>
      <div  class="label label-warning level-edu" v-bind:class="{ hide: featureMatrixModel.warning.length == 0 }">
        {{ featureMatrixModel.warning }}
      </div>

  </v-card>



</template>


<script>
import FeatureMatrixViz    from "../viz/FeatureMatrixViz.vue"


export default {
  name: 'feature-matrix-card',
  components: {
    FeatureMatrixViz
  },
  props: {
    isBasicMode: null,
    isEduMode: null,
    name: "",
    featureMatrixModel: {},
    selectedGene: null,
    selectedTranscript: null,
    selectedVariant: null,
    id: null,
    variantTooltip: null,
    width: 0
  },
  data() {
    return {
      CELL_SIZE_SMALL: 18,
      CELL_SIZE_LARGE: 22,
      CELL_SIZE_EDU: 23,
      CELL_WIDTH_BASIC: 160,
      COLUMN_LABEL_HEIGHT: 28,
      COLUMN_LABEL_HEIGHT_BASIC: 28,
      ROW_LABEL_WIDTH: 165,
      ROW_LABEL_WIDTH_BASIC: 165,
      ROW_LABEL_WIDTH_EDU: 130,
      CELL_SIZE: null,

      margin: {top: 0, right: 40, bottom: 7, left: 0},
      cellSize: null,
      cellWidth: null,
      columnLabelHeight: null,
      rowLabelWidth: null,
      columnLabel: this.getVariantLabel,
      columnLabelClass: this.getVariantLabelClass,
      columnLabelSymbol: this.columnHeaderSymbol,
      adjustTooltipCoordinates: function(variant) {
      },
      showSettings: false
    }
  },



  methods: {

    toggleMoveRows: function() {
      $('#feature-matrix .y.axis .tick text').removeClass("current");
      if ($('#feature-matrix.shift-rows').length > 0) {
        $('#move-rows').text("Reorder");
      } else {
        $('#move-rows').text("Done");
      }
      $('#feature-matrix').toggleClass("shift-rows");
    },

    setCellSize: function(sizeEnum) {
      var toggle = false;
      let cellSizeSmall = this.isEduMode ? this.CELL_SIZE_EDU : this.CELL_SIZE_SMALL;
      let cellSizeLarge = this.isEduMode ? this.CELL_SIZE_EDU : this.CELL_SIZE_LARGE;
      if (sizeEnum == 'small' && this.CELL_SIZE != cellSizeSmall) {
        this.CELL_SIZE = cellSizeSmall;
        toggle = true;
      } else if (sizeEnum == 'large' && this.CELL_SIZE != cellSizeLarge) {
        this.CELL_SIZE = cellSizeLarge;
        toggle = true;
      }

      if (toggle && this.featureMatrix) {
        this.featureMatrix.cellSize(this.CELL_SIZE);
        if (getProbandVariantCard().model && getProbandVariantCard().model.vcfData) {
          this.promiseFillFeatureMatrix(getProbandVariantCard().model.vcfData);
        }
      }

    },



    getVariantLabelClass: function(variant, i) {
      var clazz = "";
      if (i > 98) {
        clazz += "long-label ";
      };
      if (variant.hasOwnProperty("fbCalled") && variant.fbCalled == "Y") {
        clazz +=  "called "
      }
      return clazz;
    },

    getVariantLabel: function(variant, i) {
      return (i+1).toString();
    },

    columnHeaderSymbol: function(selection, options) {
      options = options || {};
      if (!options.cellSize) {
        options.cellSize = this.CELL_SIZE;
      }

      selection.each(function(d) {
        var colhdr = d3.select(this);
        if (d.hasOwnProperty("fbCalled") && d.fbCalled == "Y") {
          colhdr.append("g")
                 .attr("transform", "translate(" + (options.cellSize - 17)/2 + ",-25)")
                 .append("use")
                 .attr("id", "checkmark-called")
                 .attr("xlink:href", "#circle-checkmark-symbol")
                 .attr("width",  17)
                 .attr("height", 17)
                 .style("pointer-events", "none");
        }


      })
    },

    onFeatureMatrixRowUp: function(i) {
      let self = this;
      if (self.isEduMode  || self.isBasicMode) {
        return;
      }
      var column = null;
      var columnPrev = null;
      self.featureMatrixModel.filteredMatrixRows.forEach(function(col) {
        if (col.order == i) {
          column = col;
        } else if (col.order == i - 1) {
          columnPrev = col;
        }
      });
      if (column && columnPrev) {
        column.order = column.order - 1;
        columnPrev.order = columnPrev.order + 1;
      }
      self.$emit("variant-rank-change");
    },

    onFeatureMatrixRowDown: function(i) {
      let self = this;
      if (self.isEduMode  || self.isBasicMode) {
        return;
      }
      var column = null;
      var columnNext = null;
      self.featureMatrixModel.filteredMatrixRows.forEach(function(col) {
        if (col.order == i) {
          column = col;
        } else if (col.order == i + 1) {
          columnNext = col;
        }
      });
      if (column && columnNext) {
        column.order = column.order + 1;
        columnNext.order = columnNext.order - 1;
      }
      self.$emit("variant-rank-change");
    },

    selectVariant: function(variant, clazz) {
      this.$refs.featureMatrixVizRef.selectVariant(variant, clazz);
    },

    onVariantClick: function(variant) {
      this.$emit('cohort-variant-click', variant, this, variant.sampleModelId);
    },

    onVariantHover: function(variant) {
      this.showVariantTooltip(variant, false);
      this.$emit('cohort-variant-hover', variant, this);
    },

    onVariantHoverEnd: function() {
      this.hideVariantTooltip(false);
      this.$emit('cohort-variant-hover-end', this);
    },

    showVariantTooltip: function(variant, lock) {
      let self = this;

      let tooltip = d3.select("#main-tooltip");

      if (lock) {
        tooltip.style("pointer-events", "all");
      } else {
        tooltip.style("pointer-events", "none");
      }
      var x = variant.screenXMatrix;
      var y = variant.screenYMatrix;
      var coord = {'x':                  x,
                   'y':                  y,
                   'height':             self.$el.offsetHeight,
                    // tooltip can span across width of main window
                   'parentWidth':        self.$el.parentNode.parentNode.offsetWidth,
                   'preferredPositions': [ {top:    ['center', 'right', 'left' ]},
                                           {right:  ['middle', 'top',   'bottom']},
                                           {left:   ['middle', 'top',   'bottom']},
                                           {bottom: ['right',  'left',  'center']} ]
                  };

      self.variantTooltip.fillAndPositionTooltip(tooltip,
        variant,
        self.selectedGene,
        self.selectedTranscript,
        lock,
        coord,
        'matrix',
        self.featureMatrixModel.cohort.affectedInfo,
        self.featureMatrixModel.cohort.mode,
        self.featureMatrixModel.cohort.maxAlleleCount);
    },

    tooltipScroll(direction) {
      this.variantTooltip.scroll(direction, "#main-tooltip");
    },


    hideVariantTooltip() {
      let tooltip = d3.select("#main-tooltip");
      tooltip.transition()
           .duration(500)
           .style("opacity", 0)
           .style("z-index", 0)
           .style("pointer-events", "none");
    },
    drawViz() {
      let self = this;
      self.$refs.featureMatrixVizRef.draw(self.featureMatrixModel.filteredMatrixRows);
    }
  },


  filters: {
  },

  computed: {
  },

  watch: {
  },

  mounted: function() {
  },

  created: function() {
    this.setCellSize('small');
    this.cellSize = (this.isBasicMode ? null : this.CELL_SIZE);
    this.cellWidth = this.isBasicMode ? this.CELL_WIDTH_BASIC : null;
    this.columnLabelHeight =  this.isBasicMode ?  this.COLUMN_LABEL_HEIGHT_BASIC : this.COLUMN_LABEL_HEIGHT;
    this.rowLabelWidth = (this.isBasicMode ? this.ROW_LABEL_WIDTH_BASIC : this.ROW_LABEL_WIDTH);
  }



}
</script>

