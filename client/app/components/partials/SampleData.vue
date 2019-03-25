<style lang="sass">
    @import ../../../assets/sass/variables
    #sample-data-form
        .track-name
            input
                font-size: 12px !important
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
            input
                font-size: 14px
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
                    <v-text-field class="pt-1 track-name"
                                  color="appColor"
                                  placeholder="Enter Track Name"
                                  hide-details
                                  v-model="modelInfo.displayName"
                                  @change="onNicknameEntered"
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
                <v-flex d-flex xs2 v-if="!isStaticSlot && !timeSeriesMode" style="padding-left: 30px">
                    <v-btn small flat icon style="margin: 0 !important" class="drag-handle">
                        <v-icon color="appColor">reorder</v-icon>
                    </v-btn>
                    <v-btn small flat icon style="margin: 0 !important"
                           @click="openConfirmationDialog">
                        <v-icon color="appColor">
                            clear
                        </v-icon>
                    </v-btn>
                </v-flex>
                <v-flex d-flex xs2 v-else-if="!timeSeriesMode" style="padding-left: 70px">
                    <v-btn small flat icon style="margin: 0 !important" class="drag-handle">
                        <v-icon color="appColor">reorder</v-icon>
                    </v-btn>
                </v-flex>
                <v-flex d-flex xs2 v-else-if="!isStaticSlot" style="padding-left: 70px">
                    <v-btn small flat icon style="margin: 0 !important"
                           @click="openConfirmationDialog">
                        <v-icon color="appColor">clear</v-icon>
                    </v-btn>
                </v-flex>
                <v-flex d-flex xs12 class="ml-3" style="margin-top: -5px">
                    <sample-data-file
                            ref="vcfFileRef"
                            :defaultUrl="firstVcf"
                            :defaultIndexUrl="firstTbi"
                            :label="`vcf`"
                            :indexLabel="`tbi`"
                            :filePlaceholder="filePlaceholder.vcf"
                            :fileAccept="fileAccept.vcf"
                            :separateUrlForIndex="separateUrlForIndex"
                            :isError="vcfError"
                            @url-entered="onVcfUrlEntered"
                            @file-selected="onVcfFilesSelected">
                    </sample-data-file>
                </v-flex>
                <v-flex d-flex xs12 v-if="retrievingIds">
                    <v-layout>
                        <div class="loader">
                            <img src="../../../assets/images/wheel.gif">
                        </div>
                    </v-layout>
                </v-flex>
                <v-flex xs4 id="sample-selection">
                    <v-select
                            v-bind:class="samples == null || samples.length === 0 ? 'hide' : ''"
                            label="Sample"
                            v-model="selectedSample"
                            :items="samples"
                            color="appColor"
                            autocomplete
                            @input="onSampleSelected"
                            hide-details
                    ></v-select>
                </v-flex>
                <v-flex d-flex xs12 class="ml-3 ">
                    <sample-data-file
                            ref="bamFileRef"
                            :defaultUrl="firstBam"
                            :defaultIndexUrl="firstBai"
                            :label="`bam`"
                            :indexLabel="`bai`"
                            :filePlaceholder="filePlaceholder.bam"
                            :fileAccept="fileAccept.bam"
                            :separateUrlForIndex="separateUrlForIndex"
                            :isError="bamError"
                            @url-entered="onBamUrlEntered"
                            @file-selected="onBamFilesSelected">
                    </sample-data-file>
                </v-flex>
                <v-flex d-flex xs12 v-if="checkingBam">
                    <v-layout>
                        <div class="loader">
                            <img src="../../../assets/images/wheel.gif">
                        </div>
                    </v-layout>
                </v-flex>
            </v-layout>
        </v-flex>
        <confirmation-dialog
                ref="confirmationDialogRef"
                @confirm-delete-track="confirmDeleteTrack">
        </confirmation-dialog>
    </v-layout>
</template>

