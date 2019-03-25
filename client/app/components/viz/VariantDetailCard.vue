<style lang="sass" >
    @import ../../../assets/sass/variables
    #variant-detail
        padding-left: 0px
        max-height: 222px
        min-height: 222px
        padding-top: 0px
        overflow-x: scroll
        min-width: 700px
        margin-bottom: 0px
        padding-left: 10px

        .rel-header
            font-style: italic

        .variant-action-button
            background-color: white
            padding: 0px
            height: 22px !important
            min-width: 70px
            margin-left: 15px
            margin-right: 0px
            margin-top: -2px
            margin-bottom: 0px

            .btn__content
                color: $app-color !important
                padding-left: 8px
                padding-right: 8px
                font-size: 13px

                i.material-icons
                    color: $app-color
                    font-size: 14px
                    padding-right: 2px
                    padding-top: 0px

        &.has-notes
            max-height: 232px
            min-height: 232px

        #variant-heading
            color: $app-color
            padding-bottom: 10px
            padding-top: 0px !important
            margin-top: 12px !important
            margin-bottom: 7px
            margin-left: -10px


        #show-notes-button
            .btn__content
                .interpretation-label
                    font-size: 13px !important
                    padding-top: 6px !important

        #variant-notes
            display: inline-block
            vertical-align: top
            float: left
            margin-left: -5px
            margin-top: -5px

        .variant-notes
            width: 100%
            font-size: 12px
            background-color: $notes-background-color
            hr.top
                margin-top: 0px
                margin-bottom: 5px
            hr.bottom
                margin-top: 5px
                margin-bottom: 5px
            div
                margin-left: 5px
                margin-right: 5px

                .material-icons
                    display: inline-block
                    max-width: 20px
                    font-size: 18px
                    color: $app-color

            #show-notes-button
                .btn__content
                    .material-icons
                        padding-top: 0px !important

        .layout.row
            margin-bottom: 7px

        .layout.row.no-bottom-margin
            margin-bottom: 0px

        .field-label.last-col
            padding-left: 16px
            min-width: 80px

        .field-value.level-high
            color: $high-impact-color  !important
            font-weight: bold !important
        .field-value.level-medium
            color: $moderate-impact-color !important
            font-weight: bold !important

        span.level-high
            color: $high-impact-color !important
            font-weight: bold !important
        span.level-medium
            color: $moderate-impact-color !important
            font-weight: bold !important

        .field-value.revel-field
            color: $app-gray

            &.revel_high
                color: $high-impact-color
                font-weight: bold
            &.revel_moderate
                color: $moderate-impact-color
                font-weight: bold


        .field-value.sift-field
            &.sift_deleterious
                color: $high-impact-color
                font-weight: bold

        .field-value.polyphen-field
            &.polyphen_probably_damaging
                color: $high-impact-color
                font-weight: bold

            &.polyphen_possibly_damaging
                color: $moderate-impact-color
                font-weight: bold

        #user-flag-buttons
            display: inline-block
            margin-bottom: 0px

        .scroll-button
            color: $link-color !important
            height: 24px
            padding: 0px
            width: 100px

            .btn__content
                color: $link-color !important
                padding: 0px


            .material-icons
                font-size: 17px

        a
            color:  $link-color !important

            &.level-high
                color: $high-impact-color  !important
                font-weight: bold !important
            &.level-medium
                color: $moderate-impact-color !important
                font-weight: bold !important



        .content
            font-size: 13px
            padding-left: 10px
            margin-bottom: 0px
            float: left
            min-width: 360px



        span.clinvar-submission
            display: flex
            padding-bottom: 5px

        .field-label
            color: #9c9a9a
            font-style: italic
            padding-left: 0px
            text-align: left
            font-size: 13px
            line-height: 14px

        .field-value
            padding-right: 35px
            word-break: break-word
            font-size: 13px
            line-height: 14px

        #inheritance
            height: 18px

        #coverage-svg
            float: left
            margin-top: -4px

            rect
                &.alt-count
                    stroke: black !important

                &.ref-count
                    stroke: black !important
                    fill: none !important

                &.alt-count
                    fill: $app-color-light !important

                &.other-count
                    stroke: black !important
                    fill: rgb(132,132,132) !important

            text
                font-size: 12px !important

                &.alt-count
                    fill: white !important

                &.alt-count-under
                    fill: $text-color !important

                &.other-count
                    fill: white  !important
                    font-style: italic !important

                &.other-count-under
                    fill: $text-color  !important
                    font-style: italic !important

                &.ref-count
                    fill: $text-color  !important

            .header-small
                overflow-wrap: break-word
                text-align: left
                width: 100px
                float: left
                color: #9c9a9a
                fill:  #9c9a9a
                font-style: italic
                padding-left: 0px
                font-size: 13px !important
                line-height: 14px


            .allele-count-legend
                .header-small

            .allele-count-bar
                text
                    font-size: 11px !important
                    fill:  $text-color

            #allele-count-legend
                padding-top: 0px
                padding-bottom: 5px


            .affected-symbol
                font-size: 14px
                color: $danger-color !important
                float: right
                padding-right: 2px


            .allele-count-bar
                overflow-wrap: break-word
                float: left
                width: 300px
                min-height: 25px

            .ped-info
                width: 445px
                clear: both
                line-height: 13px !important

            .ped-label
                padding-top: 0px
                vertical-align: top
                text-align: left
                width: 75px
                float: left
                font-size: 13px
                color: #9c9a9a
                fill:  #9c9a9a

            .ped-zygosity
                width: 75px
                float: left

            .zygosity
                float: left
                font-size: 10px
                font-weight: bold !important
                padding-top: 1px !important
                padding-bottom: 0px !important
                padding-right: 0px !important
                padding-left: 0px !important
                background-color: #D3D5D8 !important
                margin-right: 2px
                margin-top: 0px !important
                width: 39px !important
                color: black
                cursor: none
                pointer-events: none
                height: 13px

            .zygosity
                &.hom
                    background-color: $hom-color !important
                    color: white
                    width: 29px !important
                    margin-right: 10px

                &.het
                    background-color: $het-color !important
                    color: white
                    width: 29px !important
                    margin-right: 10px


                &.homref
                    background-color: $homref-color !important
                    color: $text-color !important

                &.unknown
                    background-color: $info-color !important

                &.none
                    background-color: transparent !important
                    border: solid thin $info-color !important



