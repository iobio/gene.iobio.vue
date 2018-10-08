<style lang="sass">
    @import ../../../assets/sass/variables
    #sample-data-form
        #sample-selection
            .input-group--select
                .input-group__selections__comma
                    font-size: 12px
                    padding: 0px 0px 0px 0px
            .input-group
                label
                    font-size: 12px
                    line-height: 25px
                    height: 25px
            .input-group__input
                min-height: 0px
                margin-top: 0px

            .input-group--text-field.input-group--dirty.input-group--select
                label
                    -webkit-transform: translate(0, -18px) scale(0.95)
                    transform: translate(0, -18px) scale(0.95)

            .input-group--text-field.input-group--dirty:not(.input-group--textarea)
                label
                    -webkit-transform: translate(0, -18px) scale(0.95)
                    transform: translate(0, -18px) scale(0.95)

        .sample-label
            span
                margin-top: 2px
                margin-bottom: 2px
                vertical-align: top
                margin-left: 0px
                font-size: 15px
                color: $app-color
                display: inline-block
                margin-right: 20px
            .switch
                display: inline-block
                width: 100px

</style>
<style lang="css">
    .drag-handle {
        cursor: move;
    }
    .vert-label {
        -webkit-transform: rotate(-90deg);
        -moz-transform: rotate(-90deg);
        color: #7f1010;
        padding-top: 5px;
        padding-left: 0;
    }
    .vert-border {
        padding-left: 10px;
        border-left: 1px solid #7f1010;
    }
    .cont-left {
        padding-right: 30px !important;
        padding-top: 25px !important;
    }
</style>

<template>
    <v-layout id="sample-data-form" row wrap
              :class="{'mt-3': true}">
        <v-flex d-flex xs1>
            <v-container height="100%" class="cont-left">
                <div class="vert-label">
                    {{rowLabel}}
                </div>
            </v-container>
        </v-flex>
        <v-flex d-flex xs11
                :style="{'margin-left': '-17px'}">
            <v-layout row wrap class="vert-border">
                <v-flex d-flex xs2 class="sample-label">
                    <v-text-field class="pt-1"
                                  color="appColor"
                                  placeholder="Enter nickname"
                                  hide-details
                                  v-model="modelInfo.displayName"
                                  @change="onNameEntered"
                    ></v-text-field>
                </v-flex>
                <v-flex d-flex xs8 v-if="!isStaticSlot && !timeSeriesMode">
                    <v-switch label="Tumor" class="pt-1" hide-details @change="onIsAffected"
                              v-model="isTumor"></v-switch>
                </v-flex>
                <v-flex d-flex xs8 v-else-if="timeSeriesMode === true">
                    <v-container>
                        <div>
                            <v-chip small outline color="appColor">
                                {{chipLabel}}
                            </v-chip>
                        </div>
                    </v-container>
                </v-flex>
                <v-flex d-flex xs8 v-else>
                    <!--space holder-->
                </v-flex>
                <v-flex d-flex xs2 v-if="!isStaticSlot" style="padding-left: 30px">
                    <v-btn small flat icon style="margin: 0 !important" class="drag-handle">
                        <v-icon color="appColor">reorder</v-icon>
                    </v-btn>
                    <v-btn small flat icon style="margin: 0 !important"
                           @click="removeSample">
                        <v-icon color="appColor">
                            clear
                        </v-icon>
                    </v-btn>
                </v-flex>
                <v-flex d-flex xs2 v-else style="padding-left: 70px">
                    <v-btn small flat icon style="margin: 0 !important" class="drag-handle">
                        <v-icon color="appColor">reorder</v-icon>
                    </v-btn>
                </v-flex>
                <v-flex d-flex xs12 class="ml-3" style="margin-top: -5px">
                    <sample-data-file
                            :defaultUrl="modelInfo.vcf"
                            :defaultIndexUrl="modelInfo.tbi"
                            :label="`vcf`"
                            :indexLabel="`tbi`"
                            :filePlaceholder="filePlaceholder.vcf"
                            :fileAccept="fileAccept.vcf"
                            :separateUrlForIndex="separateUrlForIndex"
                            @url-entered="onVcfUrlEntered"
                            @file-selected="onVcfFilesSelected">
                    </sample-data-file>
                </v-flex>
                <v-flex xs4 id="sample-selection">
                    <v-select
                            v-bind:class="samples == null || samples.length === 0 ? 'hide' : ''"
                            label="Sample"
                            v-model="sample"
                            :items="samples"
                            autocomplete
                            @input="onSampleSelected"
                            hide-details
                    ></v-select>
                </v-flex>
                <v-flex d-flex xs12 class="ml-3 ">
                    <sample-data-file
                            :defaultUrl="modelInfo.bam"
                            :defaultIndexUrl="modelInfo.bai"
                            :label="`bam`"
                            :indexLabel="`bai`"
                            :filePlaceholder="filePlaceholder.bam"
                            :fileAccept="fileAccept.bam"
                            :separateUrlForIndex="separateUrlForIndex"
                            @url-entered="onBamUrlEntered"
                            @file-selected="onBamFilesSelected">
                    </sample-data-file>
                </v-flex>
            </v-layout>
        </v-flex>
    </v-layout>
