<style lang="sass">
    @import "../../../assets/sass/variables"


    i.material-icons.interpretation.not-reviewed
        color: $not-reviewed-color !important
        font-size: 22px
        padding-top: 2px
    i.material-icons.interpretation.sig
        color: $significant-color !important
        font-size: 22px
        padding-top: 2px
    i.material-icons.interpretation.unknown-sig
        color: $unknown-significance-color !important
        font-size: 22px
        padding-top: 2px
    i.material-icons.interpretation.poor-qual
        color: $poor-qual-color !important
        font-size: 22px
        padding-top: 2px
    i.material-icons.interpretation.not-sig
        color: $not-significant-color !important
        font-size: 22px
        padding-top: 2px

    .interpretation-label
        padding-left: 5px

    #select-interpretation
        &.no-wrap
            .input-group__selections__comma
                width: initial


    #select-interpretation
        font-family: 'Open sans'
        margin: 0px
        padding: 0px
        width: 22px
        height: auto
        font-size: 12px
        margin-top: 0px

        &.show-interpretation-label
            width: initial

            .interpretation-label
                color: $text-color !important
                font-size: 14px

        .input-group__input
            min-height: 21px

        &.input-group--hide-details
            .input-group__details
                display: none


        .input-group__selections
            min-width: 22px

        .input-group__selections__comma
            font-size: 12px
            line-height: 13px
            text-align: center
            padding-left: 4px
            padding-right: 0px
            white-space: normal
            display: inline-block

        .input-group__append-icon
            line-height: 20px
            color: #818181
            display: none
            width: 20px
            padding-left: 0px
            padding-right: 1px
            color: $text-color !important


</style>

<template>

    <v-select
            id="select-interpretation"
            :items="interpretations"
            :class="interpretation + ' ' + (showInterpretationLabel ? 'show-interpretation-label' : '')"
            v-model="interpretation"
            :hide-details="true"
            single-line
    >


        <template slot="selection" slot-scope="data">
            <v-icon class="interpretation sig" v-if="data.item.value == 'sig'">verified_user</v-icon>
            <v-icon class="interpretation unknown-sig" v-if="data.item.value == 'unknown-sig'">help</v-icon>
            <v-icon class="interpretation not-sig" v-if="data.item.value == 'not-sig'">thumb_down</v-icon>
            <v-icon class="interpretation poor-qual" v-if="data.item.value == 'poor-qual'">trending_down</v-icon>
            <v-icon class="interpretation not-reviewed" v-if="data.item.value == 'not-reviewed'">visibility_off</v-icon>
            <span v-if="showInterpretationLabel" class="interpretation-label"> {{ data.item.text }} </span>
        </template>

        <template slot="item" slot-scope="data">
            <v-icon class="interpretation sig" v-if="data.item.value == 'sig'">verified_user</v-icon>
            <v-icon class="interpretation unknown-sig" v-if="data.item.value == 'unknown-sig'">help</v-icon>
            <v-icon class="interpretation not-sig" v-if="data.item.value == 'not-sig'">thumb_down</v-icon>
            <v-icon class="interpretation poor-qual" v-if="data.item.value == 'poor-qual'">trending_down</v-icon>
            <v-icon class="interpretation not-reviewed" v-if="data.item.value == 'not-reviewed'">visibility_off</v-icon>
            <span class="interpretation-label"> {{ data.item.text }} </span>

        </template>

    </v-select>

</template>

<script>



    export default {
        name: 'variant-interpretation',
        components: {

        },
        props: {
            interpretationMap: null,
            variant: null,
            variantInterpretation: null,
            showInterpretationLabel: null,
            wrap: null
        },
        data () {
            return {
                interpretation: null

            }
        },
        watch: {
        },
        computed: {

            interpretations: function() {
                let self = this;
                var theInterpretations = [];
                for (var key in self.interpretationMap) {
                    theInterpretations.push({ 'value': key, 'text': self.interpretationMap[key]});
                }
                return theInterpretations;
            },
            interpretationDisplay: function() {
                return this.interpretation ? this.interpretationMap[this.interpretation] : this.interpretationMap['not-reviewed'] ;
            }
        },
        methods: {
            onApply: function() {
                this.variant.interpretation = this.interpretation;
                this.$emit("apply-variant-interpretation", this.variant);
            },
            init: function() {
                let self = this;
                self.interpretation = self.variant.interpretation && self.variant.interpretation.length > 0 ? self.variant.interpretation : 'not-reviewed';
            }
        },
        created: function() {
        },
        mounted: function() {
            let self = this;
            self.init();
        },
        updated: function() {
        },
        watch: {
            interpretation: function(newInterpretation, oldInterpretation) {
                if (oldInterpretation != null && oldInterpretation.length > 0 && oldInterpretation != newInterpretation) {
                    this.onApply();
                }
            },
            variantInterpretation: function(newInterpretation, oldInterpretation) {
                this.init();
            },

        }
    }
</script>
