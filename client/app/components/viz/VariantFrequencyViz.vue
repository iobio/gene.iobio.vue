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
            height: {
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
                this.draw();
            }
        },
        methods: {
            draw: function () {
                let self = this;

                // Construct object
                self.varFreqChart = sankeyD3()
                    .width(self.width)
                    .height(self.height)
                    .linkList(self.afLinks)
                    .nodeList(self.afNodes)
                    .sortFunc(self.sortFunc)
                    .nodeIdFunc(self.nodeIdFunc)
                    .d3var(d3v5);

                // Draw chart
                self.varFreqChart();
            },
            /* Used to vertically align nodes in Sankey chart */
            sortFunc: function(nodeA, nodeB) {
                if (nodeA.bottomRange < nodeB.bottomRange) {
                    return -1;
                } else if (nodeA.bottomRange > nodeB.bottomRange) {
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