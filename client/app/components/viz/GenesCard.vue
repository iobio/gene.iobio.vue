<style lang="sass">
    @import ../../../assets/sass/variables


    #genes-card
        margin-bottom: 0px
        padding-bottom: 0px

        #gene-count-badges
            text-align: center

        .optional-track-switch
            padding: 0px
            width: 130px
            display: inline-block
            float: left
            vertical-align: top
            text-align: left
            padding-top: 16px
            margin-left: 30px

            label
                padding-left: 7px
                line-height: 18px
                font-size: 13px
                font-weight: normal
                padding-top: 2px
                color: $text-color

        #analyze-all-button
            display: inline-block
            vertical-align: top
            margin-top: 10px
            margin-left: 0px
            margin-right: 10px
            float: left

        #call-variants-dropdown
            display: inline-block
            vertical-align: top
            margin-right: 0px
            text-align: left
            float: left

            button
                margin-top: 10px
                margin-left: 0px

        .btn__content
            padding: 0 4px

        #genes-toolbar
            margin-top: 6px
            margin-bottom: 0px
            display: inline-block
            width: 100%
            text-align: left

            .stop-analysis-button
                float: left
                position: relative
                min-width: 0px
                height: 20px
                padding: 0px
                margin-top: 15px
                margin-right: 20px
                margin-left: 0px

                i.material-icons
                    font-size: 18px


            #analyze-genes-progress
                float: right
                display: inline-block
                margin-right: 0px
                margin-left: 0px
                margin-top: 5px
                margin-bottom: 15px

                #total-genes-label
                    font-size: 15px
                    color: $app-color
                    margin-left: 5px
                    margin-right: 15px
                    margin-top: 10px
                    display: inline-block





                #analyzed-progress-bar

                .progress-bar-label
                    float: left
                    margin-right: 4px
                    width: 40px
                    font-size: 12px

                .loaded-progress
                    .progress-linear__bar__determinate
                        background-color: $loaded-variant-color !important
                    .progress-linear__background
                        background-color: $loaded-variant-color !important
                        height: 20px !important

                .called-progress
                    .progress-linear__bar__determinate
                        background-color: $called-variant-color !important
                    .progress-linear__background
                        background-color: $called-variant-color !important
                        height: 20px !important

                .progress-linear
                    margin: 1px 0

        #genes-panel
            margin-top: 5px

        #genes-sort-dropdown
            display: inline-block
            width: 200px
            vertical-align: top

            .input-group--select
                .input-group__selections__comma
                    font-size: 14px
                    padding: 0px 0px 0px 0px

            .input-group label
                font-size: 14px
                line-height: 25px
                height: 25px

            .input-group__input
                min-height: 0px
                margin-top: 10px

        #gene-badge-container
            max-height: 120px
            overflow-y: scroll




        #analyzing-indeterminate-bar
            margin: 0px
            .progress-linear__bar__indeterminate
                background-color: $loaded-variant-color !important
            .progress-linear__background
                background-color: $loaded-variant-color !important
                opacity: .3


    div.container.small
        #genes-card
            #genes-toolbar
                #analyze-genes-progress
                    float: none
                    display: block
                    margin-top: 0px
                    margin-bottom: 0px

                    #total-genes-label
                        margin-left: 0px
                        margin-right: 0px
                        margin-top: 0px
            #analyzed-progress-bar
                width: 150px
                margin: auto

    #genes-card.edu, #genes-card.basic
        #gene-badge-container
            text-align: center

        #gene-badge
            border: thin solid #e8e6e6
            height: 28px

            #gene-status
                padding-left: 4px
                width: initial

            #gene-badge-button
                height: 28px !important
                font-size: 18px !important
                padding: 5px 6px 2px 6px !important
                border: none

                #gene-badge-symbols
                    display: none

            &.selected
                border: 1.5px solid $current-color
                height: 28px

    #genes-card.basic
        #gene-badge
            height: 24px

            #gene-badge-button
                height: 24px !important
                font-size: 14px !important
                padding: 4px 6px 2px 6px !important


            &.selected
                border: 1.5px solid $app-color
                height: 24px

</style>

