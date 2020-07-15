<style lang="sass">
@import ../../../assets/sass/variables


.variant
  opacity: 1
  stroke: #000
  stroke-width: 1px
  stroke-opacity: .3

  &.current
    stroke: #036DB7 !important
    stroke-width: 1.5px !important
    stroke-opacity: 1 !important

.ibo-variant
  .reference
    stroke: rgb(150, 150, 150)

  .name
    font-size: 18px
    fill: rgb(120, 120, 120)

  .arrow
    stroke: rgb(150, 150, 150)
    fill: none

  .axis
    path, line
      fill: none
      stroke: lightgrey
      shape-rendering: crispEdges

    font-size: 13px

.ibo-variant .circle, .ibo-variant .arrow-line, iobio-variant .arrow
  stroke: $current-frame-color
  stroke-width: 2

  fill: none
  pointer-events: none

.ibo-variant .circle.pinned, .ibo-variant .arrow.pinned .arrow-line, .ibo-variant .arrow.pinned .arrow
  stroke: $arrow-color
  fill: none
  stroke-width: 4
  pointer-events: none


.ibo-variant
  .axis.x
    .tick
      line
        display: none
        stroke: rgba(211, 211, 211, 0.84)



.variant-viz
  .flagged-variant
    rect
      fill: none
      stroke: transparent
      stroke-width: 7
      opacity: .6


</style>


<template>
    <div class="variant-viz">

    </div>
</template>

<script>

import variantD3 from '../../d3/Variant.d3.js'

export default {
    name: 'variant-viz',
    props: {
      data: {},
      annotationScheme: {
        default: 'vep',
        type: String
      },
      model: {
        type: Object,
        default: function() {
          return null;
        }
      },
      regionStart: {
        default: 0,
        type: Number
      },
      regionEnd: {
        default: 0,
        type: Number
      },
      variantHeight: {
        default: 8,
        type: Number
      },
      variantPadding: {
        default: 2,
        type: Number
      },
      showWhenEmpty: {
        type: Boolean,
        default: true
      },
      margin:{
        type: Object,
        default: function() {
          return {top: 10, bottom: 10, left: 10, right: 10}
        }
      },
      showXAxis: {
        type: Boolean,
        default: true
      },
      showTransition: {
        type: Boolean,
        default: false
      },
      showBrush: {
        type: Boolean,
        default: false
      },
      width: {
        type: Number,
        default: 0
      },
      xTickFormat: {
        type: Function,
        default: function(d, i) {
          return "";
        }
      },
      tooltipHTML: {
        type: Function,
        default: function(d, i) {
          return "";
        }
      },
      classifySymbolFunc: null,
      filteredVariants: null,
      showFilter: false,
      selectedVariant: null,
    },
    data() {
      return {
        variantChart: {},
        variants: null,
      }
    },
    created: function() {
    },
    mounted: function() {
      this.variants = this.data;
      this.draw();
      this.update();
    },
    methods: {
      draw: function() {
        var self = this;

        this.variantChart =  variantD3()
          .width(this.width)
          .clazz(function(variant) {
            return self.classifySymbolFunc(variant, self.annotationScheme);
          })
          .margin(this.margin)
          .showWhenEmpty(this.showWhenEmpty)
          .showXAxis(this.showXAxis)
          .xTickFormat(this.xTickFormat)
          .variantHeight(this.variantHeight)
          .verticalPadding(this.variantPadding)
          .showBrush(this.showBrush)
          .showTransition(this.showTransition)
          .tooltipHTML(this.tooltipHTML)
          .regionStart(this.regionStart)
          .regionEnd(this.regionEnd)
          .on("d3rendered", function() {
          })
          .on('d3outsideclick', function() {
            self.onVariantOutsideClick(self.model);
          })
          .on('d3click', function(variant) {
            self.onVariantClick(variant, self.model);
          })
          .on('d3mouseover', function(variant) {
            self.onVariantHover(variant, self.model);
          })
          .on('d3mouseout', function() {
            self.onVariantHoverEnd(self.model);
          })


          this.setVariantChart();
      },
      update: function() {
        var self = this;

        if (self.variants && self.data.features) {
            // Set the vertical layer count so that the height of the chart can be recalculated
          if (self.variants.maxLevel == null) {
            self.variants.maxLevel = d3.max(self.variants.features, function(d) { return d.level; });
          }
          self.variantChart.verticalLayers(self.variants.maxLevel);
          self.variantChart.lowestWidth(self.variants.featureWidth);
          if ((self.variants.features == null || self.variants.features.length == 0) && !self.showWhenEmpty) {
            self.variantChart.showXAxis(false);
          } else {
            self.variantChart.showXAxis(self.showXAxis);
          }

          self.variantChart.regionStart(self.regionStart);
          self.variantChart.regionEnd(self.regionEnd);

          self.variantChart.width(self.width);


          var selection = d3.select(self.$el).datum( [self.variants] );
          self.variantChart(selection);
        }
      },
      onVariantOutsideClick: function() {
        let self = this;
        self.$emit("variantOutsideClick")
      },
      onVariantClick: function(variant) {
        let self = this;
        self.$emit("variantClick", variant, self.model);
      },
      onVariantHover: function(variant) {
        let self = this;
        self.$emit("variantHover", variant, self.model);
      },
      onVariantHoverEnd: function(variant) {
        let self = this;
        self.$emit("variantHoverEnd", variant, self.model);
      },
      showVariantCircle: function(variant, container, pinned) {
        if (variant == null) {
          this.hideVariantCircle(container, pinned);
          return null;
        } else {
          if (pinned) {
            this.variantChart.hideCircle()(container, pinned);
          }
          let matchingVariant = this.variantChart.showCircle()(variant,
            container,
            variant.fbCalled && variant.fbCalled == 'Y' ? false : true,
            pinned);
          return matchingVariant;
        }
      },
      hideVariantCircle: function(container, pinned) {
        this.variantChart.hideCircle()(container, pinned);
      },
      setVariantChart: function() {
        this.$emit('updateVariantChart', this.variantChart);
      },
      showFlaggedVariant: function(variant, container) {
        this.variantChart.showFlaggedVariant(container, variant);
      },

      intersectVariants(){
          let copyVariants = Object.assign({}, this.filteredVariants);
          let features = [];
          if(this.filteredVariants && this.filteredVariants.features && this.data && this.data.features) {
              for (let i = 0; i < this.data.features.length; i++) {
                  for (let j = 0; j < this.filteredVariants.features.length; j++) {
                      let fv = this.data.features[i];
                      let v = this.filteredVariants.features[j];
                      if (fv.start === v.start && fv.end === v.end && fv.alt === v.alt && fv.ref === v.ref) {
                          features.push(v);
                      }
                  }
              }
          }
          copyVariants.features = features;
          this.variants = copyVariants;
      },
    },
    watch: {
      variants: function(){
        this.update();
      },

      selectedVariant: function(){
        if(this.showFilter){
          this.intersectVariants();
        }
        else{
          this.variants = this.data;
        }
      },

      showFilter: function(){
        if(this.showFilter){
            this.intersectVariants()
        }
        else{
          this.variants = this.data;
        }
      },

      filteredVariants(){
        if(this.showFilter){
            this.intersectVariants();
        }
        else{
          this.variants = this.data;
        }
      },

        data(){
            if(this.showFilter){
                this.intersectVariants();
            }
            else{
                this.variants = this.data;
            }
        },

      regionStart(){
        this.update();
      },
      regionEnd(){
        this.update();
      }
    }
}
</script>
