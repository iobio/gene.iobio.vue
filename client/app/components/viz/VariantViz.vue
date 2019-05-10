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
                default: function (d, i) {
                    return "";
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
                excludeFilters: [],      // List of filter classes; if variant contains any one of these, it will be hidden
                cutoffFilters: {},       // Hash of arrays {filterName: [filterName, logic, cutoffVal]}; if variant does not pass any of these, it will be hidden
                noPassingResults: false,
                filterChips: [],
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
                var self = this;

                this.variantChart = variantD3()
                    .width(this.width)
                    .clazz(function (variant) {
                        return self.classifySymbolFunc(variant, self.annotationScheme, self.isTumorTrack, self.isKnownOrCosmicTrack);
                    })
                    .margin(this.margin)
                    .showXAxis(this.showXAxis)
                    .xTickFormat(this.xTickFormat)
                    .variantHeight(this.variantHeight)
                    .verticalPadding(this.variantPadding)
                    .showBrush(this.showBrush)
                    .showTransition(this.showTransition)
                    .tooltipHTML(this.tooltipHTML)
                    .regionStart(this.regionStart)
                    .regionEnd(this.regionEnd)
                    .on("d3rendered", function () {
                    })
                    .on('d3outsideclick', function () {
                        self.onVariantClick(null);
                    })
                    .on('d3click', function (variant) {
                        self.onVariantClick(variant);
                    })
                    .on('d3mouseover', function (variant) {
                        self.onVariantHover(variant);
                    })
                    .on('d3mouseout', function () {
                        self.onVariantHoverEnd();
                    });

                this.setVariantChart();
            },
            update: function () {
                var self = this;
                if (self.data) {

                    // Set the vertical layer count so that the height of the chart can be recalculated
                    if (self.data.maxLevel == null) {
                        self.data.maxLevel = d3.max(self.data.features, function (d) {
                            return d.level;
                        });
                    }
                    self.variantChart.verticalLayers(self.data.maxLevel);
                    self.variantChart.lowestWidth(self.data.featureWidth);
                    if (self.data.features == null || self.data.features.length == 0) {
                        self.variantChart.showXAxis(false);
                    } else {
                        self.variantChart.showXAxis(self.showXAxis);
                    }

                    self.variantChart.regionStart(self.regionStart);
                    self.variantChart.regionEnd(self.regionEnd);

                    self.variantChart.width(self.width);


                    var selection = d3.select(self.$el).datum([self.data]);
                    self.variantChart(selection);
                }
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
                        this.variantChart.hideCircle()(container, pinned);
                    }
                    this.variantChart.showCircle()(variant,
                        container,
                        variant.fbCalled && variant.fbCalled == 'Y' ? false : true,
                        pinned);
                }
            },
            hideVariantCircle: function (container, pinned) {
                this.variantChart.hideCircle()(container, pinned);
            },
            setVariantChart: function () {
                this.$emit('updateVariantChart', this.variantChart);
            },
            showFlaggedVariant: function (variant, container) {
                this.variantChart.showFlaggedVariant(container, variant);
            },
            filterVariants: function (filterInfo, svg, checkForSelectedVar, selectedVarId) {
                let self = this;

                // Set chip indicators
                let filterLabel = '';
                // Turning checkbox ON
                if (filterInfo.type === 'checkbox' && filterInfo.state === false) {
                    filterLabel = 'No ' + filterInfo.displayName;
                    // if (filterInfo.state === false) {
                    let filterObj = {name: filterInfo.name, filterLabel: filterLabel};
                    self.filterChips.push(filterObj);

                    // Turning cutoff ON
                } else if (filterInfo.type === 'cutoff' && filterInfo.turnOff === false) {
                    filterLabel = filterInfo.displayName + ' ' + filterInfo.state + ' ' + filterInfo.cutoffValue;

                    // Replace label if this filter already active at different value
                    let matchingFilters = self.filterChips.filter((obj) => {
                        return obj.name === filterInfo.name
                    });
                    if (matchingFilters && matchingFilters[0]) {
                        matchingFilters[0].filterLabel = filterLabel;

                        // Otherwise add fresh
                    } else {
                        let filterObj = {name: filterInfo.name, filterLabel: filterLabel};
                        self.filterChips.push(filterObj);
                    }
                    // Turning either type OFF
                } else {
                    self.filterChips = self.filterChips.filter((obj) => {
                        return obj.name !== filterInfo.name;
                    })
                }

                // Reset no vars
                let noPassingVars = false;
                self.noPassingResults = false;

                // Apply checkbox filter
                if (filterInfo.state === true && filterInfo.type === 'checkbox') {

                    // Remove from active filter state
                    self.excludeFilters.splice(self.excludeFilters.indexOf('.' + filterInfo.name), 1);

                    // Re-apply active filters in case of multiple filters
                    noPassingVars = self.variantChart.filterVariants()(self.excludeFilters, self.cutoffFilters, svg);

                // Removing checkbox filter
                } else if (filterInfo.state === false && filterInfo.type === 'checkbox') {
                    // Hide variants with that class
                    let filterClass = '.' + filterInfo.name;
                    self.excludeFilters.push(filterClass);
                    noPassingVars = self.variantChart.filterVariants()(self.excludeFilters, self.cutoffFilters, svg);

                    // Check to make sure we haven't hidden the selected variant
                    if (checkForSelectedVar) {
                        let selectedVarStillVisible = self.variantChart.checkForSelectedVar()(selectedVarId, svg);
                        // If we have, send deselect message
                        if (!selectedVarStillVisible) {
                            self.$emit("variantClick", null, null);
                        }
                    }
                // Apply cutoff filter
                } else if (filterInfo.state != null && filterInfo.type === 'cutoff') {

                    // Remove any previous logic for this filter
                    if (self.cutoffFilters[filterInfo.name]) {
                        delete self.cutoffFilters[filterInfo.name];
                    }

                    // Add new logic
                    self.cutoffFilters[filterInfo.name] = [filterInfo.name, filterInfo.state, filterInfo.cutoffValue];

                    // Hide variants that do not meet given condition
                    noPassingVars = self.variantChart.filterVariants()(self.excludeFilters, self.cutoffFilters, svg);

                    // Remove cutoff filter
                } else {
                    // Remove from list
                    delete self.cutoffFilters[filterInfo.name];

                    // Re-apply active filters in case of multiple filters
                    noPassingVars = self.variantChart.filterVariants()(self.excludeFilters, self.cutoffFilters, svg)
                }

                if (checkForSelectedVar) {
                    let selectedVarStillVisible = self.variantChart.checkForSelectedVar()(selectedVarId, svg);
                    // If we have, send deselect message
                    if (!selectedVarStillVisible) {
                        self.$emit("variantClick", null, null);
                    }
                }

                if (noPassingVars) {
                    self.noPassingResults = true;
                }
            }
        },
        watch: {
            data: function () {
                this.update();
            }

        }
    }
</script>