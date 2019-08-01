<style scoped lang="sass">
    /*@import ../../../assets/sass/variables*/
    .freq-viz
        padding-top: 10px

    .node rect
        cursor: move
        fill-opacity: .9
        shape-rendering: crispEdges


    .node text
        pointer-events: none
        text-shadow: 0 1px 0 #fff


    .link
        fill: none
        stroke: #000
        stroke-opacity: .2


    .link:hover
        stroke-opacity: .5

</style>

<template>
    <div :id="vizId" :class="'freq-viz'"></div>
</template>

<script>
    import sankeyD3 from '../../d3/Sankey.d3.js'
    export default {
        name: "VariantFrequencyViz",
        props: {
            width: {
                type: Number,
                default: 0
            },
            numVars: {
                type: Number,
                default: 0
            },
            afNodes: {
                type: Array,
                default: null
            },
            afLinks: {
                type: Array,
                default: null
            }
        },
        data() {
            return {
                vizId: 'var-freq-viz',
                varFreqChart: {}
            }
        },
        created: function () {
        },
        mounted: function () {
            this.draw();
        },
        watch: {
            afLinks: function() {
                const self = this;
                if (self.afLinks == null) {
                    self.clear();
                } else {
                    self.draw();
                }
            }
        },
        methods: {
            draw: function () {
                let self = this;

                // Construct object
                self.varFreqChart = sankeyD3(d3v5, self.vizId)
                    .width(self.width)
                    .linkList(self.afLinks)
                    .nodeList(self.afNodes)
                    .sortFunc(self.sortFunc)
                    .nodeIdFunc(self.nodeIdFunc)
                    .on('d3outsideclick', function () {
                        self.onLinkClick(null);
                    })
                    .on('d3linkclick', function (varObj) {
                        self.onLinkClick(varObj);
                    })
                    .on('d3nodeclick', function (varObj) {
                        self.onNodeClick(varObj);
                    })
                    .on('d3mouseover', function (varObj) {
                        self.onVariantHover(varObj);
                    })
                    .on('d3mouseout', function () {
                        self.onVariantHoverEnd();
                    });

                // Draw chart
                // TODO: provide some more intervals here for heights
                let height = self.numVars < 10 ? 300 : 425;
                self.varFreqChart(height);
            },
            clear: function() {
                d3v5.select("#var-freq-viz").selectAll('svg').remove();
            },
            onLinkClick: function (varObj) {
                let self = this;
                // TODO: can we repurpose tooltip code for this
                self.$emit("linkClick", varObj);
            },
            onNodeClick: function (varObj) {
                let self = this;
                // TODO: can we repurpose tooltip code for this
                self.$emit("linkClick", varObj);
            },
            // TODO: may not need these catchers out here
            onVariantHover: function (variantId) {
            },
            onVariantHoverEnd: function (variant) {
            },
            /* Used to vertically align nodes in Sankey chart.
             * Sorts nodes from highest AF to lowest AF. */
            sortFunc: function(nodeA, nodeB) {
                if (nodeA.bottomRange > nodeB.bottomRange) {
                    return -1;
                } else if (nodeA.bottomRange < nodeB.bottomRange) {
                    return 1;
                } else {
                    return 0;
                }
            },
            /* Used to match links to nodes */
            nodeIdFunc: function(node) {
                return node.bottomRange;
            }
        }
    }
</script>