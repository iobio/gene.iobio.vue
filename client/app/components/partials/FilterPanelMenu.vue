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
                v-for="category in filterModel.filterCategories"
                :ref="category.name + 'ExpansionRef'"
                :key="category.name"
                :value="category.custom">
            <v-card-title class="filter-settings-form">
                <v-icon small style="padding-left: 5px; padding-right: 5px">
                    {{category.icon}}
                </v-icon>
                {{ category.display }}
            </v-card-title>
            <v-card-text><i>{{category.description}}</i></v-card-text>
            <filter-panel
                    v-if="category.name !== 'coverage'"
                    ref="filterSettingsRef"
                    :filterName="category.name"
                    :filterModel="filterModel"
                    :filter="category"
                    :annotationComplete="annotationComplete"
                    :applyFilters="applyFilters"
                    @filter-change="onFilterChange">
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
            applyFilters: false
        },
        data() {
            return {
                showMenu: true
            }
        },
        methods: {
            // TODO: incorporate reset to default params from cohort
            // TODO: incorporate gold or other highlight color for filtering
            onFilterChange: function() {
                const self = this;
                // self.filterModel.setCategoryState(filterObj.categoryName, filterObj.categoryState);
                self.$emit('filter-change');
            },
            // clearFilters: function() {
            //     const self = this;
            //     self.filterModel.clearAllFilters();
            //
            //     if (self.$refs.filterSettingsRef) {
            //         self.$refs.filterSettingsRef.forEach((filtRef) => {
            //             filtRef.clearFilters();
            //         });
            //     }
            // },
            // applyActiveFilters: function() {
            //     const self = this;
            //     self.$refs.filterSettingsRef.forEach((filtRef) => {
            //         let matchingFilter = self.filterModel.filterCategories.filter((filt) => {
            //             return filt.name === filtRef.filterName;
            //         });
            //         if (matchingFilter.length > 0 && matchingFilter[0].active === true) {
            //             filtRef.applyActiveFilters();
            //         }
            //     });
            // }
        },
    }
</script>
