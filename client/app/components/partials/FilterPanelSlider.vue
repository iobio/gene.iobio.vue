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
                        <v-flex d-flex xs3>
                            <v-select class="slider-select"
                                      :items="dropDownOptions"
                                      v-model="currLogic"
                                      single-line
                                      color="appColor"
                                      :disabled="disableLogicDropdown">
                            </v-select>
                        </v-flex>
                        <v-flex d-flex xs9 class="slider-top-row">
                            <v-slider :min="logicObj.minValue" :max="logicObj.maxValue" v-model="logicObj.currVal" color="appColor" class="slider-bar" @input="onSliderChange">
                            </v-slider>
                        </v-flex>
                </v-layout>
                <v-layout :style="{'height': '20px', 'margin-top': '-5px'}">
                    <v-flex xs9>
                        <!--Spacing-->
                    </v-flex>
                    <v-flex xs3 class="slider-bottom-row">
                        <v-text-field v-model="logicObj.currVal" class="slider-bar-input" color="appColor" :suffix="logicObj.labelSuffix" type="number" @input="onSliderChange"></v-text-field>
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
            logicObj: {
              default: null,
              type: Object
            },
            annotationComplete: {
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
                disableLogicDropdown: false,
                currLogic: null,    // Note: have to use local prop and not model-backed one here because needs to be in dropDownOptions list
            }
        },
        watch: {
            currLogic: function(newVal, oldVal) {
                const self = this;
                if (newVal && oldVal && newVal.text !== oldVal.text) {
                    self.logicObj.active = true;
                    self.$emit('update-slider-logic', self.logicObj.name, newVal.text);
                } else if (newVal == null) {
                    self.logicObj.active = false;
                }
            }
        },
        methods: {
            onSliderChange: _.debounce(function() {
                const self = this;
                self.logicObj.active = self.logicObj.currVal > 0;
                self.$emit('filter-slider-changed')
            }, 500),
            clearLogic: function() {
                const self = this;
                self.currLogic = null;
            }
        },
        mounted: function() {
            const self = this;
            if (self.logicObj && self.logicObj.initLogic) {
                const matchingLogic = self.dropDownOptions.filter((option) => {
                    return option.text === self.logicObj.initLogic;
                });
                self.currLogic = matchingLogic[0];
            }
        }
    }
</script>