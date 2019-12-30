/*
* Variant.vue
*
*/
<style lang="sass">
    @import ../../../assets/sass/variables
    #bam-track
        margin-top: -5px

    #variant-card

        .variant-chip
            font-size: 12px
            margin-top: 0
            margin-left: 10px

        #sample-label
            vertical-align: top
            display: inline-block
            max-width: 200px
            color: $text-color
            margin-top: -1px
            font-size: 16px
            &.known-variants
                min-width: 100px
                max-width: 100px
        #gene-viz, #gene-viz-zoom
            .axis
                padding-left: 0px
                padding-right: 0px
                margin-top: -10px
                margin-bottom: 0px
                padding-bottom: 0px
                text
                    font-size: 11px
                    fill: rgb(120, 120, 120)
                line, path
                    fill: none
                    stroke: lightgrey
                    shape-rendering: crispEdges
                    stroke-width: 1px
                &.x
                    .tick
                        line
                            transform: translateY(-14px)
                        text
                            transform: translateY(6px)
                    path
                        transform: translateY(-20px)
                        display: none
        .chart-label
            font-size: 11px

        #gene-viz-zoom
            .current
                outline: none
            .cds, .exon, .utr
                fill: rgba(159, 159, 159, 0.63)
                stroke: rgb(159, 159, 159)
        .badge
            background-color: white !important
            color: $text-color !important
            font-weight: normal
            &.sample
                vertical-align: top
                padding-top: 4px
                padding-left: 0 !important
                .badge__badge
                    background-color: $app-color-light !important
                    span
                        font-weight: 500
                        font-size: 14px

            &.called
                padding: 4px 7px
                vertical-align: top
                .badge__badge
                    background-color: $light-badge-color !important
            &.loaded
                padding: 4px 7px
                vertical-align: top
                .badge__badge
                    background-color: $light-badge-color !important
            &.coverage-problem
                padding: 3px 7px
                vertical-align: top
                .badge__badge
                    background-color: $coverage-problem-color !important
            &.tumor
                .badge__badge
                    padding: 0px
                    font-weight: bold
                    background-color: $app-color !important
            .badge__badge
                padding: 0px
                font-size: 11px
                font-weight: normal
                width: 24px
                top: -3px
        #known-variants-chart
            padding: 0px
            margin-top: 0px
            margin-bottom: 0px
            svg
                vertical-align: bottom
                .axis
                    text
                        font-size: 12px !important
                    &.axis--x
                        .tick
                            visibility: hidden
                .layer.benign
                    .stacked-element
                        fill: rgba(156, 194, 49, 1)
                        stroke: $text-color
                        stroke-width: .5px
                .layer.path
                    .stacked-element
                        fill: #ad494A
                        stroke: $text-color
                        stroke-width: .5px
                .layer.other
                    .stacked-element
                        fill: rgba(231, 186, 82, 1)
                        stroke: $text-color
                        stroke-width: .5px
                .layer.unknown
                    .stacked-element
                        fill: rgb(189, 189, 189)
                        stroke: $text-color
                        stroke-width: .5px
                .layer.low
                    .stacked-element
                        fill: $low-impact-color
                        stroke: $text-color
                        stroke-width: .5px
                .layer.modifier
                    .stacked-element
                        fill: $modifier-impact-color
                        stroke: $text-color
                        stroke-width: .5px
                .layer.moderate
                    .stacked-element
                        fill: $moderate-impact-color
                        stroke: $text-color
                        stroke-width: .5px
                .layer.high
                    .stacked-element
                        fill: $high-impact-color
                        stroke: $text-color
                        stroke-width: .5px


        .expansion-panel__header
            padding: 10px 10px !important
            pointer-events: none
            cursor: default
            i
                vertical-align: top
            .header__icon
                pointer-events: auto
                cursor: pointer

</style>

