<style lang="sass">
    @import "../../../assets/sass/variables"


    #notes-input
        font-size: 12px

    #enter-notes-input
        .input-group--text-field.input-group--prepend-icon
            .input-group__prepend-icon
                padding-right: 0px
                justify-content: flex-start
                display: inline-block
                align-self: start
                font-size: 18px




    #show-notes-button
        font-family: 'Open sans'
        min-width: 20px
        margin: 0px
        padding: 0px
        height: auto
        font-size: 12px
        margin-top: 0px
        margin-left: 2px


        .btn__content
            padding: 0px
            margin: 0px
            color: white !important

            span
                padding-left: 3px
                padding-right: 3px
                display: inline-block
                word-break: break-word
                width: 90px
                white-space: normal !important
                word-wrap: break-word !important
                height: auto
                padding-top: 0px
                padding-bottom: 0px

            .material-icons
                font-size: 22px
                color: $text-color
                vertical-align: top
                color: $not-reviewed-color

                &.has-notes
                    color: $app-color

            .interpretation-label
                color: $text-color
                font-size: 14px
                padding-top: 3px

    #show-notes-button
        &.no-wrap

            .btn__content
                padding: 0px
                margin: 0px
                color: white !important

                span
                    width: initial

    #show-notes-button.show-notes-icon
        background-color: transparent !important

        .material-icons
            background-color: transparent !important

            &.has-notes
                color: $app-color

</style>

<template>
    <v-menu
            offset-y
            :close-on-content-click="false"
            :nudge-width="400"
            top
            v-model="showNotesMenu"
    >

        <v-btn id="show-notes-button"
               small
               :flat="showNotesIcon"
               :class="[{'no-wrap' : !wrap, 'show-notes-icon': showNotesIcon}, showNotesIcon ? '' : interpretation]"
               slot="activator"
               @mouseover="onMouseOver()"
               @mouseleave="onMouseLeave()"
               v-tooltip.top-center="{content: tooltipContent, show: showTooltipFlag, trigger: 'manual'}"
        >

        <span v-if="!showNotesIcon">
          <v-icon class="interpretation sig" v-if="interpretation == 'sig'">verified_user</v-icon>
          <v-icon class="interpretation unknown-sig" v-if="interpretation == 'unknown-sig'">help</v-icon>
          <v-icon class="interpretation not-sig" v-if="interpretation == 'not-sig'">thumb_down</v-icon>
          <v-icon class="interpretation poor-qual" v-if="interpretation == 'poor-qual'">trending_down</v-icon>
          <v-icon class="interpretation not-reviewed"  v-if="interpretation == 'not-reviewed'">visibility_off</v-icon>
          <span class="interpretation-label">{{ interpretationDisplay }} </span>
        </span>
            <v-icon class="has-notes" v-if="showNotesIcon && notes != null && notes.length > 0">
                comment
            </v-icon>
            <v-icon class="no-notes" v-if="showNotesIcon && (notes == null || notes.length == 0)">
                add_comment
            </v-icon>
        </v-btn>


        <v-card>


            <variant-interpretation
                    wrap="true"
                    :variant="variant"
                    :variantInterpretation="interpretation"
                    :showInterpretationLabel="true"
                    @apply-variant-interpretation="onApplyVariantInterpretation">
            </variant-interpretation>


            <div id="enter-notes-input">
                <v-text-field
                        id="notes-input"
                        multi-line
                        rows="5"
                        label="Notes"
                        v-model="notes"
                >
                </v-text-field>
            </div>
            <div>
                <v-btn style="float:right" @click="onCancel">
                    Cancel
                </v-btn>
                <v-btn style="float:right" @click="onApply">
                    Apply
                </v-btn>
            </div>


        </v-card>
    </v-menu>
</template>

<script>

    import VariantInterpretation from './VariantInterpretation.vue'

    export default {
        name: 'variant-notes-menu',
        components: {
            VariantInterpretation
        },
        props: {
            interpretationMap: null,
            variant: null,
            variantNotes: null,
            variantInterpretation: null,
            wrap: null,
            showNotesIcon: false
        },
        data () {
            return {
                showNotesMenu: null,

                notes: null,
                interpretation: null,

                showTooltipFlag: false,
                tooltipContent: null,

                variantInterpretationOrig: null


            }
        },
        watch: {
        },
        computed: {
            interpretationDisplay: function() {
                if (this.interpretation) {
                    return this.interpretationMap[this.interpretation];
                } else {
                    return this.interpretationMap['not-reviewed'];
                }
            }
        },
        methods: {
            onApply: function() {
                this.variant.notes = this.notes;
                this.variant.interpretation = this.interpretation;
                this.$emit("apply-variant-notes", this.variant);
                this.showNotesMenu = false;
            },
            onApplyVariantInterpretation: function() {
                this.interpretation = this.variant.interpretation;
                // We don't want to propogate this event because
                // the update of interpretation doesn't take effect
                // until user presses 'Apply' button
            },
            onCancel: function() {
                this.variant.interpretation = this.variantInterpretationOrig;
                this.showNotesMenu = false;
            },
            onMouseOver: function() {
                this.showTooltipFlag = true;
                this.tooltipContent = this.variant.notes && this.variant.notes.length > 0 ? this.variant.notes : "Click this button to enter notes for the variant."
            },
            onMouseLeave: function() {
                this.showTooltipFlag = false;
            },
            showTooltip: function(tooltip) {
                let self = this;
                self.showTooltipFlag = true;
                self.tooltipContent = tooltip;
            },
            hideTooltip: function() {
                let self = this;
                this.showTooltipFlag = false;
            },
            init: function() {
                let self = this;
                if (self.variant) {
                    self.notes = self.variant.notes;
                    self.interpretation = self.variant.interpretation  && self.variant.interpretation.length > 0 ? self.variant.interpretation : "not-reviewed";
                } else {
                    self.notes = "";
                    self.interpretation = 'not-reviewed';
                }
            }
        },
        created: function() {
        },
        mounted: function() {
            this.init();
        },
        updated: function() {
        },
        watch: {
            showNotesMenu: function() {
                let self = this;
                if (self.showNotesMenu) {
                    self.variantInterpretationOrig = self.variant.interpretation;
                    self.init();
                }
            },
            variantNotes: function() {
                this.init();
            },
            variantInterpretation: function() {
                this.init();
            }
        }
    }
</script>