<template>
    <v-card tile id="genes-card" :class="{'app-card': true, 'edu' : isEduMode, 'basic' : isBasicMode}" style="margin-left:0px;margin-right:0px;padding-left:0px;padding-right:0px;padding-top:0px;margin-bottom:0px">


        <div :style="isEduMode ? 'padding-top:5px;margin-bottom:-5px;margin-left:10px;margin-right:10px' : 'margin-left:10px;margin-right:10px'">

            <v-card-title v-if="!isEduMode" primary-title>

                <div id="genes-toolbar" v-bind:class="isEduMode || isBasicMode ? 'hide' : ''">


                    <v-btn  id="analyze-all-button"
                            v-if="isLoaded"
                            class="level-edu"
                            raised
                            @click="onAnalyzeAll"
                            v-tooltip.top-center="`Analyze variants in all genes`" >
                        Analyze all
                    </v-btn>


                    <v-btn
                            v-if="analyzeAllInProgress"
                            class="stop-analysis-button"
                            @click="onStopAnalysis" small raised
                            v-tooltip.top-center="`Stop analysis`" >
                        <v-icon>stop</v-icon>
                    </v-btn>


                    <div id="call-variants-dropdown"
                         v-if="isLoaded && hasAlignments"
                    >
                        <v-menu offset-y>
                            <v-btn raised slot="activator"
                                   v-tooltip.top-center="`Call variants from alignments`">Call variants</v-btn>
                            <v-list>
                                <v-list-tile v-for="action in callVariantsActions" :key="action" @click="onCallVariants(action)">
                                    <v-list-tile-title>{{ action }}</v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </div>

                    <v-btn
                            v-if="callAllInProgress"
                            class="stop-analysis-button"
                            @click="onStopAnalysis" small raised
                            v-tooltip.top-center="`Stop calling variants`" >
                        <v-icon>stop</v-icon>
                    </v-btn>

                    <v-switch class="optional-track-switch"
                              v-if=" isLoaded && !isEduMode && !isBasicMode"
                              label="ClinVar track"
                              v-model="showKnownVariantsCard"
                    >
                    </v-switch>

                    <v-switch class="optional-track-switch"
                              v-if=" isLoaded && !isEduMode && !isBasicMode && launchedFromHub"
                              label="COSMIC track"
                              v-model="showCosmicVariantsCard"
                    >
                    </v-switch>


                    <filter-badges
                            ref="filterBadgesRef"
                            :style="isLoaded ? 'margin-left:40px' : ''"
                            :isFullAnalysis="isFullAnalysis"
                            :badgeCounts="badgeCounts"
                            :filterModel="filterModel"
                            :showCoverageCutoffs="showCoverageCutoffs"
                            @filter-settings-applied="onFilterSettingsApplied"
                            @badge-click="onBadgeClick"
                            @filter-settings-closed="onFilterSettingsClosed">
                    </filter-badges>

                    <div v-if="false" id="analyze-genes-progress"
                         class="level-edu level-basic">
                        <span v-if="geneNames.length > 0" id="total-genes-label">{{ geneNames.length }} genes</span>
                        <div v-show="isLoaded &&  (analyzeAllInProgress || callAllInProgress)" id="analyzed-progress-bar" >
                            <div>
                                <v-progress-linear v-show="analyzeAllInProgress" class="loaded-progress"   style="height:5px;width:150px" v-model="loadedPercentage">
                                </v-progress-linear>
                            </div>
                            <div style="clear:both">
                                <v-progress-linear v-show="callAllInProgress" class="called-progress"   style="height:5px;width:150px"  v-model="calledPercentage">
                                </v-progress-linear>
                            </div>
                        </div>
                    </div>

                </div>

            </v-card-title>

            <genes-menu style="padding-left:16px"
                        v-if="isEduMode && tourNumber == '1'"
                        id="app-tour-genes-menu"
                        :geneModel="geneModel"
                        :isEduMode="isEduMode"
                        :phenotypeLookupUrl="phenotypeLookupUrl"
                        @apply-genes="onApplyGenes">
            </genes-menu>

            <div id="genes-panel" v-if="isEduMode || isBasicMode" class="nav-center">


                <div id="gene-badge-container" class="level-basic" style="clear:both;">



                    <gene-badge
                            v-for="gene in geneSummaries"
                            :key="gene.name"
                            :gene="gene"
                            :phenotypes="geneModel.genePhenotypes[gene.name]"
                            :selectedGene="selectedGene"
                            :isEduMode="isEduMode"
                            :isBasicMode="isBasicMode"
                            :launchedFromClin="launchedFromClin"
                            @gene-selected="onGeneSelected"
                            @remove-gene="onRemoveGene"
                    >
                    </gene-badge>
                </div>


            </div>

        </div>
    </v-card>
