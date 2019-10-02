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
                fill: $text-color
                font-size: 12px

        .somatic-variant
            font-size: 15px
            color: $somatic-variant-color
            vertical-align: top

        .legend-text
            color: $text-color
            font-size: 12px
            cursor: auto
            vertical-align: top

        .legend-label
            font-size: 14px
            font-weight: 500
            color: $text-color
            margin-bottom: 5px
            cursor: auto
            line-height: 18px

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
    <div id="legend">
        <div style="display:flex;flex-wrap:wrap;justify-content:flex-start">
            <div v-if="isBasicMode" style="text-align:left;margin-right:10px">
                <div class="legend-label" style="width:130px">Exon (coding region)</div>
                <svg id="exon" class="exon-symbol legend-element pl-4" width="130" height="30">
                    <rect class="legend-symbol exon" rx="1" ry="1" x="25" width="9" y="4" height="24">
                    </rect>
                    <line x1="0" x2="60" y1="17" y2="17" style="stroke: #b0b0b0;stroke-width: 1.5px;"></line>
                </svg>
            </div>

            <div style="text-align:left;width:100px;margin-right:10px;margin-bottom:15px">
                <div class="legend-label">Variant Type</div>

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
                        width="14"
                        height="14"
                        label="Deletion">
                </legend-icon>

                <legend-icon
                        icon="impact"
                        type="ins"
                        level="none"
                        width="14"
                        height="14"
                        label="Insertion">
                </legend-icon>

                <legend-icon
                        icon="impact"
                        type="complex"
                        level="none"
                        width="14"
                        height="14"
                        label="Complex">
                </legend-icon>

            </div>

            <div style="text-align:left;width:100px;margin-right:10px;margin-bottom:15px">
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


            <div class="clinvar-legend" style="width:160px;margin-right:10px;margin-bottom:15px">
                <div class="legend-label">Clinvar</div>

                <legend-icon
                        icon="clinvar"
                        width="12"
                        height="12"
                        level="high"
                        wrapLabel="true"
                        wrapWidth="100"
                        label="Pathogenic">
                </legend-icon>

                <legend-icon
                        icon="clinvar"
                        width="12"
                        height="12"
                        wrapLabel="true"
                        wrapWidth="100"
                        level="likely-high"
                        label="Likely pathogenic">
                </legend-icon>

                <legend-icon v-if="!isBasicMode"
                             icon="clinvar"
                             width="12"
                             height="12"
                             wrapLabel="true"
                             wrapWidth="130"
                             level="unknown-significance"
                             label="Unknown significance">
                </legend-icon>

                <legend-icon v-if="!isBasicMode"
                             icon="clinvar"
                             width="12"
                             height="12"
                             wrapLabel="true"
                             wrapWidth="100"
                             level="conflicting"
                             label="Conflicting data">
                </legend-icon>

                <legend-icon v-if="!isBasicMode"
                             icon="clinvar"
                             width="12"
                             height="12"
                             wrapLabel="true"
                             wrapWidth="100"
                             level="other"
                             label="Other">
                </legend-icon>

                <legend-icon v-if="!isBasicMode"
                             icon="clinvar"
                             width="12"
                             wrapLabel="true"
                             wrapWidth="100"
                             height="12"
                             level="low"
                             label="Benign">
                </legend-icon>

                <legend-icon v-if="!isBasicMode"
                             icon="clinvar"
                             width="12"
                             height="12"
                             wrapLabel="true"
                             wrapWidth="100"
                             level="likely-low"
                             label="Likely benign">
                </legend-icon>
            </div>

            <div v-if="!isBasicMode" style="width:120px;margin-right:10px;">
                <div class="legend-label">Somatic Status</div>

                <legend-icon
                        icon="somatic-variant"
                        label="Somatic"
                        wrapLabel="true">
                </legend-icon>
                <legend-icon
                        icon="undetermined"
                        label="Undetermined"
                        wrapLabel="true">
                </legend-icon>
            </div>

            <div v-if="!isBasicMode" style="width:200px;margin-right:0px;">
                <div class="legend-label">Coverage</div>
                <legend-icon
                        icon="coverage"
                        width="13"
                        height="13"
                        level="high"
                        wrapLabel="true"
                        wrapWidth="130"
                        label="Low exon coverage">
                </legend-icon>
            </div>

            <div v-if="!isBasicMode" style="width:200px; margin-right: 10px; padding-top: 20px">
                <div class="legend-label">Allele Frequency Intervals</div>
                <svg id="heat-map-legend" style="height: 50px"></svg>
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
        data() {
            return {}
        },
        watch: {},
        methods: {},
        mounted: function () {
            // Build color scale - this must be identical to legend in feature matrix d3
            let colors = ["#f1eef6","#bdc9e1","#74a9cf","#2b8cbe", "#045a8d"];
            var colorScale = d3.scale.quantile()
                .domain([0, 100])
                .range(colors);

            let cellSize = 20;

            // Draw color scale legend (sourced from http://bl.ocks.org/tjdecke/5558084)
            var legend = d3.select('#heat-map-legend').selectAll(".legend")
                .data([0].concat(colorScale.quantiles()), function(d) { return d; });

            legend.enter().append("g")
                .attr("class", "legend");

            let legendCellScale = 2;
            legend.append("rect")
                .attr("x", function(d, i) { return (cellSize * legendCellScale * i); })
                .attr("y", 0)
                .attr("width", cellSize * legendCellScale)
                .attr("height", cellSize)
                .style("fill", function(d, i) { return colors[i]; });

            legend.append("text")
                .text(function(d, i) { return '≥ ' + Math.round(100/colors.length * i) + '%'; })
                .style('font-size', '12px')
                .attr("x", function(d, i) { return (cellSize * legendCellScale * i); })
                .attr("y", cellSize + 10);

            legend.exit().remove();
        }
    }

</script>