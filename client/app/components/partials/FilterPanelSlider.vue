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
        padding-top: 14px

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

</style>

<template>
    <v-layout row wrap class="filter-form mx-2" style="max-width:500px;">
        <v-flex xs12>
            <v-container fluid>
                <v-layout :style="{'height': '40px'}">
                        <v-flex d-flex xs2>
                            <v-select class="slider-select"
                                      :items="dropDownOptions"
                                      label=""
                                      v-model="filterLogic"
                                      single-line
                                      color="appColor"
                                      @change="checkApplyButtonState">
                            </v-select>
                        </v-flex>
                        <v-flex d-flex xs10 class="slider-top-row">
                            <v-slider :min="0" :max="100" v-model="cutoffValue" color="appColor" class="slider-bar">
                            </v-slider>
                        </v-flex>
                </v-layout>
                <v-layout :style="{'height': '15px'}">
                    <v-flex xs12 class="slider-bottom-row">
                        <p class="slider-bar-value">{{cutoffValue}}</p>
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
            filterName: null,
            parentFilterName: null,
            annotationComplete: false
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
                readyToApply: false,
                isRawPVal: false,
                filterButtonColor: '#d18e00'
            }
        },
        watch: {},
        methods: {
            clearFilters: function() {
                let self = this;
                self.filterLogic = null;
                self.cutoffValue = null;
                self.readyToApply = false;
                self.$emit('cutoff-filter-cleared', self.filterName, self.parentFilterName);
            },
            onApplyFilter: function() {
                let self = this;
                self.filterButtonColor = '#d18e00';     // Flip button color
                self.$emit('filter-applied', self.filterName, self.filterLogic.text, self.cutoffValue, self.parentFilterName);
            },
            checkApplyButtonState: function() {
                let self = this;

                let inputValid = false;
                if (self.isFrequencyField) {
                    inputValid = self.cutoffValue > 0 && self.cutoffValue < 100;
                } else if (self.isRawPVal) {
                    inputValid = self.cutoffValue > 0 && self.cutoffValue < 1;
                } else {
                    inputValid = self.cutoffValue != null;
                }
                self.readyToApply = self.filterLogic && inputValid;
                if (self.readyToApply) {
                    self.filterButtonColor = '#8BC34A';
                }
            }
        },
        computed: {
            isFrequencyField: function() {
                return true;
            },
            buttonTipText: function() {
                let self = this;
                if (self.readyToApply) {
                    return 'Click to apply';
                } else {
                    return 'Enter criteria';
                }
            }
        },
        created: function () {},
        mounted: function () {}
    }
</script>