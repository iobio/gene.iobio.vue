<style lang="sass">
    @import ../../../assets/sass/variables

    #known-variants-toolbar
        display: inline-block
        padding-top: 0px
        margin-left: 20px
        margin-top: -6px

        .input-group.radio
            margin-top: 0px
            margin-bottom: 0px

        .radio label
            line-height: 20px
            left: 24px
            font-size: 12px

        .input-group.radio-group
            padding-top: 0px

        .input-group__selections__comma
            font-size: 12px

        .input-group--select
            .input-group__input
                margin-top: 10px

        .input-group--text-field
            label
                font-size: 12px
                top: 5px

        .input-group--text-field.input-group--dirty.input-group--select
            label
                top: 18px
                -webkit-transform: translate(0, -20px) scale(0.75)
                transform: translate(0, -20px) scale(0.75)

        .input-group--text-field.input-group--dirty:not(.input-group--textarea)
            label
                top: 18px
                -webkit-transform: translate(0, -20px) scale(0.75)
                transform: translate(0, -20px) scale(0.75)

        text
            color: $text-color
            fill: $text-color
            font-size: 12px

        svg.known-variants-clinvar
            margin-right: 10px

    #select-known-variants-filter-box
        min-width: 200px
        max-width: 500px
        display: inline-block
        margin-left: 10px
        float: left

        .selectize-input
            input
                width: 120px !important

                &::-webkit-input-placeholder
                    font-size: 12px !important

                &::-moz-placeholder
                    font-size: 12px !important

                &input:-moz-placeholder
                    font-size: 12px !important

            &.has-items
                input
                    width: 4px !important

        .selectize-control.multi
            .selectize-input.has-items
                padding: 3px 8px 0px
</style>

<template>
    <div id="known-variants-toolbar">
        <div style="width:285px;padding-top:10px;margin-top:0px;margin-right:10px;float:left">
            <v-radio-group v-model="viz" row>
                <v-radio v-if="id != 'cosmic-variants'" label="Variants" value="variants"></v-radio>
                <v-radio label="Counts" value="histo"></v-radio>
                <v-radio style="min-width: 120px" label="Counts in Exons" value="histoExon"></v-radio>
            </v-radio-group>
        </div>


        <div id="clinvar-filter-box" style="margin-left:10px;width:400px;float:left"
             v-if="viz === 'variants'">
            <v-select
                    :label="filterLabel"
                    v-bind:items="categories"
                    v-model="selectedCategories"
                    multiple
            >
            </v-select>
        </div>

    </div>
</template>

<script>

    export default {
        name: 'known-variants-toolbar',
        components: {},
        props: {
            id: null,
            annotationType: null
        },
        data() {
            return {
                VARIANT_DISPLAY_THRESHOLD: 300,
                viz: null,
                clinvarCategories: [
                    {'key': 'clinvar', 'selected': true, value: 'clinvar_path', text: 'Pathogenic'},
                    {'key': 'clinvar', 'selected': true, value: 'clinvar_lpath', text: 'Likely pathogenic'},
                    {'key': 'clinvar', 'selected': true, value: 'clinvar_uc', text: 'Uncertain significance'},
                    {'key': 'clinvar', 'selected': true, value: 'clinvar_cd', text: 'Conflicting data'},
                    {'key': 'clinvar', 'selected': false, value: 'clinvar_other', text: 'Other'},
                    {'key': 'clinvar', 'selected': false, value: 'clinvar_benign', text: 'Benign'},
                    {'key': 'clinvar', 'selected': false, value: 'clinvar_lbenign', text: 'Likely benign'}
                ],
                vepCategories: [
                    {'key': 'vepImpact', 'selected': true, value: 'HIGH', text: 'High'},
                    {'key': 'vepImpact', 'selected': true, value: 'MODERATE', text: 'Moderate'},
                    {'key': 'vepImpact', 'selected': true, value: 'MODIFIER', text: 'Modifier'},
                    {'key': 'vepImpact', 'selected': true, value: 'LOW', text: 'Low'},
                    {'key': 'vepImpact', 'selected': true, value: 'UNKNOWN', text: 'Unknown'}
                ],
                categories: [],
                selectedClinvarCategories: ['clinvar_path', 'clinvar_lpath'],
                selectedVepCategories: ['HIGH', 'MODERATE', 'LOW'],
                selectedCategories: [],
                filterLabel: ''
            }
        },
        watch: {
            viz: function () {
                this.$emit("variantsVizChange", this.viz, this.id);
            },
            selectedCategories: function () {
                this.$emit("variantsFilterChange", this.selectedCategories, this.id);
            }
        },
        methods: {},
        mounted: function () {
            // Set filtering
            if (this.annotationType == 'vep') {
                this.categories = this.vepCategories;
                this.selectedCategories = this.selectedVepCategories;
                this.filterLabel = 'Filter by VEP impact...';
            } else {
                this.categories = this.clinvarCategories;
                this.selectedCategories = this.selectedClinvarCategories;
                this.filterLabel = 'Filter by clinical significance...';
            }

            // Set type of display
            if (this.id == 'cosmic-variants') {
                this.viz = 'histo';
            } else {
                this.viz = 'variants';
            }
            this.$emit("variantsFilterChange", this.selectedCategories, this.id);
        }
    }

</script>