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
            v-model="showFilesMenu"
    >

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


                <v-flex xs12
                        v-for="sample in samples"
                        :key="sample"
                        :id="sample"
                        v-if="modelInfoMap && modelInfoMap[sample] && Object.keys(modelInfoMap[sample]).length > 0">

                    <sample-data
                            ref="sampleDataRef"
                            v-if="modelInfoMap && modelInfoMap[sample] && Object.keys(modelInfoMap[sample]).length > 0"
                            :modelInfo="modelInfoMap[sample]"
                            :separateUrlForIndex="separateUrlForIndex"
                            @sample-data-changed="validate"
                            @samples-available="onSamplesAvailable"
                    >
                    </sample-data>

                </v-flex>

                <v-flex xs6 class="mt-2 text-xs-left">
                    <v-btn small outline fab color="appColor"
                        @click="onAdd">
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
                mode: 'double',
                speciesList: [],
                speciesName: null,
                buildName: null,
                activeTab: null,
                modelInfoMap: {},
                samples: ['n0', 't0'],
                demoActions: [
                    {'display': 'Demo WES trio', 'value': 'exome'},
                    {'display': 'Demo WGS trio', 'value': 'genome'}
                ],
                demoAction: null,
                timeSeriesMode: false,
                separateUrlForIndex: false,
                inProgress: false
            }
        },
        watch: {
            showFilesMenu: function () {
                if (this.cohortModel && this.showFilesMenu) {
                    this.init();
                }
            }
        },
        methods: {
            onAdd: function() {
                let self = this;

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
                            if (model.name == null || model.name.length === 0) {
                                model.name = model.id;
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
            // onModeChanged: function () {
            //     if (this.mode === 'trio' && this.cohortModel.getCanonicalModels().length < 3) {
            //         this.promiseInitMotherFather();
            //     } else if (this.mode === 'double' && this.cohortModel.getCanonicalModels().length > 1) {
            //         this.removeMotherFather();
            //     }
            //
            //     this.validate();
            // },
            onLoadDemoData: function () {
                let self = this;

                self.cohortModel.demoModelInfos[self.demoAction].forEach(function (modelInfo) {
                    let id = modelInfo.id;
                    self.modelInfoMap[id] = modelInfo;
                });
                self.cohortModel.getCanonicalModels().forEach(function (model) {
                    self.promiseSetModel(model);
                })
            },
            promiseSetModel: function (model) {
                let self = this;
                return new Promise(function (resolve, reject) {
                    let theModel = model;
                    let theModelInfo = self.modelInfoMap[theModel.id];
                    theModelInfo.model = theModel;
                    theModel.onVcfUrlEntered(theModelInfo.vcf, null, function (success, sampleNames) {
                        if (success) {
                            //theModelInfo.samples = sampleNames;                           // TODO: do I need this?
                            self.$refs.sampleDataRef.forEach(function (ref) {
                                if (ref.modelInfo.id === theModel.id) {
                                    //ref.updateSamples(sampleNames, theModelInfo.sample);  // TODO: do I need this?
                                    theModel.name = theModel.sampleName;
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

                let keyList = Object.keys(modelInfoMap);
                for (let i = 0; i < keyList.length; i++) {
                    let currKey = keyList[i];
                    this.isValid &= (this.modelInfoMap[currKey] != null && this.modelInfoMap[currKey].model.isReadyToLoad());
                }
            },
            // TODO: what is this and when is it called?
            onSamplesAvailable: function (relationship, samples) {
                if (relationship == 'proband') {
                    this.probandSamples = samples;
                    if (this.cohortModel.sampleMapSibs.affected && this.cohortModel.sampleMapSibs.affected.length > 0) {
                        this.affectedSibs = this.cohortModel.sampleMapSibs.affected.map(function (sampleModel) {
                            return sampleModel.sampleName;
                        })
                    }
                    if (this.cohortModel.sampleMapSibs.unaffected && this.cohortModel.sampleMapSibs.unaffected.length > 0) {
                        this.unaffectedSibs = this.cohortModel.sampleMapSibs.unaffected.map(function (sampleModel) {
                            return sampleModel.sampleName;
                        })
                    }
                }
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
                self.modelInfoMap = {};
                if (self.cohortModel && self.cohortModel.getCanonicalModels().length > 0) {
                    self.initModelInfo();
                } else {
                    let promises = [];

                    let normalModelInfo = {};
                    normalModelInfo.id = 'n0';
                    normalModelInfo.name = 'normal';
                    normalModelInfo.vcf = null;
                    normalModelInfo.bam = null;
                    normalModelInfo.order = 0;
                    normalModelInfo.isTumor = false;
                    self.modelInfoMap['n0'] = normalModelInfo;
                    let normP = self.cohortModel.promiseAddSample(normalModelInfo);
                    promises.push(normP);

                    let tumorModelInfo = {};
                    tumorModelInfo.id = 't0';
                    tumorModelInfo.name = 'tumor';
                    tumorModelInfo.vcf = null;
                    tumorModelInfo.bam = null;
                    tumorModelInfo.order = 1;
                    tumorModelInfo.isTumor = true;
                    self.modelInfoMap['t0'] = tumorModelInfo;
                    let tumorP = self.cohortModel.promiseAddSample(tumorModelInfo);
                    promises.push(tumorP);

                    Promise.all(promises)
                        .then(() => {
                            self.initModelInfo();
                        })
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
                        modelInfo.id = model.getId();
                        modelInfo.name = model.getName();
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
                        self.$set(self.modelInfoMap, model.id, modelInfo);
                    }
                })
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
