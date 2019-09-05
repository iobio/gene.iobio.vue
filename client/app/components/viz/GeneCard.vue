<style lang="css">
    #gene-viz .current {
        outline: none;
    }

    .content .btn__content {
        color: rgb(113, 113, 113);
    }

    .content .input-group {
        padding: 0px;
    }

    .content .input-group__messages {
        display: none;
    }

    .content .input-group--text-field input {
        height: 20px;
    }

    .content .input-group__input {
        min-height: 20px;
    }

    .content .input-group__details {
        min-height: 0px;
    }
</style>

<style lang="sass">
    @import ../../../assets/sass/variables
    #gene-track
        margin-bottom: 0px
        .card-title
            color: $app-color
            font-size: 15px
            margin-right: 1px
        &.full
            max-height: initial
        #gene-summary-box
            display: flex
            min-height: 108px
            max-height: 108px
            overflow-y: scroll
        #gene-card-title
            display:inline-block
            vertical-align: middle
        #gene-name
            margin-left: 0px
            color: $app-color
            margin-top: 0px
            font-size: 15px
            display: inline-block
            vertical-align: middle
        #gene-chr
            margin-left: 5px
            vertical-align: middle
        #gene-region
            margin-left: 3px
            vertical-align: middle
        #gene-plus-minus-label
            font-size: 12px
        #region-buffer-box
            vertical-align: middle
            .input-group--text-field
                input
                    font-size: 14px
                    color: $text-color
                    fill: $text-color
        #select-transcripts-box
            margin-right: 30px
            vertical-align: middle !important
        #non-protein-coding
            clear: both
            padding-bottom: 0px
            display: inline-block
            padding-top: 2px
        #ncbi-summary
            min-width: 60%
            flex: 1 1 0
            margin-top: 0px
            margin-right: 20px
            #ncbi-heading
                text-align: left
                margin-left: auto
                margin-right: auto
                width: 100%
                display: inline-block
                margin-top: 0px
                font-size: 12px
                font-weight: bold
                vertical-align: top
                color: $app-color
            #ncbi-text
                font-size: 12px
                line-height: 18px
        #phenotypes
            margin-top: 0px
            flex: 1 1 0
            #phenotypes-heading
                text-align: left
                margin-left: auto
                margin-right: auto
                width: 100%
                display: inline-block
                margin-top: 0px
                font-size: 12px
                font-weight: bold
                vertical-align: top
                color: $app-color
            #phenotype-terms
                font-size: 12px
                line-height: 18px
        .zoom-switch
            display: inline-block
            pointer-events: auto
            cursor: auto
            label
                padding-left: 7px
                line-height: 18px
                font-size: 12px
                font-weight: bold
                padding-top: 2px
                color: $text-color
                width: 50px
</style>


