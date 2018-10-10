<style lang="sass">
    @import ../../../assets/sass/variables

    .menuable__content__active
        > form
            margin-left: 30px
            margin-right: 30px
            max-width: 720px
            font-size: 12px !important

        .input-group.radio
            margin-top: 0px
            margin-bottom: 0px

        .radio label
            line-height: 25px

        .input-group.radio-group
            padding-top: 0px

        .input-group__selections__comma
            font-size: 13px

        .input-group.input-group--selection-controls.switch
            label
                font-weight: normal
                font-size: 12px
                padding-left: 5px

    #files-form

        .radio-group
            .input-group__input
                min-height: 25px

        .loader
            display: inline-block
            margin-right: 2px

            img
                width: 20px
                height: 20px

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

<template>
    <v-menu
            id="files-menu"
            offset-y
            :close-on-content-click="false"
            :nudge-width="500"
            v-model="showFilesMenu">
        <v-btn id="files-menu-button" flat slot="activator">
            Files
        </v-btn>
        <v-form id="files-form">
            <v-layout row wrap class="mt-2">
                <v-flex xs4 class="mt-2">
                    <v-container>
                        <v-switch label="Time Series" hide-details v-model="timeSeriesMode">
                        </v-switch>
                        <v-switch label="Separate index URL" hide-details v-model="separateUrlForIndex">
                        </v-switch>
                    </v-container>
                </v-flex>

                <v-flex xs2 class="pl-2 pr-0">
                    <v-select
                            label="Species"
                            hide-details
                            v-model="speciesName"
                            :items="speciesList"
                    ></v-select>
                </v-flex>

                <v-flex xs2 class="pl-2 pr-0">
                    <v-select
                            label="Genome Build"
                            hide-details
                            v-model="buildName"
                            :items="buildList"
                    ></v-select>
                </v-flex>

                <v-flex xs3 class="pr-0">
                    <v-select
                            :items="demoActions"
                            item-value="value"
                            item-text="display"
                            @input="onLoadDemoData"
                            v-model="demoAction"
                            overflow
                            hide-details
                            label="Demo data"></v-select>
                </v-flex>
                <draggable
                        :options="{handle: '.drag-handle'}"
                        @end="onDragEnd">
                    <v-flex xs12
                            v-for="sample in samples"
                            :key="sample"
                            :id="sample"
                            v-if="modelInfoMap && modelInfoMap[sample] && Object.keys(modelInfoMap[sample]).length > 0">
                        <sample-data
                                ref="sampleDataRef"
                                v-if="modelInfoMap && modelInfoMap[sample] && Object.keys(modelInfoMap[sample]).length > 0"
                                :modelInfo="modelInfoMap[sample]"
                                :timeSeriesMode="timeSeriesMode"
                                :dragId="sample"
                                :arrIndex=samples.indexOf(sample)
                                :separateUrlForIndex="separateUrlForIndex"
                                @sample-data-changed="validate"
                                @samples-available="onSamplesAvailable"
                                @remove-sample="removeSample">
                        </sample-data>
                    </v-flex>
                </draggable>
                <v-flex xs6 class="mt-2 text-xs-left">
                    <v-btn small outline fab color="appColor"
                           @click="promiseAddSample">
                        <v-icon>add</v-icon>
                    </v-btn>
                </v-flex>
                <v-flex xs6 class="mt-2 text-xs-right">
                    <div class="loader" v-show="inProgress">
                        <img src="../../../assets/images/wheel.gif">
                    </div>
                    <v-btn
                            @click="onLoad"
                            :disabled="!isValid">
                        Load
                    </v-btn>

                    <v-btn @click="onCancel">
                        Cancel
                    </v-btn>
                </v-flex>
            </v-layout>
        </v-form>
    </v-menu>
