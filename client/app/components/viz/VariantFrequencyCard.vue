<style lang="sass">
    @import ../../../assets/sass/variables

</style>
<template>
    <v-card tile id="matrix-card" class="app-card">
        <div style="clear:both;width:100%;margin-top:-10px">
            <div id="var-freq-panel"  style="clear:both;min-height:30px"
                 class="fullview" aria-expanded="true">
                <div id="var-freq-chart" style="overflow-x: auto;">
                    <variant-frequency-viz id="var-freq-viz"
                        ref="varFreqVizRef"
                        :width="width"
                        :height="height"
                        :afNodes="afNodes"
                        :afLinks="afLinks">
                    </variant-frequency-viz>
                </div>
            </div>
        </div>

        <!--<div style="text-align: center;clear: both;">-->
            <!--<div class="loader featureMatrixLoader"-->
                 <!--v-bind:class="{hide: featureMatrixModel.inProgress-->
          <!--&& !featureMatrixModel.inProgress.loadingVariants-->
          <!--&& !featureMatrixModel.inProgress.rankingVariants}" style="display: inline-block;">-->
          <!--<span class="loader-label">-->
            <!--{{ featureMatrixModel.getProgressText() }}-->
          <!--</span>-->
                <!--<img src="../../../assets/images/wheel.gif">-->
            <!--</div>-->
        <!--</div>-->
        <!--<div  class="label label-warning level-edu" v-bind:class="{ hide: featureMatrixModel.warning.length == 0 }">-->
            <!--{{ featureMatrixModel.warning }}-->
        <!--</div>-->

    </v-card>
</template>

<script>
    import VariantFrequencyViz from "../viz/VariantFrequencyViz.vue"
    export default {
        name: "VariantFrequencyCard",
        components: {
            VariantFrequencyViz
        },
        props: {
            width: 0,
            afLinks: null,
            afNodes: null,
        },
        data() {
            return {
                height: 200,
            }
        }
    }
</script>