<template>
    <v-expansion-panel expand class="app-card" id="variant-card" v-model="openState">
        <v-expansion-panel-content :value="openState">
            <div slot="header">
                <v-badge v-if="sampleModel.id === 'known-variants' || sampleModel.id === 'cosmic-variants'" class="sample mr-4 mt-1">
                    <span slot="badge">C</span>
                </v-badge>
                <v-badge v-else-if="sampleModel.isTumor" class="sample mr-4 mt-1">
                    <span slot="badge">T</span>
                </v-badge>
                <v-badge v-else-if="!sampleModel.isTumor" class="sample mr-4 mt-1">
                    <span slot="badge">N</span>
                </v-badge>
                <span id="sample-label">
                        {{ sampleLabel }}
                    </span>
                <v-chip v-if="annotationComplete && sampleModel.loadedVariants" small outline color="appColor" class="variant-chip">
                    {{ sampleModel.loadedVariants.features.length + ' Variants' }}
                </v-chip>
                <v-badge v-if="sampleModel.loadedVariants && coverageDangerRegions.length > 0"
                         class="ml-4 mr-4 mt-1 coverage-problem">
                    <span slot="badge"> {{ coverageDangerRegions.length }} </span>
                    Exons with insufficient coverage
                </v-badge>
                <known-variants-toolbar
                        v-if="sampleModel.id === 'known-variants' || sampleModel.id === 'cosmic-variants'"
                        :id="sampleModel.id"
                        :annotationType="'vep'"
                        @variantsVizChange="onVariantsVizChange"
                        @variantsFilterChange="onVariantsFilterChange"
                >
                </known-variants-toolbar>
                <div style="float: right;" id="cnv-ideo"></div>
                <div style="float: right;" id="loh-ideo"></div>
            </div>
            <v-card :style="{padding: '5px 10px'}" id="card-viz">
                <stacked-bar-chart-viz
                        id="known-variants-chart"
                        style="width:100%"
                        v-if="(sampleModel.id === 'known-variants' && knownVariantsViz !== 'variants') || (sampleModel.id === 'cosmic-variants' && cosmicVariantsViz !== 'variants')"
                        :data="sampleModel.variantHistoData"
                        :width="width"
                        :xStart="selectedGene.start"
                        :xEnd="selectedGene.end"
                        :regionStart="regionStart"
                        :regionEnd="regionEnd"
                        :categories="getCategories(sampleModel.id)"
                >
                </stacked-bar-chart-viz>
                <div style="width:100%">
                    <div style="text-align: center; clear: both">
                        <div class="loader vcfloader" v-bind:class="{ hide: !sampleModel.inProgress.loadingVariants }"
                             style="display: inline-block;padding-bottom:10px">
                            <span class="loader-label">Annotating variants</span>
                            <img src="../../../assets/images/wheel.gif">
                        </div>
                        <div class="loader fbloader" v-bind:class="{ hide: !sampleModel.inProgress.callingVariants }"
                             style="display: inline-block; padding-left: 20px; padding-bottom:10px">
                            <span class="loader-label">Calling variants</span>
                            <img src="../../../assets/images/wheel.gif">
                        </div>
                        <div class="loader covloader" v-bind:class="{ hide: !sampleModel.inProgress.loadingCoverage }"
                             style="display: inline-block; padding-left: 20px; padding-bottom:10px">
                            <span class="loader-label">Analyzing gene coverage</span>
                            <img src="../../../assets/images/wheel.gif">
                        </div>
                    </div>
                </div>

                <div style="width:100%" id="viz-div">
                    <div class="chart-label"
                         v-if="showVariantViz && sampleModel.cohort.geneModel.geneDangerSummaries[selectedGene.gene_name] && sampleModel.cohort.geneModel.geneDangerSummaries[selectedGene.gene_name].CALLED && sampleModel.calledVariants && sampleModel.calledVariants.features.length > 0"
                    >
                        called variants
                    </div>

                    <variant-viz id="called-variant-viz"
                                 ref="calledVariantVizRef"
                                 v-show="showVariantViz"
                                 v-bind:class="{hide: sampleModel.id === 'known-variants' && knownVariantsViz !== 'variants'}"
                                 :data="sampleModel.calledVariants"
                                 :id="sampleModel.getId()"
                                 :model="sampleModel"
                                 :regionStart="regionStart"
                                 :regionEnd="regionEnd"
                                 :annotationScheme="annotationScheme"
                                 :width="width"
                                 :margin="variantVizMargin"
                                 :variantHeight="variantSymbolHeight"
                                 :variantPadding="variantSymbolPadding"
                                 :showBrush="false"
                                 :showXAxis="true"
                                 :classifySymbolFunc="classifyVariantSymbolFunc"
                                 :isTumorTrack="sampleModel.isTumor"
                                 :isKnownOrCosmicTrack="isKnownOrCosmicTrack"
                                 @variantClick="onVariantClick"
                                 @variantHover="onVariantHover"
                                 @variantHoverEnd="onVariantHoverEnd">
                    </variant-viz>

                    <div class="chart-label"
                         v-show="showVariantViz && sampleModel.loadedVariants && sampleModel.loadedVariants.features.length > 0 && sampleModel.id !== 'known-variants'"
                    >
                        loaded variants
                    </div>

                    <variant-viz id="loaded-variant-viz"
                                 ref="variantVizRef"
                                 v-show="showVariantViz"
                                 v-bind:class="{hide: sampleModel.id === 'known-variants' && knownVariantsViz !== 'variants'}"
                                 :data="sampleModel.loadedVariants"
                                 :id="sampleModel.getId()"
                                 :model="sampleModel"
                                 :regionStart="regionStart"
                                 :regionEnd="regionEnd"
                                 :annotationScheme="annotationScheme"
                                 :width="width"
                                 :margin="variantVizMargin"
                                 :variantHeight="variantSymbolHeight"
                                 :variantPadding="variantSymbolPadding"
                                 :showBrush="false"
                                 :showXAxis="true"
                                 :classifySymbolFunc="classifyVariantSymbolFunc"
                                 :isTumorTrack="sampleModel.isTumor"
                                 :isKnownOrCosmicTrack="isKnownOrCosmicTrack"
                                 @variantClick="onVariantClick"
                                 @variantHover="onVariantHover"
                                 @variantHoverEnd="onVariantHoverEnd"
                                 @apply-active-filters="applyActiveFilters">
                    </variant-viz>

                    <div class="chart-label"
                         v-if="showDepthViz && sampleModel.coverage && sampleModel.coverage.length > 1"
                    >
                        coverage
                    </div>

                    <div id="bam-track">
                        <depth-viz
                                v-if="showDepthViz"
                                ref="depthVizRef"
                                :data="sampleModel.coverage"
                                :coverageMedian="sampleModel.cohort.filterModel.geneCoverageMedian"
                                :coverageDangerRegions="coverageDangerRegions"
                                :currentPoint="coveragePoint"
                                :maxDepth="sampleModel.cohort.maxDepth"
                                :regionStart="regionStart"
                                :regionEnd="regionEnd"
                                :width="width"
                                :margin="depthVizMargin"
                                :height="60"
                                :showTooltip="false"
                                :showXAxis="false"
                                :regionGlyph="depthVizRegionGlyph"
                                @region-selected="showExonTooltip"
                        >
                        </depth-viz>
                    </div>

                    <gene-viz id="gene-viz"
                              v-bind:class="{ hide: !showGeneViz }"
                              :data="[selectedTranscript]"
                              :margin="geneVizMargin"
                              :width="width"
                              :height="40"
                              :trackHeight="geneVizTrackHeight"
                              :cdsHeight="geneVizCdsHeight"
                              :regionStart="regionStart"
                              :regionEnd="regionEnd"
                              :showXAxis="geneVizShowXAxis"
                              :featureClass="getExonClass"
                              :isZoomTrack="false"
                              @feature-selected="showExonTooltip"
                    >
                    </gene-viz>
                </div>
            </v-card>
        </v-expansion-panel-content>
    </v-expansion-panel>
