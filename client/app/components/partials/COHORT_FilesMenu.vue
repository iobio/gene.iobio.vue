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

    .menu-selection
        .btn__content
            color: #888888 !important
            font-weight: 400
            font-size: 14px

</style>
<style scoped>
    .file-select > .select-button {
        text-align: left;
        padding-left: 14px;
        cursor: pointer;
        font-weight: 400;
        color: #888888;
    }

    /* Don't forget to hide the original file input! */
    .file-select > input[type="file"] {
        display: none;
    }
</style>

<template>
    <v-menu
            id="files-menu"
            offset-y
            :close-on-content-click="false"
            :close-on-click="false"
            :nudge-width="500"
            v-model="showFilesMenu">
        <v-btn id="files-menu-button" flat slot="activator">
            Files
        </v-btn>
        <v-form id="files-form">
            <v-layout row wrap class="mt-2">
                <v-flex xs6 class="mt-2">
                    <v-container>
                        <v-switch label="Separate index URL"
                                  hide-details
                                  color="cohortNavy"
                                  v-model="separateUrlForIndex">
                        </v-switch>
                    </v-container>
                </v-flex>

                <v-flex xs3 class="pl-2 pr-0">
                    <v-select
                            label="Genome Build"
                            hide-details
                            v-model="buildName"
                            :disabled="launchedFromHub"
                            :items="buildList"
                            color="cohortNavy"
                            @change="updateBuildAndValidate"
                    ></v-select>
                </v-flex>

                <v-flex xs3 class="pr-0 pt-2">
                    <v-menu>
                        <v-btn outline
                               color="cohortNavy"
                               slot="activator">
                            Auto-Fill
                            <v-icon small>keyboard_arrow_down</v-icon>
                        </v-btn>
                        <v-list>
                            <v-list-tile>
                                <v-list-tile-action>
                                    <v-btn flat v-bind:class="'menu-selection'"
                                           @click="onAutoLoad(false)">
                                        {{ autofill.display }}
                                    </v-btn>
                                </v-list-tile-action>
                            </v-list-tile>
                            <v-list-tile>
                                <label class="file-select">
                                    <!-- We can't use a normal button element here, it would become the target of the label. -->
                                    <div id="uploadButton" class="select-button">
                                        <span>Upload Config</span>
                                    </div>
                                    <!-- Hidden file input -->
                                    <input type="file" @change="onUploadCustomFile"/>
                                </label>
                            </v-list-tile>
                            <v-list-tile>
                                <v-list-tile-action>
                                    <v-btn flat :disabled="!isValid" v-bind:class="'menu-selection'"
                                           @click="onDownloadCustomFile">
                                        Download Config
                                    </v-btn>
                                </v-list-tile-action>
                            </v-list-tile>
                        </v-list>
                    </v-menu>
                </v-flex>
                <v-flex xs12
                        v-for="entry in entryIds"
                        :key="entry"
                        :id="entry"
                        v-if="modelInfoMap && modelInfoMap[entry]">
                    <entry-data :id="entry"
                                ref="entryDataRef"
                                v-if="modelInfoMap && modelInfoMap[entry]"
                                :modelInfo="modelInfoMap[entry]"
                                :dragId="entry"
                                :arrIndex=entryIds.indexOf(entry)
                                :separateUrlForIndex="separateUrlForIndex"
                                :launchedFromHub="launchedFromHub"
                                :isSampleEntry="modelInfoMap[entry].isSampleEntry"
                                @sample-data-changed="validate"
                                @cohort-vcf-data-changed="setCohortVcfChangedFlag"
                                @remove-entry="removeEntry"
                                @subset-ids-entered="subsetIdsEntered"
                                @exclude-ids-entered="excludeIdsEntered">
                    </entry-data>
                </v-flex>
                <v-flex xs6 class="mt-2 text-xs-left">
                    <v-btn small outline fab color="cohortNavy"
                           @click="promiseAddEntry">
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

    import EntryData from './EntryData.vue'
    import draggable from 'vuedraggable'

    export default {
        name: 'files-menu',
        components: {
            EntryData,
            draggable
        },
        props: {
            variantModel: null,
            launchedFromHub: false
        },
        data() {
            return {
                showFilesMenu: false,
                isValid: false,
                speciesList: [],
                speciesName: null,
                buildName: null,
                activeTab: null,
                cohortVcfDataChanged: false,
                cohortAnyDataChanged: false,

                modelInfoMap: {},
                entryIds: [],       // One per file menu entry

                autofill: {'display': 'Demo Data', 'value': 'cohort'},
                autofillAction: null,
                separateUrlForIndex: false,
                inProgress: false,
                stateUnchanged: true,
                arrId: 0,
                debugMe: false,
                inputClass: 'fileSelect',
                loadDemoFromWelcome: false
            }
        },
        watch: {
            showFilesMenu: function () {
                if (this.variantModel && this.showFilesMenu) {
                    this.init();
                }
            }
        },
        methods: {
            promiseAddEntry: function (stateChanged = true, isSampleEntry = true) {
                let self = this;
                if (stateChanged) {
                    self.stateUnchanged = false;
                }

                // If we've loaded a demo, and they change it, deselect demo drop-down
                if (self.autofillAction != null) {
                    self.autofillAction = null;
                }

                return new Promise((resolve, reject) => {
                    let newId = self.findNextAvailableId();
                    self.entryIds.push(newId);

                    // Add entry to map
                    let newInfo = {};
                    newInfo.id = newId;
                    newInfo.displayName = '';
                    newInfo.samples = [];       // All samples in vcf provided
                    newInfo.subsetSampleIds = [];
                    newInfo.excludeSampleIds = [];
                    newInfo.selectedSample = null;  // When we have a sample model entry
                    newInfo.vcfs = [];
                    newInfo.tbis = null;
                    newInfo.bams = [];
                    newInfo.bais = null;
                    newInfo.isSampleEntry = isSampleEntry;
                    self.modelInfoMap[newId] = newInfo;

                    // Add sample model for new entry
                    if (self.launchedFromHub && newId === 's0') {
                        resolve();
                    } else {
                        self.variantModel.promiseAddEntry(newInfo, isSampleEntry)
                            .then((dataSet) => {
                                newInfo.dataSet = dataSet;
                                resolve();
                            })
                            .catch((error) => {
                                reject('There was a problem adding sample: ' + error);
                            });
                    }
                });
            },
            findNextAvailableId: function () {
                let self = this;
                let ids = [];
                let arrLength = self.entryIds.length;
                for (let i = 0; i < arrLength; i++) {
                    ids.push(parseInt(self.entryIds[i].substring(1)));
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

                self.variantModel.genomeBuildHelper.setCurrentBuild(self.buildName);

                // Set display chips for variant
                for (var infoName in self.modelInfoMap) {
                    if (!(infoName === 's0' && self.launchedFromHub)) {
                        let currInfo = self.modelInfoMap[infoName];
                        if (currInfo.dataSet && currInfo.dataSet.trackName == null || currInfo.dataSet.trackName.length === 0) {
                            currInfo.dataSet.trackName = currInfo.dataSet.id;
                        }

                        let displayName = currInfo.displayName.length > 0 ? currInfo.displayName : 'Local File';
                        currInfo.dataSet.displayName = displayName;
                        currInfo.dataSet.clearDisplayChips();
                        currInfo.dataSet.setDisplayChips(displayName);
                    }
                }

                //let performAnalyzeAll = self.autofillAction ? true : false;
                self.inProgress = false;

                let probandN, subsetN = 0;
                if (!self.launchedFromHub) {
                    let cohortInfo = self.modelInfoMap['s0'];
                    if (cohortInfo == null) {
                        console.log('Could not detect local cohort info for dynamic bar chart labeling.');
                    } else {
                        probandN = cohortInfo.samples.length;
                        subsetN = cohortInfo.subsetSampleIds.length;
                    }
                }

                self.$emit("on-files-loaded", probandN, subsetN, self.cohortVcfDataChanged);
                self.showFilesMenu = false;
            },
            onCancel: function () {
                this.showFilesMenu = false;
            },
            onUploadCustomFile: function (evt) {
                let self = this;

                let customFile = evt.target.files[0];
                self.variantModel.promiseInitCustomFile(customFile)
                    .then((obj) => {
                        if (!obj) {
                            alertify.set('notifier', 'position', 'top-right');
                            alertify.warning("The selected configuration file is malformed or incompatible. Please try again.");
                        }
                        self.onAutoLoad(obj.infos, obj.refBuild);
                    });
            },
            onDownloadCustomFile: function () {
                let self = this;

                // JSON.stringify
                let exportObj = {};
                let entryArr = [];
                let infoValues = [];
                if (self.launchedFromHub) {
                    self.entryIds.forEach((id) => {
                        if (id !== 's0') {
                            let infoVal = self.modelInfoMap[id];
                            infoValues.push(infoVal);
                        }
                    });
                } else {
                    infoValues = Object.values(self.modelInfoMap);
                }
                infoValues.forEach((val) => {
                    let newVal = {};
                    newVal.id = val.id;
                    newVal.displayName = val.displayName;
                    newVal.samples = val.samples;
                    newVal.subsetSampleIds = val.subsetSampleIds;
                    newVal.excludeSampleIds = val.excludeSampleIds;
                    newVal.selectedSample = val.selectedSample;
                    newVal.vcfs = val.vcfs;
                    newVal.tbis = val.tbis;
                    newVal.bams = val.bams;
                    newVal.bais = val.bais;
                    newVal.isSampleEntry = val.isSampleEntry;
                    entryArr.push(newVal);
                });

                exportObj['entries'] = entryArr;
                exportObj['refBuild'] = self.buildName;
                const exportFile = JSON.stringify(exportObj);
                const blob = new Blob([exportFile], {type: 'text/plain'});
                const e = document.createEvent('MouseEvents'),
                    a = document.createElement('a');
                a.download = "cohort_gene_config.json";
                a.href = window.URL.createObjectURL(blob);
                a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
                e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                a.dispatchEvent(e);
            },
            onAutoLoad: function (customInfos = false, refBuild = "") {
                let self = this;

                return new Promise((resolve, reject) => {
                    let infosToLoad = null;
                    if (!customInfos) {
                        self.separateUrlForIndex = false;
                        infosToLoad = self.variantModel.getDemoInfo(self.launchedFromHub);
                        if (!self.launchedFromHub) {
                            self.buildName = 'GRCh37';
                            self.variantModel.genomeBuildHelper.setCurrentBuild(self.buildName);
                        }
                    } else {
                        infosToLoad = customInfos;
                        self.separateUrlForIndex = self.checkCustomIndex(customInfos);
                    }

                    // Reset modelInfoMap to get rid of any added info extras
                    if (self.launchedFromHub) {
                        self.entryIds.forEach((id) => {
                            if (id !== 's0') {
                                delete self.modelInfoMap[id];
                            }
                        })
                    } else {
                        self.modelInfoMap = {};
                    }

                    // Add relevant infos to map and ids to sample array in correct order
                    let idList = [];
                    let arrIndex = self.launchedFromHub ? 1 : 0;
                    infosToLoad.forEach(function (modelInfo) {
                        let id = modelInfo.id;

                        // Have to ignore s0 if we've launched from Hub and uploaded a config w/ a cohort entry
                        if (!(self.launchedFromHub && id === 's0')) {
                            idList.push(id);
                            self.modelInfoMap[id] = modelInfo;
                            self.entryIds[arrIndex] = modelInfo.id;
                            arrIndex++;
                        }
                    });

                    // Fool vue into forcing view update
                    self.entryIds.push('foo');
                    self.entryIds.pop();

                    // Get rid of any remaining extra samples names in array
                    if (self.entryIds.length > arrIndex) {
                        let numToDelete = self.entryIds.length - arrIndex;
                        self.entryIds.splice(arrIndex, numToDelete);
                    }

                    // Ensure models are synonymous with infos and in same order as view
                    self.variantModel.removeExtraneousDataSets(idList);
                    let addPromises = [];
                    for (let i = 0; i < self.entryIds.length; i++) {
                        let currId = self.entryIds[i];
                        let currDataSet = self.variantModel.getDataSet(currId);
                        if (currDataSet == null) {
                            let corrInfo = self.modelInfoMap[currId];
                            let p = self.variantModel.promiseAddEntry(corrInfo, corrInfo.isSampleEntry); // Don't need to assign to map, done in promiseSetModel below
                            addPromises.push(p);
                        }
                    }

                    // Set ref build if different from current drop-down selection
                    if (refBuild !== '' && refBuild !== self.buildName && !self.launchedFromHub) {
                        self.buildName = refBuild;
                        self.variantModel.genomeBuildHelper.setCurrentBuild(self.buildName);
                    }

                    Promise.all(addPromises)
                        .then(() => {
                            // Turn on loading spinners
                            for (let i = self.launchedFromHub ? 1 : 0; i < self.$refs.entryDataRef.length; i++) {
                                self.$refs.entryDataRef[i].setLoadingFlags(true);
                            }

                            let setPromises = [];
                            self.variantModel.getAllDataSets().forEach(function (dataSet) {
                                if (!(self.launchedFromHub && dataSet.entryId === 's0')) {
                                    setPromises.push(self.promiseSetModel(dataSet));
                                }
                            });
                            Promise.all(setPromises)
                                .then(() => {
                                    resolve();
                                })
                                .catch((error) => {
                                    console.log('Promise setting model on auto load: ' + error);
                                });
                        })
                        .catch((error) => {
                            console.log('Something went wrong with autoload: ' + error);
                            reject(error);
                        });
                });
            },
            checkCustomIndex: function (infos) {
                let areSeparate = false;
                infos.forEach((info) => {
                    if (info.bais != null || info.tbis != null) {
                        areSeparate = true;
                    }
                });
                return areSeparate;
            },
            /* Sets corresponding data set for each info object, pulls out samples for associated vcf, validates all files. */
            promiseSetModel: function (dataSet) {
                let self = this;
                return new Promise(function (resolve, reject) {

                    // Assign data set prop in info object to model
                    let theDataSet = dataSet;
                    let theModelInfo = self.modelInfoMap[theDataSet.entryId];
                    theModelInfo.dataSet = theDataSet;

                    // Check files in data set model
                    let nameList = [theModelInfo.id];
                    let displayNameList = [theModelInfo.displayName !== '' ? theModelInfo.displayName : 'Local File'];

                    // Check all vcfs at same time for single entry
                    theDataSet.onVcfUrlEntered(nameList, theModelInfo.vcfs, theModelInfo.tbis, displayNameList)
                        .then((entObj) => {
                            if (entObj) {
                                // Set samples prop
                                theModelInfo.samples = entObj.samples;
                                for (let i = 0; i < self.$refs.entryDataRef.length; i++) {
                                    let currEntryRef = self.$refs.entryDataRef[i];
                                    if (currEntryRef.modelInfo.id === theDataSet.entryId) {
                                        // Set selected sample in model and in child cmpnt
                                        if (theModelInfo.isSampleEntry) {
                                            theDataSet.setSelectedSample(theModelInfo.selectedSample);
                                        }
                                        // Set view state
                                        currEntryRef.fillSampleFields(theModelInfo.samples, theModelInfo.selectedSample, theModelInfo.subsetSampleIds, theModelInfo.excludeSampleIds);
                                        currEntryRef.setLoadingFlags(false);
                                        self.validate();
                                    }
                                }
                                if (theDataSet.entryId !== 's0' && theDataSet.entryId !== 'Hub') {
                                    let firstBam = theModelInfo.bams ? theModelInfo.bams[0] : '';
                                    let firstBai = theModelInfo.bais ? theModelInfo.bais[0] : null;
                                    theDataSet.onBamUrlEntered(firstBam, firstBai, function (success) {
                                        self.validate();
                                        if (success) {
                                            resolve();
                                        } else {
                                            reject('No bam to check');
                                        }
                                    })
                                } else {
                                    // No bams to check, just return
                                    resolve();
                                }
                            } else {
                                // Turn off loading spinners
                                for (let i = 0; i < self.$refs.entryDataRef.length; i++) {
                                    self.$refs.entryDataRef[i].setLoadingFlags(false);
                                }
                                reject('No vcf to check');
                            }
                        })
                        .catch((error) => {
                            if (error.mismatchBuild === true) {
                                let retryUrlPs = [];
                                if (self.$refs.entryDataRef) {
                                    self.$refs.entryDataRef.forEach((entryRef) => {
                                        if (!(self.launchedFromHub && entryRef.dragId === 's0')) {
                                            let p = new Promise((resolve) => {
                                                entryRef.retryEnteredUrls()
                                                    .then(() => {
                                                        resolve();
                                                    })
                                                    .catch((error) => {
                                                        console.log(error);
                                                    })
                                            });
                                            retryUrlPs.push(p);
                                        }
                                    })
                                }
                                Promise.all(retryUrlPs)
                                    .then(() => {
                                        // Turn off loading spinners
                                        for (let i = 0; i < self.$refs.entryDataRef.length; i++) {
                                            self.$refs.entryDataRef[i].setLoadingFlags(false);
                                        }
                                        resolve();
                                    });
                                console.log('Mismatch build detected');
                            } else {
                                // Otherwise pass on the error
                                console.log(error);
                                reject(error);
                            }
                            self.isValid = false;
                        })
                })
            },
            validate: function () {
                let self = this;
                self.isValid = true;

                let keyList = Object.keys(self.modelInfoMap);
                for (let i = 0; i < keyList.length; i++) {
                    let currKey = keyList[i];
                    if (!(currKey === 's0' && self.launchedFromHub)) {
                        self.isValid &= (self.modelInfoMap[currKey] != null && self.modelInfoMap[currKey].dataSet.isReadyToLoad());
                    }
                }
            },
            setCohortVcfChangedFlag: function () {
                let self = this;
                self.cohortVcfDataChanged = true;
            },
            // Called each time files menu opened
            init: function () {
                let self = this;
                // If we already have model information from Hub, we want to display that in the file loader
                if (self.variantModel && self.variantModel.getAllDataSets().length > 0 && !self.loadDemoFromWelcome) {
                    self.initModelInfo();
                    // Otherwise add single entry for initial launch
                } else {
                    self.promiseAddEntry(false, false)
                        .then(() => {
                            // If we've clicked run w/ demo data on welcome screen, want to get that process going
                            if (self.loadDemoFromWelcome) {
                                self.onAutoLoad(false)
                                    .then(() => {
                                        self.loadDemoFromWelcome = false;
                                        self.onLoad();
                                    })
                            }
                        })
                }
            },
            initModelInfo: function () {
                let self = this;
                self.separateUrlForIndex = false;
                self.variantModel.getAllDataSets().forEach((dataSet) => {

                    let modelInfo = self.modelInfoMap[dataSet.entryId];
                    if (modelInfo == null) {
                        modelInfo = {};
                        modelInfo.id = dataSet.entryId;
                        modelInfo.displayName = self.launchedFromHub ? 'Mosaic Selection' : dataSet.displayName;
                        modelInfo.sampleIds = dataSet.getSubsetIds();
                        modelInfo.excludeIds = dataSet.getExcludeIds();
                        modelInfo.vcfs = dataSet.vcfs;
                        modelInfo.tbis = dataSet.tbis;
                        modelInfo.bams = dataSet.bams;
                        modelInfo.bais = dataSet.bais;
                        modelInfo.dataSet = dataSet;
                        if (modelInfo.tbi || modelInfo.bai) {
                            self.separateUrlForIndex = true;
                        }
                        modelInfo.isSampleEntry = dataSet.isSingleSample;
                        let key = 's' + self.entryIds.length;
                        self.entryIds.push(key);
                        self.$set(self.modelInfoMap, key, modelInfo);
                    }
                })
            },
            removeEntry: function (entryId, stateChanged = true, demoCall = false) {
                let self = this;
                if (stateChanged) {
                    self.stateUnchanged = false;
                }

                // If we've selected a demo, and then changed it, deselect dropdown
                if (self.autofillAction != null && !demoCall) {
                    self.autofillAction = null;
                }

                // Remove sample and delete info
                let entryIndex = self.entryIds.indexOf(entryId);
                self.entryIds.splice(entryIndex, 1);
                delete self.modelInfoMap[entryId];
                self.variantModel.removeEntry(entryId);
            },
            subsetIdsEntered: function () {
                let self = this;
                self.validate();
            },
            excludeIdsEntered: function () {
                let self = this;
                self.validate();
            },
            openFileSelection: function() {
                let self = this;
                self.showFilesMenu = true;
                $('#uploadButton').click();
            },
            closeFileMenu: function() {
                let self = this;
                self.loadDemoFromWelcome = true;
                self.showFilesMenu = false;
            },
            promiseLoadDemoFromWelcome: function() {
                let self = this;
                self.loadDemoFromWelcome = true;
                self.showFilesMenu = true;
            },
            updateBuildAndValidate: function(newVal) {
                let self = this;
                if (newVal !== self.buildName) {    // self.buildName still oldVal at this point
                    self.variantModel.genomeBuildHelper.setCurrentBuild(newVal);
                    if (self.$refs.entryDataRef) {
                        self.$refs.entryDataRef.forEach((entryRef) => {
                            if (!(self.launchedFromHub && entryRef.dragId === 's0')) {
                                entryRef.retryEnteredUrls()
                                    .catch((errObj) => {
                                        console.log('There aws a problem with retryEnteredUrls: ' + errObj);
                                    })
                            }
                        })
                    }
                }
            }
        },
        computed: {
            buildList: function () {
                if (this.speciesName && this.variantModel.genomeBuildHelper) {
                    return this.variantModel.genomeBuildHelper.speciesToBuilds[this.speciesName].map(function (gb) {
                        return gb.name;
                    })
                } else {
                    return [];
                }
            }
        },
        mounted: function () {
            if (this.variantModel) {
                this.speciesName = this.variantModel.genomeBuildHelper.getCurrentSpeciesName();
                this.buildName = this.variantModel.genomeBuildHelper.getCurrentBuildName();
                this.speciesList = this.variantModel.genomeBuildHelper.speciesList.map(function (sp) {
                    return sp.name;
                }).filter(function (name) {
                    return name === 'Human';
                });
            }
        }
    }
</script>
