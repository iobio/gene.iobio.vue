<!--Adapted from gene.iobio and TDS 17Aug2018-->

<style lang="sass">
    @import ../../../assets/sass/variables
    .filter-settings-form
        .filter-title
            font-size: 14px
            font-family: 'Open Sans', 'Quattrocento Sans', 'sans serif'
            vertical-align: top
            margin-left: 6px
            color: $text-color
        svg
            width: 22px
            height: 18px
        .remove-custom-filter
            margin: 0px
            float: right
            color: $text-color

    #filter-settings-icon
        font-size: 20px
        color: $app-color
</style>

<template>
    <v-flex xs12 style="padding-top: 10px">
        <v-card
                v-for="filter in filters"
                :ref="filter.name + 'ExpansionRef'"
                :key="filter.name"
                :value="filter.custom">
            <v-card-title class="filter-settings-form">
                <v-icon small style="padding-left: 5px; padding-right: 5px">
                    {{filter.icon}}
                </v-icon>
                {{ filter.display }}
            </v-card-title>
            <v-card-text><i>{{filter.description}}</i></v-card-text>
            <filter-panel
                    v-if="filter.name !== 'coverage'"
                    ref="filterSettingsRef"
                    :filterName="filter.name"
                    :filterModel="filterModel"
                    :filter="filter"
                    :annotationComplete="annotationComplete"
                    :somaticFilterSettings="somaticFilterSettings"
                    :qualityFilterSettings="qualityFilterSettings"
                    :applyFilters="applyFilters"
                    @filter-toggled="filterBoxToggled"
                    @filter-slider-changed="filterSliderChanged"
                    @filter-applied="filterCutoffApplied"
                    @cutoff-filter-cleared="filterCutoffCleared">
            </filter-panel>
        </v-card>
    </v-flex>
</template>


<script>
    import FilterIcon from '../partials/FilterIcon.vue'
    import FilterPanel from '../partials/FilterPanel.vue'
    import FilterSettings from '../partials/FilterSettings.vue'
    import FilterSettingsCoverage from '../partials/FilterSettingsCoverage.vue'

    export default {
        name: 'filter-panel-menu',
        components: {
            FilterIcon,
            FilterPanel,
            FilterSettings,
            FilterSettingsCoverage
        },
        props: {
            filterModel: null,
            showCoverageCutoffs: null,
            annotationComplete: false,
            somaticFilterSettings: null,
            qualityFilterSettings: null,
            applyFilters: false
        },
        data() {
            return {
                showMenu: true,
                filters: [
                    {
                        name: 'annotation',
                        display: 'ANNOTATION FILTERS',
                        active: false,
                        custom: false,
                        description: 'Filter by variant effect, impact, or type',
                        icon: 'category'
                    },
                    {
                        name: 'somatic',
                        display: 'SOMATIC FILTERS',
                        active: false,
                        custom: false,
                        description: 'Select a threshold for allele frequencies and observation counts by which to identify somatic variants',
                        icon: 'flash_on'
                    },
                    {
                        name: 'quality',
                        display: 'QUALITY FILTERS',
                        active: false,
                        custom: false,
                        description: 'Filter variants by observation counts',
                        icon: 'star'
                    },
                    {
                        name: 'frequencies',
                        display: 'FREQUENCY FILTERS',
                        active: false,
                        custom: false,
                        description: 'Filter by variant frequency within population databases',
                        icon: 'people_outline'
                    }
                ]
            }
        },
        watch: {},
        methods: {
            // TODO: incorporate reset to default params from cohort
            // TODO: incorporate gold or other highlight color for filtering

            filterBoxToggled: function (filterName, filterState, parentFilterName, parentFilterState, tumorOnlyFilter, filterDisplayName) {
                let self = this;
                let filterObj = self.filters.filter((filt) => {
                    return filt.name === parentFilterName;
                });
                if (filterObj.length > 0) {
                    filterObj[0].active = parentFilterState;
                }
                self.$emit('filter-box-toggled', filterName, filterState, tumorOnlyFilter, parentFilterName, parentFilterState, filterDisplayName);
            },
            filterSliderChanged: function(filterName, sliderLogic, sliderValue, parentFilterName, parentFilterState, tumorOnlyFilter, filterDisplayName) {
                let self = this;
                let filterObj = self.filters.filter((filt) => {
                    return filt.name === parentFilterName;
                });
                if (filterObj.length > 0) {
                    filterObj[0].active = parentFilterName;
                }
                self.$emit('filter-slider-moved', filterName, sliderLogic, sliderValue, tumorOnlyFilter, parentFilterName, parentFilterState, filterDisplayName);
            },
            filterCutoffApplied: function (filterName, filterLogic, cutoffValue, currParentFiltName, currParFilterState, tumorOnlyFilter, filterDisplayName) {
                let self = this;
                let filterObj = self.filters.filter((filt) => {
                    return filt.name === currParentFiltName;
                });
                if (filterObj.length > 0) {
                    filterObj[0].active = currParentFiltName;
                }
                self.$emit('filter-cutoff-applied', filterName, filterLogic, cutoffValue, tumorOnlyFilter, currParentFiltName, currParFilterState, filterDisplayName);
            },
            filterCutoffCleared: function (filterName, currParentFiltName, currParFilterState, tumorOnlyFilter, filterDisplayName) {
                let self = this;
                let filterObj = self.filters.filter((filt) => {
                    return filt.name === currParentFiltName;
                });
                if (filterObj.length > 0) {
                    filterObj[0].active = currParFilterState;
                }
                self.$emit('filter-cutoff-cleared', filterName, tumorOnlyFilter, currParentFiltName, currParFilterState, filterDisplayName);
            },
            clearFilters: function () {
                let self = this;
                self.filters.forEach((filter) => {
                    filter.active = false;
                });
                if (self.$refs.filterSettingsRef) {
                    self.$refs.filterSettingsRef.forEach((filtRef) => {
                        filtRef.clearFilters();
                    });
                }
            }
        },
        computed: {},
        created: function () {
        },
        mounted: function () {
        }
    }
</script>