</template>

<script>


    import GeneViz from "../viz/GeneViz.vue"
    import VariantViz from "../viz/VariantViz.vue"
    import DepthViz from "../viz/DepthViz.vue"
    import StackedBarChartViz from "../viz/StackedBarChartViz.vue"
    import KnownVariantsToolbar from "../partials/KnownVariantsToolbar.vue"


    export default {
        name: 'variant-card',
        components: {
            VariantViz,
            GeneViz,
            DepthViz,
            KnownVariantsToolbar,
            StackedBarChartViz
        },
        props: {
            globalAppProp: null,  //For some reason, global mixin not working on variant card.  possible cause for-item?
            isEduMode: null,
            isBasicMode: null,
            clearZoom: null,
            sampleModel: null,
            canonicalSampleIds: null,
            annotationScheme: null,
            classifyVariantSymbolFunc: null,

            hoverTooltip: null,
            clickTooltip: null,
            selectedGene: {},
            selectedTranscript: {},

            selectedVariant: null,
            regionStart: 0,
            regionEnd: 0,
            width: 0,

            showVariantViz: true,
            showGeneViz: true,
            showDepthViz: true,
            geneVizShowXAxis: null,
            annotationComplete: false
        },
        data() {
            const self = this;
            return {
                margin: {
                    top: self.isBasicMode || self.isEduMode ? 0 : 20,
                    right: self.isBasicMode || self.isEduMode ? 7 : 2,
                    bottom: 18,
                    left: self.isBasicMode || self.isEduMode ? 9 : 4
                },
                variantVizMargin: {
                    top: 0,
                    right: self.isBasicMode || self.isEduMode ? 7 : 2,
                    bottom: 5,
                    left: self.isBasicMode || self.isEduMode ? 9 : 4
                },
                variantSymbolHeight: self.isEduMode || self.isBasicMode ? self.globalAppProp.eduModeVariantSize : 12,
                variantSymbolPadding: 4,
                geneVizMargin: {
                    top: 0,
                    right: self.isBasicMode || self.isEduMode ? 7 : 2,
                    bottom: self.geneVizShowXAxis ? 18 : 0,
                    left: self.isBasicMode || self.isEduMode ? 9 : 4
                },
                geneVizTrackHeight: self.isEduMode || self.isBasicMode ? 32 : 16,
                geneVizCdsHeight: self.isEduMode || self.isBasicMode ? 24 : 12,

                geneZoomVizMargin: {
                    top: 10,
                    right: 2,
                    bottom: 10,
                    left: 4
                },

                depthVizMargin: {
                    top: 22,
                    right: self.isBasicMode || self.isEduMode ? 7 : 2,
                    bottom: 0,
                    left: self.isBasicMode || self.isEduMode ? 9 : 4
                },
                depthVizYTickFormatFunc: null,
                coveragePoint: null,
                id: null,
                selectedExon: null,
                knownVariantsViz: null,
                cosmicVariantsViz: null,
                openState: [true],      // Array which controls expansion panel open/close - want open on load
                numFilteredVariants: 0
            }
        },
        methods: {
            depthVizYTickFormat: function (val) {
                if (val === 0) {
                    return "";
                } else {
                    return val + "x";
                }
            },
            // TODO: this is where we hook in to displaying low coverage for somatic vars w/ 0 coverage in normal
            depthVizRegionGlyph: function (exon, regionGroup, regionX) {
                let exonId = 'exon' + exon.exon_number.replace("/", "-");
                if (regionGroup.select("g#" + exonId).empty()) {
                    regionGroup.append('g')
                        .attr("id", exonId)
                        .attr('class', 'region-glyph coverage-problem-glyph')
                        .attr('transform', 'translate(' + (regionX - 12) + ',-16)')
                        .data([exon])
                        .append('use')
                        .attr('height', '22')
                        .attr('width', '22')
                        .attr('href', '#long-arrow-down-symbol')
                        .attr('xlink', 'http://www.w3.org/1999/xlink')
                        .data([exon]);
                }
            },
            onVariantClick: function (variant) {
                if (this.showDepthViz) {
                    if (variant) {
                        this.showCoverageCircle(variant);
                    }
                }
                if (this.showVariantViz) {
                    const tipType = "click";
                    if (variant) {
                        this.showVariantCircle(variant, true);

                        // Hide hover tip and show click tip
                        // this.hideVariantTooltip("hover");
                        this.showVariantTooltip(variant, tipType, false);
                    } else {
                        this.hideVariantTooltip(tipType);
                    }
                }
                this.$emit('cohort-variant-click', variant, this, this.sampleModel.id);
            },
            onVariantHover: function (variant) {
                if (this.showDepthViz) {
                    this.showCoverageCircle(variant);
                }
                if (this.showVariantViz) {
                    this.showVariantCircle(variant, false);

                    const tipType = "hover";
                    this.showVariantTooltip(variant, tipType, false);
                }
                this.$emit('cohort-variant-hover', variant, this);
            },
            onVariantHoverEnd: function () {
                if (this.showDepthViz) {
                    this.hideCoverageCircle();
                }
                if (this.showVariantViz) {
                    this.hideVariantCircle(false);
                    const tipType = "hover";
                    this.hideVariantTooltip(tipType);
                }
                this.$emit('cohort-variant-hover-end');
            },
            showVariantTooltip: function (variant, tipType, lock) {
                const self = this;

                let tooltip = d3.select("#main-tooltip");
                let tooltipObj = self.hoverTooltip;
                if (tipType === "click") {
                    tooltip = d3.select("#click-tooltip");
                    tooltipObj = self.clickTooltip;
                }

                let x = variant.screenX;
                let y = variant.screenY;
                let coord = {
                    'x': x,
                    'y': y,
                    'height': 33,
                    'parentWidth': self.$el.offsetWidth,
                    'preferredPositions': [{top: ['center', 'right', 'left']},
                        {bottom: ['center', 'right', 'left']},
                        {right: ['middle', 'top', 'bottom']},
                        {left: ['middle', 'top', 'bottom']}]
                };

                // If we're displaying a tooltip for a canonical track, want to get variant from THIS track to show correct AF
                // (the sent in variant is from the s0 track)
                let trackVariant = variant;
                if (tipType === 'click' && self.canonicalSampleIds && self.canonicalSampleIds.indexOf(self.sampleModel.id) >= 0) {
                    let matchingFeat = null;
                    if (self.sampleModel.vcfData && self.sampleModel.features) {
                        matchingFeat = self.sampleModel.vcfData.features.filter((feat) => {
                            return feat.id === variant.id;
                        })
                    }
                    if (matchingFeat) {
                        trackVariant = matchingFeat;
                    }
                }
                tooltipObj.fillAndPositionTooltip(tooltip,
                    trackVariant,
                    self.selectedGene,
                    self.selectedTranscript,
                    lock,
                    coord,
                    self.sampleModel.id,
                    self.sampleModel.getAffectedInfo(),
                    self.sampleModel.cohort.mode,
                    self.sampleModel.cohort.maxAlleleCount);
            },
            tooltipScroll(direction) {
                this.hoverTooltip.scroll(direction, "#main-tooltip");
                this.clickTooltip.scroll(direction, "#click-tooltip");
            },
            hideVariantTooltip: function (tipType) {
                let hoverTooltip = d3.select("#main-tooltip");
                let clickTooltip = d3.select("#click-tooltip");

                // If we haven't specified a type, hide them both
                if (tipType == null) {
                    hoverTooltip.transition()
                        .duration(500)
                        .style("opacity", 0)
                        .style("z-index", 0)
                        .style("pointer-events", "none");

                    clickTooltip.transition()
                        .duration(500)
                        .style("opacity", 0)
                        .style("z-index", 0)
                        .style("pointer-events", "none");
                } else if (tipType === "click") {
                    clickTooltip.transition()
                        .duration(500)
                        .style("opacity", 0)
                        .style("z-index", 0)
                        .style("pointer-events", "none");
                } else if (tipType === "hover") {
                    hoverTooltip.transition()
                        .duration(500)
                        .style("opacity", 0)
                        .style("z-index", 0)
                        .style("pointer-events", "none");
                }
            },
            showVariantCircle: function (variant, lock) {
                if (this.showVariantViz) {
                    let container = this.getVariantSVG();
                    this.getVariantViz(variant).showVariantCircle(variant, container, lock);
                }
            },
            hideVariantCircle: function (lock) {
                let self = this;
                if (self.showVariantViz) {
                    let container = this.getVariantSVG();
                    self.$refs.variantVizRef.hideVariantCircle(container, lock);
                }
            },
            getVariantViz: function (variant) {
                return variant.fbCalled && variant.fbCalled === 'Y'
                    ? this.$refs.calledVariantVizRef
                    : this.$refs.variantVizRef;
            },
            // Returns all loaded and called variant viz SVGs
            getVariantSVG: function () {
                return d3.select(this.$el).select('.expansion-panel__container').select('.expansion-panel__body').select('#card-viz').select('.variant-viz > svg');
            },
            getTrackSVG: function (vizTrackName) {
                let svg = d3.select(this.$el).select('#' + vizTrackName + ' > svg');
                return svg;
            },
            hideCoverageCircle: function () {
                if (this.showDepthViz) {
                    this.$refs.depthVizRef.hideCurrentPoint();
                }
            },
            showCoverageCircle: function (variant) {
                let self = this;

                if (self.showDepthViz && self.sampleModel.coverage != null) {
                    let theDepth = null;
                    var matchingVariants = self.sampleModel.loadedVariants.features.filter(function (v) {
                        return v.start === variant.start && v.alt === variant.alt && v.ref === variant.ref;
                    });

                    if (matchingVariants.length > 0) {
                        theDepth = matchingVariants[0].bamDepth;
                        // If samtools mpileup didn't return coverage for this position, use the variant's depth
                        // field.
                        if (theDepth == null || theDepth === '') {
                            theDepth = matchingVariants[0].genotypeDepth;
                        }
                    }

                    // If we have the exact depth for this variant, show it.  Otherwise, we will show
                    // the calculated (binned, averaged) depth at this position.
                    self.$refs.depthVizRef.showCurrentPoint({pos: variant.start, depth: theDepth});
                }


            },
            onVariantsVizChange: function (viz, trackId) {
                this.$nextTick(() => {
                    this.openState = [true];
                });
                if (trackId === 'known-variants') {
                    this.knownVariantsViz = viz;
                } else if (trackId === 'cosmic-variants') {
                    this.cosmicVariantsViz = viz;
                }
                this.$emit("variants-viz-change", viz, trackId);
            },
            onVariantsFilterChange: function (selectedCategories, trackId) {
                this.$nextTick(() => {
                    this.openState = [true];
                });
                this.$emit("variants-filter-change", selectedCategories, trackId);
            },
            showFlaggedVariant: function (variant) {
                if (this.showVariantViz) {
                    this.getVariantViz(variant).showFlaggedVariant(variant, this.getTrackSVG(variant.sampleModelId));
                }
            },
            getExonClass: function (exon, i) {
                if (this.showDepthViz && exon.danger) {
                    return exon.feature_type.toLowerCase() + (exon.danger[this.sampleModel.id] ? " danger" : "");
                } else {
                    return exon.feature_type.toLowerCase();
                }
            },
            showExonTooltip: function (featureObject, feature, lock) {
                let self = this;
                let tooltip = d3.select("#exon-tooltip");

                if (featureObject == null) {
                    self.hideExonTooltip();
                    return;
                }

                if (self.selectedExon) {
                    return;
                }

                if (lock) {
                    self.selectedExon = feature;
                    tooltip.style("pointer-events", "all");
                    tooltip.classed("locked", true);
                } else {
                    tooltip.style("pointer-events", "none");
                    tooltip.classed("locked", false);
                }

                let coverageRow = function (fieldName, coverageVal, covFields) {
                    let row = '<div>';
                    row += '<span style="padding-left:10px;width:60px;display:inline-block">' + fieldName + '</span>';
                    row += '<span style="width:40px;display:inline-block">' + d3.round(coverageVal) + '</span>';
                    row += '<span class="' + (covFields[fieldName] ? 'danger' : '') + '">' + (covFields[fieldName] ? covFields[fieldName] : '') + '</span>';
                    row += "</div>";
                    return row;
                };

                let html = '<div>'
                    + '<span id="exon-tooltip-title"' + (lock ? 'style="margin-top:8px">' : '>') + (feature.hasOwnProperty("exon_number") ? "Exon " + feature.exon_number : "") + '</span>'
                    + (lock ? '<a href="javascript:void(0)" id="exon-tooltip-close">X</a>' : '')
                    + '</div>';
                html += '<div style="clear:both">' + feature.feature_type + ' ' + self.globalAppProp.utility.addCommas(feature.start) + ' - ' + self.globalAppProp.utility.addCommas(feature.end) + '</div>';

                if (feature.geneCoverage && feature.geneCoverage[self.sampleModel.getId()]) {
                    let covFields = self.sampleModel.cohort.filterModel.whichLowCoverage(feature.geneCoverage[self.sampleModel.getId()]);
                    html += "<div style='margin-top:4px'>" + "Coverage:"
                        + coverageRow('min', feature.geneCoverage[self.sampleModel.getId()].min, covFields)
                        + coverageRow('median', feature.geneCoverage[self.sampleModel.getId()].median, covFields)
                        + coverageRow('mean', feature.geneCoverage[self.sampleModel.getId()].mean, covFields)
                        + coverageRow('max', feature.geneCoverage[self.sampleModel.getId()].max, covFields)
                        + coverageRow('sd', feature.geneCoverage[self.sampleModel.getId()].sd, covFields)

                }
                if (lock) {
                    html += '<div style="text-align:right;margin-top:8px">'
                        + '<a href="javascript:void(0)" id="exon-tooltip-thresholds" class="danger" style="float:left"  >Set cutoffs</a>'
                        + '</div>'
                }
                tooltip.html(html);
                if (lock) {
                    tooltip.select("#exon-tooltip-thresholds").on("click", function () {
                        self.$emit("show-coverage-cutoffs");
                    });
                    tooltip.select("#exon-tooltip-close").on("click", function () {
                        self.selectedExon = null;
                        self.hideExonTooltip(true);
                    })
                }

                let coord = self.globalAppProp.utility.getTooltipCoordinates(featureObject.node(),
                    tooltip, self.$el.offsetWidth, $('nav.toolbar').outerHeight());
                tooltip.style("left", coord.x + "px")
                    .style("text-align", 'left')
                    .style("top", (coord.y - 60) + "px");

                tooltip.style("z-index", 1032);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
            },
            hideExonTooltip: function (force) {
                let self = this;
                let tooltip = d3.select("#exon-tooltip");
                if (force || !self.selectedExon) {
                    tooltip.classed("locked", false);
                    tooltip.classed("black-arrow-left", false);
                    tooltip.classed("black-arrow-right", false);
                    tooltip.style("pointer-events", "none");
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                }
            },
            updateVariantClasses: function() {
                const self = this;
                let container = self.getTrackSVG(self.sampleModel.id);
                if (self.$refs.variantVizRef) {
                    self.$refs.variantVizRef.updateVariantClasses(container);
                }
            },
            applyActiveFilters: function() {
                const self = this;
                let container = self.getTrackSVG(self.sampleModel.id);
                self.$refs.variantVizRef.applyActiveFilters(container);
            },
            drawIdeograms: function() {
                // TODO: reformat this for our use
                let cnvConfig = {
                    organism: 'human',
                    container: '#cnv-ideo',
                    chromosome: this.selectedGene.chr,
                    chrHeight: 500,
                    orientation: 'horizontal',
                    annotations: [{
                        name: this.selectedGene.gene_name,
                        chr: this.selectedGene.chr, // TODO: what are field names here
                        start: this.selectedGene.start,
                        stop: this.selectedGene.end
                    }]
                };
                let cnvIdeogram = new Ideogram(cnvConfig);

                let lohConfig = {
                    organism: 'human',
                    container: '#loh-ideo',
                    chromosome: this.ncbiSummary.chromosome,
                    chrHeight: 500,
                    orientation: 'horizontal',
                    annotations: [{
                        name: this.gene,
                        chr: this.ncbiSummary.chromosome,
                        start: this.ncbiSummary.genomicinfo[0].chrstart,
                        stop: this.ncbiSummary.genomicinfo[0].chrstop
                    }]
                };
                let lohIdeogram = newIdeogram(lohConfig);

            },
            getCategories: function(sampleModelId) {
                if (sampleModelId === 'known-variants') {
                    return ['unknown', 'other', 'benign', 'path']
                } else if (sampleModelId === 'cosmic-variants') {
                    return ['other', 'low', 'modifier', 'moderate', 'high']
                }
            }
        },
        filters: {},

        computed: {
            sampleLabel: function () {
                let label = "";
                if (this.isBasicMode || this.isEduMode) {
                    label += "Variants for ";
                }
                if (this.sampleModel.displayName && this.sampleModel.displayName !== '') {
                    label += this.sampleModel.displayName;
                    if (this.sampleModel.selectedSample) {
                        label += ' (' + this.sampleModel.selectedSample + ')';
                    }
                } else {
                    if (this.sampleModel.selectedSample) {
                        label += this.sampleModel.selectedSample.toUpperCase();
                    }
                }
                return label;
            },
            depthVizHeight: function () {
                this.showDepthViz ? 0 : 60;
            },
            coverageDangerRegions: function () {
                let self = this;
                if (self.selectedTranscript.features) {
                    var regions = [];
                    self.selectedTranscript.features
                        .filter(function (feature) {
                            return feature.feature_type === 'CDS' || feature.feature_type === 'UTR';
                        })
                        .forEach(function (feature) {
                            if (feature.danger[self.sampleModel.getId()]) {
                                regions.push(feature)
                            }
                        });
                    return regions;
                } else {
                    return [];
                }
            },
            isKnownOrCosmicTrack: function () {
                let self = this;
                return self.sampleModel.id === 'known-variants' || self.sampleModel.id === 'cosmic-variants';
            },
            trackColor: function () {
                let self = this;

                let models = null;
                if (self.sampleModel.isTumor) {
                    models = self.sampleModel.getCohortModel().getOrderedTumorModels();
                } else {
                    models = self.sampleModel.getCohortModel().getOrderedNormalModel();
                }
                if (models) {
                    let orders = [];
                    models.forEach((model) => {
                        orders.push(model.order);
                    });
                    let colorIdx = orders.indexOf(self.sampleModel.order);
                    if (colorIdx >= 0) {
                        let color = self.sampleModel.getCohortModel().globalApp.utility.getTrackColor(colorIdx, self.sampleModel.isTumor);
                        return color;
                    } else {
                        return 'gray';
                    }
                } else {
                    return 'gray';
                }
            },
            displayVariantCount: function() {
                const self = this;
                let displayCts = false;
                if (self.sampleModel.id !== 'known-variants' && self.sampleModel.id !== 'cosmic-variants') {
                    displayCts = true;
                } else if (self.sampleModel.id === 'known-variants' && self.knownVariantsViz === 'variants') {
                    displayCts = true;
                } else if (self.sampleModel.id === 'cosmic-variants' && self.cosmicVariantsViz === 'variants') {
                    displayCts = true;
                }
                return displayCts;
            }
        },
        watch: {
            // TODO: do I need to put a watcher on loaded variants here
        },
        mounted: function () {
            this.id = this.sampleModel.id;
        },
        created: function () {
            this.depthVizYTickFormatFunc = this.depthVizYTickFormat ? this.depthVizYTickFormat : null;
        }
    }
</script>