<script>

    import SampleDataFile from '../partials/SampleDataFile.vue'
    import draggable from 'vuedraggable'
    import ConfirmationDialog from "./ConfirmationDialog.vue";

    export default {
        name: 'sample-data',
        components: {
            draggable,
            SampleDataFile,
            ConfirmationDialog
        },
        props: {
            modelInfo: null,
            separateUrlForIndex: null,
            timeSeriesMode: false,
            dragId: '',
            arrIndex: 0,
            launchedFromHub: false
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
                samples: [],    // the available samples to choose from
                selectedSample: null,   // the selected sample
                isTumor: true,
                rowLabel: '',
                chipLabel: '',
                isStaticSlot: false,
                firstVcf: null,
                firstTbi: null,
                firstBam: null,
                firstBai: null,
                retrievingIds: false,
                checkingBam: false,
                vcfError: false,
                bamError: false,
                selectedTrackId: null
            }
        },
        watch: {
            'modelInfo.vcf': function (newVal, oldVal) {
                let self = this;
                if (newVal) {
                    self.firstVcf = newVal;
                }
            },
            'modelInfo.tbi': function (newVal, oldVal) {
                let self = this;
                if (newVal) {
                    self.firstTbi = newVal;
                }
            },
            'modelInfo.bam': function (newVal, oldVal) {
                let self = this;
                if (newVal) {
                    self.firstBam = newVal;
                }
            },
            'modelInfo.bai': function (newVal, oldVal) {
                let self = this;
                if (newVal) {
                    self.firstBai = newVal;
                }
            },
            timeSeriesMode: function() {
                let self = this;
                self.updateLabel();
            },
            isTumor: function() {
                let self = this;
                self.chipLabel = self.isTumor ? 'TUMOR' : 'NORMAL';
            },
            selectedSample: function(newVal, oldVal) {
                let self = this;
                if (newVal != null && newVal !== oldVal && self.modelInfo && self.modelInfo.model) {
                    self.modelInfo.model.markEntryDataChanged(true);
                }
            }
        },
        computed: {
        },
        methods: {
            onNicknameEntered: function () {
                let self = this;
                if (self.modelInfo && self.modelInfo.model) {
                    self.modelInfo.model.setDisplayName(self.modelInfo.displayName);
                }
            },
            onVcfUrlEntered: function (vcfUrl, tbiUrl) {
                let self = this;
                if (vcfUrl === '') {
                    self.modelInfo.vcf = null;
                    self.firstVcf = null;
                }
                if (tbiUrl === '') {
                    self.modelInfo.tbi = null;
                    self.firstTbi = null;
                }

                return new Promise((resolve, reject) => {

                    // Clear error state & flip on loading gif
                    self.vcfError = false;
                    self.retrievingIds = true;
                    self.$emit("sample-data-changed");

                    // Clear out old data
                    self.$set(self, "selectedSample", null);
                    self.$set(self, "samples", []);

                    if (self.modelInfo && self.modelInfo.model) {
                        // TODO: add build info to return callback params & check+notify as needed
                        self.modelInfo.model.onVcfUrlEntered(vcfUrl, tbiUrl, function (success, sampleNames) {
                            if (success) {
                                self.samples = sampleNames;
                                self.modelInfo.vcf = vcfUrl;
                                if (tbiUrl != null || tbiUrl !== '') {
                                    self.modelInfo.tbi = tbiUrl;
                                }
                                self.retrievingIds = false;
                                if (self.modelInfo.selectedSample && self.samples.indexOf(self.modelInfo.selectedSample) >= 0) {
                                    self.selectedSample = self.modelInfo.selectedSample;
                                    self.modelInfo.model.sampleName = self.modelInfo.sample;
                                } else if (self.samples.length === 1) {
                                    self.selectedSample = self.samples[0];
                                    self.modelInfo.selectedSample = self.selectedSample;
                                    self.modelInfo.model.sampleName = self.selectedSample;
                                } else {
                                    self.selectedSample = null;
                                    self.modelInfo.selectedSample = null;
                                    self.modelInfo.model.sampleName = null;
                                }
                                // self.$emit("samples-available", self.modelInfo.order, self.samples);
                            } else {
                                self.retrievingIds = false;
                                self.vcfError = true;
                                alertify.set('notifier', 'position', 'top-right');
                                alertify.warning("There was an error accessing the entered file. Please check the file and try again.");
                                reject('There was an error in onVcfUrlEnt in sampledata component');
                            }
                            self.$emit("sample-data-changed");
                            resolve();
                        })
                    }

                })
            },
            onVcfFilesSelected: function (fileSelection) {
                let self = this;

                self.$set(self, "selectedSample", null);
                self.$set(self, "samples", []);

                // if we've hit the clear file button
                if (fileSelection == null) {
                    self.$emit('sample-data-changed');
                    return;
                }
                fileSelection.id = self.modelInfo.id;
                self.vcfError = false;
                self.retrievingIds = true;

                self.modelInfo.model.promiseVcfFilesSelected(fileSelection)
                    .then(function (data) {
                        if (data && data.sampleNames.length > 0) {
                            self.retrievingIds = false;
                            self.samples = data.sampleNames;
                            if (self.modelInfo.selectedSample && self.samples.indexOf(self.modelInfo.selectedSample) >= 0) {
                                self.selectedSample = self.modelInfo.selectedSample;
                                self.modelInfo.model.sampleName = self.modelInfo.selectedSample;
                            } else if (self.samples.length === 1) {
                                self.selectedSample = self.samples[0];
                                self.modelInfo.selectedSample = self.selectedSample;
                                self.modelInfo.model.sampleName = self.selectedSample;
                            } else {
                                self.selectedSample = null;
                                self.modelInfo.selectedSample = null;
                                self.modelInfo.model.sampleName = null;
                            }
                            self.$emit("sample-data-changed");
                            self.$emit("samples-available", self.modelInfo.relationship, self.samples);
                        }
                    })
                    .catch(function (error) {
                        console.log('Error in selecting vcf files in sampleData: ' + error);
                        self.vcfError = true;
                        self.retrievingIds = false;
                        self.$emit("sample-data-changed");
                    })
            },
            onIsAffected: function () {
                this.modelInfo.isTumor = this.isTumor;
                this.modelInfo.model.isTumor = this.isTumor;
                this.rowLabel = this.getRowLabel();
            },
            updateSamples: function (samples, sampleToSelect) {
                this.samples = samples;
                if (sampleToSelect) {
                    this.selectedSample = sampleToSelect;
                } else {
                    this.selectedSample = null;
                }
            },
            onSampleSelected: function () {
                let self = this;
                self.modelInfo.selectedSample = self.selectedSample;
                if (self.modelInfo.model) {
                    self.modelInfo.model.sampleName = self.modelInfo.selectedSample;
                    self.modelInfo.model.setSelectedSample(self.modelInfo.selectedSample);
                }
                self.$emit("sample-data-changed");
            },
            onBamUrlEntered: function (bamUrl, baiUrl) {
                let self = this;
                self.bamError = false;
                self.checkingBam = true;
                self.$emit("sample-data-changed");

                if (self.modelInfo && self.modelInfo.model) {
                    self.modelInfo.model.onBamUrlEntered(bamUrl, baiUrl, function (success) {
                        self.checkingBam = false;
                        if (success) {
                            self.modelInfo.bam = bamUrl;
                            if (baiUrl) {
                                self.modelInfo.bai = baiUrl;
                            }
                        } else {
                            self.bamError = true;
                        }
                        self.$emit("sample-data-changed");
                    })
                }
                if (bamUrl === '') {
                    self.modelInfo.bam = null;
                    self.firstBam = null;
                }
                if (baiUrl === '') {
                    self.modelInfo.bai = null;
                    self.firstBai = null;
                }
            },
            onBamFilesSelected: function (fileSelection) {
                let self = this;
                self.modelInfo.model.promiseBamFilesSelected(fileSelection)
                    .then(function () {
                        self.bamError = false;
                        self.$emit("sample-data-changed");
                    })
                    .catch(function (error) {
                        console.log('There was a problem selecting the bam in sampleData: '+ error);
                        self.bamError = true;
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
                self.updateLabel();
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
            },
            updateLabel: function() {
                let self = this;
                self.rowLabel = self.getRowLabel();
            },
            setTumorStatus: function(status) {
                let self = this;
                self.isTumor = status;
                self.modelInfo.isTumor = status;
                if (self.modelInfo.model) {
                    self.modelInfo.model.isTumor = status;
                }
            },
            openConfirmationDialog: function() {
                let self = this;
                self.$refs.confirmationDialogRef.displayDialog();
            },
            confirmDeleteTrack: function() {
                let self = this;
                self.removeSample();
            },
            setLoadingFlags: function (flagState) {
                let self = this;
                self.retrievingIds = flagState;
                if (self.modelInfo.bam) {
                    self.checkingBam = flagState;
                }
            },
            retryEnteredUrls: function() {
                let self = this;
                if (self.$refs.vcfFileRef) {
                    let fileRef = self.$refs.vcfFileRef;
                    if (fileRef.url && fileRef.label === 'vcf') {
                        return self.onVcfUrlEntered(fileRef.url, fileRef.indexUrl);
                    }
                }
            }
        },
        created: function () {
            this.vcfError = false;
            this.bamError = false;
        },
        mounted: function () {
            let self = this;
            self.samples = self.modelInfo.samples;
            self.isTumor = self.modelInfo.isTumor;
            self.rowLabel = self.getRowLabel();
            self.chipLabel = self.isTumor ? 'TUMOR' : 'NORMAL';
            self.isStaticSlot = self.dragId === 's0' || self.dragId === 's1';
            // If we've already filled in the file menu, populate accordingly
            if (self.modelInfo.vcf) {
                self.firstVcf = self.modelInfo.vcf;
            }
            if (self.modelInfo.tbi) {
                self.firstTbi = self.modelInfo.tbi;
            }
            if (self.modelInfo.bam) {
                self.firstBam = self.modelInfo.bam;
            }
            if (self.modelInfo.bai) {
                self.firstBai = self.modelInfo.bai;
            }

        }
    }

</script>