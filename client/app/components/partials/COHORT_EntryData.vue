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
            input
                font-size: 14px
            .switch
                display: inline-block
                width: 100px

        .sample-select-button
            input
                font-style: italic !important
                font-size: 12px !important
                font-weight: lighter !important
                padding-left: 3px !important

        .sample-select-label
            font-size: 12px !important
            font-weight: bold !important
            color: rgba(0, 0, 0, 0.54) !important

</style>
<style lang="css">
    .drag-handle {
        cursor: move;
    }

    .vert-label {
        -webkit-transform: rotate(-90deg);
        -moz-transform: rotate(-90deg);
        color: #516e87;
        padding-top: 2px;
        padding-left: 0;
    }

    .vert-border {
        padding-left: 10px;
        border-left: 1px solid #95b0c6;
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
                    {{entryLabel}}
                </div>
            </v-container>
        </v-flex>
        <v-flex d-flex xs11
                :style="{'margin-left': '-19px'}">
            <v-layout row wrap class="vert-border">
                <v-flex d-flex xs3 class="sample-label pb-1">
                    <v-text-field color="cohortNavy"
                                  label="Enter Track Name"
                                  hide-details
                                  :disabled="isCohortFromHub"
                                  v-model="modelInfo.displayName"
                                  @change="onNicknameEntered"
                    ></v-text-field>
                </v-flex>
                <v-flex d-flex xs7 v-if="isCohortFromHub">
                    <v-container>
                        <div>
                            <v-chip small outline color="cohortNavy">
                                {{chipLabel}}
                            </v-chip>
                        </div>
                    </v-container>
                </v-flex>
                <v-flex d-flex xs7 v-else>
                    <!--Spacing-->
                </v-flex>
                <v-flex d-flex xs2 v-if="!isMainCohort" style="padding-left: 30px">

                    <v-btn small flat icon style="margin: 0 !important"
                           @click="openConfirmationDialog">
                        <v-icon color="cohortNavy">
                            clear
                        </v-icon>
                    </v-btn>
                </v-flex>
                <v-flex d-flex xs2 v-else>
                    <!--Spacing-->
                </v-flex>
                <v-flex d-flex xs12 class="ml-3">
                    <entry-data-file
                            ref="vcfFileRef"
                            :defaultUrl="firstVcf"
                            :defaultIndexUrl="firstTbi"
                            :label="`vcf`"
                            :indexLabel="`tbi`"
                            :filePlaceholder="filePlaceholder.vcf"
                            :fileAccept="fileAccept.vcf"
                            :separateUrlForIndex="separateUrlForIndex && !isCohortFromHub"
                            :isCohortFromHub="isCohortFromHub"
                            :isError="vcfError"
                            @url-entered="onVcfUrlEntered"
                            @file-selected="onVcfFilesSelected">
                    </entry-data-file>
                </v-flex>
                <v-flex d-flex xs12 v-if="retrievingIds">
                    <v-layout>
                        <div class="loader">
                            <img src="../../../assets/images/wheel.gif">
                        </div>
                    </v-layout>
                </v-flex>
                <v-flex d-flex xs12 id="subset-selection" v-if="!isSampleEntry && samples && samples.length > 0">
                    <v-layout row wrap>
                        <v-flex d-flex xs2 class="pt-3">
                            <span class="pl-3 pt-2 sample-select-label">Subset Samples:</span>
                        </v-flex>
                        <v-flex d-flex xs3>
                            <v-text-field :value="subsetSampleDisplay"
                                          :disabled="launchedFromHub"
                                          single-line
                                          v-bind:class="'sample-select-button'"
                                          v-on:click="openSubsetDialog">
                            </v-text-field>
                        </v-flex>
                        <v-flex d-flex xs1>
                            <!--spacing-->
                        </v-flex>
                        <v-flex d-flex xs2 class="pt-3">
                            <span class="pl-3 pt-2 sample-select-label">Exclude Samples:</span>
                        </v-flex>
                        <v-flex d-flex xs3>
                            <v-text-field :value="excludeSampleDisplay"
                                          :disabled="launchedFromHub"
                                          single-line
                                          v-bind:class="'sample-select-button'"
                                          v-on:click="openExcludeDialog">
                            </v-text-field>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex xs4 id="sample-selection" v-if="isSampleEntry">
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
                <v-flex d-flex xs12 class="ml-3" v-if="isSampleEntry">
                    <entry-data-file
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
                    </entry-data-file>
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
        <sample-select-dialog
                ref="sampleDialogRef"
                :idType="dialogType"
                @save-sample-selection="saveSampleSelection">
        </sample-select-dialog>
        <confirmation-dialog
                ref="confirmationDialogRef"
                @confirm-delete-track="confirmDeleteTrack">
        </confirmation-dialog>
    </v-layout>
</template>

<script>

    import EntryDataFile from './EntryDataFile.vue'
    import draggable from 'vuedraggable'
    import SampleSelectDialog from "./SampleSelectDialog.vue";
    import ConfirmationDialog from "./ConfirmationDialog.vue";

    export default {
        name: 'entry-data',
        components: {
            SampleSelectDialog,
            draggable,
            EntryDataFile,
            ConfirmationDialog
        },
        props: {
            modelInfo: null,
            separateUrlForIndex: null,
            dragId: '',
            arrIndex: 0,
            launchedFromHub: false,
            isSampleEntry: false
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
                samples: [],                    // the available samples to choose from
                subsetSampleIds: null,          // the samples composing the subset - TODO: put watch
                excludeSampleIds: null,         // the samples to exclude from all cohorts - TODO: put watch
                selectedSample: null,           // if isSampleEntry, user must select single sample for track - TODO: put watch
                subsetSampleDisplay: 'click to edit',
                excludeSampleDisplay: 'click to edit',
                isMainCohort: false,
                entryLabel: '',
                chipLabel: 'Mosaic Sourced',
                firstVcf: null,
                firstTbi: null,
                firstBam: null,
                firstBai: null,
                dialogType: '',
                retrievingIds: false,
                checkingBam: false,
                vcfError: false,
                bamError: false,
                selectedTrackId: null
            }
        },
        watch: {
            'modelInfo.vcfs': function (newVal, oldVal) {
                let self = this;
                if (newVal) {
                    self.firstVcf = newVal[0];
                }
            },
            'modelInfo.tbis': function (newVal, oldVal) {
                let self = this;
                if (newVal) {
                    self.firstTbi = newVal[0];
                }
            },
            'modelInfo.bams': function (newVal, oldVal) {
                let self = this;
                if (newVal) {
                    self.firstBam = newVal[0];
                }
            },
            'modelInfo.bais': function (newVal, oldVal) {
                let self = this;
                if (newVal) {
                    self.firstBai = newVal[0];
                }
            },
            subsetSampleIds: function(newVal, oldVal) {
                let self = this;
                if (newVal != null && newVal !== oldVal && self.modelInfo && self.modelInfo.dataSet) {
                    self.modelInfo.dataSet.markEntryDataChanged();
                }
            },
            excludeSampleIds: function(newVal, oldVal) {
                let self = this;
                if (newVal != null && newVal !== oldVal && self.modelInfo && self.modelInfo.dataSet) {
                    self.modelInfo.dataSet.markEntryDataChanged();
                }
            },
            selectedSample: function(newVal, oldVal) {
                let self = this;
                if (newVal != null && newVal !== oldVal && self.modelInfo && self.modelInfo.dataSet) {
                    self.modelInfo.dataSet.markEntryDataChanged();
                }
            }
        },
        computed: {
            isCohortFromHub: function () {
                let self = this;

                if (self.launchedFromHub && self.modelInfo.id === 's0') {
                    return true;
                } else {
                    return false;
                }
            }
        },
        methods: {
            onNicknameEntered: function () {
                if (self.modelInfo && self.modelInfo.dataSet) {
                    self.modelInfo.dataSet.getProbandCohort().trackName = self.modelInfo.displayName;
                }
            },
            onVcfUrlEntered: function (vcfUrl, tbiUrl) {
                let self = this;
                if (vcfUrl === '') {
                    self.modelInfo.vcfs = [];
                    self.firstVcf = null;
                }
                if (tbiUrl === '') {
                    self.modelInfo.tbis = null;
                    self.firstTbi = null;
                }

                return new Promise((resolve, reject) => {
                    self.vcfError = false;
                    self.retrievingIds = true;
                    self.$emit("sample-data-changed");
                    self.$set(self, "selectedSample", null);
                    self.$set(self, "samples", []);
                    if (self.modelInfo.entryId === 's0') {
                        self.$emit('cohort-vcf-data-changed');
                    }

                    if (self.modelInfo && self.modelInfo.dataSet) {
                        self.modelInfo.dataSet.onVcfUrlEntered([self.modelInfo.id], [vcfUrl], [tbiUrl], [self.modelInfo.displayName])
                            .then((listObj) => {
                                self.retrievingIds = false;
                                if (listObj) {
                                    if (listObj.noBuildInfo === true) {
                                        alertify.set('notifier', 'position', 'top-right');
                                        alertify.warning("WARNING: The provided file does not contain reference information. Please ensure the reference is synonymous" +
                                            "with that in the Genome Build drop-down.");
                                    }
                                    else if (listObj.mismatchBuild === true) {
                                        alertify.set('notifier', 'position', 'top-right');
                                        alertify.warning("WARNING: The provided file has a different reference build than the current selection. Please change the \'Genome Build\' drop-down " +
                                            "or proceed with caution.");
                                    }
                                    self.samples = listObj['samples'];
                                    self.modelInfo.samples = listObj['samples'];
                                    if (self.samples.length === 1) {
                                        self.selectedSample = self.samples[0];
                                        self.modelInfo.selectedSample = self.samples[0];
                                        self.modelInfo.dataSet.setSelectedSample(self.samples[0]);
                                    } else {
                                        self.selectedSample = null;
                                    }
                                    self.modelInfo.vcfs = [vcfUrl];
                                    if (tbiUrl != null) {
                                        self.modelInfo.tbis = [tbiUrl];
                                    }
                                }
                                self.$emit("sample-data-changed");
                                resolve();
                            })
                            .catch((errObj) => {
                                if (errObj && errObj.isBadFile) {
                                    alertify.set('notifier', 'position', 'top-right');
                                    alertify.warning("The entered file " + errObj.badFile + ' or its index could not be opened.');

                                    self.vcfError = true;
                                    self.retrievingIds = false;
                                    self.$emit("sample-data-changed");
                                    reject(errObj);
                                }
                            })
                    }
                });
            },
            onVcfFilesSelected: function (fileSelection) {
                let self = this;
                self.$set(self, "selectedSample", null);
                self.$set(self, "samples", []);
                fileSelection.id = self.modelInfo.id;
                if (self.modelInfo.entryId === 's0') {
                    self.$emit('cohort-vcf-data-changed');
                }
                self.modelInfo.dataSet.promiseVcfFilesSelected(fileSelection)
                    .then(function (data) {
                        if (data && data.sampleNames.length > 0) {
                            self.retrievingIds = false;
                            self.samples = data.sampleNames;
                            self.modelInfo.samples = data.sampleNames;
                            if (self.samples.length === 1) {
                                self.selectedSample = self.samples[0];
                                self.modelInfo.selectedSample = self.samples[0];
                                self.modelInfo.dataSet.setSelectedSample(self.samples[0]);
                            } else {
                                self.selectedSample = null;
                            }
                        }
                        self.vcfError = false;
                        self.$emit("sample-data-changed");
                    })
                    .catch(function (error) {
                        self.vcfError = true;
                        self.retrievingIds = false;
                        self.$emit("sample-data-changed");
                    })
            },
            onSampleSelected: function () {
                let self = this;
                self.modelInfo.selectedSample = self.selectedSample;
                if (self.modelInfo.dataSet) {
                    self.modelInfo.dataSet.setSelectedSample([self.selectedSample]);
                }
                self.$emit("sample-data-changed");
            },
            onBamUrlEntered: function (bamUrl, baiUrl) {
                let self = this;
                self.bamError = false;
                self.checkingBam = true;
                self.$emit("sample-data-changed");

                if (self.modelInfo && self.modelInfo.dataSet) {
                    self.modelInfo.dataSet.onBamUrlEntered(bamUrl, baiUrl, function (success) {
                        self.checkingBam = false;
                        if (success) {
                            self.modelInfo.bams = [bamUrl];
                            if (baiUrl) {
                                self.modelInfo.bais = [baiUrl];
                            }
                        } else {
                            self.bamError = true;
                        }
                        self.$emit("sample-data-changed");
                    })
                }
                if (bamUrl === '') {
                    self.modelInfo.bams = [];
                    self.firstBam = null;
                }
                if (baiUrl === '') {
                    self.modelInfo.bais = null;
                    self.firstBai = null;
                }
            },
            onBamFilesSelected: function (fileSelection) {
                let self = this;
                self.modelInfo.dataSet.promiseBamFilesSelected(fileSelection)
                    .then(function () {
                        self.bamError = false;
                        self.$emit("sample-data-changed");
                    })
                    .catch(function (error) {
                        self.bamError = true;
                        self.$emit("sample-data-changed");
                    })
            },
            removeSample: function () {
                let self = this;
                self.$emit("remove-entry", self.modelInfo.id);
            },
            openSubsetDialog: function () {
                let self = this;

                if (self.isCohortFromHub) {
                    return;
                }

                let selectedSamples = [];
                self.dialogType = 'Subset';
                let dataSet = self.modelInfo.dataSet;

                if (self.subsetSampleIds.length > 0) {
                    selectedSamples = self.subsetSampleIds;
                } else if (dataSet) {
                    selectedSamples = dataSet.getSubsetIds();
                }

                let unselectedSamples = self.getAvailableSamples(selectedSamples, self.dialogType);
                self.$refs.sampleDialogRef.displayDialog(unselectedSamples, selectedSamples);
            },
            openExcludeDialog: function () {
                let self = this;

                if (self.isCohortFromHub) {
                    return;
                }
                let selectedSamples = [];
                self.dialogType = 'Exclude';
                let dataSet = self.modelInfo.dataSet;

                if (self.excludeSampleIds.length > 0) {
                    selectedSamples = self.excludeSampleIds;
                } else if (dataSet) {
                    selectedSamples = dataSet.getExcludeIds();
                }

                let unselectedSamples = self.getAvailableSamples(selectedSamples, self.dialogType);
                self.$refs.sampleDialogRef.displayDialog(unselectedSamples, selectedSamples);
            },
            saveSampleSelection: function (dialogType, selectedSamples) {
                let self = this;

                if (dialogType === 'Subset') {
                    self.subsetSampleIds = selectedSamples;

                    // Trick vue to update reactivity
                    self.subsetSampleIds.push('foo');
                    self.subsetSampleIds.pop();

                    if (selectedSamples.length > 0) {
                        self.subsetSampleDisplay = selectedSamples.join(', ');
                    } else {
                        self.subsetSampleDisplay = "click to edit";
                    }
                    self.modelInfo.subsetSampleIds = selectedSamples;
                    self.modelInfo.dataSet.setSubsetIds(selectedSamples);
                    self.$emit('subset-ids-entered');
                } else if (dialogType === "Exclude") {

                    self.excludeSampleIds = selectedSamples;
                    // Trick vue to update reactivity
                    self.excludeSampleIds.push('foo');
                    self.excludeSampleIds.pop();

                    if (selectedSamples.length > 0) {
                        self.excludeSampleDisplay = selectedSamples.join(', ');
                    } else {
                        self.excludeSampleDisplay = "click to edit";
                    }
                    self.modelInfo.excludeSampleIds = selectedSamples;
                    self.modelInfo.dataSet.setExcludeIds(selectedSamples);
                    self.$emit('exclude-ids-entered');
                }
                self.modelInfo.dataSet.setProbandIds(self.getProbandIds());
            },
            openConfirmationDialog: function() {
                let self = this;
                self.$refs.confirmationDialogRef.displayDialog();
            },
            confirmDeleteTrack: function() {
                let self = this;
                self.removeSample();
            },
            /* Returns unselected samples that are not within the opposite dialogType group.
             * For instance, if the selected dialog is a subset selection dialog,
             * returns all samples that are not already selected in the subset group,
             * or in the exclude samples group.*/
            getAvailableSamples: function (selectedSamples, dialogType) {
                let self = this;

                let allSamples = self.modelInfo.samples;
                let availableSamples = [];

                if (dialogType === 'Subset') {
                    availableSamples = allSamples.filter((sample) => {
                        return !self.excludeSampleIds.includes(sample);
                    })
                } else {
                    availableSamples = allSamples.filter((sample) => {
                        return !self.subsetSampleIds.includes(sample);
                    })
                }
                return availableSamples.filter((sample) => {
                    return !selectedSamples.includes(sample);
                });
            },
            /* Returns all samples IDs that are not excluded. */
            getProbandIds: function () {
                let self = this;
                let allSamples = self.modelInfo.samples;
                return allSamples.filter((sample) => {
                    return !self.excludeSampleIds.includes(sample);
                });
            },
            /* Fills selectedSample & samples fields in both view and model. */
            fillSampleFields: function (samples, sampleToSelect) {
                let self = this;

                self.samples = samples;
                if (sampleToSelect) {
                    self.selectedSample = sampleToSelect;
                    self.modelInfo.model.setSelectedSample(sampleToSelect);
                }
            },
            setLoadingFlags: function (flagState) {
                let self = this;
                self.retrievingIds = flagState;
                if (self.modelInfo.bams.length > 0) {
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
        created: function() {
            this.vcfError = false;
            this.bamError = false;
        },
        mounted: function () {
            let self = this;
            self.samples = self.modelInfo.samples;
            self.subsetSampleIds = self.modelInfo.subsetSampleIds;
            self.excludeSampleIds = self.modelInfo.excludeSampleIds;
            self.isMainCohort = self.dragId === 's0';

            // If we've already filled in the file menu, populate accordingly
            if (self.modelInfo.vcfs) {
                self.firstVcf = self.modelInfo.vcfs[0];
            }
            if (self.modelInfo.tbis) {
                self.firstTbi = self.modelInfo.tbis[0];
            }
            if (self.modelInfo.bams) {
                self.firstBam = self.modelInfo.bams[0];
            }
            if (self.modelInfo.bais) {
                self.firstBai = self.modelInfo.bais[0];
            }

            // Assign side bar label
            if (self.modelInfo.isSampleEntry) {
                self.entryLabel = 'SAMPLE';
            } else {
                self.entryLabel = 'COHORT';
            }
        }
    }
</script>