</style>


<template>

    <div v-if="selectedVariant && info" tile id="variant-detail"
         :class="{'app-card': true, 'has-notes': notes ? true : false}">
        <div style="width:100%;">
            <span style="display:inline-block" v-if="showTitle ">Variant</span>
        </div>

        <div  id="variant-heading" v-if="selectedVariant && !isEduMode" class="mt-1 text-xs-left">

      <span style="float:left;margin-top:-4px" v-if="!isBasicMode && !forMyGene2 && interpretation" class="pr-2 pl-1">
                  <variant-interpretation
                          style="float:left;"
                          v-if="!isBasicMode && !forMyGene2"
                          wrap="true"
                          :variant="selectedVariant"
                          :variantInterpretation="interpretation"
                          @apply-variant-interpretation="onApplyVariantInterpretation">
                  </variant-interpretation>

                  <variant-notes-menu
                          v-if="!isBasicMode && !forMyGene2"
                          style="float:left;padding-top: 4px"
                          :showNotesIcon="true"
                          :variant="selectedVariant"
                          :variantInterpretation="interpretation"
                          :variantNotes="notes"
                          @apply-variant-notes="onApplyVariantNotes">
                  </variant-notes-menu>
        </span>


            <span class="pr-1 pl-1" v-if="!isBasicMode && (selectedVariantRelationship === 'known-variants')">
        <app-icon v-show="selectedVariantRelationship === 'known-variants'"
                  icon="clinvar" width="16" height="16">
        </app-icon>
        <span class="rel-header">{{ selectedVariantRelationship | showRelationship }}</span>
      </span>
            <span class="pl-1">{{ selectedGene.gene_name }}</span>
            <span class="pl-1">{{ selectedVariant.type ? selectedVariant.type.toUpperCase() : "" }}</span>
            <span class="pl-1">{{ info.coord }}</span>
            <span class="pl-1 refalt">{{ refAlt  }}</span>
            <span class="pl-2">{{ info.HGVSpAbbrev }}</span>

            <!--// TODO: left off here get rid of proband stuff & update known-variants + cosmic-variants-->
            <!--<v-btn v-if="!isBasicMode && !isEduMode && selectedVariantRelationship !== 'known-variants' && cohortModel.getModel(trackId).isBamLoaded() "-->
                   <!--class="variant-action-button"  @click="onShowPileup">-->
                <!--<v-icon>line_style</v-icon>-->
                <!--Pileup-->
            <!--</v-btn>-->

            <div id="user-flag-buttons" v-if="selectedVariant && !isEduMode && !isBasicMode && selectedVariantRelationship != 'known-variants'" >
                <v-btn class="flag-button variant-action-button" small raised
                       v-if="!selectedVariant.isUserFlagged && !selectedVariant.isFlagged"
                       @click="setUserFlag">
                    <app-icon icon="user-flagged" width="14" height="14" style="padding-top:1px;padding-right:3px"></app-icon>
                    Flag variant
                </v-btn>

                <v-btn class="flag-button variant-action-button" small raised
                       v-if="selectedVariant.isUserFlagged"
                       @click="removeUserFlag">
                    <v-icon>outlined_flag</v-icon>
                    Remove flag
                </v-btn>
            </div>

            <variant-links-menu
                    v-if="!isBasicMode && !isEduMode"
                    :expanded="true"
                    :selectedGene="selectedGene"
                    :selectedVariant="selectedVariant"
                    :geneModel="cohortModel.geneModel">
            </variant-links-menu>


        </div>












        <div v-if="isBasicMode" style="margin-left: 10px;float:left;width:31%;">

            <v-flex v-if="isBasicMode">
                <v-layout  row>
                    <v-flex xs5 class="field-label">Transcript</v-flex>
                    <v-flex xs7 class="field-value">{{ formatCanonicalTranscript() }}</v-flex>
                </v-layout>
            </v-flex>

            <v-flex v-if="isBasicMode">
                <v-layout  row>
                    <v-flex xs5 class="field-label">cDNA</v-flex>
                    <v-flex xs7 class="field-value">{{ info.HGVScAbbrev }}</v-flex>
                </v-layout>
            </v-flex>

            <v-flex v-if="isBasicMode">
                <v-layout  row>
                    <v-flex xs5 class="field-label">Protein</v-flex>
                    <v-flex xs7 class="field-value">{{ info.HGVSpAbbrev }}</v-flex>
                </v-layout>
            </v-flex>

            <v-flex v-if="isBasicMode">
                <v-layout  row>
                    <v-flex xs5 class="field-label">Chr</v-flex>
                    <v-flex xs7 class="field-value">{{ selectedVariant.chrom }}</v-flex>
                </v-layout>
            </v-flex>

            <v-flex v-if="isBasicMode">
                <v-layout  row>
                    <v-flex xs5 class="field-label">Position</v-flex>
                    <v-flex xs7 class="field-value">{{ selectedVariant.start }}</v-flex>
                </v-layout>
            </v-flex>

            <v-flex v-if="isBasicMode">
                <v-layout  row>
                    <v-flex xs5 class="field-label">Reference</v-flex>
                    <v-flex xs7 class="field-value">{{ selectedVariant.ref }}</v-flex>
                </v-layout>
            </v-flex>

            <v-flex v-if="isBasicMode">
                <v-layout  row>
                    <v-flex xs5 class="field-label">Alternate</v-flex>
                    <v-flex xs7 class="field-value">{{ selectedVariant.alt }}</v-flex>
                </v-layout>
            </v-flex>
        </div>


        <div style="float:left;width:31%;min-width:350px">


            <v-layout  v-if="selectedVariant && !isEduMode" class="content" column nowrap>






                <!--<v-flex v-if="!isBasicMode && selectedVariant.inheritance !== '' && selectedVariant.inheritance !== 'none' ">-->
                    <!--<v-layout row class="">-->
                        <!--<v-flex xs3 class="field-label">Inheritance</v-flex>-->
                        <!--<v-flex id="inheritance" xs9 class="field-value">-->
                            <!--<app-icon :icon="selectedVariant.inheritance" height="16" width="16">-->
                            <!--</app-icon>-->
                            <!--{{ selectedVariant.inheritance == 'denovo' ? 'de novo' : selectedVariant.inheritance }}-->
                        <!--</v-flex>-->
                    <!--</v-layout>-->
                <!--</v-flex>-->
                <v-flex>
                    <v-layout row>
                        <v-flex xs3 v-if="!isBasicMode" class="field-label">Impact</v-flex>
                        <v-flex xs9 v-if="!isBasicMode"  class="field-value" v-html="impactAndConsequence"></v-flex>

                        <v-flex xs4 v-if="isBasicMode" class="field-label">Predicted Impact</v-flex>
                        <v-flex xs8 v-if="isBasicMode" class="field-value">{{ info.vepImpact }}</v-flex>
                    </v-layout>
                </v-flex>
                <v-flex v-if="info.vepHighestImpact !== '' && !isBasicMode">
                    <v-layout row >
                        <v-flex xs3 class="field-label">Most severe impact</v-flex>
                        <v-flex xs9 class="field-value">
                  <span v-for="(impactRec, idx) in info.vepHighestImpactRecs" :key="impactRec.impact">
                    <span :class="getImpactClass(impactRec.impact.toLowerCase())">
                      {{ getNonCanonicalImpactDisplay(idx, impactRec) }}
                    </span>
                    <span v-for="(effectRec, idx1) in impactRec.effects" :key="effectRec.key">
                      {{ getNonCanonicalEffectDisplay(idx1, effectRec) }}
                      <a v-for="transcriptId in effectRec.transcripts"
                         :key="transcriptId"
                         href="javascript:void(0)"
                         @click="selectTranscript(transcriptId)">
                        {{ transcriptId }}
                      </a>
                    </span>
                  </span>

                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex >
                    <v-layout row  v-if="info.clinVarLinks && info.clinvarLinks.length > 0">
                        <v-flex :xs3="!isBasicMode" :xs4="isBasicMode"  class="field-label">Clinvar</v-flex>
                        <v-flex :xs9="!isBasicMode" :xs8="isBasicMode"   class="field-value">
                <span class="clinvar-submission" v-for="clinvarLink in info.clinvarLinks"
                      :key="clinvarLink.key">
                   <app-icon width="14" height="14" icon="clinvar" :significance="clinvarLink.significance">
                   </app-icon>

                   <span style="padding-left: 5px" v-html="clinvarLink.link">
                   </span>

                </span>
                        </v-flex>
                    </v-layout>


                </v-flex>

                <v-flex  v-if="info.revel !== '' && info.revel != null && !isBasicMode" >
                    <v-layout row class="">
                        <v-flex xs3 class="field-label revel">REVEL</v-flex>
                        <v-flex xs9 :class="getRevelClass(info)">
                            {{ info.revel }}
                            <info-popup name="revel"></info-popup>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex   v-if="info.polyphen !== '' && !isBasicMode">
                    <v-layout row class="" >
                        <v-flex xs3 class="field-label">Polyphen</v-flex>
                        <v-flex xs9 :class="getPolyphenClass(selectedVariant)">{{ info.polyphen }}</v-flex>
                    </v-layout>
                </v-flex>
                <v-flex  v-if="info.sift !== '' && !isBasicMode" >
                    <v-layout row class="">
                        <v-flex xs3 class="field-label">SIFT</v-flex>
                        <v-flex xs9 :class="getSiftClass(selectedVariant)">{{ info.sift }}</v-flex>
                    </v-layout>
                </v-flex>



            </v-layout>
        </div>



        <div v-if="selectedVariant" style="float:left;width:25%">
            <v-flex  v-if="!isBasicMode">
                <v-layout  row>
                    <v-flex xs3 class="field-label">gnomAD</v-flex>
                    <v-flex xs9 class="field-value" v-html="afGnomAD"></v-flex>
                </v-layout>
            </v-flex>

            <v-flex   v-if="genomeBuildHelper.getCurrentBuildName() !== 'GRCh37' && !isBasicMode" xs6>
                <v-layout row>
                    <v-flex xs3 class="field-label">ExAC</v-flex>
                    <v-flex xs9 class="field-value" v-html="afExAC"></v-flex>
                </v-layout>
            </v-flex>


            <v-flex v-if="!isBasicMode">
                <v-layout  row>
                    <v-flex xs3 class="field-label">1000G</v-flex>
                    <v-flex xs9 class="field-value" v-html="af1000G"></v-flex>
                </v-layout>
            </v-flex>


            <v-flex  v-if="info.regulatory !== '' & !isBasicMode">
                <v-layout row>
                    <v-flex xs3 class="field-label">Regulatory</v-flex>
                    <v-flex xs9  v-html="info.regulatory" class="field-value"></v-flex>
                </v-layout>
            </v-flex>


            <v-flex  v-if="!isBasicMode">
                <v-layout row class="">
                    <v-flex xs3 class="field-label  " >Transcript</v-flex>
                    <v-flex xs9 class="field-value">{{ selectedVariant.transcript ? selectedVariant.transcript.transcript_id : selectedTranscript.transcript_id }}</v-flex>
                </v-layout>
            </v-flex>

            <v-flex  v-if="!isBasicMode">
                <v-layout row class="">
                    <v-flex xs3 class="field-label  "  >Exon </v-flex>
                    <v-flex xs9 class="field-value">{{ info.exon }}</v-flex>
                </v-layout>
            </v-flex>

            <v-flex  v-if="!isBasicMode">
                <v-layout row class="">
                    <v-flex xs3 class="field-label  "  >dbSNP ID</v-flex>
                    <v-flex xs9 class="field-value" v-html="info.dbSnpLink"></v-flex>
                </v-layout>
            </v-flex>


            <v-flex  v-if="!isBasicMode">
                <v-layout row class="">
                    <v-flex xs3 class="field-label  "  >HGVSc </v-flex>
                    <v-flex xs9 class="field-value">{{ info.HGVSc }}</v-flex>
                </v-layout>
            </v-flex>
            <v-flex   v-if="!isBasicMode">
                <v-layout row>
                    <v-flex xs3 class="field-label  "  >HGVSp </v-flex>
                    <v-flex xs9 class="field-value">{{ info.HGVSp }}</v-flex>
                </v-layout>
            </v-flex>


        </div>


        <div id="coverage-svg" v-if="selectedVariant" style="float:left;min-width:445px" v-bind:class="{hide: isEduMode || isBasicMode }">




        </div>


        <div v-if="isBasicMode" style="float:left;width:31%;">

            <v-flex v-if="isBasicMode">
                <v-layout  row>
                    <v-flex xs5 class="field-label  ">Frequency (1000G)</v-flex>
                    <v-flex xs7 class="field-value">{{ info.af1000G }}</v-flex>
                </v-layout>
            </v-flex>

            <v-flex v-if="isBasicMode">
                <v-layout  row>
                    <v-flex xs5 class="field-label ">Frequency (gnomAD)</v-flex>
                    <v-flex xs7 class="field-value">{{ info.afgnomAD }}</v-flex>
                </v-layout>
            </v-flex>

        </div>


        <div style="float:left;width:31%;"
             v-if="selectedVariant && selectedVariant.genericAnnots && selectedVariant.genericAnnots.AVIA3">
            <span style="text-align:center;font-size:12px">AVIA3 Annotations</span>
            <v-layout row nowrap
                      v-for="(annotValue, annotName) in selectedVariant.genericAnnots.AVIA3"
                      :key="annotName">
                <v-flex xs5 class="field-label">{{ annotName }}</v-flex>
                <v-flex xs7 class="field-value">{{ annotValue }}</v-flex>
            </v-layout>
        </div>




    </div>
