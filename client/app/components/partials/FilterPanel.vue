<!--Adapted from gene.iobio and TDS Aug2018, prev FilterSettings.vue in Cohort-->
<style lang="sass">
    .filter-form
        .input-group
            label
                font-size: 13px
        .filter-loader
            padding-top: 4px
            padding-right: 7px
            max-width: 25px
            margin: 0 !important
        img
            width: 18px !important
</style>

<template>
    <v-layout row wrap class="filter-form px-2" style="max-width:500px;">
        <v-flex id="name" xs12 class="mb-3">
            <v-expansion-panel expand>
                <v-expansion-panel-content
                        v-for="filter in filterModel.filters[filterName]"
                        :ref="filter.name + 'ExpansionRef'"
                        :key="filter.name"
                        :value="filter.open">
                    <div slot="header">
                        <v-avatar v-if="filter.active" size="12px" color="appHighlight" style="margin-right: 10px"></v-avatar>
                        <v-avatar v-else-if="!filter.active || !annotationComplete" size="10px" color="white" style="margin-right: 12px"></v-avatar>
                        <span v-bind:hidden="annotationComplete" class="filter-loader">
                            <img src="../../../assets/images/wheel.gif">
                        </span>
                        <span class="filter-title">
                            {{ filter.display }}
                        </span>
                    </div>
                    <v-card>
                        <filter-panel-checkbox
                                v-if="filter.type==='checkbox'"
                                ref="filtCheckRef"
                                :parentFilterName="filter.name"
                                :grandparentFilterName="filterName"
                                :annotationComplete="annotationComplete"
                                :checkboxLists="filterModel.checkboxLists"
                                @filter-toggled="onFilterChange">
                        </filter-panel-checkbox>
                        <filter-panel-slider
                                v-if="filter.type==='slider'"
                                ref="filtSliderRef"
                                :logicObj="filter"
                                :annotationComplete="annotationComplete"
                                :applyFilters="applyFilters"
                                @update-slider-logic="onSliderLogicChange"
                                @filter-slider-changed="onFilterChange">
                        </filter-panel-slider>
                        <filter-panel-cutoff
                                v-else-if="filter.type==='cutoff'"
                                ref="filterCutoffRef"
                                :filterName="filter.name"
                                :parentFilterName="filterName"
                                :annotationComplete="annotationComplete"
                                @filter-applied="onFilterChange"
                                @cutoff-filter-cleared="onFilterChange">
                        </filter-panel-cutoff>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-flex>
    </v-layout>
</template>

<script>
    import FilterPanelCheckbox from '../partials/FilterPanelCheckbox.vue'
    import FilterPanelCutoff from '../partials/FilterPanelCutoff.vue'
    import FilterPanelSlider from '../partials/FilterPanelSlider.vue'
    export default {
        name: 'filter-panel',
        components: {
            FilterPanelCheckbox,
            FilterPanelCutoff,
            FilterPanelSlider
        },
        props: {
            filter: null,
            filterName: '',
            filterModel: null,
            idx: null,
            annotationComplete: false,
            applyFilters: false
        },
        data() {
            return {
                theFilter: null,
                name: null,
                maxAf: null,
                selectedClinvarCategories: null,
                selectedImpacts: null,
                selectedZygosity: null,
                selectedInheritanceModes: null,
                selectedConsequences: null,
                minGenotypeDepth: null
            }
        },
        methods: {
            // TODO: cleanup

            onSliderLogicChange: function(filterName, newLogic) {
                const self = this;
                self.filterModel.updateFilterLogic(filterName, newLogic);
            },
            onFilterChange: function() {
                const self = this;
                self.$emit('filter-change');
                // self.getAndEmit('checkbox-toggle', parentFilterName, parentFilterState, grandparentFilterName, null, null);
            },
            // onSliderFilterChanged: function(filterName, filterLogic, cutoffValue, grandparentFilterName) {
            //     const self = this;
            //     self.getAndEmit('slider-change', filterName, (filterLogic != null), grandparentFilterName, filterLogic, cutoffValue);
            // },
            // onFilterApplied: function(filterName, filterLogic, cutoffValue, grandparentFilterName) {
            //     const self = this;
            //     self.getAndEmit('cutoff-applied', filterName, true, grandparentFilterName, filterLogic, cutoffValue);
            // },
            // onFilterCleared: function(filterName, grandparentFilterName) {
            //     const self = this;
            //     self.getAndEmit('cutoff-clear', filterName, false, grandparentFilterName, null, null);
            // },
            // clearFilters: function() {
            //     const self = this;
            //     (Object.values(self.filterModel.filters)).forEach((catList) => {
            //         catList.forEach((filt) => {
            //             filt.active = false;
            //         })
            //     });
            //     if (self.$refs.filtCheckRef) {
            //         self.$refs.filtCheckRef.forEach((checkRef) => {
            //             checkRef.clearFilters();
            //         });
            //     }
            // },
            // getAndEmit: function(filterType, filterName, filterState, parentFilterName, filterLogic, cutoffValue) {
            //     const self = this;
            //
            //     // Update active state in model
            //     self.filterModel.setFilterState(parentFilterName, filterName, filterState);
            //
            //     // Set parent state
            //     let parentFilterState = false;
            //     let parentFilters = self.filterModel.filters[parentFilterName];
            //     parentFilters.forEach((filt) => {
            //         parentFilterState |= filt.active;
            //         parentFilterState = parentFilterState === 1;    // TODO: make sure this works with not just slider vals
            //     });
            //
            //     // Compose object and emit
            //     let evtObj = {
            //         filterType: filterType,
            //         filterName: filterName,
            //         filterState: filterState,
            //         categoryName: parentFilterName,
            //         categoryState: parentFilterState,
            //         filterLogic: filterLogic,
            //         cutoffValue: cutoffValue
            //     };
            //     self.$emit('filter-change', evtObj);
            // }

        }
    }
</script>