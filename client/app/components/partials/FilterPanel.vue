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
                        v-for="category in categories[filterName]"
                        :ref="category.name + 'ExpansionRef'"
                        :key="category.name"
                        :value="category.open">
                    <div slot="header">
                        <v-avatar v-if="category.active" size="12px" color="cohortGold" style="margin-right: 10px"></v-avatar>
                        <v-avatar v-else-if="!category.active && (!isAnnotationCategory(category.name) || (isAnnotationCategory(category.name) && annotationComplete))" size="10px" color="white" style="margin-right: 12px"></v-avatar>
                        <span v-bind:hidden="!isAnnotationCategory(category.name) || annotationComplete" class="filter-loader">
                            <img src="../../../assets/images/wheel.gif">
                        </span>
                        <span class="filter-title">
                            {{ category.display }}
                        </span>
                    </div>
                    <v-card>
                        <filter-panel-checkbox
                                v-if="category.type==='checkbox'"
                                ref="filtCheckRef"
                                :parentFilterName="category.name"
                                :grandparentFilterName="filterName"
                                :annotationComplete="annotationComplete"
                                @filter-toggled="onFilterToggled">
                        </filter-panel-checkbox>
                        <filter-panel-cutoff
                                v-else-if="category.type==='cutoff'"
                                ref="filterCutoffRef"
                                :filterName="category.name"
                                :parentFilterName="filterName"
                                :annotationComplete="annotationComplete"
                                @filter-applied="onFilterApplied"
                                @cutoff-filter-cleared="onFilterCleared">
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
    export default {
        name: 'filter-panel',
        components: {
            FilterPanelCheckbox,
            FilterPanelCutoff
        },
        props: {
            filter: null,
            filterName: '',
            filterModel: null,
            idx: null,
            annotationComplete: false
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
                minGenotypeDepth: null,
                categories: {
                    'annotation': [
                        {name: 'impact', display: 'Impact', active: false, open: false, type: 'checkbox', cohortOnly: false},
                        {name: 'type', display: 'Type', active: false, open: false, type: 'checkbox', cohortOnly: false},
                        {name: 'zygosities', display: 'Zygosities', active: false, open: false, type: 'checkbox', cohortOnly: false},],
                    'enrichment': [
                        {name: 'pValue', display: 'p-val', active: false, open: false, type: 'cutoff', cohortOnly: true},
                        {name: 'adjPVal', display: '-log(p-val)', active: false, open: false, type: 'cutoff', cohortOnly: true}],
                    'frequencies': [
                        {name: 'g1000', display: '1000G', active: false, open: false, type: 'cutoff', cohortOnly: false},
                        {name: 'exac', display: 'ExAC', active: false, open: false, type: 'cutoff', cohortOnly: false},
                        {name: 'gnomad', display: 'gnomAD', active: false, open: false, type: 'cutoff', cohortOnly: false}],
                    'rawCounts': [ // Currently unused - may incorporate later
                        {name: 'rawCounts', display: 'Raw Counts', active: false, open: false, type: 'cutoff'}],
                    'samplePresence': [{name: 'samplePresence', display: 'Sample Presence', active: false, open: false, type: 'checkbox'}]
                }
            }
        },
        watch: {},
        methods: {
            onFilterToggled: function(filterName, filterState, parentFilterName, grandparentFilterName, parentFilterState, filterDisplayName) {
                let self = this;
                // Turn on indicator
                let filterObj = self.categories[grandparentFilterName].filter((cat) => {
                    return cat.name === parentFilterName;
                });
                let cohortOnly = false;
                if (filterObj.length > 0) {
                    filterObj[0].active = parentFilterState;
                    cohortOnly = filterObj[0].cohortOnly;
                }
                let grandparentFilterState = false;
                let parentFilters = self.categories[grandparentFilterName];
                parentFilters.forEach((filt) => {
                    grandparentFilterState |= filt.active;
                });
                // Format display name
                if (parentFilterName === 'impact') {
                    filterDisplayName = filterDisplayName.toLowerCase();
                    filterDisplayName = filterDisplayName.charAt(0).toUpperCase() + filterDisplayName.slice(1);
                    filterDisplayName += ' Impact';
                } else if (parentFilterName === 'type') {
                    if (filterDisplayName !== 'SNP' && filterDisplayName !== 'MNP') {
                        filterDisplayName = filterDisplayName.toLowerCase();
                        filterDisplayName = filterDisplayName.charAt(0).toUpperCase() + filterDisplayName.slice(1);
                    }
                    filterDisplayName += 's';
                } else if (parentFilterName === 'zygosities') {
                    if (filterName === 'hom') {
                        filterDisplayName = 'Homozygotes';
                    } else {
                        filterDisplayName = 'Heterozygotes';
                    }
                }
                self.$emit('filter-toggled', filterName, filterState, grandparentFilterName, grandparentFilterState, cohortOnly, filterDisplayName);
            },
            onFilterApplied: function(filterName, filterLogic, cutoffValue, grandparentFilterName) {
                let self = this;
                // Turn on indicator
                let filterObj = self.categories[grandparentFilterName].filter((cat) => {
                    return cat.name === filterName;
                });
                let cohortOnly = false;
                let displayName = '';
                if (filterObj.length > 0) {
                    filterObj[0].active = true;
                    cohortOnly = filterObj[0].cohortOnly;
                    displayName = filterObj[0].display;
                    if (grandparentFilterName === 'frequencies') {
                        displayName += ' Freq';
                    }
                }
                let grandparentFilterState = false;
                let parentFilters = self.categories[grandparentFilterName];
                parentFilters.forEach((filt) => {
                    grandparentFilterState |= filt.active;
                });
                self.$emit('filter-applied', filterName, filterLogic, cutoffValue, grandparentFilterName, grandparentFilterState, cohortOnly, displayName);
            },
            onFilterCleared: function(filterName, grandparentFilterName) {
                let self = this;
                // Turn on indicator
                let filterObj = self.categories[grandparentFilterName].filter((cat) => {
                    return cat.name === filterName;
                });
                let cohortOnly = false;
                let displayName = '';
                if (filterObj.length > 0) {
                    filterObj[0].active = false;
                    cohortOnly = filterObj[0].cohortOnly;
                    displayName = filterObj[0].display;
                }
                let grandparentFilterState = false;
                let parentFilters = self.categories[grandparentFilterName];
                parentFilters.forEach((filt) => {
                    grandparentFilterState |= filt.active;
                });
                self.$emit('cutoff-filter-cleared', filterName, grandparentFilterName, grandparentFilterState, cohortOnly, displayName);
            },
            clearFilters: function() {
                let self = this;
                (Object.values(self.categories)).forEach((catList) => {
                    catList.forEach((filt) => {
                        filt.active = false;
                    })
                });
                if (self.$refs.filtCheckRef) {
                    self.$refs.filtCheckRef.forEach((checkRef) => {
                        checkRef.clearFilters();
                    });
                }
            },
            isAnnotationCategory: function (currentCat) {
                // TODO: making all filters wait until annotation complete for now
                return true;
                // if (currentCat === 'impact' || currentCat === 'g1000' ||
                //     currentCat === 'exac' || currentCat === 'gnomad') {
                //     return true;
                // } else {
                //     return false;
                // }
            }
        },
        computed: {
        },
        created: function () {
        },
        mounted: function () {
        }
    }
</script>