</template>

<script>

    import Vue              from 'vue'
    import AppIcon          from "../partials/AppIcon.vue"
    import variantInterpretation from "../partials/VariantInterpretation.vue"
    import VariantNotesMenu from "../partials/VariantNotesMenu.vue"
    import VariantLinksMenu from "../partials/VariantLinksMenu.vue"
    import InfoPopup        from "../partials/InfoPopup.vue"

    export default {
        name: 'variant-detail-card',
        components: {
            AppIcon,
            VariantNotesMenu,
            variantInterpretation,
            InfoPopup,
            VariantLinksMenu
        },
        props: {
            isEduMode: null,
            isBasicMode: null,
            forMyGene2: null,
            selectedGene: null,
            selectedTranscript: null,
            selectedVariant: null,
            selectedVariantNotes: null,
            selectedVariantInterpretation: null,
            selectedVariantRelationship: null,
            genomeBuildHelper: null,
            cohortModel: null,
            variantTooltip: null,
            info: null,
            showTitle: null
        },
        data() {
            return {
                WIDTH_ALLELE_COUNT_BAR: 300,
                WIDTH_ALLELE_COUNT_ROW: 430,
                AFFECTED_GLYPH: "<i class='material-icons affected-symbol'>spellcheck</i>"

            }
        },


        methods: {
            formatPopAF: function(afObject) {
                let self = this;
                var popAF = "";
                if (afObject['AF'] != ".") {
                    for (var key in afObject) {
                        if (key != "AF") {
                            var label = key.split("_")[0];
                            if (popAF.length > 0) {
                                popAF += ", ";
                            }
                            popAF += label + " " + (afObject[key] == "." ? "0%" : self.globalApp.utility.percentage(afObject[key]));
                        }
                    }
                }
                return popAF;
            },
            refreshGlyphs: function() {
                if (this.selectedVariant) {
                    this.createAlleleCountsSVG();

                }
            },
            createAlleleCountsSVG: function() {
                let self = this;
                self.$nextTick(function() {
                    var selection = d3.select("#variant-detail #coverage-svg");
                    selection.selectAll(".ped-info").remove();
                    self.createAlleleCountSVGTrio(selection,
                        self.selectedVariant,
                        's0',   // FIXME - This needs to be passed in from event that sends variant selected event
                        self.cohortModel.tumorInfo,
                        self.cohortModel.mode,
                        self.cohortModel.maxAlleleCount,
                        self.WIDTH_ALLELE_COUNT_BAR);

                });

            },
            selectTranscript: function(transcriptId) {
                this.$emit("transcript-id-selected", transcriptId);
            },
            getNonCanonicalImpactDisplay: function(idx, impactRec) {
                let buf = "";
                if (idx > 0) {
                    buf += " | ";
                }
                buf += impactRec.impact.toLowerCase() + ' impact ';
                return buf;
            },
            getNonCanonicalEffectDisplay: function(idx, effectRec) {
                let buf = "";
                if (idx > 0) {
                    buf += " ,";
                } else {
                    buf += " - ";
                }
                buf += effectRec.display + " in non-canonical transcripts ";
                return buf;
            },
            onShowPileup: function() {
                this.$emit("show-pileup-for-variant",
                    this.selectedVariantRelationship ? this.selectedVariantRelationship : 'proband',
                    this.selectedVariant);
            },



            formatCanonicalTranscript: function() {
                if (this.selectedTranscript) {
                    return this.globalApp.utility.stripTranscriptPrefix(this.selectedTranscript.transcript_id);
                } else {
                    return "";
                }
            },



            createAlleleCountSVGTrio: function(container, variant, id, affectedInfo, cohortMode, maxAlleleCount, barWidth) {
                var me = this;

                var firstTime = true;

                // Workaround to adjust max allele count for siblings
                let adjustedMaxAlleleCount = maxAlleleCount;
                affectedInfo.forEach(function(info) {
                    var sampleName     = info.model.getSelectedSample();
                    var genotype       = variant.genotypes ? variant.genotypes[sampleName] : null;

                    if (genotype == null || genotype.absent && cohortMode === 'single') {
                    } else {
                        if ((+genotype.altCount + +genotype.refCount) > adjustedMaxAlleleCount) {
                            adjustedMaxAlleleCount = +genotype.altCount + +genotype.refCount;
                        }
                        if (+genotype.genotypeDepth > adjustedMaxAlleleCount) {
                            adjustedMaxAlleleCount = +genotype.genotypeDepth;
                        }
                    }
                })


                affectedInfo.forEach(function(info) {

                    var isSomatic      = !info.isInherited;
                    var sampleName     = info.model.getSelectedSample();
                    var genotype       = variant.genotypes ? variant.genotypes[sampleName] : null;

                    if (genotype == null || genotype.absent && cohortMode === 'single') {
                        // If vcf doesn't have any genotypes, skip showing this

                    } else {

                        var selectedClazz  = info.model.id === id ? 'selected' : '';

                        var displayName      = info.displayName;
                        var row = container.append("div")
                            .attr("class", "ped-info");

                        if (firstTime) {
                            me._appendReadCountHeading(row);
                            firstTime = false;
                        }
                        row.append("div")
                            .attr("class", "header-small ")
                            .html("<span class='ped-label "
                                + selectedClazz + "'>"
                                + (displayName !== '' ? (" " + displayName) : '')
                                + " " + sampleName
                                + "</span>"
                                + (isSomatic === true ? me.AFFECTED_GLYPH : ''));

                        var zyg = genotype ? (!genotype.hasOwnProperty('zygosity') || genotype.zygosity == null || genotype.zygosity === "gt_unknown" ? "unknown" : genotype.zygosity.toLowerCase()) : "none";
                        row.append("div")
                            .attr("class",  "zygosity label " + zyg)
                            .text(me.globalApp.utility.capitalizeFirstLetter(zyg));


                        var barContainer = row.append("div")
                            .attr("class", "allele-count-bar")
                        if (genotype) {
                            me._appendAlleleCountSVG(barContainer,
                                genotype.altCount,
                                genotype.refCount,
                                genotype.genotypeDepth,
                                null,
                                barWidth,
                                adjustedMaxAlleleCount);
                        }
                    }


                });


            },




            _appendReadCountHeading: function(container) {
                var me = this;
                var svg = container.append("div")
                    .attr("id", "allele-count-legend")
                    .append("svg")
                    .attr("width", me.WIDTH_ALLELE_COUNT_ROW)
                    .attr("height", "20");
                svg.append("text")
                    .attr("x", "0")
                    .attr("y", "14")
                    .attr("anchor", "start")
                    .attr("class", "header-small")
                    .text("Read Counts");

                var g = svg.append("g")
                    .attr("transform", "translate(100,1)");

                g.append("text")
                    .attr("x", "7")
                    .attr("y", "9")
                    .attr("class", "alt-count-under")
                    .attr("anchor", "start")
                    .text("alt");
                g.append("text")
                    .attr("x", "28")
                    .attr("y", "9")
                    .attr("class", "other-count-under")
                    .attr("anchor", "start")
                    .text("other");
                g.append("text")
                    .attr("x", "67")
                    .attr("y", "9")
                    .attr("class", "ref-count")
                    .attr("anchor", "start")
                    .text("ref");
                g.append("text")
                    .attr("x", "90")
                    .attr("y", "14")
                    .attr("class", "ref-count")
                    .attr("anchor", "start")
                    .text("total");

                g.append("rect")
                    .attr("x", "1")
                    .attr("y", "10")
                    .attr("height", 4)
                    .attr("width",28)
                    .attr("class", "alt-count");
                g.append("rect")
                    .attr("x", "29")
                    .attr("y", "10")
                    .attr("height", 4)
                    .attr("width",28)
                    .attr("class", "other-count");
                g.append("rect")
                    .attr("x", "57")
                    .attr("y", "10")
                    .attr("height", 4)
                    .attr("width",28)
                    .attr("class", "ref-count");

            },

            _appendAlleleCountSVG: function(container, genotypeAltCount,
                                            genotypeRefCount, genotypeDepth, bamDepth, barWidth, maxAlleleCount) {
                var me = this;

                var MAX_BAR_WIDTH = barWidth ? barWidth : me.ALLELE_COUNT_BAR_WIDTH;
                var PADDING = 20;
                MAX_BAR_WIDTH = MAX_BAR_WIDTH - PADDING;
                var BAR_WIDTH = 0;
                if ((genotypeDepth == null || genotypeDepth == '') && (genotypeAltCount == null || genotypeAltCount.indexOf(",") >= 0)) {
                    container.text("");
                    var svg = container
                        .append("svg")
                        .attr("width", MAX_BAR_WIDTH + PADDING)
                        .attr("height", "21");
                    return;
                }



                if (genotypeAltCount == null || genotypeAltCount.indexOf(",") >= 0) {
                    BAR_WIDTH = d3.round(MAX_BAR_WIDTH * (genotypeDepth / maxAlleleCount));
                    container.select("svg").remove();
                    var svg = container
                        .append("svg")
                        .attr("width", MAX_BAR_WIDTH + PADDING)
                        .attr("height", "12");
                    svg.append("rect")
                        .attr("x", "1")
                        .attr("y", "1")
                        .attr("height", 10)
                        .attr("width",BAR_WIDTH)
                        .attr("class", "ref-count");

                    svg.append("text")
                        .attr("x", BAR_WIDTH + 5)
                        .attr("y", "9")
                        .text(genotypeDepth);

                    var g = svg.append("g")
                        .attr("transform", "translate(0,0)");
                    g.append("text")
                        .attr("x", BAR_WIDTH / 2)
                        .attr("y", "9")
                        .attr("text-anchor", "middle")
                        .attr("class", "ref-count")
                        .text("?");
                    return;
                }

                var totalCount = genotypeDepth;
                var otherCount = totalCount - (+genotypeRefCount + +genotypeAltCount);

                // proportion the widths of alt, other (for multi-allelic), and ref
                BAR_WIDTH      = d3.round((MAX_BAR_WIDTH) * (totalCount / maxAlleleCount));
                if (BAR_WIDTH < 10) {
                    BAR_WIDTH = 10;
                }
                if (BAR_WIDTH > PADDING + 10) {
                    BAR_WIDTH = BAR_WIDTH - PADDING;
                }
                var altPercent = +genotypeAltCount / totalCount;
                var altWidth   = d3.round(altPercent * BAR_WIDTH);
                var refPercent = +genotypeRefCount / totalCount;
                var refWidth   = d3.round(refPercent * BAR_WIDTH);
                var otherWidth = BAR_WIDTH - (altWidth+refWidth);

                // Force a separate line if the bar width is too narrow for count to fit inside or
                // this is a multi-allelic.
                var separateLineForLabel = (altWidth > 0 && altWidth / 2 < 11) || (refWidth > 0 && refWidth / 2 < 11) || (otherWidth > 0);

                container.select("svg").remove();
                var svg = container
                    .append("svg")
                    .attr("width", MAX_BAR_WIDTH + PADDING)
                    .attr("height", separateLineForLabel ? "31" : "21");

                if (altWidth > 0) {
                    svg.append("rect")
                        .attr("x", "1")
                        .attr("y", "1")
                        .attr("height", 10)
                        .attr("width",altWidth)
                        .attr("class", "alt-count");

                }

                if (otherWidth > 0) {
                    svg.append("rect")
                        .attr("x", altWidth)
                        .attr("y", "1")
                        .attr("height", 10)
                        .attr("width", otherWidth)
                        .attr("class", "other-count");
                }

                if (refWidth > 0) {
                    svg.append("rect")
                        .attr("x",  altWidth + otherWidth)
                        .attr("y", "1")
                        .attr("height", 10)
                        .attr("width", refWidth)
                        .attr("class", "ref-count");
                }



                svg.append("text")
                    .attr("x", BAR_WIDTH + 5)
                    .attr("y", "9")
                    .text(totalCount);



                var altX = 0;
                var otherX = 0;
                var refX = 0;
                var g = svg.append("g")
                    .attr("transform", (separateLineForLabel ? "translate(-6,11)" : "translate(0,0)"));
                if (altWidth > 0) {
                    var altX = d3.round(altWidth / 2);
                    if (altX < 6) {
                        altX = 6;
                    }
                    g.append("text")
                        .attr("x", altX)
                        .attr("y", "9")
                        .attr("text-anchor", separateLineForLabel ? "start" : "middle")
                        .attr("class", separateLineForLabel ? "alt-count-under" : "alt-count")
                        .text(genotypeAltCount);

                }

                if (otherCount > 0) {
                    otherX = altWidth  + d3.round(otherWidth / 2);
                    // Nudge the multi-allelic "other" count over to the right if it is
                    // too close to the alt count.
                    if (otherX - 11 < altX) {
                        otherX = altX + 10;
                    }
                    g.append("text")
                        .attr("x", otherX)
                        .attr("y", "9")
                        .attr("text-anchor", separateLineForLabel ? "start" : "middle")
                        .attr("class", separateLineForLabel ? "other-count-under" : "other-count")
                        .text(otherCount);

                    var gNextLine = g.append("g")
                        .attr("transform", "translate(-15,9)");
                    svg.attr("height", 45);
                    gNextLine.append("text")
                        .attr("x", otherX < 20 ? 20 : otherX)
                        .attr("y", "9")
                        .attr("text-anchor", "start")
                        .attr("class", "other-count-under" )
                        .text("(multi-allelic)");
                }
                if (genotypeRefCount > 0  && (altWidth > 0 || otherWidth > 0)) {
                    refX = altWidth + otherWidth + d3.round(refWidth / 2);
                    if (refX - 11 < otherX || refX - 11 < altX) {
                        refX = refX + 10;
                    }
                    g.append("text")
                        .attr("x", refX)
                        .attr("y", "9")
                        .attr("text-anchor", separateLineForLabel ? "start" : "middle")
                        .attr("class", "ref-count")
                        .text(genotypeRefCount);
                }

            },
            setUserFlag: function() {
                let self = this;
                self.selectedVariant.isUserFlagged = true;
                self.$emit('flag-variant', self.selectedVariant);
            },
            removeUserFlag: function() {
                let self = this;
                self.selectedVariant.isUserFlagged = false;
                self.$emit('remove-flagged-variant', self.selectedVariant);
            },
            onApplyVariantNotes: function(variant) {
                this.$emit("apply-variant-notes", variant);
            },
            onApplyVariantInterpretation: function(variant) {
                this.$emit("apply-variant-interpretation", variant);
            },
            getRevelClass: function(info) {
                let self = this;
                let clazz = "field-value revel-field";
                if (self.cohortModel && self.cohortModel.translator && self.cohortModel.translator.revelMap) {
                    self.cohortModel.translator.revelMap.forEach(function(revelRange) {
                        if (info.revel >= revelRange.min && info.revel < revelRange.max) {
                            clazz += " " + revelRange.clazz;
                        }
                    })
                }
                return clazz;
            },
            getSiftClass: function(variant) {
                let self = this;
                let clazz = "field-value sift-field";
                for (var key in variant.vepSIFT) {
                    clazz += " " + self.cohortModel.translator.siftMap[key].clazz;
                }
                return clazz;
            },
            getPolyphenClass: function(variant) {
                let self = this;
                let clazz = "field-value polyphen-field";
                for (var key in variant.vepPolyPhen) {
                    clazz += " " + self.cohortModel.translator.polyphenMap[key].clazz;
                }
                return clazz;
            },
            getAfClass: function(af) {
                if (af <= .01) {
                    return 'level-high';
                } else if (af <= .05) {
                    return 'level-medium';
                } else {
                    return '';
                }
            },
            getImpactClass: function(impact) {
                if (impact == 'high') {
                    return 'level-high'
                } else if (impact == 'moderate') {
                    return 'level-medium'
                } else {
                    return '';
                }
            }
        },


        computed: {
            impactAndConsequence: function() {
                return "<span class='" + this.getImpactClass(this.info.vepImpact) + "'>"
                    + this.info.vepImpact
                    + " - "
                    +  this.info.vepConsequence
                    + "</span>"
            },
            refAlt: function() {
                let self = this;
                var refAlt = "";
                if (self.selectedGene && self.selectedGene.strand && self.selectedVariant) {
                    if (self.isEduMode) {
                        if (self.selectedGene.strand == "-") {
                            refAlt = self.globalApp.utility.switchGenotype(self.selectedVariant.eduGenotype)
                        } else {
                            refAlt = self.selectedVariant.eduGenotype;
                        }
                    } else {
                        refAlt =   self.info.refalt;
                    }
                }
                return refAlt;
            },
            afGnomAD: function(af) {
                if (this.selectedVariant.vepAF == null || this.selectedVariant.vepAf.gnomAD.AF == null) {
                    return "unknown";
                } else if (this.selectedVariant.vepAf.gnomAD.AF == ".") {
                    return "<span class='"
                        + this.getAfClass(0)
                        + "'>"
                        + "0%"
                        + "</span>";
                } else if (this.isBasicMode) {
                    return this.globalApp.utility.percentage(this.selectedVariant.vepAf.gnomAD.AF);
                } else  {
                    var af = this.globalApp.utility.percentage(this.selectedVariant.vepAf.gnomAD.AF);
                    var link = "<a target='_gnomad' "
                        + " class='" + this.getAfClass(this.selectedVariant.vepAf.gnomAD.AF) + "' "
                        + " href='http://gnomad.broadinstitute.org/variant/" + this.selectedVariant.chrom + "-"
                        + this.selectedVariant.start + "-" + this.selectedVariant.ref + "-" + this.selectedVariant.alt + "'>"
                        + af + "</a>";
                    link += "&nbsp;&nbsp;" + this.formatPopAF(this.selectedVariant.vepAf.gnomAD);
                    return link;
                }
            },
            af1000G: function(af) {
                if (this.selectedVariant.af1000G == null) {
                    return "0%";
                } else  {
                    var af = this.globalApp.utility.percentage(this.selectedVariant.af1000G);
                    var popAF = this.formatPopAF(this.selectedVariant.vepAf['1000G']);
                    return "<span class='"
                        + this.getAfClass(this.selectedVariant.af1000G) + "'>"
                        + af
                        + "</span>"
                        +"<span style='margin-left:2px''>"
                        + popAF
                        + "</span>";
                }
            },
            afExAC: function() {
                return this.selectedVariant.afExAC ? this.globalApp.utility.percentage(this.selectedVariant.afExAC) : "";
            },
            notes: function() {
                return this.selectedVariantNotes && this.selectedVariantNotes.length > 0 ? this.selectedVariantNotes : null;
            },
            interpretation: function() {
                return this.selectedVariantInterpretation && this.selectedVariantInterpretation.length > 0 ? this.selectedVariantInterpretation : 'not-reviewed';
            }
        },

        watch: {
            selectedVariant: function() {
                if (this.selectedVariant) {
                    this.createAlleleCountsSVG();
                }
            }
        },

        filters: {
            showRelationship: function(buf) {
                if (buf == null) {
                    return "";
                } else if (buf === 'known-variants') {
                    return 'ClinVar';
                } else {
                    // Capitalize first letter
                    return buf.charAt(0).toUpperCase() + buf.slice(1);
                }
            }


        },

        updated: function() {
            //if (this.selectedVariant) {
            //  this.createAlleleCountsSVG();
            //}
        },

        mounted: function() {
        },

        created: function() {
        }


    }
</script>


