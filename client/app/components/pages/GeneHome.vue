/*
 * GeneHome.vue
 *
 */
<style lang="sass">

@import ../../../assets/sass/variables


.v-snack--top
  top: 60px !important


.fluidMax
  max-width: calc(100%) !important


.v-snack--right
  top: 2px !important
  transform: initial !important


  .v-snack__wrapper
    min-width: 150px !important
    background-color: #00000080 !important
    box-shadow: none !important
    -webkit-box-shadow: none !important
    margin-right: auto

    .v-snack__content
      min-height: 30px !important
      font-size: 12px !important
      padding-top: 0 !important
      padding-bottom: 0 !important
      font-weight: 600 !important
      color: white !important

      span
        color: white !important


  #gene-viz, #gene-viz-zoom
    .transcript.current
      outline: none !important
      font-weight: normal !important
    .axis
      padding-left: 0
      padding-right: 0
      margin-top: -10px
      margin-bottom: 0
      padding-bottom: 0
      text
        font-size: 11px
        fill: rgb(120, 120, 120)
      line, path
        fill: none
        stroke: lightgrey
        shape-rendering: crispEdges
        stroke-width: 1px
      &.x
        .tick
          line
            transform: translateY(-14px)
          text
            transform: translateY(6px)
        path
          transform: translateY(-20px)
          display: none

    .gene-viz-zoom
      .current
        outline: none

      .cds, .exon, .utr
        fill: rgba(159, 159, 159, 0.63)
        stroke: rgb(159, 159, 159)

.analysis-save-button
  right: 30px !important
  bottom: 30px !important

main.content, main.v-content
  margin-top: 57px


  .variant-assessment-heading
    color: $app-color
    margin-bottom: 20px
    font-size: 16px
    padding-top: 5px
    display: flex
    justify-content: space-between


  #variant-assessment-close-button
    max-width: 20px
    min-width: 20px
    max-height: 20px
    margin: 0

    i.material-icons
      color: $text-color
      font-size: 22px

  #gene-card-container
    margin-top: 10px
    margin-bottom: 10px
    padding-bottom: 10px

main.content.clin, main.v-content.clin
  margin-top: 0


.app-card
  margin-bottom: 6px

//noinspection CssInvalidPropertyValue
.full-width
  max-width: -moz-available !important
  max-width: -webkit-fill-available !important


#data-sources-loader, #session-data-loader
  margin-top: 30px
  margin-left: auto
  margin-right: auto
  text-align: center
  width: 300px
  height: auto
  padding-top: 15px
  padding-bottom: 15px



.tabs__container
  height: 31px !important
  margin-left: 0

  .tabs__item
    color: $app-color
    font-size: 15px

  .tabs__item--active
    color:  $app-color


.tabs.basic
  .tabs__container
    .tabs__slider
      background-color: transparent !important
      border-color: transparent !important

    .tabs__item
      margin-left: -10px

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


.switch
  &.accent--text
    color:  $app-color !important

.radio
  &.accent--text
    color:  $app-color !important

.in-iframe .v--modal-box
  top: 50px !important

#pileup-container
  padding-top: 0
  padding-bottom: 0
  width: calc(100% - 10px)
  margin: 0 0 0 -10px

  .card, .v-card
    margin: 0
    padding: 0
    -webkit-box-shadow: none !important
    box-shadow: none !important

    .layout.row
      margin-left: 20px
      margin-right: 20px

    .igv-root-div
      margin-left: -10px

    .igv-right-hand-gutter
      right: -10px
      left: initial

.ajs-content
  overflow-wrap: break-word

.ajs-dialog
  max-width: 600px !important

.dark-text-important
  color: #626262 !important



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
      :showFilesButton="showFilesButton"
      :isEduMode="isEduMode"
      :isBasicMode="isBasicMode"
      :forMyGene2="forMyGene2"
      :isSimpleMode="isSimpleMode"
      :showBlogsAndTutorials="showBlogsAndTutorials"
      :isPhenolyzerPermitted="isPhenolyzerPermitted"
      :analyzeAllInProgress="cacheHelper.analyzeAllInProgress"
      :callAllInProgress="cacheHelper.callAllInProgress"
      :selectedGene="selectedGene"
      :selectedVariant="selectedVariant"
      :cohortModel="cohortModel"
      :genomeBuildHelper="genomeBuildHelper"
      :cacheHelper="cacheHelper"
      :geneModel="geneModel"
      :analysis="analysis"
      :isDirty="isDirty"
      :showSaveModal="showSaveModal"
      :filteredGeneNames="filteredGeneNames"
      :activeFilterName="activeFilterName"
      :launchedFromClin="launchedFromClin"
      :launchedFromHub="launchedFromHub"
      :launchedFromSFARI="launchedFromSFARI"
      :isClinFrameVisible="isClinFrameVisible"
      :isFullAnalysis="isFullAnalysis"
      :isLoaded="cohortModel && cohortModel.isLoaded"
      :hasAlignments="cohortModel && cohortModel.isLoaded && cohortModel.hasAlignments()"
      :bringAttention="bringAttention"
      :phenotypeLookupUrl="phenotypeLookupUrl"
      :lastPhenotypeTermEntered="phenotypeTerm"
      :geneNames="geneModel.sortedGeneNames"
      :genesInProgress="cohortModel.genesInProgress"
      :interpretationMap="interpretationMap"
      :toClickVariant="toClickVariant"
      :variantSetCounts="variantSetCounts"
      :badgeCounts="badgeCounts"
      :showFilesProp="showFiles"
      :showWelcome="showWelcome"
      :launchedFromDemo="launchedFromDemo"
      @input="onGeneNameEntered"
      @load-demo-data="onLoadDemoData"
      @clear-cache="promiseClearCache"
      @apply-genes="onApplyGenes"
      @on-start-search-genes="onStartSearchGenes"
      @clear-all-genes="onClearAllGenes"
      @flagged-variants-imported="onFlaggedVariantsImported"
      @flagged-variant-selected="onFlaggedVariantSelected"
      @apply-variant-notes="onApplyVariantNotes"
      @apply-variant-interpretation="onApplyVariantInterpretation"
      @on-files-loaded="onFilesLoaded"
      @on-left-drawer="onLeftDrawer"
      @show-snackbar="onShowSnackbar"
      @hide-snackbar="onHideSnackbar"
      @gene-selected="onGeneClicked"
      @gene-lists-changed="onGeneListsChanged"
      @remove-gene="onRemoveGene"
      @analyze-coding-variants-only="onAnalyzeCodingVariantsOnly"
      @show-known-variants="onShowKnownVariantsCard"
      @show-coverage-threshold="onShowCoverageThreshold"
      @analyze-all="onAnalyzeAll"
      @call-variants="callVariants"
      @filter-settings-applied="onFilterSettingsApplied"
      @isDemo="onIsDemo"
      @isTrio="onIsTrio"
      @variant-count-changed="variantCountChanged"
      @toggle-save-modal="toggleSaveModal(true)"
      @on-welcome-changed="onWelcomeChanged"
      @show-files="onShowFiles"
      @stop-analysis="onStopAnalysis"
    >
    </navigation>


    <v-content   :class="launchedFromClin ? 'clin' : '' ">
      <v-container class="fluidMax">


        <modal name="pileup-modal"
            width="50%"
            height="540"
            >

          <v-card class='full-width' style="overflow-y:auto;height:100%">
            <pileup id="pileup-container"
              :heading="pileupInfo.title"
              :referenceURL="pileupInfo.referenceURL"
              :tracks="pileupInfo.tracks"
              :locus="pileupInfo.coord"
              :visible="pileupInfo.show"
              :showLabels=true
            />
          </v-card>

        </modal>


        <intro-card v-if="showIntro"
        class="full-width"
        :closeIntro="closeIntro"
        :isBasicMode="isBasicMode"
        :forMyGene2="forMyGene2"
        :isSimpleMode="isSimpleMode"
        :siteConfig="siteConfig"
        :defaultingToDemoData="cohortModel ? cohortModel.defaultingToDemoData : false"
        @on-advanced-mode="onAdvancedMode"
        @on-basic-mode="onBasicMode"
        @on-simple-mode="onSimpleMode">
        </intro-card>





        <genes-card
         style="margin-bottom:7px"
         v-if="geneModel"
         v-show="(isEduMode || isBasicMode) && filterModel && (!launchedFromClin && !isFullAnalysis)"
         v-bind:class="{hide : (showWelcome && !isEduMode), 'full-width': true}"
         ref="genesCardRef"
         :isEduMode="isEduMode"
         :isBasicMode="isBasicMode"
         :isFullAnalysis="isFullAnalysis"
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
         :phenotypeLookupUrl="phenotypeLookupUrl"
         :showSfariTrackToggle="cohortModel && cohortModel.isSfariProject"
         @gene-selected="onGeneClicked"
         @remove-gene="onRemoveGene"
         @analyze-all="onAnalyzeAll"
         @call-variants="callVariants"
         @sort-genes="onSortGenes"
         @apply-genes="onApplyGenes"
         @stop-analysis="onStopAnalysis"
         @show-known-variants="onShowKnownVariantsCard"
         @show-sfari-variants="onShowSfariVariantsCard"
         @on-insufficient-coverage="onInsufficientCoverage">
        </genes-card>



          <v-card v-show="showGeneVariantsCard" tile id="gene-variants-card" class="app-card full-width">
        <gene-variants-card
          v-bind:class="{hide : showWelcome, 'full-width': true}"
          v-if="showGeneVariantsCard"
          :selectedGene="selectedGene"
          :selectedTranscript="analyzedTranscript"
          :genomeBuildHelper="genomeBuildHelper"
          :cohortModel="cohortModel"
          :sampleModels="cohortModel.sampleModels"
          :isEduMode="isEduMode"
          :isBasicMode="isBasicMode"
          :isSimpleMode="isSimpleMode"
          :isFullAnalysis="isFullAnalysis"
          :isOMIMPermitted="isOMIMPermitted"
          :launchedFromClin="launchedFromClin"
          :launchedFromHub="launchedFromHub"
          :showSfariTrackToggle="cohortModel && cohortModel.isSfariProject"
          :isLoaded="cohortModel && cohortModel.isLoaded"
          @transcript-selected="onTranscriptSelected"
          @gene-source-selected="onGeneSourceSelected"
          @gene-region-buffer-change="onGeneRegionBufferChange"
          @no-data-warning="onNoDataWarning">
        </gene-variants-card>

              <div
                      v-if="geneModel && (!launchedFromDemo && !launchedFromHub) && !launchedFromFiles && !launchedFromClin"
                      v-show="geneModel && (!launchedFromDemo && !launchedFromHub) && !launchedFromFiles && !launchedFromClin"

                      style="height: 15px"></div>

          <gene-viz class="gene-viz-zoom"
                    v-if="geneModel && (!launchedFromDemo && !launchedFromHub && !launchedFromFiles && !launchedFromClin) && !isBasicMode && !isSimpleMode"
                    v-show="geneModel && (!launchedFromDemo && !launchedFromHub && !launchedFromFiles && !launchedFromClin) && !isBasicMode && !isSimpleMode"
                    :data="[selectedTranscript]"
                    :margin="geneVizMargin"
                    :height="40"
                    :width="cardWidth"
                    :isStandalone="true"
                    :showXAxis="true"
                    :trackHeight="geneVizTrackHeight"
                    :cdsHeight="geneVizCdsHeight"
                    :regionStart="parseInt(selectedGene.start)"
                    :regionEnd="parseInt(selectedGene.end)"
                    :showBrush="false"
          >
          </gene-viz>

          </v-card>

        <!--selectedGene && selectedGene.length > 0-->

        <!--<v-card class="app-card"-->
                <!--v-if="geneModel && (!launchedFromDemo && !launchedFromHub)"-->
                <!--style="overflow-y:scroll;margin-left:5px"-->
        <!--&gt;-->


        <!--geneVizTrackHeight: self.isEduMode || self.isBasicMode ? 32 : 16,-->
        <!--geneVizCdsHeight: self.isEduMode || self.isBasicMode ? 24 : 12,-->


      <!--</v-card>-->


        <variant-all-card
        ref="variantCardProbandRef"
        v-if="probandModel"
        v-show="!showWelcome"
        v-bind:class="[
        { 'full-width': true,
          'hide': showWelcome || (selectedGene && Object.keys(selectedGene).length === 0) || !cohortModel  || cohortModel.inProgress.loadingDataSources,
          'edu' : isEduMode
        },
        'proband'
        ]"
        :globalAppProp="globalApp"
        :isEduMode="isEduMode"
        :isBasicMode="isBasicMode"
        :isSimpleMode="isSimpleMode"
        :clearZoom="clearZoom"
        :sampleModel="probandModel"
        :coverageDangerRegions="probandModel.coverageDangerRegions"
        :classifyVariantSymbolFunc="probandModel.classifyByImpact"
        :variantTooltip="variantTooltip"
        :selectedGene="selectedGene"
        :selectedTranscript="analyzedTranscript"
        :selectedVariant="selectedVariant"
        :selectedVariantRelationship="selectedVariantRelationship"
        :regionStart="geneRegionStart"
        :regionEnd="geneRegionEnd"
        :featureMatrixModel="featureMatrixModel"
        :width="cardWidth"
        :showGeneViz="true"
        :showDepthViz="true"
        :showVariantViz="true"
        :geneVizShowXAxis="true"
        :blacklistedGeneSelected="blacklistedGeneSelected"
        :otherModels="nonProbandModels"
        :cohortModel="cohortModel"
        :isMother="isMother"
        :isFather="isFather"
        :geneLists="geneLists"
        :launchedFromClin="launchedFromClin"
        :forceKnownVariantsViz="forceKnownVariantsViz"
        @cohort-variant-click="onCohortVariantClick"
        @cohort-variant-outside-click="onCohortVariantOutsideClick"
        @cohort-variant-hover="onCohortVariantHover"
        @cohort-variant-hover-end="onCohortVariantHoverEnd"
        @show-known-variants-card="onShowKnownVariantsCard"
        @show-sfari-variants-card="onShowSfariVariantsCard"
        @optional-track-close="onOptionalTrackClose"
        @show-mother-card="onShowMotherCard"
        @show-father-card="onShowFatherCard"
        @known-variants-viz-change="onKnownVariantsVizChange"
        @known-variants-filter-change="onKnownVariantsFilterChange"
        @sfari-variants-viz-change="onSfariVariantsVizChange"
        @sfari-variants-filter-change="onSfariVariantsFilterChange"
        @gene-region-zoom="onGeneRegionZoom"
        @gene-region-zoom-reset="onGeneRegionZoomReset"
        @show-coverage-cutoffs="showCoverageCutoffs = true;showCoverageThreshold = true"
        @show-pileup-for-variant="onShowPileupForVariant"
        >
        </variant-all-card>

        <variant-detail-card
          ref="variantInspectRef"
          v-if="cohortModel && cohortModel.isLoaded && isBasicMode"
          :isBasicMode="isBasicMode"
          :isEduMode="isEduMode"
          :selectedGene="selectedGene"
          :selectedTranscript="analyzedTranscript"
          :selectedVariant="selectedVariant"
          :selectedVariantNotes="selectedVariantNotes"
          :selectedVariantInterpretation="selectedVariantInterpretation"
          :selectedVariantRelationship="selectedVariantRelationship"
          :interpretationMap="interpretationMap"
          :genomeBuildHelper="genomeBuildHelper"
          :cohortModel="cohortModel"
          :info="selectedVariantInfo"
          :selectedVariantKey="selectedVariantKey"
          :showGenePhenotypes="launchedFromClin || phenotypeTerm"
          :coverageDangerRegions="cohortModel.getProbandModel().coverageDangerRegions"
          :user="user"
          :showAssessment="hasVariantAssessment || showVariantAssessment"
          @show-pileup-for-variant="onShowPileupForVariant"
          @apply-variant-interpretation="onApplyVariantInterpretation"
          @apply-variant-notes="onApplyVariantNotes"
          @show-variant-assessment="onShowVariantAssessment"

          >
          </variant-detail-card>



        <div style="display:flex;align-items:stretch">
          <variant-inspect-card
          ref="variantInspectRef"
          v-if="cohortModel && cohortModel.isLoaded && !isBasicMode && !isEduMode && selectedVariant"
          v-show="!showWelcome"
          :isSimpleMode="isSimpleMode"
          :selectedGene="selectedGene"
          :selectedTranscript="analyzedTranscript"
          :selectedVariant="selectedVariant"
          :selectedVariantInterpretation="selectedVariantInterpretation"
          :selectedVariantRelationship="selectedVariantRelationship"
          :genomeBuildHelper="genomeBuildHelper"
          :cohortModel="cohortModel"
          :info="selectedVariantInfo"
          :selectedVariantKey="selectedVariantKey"
          :selectedPhenotype="phenotypeTerm"
          :showGenePhenotypes="launchedFromClin || phenotypeTerm"
          :coverageDangerRegions="cohortModel.getProbandModel().coverageDangerRegions"
          :user="user"
          :showAssessment="hasVariantAssessment || showVariantAssessment"
          :launchedFromClin="launchedFromClin"
          @show-pileup-for-variant="onShowPileupForVariant"
          @apply-variant-interpretation="onApplyVariantInterpretation"
          @apply-variant-notes="onApplyVariantNotes"
          @show-variant-assessment="onShowVariantAssessment"
          @transcript-id-selected="onTranscriptIdSelected"
          >
          </variant-inspect-card>

          <v-card class="app-card"
            v-if="cohortModel && cohortModel.isLoaded && selectedGene && Object.keys(selectedGene).length > 0 && selectedVariant && !isBasicMode && (hasVariantAssessment || showVariantAssessment)"
            style="overflow-y:scroll;max-width:320px;margin-left:5px">
            <div class="variant-assessment-heading">
              Variant Review
              <v-btn  id="variant-assessment-close-button" class="toolbar-button" flat @click="showVariantAssessmentClose()">
                <v-icon >close</v-icon>
              </v-btn>
            </div>
            <variant-assessment
              :variant="selectedVariant"
              :variantInterpretation="selectedVariant.interpretation"
              :interpretationMap="interpretationMap"
              :variantNotes="selectedVariant.notes"
              :user="user"
              @apply-variant-interpretation="onApplyVariantInterpretation"
              @apply-variant-notes="onApplyVariantNotes">
            </variant-assessment>
          </v-card>


        </div>




        <welcome
         class="full-width"
         v-if="showWelcome"
         :launchedFromClin="launchedFromClin"
         :isBasicMode="isBasicMode"
         :isEduMode="isEduMode"
         :resume="resume"
         @load-demo-data="onLoadDemoData"
         @upload-files="onUploadFiles"
         @take-app-tour="onTakeAppTour"
         @show-welcome-changed="onWelcomeChanged"
         >
        </welcome>

        <v-card
        id="data-sources-loader"
        class="loader full-width"
        v-bind:class="{ hide: !cohortModel ||  !cohortModel.inProgress.loadingDataSources }">
          <span class="loader-label">Loading files</span>
          <img src="../../../assets/images/wheel.gif" alt="Loading Wheel">
        </v-card>

        <v-card
        id="session-data-loader"
        class="loader"
        v-show="launchedFromClin && (!cohortModel || (!cohortModel.isLoaded && !cohortModel.inProgress.loadingDataSources))">
          <span class="loader-label">Initializing session data</span>
          <img src="../../../assets/images/wheel.gif" alt="Loading Wheel">
        </v-card>

