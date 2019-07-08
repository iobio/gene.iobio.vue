<style>
    /*@import ../../../assets/sass/variables*/

    .node rect {
    cursor: move;
    fill-opacity: .9;
    shape-rendering: crispEdges;
    }

    .node text {
        pointer-events: none;
        text-shadow: 0 1px 0 #fff;
    }

    .link {
        fill: none;
        stroke: #000;
        stroke-opacity: .2;
    }

    .link:hover {
        stroke-opacity: .5;
    }
</style>

<template>
    <div id="var-freq-viz"></div>
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
            }
        },
        data() {
            return {
                varFreqChart: {}
            }
        },
        created: function () {
        },
        mounted: function () {
            this.draw();
        },
        methods: {
            draw: function () {
                let self = this;

                self.varFreqChart = sankeyD3()
                    .width(600)
                    .height(975)
                    .d3var(d3v5);

                // Draw chart
                var selection = d3.select(self.$el);
                self.varFreqChart();
            },
        }
    }
</script>