<template>

    <div tile id="gene-track" :class="{'app-card': true, 'full': showGeneViz}">

        <v-layout>
            <v-flex xs11 style="margin-top:-5px">
                <span class="card-title" id="gene-card-title">Gene</span>
                <span id="gene-name" class="level-basic gene-card-label heading ">
        {{ selectedGene.gene_name }}
        </span>
                <span id="gene-chr" v-if="showGene"
                      class="level-basic gene-card-label keep-case">{{ selectedGene.chr }}</span>
                <span id="gene-region" v-if="showGene" class="level-edu level-basic gene-card-label keep-case">
        {{ selectedGene.startOrig | formatRegion }} - {{ selectedGene.endOrig | formatRegion }}
        </span>
                <span id="minus-strand" v-if="selectedGene.strand === '-'" class="level-edu level-basic"
                      style="font-size:12px;padding-left: 5px;font-style: italic;">reverse strand</span>
                <span id="gene-plus-minus-label" v-if="showGene && !isEduMode && !isBasicMode"
                      class="level-edu level-basic fullview" style="padding-left: 15px">+  -</span>
                <div v-if="showGene && !isEduMode && !isBasicMode" id="region-buffer-box"
                     style="display:inline-block;width:50px;height:21px;margin-right:15px">
                    <v-text-field
                            id="gene-region-buffer-input"
                            class="sm level-edu level-basic fullview"
                            v-model="regionBuffer"
                            v-on:change="onGeneRegionBufferChange">
                    </v-text-field>
                </div>
                <transcripts-menu
                        v-if="!isEduMode && !isBasicMode"
                        v-bind:class="{ hide: !showGene }"
                        :selectedGene="selectedGene"
                        :selectedTranscript="selectedTranscript"
                        :geneSources="geneSources"
                        :geneModel="geneModel"
                        @transcriptSelected="onTranscriptSelected"
                        @gene-source-selected="onGeneSourceSelected">
                </transcripts-menu>
            </v-flex>
            <v-flex xs1 style="text-align:center">
                <v-switch
                        v-on:click.self.stop.prevent="toggleZoom"
                        class="zoom-switch ml-1" style="max-width:80px"
                        label="Zoom"
                        v-model="showZoom"
                >
                </v-switch>
            </v-flex>
        </v-layout>
        <v-layout>
            <v-flex xs12 style="text-align:center">
                <span v-if="showZoom" style="vertical-align:middle" class=" label label-warning text-xs-center">{{ zoomMessage }}</span>
            </v-flex>
        </v-layout>

        <!--<gene-links-menu-->
        <!--v-if="showGene && !isBasicMode && !isEduMode && !workingOffline"-->
        <!--:expanded="true"-->
        <!--:geneModel="geneModel"-->
        <!--:selectedGene="selectedGene">-->
        <!--</gene-links-menu>-->

        <!-- Non protein-coding gene badges -->
        <div id="non-protein-coding" class="level-edu level-basic">
            <div id="no-gene-selected-badge" class="hide label label-warning" style="display:block;margin-bottom:2px;">
                Enter a gene name
            </div>
            <div id="gene-type-badge"
                 v-if="showGeneTypeWarning"
                 class="label label-warning"
                 style="display:block;margin-bottom:2px;">
                {{ selectedGene.gene_type }}
            </div>
            <div id="transcript-type-badge"
                 v-if="showTranscriptTypeWarning"
                 class=" label label-warning"
                 style="display:block;">
                {{ selectedTranscript | formatTranscriptType }}
            </div>
            <div id="no-transcripts-badge"
                 v-if="showNoTranscriptsWarning"
                 class=" label label-warning" style="display:block;">
                {{ noTranscriptsWarning }}
            </div>
        </div>

        <div :id="geneVizName" v-if="showGeneViz" class="level-edu fullview">
            <gene-viz id="gene-viz"
                      ref="transcriptGeneVizRef"
                      :data="[selectedTranscript]"
                      :height="40"
                      :margin="margin"
                      :trackHeight="trackHeight"
                      :cdsHeight="cdsHeight"
                      :regionStart="geneRegionStart"
                      :regionEnd="geneRegionEnd"
                      :isZoomTrack="true"
                      :zoomSwitchOn="showZoom"
                      @region-zoom="onRegionZoom"
                      @region-zoom-reset="onRegionZoomReset">
            </gene-viz>
        </div>

        <!--TODO: add in Adit's gene summary component-->
        <!--<div id="gene-summary-box" v-if="!isEduMode" >-->
        <!--<div  v-if="showGene && ncbiSummary" id="ncbi-summary">-->
        <!--<div id="ncbi-heading">NCBI summary</div>-->
        <!--<div id="ncbi-text">-->
        <!--{{ ncbiSummary.summary }}-->
        <!--</div>-->
        <!--</div>-->

        <!--<div id="phenotypes" v-if="showGene && phenotypes && !isBasicMode && !isEduMode">-->
        <!--<span id="phenotypes-heading" style="text-align:left">-->
        <!--Phenotypes (HPO)-->
        <!--</span>-->
        <!--<div id="phenotype-terms">-->
        <!--{{ phenotypeTerms }}-->
        <!--</div>-->
        <!--</div>-->
        <!--</div>-->

    </div>


</template>

