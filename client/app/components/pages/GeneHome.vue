/*
* GeneHome.vue
*
*/
<style lang="sass">

    @import ../../../assets/sass/variables

    main.content
        margin-top: 50px

    .app-card
        margin-bottom: 5px

    #data-sources-loader
        margin-top: 20px
        margin-left: auto
        margin-right: auto
        text-align: center

    .tabs__container
        height: 31px !important
        margin-left: 0px

        .tabs__item
            color: $text-color

    .tabs__div
        text-transform: none !important

    .tabs__slider
        background-color: $app-color !important
        border-color: $app-color !important

    .gene-badge-coverage-problem
        color: $coverage-problem-color
        fill: $coverage-problem-color

    .split-pane-item
        height: initial !important
        display: flex !important

    .clinvar-switch
        position: absolute
        top: 5px
        left: 200px

        label
            padding-left: 7px
            line-height: 18px
            font-size: 12px
            font-weight: bold
            padding-top: 2px
            color: $text-color

    .switch
        &.accent--text
            color: $app-color !important

    .radio
        &.accent--text
            color: $app-color !important

</style>


<template>
    <div>

        <edu-tour-banner
                v-if="isEduMode"
                :tourNumber="tourNumber"
                :geneModel="geneModel"
                @init-tour-sample="onInitTourSample"
                @tour-start-over="onTourStartOver">
        </edu-tour-banner>

        <navigation
                v-if="geneModel"
                ref="navRef"
                :isEduMode="isEduMode"
                :isBasicMode="isBasicMode"
                :forMyGene2="forMyGene2"
                :cohortModel="cohortModel"
                :geneModel="geneModel"
                :filteredGeneNames="filteredGeneNames"
                :activeFilterName="activeFilterName"
                :launchedFromClin="launchedFromClin"
                :launchedFromHub="launchedFromHub"
                :bringAttention="bringAttention"
                :workingOffline="workingOffline"
                :filterModel="filterModel"
                :annotationComplete="annotationComplete"
                :selectedGeneName="selectedGene.gene_name"
                :selectedChr="selectedGene.chr"
                :selectedBuild="genomeBuildHelper.getCurrentSpeciesName() + ' ' + genomeBuildHelper.getCurrentBuildName()"
                :applyFilters="applyFilters"
                @update-samples="onUpdateSamples"
                @input="onGeneNameEntered"
                @load-demo-data="onLoadDemoData"
                @clear-cache="promiseClearCache"
                @apply-genes="onApplyGenes"
                @on-start-search-genes="onStartSearchGenes"
                @clear-all-genes="onClearAllGenes"
                @flagged-variants-imported="onFlaggedVariantsImported"
                @flagged-variant-selected="onFlaggedVariantSelected"
                @on-files-loaded="onFilesLoaded"
                @on-left-drawer="onLeftDrawer"
                @on-show-welcome="onShowWelcome"
                @send-flagged-variants-to-clin="onSendFlaggedVariantsToClin"
                @show-snackbar="onShowSnackbar"
                @hide-snackbar="onHideSnackbar"
                @on-filter-settings-applied="onVariantFilterSettingsApplied"
        >
        </navigation>


        <v-content>
            <v-container fluid>
                <intro-card v-if="forMyGene2"
                            :closeIntro="closeIntro"
                            :isBasicMode="isBasicMode"
                            :siteConfig="siteConfig"
                            :defaultingToDemoData="cohortModel ? cohortModel.defaultingToDemoData : false"
                            @on-advanced-mode="onAdvancedMode"
                            @on-basic-mode="onBasicMode">
                </intro-card>

                <v-card class="full-width" style="margin-bottom:5px;padding-bottom:2px;padding-top:10px"
                        v-if="geneModel && Object.keys(selectedGene).length > 0"
                        v-bind:class="{hide : showWelcome }">
                    <gene-card
                            :showTitle="false"
                            :isEduMode="isEduMode"
                            :isBasicMode="isBasicMode"
                            :geneModel="geneModel"
                            :selectedGene="selectedGene"
                            :selectedTranscript="selectedTranscript"
                            :geneRegionStart="geneRegionStart"
                            :geneRegionEnd="geneRegionEnd"
                            :showGeneViz="true"
                            :workingOffline="workingOffline"
                            :clearZoom="clearZoom"
                            @transcript-selected="onTranscriptSelected"
                            @gene-source-selected="onGeneSourceSelected"
                            @gene-region-buffer-change="onGeneRegionBufferChange"
                            @gene-region-zoom="onGeneRegionZoom"
                            @gene-region-zoom-reset="onGeneRegionZoomReset"
                    >
                    </gene-card>
                </v-card>

                <div v-if="geneModel && Object.keys(selectedGene).length > 0 && (!isBasicMode || selectedVariant != null)"
                        style="height:auto;margin-bottom:5px;"
                        v-bind:class="{hide : showWelcome, 'full-width': true }">
                    <v-card v-if="geneModel && cohortModel.isLoaded && Object.keys(selectedGene).length > 0"
                                   id="gene-and-variant-tabs" slot="right"
                                   class="full-width"
                                   style="margin-bottom:0;padding-top:0;margin-top:10px;">
                        <v-flex xs9>
                            <feature-matrix-card :style="{'min-width': '300px'}"
                                                 ref="featureMatrixCardRef"
                                                 v-if="featureMatrixModel.filteredMatrixRows.length > 0 && cohortModel.varAfLinks && cohortModel.allUniqueFeaturesObj"
                                                 v-bind:class="{ hide: !cohortModel || !cohortModel.isLoaded || !featureMatrixModel || !featureMatrixModel.rankedVariants }"
                                                 :isEduMode="isEduMode"
                                                 :isBasicMode="isBasicMode"
                                                 :featureMatrixModel="featureMatrixModel"
                                                 :selectedGene="selectedGene"
                                                 :selectedTranscript="analyzedTranscript"
                                                 :selectedVariant="selectedVariant"
                                                 :id="'s0'"
                                                 :variantTooltip="variantTooltip"
                                                 :width="cardWidth"
                                                 @cohort-variant-click="onCohortVariantClick"
                                                 @cohort-variant-hover="onCohortVariantHover"
                                                 @cohort-variant-hover-end="onCohortVariantHoverEnd"
                                                 @variant-rank-change="featureMatrixModel.promiseRankVariants(cohortModel.allUniqueFeaturesObj, cohortModel.allSomaticFeaturesLookup, cohortModel.getAllFilterPassingVariants())">
                            </feature-matrix-card>
                        </v-flex>
                        <v-flex xs3>
                            <variant-detail-card
                                    ref="variantDetailCardRef"
                                    :isEduMode="isEduMode"
                                    :isBasicMode="isBasicMode"
                                    :forMyGene2="forMyGene2"
                                    :showTitle="false"
                                    :selectedGene="selectedGene"
                                    :selectedTranscript="analyzedTranscript"
                                    :selectedVariant="selectedVariant"
                                    :selectedVariantRelationship="selectedVariantRelationship"
                                    :genomeBuildHelper="genomeBuildHelper"
                                    :variantTooltip="variantTooltip"
                                    :cohortModel="cohortModel"
                                    :info="selectedVariantInfo"
                                    @transcript-id-selected="onTranscriptIdSelected"
                                    @flag-variant="onFlagVariant"
                                    @remove-flagged-variant="onRemoveUserFlaggedVariant">
                            </variant-detail-card>
                        </v-flex>

                    </v-card>

                    <!--<v-card v-if="geneModel && cohortModel.isLoaded && Object.keys(selectedGene).length > 0"-->
                            <!--id="gene-and-variant-tabs" slot="right"-->
                            <!--class="full-width"-->
                            <!--style="margin-bottom:0;padding-top:0;margin-top:10px;">-->
                        <!--<v-tabs-->
                                <!--v-model="activeGeneVariantTab"-->
                                <!--light-->
                                <!--:class="{'basic': isBasicMode}">-->
                            <!--<v-tab v-if="!isBasicMode" href="#feature-matrix-tab">-->
                                <!--Ranked Variants in Gene-->
                            <!--</v-tab>-->
                            <!--<v-tab v-if="!isBasicMode" href="#var-freq-tab">-->
                                <!--Variant Allele Frequencies-->
                            <!--</v-tab>-->
                            <!--<v-tab v-if="!isEduMode" href="#var-detail-tab">-->
                                <!--Variant Details-->
                            <!--</v-tab>-->
                            <!--<v-tab-item v-if="!isBasicMode" style="margin-bottom:0;overflow-y:auto"-->
                                        <!--:key="'featureMatrixTab'"-->
                                        <!--:id="'feature-matrix-tab'">-->
                                <!--<feature-matrix-card :style="{'min-width': '300px'}"-->
                                                     <!--ref="featureMatrixCardRef"-->
                                                     <!--v-if="featureMatrixModel.filteredMatrixRows.length > 0 && cohortModel.varAfLinks && cohortModel.allUniqueFeaturesObj"-->
                                                     <!--v-bind:class="{ hide: !cohortModel || !cohortModel.isLoaded || !featureMatrixModel || !featureMatrixModel.rankedVariants }"-->
                                                     <!--:isEduMode="isEduMode"-->
                                                     <!--:isBasicMode="isBasicMode"-->
                                                     <!--:featureMatrixModel="featureMatrixModel"-->
                                                     <!--:selectedGene="selectedGene"-->
                                                     <!--:selectedTranscript="analyzedTranscript"-->
                                                     <!--:selectedVariant="selectedVariant"-->
                                                     <!--:id="'s0'"-->
                                                     <!--:variantTooltip="variantTooltip"-->
                                                     <!--:width="cardWidth"-->
                                                     <!--@cohort-variant-click="onCohortVariantClick"-->
                                                     <!--@cohort-variant-hover="onCohortVariantHover"-->
                                                     <!--@cohort-variant-hover-end="onCohortVariantHoverEnd"-->
                                                     <!--@variant-rank-change="featureMatrixModel.promiseRankVariants(cohortModel.allUniqueFeaturesObj, cohortModel.allSomaticFeaturesLookup, cohortModel.getAllFilterPassingVariants())">-->
                                <!--</feature-matrix-card>-->
                            <!--</v-tab-item>-->
                            <!--<v-tab-item v-if="!isBasicMode" style="margin-bottom:0;overflow-y:auto"-->
                                        <!--:key="'varFreqTab'"-->
                                        <!--:id="'var-freq-tab'">-->
                                <!--<variant-frequency-card-->
                                    <!--v-if="cohortModel && cohortModel.varAfLinks && cohortModel.allUniqueFeaturesObj"-->
                                    <!--style="min-width:300px"-->
                                    <!--ref="varFreqCardRef"-->
                                    <!--:width="cardWidth"-->
                                    <!--:numVars="Object.keys(cohortModel.allUniqueFeaturesObj.features).length"-->
                                    <!--:afLinks="cohortModel.varAfLinks"-->
                                    <!--:afNodes="cohortModel.varAfNodes">-->
                                <!--</variant-frequency-card>-->
                            <!--</v-tab-item>-->
                            <!--<v-tab-item style="margin-bottom:0;overflow-y:auto"-->
                                        <!--:key="'varDetailTab'"-->
                                        <!--:id="'var-detail-tab'">-->
                                <!--<variant-detail-card-->
                                        <!--ref="variantDetailCardRef"-->
                                        <!--:isEduMode="isEduMode"-->
                                        <!--:isBasicMode="isBasicMode"-->
                                        <!--:forMyGene2="forMyGene2"-->
                                        <!--:showTitle="false"-->
                                        <!--:selectedGene="selectedGene"-->
                                        <!--:selectedTranscript="analyzedTranscript"-->
                                        <!--:selectedVariant="selectedVariant"-->
                                        <!--:selectedVariantRelationship="selectedVariantRelationship"-->
                                        <!--:genomeBuildHelper="genomeBuildHelper"-->
                                        <!--:variantTooltip="variantTooltip"-->
                                        <!--:cohortModel="cohortModel"-->
                                        <!--:info="selectedVariantInfo"-->
                                        <!--@transcript-id-selected="onTranscriptIdSelected"-->
                                        <!--@flag-variant="onFlagVariant"-->
                                        <!--@remove-flagged-variant="onRemoveUserFlaggedVariant">-->
                                <!--</variant-detail-card>-->

                                <!--<scroll-button ref="scrollButtonRefVariant" :parentId="`variant-detail`">-->
                                <!--</scroll-button>-->
                            <!--</v-tab-item>-->
                        <!--</v-tabs>-->
                    <!--</v-card>-->
                </div>

                <!--<div v-if="geneModel && Object.keys(selectedGene).length > 0 && (!isBasicMode || selectedVariant != null)"-->
                     <!--style="height:auto;margin-bottom:5px;"-->
                     <!--v-bind:class="{hide : showWelcome, 'full-width': true }">-->
                    <!--<v-card v-if="geneModel && cohortModel.isLoaded && Object.keys(selectedGene).length > 0"-->
                            <!--id="allele-freq-viz" slot="right"-->
                            <!--class="full-width"-->
                            <!--style="margin-bottom:0;padding-top:0;margin-top:10px;">-->
                        <!--<variant-frequency-card-->
                                <!--v-if="cohortModel && cohortModel.varAfLinks && cohortModel.allUniqueFeaturesObj"-->
                                <!--style="min-width:300px"-->
                                <!--ref="varFreqCardRef"-->
                                <!--:width="cardWidth"-->
                                <!--:numVars="Object.keys(cohortModel.allUniqueFeaturesObj.features).length"-->
                                <!--:afLinks="cohortModel.varAfLinks"-->
                                <!--:afNodes="cohortModel.varAfNodes">-->
                        <!--</variant-frequency-card>-->
                    <!--</v-card>-->
                <!--</div>-->

                <v-flex xs12 v-if="showWelcome">
                    <welcome
                            @load-demo-data="onLoadDemoData"
                            @open-file-selection="openFileSelection">
                    </welcome>
                </v-flex>

                <v-card style="width:400px;height:50px;padding-top:15px"
                        id="data-sources-loader"
                        class="loader"
                        v-bind:class="{ hide: !cohortModel ||  !cohortModel.inProgress.loadingDataSources }">
                    <span class="loader-label">Loading files</span>
                    <img src="../../../assets/images/wheel.gif">
                </v-card>

                <genes-card
                        v-if="geneModel && !workingOffline"
                        v-show="filterModel"
                        v-bind:class="{hide : showWelcome && !isEduMode, 'full-width': true}"
                        ref="genesCardRef"
                        :isEduMode="isEduMode"
                        :isBasicMode="isBasicMode"
                        :launchedFromClin="launchedFromClin"
                        :launchedFromHub="launchedFromHub"
                        :tourNumber="tourNumber"
                        :geneModel="geneModel"
                        :selectedGene="selectedGene"
                        :geneNames="geneModel.sortedGeneNames"
                        :loadedDangerSummaries="Object.keys(geneModel.geneDangerSummaries)"
                        :genesInProgress="cohortModel.genesInProgress"
                        :isLoaded="cohortModel && cohortModel.isLoaded"
                        :hasAlignments="cohortModel && cohortModel.isLoaded && cohortModel.hasAlignments()"
                        :filterModel="cohortModel.filterModel"
                        :isLeftDrawerOpen="isLeftDrawerOpen"
                        :analyzeAllInProgress="cacheHelper.analyzeAllInProgress"
                        :callAllInProgress="cacheHelper.callAllInProgress"
                        :showCoverageCutoffs="showCoverageCutoffs"
                        @gene-selected="onGeneClicked"
                        @remove-gene="onRemoveGene"
                        @analyze-all="onAnalyzeAll"
                        @call-variants="callVariants"
                        @sort-genes="onSortGenes"
                        @filter-selected="onFilterSelected"
                        @filter-settings-applied="onFilterSettingsApplied"
                        @filter-settings-closed="showCoverageCutoffs = false"
                        @apply-genes="onApplyGenes"
                        @stop-analysis="onStopAnalysis"
                        @show-known-variants="onShowKnownVariantsCard"
                        @show-cosmic-variants="onShowCosmicVariantsCard">
                </genes-card>


                <variant-card
                        ref="variantCardRef"
                        v-if="showVariantCards"
                        v-for="model in models"
                        :key="model.id"
                        v-bind:class="[
                        { 'full-width': true, 'hide': showWelcome || Object.keys(selectedGene).length === 0 || !cohortModel  || cohortModel.inProgress.loadingDataSources
                          || (model.id === 'known-variants' && showKnownVariantsCard === false) || (model.id === 'cosmic-variants' && showCosmicVariantsCard === false),
                          'edu' : isEduMode
                        },
                        model.id
                        ]"
                        :globalAppProp="globalApp"
                        :isEduMode="isEduMode"
                        :isBasicMode="isBasicMode"
                        :sampleModel="model"
                        :canonicalSampleIds="canonicalSampleIds"
                        :classifyVariantSymbolFunc="model.id === 'known-variants' ? model.classifyByClinvar : model.classifyByImpact"
                        :variantTooltip="variantTooltip"
                        :selectedGene="selectedGene"
                        :selectedTranscript="analyzedTranscript"
                        :selectedVariant="selectedVariant"
                        :regionStart="geneRegionStart"
                        :regionEnd="geneRegionEnd"
                        :width="cardWidth"
                        :showGeneViz="true"
                        :showDepthViz="model.id !== 'known-variants' && model.id !== 'cosmic-variants'"
                        :showVariantViz="showVarViz && ((model.id !== 'known-variants' || showKnownVariantsCard) || (model.id !== 'cosmic-variants' || showCosmicVariantsCard))"
                        :geneVizShowXAxis="model.id === 's0' || model.id === 'known-variants' || model.id === 'cosmic-variants'"
                        @cohort-variant-click="onCohortVariantClick"
                        @cohort-variant-hover="onCohortVariantHover"
                        @cohort-variant-hover-end="onCohortVariantHoverEnd"
                        @known-variants-viz-change="onKnownVariantsVizChange"
                        @known-variants-filter-change="onKnownVariantsFilterChange"
                        @cosmic-variants-viz-change="onCosmicVariantsVizChange"
                        @cosmic-variants-filter-change="onCosmicVariantsFilterChange"
                        @show-coverage-cutoffs="showCoverageCutoffs = true"
                >
                </variant-card>


                <v-snackbar
                        :timeout="snackbar.timeout"
                        absolute
                        auto-height
                        v-model="showSnackbar">
                    <span v-html="snackbar.message"></span>
                    <v-btn flat color="white" @click.native="showSnackbar = false">
                    </v-btn>
                </v-snackbar>

            </v-container>
        </v-content>

        <app-tour
                ref="appTourRef"
                :isEduMode="isEduMode"
                :tourNumber="tourNumber"
                :selectedGene="selectedGene"
                :selectedVariant="selectedVariant"
                :phenotypeTerm="phenotypeTerm"
                @circle-variant="onCircleVariant"
        ></app-tour>

    </div>