<!--
        <optional-tracks-card
          v-if="cohortModel && cohortModel.isLoaded && probandModel"
          :cohortModel="cohortModel"
          :isEduMode="isEduMode"
          :isBasicMode="isBasicMode"
          :isFullAnalysis="isFullAnalysis"
          :launchedFromHub="launchedFromHub"
          :launchedFromClin="launchedFromClin"
          @show-known-variants-card="onShowKnownVariantsCard"
          @show-sfari-variants-card="onShowSfariVariantsCard"
          @show-mother-card="onShowMotherCard"
          @show-father-card="onShowFatherCard">
        </optional-tracks-card>

        <variant-card
        ref="variantCardRef"
        v-if="nonProbandModels && nonProbandModels.length > 0"
        v-for="model in nonProbandModels"
        :key="model.relationship"
        v-bind:class="[
        { 'full-width': true, 'hide': showWelcome || Object.keys(selectedGene).length === 0 || !cohortModel  || cohortModel.inProgress.loadingDataSources
          || (model.relationship === 'known-variants' && showKnownVariantsCard === false) || (model.relationship === 'sfari-variants' && showSfariVariantsCard === false),
          'edu' : isEduMode
        },
        model.relationship
        ]"
        :globalAppProp="globalApp"
        :isEduMode="isEduMode"
        :isBasicMode="isBasicMode"
        :clearZoom="clearZoom"
        :sampleModel="model"
        :coverageDangerRegions="model.coverageDangerRegions"
        :classifyVariantSymbolFunc="model.relationship === 'known-variants' ? model.classifyByClinvar : model.classifyByImpact"
        :variantTooltip="variantTooltip"
        :selectedGene="selectedGene"
        :selectedTranscript="analyzedTranscript"
        :selectedVariant="selectedVariant"
        :regionStart="geneRegionStart"
        :regionEnd="geneRegionEnd"
        :featureMatrixModel="featureMatrixModel"
        :width="cardWidth"
        :showGeneViz="true"
        :showDepthViz="model.relationship !== 'known-variants' && model.relationship !== 'sfari-variants'"
        :showVariantViz="(model.relationship !== 'known-variants' || showKnownVariantsCard) || (model.relationship !== 'sfari-variants' || showSfariVariantsCard)"
        :geneVizShowXAxis="model.relationship === 'proband' || model.relationship === 'known-variants' || model.relationship === 'sfari-variants'"
        :blacklistedGeneSelected="blacklistedGeneSelected"
        @cohort-variant-click="onCohortVariantClick"
        @cohort-variant-outside-click="onCohortVariantOutsideClick"
        @cohort-variant-hover="onCohortVariantHover"
        @cohort-variant-hover-end="onCohortVariantHoverEnd"
        @known-variants-viz-change="onKnownVariantsVizChange"
        @known-variants-filter-change="onKnownVariantsFilterChange"
        @sfari-variants-viz-change="onSfariVariantsVizChange"
        @sfari-variants-filter-change="onSfariVariantsFilterChange"
        @gene-region-zoom="onGeneRegionZoom"
        @gene-region-zoom-reset="onGeneRegionZoomReset"
        @show-coverage-cutoffs="showCoverageCutoffs = true;showCoverageThreshold = true"
        @show-pileup-for-variant="onShowPileupForVariant"
        >
        </variant-card>

-->

        <v-snackbar
          :timeout="snackbar.timeout"
          :top="snackbar.top"
          :bottom="snackbar.bottom"
          :center="snackbar.center"
          :left="snackbar.left"
          :right="snackbar.right"
          v-model="showSnackbar"
         >
          <span v-html="snackbar.message"></span>
          <v-btn
            v-if="snackbar.close" flat color="white"
            @click.native="showSnackbar = false">
            <v-icon>close</v-icon>
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
      @circle-variant="onCircleVariantForTour"
    ></app-tour>


    <save-analysis-popup
     :showIt="showSaveModal"
     :analysis="analysis"
     @on-save-analysis="onSaveAnalysisFromModal"
     @on-cancel-analysis="onCancelAnalysis">
    </save-analysis-popup>


    <v-dialog v-model="showCoverageThreshold" persistent max-width="650">
      <coverage-threshold-card
       v-if="geneModel"
       :filterModel="cohortModel.filterModel"
       @coverage-threshold-applied="onCoverageThresholdApplied"
       @coverage-threshold-closed="onCoverageThresholdClose">
     </coverage-threshold-card>


    </v-dialog>


    <v-dialog v-model="interpretationProgressDialog" persistent max-width="375">
      <v-card color="#30638e" dark>
        <v-card-text>
          Interpreting variant
          <v-progress-linear
            :indeterminate="true"
            height="7"
            color="white">
          </v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>

  </div>

</template>


<script>


import Navigation from '../viz/Navigation.vue'
import EduTourBanner from '../viz/EduTourBanner.vue'
import Welcome from '../viz/Welcome.vue'
import IntroCard from '../viz/IntroCard.vue'
import GeneCard from '../viz/GeneCard.vue'
import VariantDetailCard from '../viz/VariantDetailCard.vue'
import VariantInspectCard from '../viz/VariantInspectCard.vue'
import VariantAssessment from "../partials/VariantAssessment.vue"

import GenesCard from '../viz/GenesCard.vue'
import CoverageThresholdCard from '../viz/CoverageThresholdCard.vue'
import GeneVariantsCard from '../viz/GeneVariantsCard.vue'
import FeatureMatrixCard from '../viz/FeatureMatrixCard.vue'
import VariantCard from '../viz/VariantCard.vue'
import VariantAllCard from '../viz/VariantAllCard.vue'
import AppTour from '../viz/AppTour.vue'

import HubSession from '../../models/HubSession.js'
import HubSessionDeprecated from '../../models/HubSessionDeprecated.js'
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
import genePanels from '../../../data/gene_panels.json'
import acmgBlacklist from '../../../data/ACMG_blacklist.json'
import SplitPane from '../partials/SplitPane.vue'
import ScrollButton from '../partials/ScrollButton.vue'
import OptionalTracksCard from '../partials/OptionalTracksCard.vue'

import SaveAnalysisPopup from '../partials/SaveAnalysisPopup.vue'

import VuePileup from 'vue-pileup'
import GeneViz from "../viz/GeneViz.vue"


