<style lang="sass">
    @import ../../../assets/sass/variables
</style>

<template>
    <div class="var-freq-viz"></div>
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

                // Import data first
                d3.json("https://gist.githubusercontent.com/mbostock/ca9a0bb7ba204d12974bca90acc507c0/raw/398136b7db83d7d7fd89181b080924eb76041692/energy.json", (error, data) => {
                    if (error) {
                        console.log("Problem reading in data file for sankey chart: " + error);
                    } else {
                        // Set object
                        self.varFreqChart = sankeyD3()
                            .width(600)
                            .height(975)
                            .d3var(d3v5);

                        // Draw chart
                        var selection = d3.select(self.$el);
                        self.varFreqChart(selection, data);
                    }
                });
            },
        }
    }
</script>