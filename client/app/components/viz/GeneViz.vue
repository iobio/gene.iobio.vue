<style lang="sass">
    .iobio-gene .axis
        line, path
            fill: none
            stroke: lightgrey
            shape-rendering: crispEdges
            stroke-width: 3px

    .iobio-gene .brush .extent
        stroke: #000
        fill-opacity: .125
        shape-rendering: crispEdges

</style>

<style type="text/css">


    .ibo-gene .cds, .ibo-gene .exon, .ibo-gene .utr {
        fill: rgba(167, 167, 167, 0.63);
        stroke: rgb(159, 159, 159);
    }

    #transcript-menu-item.ibo-gene .transcript.selected .utr,
    #transcript-menu-item.ibo-gene .transcript.selected .exon,
    #transcript-menu-item.ibo-gene .transcript.selected .cds {
        fill: #2196f3 !important;
        stroke: #2196f3 !important;
    }

    #transcript-menu-item.ibo-gene .transcript.current .utr,
    #transcript-menu-item.ibo-gene .transcript.current .exon,
    #transcript-menu-item.ibo-gene .transcript.current .cds {
        fill: rgb(119, 167, 19) !important;
        stroke: rgb(74, 130, 11) !important;
    }

    #transcript-menu-item.ibo-gene .utr:hover,
    #transcript-menu-item.ibo-gene .cds:hover,
    #transcript-menu-item.ibo-gene .exon:hover,
    #transcript-menu-item.ibo-gene .reference:hover {
        cursor: pointer;
    }

    #transcript-menu-item.ibo-gene .transcript.current .reference {
        stroke: rgb(0, 0, 0);
        stroke-width: 1.5px;
    }

    #transcript-menu-item.ibo-gene .transcript.selected .reference {

        stroke-width: 2px;
    }

    .ibo-gene .reference {
        stroke: rgb(150, 150, 150);
    }

    .ibo-gene .name {
        font-size: 13px;
        fill: rgb(120, 120, 120);
    }

    #transcript-menu-item.ibo-gene .transcript.selected .name {
        font-style: italic;
        font-size: 13px;
        fill: #2196f3 !important;
    }

    #transcript-menu-item.ibo-gene .transcript.current .name {
        font-weight: bold;
        font-style: italic;
        fill: black;
        font-size: 13px;
    }

    #transcript-menu-item.ibo-gene .transcript .name:hover {
        cursor: pointer;
    }

    #transcript-menu-item.ibo-gene .name {
        font-size: 14px;
        fill: rgb(120, 120, 120);
    }

    #transcript-menu-item.ibo-gene .type {
        font-size: 14px;
        fill: rgb(205, 71, 40);
        font-style: italic;
    }

    .ibo-gene .arrow {
        stroke: rgb(150, 150, 150);
        fill: none;
    }

    .ibo-gene .axis path, .ibo-gene .axis line {
        fill: none;
        stroke: lightgrey;
        shape-rendering: crispEdges;
    }

    .ibo-gene .x.axis text {
        font-size: 13px;
    }

    .ibo-gene .tooltip {
        position: absolute;
        text-align: center;
        z-index: 20;
        color: white;
        padding: 4px 6px 4px 6px;
        font: 11px arial;
        background: rgb(80, 80, 80);
        border: 0px;
        border-radius: 4px;
        pointer-events: none;
    }

    .transcript .selection-box {
        fill: transparent;
    }

    .brush .extent {
        stroke: #000;
        fill-opacity: 0.125;
        shape-rendering: crispEdges;
    }

    .resize {
        display: inline !important;
        fill: #7A7A7A;
        fill-opacity: 1;
        stroke: #7A7A7A;
        stroke-width: 3px;
    }

</style>

<style lang="sass">

    @import ../../../assets/sass/variables

    #gene-viz.ibo-gene
        .cds.danger
            fill: $danger-exon-color
            stroke: $danger-exon-border-color
        .utr.danger
            fill: $danger-exon-color
            stroke: $danger-exon-border-color
</style>

<template>
    <div id="gene-viz">

    </div>
</template>