<script>
    import GeneViz from '../viz/GeneViz.vue'
    import GeneLinksMenu from '../partials/GeneLinksMenu.vue'
    import TranscriptsMenu from '../partials/TranscriptsMenu.vue'
    import ScrollButton from '../partials/ScrollButton.vue'
    import Vue from 'vue'

    export default {
        name: 'gene-card',
        components: {
            GeneViz,
            GeneLinksMenu,
            TranscriptsMenu,
            ScrollButton
        },
        props: {
            isEduMode: null,
            isBasicMode: null,
            selectedGene: {},
            selectedTranscript: {},
            geneRegionStart: null,
            geneRegionEnd: null,
            geneModel: null,
            showGeneViz: null,
            showTitle: null,
            workingOffline: false,
            clearZoom: false
        },
        data() {
            let self = this;
            return {
                margin: {
                    top: self.isBasicMode || self.isEduMode ? 0 : 20,
                    right: self.isBasicMode || self.isEduMode ? 7 : 2,
                    bottom: 18,
                    left: self.isBasicMode || self.isEduMode ? 9 : 4
                },
                trackHeight: (self.isEduMode || self.isBasicMode ? 32 : 18),
                cdsHeight: (self.isEduMode || self.isBasicMode ? 24 : 12),
                geneSource: null,
                geneSources: ['gencode', 'refseq'],
                noTranscriptsWarning: null,
                showNoTranscriptsWarning: false,
                geneRegionBuffer: null,
                phenotypes: null,
                phenotypeTerms: null,
                ncbiSummary: null,
                showZoom: false,
                zoomMessage: "Drag to zoom",
                geneVizName: 'transcript-panel',
                updateMatrix: false  // Used to control redraw of feature matrix when zoom status changes
            }
        },
        methods: {
            onTranscriptSelected: function (transcript) {
                var self = this;
                self.$emit('transcript-selected', transcript);
            },
            onGeneSourceSelected: function (geneSource) {
                let self = this;
                var switchMsg = null;
                if (self.geneModel.refseqOnly[self.selectedGene.gene_name] && geneSource != 'refseq') {
                    switchMsg = 'Gene ' + self.selectedGene.gene_name + ' only in RefSeq. Switching to this transcript set.';
                    self.geneSource = 'refseq';
                } else if (self.geneModel.gencodeOnly[self.selectedGene.gene_name] && geneSource != 'gencode') {
                    switchMsg = 'Gene ' + self.selectedGene.gene_name + ' only in Gencode. Switching to this transcript set.';
                    self.geneSource = 'gencode';
                } else {
                    self.geneSource = geneSource;
                }
                if (switchMsg) {
                    self.noTranscriptsWarning = switchMsg;
                    self.showNoTranscriptsWarning = true;
                }
                self.$emit('gene-source-selected', self.geneSource);
            },
            onRegionZoom: function (regionStart, regionEnd) {
                this.zoomMessage = "Click to zoom out";
                this.$emit('gene-region-zoom', regionStart, regionEnd);
            },
            onRegionZoomReset: function () {
                let updateTrack = true;
                this.zoomMessage = "Drag to zoom";
                this.$emit('gene-region-zoom-reset', updateTrack);
            },
            initSummaryInfo: function () {
                let self = this;
                if (self.selectedGene && self.selectedGene.gene_name) {
                    self.ncbiSummary = self.geneModel.geneNCBISummaries[self.selectedGene.gene_name];
                    if (self.ncbiSummary == null || self.ncbiSummary.summary == '?') {
                        self.geneModel.promiseGetNCBIGeneSummary(self.selectedGene.gene_name)
                            .then(function (data) {
                                self.ncbiSummary = data;
                            })
                    }
                    self.phenotypes = self.geneModel.genePhenotypes[self.selectedGene.gene_name]
                    if (self.phenotypes) {
                        self.phenotypeTerms = self.phenotypes.map(function (d) {
                            return d.hpo_term_name;
                        }).join(", ");
                    }
                } else {
                    self.ncbiSummary = null;
                    self.phenotypes = null;
                }
            },
            toggleZoom: function() {
                const self = this;
                self.updateMatrix = true;
                self.showZoom = !self.showZoom;
            },
            onGeneRegionBufferChange: _.debounce(function (newGeneRegionBuffer) {
                this.$emit('gene-region-buffer-change', parseInt(newGeneRegionBuffer));
            }, 100),
        },
        filters: {
            formatRegion: function (value) {
                return !value ? '' : d3.format(",")(value);
            },
            formatTranscriptType: function (transcript) {
                if (transcript && transcript.transcript_type.indexOf("transcript") < 0) {
                    return transcript.transcript_type + " transcript";
                } else if (transcript) {
                    return transcript.transcript_type;
                } else {
                    return "";
                }
            }
        },
        computed: {
            showGene: function () {
                return this.selectedGene != null && Object.keys(this.selectedGene).length > 0
            },
            showGeneTypeWarning: function () {
                return this.selectedGene != null
                    && Object.keys(this.selectedGene).length > 0
                    && this.selectedGene.gene_type !== 'protein_coding'
                    && this.selectedGene.gene_type !== 'gene';
            },
            showTranscriptTypeWarning: function () {
                if (this.selectedTranscript == null || this.selectedTranscript.transcript_type === 'protein_coding'
                    || this.selectedTranscript.transcript_type === 'mRNA'
                    || this.selectedTranscript.transcript_type === 'transcript') {
                    return false;
                } else {
                    if (this.selectedGene.gene_type !== this.selectedTranscript.transcript_type) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            regionBuffer: {
                get() {
                    return this.value == null ? 1000 : this.value
                },
                set(val) {
                    Vue.nextTick(() => {
                        this.$emit('input', val)
                    })
                }
            }
        },
        watch: {
            geneModel: function () {
                this.geneRegionBuffer = this.geneModel ? this.geneModel.geneRegionBuffer : 0;
            },
            selectedGene: function (newGene, oldGene) {
                if (newGene.gene_name !== oldGene.gene_name) {
                    this.initSummaryInfo();
                }
            },
            showZoom: function () {
                const self = this;
                let container = d3.select('#' + self.geneVizName).select('#gene-viz');
                if (self.showZoom) {
                    self.zoomMessage = "Drag to zoom";
                    self.$refs.transcriptGeneVizRef.toggleBrush(self.showZoom, container);
                } else {
                    self.$refs.transcriptGeneVizRef.toggleBrush(self.showZoom, container);
                    self.$emit('gene-region-zoom-reset', self.updateMatrix);
                }
            },
            clearZoom: function () {
                const self = this;
                if (self.clearZoom === true) {
                    self.updateMatrix = false;
                    self.showZoom = false;
                    self.zoomMessage = "Drag to zoom";
                    const updateTrack = false;
                    self.$emit('gene-region-zoom-reset', updateTrack);
                }
            }
        },
        mounted: function () {
            this.geneSource = this.geneModel.geneSource;
            this.initSummaryInfo();
        },
        updated: function () {
        },
        created: function () {
        }
    }
</script>