</template>

<script>

    import SampleDataFile from '../partials/SampleDataFile.vue'
    import draggable from 'vuedraggable'

    export default {
        name: 'sample-data',
        components: {
            draggable,
            SampleDataFile
        },
        props: {
            modelInfo: null,
            separateUrlForIndex: null,
            timeSeriesMode: false,
            dragOrder: 0
        },
        data() {
            return {
                isValid: false,
                filePlaceholder: {
                    'vcf': '.vcf.gz and .tbi files',
                    'bam': '.bam and .bai files'
                },
                fileAccept: {
                    'vcf': '.vcf.gz, .tbi',
                    'bam': '.bam, .bai'
                },
                samples: [],
                sample: null,
                isTumor: true,
                rowLabel: '',
                chipLabel: '',
                isStaticSlot: false
            }
        },
        watch: {
            timeSeriesMode: function() {
                let self = this;
                self.rowLabel = self.getRowLabel();
            },
            dragOrder: function() {
                let self = this;
                self.isStaticSlot = self.dragOrder < 2;
            },
            isTumor: function() {
                let self = this;
                self.chipLabel = self.isTumor ? 'TUMOR' : 'NORMAL';
            }
        },
        computed: {
            tumorStatus: function() {
                if (this.modelInfo.order === 0) {
                    return 'NORMAL';
                } else {
                    return 'TUMOR';
                }
            }
        },
        methods: {
            onNameEntered: function () {
                if (self.modelInfo && self.modelInfo.model) {
                    self.modelInfo.model.setDisplayName(self.modelInfo.displayName);
                }
            },
            onVcfUrlEntered: function (vcfUrl, tbiUrl) {
                let self = this;
                self.$set(self, "sample", null);
                self.$set(self, "samples", []);

                if (self.modelInfo && self.modelInfo.model) {
                    self.modelInfo.model.onVcfUrlEntered(vcfUrl, tbiUrl, function (success, sampleNames) {
                        if (success) {
                            self.samples = sampleNames;
                            if (self.modelInfo.sample && self.samples.indexOf(self.modelInfo.sample) >= 0) {
                                self.sample = self.modelInfo.sample;
                                self.modelInfo.model.sampleName = self.modelInfo.sample;
                            } else if (self.samples.length === 1) {
                                self.sample = self.samples[0];
                                self.modelInfo.sample = self.sample;
                                self.modelInfo.model.sampleName = self.sample;
                            } else {
                                self.sample = null;
                                self.modelInfo.sample = null;
                                self.modelInfo.model.sampleName = null;
                            }
                            self.$emit("samples-available", self.modelInfo.order, self.samples);
                        }
                        self.$emit("sample-data-changed");
                    })
                }
            },
            onVcfFilesSelected: function (fileSelection) {
                let self = this;
                self.$set(self, "sample", null);
                self.$set(self, "samples", []);
                self.modelInfo.model.promiseVcfFilesSelected(fileSelection)
                    .then(function (data) {
                        self.samples = data.sampleNames;
                        if (self.modelInfo.sample && self.samples.indexOf(self.modelInfo.sample) >= 0) {
                            self.sample = self.modelInfo.sample;
                            self.modelInfo.model.sampleName = self.modelInfo.sample;
                        } else if (self.samples.length === 1) {
                            self.sample = self.samples[0];
                            self.modelInfo.sample = self.sample;
                            self.modelInfo.model.sampleName = self.sample;
                        } else {
                            self.sample = null;
                            self.modelInfo.sample = null;
                            self.modelInfo.model.sampleName = null;
                        }
                        self.$emit("sample-data-changed");
                        self.$emit("samples-available", self.modelInfo.relationship, self.samples);
                    })
                    .catch(function (error) {
                        self.$emit("sample-data-changed");
                    })
            },
            onIsAffected: function () {
                this.modelInfo.isTumor = this.isTumor;
                this.modelInfo.model.isTumor = this.modelInfo.affectedStatus;
                this.rowLabel = this.getRowLabel();
            },
            updateSamples: function (samples, sampleToSelect) {
                this.samples = samples;
                if (sampleToSelect) {
                    this.sample = sampleToSelect;
                } else {
                    this.sample = null;
                }
            },
            onSampleSelected: function () {
                let self = this;
                self.modelInfo.sample = this.sample;
                if (self.modelInfo.model) {
                    self.modelInfo.model.sampleName = this.modelInfo.sample;
                    self.modelInfo.model.setName(this.modelInfo.sample);
                }
                self.$emit("sample-data-changed");
            },
            onBamUrlEntered: function (bamUrl, baiUrl) {
                let self = this;
                if (self.modelInfo && self.modelInfo.model) {
                    self.modelInfo.model.onBamUrlEntered(bamUrl, baiUrl, function (success) {
                        if (success) {
                        } else {
                        }
                        self.$emit("sample-data-changed");
                    })
                }
            },
            onBamFilesSelected: function (fileSelection) {
                let self = this;
                self.modelInfo.model.promiseBamFilesSelected(fileSelection)
                    .then(function () {
                        self.$emit("sample-data-changed");
                    })
                    .catch(function (error) {
                        self.$emit("sample-data-changed");
                    })
            },
            removeSample: function () {
                let self = this;
                self.$emit("remove-sample", self.modelInfo.order);
            },
            updateOrder: function(oldIndex, newIndex) {
                let self = this;

                // Update order prop in view and model
                if (self.modelInfo.order === oldIndex) {
                    self.modelInfo.order = newIndex;
                    self.modelInfo.model.order = newIndex;
                } else if (oldIndex > newIndex && self.modelInfo.order >= newIndex
                    && self.modelInfo.order < oldIndex) {
                    self.modelInfo.order++;
                    self.modelInfo.model.order++;
                } else if (oldIndex < newIndex && self.modelInfo.order <= newIndex
                    && self.modelInfo.order > oldIndex) {
                    self.modelInfo.order--;
                }

                // Enforce first slot normal, second tumor
                if (self.modelInfo.order === 0) {
                    self.isTumor = false;
                    self.modelInfo.isTumor = false;
                    self.modelInfo.model.isTumor = false;
                    //self.chipLabel = 'NORMAL';
                } else if (self.modelInfo.order === 1) {
                    self.isTumor = true;
                    self.modelInfo.isTumor = true;
                    self.modelInfo.model.isTumor = true;
                    //self.chipLabel = 'TUMOR';
                }

                self.rowLabel = self.getRowLabel();
            },
            getRowLabel: function() {
                let self = this;
                if (self.timeSeriesMode) {
                    return 'T' + self.modelInfo.order;
                } else {
                    if (self.modelInfo.isTumor) {
                        return 'TUMOR';
                    } else {
                        return 'NORMAL';
                    }
                }
            }
        },
        created: function () {

        },
        mounted: function () {
            this.samples = this.modelInfo.samples;
            this.isTumor = this.modelInfo.isTumor;
            this.rowLabel = this.getRowLabel();
            this.chipLabel = this.isTumor ? 'TUMOR' : 'NORMAL';
            this.isStaticSlot = this.dragOrder < 2;
            if (this.modelInfo.vcf) {
                this.onVcfUrlEntered(this.modelInfo.vcf, this.modelInfo.tbi);
            }

        }
    }

</script>