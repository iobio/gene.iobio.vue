<!--SJG Aug2019; Adapted from gene.iobio and TDS Aug2018-->
<style lang="sass">
    @import ../../../assets/sass/variables
    .filter-form
        .slider-select
            padding-top: 0

            .input-group__input
                i
                    padding: 0

                .input-group__selections
                    margin-left: 8px

    .slider-top-row
        padding-top: 15px

        .slider-bar
            padding-left: 15px
            padding-top: 0
            padding-right: 0

    .slider-bottom-row
        height: 15px
        float: right
        text-align: right

        .slider-display
            padding-top: 0
            max-width: 35px
            height: 35px

            .input-group__input
                border-style: none

                input
                    text-align: right
                    font-size: 12px
                    border: none

        .slider-bar-value
            height: 15px
            margin-top: -5px
            color: $app-gray

        .slider-bar-input
            padding-top: 0
            padding-left: 15px

            .input-group__input
                margin-top: -5px

                input
                    font-size: 12px
                    text-align: center
                    color: $app-gray
                    padding-top: 8px
                span
                    font-size: 12px
                    color: $app-gray
                    padding-top: 8px

</style>

<template>
    <v-layout row wrap class="filter-form mx-2" style="max-width:500px;">
        <v-flex xs12>
            <v-container fluid>
                <v-layout :style="{'height': '40px'}">
                        <v-flex d-flex xs2>
                            <v-select class="slider-select"
                                      :items="dropDownOptions"
                                      v-model="filterLogic"
                                      single-line
                                      color="appColor"
                                      :disabled="disableLogicDropdown"
                                      @input="onSliderLogicChanged">
                            </v-select>
                        </v-flex>
                        <v-flex d-flex xs10 class="slider-top-row">
                            <v-slider :min="sliderMinValue" :max="sliderMaxValue" v-model="cutoffValue" color="appColor" class="slider-bar">
                            </v-slider>
                        </v-flex>
                </v-layout>
                <v-layout :style="{'height': '20px', 'margin-top': '-5px'}">
                    <v-flex xs9>
                        <!--Spacing-->
                    </v-flex>
                    <v-flex xs3 class="slider-bottom-row">
                        <v-text-field v-model="cutoffValue" class="slider-bar-input" color="appColor" :suffix="sliderDisplaySuffix" type="number"></v-text-field>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        name: 'filter-panel-slider',
        components: {},
        props: {
            filterName: {
                default: null,
                type: String
            },
            parentFilterName: {
                default: null,
                type: String
            },
            annotationComplete: {
                default: false,
                type: Boolean
            },
            sliderMinValue: {
                default: 0,
                type: Number
            },
            sliderMaxValue: {
                default: 100,
                type: Number
            },
            sliderDisplaySuffix: {
                default: '',
                type: String
            },
            initLogic: {
                default: null,
                type: String
            },
            initValue: {
                default: 0,
                type: Number
            },
            applyFilters: {
                default: false,
                type: Boolean
            }
        },
        data() {
            return {
                dropDownOptions: [
                    { text: '<' },
                    { text: '<=' },
                    { text: '=' },
                    { text: '>=' },
                    { text: '>' }
                ],
                filterLogic: null,
                cutoffValue: null,
                disableLogicDropdown: false,

                // List of filter names that require conversion b/w frequency and percentage
                filtersNeedAdjusting: {
                    'tumorAltFreq': true,
                    'normalAltFreq': true
                }
            }
        },
        watch: {
            cutoffValue: function(newVal, oldVal) {
                const self = this;
                if (newVal !== oldVal && oldVal != null) {
                    self.onSliderMoved();
                }
            },
            applyFilters: function() {
                // Used to initialize filters on app load after variants annotated
                const self = this;
                if (self.applyFilters === true) {
                    self.onSliderMoved();
                }
            }
        },
        methods: {
            clearFilters: function() {
                const self = this;
                self.filterLogic = null;
                self.cutoffValue = null;
                self.readyToApply = false;
                self.$emit('cutoff-filter-cleared', self.filterName, self.parentFilterName);
            },
            // TODO: add debounce here to get rid of lag
            onSliderMoved: function() {
                const self = this;
                self.$emit('filter-slider-changed', self.filterName, self.filterLogic.text, self.getAdjustedCutoff(self.cutoffValue, self.filterName), self.parentFilterName);
            },
            onSliderLogicChanged: function() {
                const self = this;
                self.$emit('filter-slider-changed', self.filterName, self.filterLogic.text, self.getAdjustedCutoff(self.cutoffValue, self.filterName), self.parentFilterName);
            },
            /* If we're dealing with a percentage, turn it back to a frequency. */
            getAdjustedCutoff: function(cutoffValue, filterName) {
                const self = this;
                if (self.filtersNeedAdjusting[filterName]) {
                    return cutoffValue / 100;
                } else {
                    return cutoffValue;
                }
            }
        },
        mounted: function() {
            const self = this;
            if (self.initLogic != null) {
                const matchingLogic = self.dropDownOptions.filter((option) => {
                    return option.text === self.initLogic;
                });
                self.filterLogic = matchingLogic[0];
            }

            if (self.initValue != null) {
                self.cutoffValue = self.initValue;
            }
        }
    }
</script>