</template>
<script>

    import SampleData from '../partials/SampleData.vue'
    import draggable from 'vuedraggable'

    export default {
        name: 'files-menu',
        components: {
            SampleData,
            draggable
        },
        props: {
            cohortModel: null
        },
        data() {
            return {
                showFilesMenu: false,
                isValid: false,
                speciesList: [],
                speciesName: null,
                buildName: null,
                activeTab: null,
                modelInfoMap: {},
                samples: [],
                demoActions: [
                    {'display': 'Duo', 'value': 'dual'},
                    {'display': 'Time Series', 'value': 'timeSeries'}
                ],
                demoAction: null,
                timeSeriesMode: false,
                separateUrlForIndex: false,
                inProgress: false,
                stateUnchanged: true,
                arrId: 0
            }
        },
        watch: {
            showFilesMenu: function () {
                if (this.cohortModel && this.showFilesMenu) {
                    this.init();
                }
            },
            timeSeriesMode: function () {
                this.onModeChanged();
            }
        },
        methods: {
            promiseAddSample: function (isTumor = true, stateChanged = true) {
                let self = this;
                if (stateChanged) {
                    self.stateUnchanged = false;
                }

                return new Promise((resolve, reject) => {
                    let newId = self.findNextAvailableId();
                    self.samples.push(newId);

                    // Add entry to map
                    let newInfo = {};
                    newInfo.isTumor = isTumor;
                    newInfo.id = newId;
                    newInfo.selectedSample = '';
                    newInfo.samples = [];
                    newInfo.displayName = '';
                    newInfo.vcf = null;
                    newInfo.bam = null;
                    newInfo.tbi = null;
                    newInfo.bai = null;
                    newInfo.order = self.samples.length - 1;
                    self.modelInfoMap[newId] = newInfo;

                    // Add sample model for new entry
                    self.cohortModel.promiseAddSample(newInfo)
                        .then((model) => {
                            newInfo.model = model;
                            resolve();
                        })
                        .catch(() => {
                            reject('There was a problem adding sample.');
                        });
                });
            },
            findNextAvailableId: function () {
                let self = this;
                let ids = [];
                let arrLength = self.samples.length;
                for (let i = 0; i < arrLength; i++) {
                    ids.push(parseInt(self.samples[i].substring(1)));
                }
                ids.sort();
                let nextVal = arrLength;
                for (let i = 0; i < arrLength - 1; i++) {
                    if (ids[i + 1] - ids[i] > 1) {
                        nextVal = i + 1;
                        break;
                    }
                }
                return 's' + nextVal;
            },
            onLoad: function () {
                let self = this;
                self.inProgress = true;

                self.cohortModel.genomeBuildHelper.setCurrentBuild(self.buildName);
                self.cohortModel.genomeBuildHelper.setCurrentSpecies(self.speciesName);

                self.cohortModel.promiseAddClinvarSample()
                    .then(function () {
                        self.cohortModel.setTumorInfo(true);
                        self.cohortModel.isLoaded = true;
                        self.cohortModel.getCanonicalModels().forEach(function (model) {
                            if (model.displayName == null || model.displayName.length === 0) {
                                model.displayName = model.id;
                            }
                        });
                    })
                    .then(function () {
                        let performAnalyzeAll = self.demoAction ? true : false;
                        self.inProgress = false;

                        self.$emit("on-files-loaded", performAnalyzeAll);
                        self.showFilesMenu = false;
                    })
            },
            onCancel: function () {
                this.showFilesMenu = false;
            },
            onModeChanged: function () {
                let self = this;
                if (self.timeSeriesMode) {
                    self.promiseInitMoreTumors()
                        .then(() => {
                            self.moveNormalToFirstSlot();
                            self.setTumorStatusAllSamples(self.demoAction != null);
                        });
                } else {
                    self.removeMoreTumors();
                }

                //this.validate();  TODO: do I need to do this again when switching?
            },
            /* Moves sample 's0' to first slot of samples array */
            moveNormalToFirstSlot: function () {
                let self = this;
                if (self.samples[0] !== 's0') {
                    let oldIndex = self.samples.indexOf('s0');
                    let newIndex = 0;
                    self.updateSampleOrder(oldIndex, newIndex);
                }
            },
            /* Sets first entry in samples array to normal, sets remaining to tumor */
            setTumorStatusAllSamples: function (demoMode = false) {
                let self = this;

                if (!demoMode) {
                    if (self.$refs.sampleDataRef != null) {
                        self.$refs.sampleDataRef.forEach((ref) => {
                            if (ref.dragId === 's0') {
                                ref.setTumorStatus(false);
                            }
                            else {
                                ref.setTumorStatus(true);
                            }
                        });
                    }
                }
            },
            onLoadDemoData: function () {
                let self = this;

                // Flip toggle
                if (self.demoAction === 'timeSeries') {
                    self.timeSeriesMode = true;
                } else {
                    self.timeSeriesMode = false;
                }

                // Reset modelInfoMap to get rid of any added info extras
                self.modelInfoMap = {};

                // Add relevant infos to map and ids to sample array
                let idList = [];
                self.cohortModel.demoModelInfos[self.demoAction].forEach(function (modelInfo) {
                    let id = modelInfo.id;
                    idList.push(id);
                    self.modelInfoMap[id] = modelInfo;
                    if (self.samples.indexOf(id) < 0) {
                        self.samples.push(id);
                    }
                });

                // Ensure models are synonymous with infos
                self.cohortModel.removeExtraModels(idList);
                let addPromises = [];
                for (let i = 0; i < self.samples.length; i++) {
                    let currKey = self.samples[i];
                    if (self.cohortModel.getModel(currKey) == null) {
                        let corrInfo = self.modelInfoMap[currKey];
                        addPromises.push(self.cohortModel.promiseAddSample(corrInfo)); // Don't need to set model prop here, do below
                    }
                }

                Promise.all(addPromises)
                    .then(() => {
                        self.cohortModel.getCanonicalModels().forEach(function (model) {
                            self.promiseSetModel(model);
                        });
                    })
            },
            /* Sets corresponding model for each info object; */
            promiseSetModel: function (model) {
                let self = this;
                return new Promise(function (resolve, reject) {

                    // Assign model prop in info object to model
                    let theModel = model;
                    let theModelInfo = self.modelInfoMap[theModel.id];
                    theModelInfo.model = theModel;

                    // Trigger on vcf check in model
                    theModel.onVcfUrlEntered(theModelInfo.vcf, null, function (success, sampleNames) {
                        if (success) {

                            // Set samples prop
                            theModelInfo.samples = sampleNames;
                            self.$refs.sampleDataRef.forEach(function (ref) {
                                debugger;   // TODO: why aren't sample drop downs appearing for all samples
                                if (ref.modelInfo.id === theModel.id) {
                                    // Set selected sample in model and in child cmpnt
                                    theModel.selectedSample = theModelInfo.selectedSample;
                                    ref.updateSamples(sampleNames, theModelInfo.selectedSample);

                                    // Set display name in model
                                    theModel.displayName = theModelInfo.displayName ? theModelInfo.displayName : theModelInfo.selectedSample;
                                    self.validate();
                                }
                            });
                            theModel.onBamUrlEntered(theModelInfo.bam, null, function (success) {
                                self.validate();
                                if (success) {
                                    resolve();
                                } else {
                                    reject();
                                }
                            })
                        } else {
                            reject();
                        }
                    })
                })
            },
            validate: function () {
                this.isValid = true;

                let keyList = Object.keys(self.modelInfoMap);
                for (let i = 0; i < keyList.length; i++) {
                    let currKey = keyList[i];
                    this.isValid &= (this.modelInfoMap[currKey] != null && this.modelInfoMap[currKey].model.isReadyToLoad());
                }
            },
            onSamplesAvailable: function (id, samples) {

                // TODO: mapping samples to each slot
                // if (relationship === 'proband') {
                //     this.probandSamples = samples;
                //     if (this.cohortModel.sampleMapSibs.affected && this.cohortModel.sampleMapSibs.affected.length > 0) {
                //         this.affectedSibs = this.cohortModel.sampleMapSibs.affected.map(function (sampleModel) {
                //             return sampleModel.selectedSample;
                //         })
                //     }
                //     if (this.cohortModel.sampleMapSibs.unaffected && this.cohortModel.sampleMapSibs.unaffected.length > 0) {
                //         this.unaffectedSibs = this.cohortModel.sampleMapSibs.unaffected.map(function (sampleModel) {
                //             return sampleModel.selectedSample;
                //         })
                //     }
                // }
            },
            getModel: function (id) {
                let theModel = null;
                if (this.cohortModel) {
                    let modelObject = this.cohortModel.sampleMap[id];
                    if (modelObject) {
                        theModel = modelObject.model;
                    }
                }
                return theModel;
            },
            init: function () {
                let self = this;
                if (self.cohortModel && self.cohortModel.getCanonicalModels().length > 0) {
                    self.initModelInfo();
                } else {
                    self.promiseAddSample(false, false)
                        .then(() => {
                            self.promiseAddSample(true, false);
                        });
                }
            },
            initModelInfo: function () {
                let self = this;
                self.separateUrlForIndex = false;
                self.timeSeries = false;
                self.cohortModel.getCanonicalModels().forEach(function (model) {
                    let modelInfo = self.modelInfoMap[model.id];
                    if (modelInfo == null) {
                        modelInfo = {};
                        modelInfo.displayName = model.getDisplayName();
                        modelInfo.isTumor = model.getTumorStatus();
                        modelInfo.order = model.order;
                        modelInfo.vcf = model.vcf ? model.vcf.getVcfURL() : null;
                        modelInfo.tbi = model.vcf ? model.vcf.getTbiURL() : null;
                        modelInfo.bam = model.bam ? model.bam.bamUri : null;
                        modelInfo.bai = model.bam ? model.bam.baiUri : null;
                        modelInfo.model = model;
                        if (modelInfo.tbi || modelInfo.bai) {
                            self.separateUrlForIndex = true;
                        }
                        let key = 's' + self.samples.length;
                        self.$set(self.modelInfoMap, key, modelInfo);
                    }
                })
            },
            promiseInitMoreTumors: function () {
                let self = this;

                return new Promise((resolve, reject) => {
                    let promises = [];
                    if (self.stateUnchanged && self.samples.length === 2) {
                        for (let i = 0; i < 2; i++) {
                            promises.push(self.promiseAddSample(true, false));
                        }
                    }
                    Promise.all(promises)
                        .then(() => {
                            resolve();
                        });
                });
            },
            removeMoreTumors: function () {
                let self = this;
                if (self.stateUnchanged) {
                    let sampleLength = self.samples.length;
                    for (let i = sampleLength - 1; i > 1; i--) {
                        self.removeSample(i, false);
                    }
                }
            },
            removeSample: function (sampleIndex, stateChanged = true) {
                let self = this;
                if (stateChanged) {
                    self.stateUnchanged = false;
                }

                // If we're deleting the first one on time series mode, must enforce next one normal
                if (self.timeSeriesMode && sampleIndex === 0) {
                    let key = self.samples[1];
                    self.modelInfoMap[key].isTumor = false;
                    self.modelInfoMap[key].model.isTumor = false;
                }

                // Update order for any samples after deleted one
                for (let i = sampleIndex + 1; i < self.samples.length; i++) {
                    let key = self.samples[i];
                    self.modelInfoMap[key].order--;
                    self.modelInfoMap[key].model.order--;
                }

                // Remove sample and delete info
                let id = self.samples[sampleIndex];
                self.samples.splice(sampleIndex, 1);
                delete self.modelInfoMap[id];
                self.cohortModel.removeSample(id);

                // Update label
                if (self.$refs.sampleDataRef != null) {
                    self.$refs.sampleDataRef.forEach((ref) => {
                        if (ref.modelInfo.order >= sampleIndex) {
                            ref.updateLabel();
                        }
                    });
                }

                // Debugging
                // console.log(self.samples.join(','));
                // let orderArr = [];
                // for (let i = 0; i < self.samples.length; i++) {
                //     orderArr.push(self.modelInfoMap[self.samples[i]].order);
                // }
                // console.log(orderArr.join(','));
            },
            onDragEnd: function (evt) {
                let self = this;
                self.stateUnchanged = false;

                let oldIndex = evt.oldIndex;
                let newIndex = evt.newIndex;

                // Update order and isTumor props
                self.updateSampleOrder(oldIndex, newIndex);
            },
            updateSampleOrder: function (oldIndex, newIndex) {
                let self = this;
                if (self.$refs.sampleDataRef != null) {
                    self.$refs.sampleDataRef.forEach((ref) => {
                        ref.updateOrder(oldIndex, newIndex);
                    });
                }
                // Order samples arrays for view and model accordingly
                if (oldIndex < newIndex) {
                    self.samples.splice(newIndex + 1, 0, self.samples[oldIndex]);
                    self.samples.splice(oldIndex, 1);
                } else if (newIndex < oldIndex) {
                    self.samples.splice(newIndex, 0, self.samples[oldIndex]);
                    self.samples.splice(oldIndex + 1, 1);
                }
                self.cohortModel.updateSampleOrder(oldIndex, newIndex);
            }
        },
        computed: {
            buildList: function () {
                if (this.speciesName && this.cohortModel.genomeBuildHelper) {
                    return this.cohortModel.genomeBuildHelper.speciesToBuilds[this.speciesName].map(function (gb) {
                        return gb.name;
                    })
                } else {
                    return [];
                }
            }
        },
        created: function () {
        },
        mounted: function () {
            if (this.cohortModel) {
                this.speciesName = this.cohortModel.genomeBuildHelper.getCurrentSpeciesName();
                this.buildName = this.cohortModel.genomeBuildHelper.getCurrentBuildName();
                this.speciesList = this.cohortModel.genomeBuildHelper.speciesList.map(function (sp) {
                    return sp.name;
                }).filter(function (name) {
                    return name === 'Human';
                });
            }


        }
    }
</script>