<script>
    import geneD3 from '../../d3/Gene.d3.js'

    export default {
        name: 'gene-viz',
        props: {
            data: {},
            regionStart: {
                default: 0,
                type: Number
            },
            regionEnd: {
                default: 0,
                type: Number
            },
            height: {
                default: 100,
                type: Number
            },
            trackHeight: {
                default: 20,
                type: Number
            },
            cdsHeight: {
                default: 20,
                type: Number
            },
            margin: {
                type: Object,
                default: function () {
                    return {top: 10, bottom: 10, left: 10, right: 10}
                }
            },
            transcriptClass: {
                type: Function,
                default: function (d, i) {
                    if (d.isCanonical) {
                        return 'transcript current';
                    } else {
                        return 'transcript';
                    }
                }
            },
            featureClass: {
                type: Function,
                default: function (d, i) {
                    return d.feature_type.toLowerCase();
                }
            },
            showLabel: {
                type: Boolean,
                default: false
            },
            showXAxis: {
                type: Boolean,
                default: true
            },
            fixedWidth: {
                type: Number,
                default: 0
            },
            isZoomTrack: {
                type: Boolean,
                default: false
            },
            zoomSwitchOn: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                geneChart: {}
            }
        },
        created: function () {
        },
        mounted: function () {
            this.draw();
            this.update(false); // Don't want to show zoom brush on mount
        },
        methods: {
            draw: function () {
                const self = this;

                this.geneChart = geneD3()
                    .width(self.fixedWidth > 0 ? self.fixedWidth : this.width)
                    .widthPercent("100%")
                    .heightPercent("100%")
                    .margin(this.margin)
                    .showXAxis(this.showXAxis)
                    .drawBrush(self.isZoomTrack) // Controls drawing backing brush obj
                    .showBrush(false)            // Controls displaying brush
                    .trackHeight(this.trackHeight)
                    .cdsHeight(this.cdsHeight)
                    .showLabel(this.showLabel)
                    .transcriptClass(this.transcriptClass)
                    .featureClass(function (feature, i) {
                        return self.featureClass(feature, i);
                    })
                    .regionStart(this.regionStart)
                    .regionEnd(this.regionEnd)
                    .on("d3brush", function (brush) {
                        if (!brush.empty()) {
                            let regionStart = d3.round(brush.extent()[0]);
                            let regionEnd = d3.round(brush.extent()[1]);
                            self.$emit('region-zoom', regionStart, regionEnd);
                        } else {
                            // Only being hit once
                            self.$emit('region-zoom-reset');
                        }
                    })
                    .on("d3selected", function (d) {
                        self.$emit('transcript-selected', d);
                    })
                    .on("d3featuretooltip", function (featureObject, feature, lock) {
                        self.$emit("feature-selected", featureObject, feature, lock);
                    });
            },
            update: function (showZoomBrush) {
                const self = this;
                if (self.data && self.data.length > 0 && self.data[0] != null && Object.keys(self.data[0]).length > 0) {
                    this.geneChart.regionStart(this.regionStart);
                    this.geneChart.regionEnd(this.regionEnd);
                    this.geneChart.width(self.fixedWidth > 0 ? self.fixedWidth : this.$el.clientWidth);
                    if (this.geneChart.width() > 0) {
                        let selection = d3.select(this.$el).datum(self.data);
                        this.geneChart.showBrush(showZoomBrush);
                        this.geneChart(selection);
                    }
                }
            },
            toggleBrush: function (showBrush, container) {
                const self = this;
                self.geneChart.toggleBrush()(showBrush, container);
            },
            concatKeys: function (transcripts) {
                if (transcripts) {
                    return transcripts.map(function (tx) {
                        return tx && tx.transcript_id ? tx.transcript_id : '';
                    }).join(" ");
                } else {
                    return "";
                }
            }
        },
        watch: {
            data: function (newData, oldData) {
                let self = this;
                if ($(self.$el).find("svg").length === 0 || self.concatKeys(newData) != self.concatKeys(oldData)) {
                    this.update(false);
                }
            },
            regionStart: function () {
                const self = this;
                const showZoomBrush = self.isZoomTrack && self.zoomSwitchOn;
                self.update(showZoomBrush);
            }
        }
    }
</script>