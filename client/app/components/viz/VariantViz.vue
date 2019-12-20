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
    <div class="variant-viz"></div>
</template>

<script>

    import variantD3 from '../../d3/Variant.d3.js'

    export default {
        name: 'variant-viz',
        props: {
            data: {},
            model: {}, // SampleModel
            annotationScheme: {
                default: 'vep',
                type: String
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
            margin: {
                type: Object,
                default: function () {
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
                default: function () {
                    return [];
                }
            },
            tooltipHTML: {
                type: Function,
                default: function (d, i) {
                    return "";
                }
            },
            classifySymbolFunc: null,
            isTumorTrack: {
                type: Boolean,
                default: false
            },
            isKnownOrCosmicTrack: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                variantChart: {},
                noPassingResults: false,
                filterChips: [],    // TODO: actually implement these
                id: ''
            }
        },
        created: function () {
        },
        mounted: function () {
            this.draw();
            this.id = this.model.getId();
        },
        methods: {
            draw: function () {
                const self = this;

                const variantVizOptions = {
                  margin: this.margin,
                  showXAxis: this.showXAxis,
                  xTickFormat: this.xTickFormat,
                  variantHeight: this.variantHeight,
                  verticalPadding: this.verticalPadding,
                  showBrush: this.showBrush,
                  showTransition: this.showTransition,
                  clazz: function(variant) {
                      return self.classifySymbolFunc(variant, self.annotationScheme, self.isTumorTrack, self.isKnownOrCosmicTrack);
                  }
                };

                // Instantiate d3 object
                this.variantChart = variantD3(d3v5, variantVizOptions);

                // Register listeners
                let dispatch = this.variantChart.getDispatch();
                dispatch.on('d3rendered', function() {
                    // self.$emit('apply-active-filters');
                });
                dispatch.on('d3click', function(variant) {
                    self.onVariantClick(variant);
                });
                dispatch.on('d3outsideclick', function() {
                    self.onVariantClick(null);
                });
                dispatch.on('d3mouseover', function(variant) {
                    self.onVariantHover(variant);
                });
                dispatch.on('d3mouseout', function() {
                    self.onVariantHoverEnd();
                });

                this.setVariantChart();
            },
            update: function () {
                const self = this;
                if (self.data) {
                    // Set the vertical layer count so that the height of the chart can be recalculated
                    if (self.data.maxLevel == null) {
                        self.data.maxLevel = d3.max(self.data.features, function (d) {
                            return d.level;
                        });
                    }
                    let selection = d3.select(self.$el).datum([self.data]);

                    const chartData = {
                      selection: selection,
                      regionStart: self.regionStart,
                      regionEnd: self.regionEnd,
                      verticalLayers: self.data.maxLevel,
                      lowestWidth: self.data.featureWidth + 1,
                      width: self.width
                    };
                    self.variantChart(chartData);
                }
            },
            updateVariantClasses: function(container) {
                const self = this;
                self.variantChart.updateVariantClasses(container);
            },
            onVariantClick: function (variant) {
                let self = this;
                self.$emit("variantClick", variant);
            },
            onVariantHover: function (variant) {
                let self = this;
                self.$emit("variantHover", variant);
            },
            onVariantHoverEnd: function (variant) {
                let self = this;
                self.$emit("variantHoverEnd", variant);
            },
            showVariantCircle: function (variant, container, pinned) {
                if (variant == null) {
                    this.hideVariantCircle(container, pinned);
                } else {
                    if (pinned) {
                        this.variantChart.hideCircle(container, pinned);
                    }
                    // Note: SJG not sure if logic here is correct for highlighting when vars are called...
                    this.variantChart.showCircle(variant,
                        container,
                        (variant.fbCalled == null || variant.fbCalled !== 'Y'),
                        pinned);
                }
            },
            hideVariantCircle: function (container, pinned) {
                this.variantChart.hideCircle(container, pinned);
            },
            setVariantChart: function () {
                this.$emit('updateVariantChart', this.variantChart);
            },
            showFlaggedVariant: function (variant, container) {
                this.variantChart.showFlaggedVariant(container, variant);
            }
        },
        watch: {
            data: function () {
                this.update();
            }

        }
    }
</script>