</template>

<script>

    import GeneBadge from '../partials/GeneBadge.vue'
    import FilterBadges from '../partials/FilterBadges.vue'
    import GenesMenu from '../partials/GenesMenu.vue'

    export default {
        name: 'genes-card',
        components: {
            GeneBadge,
            FilterBadges,
            GenesMenu
        },
        props: {
            isEduMode: null,
            isBasicMode: null,
            isFullAnalysis: null,
            launchedFromClin: null,
            launchedFromHub: null,
            tourNumber: null,
            geneNames: null,
            genesInProgress: null,
            loadedDangerSummaries: null,
            geneModel: null,
            selectedGene: null,
            isLoaded: null,
            hasAlignments: null,
            filterModel: null,
            isLeftDrawerOpen: null,
            analyzeAllInProgress: null,
            callAllInProgress: null,
            showCoverageCutoffs: null,
            phenotypeLookupUrl: null
        },
        data () {
            return {
                geneSummaries: [],
                loadedPercentage: 0,
                calledPercentage: 0,
                sortCategories: [
                    "harmful variants",
                    "insufficient coverage",
                    "gene name",
                    "(original order)",
                ],
                sortBy: "harmful variants",
                callVariantsActions: ['All genes', 'Selected gene'],
                badgeCounts: {},

                flaggedGeneNames: [],
                flaggedVariants: [],

                filteredGeneNames: [],

                showKnownVariantsCard: false,
                showCosmicVariantsCard: false,

                loadedCount: 0,
                calledCount: 0,
                totalCount: 0

            }
        },
        methods: {
            onAnalyzeAll: function() {
                this.$emit("analyze-all");
            },
            updateGeneSummaries: function() {
                let self = this;

                // Create an array of gene summaries for the genes to show in the genes card
                let theGeneNames = self.filteredGeneNames.length > 0 ? self.filteredGeneNames : self.geneNames;
                let geneNamesToDisplay = null;
                if (theGeneNames) {
                    geneNamesToDisplay = theGeneNames.filter(function(geneName) {
                        if (self.isFullAnalysis) {
                            return !self.geneModel.isCandidateGene(geneName);
                        } else {
                            return self.geneModel.isCandidateGene(geneName);
                        }
                    })
                }
                if (geneNamesToDisplay) {

                    self.geneSummaries = geneNamesToDisplay.map(function(geneName) {
                        let inProgress = self.genesInProgress ? self.genesInProgress.indexOf(geneName) >= 0 : false;

                        var dangerSummary = self.geneModel.getDangerSummary(geneName);
                        var isFlagged = self.flaggedGeneNames.indexOf(geneName) >= 0;

                        return {'name': geneName,
                            'isFlagged': isFlagged,
                            'dangerSummary': dangerSummary,
                            'inProgress': inProgress};
                    })

                } else {
                    self.geneSummaries = [];
                }

                // Determine loaded gene and called gene progress
                if (geneNamesToDisplay && geneNamesToDisplay.length > 0) {
                    self.calledCount = 0;
                    self.loadedCount = 0;
                    self.totalCount = geneNamesToDisplay.length;
                    geneNamesToDisplay.forEach(function(geneName) {
                        var dangerSummary = self.geneModel.getDangerSummary(geneName);
                        if (dangerSummary) {
                            self.loadedCount++;
                        }
                        if (dangerSummary && dangerSummary.CALLED) {
                            self.calledCount++;
                        }
                    })

                    self.loadedPercentage = self.loadedCount >  0 ? (self.loadedCount / self.totalCount) * 100 : 0;
                    self.calledPercentage = self.calledCount >  0 ? (self.calledCount / self.totalCount) * 100 : 0;
                } else {
                    self.loadedPercentage = 0;
                }

            },
            updateGeneBadgeCounts: function() {
                let self = this;
                self.badgeCounts = {};

                let filteredGeneNames = null;
                if (self.geneNames) {
                    filteredGeneNames = self.geneNames.filter(function(geneName) {
                        if (self.isFullAnalysis) {
                            return true;
                        } else {
                            return self.geneModel.isCandidateGene(geneName);
                        }
                    })
                }

                for (var key in self.filterModel.flagCriteria) {
                    if (self.filterModel.flagCriteria[key].active) {
                        self.badgeCounts[key] = 0;
                    }
                }
                self.badgeCounts.coverage = 0;
                self.badgeCounts.flagged = 0;

                if (filteredGeneNames) {
                    filteredGeneNames.forEach(function(geneName) {
                        var dangerSummary = self.geneModel.getDangerSummary(geneName);

                        if (dangerSummary) {
                            for (var badge in self.badgeCounts) {
                                // Tally up variants that pass the filter
                                if (dangerSummary.badges[badge] && dangerSummary.badges[badge].length > 0) {
                                    self.badgeCounts[badge] += dangerSummary.badges[badge].length;
                                }
                            }
                            // Tally up genes that have insufficient coverage
                            if (dangerSummary.geneCoverageProblem) {
                                self.badgeCounts.coverage++;
                            }
                        }
                    })
                }
            },
            onGeneSelected: function(geneName) {
                this.$emit('gene-selected', geneName);
            },
            onRemoveGene: function(geneName) {
                this.$emit('remove-gene', geneName);
            },
            onCallVariants: function(action) {
                this.$emit("call-variants", action == 'All genes' ? null : this.selectedGene)
            },
            refresh: function(badge) {
                let self = this;
                self.determineFlaggedGenes(badge);
                if (badge) {
                    self.filteredGeneNames = self.flaggedGeneNames;
                } else {
                    self.filteredGeneNames = [];
                }
                self.updateGeneSummaries();
                self.updateGeneBadgeCounts();

            },
            onBadgeClick: function(badge) {
                let self = this;
                self.refresh(badge);
                self.$emit('filter-selected', badge, self.filteredGeneNames);
            },
            onFilterSettingsApplied: function() {
                this.$emit("filter-settings-applied");
            },
            determineFlaggedGenes: function(badge) {
                let self = this;

                self.flaggedGeneNames = [];
                self.flaggedVariants = [];

                if (badge && badge == 'coverage') {
                    self.flaggedGeneNames = self.geneNames.filter(function(geneName) {
                        var dangerSummary = self.geneModel.getDangerSummary(geneName);
                        return dangerSummary && dangerSummary.geneCoverageProblem;
                    });
                } else {
                    var theBadge = badge ? badge : 'flagged';
                    self.flaggedGeneNames = self.geneNames.filter(function(geneName) {
                        var dangerSummary = self.geneModel.getDangerSummary(geneName);
                        if (dangerSummary && dangerSummary.badges
                            && dangerSummary.badges[theBadge] && dangerSummary.badges[theBadge].length > 0) {
                            dangerSummary.badges[theBadge].forEach(function(variant) {
                                if (variant) {
                                    variant.geneName = dangerSummary.geneName;
                                    self.flaggedVariants.push(variant);
                                }
                            })
                            return true;
                        }
                    });
                }

            },
            onApplyGenes: function(genesToApply, options) {
                this.$emit("apply-genes", genesToApply, options);
            },
            onStopAnalysis: function() {
                this.$emit("stop-analysis");
            },
            clearFilter: function() {
                let self = this;
                if (this.$refs.filterBadgesRef) {
                    this.$refs.filterBadgesRef.clearFilter();
                }
                this.$emit("filter-applied", null);
                self.determineFlaggedGenes(null);
                self.filteredGeneNames = [];
                self.updateGeneSummaries();
            },
            onFilterSettingsClosed: function() {
                this.$emit('filter-settings-closed');
            }

        },
        mounted: function() {
            this.updateGeneSummaries();
        },
        watch: {
            geneNames: function(newGeneNames, oldGeneNames) {
                this.updateGeneSummaries();
                this.updateGeneBadgeCounts();
            },
            genesInProgress: function() {
                this.updateGeneSummaries();
                this.updateGeneBadgeCounts();
            },
            isFullAnalysis: function() {
                this.updateGeneSummaries();
                this.updateGeneBadgeCounts();
            },
            sortBy: function() {
                this.$emit("sort-genes", this.sortBy);
            },
            showKnownVariantsCard: function() {
                this.$emit("show-known-variants", this.showKnownVariantsCard);
            },
            showCosmicVariantsCard: function() {
                this.$emit("show-cosmic-variants", this.showCosmicVariantsCard);
            }
        }
    }

</script>