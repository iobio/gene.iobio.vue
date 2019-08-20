<style lang="sass">
    @import ../../../assets/sass/variables

    #feature-matrix
        rect.cellbox
            fill: white
            stroke: $cell-border-color
            stroke-width: 1px

        .col
            &.danger
                rect.cellbox
                    fill: rgba(255, 236, 179, 0.54)

        .colhdr text
            font-size: 11px
            pointer-events: none

        .colhdr text.long-label
            transform: translate(6px, 0) rotate(-45deg)
            font-weight: 600

        rect.cellbox:hover
            cursor: pointer
            font-weight: bold

        rect.colbox
            fill: none
            opacity: 0
            pointer-events: none

            &.current
                stroke: $current-frame-color !important
                stroke-width: 1.5px !important
                opacity: 1
                pointer-events: none
                outline-offset: -2px

            &.highlight
                stroke: $current-frame-color !important
                stroke-width: 1.5px !important
                opacity: 1
                pointer-events: none
                outline-offset: -2px

        .col.active

            rect.colbox
                stroke: $current-frame-color
                stroke-width: 1.5px
                opacity: 1

        text
            font-size: 12px
            fill: rgb(120, 120, 120)
            pointer-events: none

            &.clickable
                text-decoration: underline
                fill: $app-color !important

                &:hover
                    fill: $current-color !important

        .axis .tick text.current
            font-weight: bold !important
            fill: black !important

        .y.axis .tick
            .up #arrow-up, .down #arrow-down
                opacity: 0

    #feature-matrix
        #feature-matrix-viz.basic
            .col
                &.flagged
                    rect.colbox
                        width: 157px

    #feature-matrix

        &.shift-rows

            .y.axis .tick
                .up #arrow-up, .down #arrow-down
                    fill: #E0E0E0
                    stroke: #ABABAB
                    stroke-width: .5px
                    opacity: 1

                text
                    &:hover, &.current, &.active
                        font-weight: bold
                        fill: $current-color

                .up #arrow-up:hover, .down #arrow-down:hover
                    cursor: pointer
                    fill: $current-color

                pointer-events: all


</style>


<template>
    <div :id="name">

    </div>
</template>

<script>

    import featureMatrixD3 from '../../d3/FeatureMatrix.d3.js'

    export default {
        name: 'feature-matrix-viz',
        props: {
            data: {
                type: Array,
                default: function () {
                    return [];
                }
            },
            matrixRows: {
                type: Array,
                default: function () {
                    return [];
                }
            },
            width: {
                type: Number,
                default: 0
            },
            height: {
                type: Number,
                default: 0
            },
            margin: {
                type: Object,
                default: {}
            },
            cellSize: {
                type: Number,
                default: 0
            },
            cellWidth: {
                type: Number,
                default: 0
            },
            rowLabelWidth: {
                type: Number,
                default: 0
            },
            cellHeights: {
                type: Array,
                default: function () {
                    return [];
                }
            },
            columnLabelHeight: {
                type: Number,
                default: 0
            },
            columnLabel: {
                type: Function,
                default: function (d, i) {
                    return "";
                }
            },
            columnLabelClass: {
                type: Function,
                default: function (d, i) {
                    return "";
                }
            },
            columnLabelSymbol: {
                type: Function,
                default: function (d, i) {
                    return "";
                }
            },
            adjustTooltipCoordinates: {
                type: Function,
                default: function (variant) {
                    return;
                }
            },
        },
        data() {
            return {
                name: 'feature-matrix-viz',
                featureMatrixChart: null
            }
        },
        created: function () {
        },
        mounted: function () {
            this.draw();
        },
        methods: {
            draw: function () {
                var self = this;

                this.featureMatrixChart = featureMatrixD3()
                    .margin(this.margin)
                    .matrixRows(this.matrixRows)
                    .cellSize(this.cellSize)
                    .cellWidth(this.cellWidth)
                    .cellHeights(this.cellHeights)
                    .columnLabelHeight(this.columnLabelHeight)
                    .columnLabel(this.columnLabel)
                    .columnLabelClass(this.columnLabelClass)
                    .columnLabelSymbol(this.columnLabelSymbol)
                    .rowLabelWidth(this.rowLabelWidth)
                    .adjustTooltipCoordinates(this.adjustTooltipCoordinates)
                    .on('d3click', function (variant) {
                        self.$emit("variantClick", variant);
                    })
                    .on('d3mouseover', function (variant) {
                        self.$emit("variantHover", variant);
                    })
                    .on('d3mouseout', function () {
                        self.$emit("variantHoverEnd");
                    })
                    .on('d3rowup', function (i) {
                        self.$emit("featureMatrixRowUp", i);
                    })
                    .on('d3rowdown', function (i) {
                        self.$emit("featureMatrixRowDown", i);
                    });
                this.setFeatureMatrixChart();
            },
            update: function () {
                const self = this;

                let selection = null;
                if (self.data && self.data.length > 0) {
                    selection = d3.select(self.$el).data([self.data]);
                    self.featureMatrixChart(selection, {showColumnLabels: true, simpleColumnLabels: true});
                } else {
                    // clear matrix if data is empty
                    // TODO: why is old data still lingering here...
                    d3.select('#' + self.name).selectAll('svg').remove();
                    // selection = d3.select(self.$el).data([]);
                    // self.featureMatrixChart(selection, {showColumnLabels: true, simpleColumnLabels: true});
                }
            },
            setFeatureMatrixChart: function () {
                this.$emit('updateFeatureMatrixChart', this.featureMatrixChart);
            },
            selectVariant: function (variant, clazz) {
                this.featureMatrixChart.selectVariant()(variant, clazz);
            }
        },
        watch: {
            data: function () {
                this.update();
            }
        }
    }
</script>