export default {
  name: 'home',
  components: {
      EduTourBanner,
      Navigation,
      IntroCard,
      Welcome,
      GenesCard,
      GeneCard,
      GeneViz,
      GeneVariantsCard,
      ScrollButton,
      VariantInspectCard,
      VariantDetailCard,
      FeatureMatrixCard,
      VariantCard,
      SplitPane,
      AppTour,
      SaveAnalysisPopup,
      pileup: VuePileup,
      CoverageThresholdCard,
      OptionalTracksCard,
      VariantAssessment,
      VariantAllCard
  },
  props: {
    paramGene:             null,
    paramGeneName:         null,
    paramGeneNames:        null,
    paramGenes:            null,
    paramSpecies:          null,
    paramBuild:            null,
    paramBatchSize:        null,
    paramGeneSource:       null,
    paramMyGene2:          null,
    paramMode:             null,
    paramLaunchedFromClin: null,
    paramTour:             null,
    paramProjectId:        null,
    paramSampleId:         null,
    paramSampleUuid:       null,
    paramIsPedigree:       null,
    paramSource:           null,
    paramIobioSource:      null,
    paramAnalysisId:       null,
    paramGeneSetId:        null,
    paramClientApplicationId: null,
    paramVariantSetId:     null,

    paramFileId:           null,

    paramAffectedSibs:     null,
    paramUnaffectedSibs:   null,

    paramRelationships:    null,
    paramSamples:          null,
    paramNames:            null,
    paramBams:             null,
    paramBais:             null,
    paramVcfs:             null,
    paramTbis:             null,
    paramAffectedStatuses: null,
    paramFrameSource:      null
  },
  data() {
    let self = this;
    return {
      hasVariantAssessment: false,
      geneVizMargin: {
        top: 0,
        right: self.isBasicMode || self.isEduMode ? 7 : 2,
        bottom: 18,
        left: self.isBasicMode || self.isEduMode ? 9 : 4
      },
      stashedVariant: null,

      geneVizTrackHeight: self.isEduMode || self.isBasicMode ? 32 : 16,
      geneVizCdsHeight: self.isEduMode || self.isBasicMode ? 24 : 12,

      greeting: 'gene.iobio',
      launchedFromClin:   false,
      launchedFromDemo: false,
      isFullAnalysis:     false,
      isClinFrameVisible: false,
      user:               null,
      isMother: false,
      isFather: false,

      isDirty: false,
      resume: false,

      launchedFromHub: false,
      launchedFromSFARI: false,
      launchedFromFiles: false,
      isHubDeprecated: false,
      sampleId: null,
      projectId: null,
      geneSet: null,
      variantSet: null,
      launchedWithUrlParms: false,
      clinSetData: null,
      clinPersistCache: true,
      analysis: null,
      showSaveModal: false,
      showCoverageThreshold: false,

      hubToIobioSources: {
        "https://mosaic.chpc.utah.edu":          {iobio: "mosaic.chpc.utah.edu/gru/api/v1", batchSize: 10},
        "https://mosaic-dev.genetics.utah.edu":  {iobio: "mosaic.chpc.utah.edu/gru/api/v1", batchSize: 10},
        "http://mosaic-dev.genetics.utah.edu":   {iobio: "mosaic.chpc.utah.edu/gru/api/v1", batchSize: 10},

        // backward compatible with old clin.iobio
        "mosaic.chpc.utah.edu":                  {iobio: "mosaic.chpc.utah.edu/gru/api/v1", batchSize: 10},
        "nv-prod.iobio.io":                      {iobio: "mosaic.chpc.utah.edu/gru/api/v1", batchSize: 10},

        "https://staging.frameshift.io":         {iobio: "backend.iobio.io",     batchSize: 10},
        "https://mosaic.frameshift.io":          {iobio: "backend.iobio.io",     batchSize: 10}
      },

      sfariSource:  "https://viewer.sfari.org",


      interpretationMap: {
        'sig': 'Significant',
        'unknown-sig': 'Unknown significance',
        'not-sig': 'Not significant',
        'poor-qual': 'Poor quality',
        'not-reviewed': 'Not reviewed'
      },


      allGenes: allGenesData,
      genePanels: genePanels,
      acmgBlacklist: acmgBlacklist,
      blacklistedGeneSelected: false,

      selectedGene: {},
      selectedTranscript: {},
      analyzedTranscript: {},
      geneRegionStart: null,
      geneRegionEnd: null,
      geneLists: null,
      geneClicked: false,

      genesInProgress: {},

      activeFilterName: null,
      filteredGeneNames: null,

      modelInfos: null,
      rawPedigree: null,

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
      selectedVariantKey: null,
      selectedVariantNotes: null,
      selectedVariantInterpretation: null,
      selectedVariantRelationship: null,
      selectedVariantInfo: null,
      toClickVariant: null,

      showKnownVariantsCard: false,
      showSfariVariantsCard: false,
      showMotherCard: false,
      showFatherCard: false,

      forceKnownVariantsViz: null,

      inProgress: {},

      badgeCounts: {coverage: 0},

      PROBAND: 'proband',
      activeGeneVariantTab: null,
      isLeftDrawerOpen: null,
      showWelcome: false,

      cardWidth: 0,
      mainContentWidth: null,
      featureMatrixWidthPercent: 0,

      showSnackbar: false,
      snackbar: {message: '', timeout: 0, left: false, right: false, center: true, top: true, bottom: false},
      bringAttention: null,

      clearZoom: false,


      /*
      * This variable controls special behavior for running gene.iobio education edition, with
      * a simplified interface and logic.
      */
      isEduMode:  false,
      tourNumber: null,

      /*
      * These flags control special behavior for running gene.iobio basic mode, with
      * a simplified interface and logic.
      */
      isBasicMode: false,
      forMyGene2: false,


      /*
      * This variable controls if gene should show a "simplified" view
      */
      isSimpleMode: process.env.DEFAULT_MODE === 'simple',
      isPhenolyzerPermitted: process.env.PHENOLYZER_PERMITTED && process.env.PHENOLYZER_PERMITTED === 'true',
      isOMIMPermitted: process.env.OMIM_API_KEY && process.env.OMIM_API_KEY.length > 0,

      showIntro: false,
      showFilesButton: true,  // does the files 'upload' button appear in the nav bar?

      showBlogsAndTutorials: (process.env.SHOW_BLOGS_AND_TUTORIALS && process.env.SHOW_BLOGS_AND_TUTORIALS === 'true') || !process.env.SHOW_BLOGS_AND_TUTORIALS,


      closeIntro: false,

      phenotypeTerm: null,

      siteConfig: null,
      showFiles: false,

      showCoverageCutoffs: false,

      clinIobioUrls: ["http://localhost:4030", "http://tony.iobio.io:4030", "http://clin.iobio.io", "https://clin.iobio.io", "https://dev.clin.iobio.io", "http://dev.clin.iobio.io", "https://stage.clin.iobio.io"],
      clinIobioUrl: "https://clin.iobio.io",

      forceLocalStorage: null,

      phenotypeLookupUrl: null,

      showVariantAssessment: false,

      nonProbandModels: [],

      variantSetCounts: {},

      lastSave: null,
      delaySave: 10000,


      pileupInfo: {
        // This controls how many base pairs are displayed on either side of
        // the center of the locus.
        SPAN: 200,
        // These are the reference URLs for the human genome builds currently supported
        referenceURLs: {
          'GRCh37': 'https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg19/hg19.fasta',
          'GRCh38': 'https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg38/hg38.fa'
        },

        // Show the pileup dialog
        show: false,
        // Title in the pileup dialog
        title: 'Pileup View',
        // The bam file
        alignmentURL: null,
        alignmentIndexURL: null,
        // The vcf file
        // TODO: update this dynamically
        variantURL: null,
        variantIndexURL: null,
        // The reference URL (for the current genome build)
        referenceURL: 'https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg19/hg19.fasta',


      },

      clinShowGeneApp: false,
      variantCount: 0,
      interpretationProgressDialog: false,
    }
  },

  created: function() {
    let self = this;
    if (self.paramLaunchedFromClin) {
      self.launchedFromClin = true;
    }
    window.addEventListener("message", self.receiveClinMessage, false);
  },


  mounted: function() {
    let self = this;



    if (process.env.EXHIBIT === 'true' && (!self.paramMode || self.paramMode.length === 0 )) {
      this.$router.push({ name: 'exhibit' });
    }

    if (self.launchedFromClin) {
      var responseObject = {app: 'genefull', success: true, type: 'mounted', sender: 'gene.iobio.io'};
      window.parent.postMessage(JSON.stringify(responseObject), self.paramFrameSource);
    }



    self.init();



  },





  computed: {
    maxDepth: function() {
      if (this.cohortModel && this.cohortModel.maxDepth) {
        return this.cohortModel.maxDepth;
      } else {
        return 0;
      }
    },

    showGeneVariantsCard: function() {

        return this.selectedGene && Object.keys(this.selectedGene).length > 0 && !this.isEduMode && (this.cohortModel.isLoaded || !(Array.isArray(this.models) && this.models.length > 1)) && !this.showWelcome

    },

    probandModel: function() {
      let self = this;
      let theModels = [];
      if (this.models && this.models.length > 0) {
        theModels = self.models.filter(function(model) {
          return model.relationship === 'proband';
        })
      }
      if (theModels.length > 0) {
        return theModels[0];
      } else {
        return null;
      }
    },

  },

  watch: {
    isLeftDrawerOpen: function() {
      let self = this;
      setTimeout(function() {
        self.onResize();
      }, 1000)
    },
    geneLists: function(){
      if(this.launchedFromClin) {
        for (let i = 0; i < this.geneLists.length; i++) {
          let genes = this.geneLists[i].genes;
          for (let j = 0; j < genes.length; j++) {
            let variants = genes[j].variants;
            for (let k = 0; k < variants.length; k++) {
              let variant = variants[k];
              if (this.isVariantUnique(variant)) {
                this.analysis.payload.variants.push(variant)
              }
            }
          }
        }
      }
    }
  },

  methods: {

    init: function(callback) {
      let self = this;

      self.addCloseListener()


      self.cardWidth = self.$el.offsetWidth;
      self.cardWidth = window.innerWidth;

      // Detect if we are in an iframe
      if (window.self !== window.top) {
        $(document.body).addClass("in-iframe");
      }

      self.mainContentWidth = $('main.content .container').outerWidth();
      $(window).resize(function() {
        self.onResize();
      });

      document.addEventListener("visibilitychange", function() {
        if (!document.hidden) {
          setTimeout(function() {
            self.onResize();
          },1000)
        }
      }, false);

      // Safari can't use IndexedDB in iframes, so in this situation, use
      // local storage instead.
      if (window !== top && self.utility.detectSafari()) {
        self.forceLocalStorage = true;
      }

      self.setAppMode();

      self.genomeBuildHelper = new GenomeBuildHelper(self.globalApp, self.launchedFromHub, { DEFAULT_BUILD: 'GRCh37' });

      self.promiseAddCacheHelperListeners()
      .then(function() {
        return self.cacheHelper.promiseClearOlderCache();
      })
      .then(function() {
        return self.promiseLoadSiteConfig();
      })
      .then(function() {
        let glyph = new Glyph();
        let translator = new Translator(self.globalApp, glyph);
        let genericAnnotation = new GenericAnnotation(glyph);

        self.geneModel = new GeneModel(self.globalApp, self.forceLocalStorage, 
          self.launchedFromHub, self.genePanels);
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
          self.launchedFromClin,
          new FreebayesSettings());

        self.cohortModel.on("knownVariantsVizChange", function(viz) {
          self.forceKnownVariantsViz = viz;
        });

        self.geneModel.on("geneDangerSummarized", function(dangerSummary) {
          self.geneModel.promiseGetCachedGeneObject(dangerSummary.geneName)
          .then(function(theGeneObject) {
            self.cohortModel.captureFlaggedVariants(dangerSummary, theGeneObject)
            if (self.$refs.navRef && self.$refs.navRef.$refs.flaggedVariantsRef) {
              self.$refs.navRef.$refs.flaggedVariantsRef.populateGeneLists()
            }
          })
        })

        self.cacheHelper.cohort = self.cohortModel;

        self.variantExporter.cohort = self.cohortModel;

        self.inProgress = self.cohortModel.inProgress;


        self.featureMatrixModel = new FeatureMatrixModel(self.globalApp, self.cohortModel, self.isEduMode, self.isBasicMode, self.isSimpleMode, self.tourNumber);
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

        self.filterModel = new FilterModel(self.globalApp, self.cohortModel.affectedInfo, self.isBasicMode, self.isFullAnalysis);
        self.cohortModel.filterModel = self.filterModel;


        self.promiseInitFromUrl()
        .then(function() {
            if (self.isEduMode && self.tourNumber) {
              self.$refs.appTourRef.startTour(self.tourNumber);
            }

            if (self.launchedFromHub) {
              self.promiseInitFromMosaic()
            } else {
              self.models = self.cohortModel.sampleModels;

              if (self.analysis && self.analysis.payload && self.analysis.payload.variants && self.analysis.payload.variants.length > 0) {
                // do nothing -- variants already loaded
              } else if (self.selectedGene && Object.keys(self.selectedGene).length > 0) {
                self.promiseLoadData()
                .then(function() {
                  self.showLeftPanelWhenFlaggedVariants();
                })
              } else {
                if  (self.launchedWithUrlParms && self.geneModel.sortedGeneNames.length === 0 ) {
                  let theMessage = self.isSimpleMode || self.isBasicMode ? 'Enter a gene name.' : 'Enter a gene name or enter a phenotype term.'
                  self.onShowSnackbar( {message: theMessage, timeout: 10000, close:true});
                  self.bringAttention = 'gene';
                }

                if (!self.isEduMode && !self.isBasicMode && !self.isSimpleMode && !self.launchedFromHub && !self.launchedFromClin && !self.launchedWithUrlParms && self.geneModel.sortedGeneNames.length === 0 ) {
                  self.showWelcome = true;
                }
              }
            }
            if (callback) {
              callback();
            }

        })

      },
      function() {
        if (callback) {
          callback();
        }

      })

    },

    hasVariantAssessmentCheck: function(selectedVariant) {
      if (selectedVariant) {
        return !!((selectedVariant.interpretation && selectedVariant.interpretation !== 'not-reviewed')
            || (selectedVariant.notes && selectedVariant.notes.length > 0));
      } else {
        return false;
      }

    },

    showVariantAssessmentClose(){
      this.showVariantAssessment = false;
      this.hasVariantAssessment = false;
    },

    onRegionZoom: function(regionStart, regionEnd) {
      this.zoomMessage = "Click to zoom out";
      this.$emit('gene-region-zoom', regionStart, regionEnd);
    },
    onRegionZoomReset: function() {
      this.zoomMessage = "Drag to zoom";
      this.$emit('gene-region-zoom-reset');
    },

    addCloseListener: function() {
      let self = this;
      $(window).bind("beforeunload", function() {
        let msg = self.globalApp.getCloseMessage();
        if (msg) {
          return msg;
        } else {
          return undefined;
        }
      });
    },

    setDirty: function(dirtyFlag) {
      if (this.launchedFromHub) {
        this.globalApp.isDirty = dirtyFlag;
      }
      this.isDirty = dirtyFlag;
    },

    promiseInitFromMosaic: function() {
      let self = this;

      return new Promise(function(resolve, reject) {


        self.hubSession = self.isHubDeprecated ? new HubSessionDeprecated() : new HubSession(self.paramClientApplicationId);
        self.hubSession.globalApp = self.globalApp;
        let isPedigree = !!(self.paramIsPedigree && self.paramIsPedigree === 'true');



        self.cohortModel.setHubSession(self.hubSession);
        self.hubSession.promiseInit(self.sampleId,
          self.paramSource,
          isPedigree || (self.paramAnalysisId && self.paramAnalysisId.length > 0),
          self.projectId,
          self.paramGeneSetId,
          self.paramVariantSetId,
          self.paramBuild
          )
        .then(data => {
          if (isPedigree && !data.foundPedigree) {
            self.onShowSnackbar({message: 'No pedigree for this sample. Loading proband only.', timeout: 5000})
          }
          self.modelInfos = data.modelInfos;
          self.rawPedigree = data.rawPedigree;
          self.geneSet = data.geneSet;
          self.variantSet = data.variantSet;

          self.isMother = data.isMother;
          self.isFather = data.isFather;

          if (self.hubSession.user) {
            self.user = self.hubSession.user;
          }
          return self.promiseGetAnalysis(self.projectId, self.paramAnalysisId)

        })
        .then(analysis => {
          self.analysis = analysis;

          if (self.analysis.payload.phenotypeTerm) {
            self.phenotypeTerm = self.analysis.payload.phenotypeTerm
          }

          // Now import the variants from the variant set provided
          // when launching gene.iobio from Mosaic
          if (self.variantSet && self.variantSet.variants) {
            let bypassedCount = 0;
            let bypassedMessages = [];
            // todo sjg: do I need to apply limit here?

            self.variantSet.variants.filter(function(variant) {
              return variant.sample_ids.indexOf(parseInt(self.sampleId)) >= 0;
            })
            .forEach(function(variant) {
              // if not >25 genes or variant in existing gene todo sjg
              let importedVariant = {};
              if (variant.gene_symbol && variant.gene_symbol.length > 0) {
                importedVariant.gene  = variant.gene_symbol;
                importedVariant.chrom = variant.chr;
                importedVariant.start = variant.pos;
                importedVariant.end   = variant.pos;
                importedVariant.ref   = variant.ref;
                importedVariant.alt   = variant.alt;
                importedVariant.filtersPassed    = "notCategorized";
                importedVariant.inheritance      = null;
                importedVariant.afgnomAD         = variant.gnomad_allele_frequency;
                importedVariant.highestImpact    = variant.gene_impact;
                importedVariant.consequence      = variant.gene_consequence;
                importedVariant.isImported       = true;
                importedVariant.variantSet       = "notCategorized";

                self.analysis.payload.variants.push(importedVariant);
                if (self.analysis.payload.genes.indexOf(importedVariant.gene) < 0) {
                  self.analysis.payload.genes.push(importedVariant.gene);
                }
                // else, add to list of genes we had to skip b/c too many targets todo sjg
                // alertify warning variants bypassed because too many gene targets - manually investigate
              } else {
                let message = "Bypassing variant chr " + variant.chr + ", position " + variant.pos + " because the gene symbol was not provided.";
                bypassedMessages.push(message)
                console.log(message)
                bypassedCount++;
              }
            })
            if (bypassedCount > 0) {
              if (bypassedCount === self.variantSet.variants.length) {
                alertify.alert("Error", "None of the " + bypassedCount + " variants were loaded because the variants were missing gene name.", )

              } else {
                alertify.alert("Warning", bypassedCount + " variants bypassed." + "<br><br>" + bypassedMessages.join("<br>"))

              }
            }
          }

          return self.hubSession.promiseGetProject(self.projectId)
        })
        .then(projObj => {
            self.isSfariProject = false;
            // Note: going off of names per CM for now until we can get a Sfari project db flag
            if (projObj && projObj.name === 'SSC GRCh37 WGS' || projObj.name === 'SSC GRCh38 WGS') {
              self.isSfariProject = true;
            } else if (projObj.name === 'SSC GRCh37 WES') {
                self.isSfariProject = true;
            }
            return self.cohortModel.promiseInit(self.modelInfos, self.projectId, self.isSfariProject)
        })
        .then(function() {
          if (self.geneSet && self.geneSet.genes && self.geneSet.genes.length > 0) {
            let genePromises = [];
            self.geneSet.genes.forEach(function(geneName) {
              if (self.geneModel.isKnownGene(geneName)) {
                genePromises.push( self.geneModel.promiseAddGeneName(geneName) );
              }
              self.analysis.payload.genes.push(geneName);
              self.delaySave = 1000;
            })
           return Promise.all(genePromises)
          } else {
            return Promise.resolve();
          }
        })
        .then(function() {
          // todo sjg: is this where we apply 25 gene limit?
          if (self.analysis.payload.genes && self.analysis.payload.genes.length > 0) {
            let genePromises = [];
            let unknownGenes = [];
            self.analysis.payload.genes.forEach(function(geneName) {
              if (self.geneModel.isKnownGene(geneName)) {
                genePromises.push( self.geneModel.promiseAddGeneName(geneName) );
              } else {
                unknownGenes.push(geneName);
              }
            })
            if (unknownGenes.length > 0) {
              alertify.alert( "Warning", "Bypassing unknown genes " + unknownGenes.join(", "))
            }
            return Promise.all(genePromises);
          } else {
            return Promise.resolve();
          }
        })
        .then(function() {
          self.models = self.cohortModel.sampleModels;
          if (self.analysis.payload.variants && self.analysis.payload.variants.length > 0 ) {
            if (self.$refs.navRef && self.$refs.navRef.$refs.genesPanelRef) {
              self.$refs.navRef.$refs.genesPanelRef.updateGeneSummaries();
            }
            self.showLeftPanelForGenes();

            self.cohortModel.importFlaggedVariants('json', self.analysis.payload.variants,
            function() {
              if (self.$refs.navRef && self.$refs.navRef.$refs.flaggedVariantsRef) {
                self.$refs.navRef.$refs.flaggedVariantsRef.populateGeneLists();
                self.showLeftPanelWhenFlaggedVariants();
              }

            },
            function() {
              setTimeout(function() {
                self.promiseSelectFirstFlaggedVariant()

                setTimeout(function() {
                  self.delaySave = 1000;

                },1000)
              }, 2000)

              setTimeout(function() {
                if (self.analysis.id && self.geneModel.sortedGeneNames &&
                  self.geneModel.sortedGeneNames.length < 30) {
                  self.cacheHelper.analyzeAll(self.cohortModel, false, false);
                }
              }, 5000)
              resolve();
            })
          } else {

            if (self.geneModel.geneNames.length > 0) {
              self.geneModel.promiseGetCachedGeneObject(self.geneModel.geneNames[0])
              .then(function(theGeneObject) {
                let transcript = self.geneModel.getCanonicalTranscript(theGeneObject);
                self.promiseLoadGene(self.geneModel.geneNames[0], transcript)
                .then(function() {
                  self.showLeftPanelForGenes();
                  self.cacheHelper.analyzeAll(self.cohortModel);
                  resolve();
                })
              })
            } else {
              let theMessage = self.isSimpleMode || self.isBasicMode ? 'Enter a gene name.' : 'Enter a gene name or enter a phenotype term.'
              self.onShowSnackbar( {message: theMessage, timeout: 10000, close:true});
              self.bringAttention = 'gene';
              resolve();
            }
          }
        })
        .catch(function(error) {
          reject(error);
        })

      })
    },

    promiseAddCacheHelperListeners: function() {
      let self = this;
      return new Promise(function(resolve, reject) {
        self.cacheHelper = new CacheHelper(self.globalApp, self.forceLocalStorage);
        window.cacheHelper = self.cacheHelper;
        self.cacheHelper.on("geneAnalyzed", function(theGene) {
          self.refreshCoverageCounts()
          if (self.selectedGene && self.selectedGene.hasOwnProperty("gene_name")
              && theGene.gene_name === self.selectedGene.gene_name) {
            self.promiseLoadData();
          }
        });
        self.cacheHelper.on("analyzeAllCompleted", function() {
          self.delaySave = 1000;
          if (!self.isEduMode) {
            if (self.activeFilterName && self.activeFilterName === 'coverage' && self.launchedFromClin) {
              if (self.$refs.genesCardRef && self.$refs.genesCardRef.$refs.filterBadgesRef) {
                  self.$refs.genesCardRef.$refs.filterBadgesRef.onBadgeClick({name: 'coverage', display: 'Insufficient coverage'});
              }
              self.showLeftPanelForGenes();
            } else if (self.cacheHelper.analyzeAllInProgress) {
              if (self.selectedVariant == null) {
                self.showLeftPanelForGenes();
              }
            } else {
              if (self.selectedVariant == null) {
                self.promiseSelectFirstFlaggedVariant()
                    // .then(function() {
                    //   self.$refs.navRef.onShowVariantsTab();
                    // })
              }
              else if(self.launchedFromClin){

                self.promiseSelectFirstFlaggedVariant()
                    .then(function () {
                      self.$refs.navRef.onShowVariantsTab();
                    })
              }
            }
          }
        });

        self.globalApp.cacheHelper = self.cacheHelper;
        window.globalCacheHelper = self.cacheHelper;

        self.cacheHelper.promiseInit()
         .then(function() {
          self.cacheHelper.isolateSession(self.isEduMode);
          resolve();
         })
         .catch(function(error) {
          var msg = "A problem occurred in promiseInitCache(): " + error;
          console.log(msg);
          reject(msg);
         })
      })
    },

    onWelcomeChanged: function(val){
      this.showWelcome = val;
      this.resume = val;
    },

    promiseClearCache: function() {
      let self = this;

      this.clearFilter();
      self.cohortModel.clearFlaggedVariants();

      return new Promise(function(resolve) {
        if (self.isEduMode) {
          resolve();
        } else {
          self.geneModel.clearDangerSummaries();
          self.refreshCoverageCounts();
          self.cacheHelper.promiseClearCache(self.cacheHelper.launchTimestampToClear)
          .then(function() {
            self.cohortModel.cacheHelper.refreshGeneBadges(function() {
              resolve();
            })
          })
          .catch(function(error) {
            resolve(error);
          })
        }
      })
    },

    promiseLoadSiteConfig: function() {
      let self = this;
      var target = window.document.URL.indexOf("dev.gene.iobio") > 0 || window.document.URL.indexOf("stage.mygene2.iobio") > 0  || window.document.URL.indexOf("localhost") > 0 ? 'dev' : 'prod';

      return new Promise(function(resolve, reject) {

        $.ajax({
            url: self.globalApp.siteConfigUrl[target],
            type: "GET",
            crossDomain: true,
            dataType: "json",
            success: function( res ) {
              self.siteConfig = res;
              resolve();
            },
            error: function( xhr, status, errorThrown ) {
              console.log( "Error: " + errorThrown );
              console.log( "Status: " + status );
              console.log( xhr );
              reject("Error " + errorThrown + " occurred in promiseLoadSiteConfig() when attempting get siteConfig.json ");
            }
        });

      });

    },

    onLoadDemoData: function() {
      this.launchedFromDemo = true;
      this.isMother = true;
      this.isFather = true;
      let self = this;
      self.promiseClearCache()
      .then(function() {
        self.onGeneSelected(self.cohortModel.demoGenes[0]);
        return self.cohortModel.promiseInitDemo()
      })
      .then(function() {
        self.showLeftPanelForGenes();
        self.models = self.cohortModel.sampleModels;
        if (self.selectedGene && Object.keys(self.selectedGene).length > 0) {
          self.promiseLoadData()
          .then(function() {
            if (self.cohortModel && self.cohortModel.isLoaded && !self.isEduMode) {
              self.cacheHelper.analyzeAll(self.cohortModel, false);
            }
          });
        }
      })
    },

    onUploadFiles: function(){
      this.showFiles = true;
    },

    promiseLoadData: function() {
      let self = this;

      return new Promise(function(resolve, reject) {

        if (self.models && self.models.length > 0 && !(self.cohortModel.isSfariProject && self.blacklistedGeneSelected)) {
            self.cardWidth = $('#genes-card').innerWidth();
            var options = {'getKnownVariants': self.showKnownVariantsCard,
                'getSfariVariants': (self.showSfariVariantsCard && !self.blacklistedGeneSelected),
                'blacklistedGeneSelected': self.blacklistedGeneSelected };

            self.cohortModel.promiseLoadData(self.selectedGene, self.selectedTranscript, options)
                .then(function(resultMap) {
                    self.calcFeatureMatrixWidthPercent();

                    self.filterModel.populateEffectFilters(resultMap);
                    self.filterModel.populateRecFilters(resultMap);

                    self.cohortModel.promiseMarkCodingRegions(self.selectedGene, self.selectedTranscript)
                        .then(function(data) {
                            self.analyzedTranscript = data.transcript;

                            if(self.analyzedTranscript.gene_name !== self.selectedGene.gene_name){
                              self.geneModel.removeGene(self.selectedGene.gene_name);
                              self.onShowSnackbar({message: 'Bypassing ' + self.selectedGene.gene_name + '. Unable to find transcripts.', timeout: 5000})
                            }
                            resolve();
                        })

                    self.refreshCoverageCounts()
                })
                .catch(function(error) {
                    reject(error);
                })
        } else {
          Promise.resolve();
        }

      })
    },


    callVariants: function(theGene) {
      let self = this;
      if (theGene == null) {
        self.showLeftPanelForGenes();
        self.cacheHelper.analyzeAll(self.cohortModel, true);
      } else {
        self.promiseLoadData()
        .then(function() {
          return self.cohortModel.promiseJointCallVariants(self.selectedGene,
            self.selectedTranscript,
            self.cohortModel.getCurrentTrioVcfData(),
            {checkCache: false, isBackground: false, gnomADExtra: self.globalApp.gnomADExtra, decompose: true})
        })

      }
    },

    onFilesLoaded: function(analyzeAll, callback) {
      let self = this;

      this.launchedFromFiles = true;

      self.showWelcome = false;
      self.setUrlParameters();
      self.showLeftPanelForGenes();

      self.promiseClearCache()
      .then(function() {
        self.featureMatrixModel.init();
        return self.promiseResetAllGenes();
      })
      .then(function() {
        if (self.selectedGene && self.selectedGene.gene_name) {
          self.promiseLoadGene(self.selectedGene.gene_name)
          .then(function() {
            if (callback) {
              callback();
            }
          })

          if (analyzeAll) {
            if (self.cohortModel && self.cohortModel.isLoaded) {
              self.cacheHelper.analyzeAll(self.cohortModel, false);
            }
          }
        } else if (self.geneModel.sortedGeneNames && self.geneModel.sortedGeneNames.length > 0) {
          self.onGeneSelected(self.geneModel.sortedGeneNames[0]);
          if (callback) {
            callback();
          }
        } else {
          let theMessage = self.isSimpleMode || self.isBasicMode ? 'Enter a gene name.' : 'Enter a gene name or enter a phenotype term.'
          self.onShowSnackbar( {message: theMessage, timeout: 10000, close: true});
          self.bringAttention = 'gene';
          if (callback) {4
            callback();
          }
        }
      })
    },

    setUrlParameters: function() {
      let self = this;

      let geneName = "";
      let geneNames = "";
      if (self.selectedGene && self.selectedGene.gene_name) {
        geneName = self.selectedGene.gene_name
      } else if (self.geneModel.sortedGeneNames && self.geneModel.sortedGeneNames.length > 0) {
        geneName = self.geneModel.sortedGeneNames[0];
      }
      if (self.geneModel.sortedGeneNames && self.geneModel.sortedGeneNames.length > 0)  {
        geneNames = self.geneModel.sortedGeneNames.join(",");
      }

      var affectedSibIds = self.cohortModel.sampleMapSibs.affected.map(function(model) {
        return model.sampleName;
      }).join(",");
      var unaffectedSibIds = self.cohortModel.sampleMapSibs.unaffected.map(function(model) {
        return model.sampleName;
      }).join(",");


      var queryObject = {
          gene: geneName,
          genes: geneNames,
          species: self.genomeBuildHelper.getCurrentSpeciesName(),
          build:   self.genomeBuildHelper.getCurrentBuildName(),
          affectedSibs: affectedSibIds,
          unaffectedSibs: unaffectedSibIds
      };

      var i = 0;
      self.cohortModel.getCanonicalModels().forEach(function(model) {
        queryObject['rel'+i]    = model.relationship;
        queryObject['vcf'+i]    = model.vcf && model.vcf.getVcfURL() ? model.vcf.getVcfURL() : "";
        queryObject['tbi'+i]    = model.vcf && model.vcf.getTbiURL() ? model.vcf.getTbiURL() : "";
        queryObject['bam'+i]    = model.bam && model.bam.bamUri ? model.bam.bamUri : "";
        queryObject['bai'+i]    = model.bam && model.bam.baiUri ? model.bam.baiUri : "";
        queryObject['sample'+i] = model.sampleName ? model.sampleName : "";
        queryObject['affectedStatus'+i] = model.affectedStatus;
        i++;
      })


      self.$router.replace({ query: queryObject });



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
      if (self.geneModel.sortedGeneNames && self.geneModel.sortedGeneNames.length > 0)  {
        geneNames = self.geneModel.sortedGeneNames.join(",");
      }
      queryObject.gene = geneName;
      queryObject.genes = geneNames;

      self.$router.replace({ query: queryObject });


    },

    onGeneNameEntered: function(geneName) {
      let self = this;
      if(self.launchedFromClin){
        let geneArr = self.geneModel.getCandidateGenes();
        geneArr.push(geneName);
        self.geneModel.setCandidateGenes(geneArr);
      }
      self.clearFilter();
      self.deselectVariant();
      self.setDirty(true);
      self.activeGeneVariantTab = "0";
      // self.showLeftPanelForGenes();
      if(self.launchedFromFiles) {
        self.showLeftPanelForGenes();
      }
      self.promiseLoadGene(geneName)
      .then(function() {
        if(self.launchedFromFiles) {
          self.showLeftPanelForGenes();
          self.promiseSelectFirstFlaggedVariant();

        }
        self.onSendGenesToClin();
        self.setUrlGeneParameters();
      })

    },

    onGeneClicked: function(geneName) {
      var self = this;

      self.geneClicked = true;

      self.deselectVariant();

      self.promiseLoadGene(geneName)
      .then(function() {
        self.setUrlGeneParameters();
      })
      self.activeGeneVariantTab = "0";

    },

    onGeneListsChanged: function(geneLists){
      this.geneLists = geneLists;
    },

    onGeneSelected: function(geneName, transcriptChanged) {
      var self = this;
      self.deselectVariant();
      self.promiseLoadGene(geneName, null, transcriptChanged);
      self.activeGeneVariantTab = "0";
    },

    getVariantCardRefs: function() {
      let refs = [];
      if (this.$refs.variantCardProbandRef) {
        refs.push(this.$refs.variantCardProbandRef);
      }
      if (this.$refs.variantCardRef) {
        this.$refs.variantCardRef.forEach(function(ref) {
          refs.push(ref);
        })
      }
      return refs;
    },

    onShowVariantAssessment: function(showAssessment) {
      let self = this;
      self.$set(self, "showVariantAssessment", showAssessment);
    },
    onShowFiles: function(showFiles){
      this.showFiles = showFiles;
    },

    showLeftPanelWhenFlaggedVariantsForGene: function() {
      let self = this;
      if (self.cohortModel.flaggedVariants && self.cohortModel.flaggedVariants.length > 0) {
        let matchingVariants = self.cohortModel.getFlaggedVariantsForGene(self.selectedGene.gene_name);
        if (!self.isEduMode && matchingVariants.length > 0 && !self.isLeftDrawerOpen) {
          if (self.$refs.navRef) {
            self.$nextTick(function() {
              self.$refs.navRef.onShowVariantsTab();
            });
          }
        } else if (!self.isEduMode && matchingVariants.length > 0) {
          self.$nextTick(function() {
            self.$refs.navRef.activeTab = 1;
          })
        }
      }
    },

    showLeftPanelWhenFlaggedVariants: function(option) {
      let self = this;
      if (!self.isEduMode && self.cohortModel.flaggedVariants && self.cohortModel.flaggedVariants.length > 0 && !self.isLeftDrawerOpen) {
        if (self.$refs.navRef) {
          self.$nextTick(function() {
            self.$refs.navRef.onShowVariantsTab();
          });
        }
      } else if (!self.isEduMode && self.cohortModel.flaggedVariants && self.cohortModel.flaggedVariants.length > 0) {
        self.$nextTick(function() {
          self.$refs.navRef.activeTab = 1;
        })
      }
      if(option === "send-to-clin"){
        setTimeout(()=>{
          self.sendAnalysisToClin();
        }, 2500)
      }
    },

    showLeftPanelForGenes: function() {
      let self = this;
      if (self.geneModel && self.geneModel.sortedGeneNames.length > 0) {
        if (self.$refs.navRef) {
          if (!self.isLeftDrawerOpen) {
            self.$nextTick(function() {
              self.$refs.navRef.onShowGenesTab();
            });
          } else if (self.$refs.navRef) {
            self.$nextTick(function() {
              self.$refs.navRef.activeTab = 0;
            })
          }
        }
      }

    },

    getCorrespondingVariant: function(stashedVariant, loadedVariants){
      let retVar = stashedVariant
      loadedVariants.forEach(function(v) {
        if (v.start === stashedVariant.start
            && v.end === stashedVariant.end
            && v.ref === stashedVariant.ref
            && v.alt === stashedVariant.alt ) {
          retVar = v;
        }
      });
      return retVar;
    },

    promiseLoadGene: function(geneName, theTranscript, transcriptChanged) {
      const self = this;
      this.showWelcome = false;
      self.blacklistedGeneSelected = self.acmgBlacklist[geneName] != null;

      return new Promise(function(resolve, reject) {
        if (self.forMyGene2) {
          if (!self.closeIntro) {
            setTimeout(function() {
              self.closeIntro = true;
            }, 2000);
          }
        }
        self.clearZoom = true;
        if (self.cohortModel) {
          self.cohortModel.clearLoadedData();
        }
        if (self.featureMatrixModel) {
          self.featureMatrixModel.clearRankedVariants();
        }
        self.geneModel.promiseAddGeneName(geneName)
        .then(function(justAdded) {
          if (justAdded && self.launchedFromHub) {
            return self.promiseUpdateAnalysisGenesData();
          } else {
            return Promise.resolve();
          }
        })
        .then(function() {
          return self.geneModel.promiseGetGeneObject(geneName)
        }).then(function(theGeneObject) {
          if (self.bringAttention === 'gene') {
            self.bringAttention = null;
          }
          self.geneModel.adjustGeneRegion(theGeneObject);
          self.geneRegionStart = theGeneObject.start;
          self.geneRegionEnd   = theGeneObject.end;
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
            self.promiseLoadData()
            .then(function() {
              self.clearZoom = false;
              if(transcriptChanged && self.stashedVariant && Object.keys(self.stashedVariant).length > 0) {
                let variant = self.getCorrespondingVariant(self.stashedVariant, self.cohortModel.sampleMap.proband.model.loadedVariants.features);
                self.onCohortVariantClick(variant, self.$refs.variantCardProbandRef, 'proband');
              }
              resolve();
            })
            .catch(function(err) {
              console.log(err)
              reject(err);
            })
          } else {
            resolve();
          }
        })
        .catch(function(error) {
          console.log(error);
          self.geneModel.removeGene(geneName);
          self.onShowSnackbar({message: 'Bypassing ' + geneName + '. Unable to find transcripts.', timeout: 5000})
        })
      })
    },
    onTranscriptIdSelected: function(transcriptId) {
      const self = this;
      let theTranscript = null;
      self.selectedGene.transcripts.filter(function(transcript) {
        if (transcript.transcript_id.indexOf(transcriptId) === 0) {
          theTranscript = transcript;
        }
      })
      if (theTranscript != null) {
        self.onTranscriptSelected(theTranscript);
      }
    },
    onTranscriptSelected: function(transcript) {
      const self = this;
      self.stashedVariant = $.extend({}, this.selectedVariant);
      self.selectedTranscript = transcript;
      self.geneModel.setLatestGeneTranscript(self.selectedGene.gene_name, self.selectedTranscript);
      self.onGeneSelected(self.selectedGene.gene_name, true);
    },
    onGeneSourceSelected: function(theGeneSource) {
      var self = this;
      self.geneModel.geneSource = theGeneSource;
      this.onGeneSelected(this.selectedGene.gene_name);
    
      // We have to clear the cache since the gene transcripts have changed
      self.geneModel.geneToLatestTranscript = {};
      self.promiseClearCache()
      self.showLeftPanelForGenes()

      self.onShowSnackbar({message: 'Genes must be re-analyzed based on ' 
        + self.geneSource + ' transcripts', timeout: 6000});

      setTimeout(function() {
        self.onAnalyzeAll()
      },4000)

    },

    onNoDataWarning: function(){
      let warning = "No data has been loaded, please load data through the Files menu or click 'Run With Demo Data' on the landing page";

      if(this.geneModel && (!this.launchedFromDemo && !this.launchedFromHub && !this.launchedFromFiles && !this.launchedFromClin) && !this.isBasicMode && !this.isSimpleMode) {
        this.onShowSnackbar({message: warning, timeout: 7000});
      }

    },


    onGeneRegionBufferChange: function(theGeneRegionBuffer) {
      let self = this;
      self.geneModel.geneRegionBuffer = theGeneRegionBuffer;
      // We have to clear the cache since the gene regions change
      self.promiseClearCache()
      .then(function() {
        self.onGeneSelected(self.selectedGene.gene_name);
      })

      setTimeout(function () {
        let baseWidth = 40;
        let totalWidth = theGeneRegionBuffer.toString().length * 10
        let width = Math.max(baseWidth, totalWidth);
        d3.select("#region-buffer-box")
          .style("width", width.toString() + "px");
      }, 200);

    },
    onGeneRegionZoom: function(theStart, theEnd) {
      this.geneRegionStart = theStart;
      this.geneRegionEnd = theEnd;

      this.featureMatrixModel.setRankedVariants(this.geneRegionStart, this.geneRegionEnd);

      this.filterModel.regionStart = this.geneRegionStart;
      this.filterModel.regionEnd = this.geneRegionEnd;
      this.cohortModel.setLoadedVariants(this.selectedGene);

      this.cohortModel.setCoverage(this.geneRegionStart, this.geneRegionEnd);
    },
    onGeneRegionZoomReset: function() {
      this.showZoom = false;
      this.clearZoom = true;
      this.geneRegionStart = this.selectedGene.start;
      this.geneRegionEnd = this.selectedGene.end;

      this.featureMatrixModel.setRankedVariants();

      this.filterModel.regionStart = null;
      this.filterModel.regionEnd = null;
      this.cohortModel.setLoadedVariants(this.selectedGene);

      this.cohortModel.setCoverage();
    },
    onCircleVariantForTour: function() {
      let self = this;
      var variant = self.cohortModel.getProbandModel().loadedVariants.features[2];
      self.onCohortVariantClick(variant, null, 'proband');
    },
    onCohortVariantClick: function(variant, sourceComponent, sourceRelationship) {
      let self = this;
      if (variant) {

        if (self.selectedGene) {
          self.geneModel.adjustGeneRegion(self.selectedGene);
          self.geneRegionStart = self.selectedGene.start;
          self.geneRegionEnd   = self.selectedGene.end;
        }

        self.calcFeatureMatrixWidthPercent();
        self.$set(self, "selectedVariant", variant);
        self.$set(self, "selectedVariantKey", self.getVariantKey(self.selectedVariant));
        self.selectedVariantRelationship = sourceRelationship;
        self.refreshSelectedVariantInfo();
        self.$set(self, "selectedVariantNotes", self.selectedVariant);
        self.$set(self, "selectedVariantInterpretation", self.selectedVariant);
        self.showVariantAssessment = false;
        self.activeGeneVariantTab = self.isBasicMode ? "0" : "1";

        self.showVariantExtraAnnots(sourceRelationship ? sourceRelationship : 'proband', variant);

        self.getVariantCardRefs().forEach(function(variantCard) {
          if (sourceComponent === null || variantCard !== sourceComponent) {
            variantCard.hideVariantCircle(true);
            variantCard.showVariantCircle(variant, true);
            variantCard.showCoverageCircle(variant);
          }
        })

        if (self.$refs.navRef && self.$refs.navRef.$refs.flaggedVariantsRef) {
          self.$refs.navRef.$refs.flaggedVariantsRef.deselectVariant();
        }
        if (!self.isBasicMode && self.$refs.featureMatrixCardRef) {
          if (sourceComponent == null || self.$refs.featureMatrixCardRef !== sourceComponent) {
            self.$refs.featureMatrixCardRef.selectVariant(self.selectedVariant);
          }
        }
        if (self.isEduMode) {
          self.$refs.appTourRef.checkVariant(variant);
        }
        if (self.$refs.scrollButtonRefVariant) {
          self.$refs.scrollButtonRefVariant.showScrollButtons();
        }

      } else {
        self.deselectVariant();
      }
    },
    getVariantKey(variant) {
      if (variant) {
        return  {'chrom': variant.chrom, 'start': variant.start, 'ref': variant.ref, 'alt': variant.alt};
      } else {
        return {};
      }
    },
    onCohortVariantOutsideClick(sourceComponent, sourceRelationship) {
      if (sourceRelationship === 'proband') {
        self.deselectedVariant();
      }
    },
    onCohortVariantHover: function(variant, sourceComponent) {
      let self = this;
      self.getVariantCardRefs().forEach(function(variantCard) {
        if (variantCard !== sourceComponent) {
          variantCard.showVariantCircle(variant, false);
          variantCard.showCoverageCircle(variant);
        }
      })
      if (!self.isBasicMode && self.$refs.featureMatrixCardRef) {
        if (self.$refs.featureMatrixCardRef !== sourceComponent) {
          self.$refs.featureMatrixCardRef.selectVariant(variant, 'highlight');
        }
      }
    },
    onCohortVariantHoverEnd: function() {
      let self = this;
      self.getVariantCardRefs().forEach(function(variantCard) {
        variantCard.hideVariantCircle(false);
        variantCard.hideCoverageCircle();
      })
      if (!self.isBasicMode && self.$refs.featureMatrixCardRef) {
        self.$refs.featureMatrixCardRef.selectVariant(null, 'highlight');
      }
    },
    deselectVariant: function() {
      let self = this;
      self.selectedVariant = null;
      self.refreshSelectedVariantInfo();
      self.selectedVariantKey = null;
      self.selectedVariantNotes = null;
      self.selectedVariantInterpretation = null;
      self.selectedVariantRelationship = null;
      self.showVariantAssessment = false;
      self.activeGeneVariantTab = "0";
      self.getVariantCardRefs().forEach(function(variantCard) {
        variantCard.hideVariantTooltip();
        variantCard.hideVariantCircle(true);
        variantCard.hideCoverageCircle();
      })
      if (self.$refs.featureMatrixCardRef) {
        self.$refs.featureMatrixCardRef.selectVariant(null);
      }
    },

    refreshSelectedVariantInfo: function() {
      if (this.selectedVariant) {
        this.selectedVariantInfo =  this.globalApp.utility.formatDisplay(this.selectedVariant, this.cohortModel.translator, this.isEduMode)
      } else {
        this.selectedVariantInfo = null;
      }
    },

    showVariantExtraAnnots: function(relationship, variant) {
      let self = this;
      if (!self.isEduMode && !self.cohortModel.getModel(relationship).isAlignmentsOnly() )  {
        if (relationship === 'known-variants') {
          self.cohortModel
              .getModel(relationship)
              .promiseGetVariantExtraAnnotations(self.selectedGene, self.selectedTranscript, self.selectedVariant)
              .then( function(refreshedVariant) {
                self.refreshVariantExtraAnnots(variant, [refreshedVariant]);
              })
        } else if (relationship !== 'sfari-variants'){
          self.cohortModel
            .getModel(relationship)
            .promiseGetImpactfulVariantIds(self.selectedGene, self.selectedTranscript)
            .then( function(annotatedVariants) {
              // If the clicked variant is in the list of annotated variants, show the
              // tooltip; otherwise, the callback will get the extra annots for this
              // specific variant
              self.refreshVariantExtraAnnots(variant, annotatedVariants, function() {
                // The clicked variant wasn't annotated in the batch of variants.  Get the
                // extra annots for this specific variant.
                self.cohortModel
                  .getModel(relationship)
                  .promiseGetVariantExtraAnnotations(self.selectedGene, self.selectedTranscript, variant)
                  .then( function(refreshedVariant) {
                    self.refreshVariantExtraAnnots(variant, [refreshedVariant]);
                  })
              })
            });
        }
      }
    },

    refreshVariantExtraAnnots: function(variant, annotatedVariants, callbackNotFoundOrAnnotated) {
      let self = this;
      var targetVariants = annotatedVariants.filter(function(v) {
        return variant &&
               variant.start === v.start &&
               variant.ref   === v.ref &&
               variant.alt   === v.alt;
      });
      if (targetVariants.length > 0) {
        var annotatedVariant = targetVariants[0];
        annotatedVariant.screenX = variant.screenX;
        annotatedVariant.screenY = variant.screenY;
        annotatedVariant.screenXMatrix = variant.screenXMatrix;
        annotatedVariant.screenYMatrix = variant.screenYMatrix;

        if (annotatedVariant.extraAnnot) {
          variant.extraAnnot      = true;
          var extraAnnotFields = [
            'vepConsequence',
            'vepImpact',
            'vepExon',
            'vepHGVSc',
            'vepHGVSp',
            'vepAminoAcids',
            'vepVariationIds',
            'vepSIFT',
            'vepPolyPhen',
            'vepRegs',
            'regulatory',
            'vepAf',
            'highestImpactVep',
            'highestSIFT',
            'highestPolyphen',
            'gnomAD'
            ];
          extraAnnotFields.forEach(function(field) {
            variant[field]        = annotatedVariant[field];
          })
          self.refreshSelectedVariantInfo();
        } else {
          if (callbackNotFoundOrAnnotated) {
            callbackNotFoundOrAnnotated();
          }
        }


      } else {
        if (callbackNotFoundOrAnnotated) {
          callbackNotFoundOrAnnotated();
        }
      }

    },
    onKnownVariantsVizChange: function(viz, selectedCategories) {
      let self = this;
      if (viz) {
        self.cohortModel.knownVariantsViz = viz;
      }
      if (self.showKnownVariantsCard && self.cohortModel && self.cohortModel.isLoaded && Object.keys(self.selectedGene).length > 0) {
        self.cohortModel.promiseLoadKnownVariants(self.selectedGene, self.selectedTranscript, selectedCategories);
      }
    },
    onSfariVariantsVizChange: function(viz) {
        let self = this;
        if (viz) {
            self.cohortModel.sfariVariantsViz = viz;
        }
        if (self.showSfariVariantsCard && self.cohortModel && self.cohortModel.isLoaded && Object.keys(self.selectedGene).length > 0
            && self.acmgBlacklist[self.selectedGene.gene_name] == null) {
            self.cohortModel.promiseLoadSfariVariants(self.selectedGene, self.selectedTranscript);
        }
    },
    onKnownVariantsFilterChange: function(selectedCategories) {
      let self = this;
      if (self.showKnownVariantsCard && self.cohortModel && self.cohortModel.isLoaded && Object.keys(self.selectedGene).length > 0) {
        self.cohortModel.promiseLoadKnownVariants(self.selectedGene, self.selectedTranscript, selectedCategories);
      }
      // self.filterModel.setModelFilter('known-variants', 'clinvar', selectedCategories);
      // self.cohortModel.setLoadedVariants(self.selectedGene, 'known-variants');
    },
    onSfariVariantsFilterChange: function(selectedCategories) {
        let self = this;
        self.filterModel.setModelFilter('sfari-variants', 'vepImpact', selectedCategories);
        self.cohortModel.setLoadedVariants(self.selectedGene, 'sfari-variants');
    },
    onRemoveGene: function(geneName) {
      let self = this;
      self.setDirty(true);
      let msg = "";
      var filters = this.cohortModel.getFlaggedVariantsByFilter(geneName);
      filters.forEach(function(filter) {
        msg += filter.variants.length
            + (filter.variants.length  > 1 ? " variants " : " variant ")
            + " marked as '"
            + filter.filter.title
            + "' "
            + (filter.variants.length  > 1 ? " exist in gene " : " exists in gene ")
            + geneName + ".<br><br>";
      })
      msg += "Are you sure you want to remove gene " + geneName + "?"
      alertify.confirm("",
        msg,
        function () {
          // ok
          self.removeGeneImpl(geneName);
        },
        function() {
          // cancel
        }

      ).set('labels', {ok:'OK', cancel:'Cancel'});

    },


    persistAnalysis: function() {
      return (this.launchedFromClin || this.launchedFromHub);
    },

    isNewAnalysis: function() {
      return ( (this.analysis && !this.analysis.hasOwnProperty("id"))
              ||  (this.analysis && !this.analysis.id)
              || (this.analysis && this.analysis.id === ""));
    },

    removeGeneImpl: function(geneName) {
      let self = this;
      self.geneModel.removeGene(geneName);
      self.cohortModel.removeFlaggedVariantsForGene(geneName);
      self.clearFilter();
      self.cacheHelper.clearCacheForGene(geneName);
      self.onSendGenesToClin();
      /* REMOVE AUTOUPDATE
      if (self.persistAnalysis() && flaggedVariantsToDelete.length > 0) {
        self.promiseDeleteAnalysisVariants( flaggedVariantsToDelete)
      } else if (self.persistAnalysis()) {
        self.promiseUpdateAnalysisGenesData();
      }
      */
      if (self.persistAnalysis()) {
        self.promiseUpdateAnalysisGenesData();
      }

      var newGeneToSelect = null;
      if (geneName === this.selectedGene.gene_name && this.geneModel.sortedGeneNames.length > 0) {
        newGeneToSelect = this.geneModel.sortedGeneNames[0];
        self.deselectVariant();
        self.promiseLoadGene(newGeneToSelect)
        .then(function() {
          self.activeGeneVariantTab = "0";
          self.setUrlGeneParameters();
        })
      } else {
        self.setUrlGeneParameters();
      }

    },

    onGenesReplaced: function(oldGeneNames, newGeneNames) {
      let self = this;

      var removedGeneNames = oldGeneNames.filter(function(geneName) {
        return newGeneNames.indexOf(geneName) === -1;
      })

      removedGeneNames.forEach(function(geneName) {
        self.cohortModel.removeFlaggedVariantsForGene(geneName);
        self.clearFilter();
        self.cacheHelper.clearCacheForGene(geneName);
      })
      self.onSendGenesToClin();
    },

    onAnalyzeAll: function() {
      this.showLeftPanelForGenes();
      this.cacheHelper.analyzeAll(this.cohortModel);
    },
    onClearAllGenes: function() {
      this.clearFilter();
      this.selectedGene = {};
      this.geneModel.clearAllGenes();
      this.cohortModel.flaggedVariants = [];

    },
    onStartSearchGenes: function() {
      this.bringAttention = null;
    },
    promiseResetAllGenes: function() {
      let self = this;
      if (self.geneModel.sortedGeneNames == null || self.geneModel.sortedGeneNames.length === 0) {
        return Promise.resolve();
      } else {
        return new Promise(function(resolve) {
          self.clearFilter();
          let geneToSelect   = $.extend(self.selectedGene);
          self.selectedGene = {};
          self.selectedTranscript = null;
          self.selectedVariant = null;
          self.refreshSelectedVariantInfo();
          self.selectedVariantKey = null;
          self.selectedVariantRelationship = null;
          self.showVariantAssessment = false;
          self.selectedVariantNotes = null;
          self.selectedVariantInterpretation = null;
          self.activeGeneVariantTab = "0";

          let genesToReapply = $.extend([], self.geneModel.sortedGeneNames);

          self.geneModel.clearAllGenes();
          self.cohortModel.flaggedVariants = [];

          self.applyGenesImpl(genesToReapply.join(","), {replace: true, warnOnDup: false, isFromClin: false},
          function() {
            self.selectedGene = geneToSelect;
            resolve();
          });
        })
      }
    },
    clearFilter: function() {
      if (this.$refs.genesCardRef) {
        this.$refs.genesCardRef.clearFilter();
      }
    },
    onApplyGenes: function(genesString, options, callback) {
      let self = this;
      if (options == null) {
        options = {isFromClin: false};
      } else if (!options.hasOwnProperty("isFromClin")) {
        options.isFromClin = false;
      }

      if (!options.isFromClin) {
        self.clearFilter();
      }

      let existingGeneCount = self.geneModel.sortedGeneNames.length;
      let existingPhenotypeTerm = self.phenotypeTerm;

      self.phenotypeTerm = options ? options.phenotypes : null;

      let genesToApplyCount = self.geneModel.getCopyPasteGeneCount(genesString);

      let doIt = function() {
        self.showLeftPanelForGenes();
        let oldGeneNames = $.extend([], self.geneModel.sortedGeneNames);
        self.applyGenesImpl(genesString, options, function() {
          if (options && options.replace) {
            self.onGenesReplaced(oldGeneNames, self.geneModel.sortedGeneNames);
          }
          if (!options.isFromClin) {
            self.onSendGenesToClin();
          }
          if (self.launchedFromHub) {
            self.promiseUpdateAnalysisGenesData(self.phenotypeTerm)
          }
          if (callback) {
            callback();
          }
        })
      }

      if (self.phenotypeTerm && !options.isFromClin && existingGeneCount > 0 && existingPhenotypeTerm !== self.phenotypeTerm) {
        let msg = "Replace existing genes with the " + genesToApplyCount + " genes associated with <br>'" + self.phenotypeTerm + "'?";
        alertify.confirm("",
          msg,
          function () {
            // ok
            options.replace = true;
            doIt();
          },
          function() {
            // cancel
            options.replace = false;
            doIt();
          }

        ).set('labels', {ok:'Replace gene list', cancel:'Combine genes with current list'});

      }
      else if (self.phenotypeTerm && existingGeneCount > 0 && existingPhenotypeTerm !== self.phenotypeTerm) {
        options.replace = true;
        doIt();
      }
      else {
        doIt();
      }


    },
    applyGenesImpl: function(genesString, options, callback) {
      let self = this;
      self.selectedGene = {};
      self.geneModel.promiseCopyPasteGenes(genesString, options)
      .then(function() {
        if (!self.launchedFromClin) {
          self.setUrlGeneParameters();
        }
        let geneNameToSelect = null;
        if (self.launchedFromClin) {
          if (self.geneModel.geneNames && self.geneModel.geneNames.length > 0) {
            let applicableGenes = self.geneModel.geneNames.filter(function(geneName) {
              if (self.isFullAnalysis) {
                return !self.geneModel.isCandidateGene(geneName);
              } else {
                return self.geneModel.isCandidateGene(geneName);
              }
            })
            if (applicableGenes.length > 0) {
              geneNameToSelect = applicableGenes[0];
            }
            else{
              geneNameToSelect = self.geneModel.sortedGeneNames[0];
            }
          }

        } else {
          if (self.geneModel.sortedGeneNames && self.geneModel.sortedGeneNames.length > 0) {
            geneNameToSelect = self.geneModel.sortedGeneNames[0];
          }
        }

        if (geneNameToSelect) {
          return self.promiseLoadGene(geneNameToSelect);
        } else {
          return Promise.resolve();
        }

      })
      .then(function() {
        if (self.geneModel.sortedGeneNames && self.geneModel.sortedGeneNames.length > 0) {
          if (self.cohortModel && self.cohortModel.isLoaded && !self.isEduMode) {
            self.showLeftPanelForGenes();
            self.cacheHelper.analyzeAll(self.cohortModel, false);
            if (callback) {
              callback();
            }
          }
        }
      })

    },
    onSortGenes: function(sortBy) {
      this.geneModel.sortGenes(sortBy);
    },
    setAppMode: function() {
      let self = this;
      if ( self.paramMyGene2 && self.paramMyGene2 !== "" ) {
        self.forMyGene2   = !(self.paramMyGene2 === "false" || self.paramMyGene2.toUpperCase() === "N");
      }
      if (self.paramMode && self.paramMode !== "") {
        self.isBasicMode  = self.paramMode === "basic";
        self.isEduMode    = (self.paramMode === "edu" || self.paramMode === "edutour");
      }

      if (self.paramMode && self.paramMode === 'advanced') {
        if (self.isSimpleMode) {
          self.isSimpleMode = false;
        }
      } else if (self.paramMode && self.paramMode === 'simple') {
        self.isSimpleMode = true;
      }

      self.showIntro = self.forMyGene2 || process.env.SHOW_INTRO;
      if (process.env.SHOW_FILES_BUTTON && process.env.SHOW_FILES_BUTTON == 'false') {
        self.showFilesButton =  false;
      } else if (self.forMyGene2) {
        self.showFilesButton = false;
      }

      if (self.paramSampleId && self.paramSampleId.length > 0) {
        self.sampleId = self.paramSampleId;
      } else if (self.paramSampleUuid && self.paramSampleUuid.length > 0) {
        self.sampleId = self.paramSampleUuid;
      }
      if (self.paramProjectId && self.paramProjectId.length > 0) {
        self.projectId = self.paramProjectId;
      }
      if (self.paramIobioSource && self.paramIobioSource.length > 0) {
        self.globalApp.IOBIO_SOURCE = self.paramIobioSource;
      }
      if (localStorage.getItem('hub-iobio-tkn') && localStorage.getItem('hub-iobio-tkn').length > 0
        && self.sampleId && self.paramSource) {
        self.launchedFromHub = true;

        if (self.paramSource === self.sfariSource) {
          self.launchedFromSFARI = true;
        }

        // Figure out which IOBIO backend we should be using.
        // TODO - This should be a URL parameter from hub
        if (self.paramIobioSource == null && self.hubToIobioSources[self.paramSource]) {
          self.globalApp.IOBIO_SOURCE = self.hubToIobioSources[self.paramSource].iobio;
          self.globalApp.DEFAULT_BATCH_SIZE = self.hubToIobioSources[self.paramSource].batchSize;
          self.globalApp.initBackendSource(self.globalApp.IOBIO_SOURCE)
        } else {
          self.globalApp.IOBIO_SOURCE = self.globalApp.DEFAULT_IOBIO_BACKEND;
          self.globalApp.initBackendSource(self.globalApp.IOBIO_SOURCE);
        }
        self.isHubDeprecated = !self.projectId;
      } else {
        self.globalApp.initServices(self.launchedFromHub);
      }
      if (self.paramTour) {
        self.tourNumber = self.paramTour;
      }
      self.phenotypeLookupUrl = self.globalApp.hpoLookupUrl;
    },
    promiseInitFromUrl: function() {
      let self = this;

      return new Promise(function(resolve, reject) {

        // Set the genome build before we access any gene
        // transcripts to ensure we are using the appropriate
        // build!
        if (self.paramSpecies) {
          self.genomeBuildHelper.setCurrentSpecies(self.paramSpecies);
        }
        if (self.paramBuild) {
          self.genomeBuildHelper.setCurrentBuild(self.paramBuild);
        }
        if (self.paramBatchSize) {
          self.globalApp.DEFAULT_BATCH_SIZE = self.paramBatchSize;
        }
        if (self.paramGeneSource) {
          self.geneModel.geneSource = self.paramGeneSource;
        }
        if (self.paramGenes) {
          self.paramGenes.split(",").forEach( function(geneName) {
            self.geneModel.promiseAddGeneName(geneName);
          });
        } else if (self.paramGeneNames) {
          self.paramGeneNames.split(",").forEach( function(geneName) {
            self.geneModel.promiseAddGeneName(geneName);
          });
        }
        if (self.paramGene) {
          self.geneModel.promiseAddGeneName(self.paramGene);
          self.onGeneSelected(self.paramGene);
        } else if (self.paramGeneName) {
          self.geneModel.promiseAddGeneName(self.paramGeneName);
          if (!self.launchedFromHub) {
            self.onGeneSelected(self.paramGeneName);
          }
        }

        let isTrio = self.paramRelationships.every(sample => sample);
        if (isTrio) {
          self.isMother = true;
          self.isFather = true;
        }


        var modelInfos = [];
        for (var i = 0; i < self.paramRelationships.length; i++) {
          var rel  = self.paramRelationships[i];
          if (rel) {
            var modelInfo            = {'relationship': rel};
            modelInfo.name           = self.paramNames[i];
            modelInfo.vcf            = self.paramVcfs[i];
            modelInfo.tbi            = self.paramTbis[i];
            modelInfo.bam            = self.paramBams[i];
            modelInfo.bai            = self.paramBais[i];
            modelInfo.sample         = self.paramSamples[i];
            modelInfo.affectedStatus = self.paramAffectedStatuses[i];
            modelInfos.push(modelInfo);
            self.launchedWithUrlParms = true;
          }
        }

        if (self.paramUnaffectedSibs && self.paramUnaffectedSibs.length > 0 && modelInfos.length > 0) {
          self.paramUnaffectedSibs.split(",").forEach(function(sibId) {
            var sibModelInfo = $.extend({}, modelInfos[0]);
            sibModelInfo.name = sibId;
            sibModelInfo.sample = sibId;
            sibModelInfo.relationship = 'sibling';
            sibModelInfo.affectedStatus = 'unaffected';
            sibModelInfo.bam = null;
            sibModelInfo.bai = null;
            modelInfos.push(sibModelInfo);
          })
        }

        if (self.paramAffectedSibs && self.paramAffectedSibs.length > 0 && modelInfos.length > 0) {
          self.paramAffectedSibs.split(",").forEach(function(sibId) {
            var sibModelInfo = $.extend({}, modelInfos[0]);
            sibModelInfo.name = sibId;
            sibModelInfo.sample = sibId;
            sibModelInfo.relationship = 'sibling';
            sibModelInfo.affectedStatus = 'affected';
            sibModelInfo.bam = null;
            sibModelInfo.bai = null;
            modelInfos.push(sibModelInfo);
          })
        }

        if (modelInfos.length > 0) {
          self.cohortModel.promiseInit(modelInfos, self.projectId)
          .then(function() {
            self.showLeftPanelForGenes();
            resolve();
          }).
          catch(function(error) {
            reject(error);
          })
        } else if (self.isEduMode && self.tourNumber !== '') {
          self.promiseInitTourSample(self.tourNumber, 0)
          .then(function() {
            resolve();
          })
        } else if (self.forMyGene2) {
          self.promiseInitMyGene2()
          .then(function() {
            resolve();
          })
        } else if (self.isSimpleMode) {
          alertify.confirm("", "No data files specified",
               function(){
                  self.cohortModel.promiseInitDemo()
                  .then(function() {
                    self.cohortModel.defaultingToDemoData = true;
                    self.onAnalyzeAll();
                    resolve();
                  })
               },
               function(){
                  resolve();
               }).set('labels', {ok:'Continue, but just use demo data', cancel:'Cancel'});
        } else {
          resolve();
        }
      })

    },
    onRemoveUserFlaggedVariant: function(variant) {
      let self = this;

      variant.isFlagged = false;
      variant.featureClass = "";
      self.cohortModel.removeUserFlaggedVariant(self.selectedGene, self.selectedTranscript, variant);

      if (!self.isEduMode) {
        self.$refs.navRef.onShowVariantsTab();
      }
      // Refresh the loaded variants so that the ranked variants table
      // reflects the flagged variants
      self.promiseLoadGene(self.selectedGene.gene_name)
      .then(function() {
        self.onCohortVariantClick(variant, self.$refs.variantCardProbandRef, 'proband');
      })

    },
    onFlaggedVariantsImported: function() {
      this.bringAttention = null;
      this.showLeftPanelWhenFlaggedVariants()
      this.promiseSelectFirstFlaggedVariant()
    },
    onApplyVariantNotes: function(variant) {
      let self = this;

      self.setDirty(true);

      // If the variant isn't in the filtered variants list,
      // mark it as 'user flagged'
      if (self.cohortModel.getFlaggedVariant(variant) == null) {
        variant.gene = this.selectedGene;
        variant.transcript = this.selectedTranscript;
        self.cohortModel.addUserFlaggedVariant(self.selectedGene, self.selectedTranscript, variant);
      }

      if (variant === self.selectedVariant) {
        self.$set(self, "selectedVariantNotes", variant.notes);
      }

      let theTranscript = variant.transcript ? variant.transcript : self.geneModel.getCanonicalTranscript(variant.gene)
      self.cohortModel.setVariantInterpretation(variant.gene, theTranscript, variant);

      if (self.$refs.navRef && self.$refs.navRef.$refs.flaggedVariantsRef) {
        self.$refs.navRef.$refs.flaggedVariantsRef.populateGeneLists();
      }

      if(typeof variant.interpretation === 'undefined' || (variant.interpretation === "not-reviewed")){
        variant.interpretation = 'unknown-sig';
        self.onApplyVariantInterpretation(variant);
      }
      
      if (self.launchedFromClin) {
        self.promiseUpdateAnalysisVariant(variant, {delay: false});
      }

    },

    promiseUpdateAnalysisVariant: function(variantToReplace) {
      let self = this;
      self.analysis.payload.datetime_last_modified = self.globalApp.utility.getCurrentDateTime();
      self.promiseExportAnalysisVariant(variantToReplace)
      .then(function() {
        return self.sendInterpretedVariantsToClin({notify: true, delay: true});
      })
    },

    sendInterpretedVariantsToClin() {
      let self = this;
      if (self.launchedFromClin) {
        self.sendAnalysisToClin();
      }
    },

    onApplyVariantInterpretation: function(variant) {
      let self = this;

      self.setDirty(true);

      // If this variant is user flagged, but then changed back to unreviewed, we
      // need to unflag it and remove it from the variant list.
      /*
      if (variant.isUserFlagged && variant.interpretation == "not-reviewed" &&
        (variant.notes == null || variant.notes.length == 0)) {
        self.onRemoveUserFlaggedVariant(variant);
        return;
      }
      */

      // If this is a variant that did not pass filters, but flagged (interpreted) by the
      // user, we will need to initialize variant.gene

      if (!variant.gene) {
        variant.gene = this.selectedGene;
      }
      if (!variant.transcript) {
        variant.transcript = this.selectedTranscript;
      }
      if (variant.interpretation !== "not-reviewed" &&
        self.cohortModel.getFlaggedVariant(variant) == null) {
        self.cohortModel.addUserFlaggedVariant(self.selectedGene, self.selectedTranscript, variant);
      }

      if (variant === self.selectedVariant) {
        self.$set(self, "selectedVariantInterpretation", variant.interpretation);
      }

      let theTranscript = variant.transcript ? variant.transcript : self.geneModel.getCanonicalTranscript(variant.gene)
      self.cohortModel.setVariantInterpretation(variant.gene, theTranscript, variant);

      if (self.$refs.navRef && self.$refs.navRef.$refs.flaggedVariantsRef) {
        self.$refs.navRef.$refs.flaggedVariantsRef.populateGeneLists(variant);
      }

      if (self.launchedFromClin) {
        self.promiseUpdateAnalysisVariant(variant, {delay: false});
      }

    },

    isVariantUnique: function(variant){
      let unique = true;
      for(let i = 0; i < this.analysis.payload.variants.length; i++) {
        if(this.analysis.payload.variants[i].start === variant.start && this.analysis.payload.variants[i].end === variant.end && this.analysis.payload.variants[i].ref === variant.ref && this.analysis.payload.variants[i].alt === variant.alt){
          unique = false;
        }
      }
      return unique;
    },

    onFlaggedVariantSelected: function(flaggedVariant, options={}, callback) {
      let self = this;

      if(flaggedVariant === null){
        this.selectedVariant = null;
        return;
      }

      this.hasVariantAssessment = this.hasVariantAssessmentCheck(flaggedVariant);
      this.showVariantAssessment = false;

      let canonicalTranscript = self.geneModel.getCanonicalTranscript(flaggedVariant.gene);

      // Only select the gene if it hasn't previously been selected or the transcript is different
      let genePromise;
      if (!options.force && self.selectedGene && self.selectedGene.gene_name === flaggedVariant.gene.gene_name) {
        genePromise = Promise.resolve();
      } else if (flaggedVariant.transcript == null
        && self.selectedTranscript
        && self.selectedTranscript.transcript_id === canonicalTranscript.transcript_id) {
        // No need to reselect the gene if the canonical transcript is already selected for the same gene
        self.selectedGene = flaggedVariant.gene;
        genePromise = Promise.resolve();
      } else if (flaggedVariant.transcript
        && self.selectedTranscript
        && self.selectedTranscript.transcript_id === flaggedVariant.transcript.transcript_id) {
        // No need to reselect the gene if the same transcript on the same gene is already selecte
        self.selectedGene = flaggedVariant.gene;
        genePromise = Promise.resolve();
      } else {
        self.geneModel.adjustGeneRegion(flaggedVariant.gene);
        self.geneRegionStart = flaggedVariant.gene.start;
        self.geneRegionEnd   = flaggedVariant.gene.end;
        self.selectedGene = flaggedVariant.gene;
        if (flaggedVariant.transcript) {
          self.selectedTranscript = flaggedVariant.transcript;
        } else {
          self.selectedTranscript = self.geneModel.getCanonicalTranscript(self.selectedGene);
        }
        self.selectedVariant = null;
        self.refreshSelectedVariantInfo();
        self.selectedVariantKey = null;
        self.selectedVariantNotes = null;
        self.showVariantAssessment = false;
        self.selectedVariantInterpretation = null;
        self.selectedVariantRelationship = null;
        genePromise = self.promiseLoadGene(self.selectedGene.gene_name, self.selectedTranscript);
      }

      genePromise
      .then(function() {

        setTimeout(
          function() {

            let matchingVariantPromise;
            self.calcFeatureMatrixWidthPercent();
            if (flaggedVariant.isProxy) {
              matchingVariantPromise = self.cohortModel.getProbandModel().promiseGetMatchingVariant(flaggedVariant, flaggedVariant.gene, flaggedVariant.transcript);
            } else {
              matchingVariantPromise = Promise.resolve(flaggedVariant);
            }


            matchingVariantPromise
            .then(function(matchingVariant) {

              if (matchingVariant && !matchingVariant.isProxy) {


                var isUserFlagged = flaggedVariant.isUserFlagged;
                var notes = flaggedVariant.notes;
                var interpretation = flaggedVariant.interpretation;
                flaggedVariant = $.extend(flaggedVariant, matchingVariant);
                flaggedVariant.isFlagged = true;
                flaggedVariant.isUserFlagged = isUserFlagged;
                flaggedVariant.notes = notes;
                flaggedVariant.interpretation = interpretation;
                flaggedVariant.isProxy = false;

                self.$set(self, "selectedVariant", flaggedVariant);
                self.refreshSelectedVariantInfo();
                self.$set(self, "selectedVariantRelationship", "proband");
                self.$set(self, "selectedVariantKey", self.getVariantKey(flaggedVariant));
                self.$set(self, "selectedVariantNotes", flaggedVariant.notes);
                self.$set(self, "selectedVariantInterpretation", flaggedVariant.interpretation);
                self.showVariantAssessment = false;

                self.showVariantExtraAnnots('proband', self.selectedVariant);

                self.$refs.variantCardProbandRef.showFlaggedVariant(flaggedVariant);

                if (!self.isBasicMode && self.$refs.featureMatrixCardRef) {
                  self.$refs.featureMatrixCardRef.selectVariant(flaggedVariant);
                }


                self.getVariantCardRefs().forEach(function(variantCard) {
                    variantCard.showVariantCircle(flaggedVariant, true);
                    variantCard.showCoverageCircle(flaggedVariant);
                })


                self.activeGeneVariantTab = self.isBasicMode ? "0" : "1";
                if (self.$refs.variantInspectRef) {
                  self.$refs.variantInspectRef.refresh();
                }

                if (callback) {
                  callback();
                }

              }


            })
            .catch(function() {
              console.log("GeneHome.onFlaggedVariantSelected. Unable to get matching variant");
              if (callback) {
                callback();
              }
            })
          },
          500);

      });
    },
    onShowCoverageThreshold: function(showIt) {
      let self = this;
      self.showCoverageThreshold = showIt;

    },
    onShowKnownVariantsCard: function(showIt, selectedCategories) {
      let self = this;
      self.showKnownVariantsCard = showIt;
      self.setNonProbandModels();
      if (self.showKnownVariantsCard) {
        self.onKnownVariantsVizChange(showIt, selectedCategories);
      }
    },
    onShowSfariVariantsCard: function(showIt) {
        let self = this;
        self.showSfariVariantsCard = showIt;
        self.setNonProbandModels();
        if (self.showSfariVariantsCard) {
            self.onSfariVariantsVizChange();
        }
    },
    onOptionalTrackClose: function(showIt) {
      // this.promiseLoadGene(this.selectedGene.gene_name);
    },
    onShowMotherCard: function(showIt) {
      let self = this;
      self.showMotherCard = showIt;
      self.setNonProbandModels();

    },
    onShowFatherCard: function(showIt) {
      let self = this;
      self.showFatherCard = showIt;
      self.setNonProbandModels();
    },
    onAnalyzeCodingVariantsOnly: function(analyzeCodingVariantsOnly) {
      this.cohortModel.analyzeCodingVariantsOnly = analyzeCodingVariantsOnly;
    },
    onFilterSettingsApplied: function(stashedVariant) {
      let self = this;
      self.cohortModel.cacheHelper.refreshGeneBadges(function() {
        if (!self.isEduMode && self.cohortModel.flaggedVariants && self.cohortModel.flaggedVariants.length > 0) {
          self.$refs.navRef.onShowVariantsTab();
        }

        self.refreshCoverageCounts();
        if (self.selectedGene && self.selectedGene.gene_name) {
          self.onGeneSelected(self.selectedGene.gene_name);
        }
        // if(stashedVariant) {
        //   self.onCohortVariantClick(stashedVariant, null, 'proband');
        // }

        if (self.launchedFromClin) {
          self.onSendFiltersToClin();
        }
      })
    },
    refreshCoverageCounts: function() {
      let self = this;
      self.badgeCounts = {coverage: 0};


      // Tally up genes that have insufficient coverage
      if (self.geneModel.geneNames) {
        self.geneModel.geneNames.forEach(function(geneName) {
          var dangerSummary = self.geneModel.getDangerSummary(geneName);

          if (dangerSummary) {
            if (dangerSummary.geneCoverageProblem) {
              self.badgeCounts.coverage++;
            }
          }
        })
      }
    },
    onCoverageThresholdClose: function() {
      this.showCoverageThreshold = false;
    },
    onCoverageThresholdApplied: function() {
      let self = this;

      self.refreshCoverageCounts();
      if (self.selectedGene && self.selectedGene.gene_name) {
        self.onGeneSelected(self.selectedGene.gene_name);
      }
      if (self.launchedFromClin) {
        self.onSendFiltersToClin();
      }
    },
    onLeftDrawer: function(isOpen) {
      if (!this.isEduMode) {
        this.isLeftDrawerOpen = isOpen;
      }
    },
    promiseInitMyGene2: function() {
      let self = this;
      return new Promise(function(resolve, reject) {
        self.cohortModel.promiseInitMyGene2(self.siteConfig, self.paramFileId)
        .then(function() {
          self.models = self.cohortModel.sampleModels;
          var geneName = null;
          if (self.selectedGene && self.selectedGene.gene_name) {
            geneName = self.selectedGene.gene_name;
          } else if (self.geneModel.sortedGeneNames && self.geneModel.sortedGeneNames.length > 0) {
            geneName = self.geneModel.sortedGeneNames[0];
          }
          if (geneName) {
            self.promiseLoadGene(geneName)
            .then(function() {
              self.cacheHelper.analyzeAll(self.cohortModel, false);
              resolve();
            })
            .catch(function(error) {
              reject(error);
            })
          } else {
            resolve();
          }
        })
      })
    },

    onTakeAppTour: function() {
      this.onLoadDemoData();
      this.$refs.appTourRef.startTour("main");
    },
    onInitTourSample: function(tour, sampleIndex) {
      let self = this;
      self.promiseInitTourSample(tour, sampleIndex)
    },
    promiseInitTourSample: function(tour, sampleIndex) {
      let self = this;
      return new Promise(function(resolve, reject) {


        var geneName = null;
        if (self.selectedGene && self.selectedGene.gene_name) {
          geneName = self.selectedGene.gene_name;
        }
        self.selectedGene = {};

        self.cohortModel.isLoaded = false;
        self.calcFeatureMatrixWidthPercent();
        self.cohortModel.promiseInitEduTour(tour, sampleIndex)
        .then(function() {
          self.models = self.cohortModel.sampleModels;

          if (geneName == null) {
            if (self.geneModel.sortedGeneNames && self.geneModel.sortedGeneNames.length > 0) {
              geneName = self.geneModel.sortedGeneNames[0];
            }
          }

          if (geneName) {
            self.promiseLoadGene(geneName)
            .then(function() {
              self.onGeneSelected(geneName);
              self.calcFeatureMatrixWidthPercent();
              resolve();
            })
            .catch(function(error) {
              reject(error);
            })
          } else {
            resolve();
          }
        })
      })
    },
    onTourStartOver: function() {
      this.$refs.appTourRef.completeTour();
      this.$router.push({ name: 'exhibit' });
    },
    onAdvancedMode: function() {
      let self = this;
      this.isBasicMode = false;
      this.isSimpleMode = false;
      this.closeIntro = false;
      setTimeout(function() {
          self.closeIntro = true;
      }, 2000);
      this.featureMatrixModel.isBasicMode = false;
      this.featureMatrixModel.isSimpleMode = false;
      this.filterModel.isBasicMode = false;
      this.calcFeatureMatrixWidthPercent();
      this.onFilesLoaded(true, function() {
        let options = { name: 'home', query: { mode: 'advanced'}};
        if (self.forMyGene2) {
          options.query.mygene2 = true;
        }
       
        self.$router.push(options)
      });
    },
    onBasicMode: function() {
      let self = this;
      this.isBasicMode = true;
      this.featureMatrixModel.isBasicMode = true;
      this.filterModel.isBasicMode = true;
      this.calcFeatureMatrixWidthPercent();
      this.onFilesLoaded(true, function() {
        self.$router.push( { name: 'home', query: {mode: 'basic', mygene2: self.forMyGene2 } })
      });
    },
    onSimpleMode: function() {
      let self = this;
      this.isSimpleMode = true;
      this.featureMatrixModel.isBasicMode = false;
      this.featureMatrixModel.isSimpleMode = true;
      this.filterModel.isBasicMode = false;
      this.calcFeatureMatrixWidthPercent();
      this.onFilesLoaded(true, function() {
        self.$router.push( { name: 'home', query: {mode: 'basic', mygene2: self.forMyGene2 } })
      });
    },
    onStopAnalysis: function() {
      this.cohortModel.stopAnalysis();
      this.cacheHelper.stopAnalysis();
    },
    onIsDemo: function(bool){
      this.isMother = bool;
      this.isFather = bool;
      this.launchedFromDemo = bool;
    },
    onIsTrio: function(bool){
      this.isMother = bool;
      this.isFather = bool;
    },
    onShowSnackbar: function(snackbar) {
      if (snackbar && snackbar.message) {
        this.showSnackbar = true;

        snackbar.left     = snackbar.left ? snackbar.left : false;
        snackbar.right    = snackbar.right ? snackbar.right : false;
        snackbar.center   = snackbar.center ? snackbar.center : false;
        snackbar.top      = snackbar.top ? snackbar.top : false;
        snackbar.bottom   = snackbar.bottom ? snackbar.bottom : false;

        if (!snackbar.left && !snackbar.right && !snackbar.center) {
          snackbar.center = true;
        }
        if (!snackbar.top && !snackbar.bottom) {
          snackbar.top = true;
        }

        this.snackbar = snackbar;

        if (this.snackbar.timeout == null) {
          this.snackbar.timeout = 6000;
        }
      }
    },
    onHideSnackbar: function() {
      this.showSnackbar = false;
    },

    onResize: function() {
      let self = this;
      let mainContent = $('main.content .container');
      self.mainContentWidth = mainContent.outerWidth();
      self.calcFeatureMatrixWidthPercent();
      if (self.mainContentWidth > 905) {
        mainContent.removeClass("small");
      } else {
        mainContent.addClass("small");
      }
    },

    calcFeatureMatrixWidthPercent: function() {
      let self = this;
      if (self.cohortModel && self.cohortModel.isLoaded
          && self.featureMatrixModel && self.featureMatrixModel.rankedVariants) {
        self.mainContentWidth = $('main.content .container').outerWidth();
        if (self.isBasicMode) {
          self.featureMatrixWidthPercent = 0;
        }
        else if (self.isEduMode ) {
          self.featureMatrixWidthPercent = 50;
        } else {
          let minVariantDetailWidth;
          let variantDetail = $('#variant-detail')
          if (variantDetail.length > 0) {
            minVariantDetailWidth = +this.variantCountChanged.css('min-width').split("px")[0];
          } else {
            minVariantDetailWidth = 652;
          }

          let minFeatureMatrixWidth;
          let matrixCard = $('#matrix-card')
          if (matrixCard.length > 0) {
            minFeatureMatrixWidth = +matrixCard.css('min-width').split("px")[0];
          } else {
            minFeatureMatrixWidth = 300;
          }

          let fullFeatureMatrixWidth = 0;
          let featureMatrixVizSvg = $('#feature-matrix-viz svg');
          if (featureMatrixVizSvg.length > 0) {
            fullFeatureMatrixWidth = +featureMatrixVizSvg.outerWidth();
          }

          let width1 = minFeatureMatrixWidth;
          let remaining = +self.mainContentWidth - (minFeatureMatrixWidth + minVariantDetailWidth);
          if (remaining > 0) {
            remaining = +self.mainContentWidth - (minFeatureMatrixWidth + minVariantDetailWidth);
            // If there are more ranked variants than min feature matrix width, give
            // remaining to feature matrix
            if (fullFeatureMatrixWidth > minFeatureMatrixWidth) {
              width1 = minFeatureMatrixWidth + remaining;
            } else {}
          } else if (remaining < 0) {
            // If there isn't enough width for the min feature matrix width and variant card width,
            // make sure that feature matrix min is met;
            width1 = minFeatureMatrixWidth;
          }
          self.featureMatrixWidthPercent = Math.round((width1 / self.mainContentWidth) * 100);
        }
      } else {
        self.featureMatrixWidthPercent = 0;
      }
    },

    onShowPileupForVariant: function(relationship="proband", variant) {
      let self = this;
      let theVariant = variant ? variant : this.selectedVariant;
      if (theVariant) {
        let variantInfo = this.globalApp.utility.formatDisplay(variant, this.cohortModel.translator, this.isEduMode);

        // Format the coordinate for the variant
        const chrom = this.globalApp.utility.stripRefName(theVariant.chrom);
        const start = theVariant.start - this.pileupInfo.SPAN;
        const end   = theVariant.start + this.pileupInfo.SPAN;
        this.pileupInfo.coord =  'chr' + chrom + ':' + start + '-' + end;
        this.pileupInfo.tracks = [];

        // Set the bam, vcf, and references
        this.cohortModel.getCanonicalModels().forEach(function(model) {
          let track               = {name: model.relationship};
          track.variantURL        = model.vcf.getVcfURL();
          track.variantIndexURL   = model.vcf.getTbiURL();
          track.alignmentURL      = model.bam.bamUri;
          track.alignmentIndexURL = model.bam.baiUri;
          self.pileupInfo.tracks.push(track);
        })
        // Set the reference
        this.pileupInfo.referenceURL = this.pileupInfo.referenceURLs[this.genomeBuildHelper.getCurrentBuildName()];

        // set the title
        const titleParts = []
        titleParts.push("Read pileup");
        titleParts.push(this.selectedGene.gene_name);
        titleParts.push((variant.type ? variant.type.toUpperCase() + " " : "")
          + theVariant.chrom + ":" + theVariant.start + " " + theVariant.ref + "->" + theVariant.alt);
        titleParts.push(variantInfo.HGVSpAbbrev);
        this.pileupInfo.title = titleParts.join(' ')
        this.pileupInfo.show = true;
        this.$modal.show('pileup-modal');
      }
      else {
        return '';
      }
    },

    receiveClinMessage: function(event) {
      let self = this;
      // Do we trust the sender of this message?
      if (this.clinIobioUrls.indexOf(event.origin) === -1) {
        return;
      }
      this.clinIobioUrl = event.origin;
      this.launchedFromClin = true;
      if (self.filterModel) {
        self.filterModel.isFullAnalysis = true;
      }
      if (self.geneModel) {
        self.geneModel.isFullAnalysis = true;
      }

      let clinObject = JSON.parse(event.data);

      if (!this.isClinFrameVisible) {
        this.isClinFrameVisible = clinObject.isFrameVisible;
      }

      if (clinObject.type === 'apply-genes') {
        self.applyGenesClin(clinObject);
      } else if (clinObject.type === 'set-data') {
        // Set the iobio backend
        if (clinObject.iobioSource && clinObject.iobioSource.length > 0) {
          if (self.hubToIobioSources[clinObject.iobioSource]) {
            self.globalApp.IOBIO_SOURCE = self.hubToIobioSources[clinObject.iobioSource].iobio;
            self.globalApp.DEFAULT_BATCH_SIZE = self.hubToIobioSources[clinObject.iobioSource].batchSize;
            self.globalApp.initBackendSource(self.globalApp.IOBIO_SOURCE)
          } else {
            alertify.warn("Launch Error", "Unable to set IOBIO_SOURCE")
          }
        } else {
          self.globalApp.initServices(false);
        }

        if (self.cohortModel == null || !self.cohortModel.isLoaded) {
          self.$set(self, "isFullAnalysis", true);
          if (self.filterModel) {
            self.filterModel.isFullAnalysis = true;
          }
          if (self.geneModel) {
            self.geneModel.isFullAnalysis = true;
          }

          console.log("gene.iobio set-data cohort model not yet loaded")
          self.init(function() {
            self.analysis = clinObject.analysis;
            self.user     = clinObject.user;

            if (self.geneModel) {
              self.geneModel.setRankedGenes({'gtr': clinObject.gtrFullList, 'phenolyzer': clinObject.phenolyzerFullList })
              self.geneModel.setGenePhenotypeHitsFromClin(clinObject.genesReport);
            }

            //Sets the current build from clinObject type set-data
            self.genomeBuildHelper.setCurrentBuild(clinObject.buildName);

            console.log("gene.iobio set-data promiseInitClin")
            self.promiseInitClin(clinObject)
            .then(function() {
              console.log("gene.iobio set-data finished promiseInitClin")

              self.promiseImportClin()
              .then(function() {

              })
            })
          })
        } else {
          console.log("gene.iobio set-data cohort model already loaded")
          self.analysis = clinObject.analysis;
          self.geneModel.setRankedGenes({'gtr': clinObject.gtrFullList, 'phenolyzer': clinObject.phenolyzerFullList })
          self.promiseInitClin(clinObject).
          then(function() {
              console.log("gene.iobio set-data finished promiseInitClin")
              self.promiseImportClin()
              .then(function() {

              })
          })
        }
      } else if (clinObject.type === 'show' || clinObject.type === 'show-review-full') {

        if (self.cohortModel && self.cohortModel.isLoaded) {



          self.$set(self, "isFullAnalysis", true);
          self.filterModel.isFullAnalysis = self.isFullAnalysis;
          self.geneModel.isFullAnalysis = self.isFullAnalysis;
          self.clinShowGeneApp = true;

          if (self.cacheHelper.analyzeAllInProgress) {
            self.showLeftPanelForGenes();
          } else {
            if (self.selectedVariant == null) {
              self.promiseSelectFirstFlaggedVariant()
            } else {
              self.showLeftPanelWhenFlaggedVariants();
            }
          }

          //self.promiseShowClin();
        } else {
          console.log("** bypassing showData cohort NOT loaded **");
        }

      } else if (clinObject.type === 'show-coverage') {
        self.activeFilterName = 'coverage';
        self.onAnalyzeAll();
      } else if (clinObject.type === 'show-review' || clinObject.type === 'show-review-full') {

        if (self.cacheHelper.analyzeAllInProgress) {
          self.showLeftPanelForGenes();
        } else {
          self.showLeftPanelWhenFlaggedVariants();
        }
      } else if (clinObject.type === 'show-tooltip') {
        if (clinObject.task.key === 'genes-menu') {
          if (self.$refs.navRef && self.$refs.navRef.$refs.genesMenuRef) {
            self.$refs.navRef.$refs.genesMenuRef.showTooltip(clinObject.task.tooltip);
          }
        } else {
          if (self.$refs.genesCardRef && self.$refs.genesCardRef.$refs.filterBadgesRef) {
            self.$refs.genesCardRef.$refs.filterBadgesRef.showTooltip(clinObject.task.key, clinObject.task.tooltip);
          }
        }
      } else if (clinObject.type === 'hide-tooltip') {
        if (clinObject.task.key === 'genes-menu') {
          if (self.$refs.navRef && self.$refs.navRef.$refs.genesMenuRef) {
            self.$refs.navRef.$refs.genesMenuRef.hideTooltip();
          }
        } else {
          if (self.$refs.genesCardRef && self.$refs.genesCardRef.$refs.filterBadgesRef) {
            self.$refs.genesCardRef.$refs.filterBadgesRef.hideTooltip(clinObject.task.key);
          }
        }
      } else if(clinObject.type == 'add-new-genes') {
        let new_genes = clinObject.new_genes;
        new_genes.map(gene => {
          let geneArr = self.geneModel.getCandidateGenes();
          if(!geneArr.includes(gene)){
            geneArr.push(gene);
          }
          self.geneModel.setCandidateGenes(geneArr);
        })

        self.geneModel.setSourceForGenes(clinObject.selectedPhenotypeGenes, "phenotype_gene_list")

        let options = {isFromClin: true, phenotypes: new_genes, replace: true};
        self.onApplyGenes(new_genes.join(), options);
      }
      let responseObject = {success: true, type: 'message-received', sender: 'gene.iobio.io'};
      window.parent.postMessage(JSON.stringify(responseObject), this.clinIobioUrl);
    },


    onInsufficientCoverage: function(theGeneCount) {
      let self = this;
      if (this.launchedFromClin) {
        var msgObject = {
            success: true,
            type:   'insufficient-coverage',
            app:    'gene',
            sender: 'gene.iobio.io',
            geneCount:  theGeneCount};
        window.parent.postMessage(JSON.stringify(msgObject), self.clinIobioUrl);
      }

    },


    onSendGenesToClin: function() {
      let self = this;
      if (this.launchedFromClin && this.paramMode == null) {
        var msgObject = {
            success: true,
            type:   'apply-genes',
            app:    'gene',
            sender: 'gene.iobio.io',
            genes:   self.geneModel.sortedGeneNames};
        window.parent.postMessage(JSON.stringify(msgObject), self.clinIobioUrl);
      }
    },

    sendAnalysisToClin: function() {
      let self = this;
      if (this.launchedFromClin) {

        let exportPromises = [];
        let exportedVariants = [];

        self.analysis.payload.variants = self.analysis.payload.variants.filter(v => v.alt );



        self.analysis.payload.variants.forEach(function(variant) {
          let p = self.promiseExportAnalysisVariant(variant)
          .then(function(exportedVariant) {
            exportedVariants.push(exportedVariant)
          })
          exportPromises.push(p)
        })

        Promise.all(exportPromises)
        .then(function() {
          let simpleAnalysis = $.extend({}, self.analysis);
          simpleAnalysis.payload.variants = exportedVariants;
          simpleAnalysis.payload.filters = self.filterModel.flagCriteria;

          var msgObject = {
            success: true,
            type: 'save-analysis',
            sender: 'gene.iobio.io',
            analysis: simpleAnalysis
          };

          let msgObjectString = ""
          try {
            msgObjectString = JSON.stringify(msgObject);
          } catch(error) {
            console.log("unable to stringify analysis ")
            console.log(error)
            console.log(msgObject);
            alertify.error("Unable to save analysis")
          }
          if (msgObjectString && msgObjectString.length > 0) {
             self.interpretationProgressDialog = false;
             window.parent.postMessage(msgObjectString, self.clinIobioUrl);
          }

        })

      }

    },


    onSendFiltersToClin: function() {
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

    sendConfirmSetDataToClin: function() {
      let self = this;
      if (this.launchedFromClin) {
        var msgObject = {
          success: true,
          type:   'confirm-set-data',
          sender: 'gene.iobio.io',
          app:    'genefull'
        };
        window.parent.postMessage(JSON.stringify(msgObject), self.clinIobioUrl);
      }
    },


    promiseSetCacheFromClin: function(clinObject) {
      let self = this;

      // If cache should not persist, bypass this functionality
      if (!self.clinPersistCache) {
        self.clinSetData.isCacheSet = true;
        return Promise.resolve();
      }

      return new Promise(function(resolve, reject) {
        let cachePromises = [];
        let summarizePromises = [];

        if (clinObject.cache && clinObject.cache.length > 0) {
          clinObject.cache.forEach(function(cacheItem) {
            let newCacheKey = cacheHelper.convertClinCacheKey(cacheItem.cache_key);
            let p = self.cacheHelper.promiseCacheData(newCacheKey, cacheItem.cache, {compress: false})
            .then(function(theKey) {
              let theKeyObject = CacheHelper._parseCacheKey(theKey);

              if (theKeyObject.dataKind === 'dangerSummary') {

                var dp = self.cacheHelper.promiseGetData(theKey)
                .then(function(data) {
                  if (data && data.geneName) {
                    self.geneModel.setDangerSummary(data.geneName.toUpperCase(), data);

                  }
                })
                summarizePromises.push(dp);
              }
            })
            cachePromises.push(p);
          })
        } else {
          cachePromises.push(Promise.resolve());
        }

        Promise.all(cachePromises)
        .then(function() {
          return Promise.all(summarizePromises)
        })
        .then(function() {
          self.clinSetData.isCacheSet = true;
          resolve();
        })
        .catch(function(error) {
          self.clinSetData.isCacheSet = true;
          let msg = "Problem in GeneHome.promiseSetCacheFromClin(): " + error;
          console.log(msg);
          reject(msg);
        })

      })

    },

    setIobioConfigFromClin: function(clinObject) {
      let self = this;

      self.clinPersistCache = clinObject.persistCache;

      if (clinObject.batchSize) {
        self.globalApp.DEFAULT_BATCH_SIZE = clinObject.batchSize;
      }



      if (clinObject.iobioSource) {
        self.globalApp.IOBIO_SOURCE = clinObject.iobioSource;
        self.globalApp.initServices(self.launchedFromHub );
      }

      self.cohortModel.endpoint = new EndpointCmd(self.globalApp,
          self.cacheHelper.launchTimestamp,
          self.genomeBuildHelper,
          self.globalApp.utility.getHumanRefNames
      );

    },

    promiseInitClin: function(clinObject) {
      let self = this;
      return new Promise(function(resolve, reject) {
        self.isClinFrameVisible = true;
        self.clinSetData = clinObject;

        self.setIobioConfigFromClin(self.clinSetData);
        self.cohortModel.promiseInit(self.clinSetData.modelInfos)
        .then(function() {
          self.onSendFiltersToClin();
          self.models = self.cohortModel.sampleModels;

          for(let i = 0; i < self.models.length; i++){
            if(self.models[i].relationship === "mother"){
              self.isMother = true;
            }
            else if(self.models[i].relationship === "father"){
              self.isFather = true;
            }
          }

          self.geneModel.setCandidateGenes(self.clinSetData.genes);
          self.geneModel.setSourceForGenes(self.clinSetData.genes, "imported_gene");

          setTimeout(function() {
            if (self.geneModel && self.geneModel.sortedGeneNames &&
              self.geneModel.sortedGeneNames.length > 0) {
              self.cacheHelper.analyzeAll(self.cohortModel, false, false);
            }
          }, 500)

          return self.promiseSetCacheFromClin(self.clinSetData)

        })
        .then(function() {

          resolve();
        })
        .catch(function(error) {
          reject(error);
        })

      })
    },

    setNonProbandModels: function() {
      let self = this;
      self.nonProbandModels = [];
      if (this.models && this.models.length > 0) {

        self.nonProbandModels = self.models.filter(function(model) {
          let keepIt =  model.relationship !== 'proband';
          let showIt = false;
          if (model.relationship === 'father' && self.showFatherCard) {
            showIt = true;
          } else if (model.relationship === 'mother' && self.showMotherCard) {
            showIt = true;
          } else if (model.relationship === 'known-variants' && self.showKnownVariantsCard) {
            showIt = true;
          } else if (model.relationship === 'sfari-variants' && self.showSfariVariantsCard) {
            showIt = true;
          }
          return keepIt && showIt;
        })
      }

    },



    applyGenesClin: function(clinObject) {
      let self = this;

      self.geneModel.setGenePhenotypeHitsFromClin(clinObject.genesReport);
      self.geneModel.setRankedGenes({'gtr': clinObject.gtrFullList, 'phenolyzer': clinObject.phenolyzerFullList, 'hpo': clinObject.hpoFullList })

      self.selectedGene = null;
      self.selectedTranscript = null;
      if (self.selectedVariant && self.selectedVariant.hasOwnProperty('gene')) {
        self.onFlaggedVariantSelected(self.selectedVariant, {force: true})
      }

    },


    promiseSelectFirstFlaggedVariant: function() {
      let self = this;
      if (self.selectedVariant) {
        self.onCohortVariantClick(self.selectedVariant, null, 'proband');
        return Promise.resolve();
      }
      return new Promise(function(resolve) {

        let getGeneName = function(variant) {
          if (variant.geneName && variant.geneName.length > 0) {
            return variant.geneName;
          } else if (self.globalApp.utility.isObject(variant.gene)) {
            return variant.gene.gene_name;
          } else {
            return variant.gene;
          }
        }

        // Find first flagged variant in list
        let firstFlaggedVariant = null;
        let sortedFilters = self.cohortModel.organizeVariantsByFilterAndGene(null, self.isFullAnalysis);
        sortedFilters.forEach(function(filterObject) {
          filterObject.genes.forEach(function(geneList) {
            if (!firstFlaggedVariant && geneList.variants && geneList.variants.length > 0) {
              firstFlaggedVariant = geneList.variants[0];
            }
          })
        })
        if ((self.paramAnalysisId || self.paramVariantSetId || !self.geneClicked) && firstFlaggedVariant &&  (!self.selectedGene || getGeneName(firstFlaggedVariant) !== self.selectedGene.gene_name)) {
          self.promiseLoadGene(getGeneName(firstFlaggedVariant))
            .then(function() {
              self.toClickVariant = firstFlaggedVariant;
              self.showLeftPanelWhenFlaggedVariants("send-to-clin");
              self.onFlaggedVariantSelected(firstFlaggedVariant, {}, function() {
              resolve()
              self.cacheHelper.analyzeAllInProgress = false;
            })
          })
        }
        else if(firstFlaggedVariant && getGeneName(firstFlaggedVariant) === self.selectedGene.gene_name){
          self.toClickVariant = firstFlaggedVariant;
          self.showLeftPanelWhenFlaggedVariants();
          self.onFlaggedVariantSelected(firstFlaggedVariant, {}, function() {
            resolve()
          })
        }
        else {
          self.showLeftPanelWhenFlaggedVariants();
          resolve();
        }

      })
    },

    promiseImportClin: function() {
      let self = this;

      return new Promise(function(resolve) {

        if (!self.clinSetData.importInProgress && !self.clinSetData.isImported) {

          self.clinSetData.importInProgress = true;
          self.clinSetData.isImported = false;



          var genePromises = []
          if (self.analysis.payload.genes && self.analysis.payload.genes.length > 0) {
            self.analysis.payload.genes.forEach(function(geneName) {
              genePromises.push( self.geneModel.promiseAddGeneName(geneName) );
            })
          } else {
            genePromises.push(Promise.resolve())
          }

          self.promiseUpdateAnalysisGenesData()
          self.analysis.payload.filters = self.filterModel.flagCriteria;

          Promise.all(genePromises)
          .then(function() {

            if (self.clinSetData.analysis.payload.variants && self.clinSetData.analysis.payload.variants.length > 0 ) {


              self.analysis.payload.variants.forEach(function(importedVariant) {
                importedVariant.isImported = true;
              })


              if (self.$refs.navRef && self.$refs.navRef.$refs.genesPanelRef) {
                self.$refs.navRef.$refs.genesPanelRef.updateGeneSummaries();
              }
              self.showLeftPanelForGenes();


              self.cohortModel.importFlaggedVariants('json', self.clinSetData.analysis.payload.variants,
              function() {
                self.clinSetData.isImported = true;
              },
              function() {
                self.clinSetData.importInProgress = false;
                setTimeout(function() {
                  if (self.clinShowGeneApp) {
                    self.promiseSelectFirstFlaggedVariant()
                  }
                  self.sendConfirmSetDataToClin();

                }, 2500)
                resolve();
              })
            }
          })

        } else {
          resolve();
        }
      })
    },

    promiseGetAnalysis: function(idProject, idAnalysis) {
      let self = this;
      return new Promise(function(resolve, reject) {

        if (idAnalysis && idAnalysis.length > 0) {

          self.hubSession.promiseGetAnalysis(idProject, idAnalysis)
          .then(function(analysis) {
            if (analysis) {
              self.analysis = analysis;

              // Workaround - remove null variants
              self.analysis.payload.variants = self.analysis.payload.variants.filter(function(v) {
                return v != null;
              })
              resolve(self.analysis);
            } else {
              reject("Unable to find/create an analysis " + idAnalysis);
            }
          })
          .catch(function(error) {
            self.onShowSnackbar( {message: error, timeout: 15000});
            reject(err);
          })

        } else {
          var newAnalysis = {};
          newAnalysis.title = "";
          newAnalysis.description = "";
          newAnalysis.project_id = idProject;
          newAnalysis.sample_id  = self.paramSampleId;
          newAnalysis.payload = {};
          newAnalysis.payload.project_id = idProject;
          newAnalysis.payload.sample_id = self.paramSampleId;
          newAnalysis.payload.is_pedigree = self.paramIsPedigree;
          newAnalysis.payload.datetime_created = self.globalApp.utility.getCurrentDateTime();
          newAnalysis.payload.genes = [];
          if (self.paramGeneName && self.paramGeneName !== '') {
            newAnalysis.payload.genes.push(self.paramGeneName)
          }
          newAnalysis.payload.variants = [];
          newAnalysis.payload.filters = self.filterModel.flagCriteria;
          self.analysis = newAnalysis;

          resolve(self.analysis)
        }

      });
    },


    toggleSaveModal(bool) {
      this.showSaveModal = bool;
    },

    onSaveAnalysisFromModal() {
      this.showSaveModal = false;
      this.delaySave = 1000;
      return this.promiseSaveAnalysis({saveTitle: true, autoupdate: false, notify: true});
    },


    promiseSaveAnalysis: function(options) {
      let self = this

      return new Promise(function(resolve, reject) {

        self.promiseUpdateAnalysisGenesData()
        .then(function() {

          let exportPromises = [];
          self.cohortModel.flaggedVariants.forEach(function(flaggedVariant) {
              let p = self.promiseExportAnalysisVariant(flaggedVariant)
              exportPromises.push(p);
          })

          return Promise.all(exportPromises)
        })
        .then(function() {
          if (self.analysis.id ) {
            if (self.launchedFromClin) {
              self.sendAnalysisToClin();
              resolve();
            } else {
              self.hubSession.promiseUpdateAnalysis(self.analysis)
              .then(function(analysis) {
                self.analysis = analysis;
                if (options && options.notify) {
                  self.onShowSnackbar( {message: 'analysis saved.', timeout: 2000, bottom: true, right: true});
                }
                self.setDirty(false);
                resolve();
              })
              .catch(function(error) {
                self.onShowSnackbar( {message: error, timeout: 15000});
                reject(error);
              })
            }
          } else {
            // This is ADIT'S code that I am commenting out for now
            // while I try to rip out.
            // This code is suspect b/c it wasn't performed sequentially
            // so that promiseAddAnalysis would occur only after
            // promiseUpdateAnalysisGenesData is complete
            self.promiseUpdateAnalysisGenesData();

            self.hubSession.promiseAddAnalysis(self.analysis.project_id, self.analysis)
            .then(function(analysis) {
              self.analysis = analysis;
              console.log("* adding mosaic analysis " + self.analysis.id + " " + " *")
              self.onShowSnackbar( {message: 'new analysis saved.', timeout: 3000, bottom: true, right: true});
              self.setDirty(false);
              resolve();
            })
            .catch(function(error) {
              self.onShowSnackbar( {message: error, timeout: 15000});
              reject(error);
            })
          }
        })

      })


    },

    onCancelAnalysis: function() {
      let self = this;
      self.showSaveModal = false
    },


    promiseUpdateAnalysisGenesData: function(phenolyzerSearchTerm) {
      let self = this;
      self.analysis.payload.genes              = this.geneModel.geneNames;
      if (phenolyzerSearchTerm && phenolyzerSearchTerm.length > 0) {
        self.analysis.payload.phenotypeTerm      = phenolyzerSearchTerm;
      }

      self.analysis.payload.datetime_last_modified = self.globalApp.utility.getCurrentDateTime();
      self.setDirty(true);
      return Promise.resolve();
    },


    promiseExportAnalysisVariant: function(variantToReplace) {
      let self = this;
      return new Promise(function(resolve, reject){
        if (!variantToReplace.hasOwnProperty('features')) {
          resolve(variantToReplace)
        } else {
          self.cohortModel.promiseExportFlaggedVariant('json', variantToReplace)
          .then(function(exportedVariants) {

            let matchingIdx = self.findAnalysisVariantIndex(exportedVariants[0]);
            if (matchingIdx !== -1) {
              self.analysis.payload.variants[matchingIdx] = exportedVariants[0];
            } else {
              self.analysis.payload.variants.push(exportedVariants[0]);
            }
            resolve(exportedVariants[0])
          })
          .catch(function(err) {
            console.log("promiseExportAnalysisVariant() failed for variant");
            console.log(err);
            reject(err)
          })
        }
      })
    },


    findAnalysisVariantIndex(variant) {
      let self = this;

      let getGeneName = function(variant) {


        if (variant.gene == null && variant.geneName) {
          return variant.geneName;
        } else if (variant.gene && self.globalApp.utility.isObject(variant.gene)) {
          return variant.gene.gene_name;
        } else if (variant.gene) {
          return variant.gene;
        } else {
          console.log("Unable to find variant gene name ")
          console.log(variant);
          return "";
        }
      }

      let matchingIdx = -1;
      let idx = 0;
      if (self.analysis && self.analysis.payload.variants) {
        self.analysis.payload.variants.forEach(function(v) {
          if (matchingIdx === -1
              && getGeneName(v) === getGeneName(variant)
              && v.start === variant.start
              && v.ref === variant.ref
              && v.alt === variant.alt ) {
            matchingIdx = idx;
          }
          idx++;
        })
      }
      return matchingIdx;
    },

    variantCountChanged: function(count) {
      let self = this;
      self.variantCount = count;
      if(self.launchedFromClin){
        var msgObject = {
          success: true,
          type: 'update-variant-count',
          sender: 'gene.iobio.io',
          variantCount: self.variantCount,
        };
        window.parent.postMessage(JSON.stringify(msgObject), self.clinIobioUrl);
      }
    }

  }
}
</script>