</template>


<script>


    import Navigation from '../viz/Navigation.vue'
    import EduTourBanner from '../viz/EduTourBanner.vue'
    import Welcome from '../viz/Welcome.vue'
    import IntroCard from '../viz/IntroCard.vue'
    import GeneCard from '../viz/GeneCard.vue'
    import VariantDetailCard from '../viz/VariantDetailCard.vue'
    import GenesCard from '../viz/GenesCard.vue'
    import FeatureMatrixCard from '../viz/FeatureMatrixCard.vue'
    import VariantFrequencyCard from '../viz/VariantFrequencyCard.vue'
    import VariantCard from '../viz/VariantCard.vue'
    import AppTour from '../viz/AppTour.vue'

    import HubSession from '../../models/HubSession.js'
    import Bam from '../../models/Bam.iobio.js'
    import vcfiobio from '../../models/Vcf.iobio.js'
    import Translator from '../../models/Translator.js'
    import EndpointCmd from '../../models/EndpointCmd.js'
    import GenericAnnotation from '../../models/GenericAnnotation.js'
    import CacheHelper from '../../models/CacheHelper.js'
    import CohortModel from '../../models/CohortModel.js'
    import FeatureMatrixModel from '../../models/FeatureMatrixModel.js'
    import FilterModel from '../../models/FilterModel.js'
    import GeneModel from '../../models/GeneModel.js'
    import GenomeBuildHelper from '../../models/GenomeBuildHelper.js'
    import VariantExporter from '../../models/VariantExporter.js'
    import FreebayesSettings from '../../models/FreebayesSettings.js'

    import Glyph from '../../partials/Glyph.js'
    import VariantTooltip from '../../partials/VariantTooltip.js'

    import allGenesData from '../../../data/genes.json'
    import SplitPane from '../partials/SplitPane.vue'
    import ScrollButton from '../partials/ScrollButton.vue'


    export default {
        name: 'home',
        components: {
            VariantFrequencyCard,
            EduTourBanner,
            Navigation,
            IntroCard,
            Welcome,
            GenesCard,
            GeneCard,
            ScrollButton,
            VariantDetailCard,
            FeatureMatrixCard,
            VariantCard,
            SplitPane,
            AppTour
        },
        props: {
            paramGene: null,
            paramGeneName: null,
            paramGenes: null,
            paramSpecies: null,
            paramBuild: null,
            paramBatchSize: null,
            paramGeneSource: null,
            paramMyGene2: null,
            paramLaunchedFromClin: null,
            paramTour: null,
            paramSampleId: null,
            paramIsPedigree: null,
            paramSource: null,
            paramFileId: null,
            paramSamples: null,
            paramTumorStatus: null,
            paramBams: null,
            paramBais: null,
            paramVcfs: null,
            paramTbis: null
        },
        data() {
            return {
                greeting: 'gene.iobio',

                launchedFromClin: false,
                launchedFromHub: false,
                launchedWithUrlParms: false,

                allGenes: allGenesData,

                selectedGene: {},
                selectedTranscript: {},
                analyzedTranscript: {},
                coverageDangerRegions: null,
                geneRegionStart: null,
                geneRegionEnd: null,

                genesInProgress: {},
                activeFilterName: null,
                filteredGeneNames: null,

                cohortModel: null,
                models: [],
                featureMatrixModel: null,
                geneModel: null,
                filterModel: null,
                cacheHelper: null,
                genomeBuildHelper: null,

                variantTooltip: null,
                appTour: null,

                selectedVariant: null,
                selectedVariantRelationship: null,

                showVariantCards: false,
                showKnownVariantsCard: false,
                showCosmicVariantsCard: false,

                inProgress: {},
                firstLaunchFromFileMenu: true,

                PROBAND: 'proband',
                activeGeneVariantTab: 'feature-matrix-tab',
                isLeftDrawerOpen: null,
                showWelcome: false,

                cardWidth: 0,
                mainContentWidth: null,
                featureMatrixWidthPercent: 0,

                showSnackbar: false,
                snackbar: {message: '', timeout: 0},
                bringAttention: null,

                clearZoom: false,

                /*
                * This variable controls special behavior for running gene.iobio education edition, with
                * a simplified interface and logic.
                */
                isEduMode: false,
                tourNumber: null,

                /*
                * These flags control special behavior for running gene.iobio basic mode, with
                * a simplified interface and logic.
                */
                isBasicMode: false,
                forMyGene2: false,


                closeIntro: false,

                phenotypeTerm: null,

                siteConfig: null,

                showCoverageCutoffs: false,

                clinIobioUrls: ["http://localhost:4030", "http://clin.iobio.io"],
                clinIobioUrl: null,

                forceLocalStorage: null,
                showVarViz: true,
                workingOffline: false,        // If working offline and want to style things TODO: get rid of this SJG
                annotationComplete: false,
                applyFilters: false     // Used only for the initial load of a gene to apply default filters
            }
        },

        created: function () {
        },

        mounted: function () {
            let self = this;

            if (self.workingOffline) {
                // If you're working offline and just want to style stuff...
                let glyph = new Glyph();
                let translator = new Translator(self.globalApp, glyph, self.globalApp.utility);

                self.geneModel = new GeneModel(self.globalApp, self.forceLocalStorage);
                self.geneModel.geneSource = self.forMyGene2 ? "refseq" : "gencode";

                // Instantiate helper class than encapsulates IOBIO commands
                let endpoint = new EndpointCmd(self.globalApp,
                    null,
                    null,
                    []);

                let genericAnnotation = new GenericAnnotation(glyph);

                self.cohortModel = new CohortModel(
                    self.globalApp,
                    self.isEduMode,
                    self.isBasicMode,
                    endpoint,
                    genericAnnotation,
                    translator,
                    self.geneModel,
                    self.variantExporter,
                    self.cacheHelper,
                    self.genomeBuildHelper,
                    new FreebayesSettings());

                self.selectedGene = 'fakeGene1';
                self.selectedTranscript = 'fakeTranscript1';
            } else {
                self.cardWidth = self.$el.offsetWidth;
                self.cardWidth = window.innerWidth;

                self.mainContentWidth = $('main.content .container').outerWidth();
                $(window).resize(function () {
                    self.onResize();
                });

                document.addEventListener("visibilitychange", function () {
                    if (!document.hidden) {
                        setTimeout(function () {
                            self.onResize();
                        }, 1000)
                    }
                }, false);

                // Safari can't use IndexedDB in iframes, so in this situation, use
                // local storage instead.
                if (window != top && self.utility.detectSafari()) {
                    self.forceLocalStorage = true;
                }

                self.setAppMode();

                window.addEventListener("message", self.receiveClinMessage, false);

                self.genomeBuildHelper = new GenomeBuildHelper(self.globalApp);
                self.genomeBuildHelper.promiseInit({DEFAULT_BUILD: 'GRCh37'})
                    .then(function () {
                        return self.promiseInitCache();
                    })
                    .then(function () {
                        return self.cacheHelper.promiseClearOlderCache();
                    })
                    .then(function () {
                        return self.promiseLoadSiteConfig();
                    })
                    .then(function () {
                        let glyph = new Glyph();
                        let translator = new Translator(self.globalApp, glyph, self.globalApp.utility);
                        let genericAnnotation = new GenericAnnotation(glyph);

                        self.geneModel = new GeneModel(self.globalApp, self.forceLocalStorage);
                        self.geneModel.geneSource = self.forMyGene2 ? "refseq" : "gencode";
                        self.geneModel.genomeBuildHelper = self.genomeBuildHelper;
                        self.geneModel.setAllKnownGenes(self.allGenes);
                        self.geneModel.translator = translator;


                        // Instantiate helper class than encapsulates IOBIO commands
                        let endpoint = new EndpointCmd(self.globalApp,
                            self.cacheHelper.launchTimestamp,
                            self.genomeBuildHelper,
                            self.globalApp.utility.getHumanRefNames);

                        self.variantExporter = new VariantExporter(self.globalApp);

                        self.cohortModel = new CohortModel(
                            self.globalApp,
                            self.isEduMode,
                            self.isBasicMode,
                            endpoint,
                            genericAnnotation,
                            translator,
                            self.geneModel,
                            self.variantExporter,
                            self.cacheHelper,
                            self.genomeBuildHelper,
                            new FreebayesSettings());

                        self.geneModel.on("geneDangerSummarized", function (dangerSummary) {
                            self.cohortModel.captureFlaggedVariants(dangerSummary)
                        });

                        self.cacheHelper.cohort = self.cohortModel;

                        self.variantExporter.cohort = self.cohortModel;

                        self.inProgress = self.cohortModel.inProgress;


                        self.featureMatrixModel = new FeatureMatrixModel(self.globalApp, self.cohortModel, self.isEduMode, self.isBasicMode, self.tourNumber);
                        self.featureMatrixModel.init();
                        self.cohortModel.featureMatrixModel = self.featureMatrixModel;

                        self.variantTooltip = new VariantTooltip(
                            self.globalApp,
                            self.isEduMode,
                            self.isBasicMode,
                            self.tourNumber,
                            genericAnnotation,
                            glyph,
                            translator,
                            self.cohortModel.annotationScheme,
                            self.genomeBuildHelper);

                        self.filterModel = new FilterModel(self.globalApp, self.cohortModel.affectedInfo, self.isBasicMode);
                        self.cohortModel.filterModel = self.filterModel;

                        self.promiseInitFromUrl()
                            .then(function () {
                                if (self.isEduMode && self.tourNumber) {
                                    self.$refs.appTourRef.startTour(self.tourNumber);
                                }

                                if (self.launchedFromHub) {
                                    self.onShowSnackbar({message: 'Loading data...', timeout: 5000});
                                    self.hubSession = new HubSession();
                                    let isPedigree = self.paramIsPedigree && self.paramIsPedigree === 'true';
                                    self.hubSession.promiseInit(self.paramSampleId, self.paramSource, isPedigree)
                                        .then(modelInfos => {
                                            self.modelInfos = modelInfos;

                                            self.cohortModel.promiseInit(self.modelInfos)
                                                .then(function () {
                                                    self.models = self.cohortModel.sampleModels;
                                                    if (self.selectedGene && Object.keys(self.selectedGene).length > 0) {
                                                        self.promiseLoadData()
                                                            .then(function () {
                                                                self.showLeftPanelWhenFlaggedVariants();
                                                            })
                                                    } else {
                                                        self.onShowSnackbar({
                                                            message: 'Enter a gene name or enter a phenotype term.',
                                                            timeout: 5000
                                                        });
                                                        self.bringAttention = 'gene';
                                                    }
                                                })
                                        })
                                } else {
                                    self.models = self.cohortModel.sampleModels;
                                    if (self.selectedGene && Object.keys(self.selectedGene).length > 0) {
                                        self.promiseLoadData()
                                            .then(function () {
                                                self.showLeftPanelWhenFlaggedVariants();
                                            })
                                    } else {
                                        if (self.launchedWithUrlParms && self.geneModel.sortedGeneNames.length === 0) {
                                            self.onShowSnackbar({
                                                message: 'Enter a gene name or enter a phenotype term.',
                                                timeout: 5000
                                            });
                                            self.bringAttention = 'gene';
                                        }

                                        if (!self.isEduMode && !self.isBasicMode && !self.launchedFromHub && !self.launchedFromClin && !self.launchedWithUrlParms && self.geneModel.sortedGeneNames.length == 0) {
                                            self.showWelcome = true;
                                        }
                                    }
                                }

                            })
                    }).catch((error) => {
                    console.log("Probably not connected to the internet... ");
                    console.log(error);
                })
            }
            // See if this messes with anything
            //document.addEventListener('touchstart', handler, {passive: true});
        },


        computed: {
            maxDepth: function () {
                if (this.cohortModel && this.cohortModel.maxDepth) {
                    return this.cohortModel.maxDepth;
                } else {
                    return 0;
                }
            },
            selectedVariantInfo: function () {
                if (this.selectedVariant) {
                    return this.globalApp.utility.formatDisplay(this.selectedVariant, this.cohortModel.translator, this.isEduMode)
                } else {
                    return null;
                }
            },
            canonicalSampleIds: function () {
                let ids = [];
                if (this.cohortModel && this.cohortModel.getCanonicalModels() != null) {
                    this.cohortModel.getCanonicalModels().forEach((model) => {
                        ids.push(model.id);
                    })
                }
                return ids;
            }
        },

        watch: {
            isLeftDrawerOpen: function () {
                let self = this;
                setTimeout(function () {
                    self.onResize();
                }, 1000)
            },
            'cohortModel.annotationComplete': function() {
                if (this.cohortModel && this.cohortModel.getNormalModel()) {
                    this.annotationComplete = !this.cohortModel.getNormalModel().inProgress.loadingVariants;
                } else {
                    this.annotationComplete = false;
                }
            }
        },

        methods: {
            promiseInitCache: function () {
                let self = this;
                return new Promise(function (resolve, reject) {
                    self.cacheHelper = new CacheHelper(self.globalApp, self.forceLocalStorage);
                    self.cacheHelper.on("geneAnalyzed", function (geneName) {
                        self.$refs.genesCardRef.determineFlaggedGenes();

                        if (self.selectedGene && self.selectedGene.hasOwnProperty("gene_name")
                            && geneName == self.selectedGene.gene_name) {
                            self.promiseLoadData();
                        }
                    });
                    self.cacheHelper.on("analyzeAllCompleted", function () {
                        if (!self.isEduMode) {
                            self.$refs.navRef.onShowFlaggedVariants();
                        }
                        if (self.launchedFromClin) {
                            self.onSendFiltersToClin();
                            self.onSendFlaggedVariantsToClin();
                        }
                    });

                    self.globalApp.cacheHelper = self.cacheHelper;
                    window.globalCacheHelper = self.cacheHelper;

                    self.cacheHelper.promiseInit()
                        .then(function () {
                            self.cacheHelper.isolateSession(self.isEduMode);
                            resolve();
                        })
                        .catch(function (error) {
                            var msg = "A problem occurred in promiseInitCache(): " + error;
                            console.log(msg);
                            reject(msg);
                        })
                })
            },

            promiseClearCache: function () {
                let self = this;

                this.clearFilter();
                self.cohortModel.clearFlaggedVariants();

                return new Promise(function (resolve, reject) {
                    if (self.isEduMode) {
                        resolve();
                    } else {
                        self.geneModel.clearDangerSummaries();
                        self.cacheHelper.promiseClearCache(self.cacheHelper.launchTimestampToClear)
                            .then(function () {
                                self.cohortModel.cacheHelper.refreshGeneBadges(function () {
                                    resolve();
                                })
                            })
                            .catch(function (error) {
                                resolve(error);
                            })

                    }

                })
            },

            promiseLoadSiteConfig: function () {
                let self = this;
                return new Promise(function (resolve, reject) {

                    $.ajax({
                        url: self.globalApp.siteConfigUrl,
                        type: "GET",
                        crossDomain: true,
                        dataType: "json",
                        success: function (res) {
                            self.siteConfig = res;
                            resolve();
                        },
                        error: function (xhr, status, errorThrown) {
                            console.log("Error: " + errorThrown);
                            console.log("Status: " + status);
                            console.log(xhr);
                            reject("Error " + errorThrown + " occurred in promiseLoadSiteConfig() when attempting get siteConfig.json ");
                        }
                    });

                });

            },
            onLoadDemoData: function () {
                let self = this;
                self.promiseClearCache()
                    .then(function () {
                        if (self.$refs.navRef) {
                            self.$refs.navRef.closeFileMenu();
                        }
                        self.geneModel.promiseAddGeneName(self.cohortModel.demoGenes[0])
                            .then(() => {
                                self.geneModel.promiseGetGeneObject(self.cohortModel.demoGenes[0])
                                    .then(function (theGeneObject) {
                                        self.selectedGene = theGeneObject;
                                        self.selectedTranscript = self.geneModel.getCanonicalTranscript(self.selectedGene);
                                        if (self.$refs.navRef) {
                                            self.$refs.navRef.onAutoLoad();
                                        }
                                    });
                            });
                    });
            },
            // Old gene version:
            // onLoadDemoData: function () {
            //     let self = this;
            //     self.promiseClearCache()
            //         .then(function () {
            //             self.onGeneSelected(self.cohortModel.demoGenes[0]);
            //             return self.cohortModel.promiseInitDemo();
            //         })
            //         .then(function () {
            //             self.models = self.cohortModel.sampleModels;
            //             if (self.selectedGene && Object.keys(self.selectedGene).length > 0) {
            //                 self.promiseLoadData()
            //                     .then(function () {
            //                         if (self.cohortModel && self.cohortModel.isLoaded && !self.isEduMode) {
            //                             self.cacheHelper.analyzeAll(self.cohortModel, false);
            //                         }
            //                     });
            //             }
            //         })
            // },
            openFileSelection: function () {
                let self = this;
                if (self.$refs.navRef) {
                    self.$refs.navRef.openFileSelection();
                }
            },
            promiseLoadData: function (loadingFromFlagEvent = false, loadFeatureMatrix = true) {
                let self = this;

                return new Promise(function (resolve, reject) {

                    if (self.models && self.models.length > 0) {
                        self.cardWidth = $('#genes-card').innerWidth();
                        var options = {'getKnownVariants': self.showKnownVariantsCard};
                        options['getCosmicVariants'] = self.showCosmicVariantsCard;
                        options['loadFromFlag'] = loadingFromFlagEvent;
                        options['loadFeatureMatrix'] = loadFeatureMatrix;

                        self.cohortModel.promiseLoadData(self.selectedGene,
                            self.selectedTranscript,
                            options)
                            .then(function(resultMap) {
                                self.onUpdateSamples();

                                self.calcFeatureMatrixWidthPercent();

                                self.filterModel.populateEffectFilters(resultMap);
                                self.filterModel.populateRecFilters(resultMap);

                                // TODO: doesn't work w/ intervals not even in 1
                                const nodeRange = 0.10;
                                self.cohortModel.varAfNodes = self.cohortModel.getVariantAFNodes(nodeRange);
                                self.cohortModel.varAfLinks = self.cohortModel.getVariantAFLinks(self.cohortModel.varAfNodes, nodeRange);

                                self.cohortModel.promiseMarkCodingRegions(self.selectedGene, self.selectedTranscript)
                                    .then(function (data) {
                                        self.analyzedTranscript = data.transcript;
                                        self.coverageDangerRegions = data.dangerRegions;
                                        self.$refs.genesCardRef.determineFlaggedGenes();
                                        resolve();
                                    });
                            })
                            .catch(function (error) {
                                reject(error);
                            })
                    } else {
                        Promise.resolve();
                    }
                })
            },


            callVariants: function (theGene) {
                let self = this;
                if (theGene == null) {
                    self.cacheHelper.analyzeAll(self.cohortModel, true);
                } else {
                    self.cohortModel.promiseJointCallVariants(self.selectedGene,
                        self.selectedTranscript,
                        self.cohortModel.getCurrentTrioVcfData(),
                        {checkCache: false, isBackground: false})
                        .then(function () {
                            self.$refs.genesCardRef.determineFlaggedGenes();
                        })
                }
            },

            /* Assumes only called when something changes in files menu (or on first load) */
            onFilesLoaded: function (analyzeAll) {
                let self = this;
                self.showVariantCards = true;
                //self.setUrlParameters();

                // Hide viz ref until we've re-rendered
                self.showVarViz = false;

                self.promiseClearCache()
                    .then(function () {
                        self.featureMatrixModel.init(self.cohortModel.getCanonicalModels());
                        Promise.resolve();

                        // TODO: once we get multiple sites incorporated get this fixed
                        // if (self.firstLaunchFromFileMenu) {
                        //     self.firstLaunchFromFileMenu = false;
                        //     return Promise.resolve();
                        // } else {
                        //     return self.promiseResetAllGenes();
                        // }
                    })
                    .then(function () {
                        const loadFeatureMatrix = false;
                        if (self.selectedGene && self.selectedGene.gene_name) {
                            self.promiseLoadGene(self.selectedGene.gene_name, null, false, loadFeatureMatrix);

                            // if (analyzeAll) {
                            //     if (self.cohortModel && self.cohortModel.isLoaded) {
                            //         self.cacheHelper.analyzeAll(self.cohortModel, false);
                            //     }
                            // }

                        } else if (self.geneModel.sortedGeneNames && self.geneModel.sortedGeneNames.length > 0) {
                            self.onGeneSelected(self.geneModel.sortedGeneNames[0]);
                        } else {
                            self.onShowSnackbar({message: 'Enter a gene name or a phenotype term.', timeout: 5000});
                            self.bringAttention = 'gene';
                        }
                    });
            },
            setUrlParameters: function () {
                let self = this;

                let geneName = "";
                let geneNames = "";
                if (self.selectedGene && self.selectedGene.gene_name) {
                    geneName = self.selectedGene.gene_name
                } else if (self.geneModel.sortedGeneNames && self.geneModel.sortedGeneNames.length > 0) {
                    geneName = self.geneModel.sortedGeneNames[0];
                }
                if (self.geneModel.sortedGeneNames && self.geneModel.sortedGeneNames.length > 0) {
                    geneNames = self.geneModel.sortedGeneNames.join(",");
                }

                let queryObject = {
                    gene: geneName,
                    genes: geneNames,
                    species: self.genomeBuildHelper.getCurrentSpeciesName(),
                    build: self.genomeBuildHelper.getCurrentBuildName()
                };

                let i = 0;
                self.cohortModel.getCanonicalModels().forEach(function (model) {
                    queryObject['id' + i] = model.id;
                    queryObject['vcf' + i] = model.vcf && model.vcf.getVcfURL() ? model.vcf.getVcfURL() : "";
                    queryObject['tbi' + i] = model.vcf && model.vcf.getTbiURL() ? model.vcf.getTbiURL() : "";
                    queryObject['bam' + i] = model.bam && model.bam.bamUri ? model.bam.bamUri : "";
                    queryObject['bai' + i] = model.bam && model.bam.baiUri ? model.bam.baiUri : "";
                    queryObject['displayName' + i] = model.getDisplayName() ? model.getDisplayName() : "";
                    queryObject['selectedSample' + i] = model.selectedSample ? model.selectedSample : "";
                    queryObject['isTumor' + i] = model.getTumorStatus();
                    i++;
                });
                self.$router.replace({query: queryObject});
            },

            setUrlGeneParameters() {

                let self = this;

                var queryObjectExisting = this.$route.query;
                var queryObject = $().extend({}, queryObjectExisting);

                let geneName = "";
                let geneNames = "";
                if (self.selectedGene && self.selectedGene.gene_name) {
                    geneName = self.selectedGene.gene_name
                } else if (self.geneModel.sortedGeneNames && self.geneModel.sortedGeneNames.length > 0) {
                    geneName = self.geneModel.sortedGeneNames[0];
                }
                if (self.geneModel.sortedGeneNames && self.geneModel.sortedGeneNames.length > 0) {
                    geneNames = self.geneModel.sortedGeneNames.join(",");
                }
                queryObject.gene = geneName;
                queryObject.geneNames = geneNames;

                self.$router.replace({query: queryObject});


            },

            onGeneNameEntered: function (geneName) {
                let self = this;
                self.clearFilter();
                self.deselectVariant();
                let loadFeatureMatrix = false;
                self.promiseLoadGene(geneName, null, false, loadFeatureMatrix)
                    .then(function () {
                        self.onSendGenesToClin();
                        self.activeGeneVariantTab = "feature-matrix-tab";
                        //self.setUrlGeneParameters();
                        self.showLeftPanelWhenFlaggedVariants();
                    })
            },

            onGeneClicked: function (geneName) {
                var self = this;

                self.deselectVariant();

                self.promiseLoadGene(geneName)
                    .then(function () {
                        //self.setUrlGeneParameters();
                        self.showLeftPanelWhenFlaggedVariants();
                    })
                self.activeGeneVariantTab = "feature-matrix-tab";

            },

            onGeneSelected: function (geneName) {
                var self = this;

                self.deselectVariant();
                self.promiseLoadGene(geneName, null, false);
                self.activeGeneVariantTab = "feature-matrix-tab";

            },

            showLeftPanelWhenFlaggedVariants: function () {
                let self = this;
                if (!self.isEduMode && self.flaggedVariants && self.flaggedVariants.length > 0 && !self.isLeftDrawerOpen) {
                    if (self.$refs.navRef) {
                        self.$refs.navRef.onShowFlaggedVariants();
                    }
                }
            },

            promiseLoadGene: function (geneName, theTranscript, loadingFromFlagEvent = false, loadFeatureMatrix = true) {
                const self = this;
                self.showWelcome = false;
                self.clearZoom = true;
                self.applyFilters = false;
                return new Promise(function (resolve, reject) {
                    if (self.cohortModel) {
                        self.cohortModel.clearLoadedData(geneName);
                    }
                    if (self.featureMatrixModel) {
                        self.featureMatrixModel.clearRankedVariants();
                    }
                    self.geneModel.promiseAddGeneName(geneName)
                        .then(function () {
                            self.geneModel.promiseGetGeneObject(geneName)
                                .then(function (theGeneObject) {
                                    if (self.bringAttention === 'gene') {
                                        self.bringAttention = null;
                                    }
                                    self.geneModel.adjustGeneRegion(theGeneObject);
                                    self.geneRegionStart = theGeneObject.start;
                                    self.geneRegionEnd = theGeneObject.end;
                                    self.selectedGene = theGeneObject;

                                    if (theTranscript) {
                                        // If we have selected a flagged variant, we want to use the flagged
                                        // variant's transcript
                                        self.selectedTranscript = theTranscript;
                                    } else {
                                        // Determine the transcript that should be selected for this gene
                                        // If the transcript wasn't previously selected for this gene,
                                        // set it to the canonical transcript
                                        let latestTranscript = self.geneModel.getLatestGeneTranscript(geneName);
                                        if (latestTranscript == null) {
                                            self.selectedTranscript = self.geneModel.getCanonicalTranscript(self.selectedGene);
                                            self.geneModel.setLatestGeneTranscript(geneName, self.selectedTranscript);
                                        } else {
                                            self.selectedTranscript = latestTranscript;
                                        }
                                    }

                                    if (self.$refs.scrollButtonRefGene) {
                                        self.$refs.scrollButtonRefGene.showScrollButtons();
                                    }
                                    if (self.cohortModel.isLoaded) {
                                        self.promiseLoadData(loadingFromFlagEvent, loadFeatureMatrix)
                                            .then(function () {
                                                self.clearZoom = false;
                                                self.showVarViz = true;
                                                self.applyFilters = true;
                                                resolve();
                                            })
                                            .catch(function (err) {
                                                console.log(err);
                                                reject(err);
                                            })
                                    } else {
                                        resolve();
                                    }
                                })
                        })
                        .catch(function (error) {
                            console.log(error);
                            self.geneModel.removeGene(geneName);
                            self.onShowSnackbar({
                                message: 'Bypassing ' + geneName + '. Unable to find transcripts.',
                                timeout: 60000
                            })
                        })
                })
            },
            onTranscriptIdSelected: function (transcriptId) {
                const self = this;
                let theTranscript = null;
                self.selectedGene.transcripts.filter(function (transcript) {
                    if (transcript.transcript_id.indexOf(transcriptId) == 0) {
                        theTranscript = transcript;
                    }
                })
                if (theTranscript != null) {
                    self.onTranscriptSelected(theTranscript);
                }
            },
            onTranscriptSelected: function (transcript) {
                const self = this;
                self.selectedTranscript = transcript;
                self.geneModel.setLatestGeneTranscript(self.selectedGene.gene_name, self.selectedTranscript);
                self.onGeneSelected(self.selectedGene.gene_name);
            },
            onGeneSourceSelected: function (theGeneSource) {
                const self = this;
                self.geneModel.geneSource = theGeneSource;
                this.onGeneSelected(this.selectedGene.gene_name);
            },
            onGeneRegionBufferChange: function (theGeneRegionBuffer) {
                const self = this;
                self.geneModel.geneRegionBuffer = theGeneRegionBuffer;
                // We have to clear the cache since the gene regions change
                self.promiseClearCache()
                    .then(function () {
                        self.onGeneSelected(self.selectedGene.gene_name);
                    })
            },
            onGeneRegionZoom: function (theStart, theEnd) {
                const self = this;
                // Gene-viz watches these for updates to redraw track
                self.geneRegionStart = theStart;
                self.geneRegionEnd = theEnd;

                self.featureMatrixModel.setRankedVariants(self.geneRegionStart, self.geneRegionEnd);

                self.filterModel.regionStart = self.geneRegionStart;
                self.filterModel.regionEnd = self.geneRegionEnd;

                let start = Date.now();
                self.cohortModel.setLoadedVariants(self.selectedGene);
                let delta = Date.now() - start;
                console.log("Took " + delta + " ms to zoom region");
                self.cohortModel.setCoverage(self.geneRegionStart, self.geneRegionEnd);

            },
            onGeneRegionZoomReset: function (updateTrack = true) {
                const self = this;

                self.geneRegionStart = self.selectedGene.start;
                self.geneRegionEnd = self.selectedGene.end;

                self.filterModel.regionStart = null;
                self.filterModel.regionEnd = null;

                if (updateTrack) {
                    self.featureMatrixModel.setRankedVariants();
                    let start = Date.now();
                    self.cohortModel.setLoadedVariants(self.selectedGene);
                    let delta = Date.now() - start;
                    console.log("Took " + delta + " ms to RESET zoom region");
                    self.cohortModel.setCoverage();
                }
            },
            onCircleVariant: function (idx) {
                const self = this;
                let variant = self.cohortModel.getProbandModel().loadedVariants.features[2];
                self.onCohortVariantClick(variant, null, variant.sampleModelId);
            },
            onCohortVariantClick: function (variant, sourceComponent, sampleModelId) {
                const self = this;
                if (variant) {
                    self.calcFeatureMatrixWidthPercent();
                    self.selectedVariant = variant;
                    self.selectedVariantParentSampleId = sampleModelId;
                    self.selectedVariantNotes = variant.notes;
                    self.selectedVariantInterpretation = variant.interpretation;
                    self.activeGeneVariantTab = self.isBasicMode ? "feature-matrix-tab" : "var-detail-tab";
                    self.showVariantExtraAnnots(sampleModelId, variant);

                    self.$refs.variantCardRef.forEach(function (variantCard) {
                        if (sourceComponent == null || variantCard != sourceComponent) {
                            variantCard.hideVariantCircle(true);
                            variantCard.showVariantCircle(variant, true);
                            variantCard.showCoverageCircle(variant);
                        }
                    });
                    // if (!self.isBasicMode && self.$refs.featureMatrixCardRef) {
                    //     if (sourceComponent == null || self.$refs.featureMatrixCardRef != sourceComponent) {
                    //         self.$refs.featureMatrixCardRef.selectVariant(self.selectedVariant);
                    //     }
                    // }
                    // if (self.isEduMode) {
                    //     self.$refs.appTourRef.checkVariant(variant);
                    // }
                    if (self.$refs.scrollButtonRefVariant) {
                        self.$refs.scrollButtonRefVariant.showScrollButtons();
                    }

                } else {
                    self.deselectVariant();
                }
            },
            onCohortVariantHover: function (variant, sourceComponent) {
                const self = this;
                self.$refs.variantCardRef.forEach(function (variantCard) {
                    if (variantCard != sourceComponent) {
                        variantCard.showVariantCircle(variant, false);
                        variantCard.showCoverageCircle(variant);
                    }
                })
                if (self.$refs.featureMatrixCardRef != sourceComponent) {
                    self.$refs.featureMatrixCardRef.selectVariant(variant, 'highlight');
                }
            },
            onCohortVariantHoverEnd: function (sourceVariantCard) {
                const self = this;
                if (self.$refs.variantCardRef) {
                    self.$refs.variantCardRef.forEach(function (variantCard) {
                        variantCard.hideVariantCircle(false);
                        variantCard.hideCoverageCircle();
                    });
                    self.$refs.featureMatrixCardRef.selectVariant(null, 'highlight');

                }
            },
            deselectVariant: function () {
                const self = this;
                self.selectedVariant = null;
                self.selectedVariantRelationship = null;
                self.activeGeneVariantTab = "feature-matrix-tab";
                if (self.$refs.variantCardRef) {
                    self.$refs.variantCardRef.forEach(function (variantCard) {
                        variantCard.hideVariantTooltip();
                        variantCard.hideVariantCircle(true);
                        variantCard.hideCoverageCircle();
                    })
                }
                if (self.$refs.featureMatrixCardRef) {
                    self.$refs.featureMatrixCardRef.selectVariant(null);
                }
            },
            showVariantExtraAnnots: function (parentSampleId, variant) {
                let self = this;
                if (!self.isEduMode && !self.cohortModel.getModel(parentSampleId).isAlignmentsOnly()) {
                    if (parentSampleId === 'known-variants') {
                        self.cohortModel
                            .getModel(parentSampleId)
                            .promiseGetVariantExtraAnnotations(self.selectedGene, self.selectedTranscript, self.selectedVariant)
                            .then(function (refreshedVariant) {
                                self.refreshVariantExtraAnnots(parentSampleId, variant, [refreshedVariant]);
                            })
                        // TODO: need to put else if cosmic-variants
                    } else {
                        self.cohortModel
                            .getModel(parentSampleId)
                            .promiseGetImpactfulVariantIds(self.selectedGene, self.selectedTranscript)
                            .then(function (annotatedVariants) {
                                // If the clicked variant is in the list of annotated variants, show the
                                // tooltip; otherwise, the callback will get the extra annots for this
                                // specific variant
                                self.refreshVariantExtraAnnots(parentSampleId, variant, annotatedVariants, function () {
                                    // The clicked variant wasn't annotated in the batch of variants.  Get the
                                    // extra annots for this specific variant.
                                    self.cohortModel
                                        .getModel(parentSampleId)
                                        .promiseGetVariantExtraAnnotations(self.selectedGene, self.selectedTranscript, self.selectedVariant)
                                        .then(function (refreshedVariant) {
                                            self.refreshVariantExtraAnnots(parentSampleId, variant, [refreshedVariant]);
                                        })
                                })
                            });


                    }
                }
            },

            refreshVariantExtraAnnots: function (sourceComponent, variant, annotatedVariants, callbackNotFound) {
                let self = this;
                var targetVariants = annotatedVariants.filter(function (v) {
                    return variant &&
                        variant.start === v.start &&
                        variant.ref === v.ref &&
                        variant.alt === v.alt;
                });
                if (targetVariants.length > 0) {
                    var annotatedVariant = targetVariants[0];
                    annotatedVariant.screenX = variant.screenX;
                    annotatedVariant.screenY = variant.screenY;
                    annotatedVariant.screenXMatrix = variant.screenXMatrix;
                    annotatedVariant.screenYMatrix = variant.screenYMatrix;

                    variant.extraAnnot = true;
                    variant.vepHGVSc = annotatedVariant.vepHGVSc;
                    variant.vepHGVSp = annotatedVariant.vepHGVSp;
                    variant.vepVariationIds = annotatedVariant.vepVariationIds;


                } else {
                    if (callbackNotFound) {
                        callbackNotFound();
                    }
                }

            },
            onKnownVariantsVizChange: function (viz) {
                let self = this;
                if (viz) {
                    self.cohortModel.knownVariantsViz = viz;
                }
                if (self.showKnownVariantsCard && self.cohortModel && self.cohortModel.isLoaded && Object.keys(self.selectedGene).length > 0) {
                    self.cohortModel.promiseLoadKnownVariants(self.selectedGene, self.selectedTranscript);
                }
            },
            onCosmicVariantsVizChange: function (viz) {
                let self = this;
                if (viz) {
                    self.cohortModel.cosmicVariantsViz = viz;
                }
                if (self.showCosmicVariantsCard && self.cohortModel && self.cohortModel.isLoaded && Object.keys(self.selectedGene).length > 0) {
                    self.cohortModel.promiseLoadCosmicVariants(self.selectedGene, self.selectedTranscript);
                }
            },
            onKnownVariantsFilterChange: function (selectedCategories) {
                let self = this;
                self.filterModel.setModelFilter('known-variants', 'clinvar', selectedCategories);

                self.cohortModel.setLoadedVariants(self.selectedGene, 'known-variants');
            },
            onCosmicVariantsFilterChange: function (selectedCategories) {
                let self = this;
                self.filterModel.setModelFilter('cosmic-variants', 'vepImpact', selectedCategories);
                self.cohortModel.setLoadedVariants(self.selectedGene, 'cosmic-variants');
            },
            onRemoveGene: function (geneName) {
                let self = this;
                let msg = "";
                var filters = this.cohortModel.getFlaggedVariantsByFilter(geneName);
                filters.forEach(function (filter) {
                    msg += filter.variants.length
                        + (filter.variants.length > 1 ? " variants " : " variant ")
                        + " marked as '"
                        + filter.filter.title
                        + "' "
                        + (filter.variants.length > 1 ? " exist in gene " : " exists in gene ")
                        + geneName + ".<br><br>";
                });
                msg += "Are you sure you want to remove gene " + geneName + "?"
                alertify.confirm("",
                    msg,
                    function (e) {
                        // ok
                        self.removeGeneImpl(geneName);
                    },
                    function () {
                        // cancel
                    }
                ).set('labels', {ok: 'OK', cancel: 'Cancel'});

            },

            removeGeneImpl: function (geneName) {
                let self = this;

                self.geneModel.removeGene(geneName);
                self.cohortModel.removeFlaggedVariantsForGene(geneName);
                self.clearFilter();
                self.cacheHelper.clearCacheForGene(geneName);
                self.onSendGenesToClin();
                var newGeneToSelect = null;
                if (geneName == this.selectedGene.gene_name && this.geneModel.sortedGeneNames.length > 0) {
                    newGeneToSelect = this.geneModel.sortedGeneNames[0];
                    self.deselectVariant();
                    self.promiseLoadGene(newGeneToSelect)
                        .then(function () {
                            self.activeGeneVariantTab = "feature-matrix-tab";
                            self.setUrlGeneParameters();
                        })
                } else {
                    self.setUrlGeneParameters();
                }

            },

            onGenesReplaced: function (oldGeneNames, newGeneNames) {
                let self = this;

                var removedGeneNames = oldGeneNames.filter(function (geneName) {
                    return newGeneNames.indexOf(geneName) == -1;
                })

                removedGeneNames.forEach(function (geneName) {
                    self.cohortModel.removeFlaggedVariantsForGene(geneName);
                    self.clearFilter();
                    self.cacheHelper.clearCacheForGene(geneName);
                })
                self.onSendGenesToClin();
            },

            onAnalyzeAll: function () {
                this.cacheHelper.analyzeAll(this.cohortModel);
            },
            onFilterSelected: function (filterName, filteredGeneNames) {
                this.activeFilterName = filterName;
                this.filteredGeneNames = filteredGeneNames;
                if (filterName === 'coverage') {
                    //this.showLeftPanelForGenes(); NOTE: ignoring left panel for aacr
                    this.onGeneSelected(this.selectedGene.gene_name);
                }
            },
            onClearAllGenes: function () {
                this.clearFilter();
                this.selectedGene = {};
                this.geneModel.clearAllGenes();
                this.cohortModel.flaggedVariants = [];
            },
            onStartSearchGenes: function () {
                this.bringAttention = null;
            },
            promiseResetAllGenes: function () {
                let self = this;
                if (self.geneModel.sortedGeneNames == null || self.geneModel.sortedGeneNames.length === 0) {
                    return Promise.resolve();
                } else {
                    return new Promise(function (resolve, reject) {
                        self.clearFilter();
                        let geneToSelect = $.extend(self.selectedGene);
                        self.selectedGene = {};
                        self.selectedTranscript = null;
                        self.selectedVariant = null;
                        self.activeGeneVariantTab = "feature-matrix-tab";

                        let genesToReapply = $.extend([], self.geneModel.sortedGeneNames);

                        self.geneModel.clearAllGenes();
                        self.cohortModel.flaggedVariants = [];

                        self.applyGenesImpl(genesToReapply.join(","), {
                                replace: true,
                                warnOnDup: false,
                                isFromClin: false
                            },
                            function () {
                                self.selectedGene = geneToSelect;
                                resolve();
                            });
                    })
                }
            },
            clearFilter: function () {
                if (this.$refs.genesCardRef) {
                    this.$refs.genesCardRef.clearFilter();
                }
            },
            onApplyGenes: function (genesString, options, callback) {
                let self = this;

                self.clearFilter();

                let existingGeneCount = self.geneModel.sortedGeneNames.length;
                let existingPhenotypeTerm = self.phenotypeTerm;

                self.phenotypeTerm = options ? options.phenotypes : null;
                var theOptions = $.extend(
                    {
                        isFromClin: false,
                        replace: self.geneModel.geneNames.length == 0 ? false : true,
                        warnOnDup: false
                    },
                    options);


                let genesToApplyCount = self.geneModel.getCopyPasteGeneCount(genesString);

                let doIt = function () {
                    let oldGeneNames = $.extend([], self.geneModel.sortedGeneNames);
                    self.applyGenesImpl(genesString, options, function () {
                        if (options && options.replace) {
                            self.onGenesReplaced(oldGeneNames, self.geneModel.sortedGeneNames);
                        }
                        if (!options.isFromClin) {
                            self.onSendGenesToClin();
                        }
                        if (callback) {
                            callback();
                        }
                    })
                    if (self.phenotypeTerm && self.phenotypeTerm.length > 0) {
                        self.onShowSnackbar({
                            message: "Adding genes associated with '" + self.phenotypeTerm + "'",
                            timeout: 6000
                        })
                    }
                }

                if (self.phenotypeTerm && !options.isFromClin && existingGeneCount > 0 && existingPhenotypeTerm != self.phenotypeTerm) {
                    let msg = "Replace existing genes with the " + genesToApplyCount + " genes associated with <br>'" + self.phenotypeTerm + "'?";
                    alertify.confirm("",
                        msg,
                        function (e) {
                            // ok
                            options.replace = true;
                            doIt();
                        },
                        function () {
                            // cancel
                            options.replace = false;
                            doIt();
                        }
                    ).set('labels', {ok: 'Replace gene list', cancel: 'Combine genes with current list'});

                } else {
                    doIt();
                }


            },
            applyGenesImpl: function (genesString, options, callback) {
                let self = this;
                self.selectedGene = {};
                self.geneModel.promiseCopyPasteGenes(genesString, options)
                    .then(function () {
                        if (self.geneModel.sortedGeneNames && self.geneModel.sortedGeneNames.length > 0) {
                            let geneName = self.geneModel.sortedGeneNames[0];
                            return self.promiseLoadGene(geneName);
                        } else {
                            return Promise.resolve();
                        }
                    })
                    .then(function () {
                        if (!self.launchedFromClin) {
                            if (self.geneModel.sortedGeneNames && self.geneModel.sortedGeneNames.length > 0) {
                                if (self.cohortModel && self.cohortModel.isLoaded && !self.isEduMode) {
                                    self.cacheHelper.analyzeAll(self.cohortModel, false);
                                    if (callback) {
                                        callback();
                                    }
                                }
                            }
                        } else {
                            if (callback) {
                                callback();
                            }
                        }
                    })

            },
            onSortGenes: function (sortBy) {
                this.geneModel.sortGenes(sortBy);
            },
            setAppMode: function () {
                let self = this;
                if (self.paramMyGene2 && self.paramMyGene2 != "") {
                    self.forMyGene2 = self.paramMyGene2 == "false" || self.paramMyGene2.toUpperCase() == "N" ? false : true;
                }
                if (self.paramMode && self.paramMode != "") {
                    self.isBasicMode = self.paramMode == "basic" ? true : false;
                    self.isEduMode = (self.paramMode == "edu" || self.paramMode == "edutour") ? true : false;
                }
                if (localStorage.getItem('hub-iobio-tkn') && localStorage.getItem('hub-iobio-tkn').length > 0 && self.paramSampleId && self.paramSource) {
                    self.launchedFromHub = true;
                }

                if (self.paramTour) {
                    self.tourNumber = self.paramTour;
                }
            },
            promiseInitFromUrl: function () {
                let self = this;

                return new Promise(function (resolve, reject) {
                    if (self.paramLaunchedFromClin) {
                        self.launchedFromClin = true;
                    }
                    if (self.paramGeneSource) {
                        self.geneModel.geneSource = self.paramGeneSource;
                    }
                    if (self.paramGenes) {
                        self.paramGenes.split(",").forEach(function (geneName) {
                            self.geneModel.promiseAddGeneName(geneName);
                        });
                    }
                    if (self.paramGene) {
                        self.geneModel.promiseAddGeneName(self.paramGene);
                        self.onGeneSelected(self.paramGene);
                    } else if (self.paramGeneName) {
                        self.geneModel.promiseAddGeneName(self.paramGeneName);
                        self.onGeneSelected(self.paramGeneName);
                    }
                    if (self.paramSpecies) {
                        self.genomeBuildHelper.setCurrentSpecies(self.paramSpecies);
                    }
                    if (self.paramBuild) {
                        self.genomeBuildHelper.setCurrentBuild(self.paramBuild);
                    }
                    if (self.paramBatchSize) {
                        self.globalApp.DEFAULT_BATCH_SIZE = self.paramBatchSize;
                    }

                    // Extract lists from collective params
                    let sampleNames = [];
                    let tumorStatuses = [];
                    let vcfs = [];
                    let tbis = [];
                    let bams = [];
                    let bais = [];

                    if (self.paramSamples != null) {
                        sampleNames = self.paramSamples.split(',');
                        tumorStatuses = self.paramTumorStatus.split(',');
                        vcfs = self.paramVcfs.split(',');
                        tbis = self.paramTbis.split(',');
                        bams = self.paramBams.split(',');
                        bais = self.paramBais.split(',');
                    }

                    let modelInfos = [];
                    for (let i = 0; i < sampleNames.length; i++) {
                        let modelInfo = {'name': sampleNames[i]};
                        modelInfo.id = tumorStatuses[i] ? 'n' + i : 't' + (i - 1);
                        modelInfo.name = sampleNames[i];
                        modelInfo.isTumor = tumorStatuses[i];
                        modelInfo.vcf = vcfs[i];
                        modelInfo.tbi = tbis[i];
                        modelInfo.bam = bams[i];
                        modelInfo.bai = bais[i];
                        modelInfos.order = i;
                        modelInfos.push(modelInfo);
                        self.launchedWithUrlParms = true;
                    }

                    if (modelInfos.length > 0) {
                        self.cohortModel.promiseInit(modelInfos)
                            .then(function () {
                                resolve();
                            }).catch(function (error) {
                            reject(error);
                        })
                    } else if (self.isEduMode && self.tourNumber !== '') {
                        self.promiseInitTourSample(self.tourNumber, 0)
                            .then(function () {
                                resolve();
                            })
                    } else if (self.forMyGene2) {
                        self.promiseInitMyGene2()
                            .then(function () {
                                resolve();
                            })
                    } else {
                        resolve();
                    }
                })

            },
            onFlagVariant: function (variant) {
                let self = this;

                variant.gene = this.selectedGene;
                variant.transcript = this.selectedTranscript;
                self.cohortModel.addUserFlaggedVariant(self.selectedGene, self.selectedTranscript, variant);

                // Refresh the loaded variants so that the ranked variants table
                // reflects the flagged variants
                self.promiseLoadGene(self.selectedGene.gene_name, null, true)
                    .then(function () {
                        self.onCohortVariantClick(variant, null, variant.sampleModelId);
                    });
            },
            onRemoveUserFlaggedVariant: function (variant) {
                let self = this;

                variant.isFlagged = false;
                variant.featureClass = "";
                self.cohortModel.removeUserFlaggedVariant(self.selectedGene, self.selectedTranscript, variant);


                // Refresh the loaded variants so that the ranked variants table
                // reflects the flagged variants
                self.promiseLoadGene(self.selectedGene.gene_name)
                    .then(function () {
                        self.onCohortVariantClick(variant, self.$refs.variantCardRef[0], variant.sampleModelId);
                    })
            },
            // onRemoveFlaggedVariant: function (variant) {
            //     let self = this;
            //     variant.isFlagged = false;
            //     variant.featureClass = "";
            //     if (variant.filtersPassed == null) {
            //         variant.filtersPassed = ['userFlagged'];
            //     }
            //     self.cohortModel.removeFlaggedVariant(self.selectedGene, self.selectedTranscript, variant);
            //     self.flaggedVariants = this.cohortModel.flaggedVariants;
            //     if (!self.isEduMode) {
            //         self.$refs.navRef.onShowFlaggedVariants();
            //     }
            //     // Refresh the loaded variants so that the ranked variants table
            //     // reflects the flagged variants
            //     self.promiseLoadGene(self.selectedGene.gene_name)
            //         .then(function () {
            //             self.onCohortVariantClick(variant, self.$refs.variantCardRef[0], 'proband');
            //         })
            //
            //     if (self.launchedFromClin) {
            //         self.onSendFlaggedVariantsToClin();
            //     }
            //
            // },
            onAddFlaggedVariants: function (flaggedVariants) {
                let self = this;
                flaggedVariants.forEach(function (variant) {
                    variant.gene = self.geneModel.geneObjects[variant.geneName];
                    self.cohortModel.addFlaggedVariant(self.selectedGene, self.selectedTranscript, variant);
                })
            },
            // onRegisterFlaggedVariants: function (flaggedGeneNames, flaggedVariants) {
            //     let self = this;
            //     self.flaggedVariants = [];
            //     self.flaggedVariants = flaggedVariants;
            //     if (self.launchedFromClin) {
            //         self.onSendFlaggedVariantsToClin();
            //     }
            // },
            onFlaggedVariantsImported: function () {
                // Not implemented in dev gene yet
            },
            onFlaggedVariantSelected: function (flaggedVariant) {
                let self = this;


                let canonicalTranscript = self.geneModel.getCanonicalTranscript(flaggedVariant.gene);

                // Only select the gene if it hasn't previously been selected or the transcript is different
                let genePromise = null;
                if (self.selectedGene.gene_name == flaggedVariant.gene.gene_name) {
                    genePromise = Promise.resolve();
                } else if (flaggedVariant.transcript == null
                    && self.selectedTranscript
                    && self.selectedTranscript.transcript_id == canonicalTranscript.transcript_id) {
                    // No need to reselect the gene if the canonical transcript is already selected for the same gene
                    genePromise = Promise.resolve();
                } else if (flaggedVariant.transcript
                    && self.selectedTranscript.transcript_id == flaggedVariant.transcript.transcript_id) {
                    // No need to reselect the gene if the same transcript on the same gene is already selecte
                    genePromise = Promise.resolve();
                } else {
                    self.selectedGene = flaggedVariant.gene;
                    if (flaggedVariant.transcript) {
                        self.selectedTranscript = flaggedVariant.transcript;
                    } else {
                        self.selectedTranscript = self.geneModel.getCanonicalTranscript(self.selectedGene);
                    }
                    self.selectedVariant = null;
                    genePromise = self.promiseLoadGene(self.selectedGene.gene_name, self.selectedTranscript);
                }

                genePromise
                    .then(function () {

                        setTimeout(
                            function () {
                                self.calcFeatureMatrixWidthPercent();
                                self.showVariantExtraAnnots(self.$refs.featureMatrixCardRef, flaggedVariant);


                                self.$set(self, "selectedVariant", flaggedVariant);
                                self.$refs.variantCardRef.forEach(function (variantCard) {
                                    if (variantCard.relationship == 'proband') {
                                        variantCard.showFlaggedVariant(flaggedVariant);
                                    }
                                })

                                self.$refs.featureMatrixCardRef.selectVariant(flaggedVariant);


                                self.$refs.variantCardRef.forEach(function (variantCard) {
                                    variantCard.showVariantCircle(flaggedVariant, true);
                                    variantCard.showCoverageCircle(flaggedVariant);
                                })


                                self.activeGeneVariantTab = "var-detail-tab";
                                self.$refs.variantDetailCardRef.refreshGlyphs();
                            },
                            500);

                    });
            },
            onShowKnownVariantsCard: function (showIt) {
                let self = this;
                self.showKnownVariantsCard = showIt;
                if (self.showKnownVariantsCard) {
                    self.onKnownVariantsVizChange();
                }
            },
            onShowCosmicVariantsCard: function (showIt) {
                let self = this;
                self.showCosmicVariantsCard = showIt;
                if (self.showCosmicVariantsCard) {
                    self.onCosmicVariantsVizChange();
                }
            },
            onFilterSettingsApplied: function () {
                let self = this;
                self.cohortModel.cacheHelper.refreshGeneBadges(function () {
                    if (self.$refs.genesCardRef) {
                        self.$refs.genesCardRef.updateGeneBadgeCounts();
                        self.$refs.genesCardRef.determineFlaggedGenes();
                        self.cohortModel.flaggedVariants = self.flaggedVariants;
                    }
                    if (!self.isEduMode && self.cohortModel.flaggedVariants && self.cohortModel.flaggedVariants.length > 0) {
                        self.$refs.navRef.onShowFlaggedVariants();
                    }
                    if (self.launchedFromClin) {
                        self.onSendFiltersToClin();
                    }
                })
            },
            onLeftDrawer: function (isOpen) {
                if (!this.isEduMode) {
                    this.isLeftDrawerOpen = isOpen;
                }
            },
            onShowWelcome: function () {
                this.showWelcome = true;
            },
            promiseInitMyGene2: function () {
                let self = this;
                return new Promise(function (resolve, reject) {
                    self.cohortModel.promiseInitMyGene2(self.siteConfig, self.paramFileId)
                        .then(function () {
                            self.models = self.cohortModel.sampleModels;
                            var geneName = null;
                            if (self.selectedGene && self.selectedGene.gene_name) {
                                geneName = self.selectedGene.gene_name;
                            } else if (self.geneModel.sortedGeneNames && self.geneModel.sortedGeneNames.length > 0) {
                                geneName = self.geneModel.sortedGeneNames[0];
                            }
                            if (geneName) {
                                self.promiseLoadGene(geneName)
                                    .then(function () {
                                        self.cacheHelper.analyzeAll(self.cohortModel, false);
                                        resolve();
                                    })
                                    .catch(function (error) {
                                        reject(error);
                                    })
                            } else {
                                resolve();
                            }
                        })
                })
            },

            onTakeAppTour: function () {
                this.onLoadDemoData();
                this.$refs.appTourRef.startTour("main");
            },
            onInitTourSample: function (tour, sampleIndex) {
                let self = this;
                self.promiseInitTourSample(tour, sampleIndex)
            },
            promiseInitTourSample: function (tour, sampleIndex) {
                let self = this;
                return new Promise(function (resolve, reject) {


                    var geneName = null;
                    if (self.selectedGene && self.selectedGene.gene_name) {
                        geneName = self.selectedGene.gene_name;
                    }
                    self.selectedGene = {};

                    self.cohortModel.isLoaded = false;
                    self.calcFeatureMatrixWidthPercent();
                    self.cohortModel.promiseInitEduTour(tour, sampleIndex)
                        .then(function () {
                            self.models = self.cohortModel.sampleModels;

                            if (geneName == null) {
                                if (self.geneModel.sortedGeneNames && self.geneModel.sortedGeneNames.length > 0) {
                                    geneName = self.geneModel.sortedGeneNames[0];
                                }
                            }

                            if (geneName) {
                                self.promiseLoadGene(geneName)
                                    .then(function () {
                                        self.onGeneSelected(geneName);
                                        self.calcFeatureMatrixWidthPercent();
                                        resolve();
                                    })
                                    .catch(function (error) {
                                        reject(error);
                                    })
                            } else {
                                resolve();
                            }
                        })
                })
            },
            onTourStartOver: function () {
                this.$refs.appTourRef.completeTour();
                this.$router.push({name: 'exhibit'});
            },
            onAdvancedMode: function () {
                let self = this;
                this.isBasicMode = false;
                this.featureMatrixModel.isBasicMode = false;
                this.filterModel.isBasicMode = false;
                this.calcFeatureMatrixWidthPercent();
                this.onFilesLoaded(true, function () {
                    self.$router.push({
                        name: 'home',
                        query: {mode: 'advanced', mygene2: self.forMyGene2 ? true : false}
                    })
                });
            },
            onBasicMode: function () {
                let self = this;
                this.isBasicMode = true;
                this.featureMatrixModel.isBasicMode = true;
                this.filterModel.isBasicMode = true;
                this.calcFeatureMatrixWidthPercent();
                this.onFilesLoaded(true, function () {
                    self.$router.push({name: 'home', query: {mode: 'basic', mygene2: self.forMyGene2 ? true : false}})
                });
            },
            onStopAnalysis: function () {
                this.cohortModel.stopAnalysis();
                this.cacheHelper.stopAnalysis();
            },
            onShowSnackbar: function (snackbar) {
                if (snackbar && snackbar.message) {
                    this.showSnackbar = true;

                    this.snackbar = snackbar;

                    if (this.snackbar.timeout == null) {
                        this.snackbar.timeout = 6000;
                    }
                }
            },
            onHideSnackbar: function () {
                this.showSnackbar = false;
            },

            onResize: function () {
                let self = this;
                self.mainContentWidth = $('main.content .container').outerWidth();
                self.calcFeatureMatrixWidthPercent();
                if (self.mainContentWidth > 905) {
                    $('main.content .container').removeClass("small");
                } else {
                    $('main.content .container').addClass("small");
                }

            },

            calcFeatureMatrixWidthPercent: function () {
                let self = this;
                if (self.cohortModel && self.cohortModel.isLoaded
                    && self.featureMatrixModel && self.featureMatrixModel.rankedVariants) {
                    self.mainContentWidth = $('main.content .container').outerWidth();
                    if (self.isBasicMode) {
                        self.featureMatrixWidthPercent = 0;
                    }
                    else if (self.isEduMode) {
                        self.featureMatrixWidthPercent = 50;
                    } else {
                        let minVariantDetailWidth = 50;
                        if ($('#variant-detail').length > 0) {
                            minVariantDetailWidth = +$('#variant-detail').css('min-width').split("px")[0];
                        } else {
                            minVariantDetailWidth = 652;
                        }

                        let minFeatureMatrixWidth = 0;
                        if ($('#matrix-card').length > 0) {
                            minFeatureMatrixWidth = +$('#matrix-card').css('min-width').split("px")[0];
                        } else {
                            minFeatureMatrixWidth = 300;
                        }

                        let fullFeatureMatrixWidth = 0;
                        if ($('#feature-matrix-viz svg').length > 0) {
                            fullFeatureMatrixWidth = +$('#feature-matrix-viz svg').outerWidth();
                        }

                        let width1 = minFeatureMatrixWidth;
                        let width2 = minVariantDetailWidth;
                        var remaining = +self.mainContentWidth - (minFeatureMatrixWidth + minVariantDetailWidth);
                        if (remaining > 0) {
                            var remaining = +self.mainContentWidth - (minFeatureMatrixWidth + minVariantDetailWidth);
                            // If there are more ranked variants than min feature matrix width, give
                            // remaining to feature matrix
                            if (fullFeatureMatrixWidth > minFeatureMatrixWidth) {
                                width1 = minFeatureMatrixWidth + remaining;
                            } else {
                                width2 = minVariantDetailWidth + remaining;
                            }
                        } else if (remaining < 0) {
                            // If there isn't enough width for the min feature matrix width and variant card width,
                            // make sure that feature matrix min is met;
                            width1 = minFeatureMatrixWidth;
                            width2 = +self.mainContentWidth - minFeatureMatrixWidth;
                        }

                        self.featureMatrixWidthPercent = Math.round((width1 / self.mainContentWidth) * 100);
                    }
                } else {
                    self.featureMatrixWidthPercent = 0;
                }

            },
            receiveClinMessage: function (event) {
                let self = this;
                // Do we trust the sender of this message?
                if (this.clinIobioUrls.indexOf(event.origin) == -1) {
                    return;
                }
                this.clinIobioUrl = event.origin;
                this.launchedFromClin = true;

                var clinObject = JSON.parse(event.data);

                if (clinObject.type == 'apply-genes') {
                    let genesString = clinObject.genes && Array.isArray(clinObject.genes) ? clinObject.genes.join(" ") : "";
                    let phenotypeTerms = clinObject.searchTerms && Array.isArray(searchTerms) ? clinObject.searchTerms.join(",") : "";
                    this.onApplyGenes(genesString,
                        {
                            isFromClin: true,
                            replace: true,
                            warnOnDup: false,
                            phenotypes: phenotypeTerms
                        });
                } else if (clinObject.type == 'set-data') {
                    self.cohortModel.promiseInit(clinObject.modelInfos)
                        .then(function () {
                            self.models = self.cohortModel.sampleModels;
                            self.onApplyGenes(clinObject.genes.join(" "), {
                                isFromClin: true,
                                replace: true,
                                warnOnDup: false,
                                phenotypes: clinObject.phenotypes.join(",")
                            }, function () {
                                self.cohortModel.importFlaggedVariants('json', clinObject.variants, function () {
                                    self.onFlaggedVariantsImported();
                                    self.$refs.navRef.onShowFlaggedVariants();
                                    self.cacheHelper.analyzeAll(self.cohortModel, false);
                                })
                            });

                        })
                        .catch(function (error) {
                            console.log(error);
                        })
                } else if (clinObject.type == 'show-tooltip') {
                    if (clinObject.task.key == 'genes-menu') {
                        if (self.$refs.navRef && self.$refs.navRef.$refs.genesMenuRef) {
                            self.$refs.navRef.$refs.genesMenuRef.showTooltip(clinObject.task.tooltip);
                        }
                    } else {
                        if (self.$refs.genesCardRef && self.$refs.genesCardRef.$refs.filterBadgesRef) {
                            self.$refs.genesCardRef.$refs.filterBadgesRef.showTooltip(clinObject.task.key, clinObject.task.tooltip);
                        }
                    }
                } else if (clinObject.type == 'hide-tooltip') {
                    if (clinObject.task.key == 'genes-menu') {
                        if (self.$refs.navRef && self.$refs.navRef.$refs.genesMenuRef) {
                            self.$refs.navRef.$refs.genesMenuRef.hideTooltip();
                        }
                    } else {
                        if (self.$refs.genesCardRef && self.$refs.genesCardRef.$refs.filterBadgesRef) {
                            self.$refs.genesCardRef.$refs.filterBadgesRef.hideTooltip(clinObject.task.key);
                        }
                    }
                }


                var responseObject = {success: true, type: 'message-received', sender: 'gene.iobio.io'};
                window.parent.postMessage(JSON.stringify(responseObject), this.clinIobioUrl);
            },


            onSendGenesToClin: function () {
                let self = this;
                if (this.launchedFromClin) {
                    var msgObject = {
                        success: true,
                        type: 'apply-genes',
                        sender: 'gene.iobio.io',
                        genes: self.geneModel.sortedGeneNames
                    };
                    window.parent.postMessage(JSON.stringify(msgObject), self.clinIobioUrl);
                }
            },


            onSendFlaggedVariantsToClin: function () {
                let self = this;
                if (this.launchedFromClin) {
                    self.cohortModel.promiseExportFlaggedVariants('json')
                        .then(function (data) {
                            var msgObject = {
                                success: true,
                                type: 'save-variants',
                                sender: 'gene.iobio.io',
                                variants: data
                            };
                            window.parent.postMessage(JSON.stringify(msgObject), self.clinIobioUrl);
                        });

                }
            },

            onSendFiltersToClin: function () {
                let self = this;
                if (this.launchedFromClin) {
                    var msgObject = {
                        success: true,
                        type: 'save-filters',
                        sender: 'gene.iobio.io',
                        filters: self.filterModel.flagCriteria
                    };
                    window.parent.postMessage(JSON.stringify(msgObject), self.clinIobioUrl);
                }
            },
            /* Called when we need Vue to update the track view */
            onUpdateSamples: function () {
                let self = this;
                self.models = self.cohortModel.sampleModels;
                self.models.push('foo');
                self.models.pop();
            },
            onVariantFilterSettingsApplied: function (filterInfo) {
                const self = this;
                const somaticFilterList = {
                    'tumorAltFreq': true,
                    'tumorAltCount': true,
                    'normalAltFreq': true,
                    'normalAltCount': true
                };

                let promises = [];
                if (somaticFilterList[filterInfo.name]) {
                    // Update somatic filter criteria in model
                    self.filterModel.currentSomaticCutoffs[filterInfo.name] = filterInfo.cutoffValue;
                    self.filterModel.currentSomaticLogic[filterInfo.name] = filterInfo.state;
                } else {
                    let selectedVarId = null;
                    if (self.selectedVariant) {
                        selectedVarId = self.selectedVariant.id;
                    }
                    // Apply tumor only filters to tumor tracks only
                    if (self.$refs.variantCardRef && filterInfo.tumorOnly) {
                        self.$refs.variantCardRef.forEach((cardRef) => {
                            if (cardRef.sampleModel.isTumor === true) {
                                let filtPromise = cardRef.promiseFilterVariants(filterInfo, self.selectedTrackId, selectedVarId);
                                promises.push(filtPromise);
                            }
                        });
                        // Otherwise apply to all tracks
                    } else if (self.$refs.variantCardRef) {
                        self.$refs.variantCardRef.forEach((cardRef) => {
                            let filtPromise = cardRef.promiseFilterVariants(filterInfo, self.selectedTrackId, selectedVarId);
                            promises.push(filtPromise);
                        });
                    }
                }

                // Only annotate once we are guaranteed that our DOM update is done for all tracks
                Promise.all(promises).then(() => {
                    // Regardless of what filter applied, we need to re-annotate somatic variants (b/c respective normal may be hidden!)
                    let allVariantsPassingFilters = self.cohortModel.getAllFilterPassingVariants();
                    let inheritanceObj = self.filterModel.annotateVariantInheritance(self.cohortModel.sampleMap);
                    self.cohortModel.allSomaticFeaturesLookup = inheritanceObj.somaticLookup;
                    self.cohortModel.allInheritedFeaturesLookup = inheritanceObj.inheritedLookup;

                    // Draw feature matrix after somatic field filled
                    self.featureMatrixModel.promiseRankVariants(self.cohortModel.allUniqueFeaturesObj, self.cohortModel.allSomaticFeaturesLookup, self.cohortModel.allInheritedFeaturesLookup, allVariantsPassingFilters);

                    // Then we need to update coloring for tumor tracks only
                    if (self.$refs.variantCardRef) {
                        self.$refs.variantCardRef.forEach((cardRef) => {
                            if (cardRef.sampleModel.isTumor === true) {
                                cardRef.updateVariantClasses();
                            }
                        });
                    }
                }).catch((err) => {
                    console.log('There was a problem applying variant filter: ' + err);
                });
            }
        }
    }
</script>
