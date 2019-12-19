<!--SJG Jan2019; Adapted from gene.iobio and TDS Aug2018-->
<style lang="sass">
    @import ../../../assets/sass/variables
    .filter-form
        .input-group
            label
                padding-top: 5px
                padding-left: 15px
                font-size: 14px
                font-weight: normal
                color: black !important
                pointer-events: none !important
                cursor: default
</style>

<template>
    <v-layout row wrap class="filter-form mx-2 px-2" style="max-width:500px;">
        <v-flex xs12>
            <v-container fluid>
                <v-checkbox v-for="item in checkboxLists[parentFilterName]"
                            :key="item.name"
                            :label="item.displayName"
                            v-bind:disabled="!annotationComplete"
                            v-model="item.model"
                            color="appColor"
                            style="padding-left: 15px; margin-top: 0; margin-bottom: 0; max-height: 30px"
                            @click="boxChecked(item)">
                </v-checkbox>
            </v-container>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        name: 'filter-panel-checkbox',
        components: {},
        props: {
            parentFilterName: null,
            annotationComplete: true,
            checkboxLists: null
        },
        methods: {
            boxChecked: function(filterObj) {
                let self = this;

                filterObj.model = !filterObj.model;


                // TODO: cleanup
                // let updatedState = filterObj.model;
                // let filterName = filterObj.name;
                // if (self.parentFilterName === 'impact') {
                //     filterName = filterObj.name;
                // }
                // let anyFilterInParentActive = false;
                // self.checkboxLists[self.parentFilterName].forEach((filter) => {
                //     anyFilterInParentActive |= !filter.model;
                // });
                // self.$emit('filter-toggled', filterName, updatedState, self.parentFilterName, self.grandparentFilterName, anyFilterInParentActive, filterObj.displayName);
                self.$emit('filter-toggled');
            },
            // clearFilters: function() {
            //     const self = this;
            //     for (var listName in self.checkboxLists) {
            //         let currList = self.checkboxLists[listName];
            //         currList.forEach((filt) => {
            //             filt.model = true;
            //         })
            //     }
            //     // (Object.values(self.checkboxLists)).forEach((checkList) => {
            //     //     checkList.forEach((filt) => {
            //     //         filt.model = true;
            //     //     });
            //     // })
            // }
        }
    }
</script>