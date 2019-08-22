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
                        <v-avatar v-if="category.active" size="12px" color="appHighlight" style="margin-right: 10px"></v-avatar>
                        <v-avatar v-else-if="!category.active || !annotationComplete" size="10px" color="white" style="margin-right: 12px"></v-avatar>
                        <span v-bind:hidden="annotationComplete" class="filter-loader">
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
                        <filter-panel-slider
                                v-if="category.type==='slider'"
                                ref="filtSliderRef"
                                :filterName="category.name"
                                :parentFilterName="filterName"
                                :annotationComplete="annotationComplete"
                                :sliderMinValue="category.minValue"
                                :sliderMaxValue="category.maxValue"
                                :sliderDisplaySuffix="category.labelSuffix"
                                :initLogic="category.initLogic"
                                :initValue="category.initVal"
                                :applyFilters="applyFilters"
                                @filter-slider-changed="onSliderFilterChanged">
                        </filter-panel-slider>
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
            somaticFilterSettings: null,
            qualityFilterSettings: null,
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
                minGenotypeDepth: null,
                categories: {
                    // Note: if filter names match variant object field names, don't have to manually add filter to getVarValue in Variant.d3 class
                    'annotation': [
                        {name: 'impact', display: 'Impact', active: false, open: false, type: 'checkbox', tumorOnly: false},
                        {name: 'type', display: 'Type', active: false, open: false, type: 'checkbox', tumorOnly: false}],
                        // {name: 'zygosities', display: 'Zygosities', active: false, open: false, type: 'checkbox', tumorOnly: false},],
                    'somatic': [
                        {name: 'tumorAltFreq', display: 'Tumor Allele Frequency', active: true, open: false, type: 'slider', tumorOnly: true,
                            minValue: 0, maxValue: 100, labelSuffix: '%', initLogic: '>=', initVal: this.somaticFilterSettings['tumorAltFreq']},
                        {name: 'tumorAltCount', display: 'Tumor Alt. Observations', active: true, open: false, type: 'slider', tumorOnly: true,
                            labelSuffix: '', initLogic: '>=', initVal: this.somaticFilterSettings['tumorAltCount']},
                        {name: 'normalAltFreq', display: 'Normal Allele Frequency', active: true, open: false, type: 'slider', tumorOnly: false,
                            minValue: 0, maxValue: 100, labelSuffix: '%', initLogic: '<=', initVal: this.somaticFilterSettings['normalAltFreq']},
                        {name: 'normalAltCount', display: 'Normal Alt. Observations', active: true, open: false, type: 'slider', tumorOnly: false,
                            labelSuffix: '', initLogic: '<=', initVal: this.somaticFilterSettings['normalAltCount']}],
                    'frequencies': [
                        {name: 'g1000', display: '1000G', active: false, open: false, type: 'cutoff', tumorOnly: false},
                        {name: 'exac', display: 'ExAC', active: false, open: false, type: 'cutoff', tumorOnly: false},
                        {name: 'gnomad', display: 'gnomAD', active: false, open: false, type: 'cutoff', tumorOnly: false}],
                    'quality': [
                        {name: 'genotypeDepth', display: 'Total Observations', active: true, open: false, type: 'slider', tumorOnly: false,
                            minValue: 0, maxValue: 100, labelSuffix: '', initLogic: '>=', initVal: this.qualityFilterSettings['genotypeDepth']},
                        {name: 'qual', display: 'Quality Score', active: true, open: false, type: 'slider', tumorOnly: false,
                            minValue: 0, maxValue: 500, labelSuffix: '', initLogic: '>=', initVal: this.qualityFilterSettings['qual']}]
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
                let tumorOnly = false;
                if (filterObj.length > 0) {
                    filterObj[0].active = parentFilterState;
                    tumorOnly = filterObj[0].tumorOnly;
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
                self.$emit('filter-toggled', filterName, filterState, grandparentFilterName, grandparentFilterState, tumorOnly, filterDisplayName);
            },
            onSliderFilterChanged: function(filterName, filterLogic, cutoffValue, grandparentFilterName) {
                let self = this;
                // Turn on indicator
                let filterObj = self.categories[grandparentFilterName].filter((cat) => {
                    return cat.name === filterName;
                });
                let tumorOnly = false;
                let displayName = '';
                if (filterObj.length > 0) {
                    filterObj[0].active = true;
                    tumorOnly = filterObj[0].tumorOnly;
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
                self.$emit('filter-slider-changed', filterName, filterLogic, cutoffValue, grandparentFilterName, grandparentFilterState, tumorOnly, displayName);
            },
            onFilterApplied: function(filterName, filterLogic, cutoffValue, grandparentFilterName) {
                let self = this;
                // Turn on indicator
                let filterObj = self.categories[grandparentFilterName].filter((cat) => {
                    return cat.name === filterName;
                });
                let tumorOnly = false;
                let displayName = '';
                if (filterObj.length > 0) {
                    filterObj[0].active = true;
                    tumorOnly = filterObj[0].tumorOnly;
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
                self.$emit('filter-applied', filterName, filterLogic, cutoffValue, grandparentFilterName, grandparentFilterState, tumorOnly, displayName);
            },
            onFilterCleared: function(filterName, grandparentFilterName) {
                let self = this;
                // Turn on indicator
                let filterObj = self.categories[grandparentFilterName].filter((cat) => {
                    return cat.name === filterName;
                });
                let tumorOnly = false;
                let displayName = '';
                if (filterObj.length > 0) {
                    filterObj[0].active = false;
                    tumorOnly = filterObj[0].tumorOnly;
                    displayName = filterObj[0].display;
                }
                let grandparentFilterState = false;
                let parentFilters = self.categories[grandparentFilterName];
                parentFilters.forEach((filt) => {
                    grandparentFilterState |= filt.active;
                });
                self.$emit('cutoff-filter-cleared', filterName, grandparentFilterName, grandparentFilterState, tumorOnly, displayName);
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
            applyActiveFilters: function() {
                const self = this;

                // TODO: left off at needing to test this!
                self.$refs.filtCheckRef.forEach((checkRef) => {
                    let matchingObj = self.categories[checkRef.grandparentFilterName].filter((cat) => {
                        return cat.name === checkRef.parentFilterName;
                    });
                    if (matchingObj.length > 0 && matchingObj[0].active === true) {
                        checkRef.applyActiveFilters();
                    }
                });
                self.$refs.filtCutoffRef.forEach((cutoffRef) => {
                    let matchingObj = self.categories[cutoffRef.parentFilterName].filter((cat) => {
                        return cat.name === cutoffRef.filterName;
                    });
                    if (matchingObj.length > 0 && matchingObj[0].active === true) {
                        cutoffRef.applyActiveFilters();
                    }
                });
                self.$refs.filtSliderRef.forEach((sliderRef) => {
                    let matchingObj = self.categories[sliderRef.parentFilterName].filter((cat) => {
                        return cat.name === sliderRef.filterName;
                    });
                    if (matchingObj.length > 0 && matchingObj[0].active === true) {
                        sliderRef.applyActiveFilters();
                    }
                });
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