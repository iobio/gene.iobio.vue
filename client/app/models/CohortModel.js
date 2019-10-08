import CacheHelper from './CacheHelper.js'
import VariantImporter from './VariantImporter.js'
import SampleModel from './SampleModel.js'
import CmmlUrls from '../../data/cmml_urls.json'

/* One per patient - contains sample models for tumor and normal samples. */
class CohortModel {
    constructor(globalApp, isEduMode, isBasicMode, endpoint, genericAnnotation, translator, geneModel,
                variantExporter, cacheHelper, genomeBuildHelper, freebayesSettings) {

        this.globalApp = globalApp;
        this.isEduMode = isEduMode;
        this.isBasicMode = isBasicMode;
        this.defaultingToDemoData = false;

        this.endpoint = endpoint;
        this.genericAnnotation = genericAnnotation;
        this.translator = translator;
        this.geneModel = geneModel;
        this.variantExporter = variantExporter;
        this.cacheHelper = cacheHelper;
        this.genomeBuildHelper = genomeBuildHelper;
        this.freebayesSettings = freebayesSettings;
        this.filterModel = null;
        this.featureMatrixModel = null;
        this.varAfNodes = null;
        this.varAfLinks = null;

        this.annotationScheme = 'vep';
        this.isLoaded = false;

        this.sampleModels = [];                 // List of sample models correlated with this cohort
        this.sampleMap = {};                    // Relates IDs to model objects
        this.allUniqueFeaturesObj = null;       // A vcf object with all unique features from all sample models in this cohort (used for feature matrix)
        this.cosmicVariantIdHash = null;        // Contains the current gene's cosmic IDs

        this.mode = 'time';                     // Indicates time-series mode
        this.maxAlleleCount = null;
        this.tumorInfo = null;                  // Used in variant detail cards & tooltips
        this.maxDepth = 0;
        this.annotationComplete = false;        // True when all tracks have finished annotation

        this.inProgress = {
            'loadingDataSources': false
        };

        this.allSomaticFeaturesLookup = {};     // Contains the IDs corresponding to variants from all tumor tracks classified as somatic
        this.allInheritedFeaturesLookup = {};   // Contains the IDs corresponding to variants from all tumor tracks classified as inherited

        this.genesInProgress = [];
        this.flaggedVariants = [];

        this.knownVariantViz = 'variants';     // variants, histo, histoExon
        this.cosmicVariantViz = 'counts';
        this.demoCmmlFiles = false;             // If true, loads demo CMML data - ONLY LOCAL
        this.demoVcfs = this.getDemoVcfs();
        this.demoBams = this.getDemoBams();
        this.demoModelInfos = this.getDemoModelInfos();
        this.demoGenes = ['KRAS', 'APC', 'BRCA2', 'TGFB1', 'RB1'];
    }

    getDemoVcfs() {
        let self = this;
        if (self.demoCmmlFiles) {
            return {
                'timeSeriesVcf': CmmlUrls['pt1Vcf'],
                'timeSeriesTbi': CmmlUrls['pt1Tbi'],
                'dualVcf': CmmlUrls['pt1Vcf'],
                'dualTbi': CmmlUrls['pt1Tbi']
            };
        } else {
            return {
                'timeSeries': "https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz",
                'dual': "https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz"
            };
        }
    }

    getDemoBams() {
        let self = this;
        if (self.demoCmmlFiles) {
            return {
                'timeSeries': {
                    't0Bam': CmmlUrls['t0Bam'],
                    't1Bam': CmmlUrls['t1Bam'],
                    't2Bam': CmmlUrls['t2Bam'],
                    't3Bam': CmmlUrls['t3Bam'],
                    't0Bai': CmmlUrls['t0Bai'],
                    't1Bai': CmmlUrls['t1Bai'],
                    't2Bai': CmmlUrls['t2Bai'],
                    't3Bai': CmmlUrls['t3Bai']
                },
                'dual': {
                    'normalBam': CmmlUrls['t0Bam'],
                    'normalBai': CmmlUrls['t0Bai'],
                    'tumorBam': CmmlUrls['t3Bam'],
                    'tumorBai': CmmlUrls['t3Bai']
                }
            };
        } else {
            return {
                'timeSeries': {
                    't0': 'https://s3.amazonaws.com/iobio/samples/bam/NA12878.exome.bam',
                    't1': 'https://s3.amazonaws.com/iobio/samples/bam/NA12892.exome.bam',
                    't2': 'https://s3.amazonaws.com/iobio/samples/bam/NA12891.exome.bam',
                    't3': 'https://s3.amazonaws.com/iobio/samples/bam/NA12891.exome.bam'
                },
                'dual': {
                    'normal': 'https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12878.bam',
                    'tumor': 'https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12892.bam'
                }
            };
        }
    }

    getDemoModelInfos() {
        let self = this;
        if (self.demoCmmlFiles) {
            return {
                'timeSeries': [
                    {
                        id: 's0',
                        isTumor: false,
                        displayName: 'CMML Normal',
                        'selectedSample': '14063X1',
                        'vcf': this.demoVcfs.timeSeriesVcf,
                        'tbi': this.demoVcfs.timeSeriesTbi,
                        'bam': this.demoBams.timeSeries['t0Bam'],
                        'bai': this.demoBams.timeSeries['t0Bai'],
                        'order': 0
                    },
                    {
                        id: 's1',
                        isTumor: true,
                        displayName: 'CMML T1',
                        'selectedSample': '11200X11',
                        'vcf': this.demoVcfs.timeSeriesVcf,
                        'tbi': this.demoVcfs.timeSeriesTbi,
                        'bam': this.demoBams.timeSeries['t1Bam'],
                        'bai': this.demoBams.timeSeries['t1Bai'],
                        'order': 1
                    },
                    {
                        id: 's2',
                        isTumor: true,
                        displayName: 'CMML T2',
                        'selectedSample': '11200X12',
                        'vcf': this.demoVcfs.timeSeriesVcf,
                        'tbi': this.demoVcfs.timeSeriesTbi,
                        'bam': this.demoBams.timeSeries['t2Bam'],
                        'bai': this.demoBams.timeSeries['t2Bai'],
                        'order': 2
                    },
                    {
                        id: 's3',
                        isTumor: true,
                        displayName: 'CMML T3',
                        'selectedSample': '11200X9',
                        'vcf': this.demoVcfs.timeSeriesVcf,
                        'tbi': this.demoVcfs.timeSeriesTbi,
                        'bam': this.demoBams.timeSeries['t3Bam'],
                        'bai': this.demoBams.timeSeries['t3Bai'],
                        'order': 3
                    }
                ],
                'dual': [
                    {
                        id: 's0',
                        isTumor: false,
                        displayName: 'CMML Normal',
                        'selectedSample': '14063X1',
                        'vcf': this.demoVcfs.dualVcf,
                        'tbi': this.demoVcfs.dualTbi,
                        'bam': this.demoBams.dual['normalBam'],
                        'bai': this.demoBams.dual['normalBai'],
                        'order': 0
                    },
                    {
                        id: 's1',
                        isTumor: true,
                        displayName: 'CMML Tumor',
                        'selectedSample': '11200X9',
                        'vcf': this.demoVcfs.dualVcf,
                        'tbi': this.demoVcfs.dualTbi,
                        'bam': this.demoBams.dual['tumorBam'],
                        'bai': this.demoBams.dual['tumorBai'],
                        'order': 1
                    }
                ]
            };
        } else {
            return {
                'timeSeries': [
                    {
                        id: 's0',
                        isTumor: false,
                        displayName: 'Normal',
                        'selectedSample': 'NA12878',
                        'vcf': this.demoVcfs.timeSeries,
                        'tbi': null,
                        'bam': this.demoBams.timeSeries['t0'],
                        'bai': null,
                        'order': 0
                    },
                    {
                        id: 's1',
                        isTumor: true,
                        displayName: 'T1 Tumor',
                        'selectedSample': 'NA12892',
                        'vcf': this.demoVcfs.timeSeries,
                        'tbi': null,
                        'bam': this.demoBams.timeSeries['t1'],
                        'bai': null,
                        'order': 1
                    },
                    {
                        id: 's2',
                        isTumor: true,
                        displayName: 'T2 Tumor',
                        'selectedSample': 'NA12891',
                        'vcf': this.demoVcfs.timeSeries,
                        'tbi': null,
                        'bam': this.demoBams.timeSeries['t2'],
                        'bai': null,
                        'order': 2
                    },
                    {
                        id: 's3',
                        isTumor: true,
                        displayName: 'T3 Tumor',
                        'selectedSample': 'NA12891',
                        'vcf': this.demoVcfs.timeSeries,
                        'tbi': null,
                        'bam': this.demoBams.timeSeries['t3'],
                        'bai': null,
                        'order': 3
                    }
                ],
                'dual': [
                    {
                        id: 's0',
                        isTumor: false,
                        displayName: 'Normal',
                        'selectedSample': 'NA12878',
                        'vcf': this.demoVcfs.dual,
                        'tbi': null,
                        'bam': this.demoBams.dual['normal'],
                        'bai': null,
                        'order': 0
                    },
                    {
                        id: 's1',
                        isTumor: true,
                        displayName: 'Tumor',
                        'selectedSample': 'NA12892',
                        'vcf': this.demoVcfs.dual,
                        'tbi': null,
                        'bam': this.demoBams.dual['tumor'],
                        'bai': null,
                        'order': 1
                    }
                ]
            };
        }
    }

    promiseInitDemo(demoKind = 'exome') {
        let self = this;

        return new Promise(function (resolve, reject) {
            let promise = null;
            if (self.demoGenes) {
                promise = self.geneModel.promiseCopyPasteGenes(self.demoGenes.join(","));
            } else {
                promise = Promise.resolve();
            }
            promise
                .then(function () {
                    self.promiseInit(self.demoModelInfos[demoKind])
                        .then(function () {
                            resolve();
                        })
                        .catch(function (error) {
                            reject(error);
                        })
                })
        })
    }

    promiseInitEduTour(tourNumber, idx) {
        let self = this;
        return new Promise(function (resolve, reject) {
            var promise = null;
            if (self.eduTourGeneNames[tourNumber]) {
                promise = self.geneModel.promiseCopyPasteGenes(self.eduTourGeneNames[tourNumber].join(","));
            } else {
                promise = Promise.resolve();
            }
            promise
                .then(function () {
                    self.promiseInit([self.eduTourModelInfos[tourNumber][idx]])
                        .then(function () {
                            resolve();
                        })
                        .catch(function (error) {
                            reject(error)
                        })
                })

        })
    }

    promiseInitCustomFile(customFile) {
        return new Promise((resolve, reject) => {
            let modelInfos = [];
            const reader = new FileReader();
            reader.onload = (fileObj) => {
                let fileText = fileObj.target.result;
                let infoObj = JSON.parse(fileText);
                let isTimeSeries = infoObj['isTimeSeries'];
                let samples = infoObj['samples'];
                if (samples == null) {
                    reject('Could not read samples from config file');
                }
                samples.forEach((sample) =>  {
                    let currInfo = {};
                    currInfo.id = sample.id;
                    currInfo.isTumor = sample.isTumor;
                    currInfo['vcf'] = sample.vcf;
                    currInfo['tbi'] = sample.tbi;
                    currInfo['bam'] = sample.bam;
                    currInfo['bai'] = sample.bai;
                    currInfo['order'] = sample.order;
                    currInfo['selectedSample'] = sample.selectedSample;
                    currInfo.displayName = sample.displayName;
                    modelInfos.push(currInfo);
                });
                let returnObj = {"isTimeSeries": isTimeSeries, "infos": modelInfos};
                resolve(returnObj);
            };
            reader.readAsText(customFile);
        })
    }

    promiseInit(modelInfos) {
        let self = this;

        return new Promise(function (resolve, reject) {
            self.isLoaded = false;
            self.inProgress.loadingDataSources = true;
            self.sampleModels = [];
            self.flaggedVariants = [];
            self.genesInProgress = [];
            self.sampleMap = {};
            self.clearLoadedData();

            // Increment orders of all sample model infos, to accomodate clinvar & cosmic tracks first
            modelInfos.forEach((modelInfo) => {
                modelInfo.order += 2;
            });

            let promises = [];
            promises.push(self.promiseAddClinvarSample());
            promises.push(self.promiseAddCosmicSample());
            modelInfos.forEach(function (modelInfo) {
                promises.push(self.promiseAddSample(modelInfo));
            });

            Promise.all(promises)
                .then(function () {
                    // Enforce cosmic & clinvar tracks being on top
                    self.sampleModels = self.sortSampleModels(self.getCanonicalModels(), self.sampleMap);

                    // Flip status flags
                    self.setTumorInfo(true);
                    self.inProgress.loadingDataSources = false;
                    self.isLoaded = true;
                    resolve();
                })
                .catch(function (error) {
                    reject(error);
                })
        })
    }

    assignCategoryOrders() {
        var samples = this.getCanonicalModels();

        let tumorModels = samples.filter((samp) => {
            return samp.isTumor === true;
        });
        let normalModels = samples.filter((samp) => {
            return samp.isTumor === false;
        });

        let sortedTumorModels = tumorModels.sort(function(a,b) {
            return a.order - b.order;
        });

        let sortedNormalModels = normalModels.sort(function(a,b) {
            return a.order - b.order;
        });

        sortedTumorModels.forEach((model, i) => {
            model.categoryOrder = i;
        });

        sortedNormalModels.forEach((model, i) => {
            model.categoryOrder = i;
        })
    }


    promiseAddSample(modelInfo, destIndex = -1) {
        let self = this;
        return new Promise(function (resolve, reject) {
            let vm = new SampleModel(self.globalApp);
            vm.init(self);
            vm.id = modelInfo.id;
            vm.order = modelInfo.order;
            vm.displayName = modelInfo.displayName;
            vm.isTumor = modelInfo.isTumor;
            vm.isBasicMode = self.isBasicMode;
            vm.isEduMode = self.isEduMode;

            let vcfPromise = null;
            if (modelInfo.vcf) {
                vcfPromise = new Promise(function (vcfResolve, vcfReject) {
                        vm.onVcfUrlEntered(modelInfo.vcf, modelInfo.tbi, function () {
                            if (modelInfo.displayName && modelInfo.displayName !== '') {
                                vm.setDisplayName(modelInfo.displayName);
                            } else if (modelInfo.selectedSample != null) {
                                vm.setDisplayName(modelInfo.selectedSample);
                            } else {
                                vm.setDisplayName(modelInfo.id);
                            }
                            vcfResolve();
                        })
                    },
                    function (error) {
                        vcfReject(error);
                    });
            } else {
                vm.selectedSample = null;
                vcfPromise = Promise.resolve();
            }

            let bamPromise = null;
            if (modelInfo.bam) {
                bamPromise = new Promise(function (bamResolve, bamReject) {
                        vm.onBamUrlEntered(modelInfo.bam, modelInfo.bai, function () {
                            bamResolve();
                        })
                    },
                    function (error) {
                        bamReject(error);
                    });
            } else {
                vm.bam = null;
                bamPromise = Promise.resolve();
            }

            Promise.all([vcfPromise, bamPromise])
                .then(function () {
                    //let theModel = {'model': vm};
                    if (destIndex >= 0) {
                        self.sampleModels[destIndex] = vm;
                    } else {
                        self.sampleModels.push(vm);
                    }
                    self.sampleMap[modelInfo.id] = modelInfo;
                    resolve(vm);
                });
        })
    }

    /* Removes a sample model corresponding to the given id */
    removeSample(id) {
        let self = this;

        let sampleIndex = -1;
        for (let i = 0; i < self.sampleModels.length; i++) {
            let currModel = self.sampleModels[i];
            if (currModel.id === id) {
                sampleIndex = i;
                break;
            }
        }
        self.sampleModels.splice(sampleIndex, 1);
        delete self.sampleMap[id];
    }

    /* Coordinates order with view array */
    updateSampleOrder(oldIndex, newIndex) {
        let self = this;

        if (oldIndex < newIndex) {
            self.sampleModels.splice(newIndex + 1, 0, self.sampleModels[oldIndex]);
            self.sampleModels.splice(oldIndex, 1);
        } else if (newIndex < oldIndex) {
            self.sampleModels.splice(newIndex, 0, self.sampleModels[oldIndex]);
            self.sampleModels.splice(oldIndex + 1, 1);
        }

        self.sampleModels.push('foo');
        self.sampleModels.pop();
    }

    promiseSetSibs(affectedSamples, unaffectedSamples) {
        let self = this;

        self.sampleMapSibs.affected = [];
        self.sampleMapSibs.unaffected = [];

        if ((affectedSamples == null || affectedSamples.length === 0) &&
            (unaffectedSamples == null || unaffectedSamples.length === 0)) {
            return Promise.resolve();
        }


        var promises = [];
        if (affectedSamples) {
            affectedSamples.forEach(function (sampleName) {
                var modelInfo = {
                    'relationship': 'sibling',
                    'affectedStatus': 'affected',
                    'name': sampleName,
                    'sample': sampleName,
                    'vcf': self.getProbandModel().vcf.getVcfURL(),
                    'tbi': self.getProbandModel().vcf.getTbiURL(),
                    'bam': null,
                    'bai': null
                };
                var p = self.promiseAddSib(modelInfo);
                promises.push(p);
            });
        }
        if (unaffectedSamples) {
            unaffectedSamples.forEach(function (sampleName) {
                var modelInfo = {
                    'relationship': 'sibling',
                    'affectedStatus': 'unaffected',
                    'name': sampleName,
                    'sample': sampleName,
                    'vcf': self.getProbandModel().vcf.getVcfURL(),
                    'tbi': self.getProbandModel().vcf.getTbiURL(),
                    'bam': null, 'bai': null
                };
                var p = self.promiseAddSib(modelInfo);
                promises.push(p);
            });
        }
        return Promise.all(promises);

    }

    promiseAddSib(modelInfo) {
        let self = this;
        return new Promise(function (resolve, reject) {
            var vm = new SampleModel(self.globalApp);
            vm.init(self);
            vm.setRelationship(modelInfo.relationship);
            vm.affectedStatus = modelInfo.affectedStatus;

            var vcfPromise = null;
            if (modelInfo.vcf) {
                vcfPromise = new Promise(function (vcfResolve, vcfReject) {
                        vm.onVcfUrlEntered(modelInfo.vcf, modelInfo.tbi, function () {
                            vm.setSampleName(modelInfo.sample);
                            vm.setName(modelInfo.relationship + " " + modelInfo.sample);
                            vcfResolve();
                        })
                    },
                    function (error) {
                        vcfReject(error);
                    });
            } else {
                vm.sampleName = null;
                vm.samplesNames = null;
                vm.name = null;
                vcfPromise = Promise.resolve();
            }


            vcfPromise
                .then(function () {
                    self.sampleMapSibs[modelInfo.affectedStatus].push(vm);
                    resolve();
                })

        })
    }

    promiseAddClinvarSample() {
        let self = this;
        if (self.sampleMap['known-variants']) {
            return Promise.resolve();
        } else {
            return new Promise(function (resolve, reject) {
                let vm = new SampleModel(self.globalApp);
                vm.init(self);
                vm.setId('known-variants');
                vm.setDisplayName('ClinVar');
                let clinvarUrl = self.globalApp.getClinvarUrl(self.genomeBuildHelper.getCurrentBuildName(), true);
                vm.onVcfUrlEntered(clinvarUrl, null, function () {
                        self.sampleModels.push(vm);
                        let sample = {'id': 'known-variants', 'model': vm, 'order': 0};
                        self.sampleMap['known-variants'] = sample;
                        resolve(sample);
                    },
                    function (error) {
                        reject(error);
                    });
            })
        }
    }

    promiseAddCosmicSample() {
        let self = this;
        if (self.sampleMap['cosmic-variants']) {
            return Promise.resolve();
        } else {
            return new Promise(function (resolve, reject) {
                let vm = new SampleModel(self.globalApp);
                vm.init(self);
                vm.setId('cosmic-variants');
                vm.setDisplayName('COSMIC');

                let cosmicUrl = self.globalApp.getCosmicUrl(self.genomeBuildHelper.getCurrentBuildName());
                let cosmicTbi = cosmicUrl + ".tbi";
                vm.onVcfUrlEntered(cosmicUrl, cosmicTbi, function () {
                        self.sampleModels.push(vm);
                        let sample = {'id': 'cosmic-variants', 'model': vm, 'order': 1};
                        self.sampleMap['cosmic-variants'] = sample;
                        resolve(sample);
                    },
                    function (error) {
                        reject(error);
                    });
            })
        }
    }

    /* Returns a list of sample models sorted by order property.
       When addNonCanonical = true, cosmic & clinvar sample models are prepended to the returned list. */
    sortSampleModels(canonicalModels, map, addNonCanonical = true) {
        // Sort models according to order variable
        let sortedModels = canonicalModels.sort(function(a,b) {
            return map[a.id].order - map[b.id].order;
        });

        // Always add clinvar & cosmic first
        let refModels = [];
        if (addNonCanonical) {
            if (map['known-variants']) {
                refModels.push(map['known-variants'].model);
            }
            if (map['cosmic-variants']) {
                refModels.push(map['cosmic-variants'].model);
            }
        }
        return refModels.concat(sortedModels);
    }

    setTumorInfo(forceRefresh) {
        let self = this;
        if (self.tumorInfo == null || forceRefresh) {
            self.tumorInfo = [];
            self.getCanonicalModels().forEach(function(model) {
                if (model && model.getId() !== 'known-variants' && model.getId() !== 'cosmic-variants') {
                    let info = {};
                    info.model = model;
                    info.id = model.getId();
                    info.status = model.getTumorStatus() ? 'Tumor' : 'Normal';
                    info.label  = model.getDisplayName();
                    info.id = model.getDisplayName();

                    self.tumorInfo.push(info);
                }
            });
        }
    }

    /* Returns sample model corresponding to name or null if DNE */
    getModel(id) {
        if (this.sampleMap[id] != null) {
            return this.sampleMap[id].model;
        } else {
            return null;
        }
    }

    /* Returns first model in sample array that is normal, not tumor. */
    getNormalModel() {
        let self = this;
        if (self.sampleMap && self.sampleMap['s0']) {
            return self.sampleMap['s0'].model;
        } else {
            return null;
        }
    }

    /* Returns all normal and tumor models */
    getCanonicalModels() {
        let models = this.sampleModels.filter(function (model) {
            return model.id !== 'known-variants' && model.id !== 'cosmic-variants';
        });
        return models;
    }

    /* Returns all sample models where isTumor = true, in order of track display */
    getOrderedTumorModels() {
        let self = this;
        let tumorModels = [];
        self.getCanonicalModels().forEach((model) => {
            if (model.isTumor) {
                tumorModels.push(model);
            }
        });

        tumorModels.sort((a,b) => {
            return a.order - b.order;
        });
        return tumorModels;
    }

    /* Returns all sample models where is Tumor = false, in order of track display */
    getOrderedNormalModel() {
        let self = this;
        let normalModels = [];
        self.getCanonicalModels().forEach((model) => {
            if (!model.isTumor) {
                normalModels.push(model);
            }
        });

        normalModels.sort((a,b) => {
            return a.order - b.order;
        });
        return normalModels;
    }

    /* Removes any models with ids that are not on the provided list */
    removeExtraModels(idList) {
        let self = this;
        let existingModels = self.getCanonicalModels();

        let modelsToKeep = [];

        // Don't get rid of ref models
        if (self.sampleMap['known-variants']) {
            modelsToKeep.push(self.sampleMap['known-variants']);
        }
        if (self.sampleMap['cosmic-variants']) {
            modelsToKeep.push(self.sampleMap['cosmic-variants']);
        }

        for (let i = 0; i < existingModels.length; i++) {
            let model = existingModels[i];
            if (idList.indexOf(model.id) >= 0) {
                modelsToKeep.push(model);
            } else {
                delete self.sampleMap[model.id];
            }
        }
        self.sampleModels = modelsToKeep;
    }

    isAlignmentsOnly() {
        var theModels = this.getCanonicalModels().filter(function (model) {
            return model.isAlignmentsOnly();
        });
        return theModels.length == this.getCanonicalModels().length;
    }

    hasAlignments() {
        var theModels = this.sampleModels.filter(function (model) {
            return model.isBamLoaded();
        });
        return theModels.length > 0;
    }

    samplesInSingleVcf() {
        let theVcfs = {};
        this.sampleModels.forEach(function (model) {
            if (!model.isAlignmentsOnly() && model.getId() !== 'known-variants' && model.getId() !== 'cosmic-variants') {
                if (model.vcfUrlEntered) {
                    theVcfs[model.vcf.getVcfURL()] = true;
                } else {
                    theVcfs[model.vcf.getVcfFile().name] = true;
                }

            }
        });
        return Object.keys(theVcfs).length === 1;
    }

    promiseLoadData(theGene, theTranscript, options) {
        let self = this;
        let promises = [];

        return new Promise(function (resolve, reject) {
            if (Object.keys(self.sampleMap).length === 0) {
                resolve();
            } else {
                self.startGeneProgress(theGene.gene_name);
                self.clearLoadedData(theGene.gene_name);

                // Enforce Cosmic sample top track
                self.sampleModels = self.sortSampleModels(self.getCanonicalModels(), self.sampleMap);

                self.assignCategoryOrders();

                let resultMap = null;
                let p1 = self.promiseLoadVariants(theGene, theTranscript, options)
                    .then(function (data) {
                        resultMap = data.resultMap;
                    });
                promises.push(p1);

                let p2 = self.promiseLoadCoverage(theGene, theTranscript)
                    .then(function () {
                        self.setCoverage();
                    });
                promises.push(p2);

                Promise.all(promises)
                    .then(function () {

                        // Set entry data flag to false for all sample models
                        self.sampleModels.forEach((currModel) => {
                           currModel.markEntryDataChanged(false);
                        });

                        // Now summarize the danger for the selected gene
                        self.promiseSummarizeDanger(theGene, theTranscript, resultMap.s0, null)
                            .then(function () {
                                let geneChanged = options.loadFromFlag;
                                
                                self.setLoadedVariants(theGene, null, geneChanged, options.loadFeatureMatrix);
                                self.endGeneProgress(theGene.gene_name);
                                resolve(resultMap);
                            })
                    })
                    .catch(function (error) {
                        self.endGeneProgress(theGene.gene_name);
                        reject(error);
                    })

            }

        })
    }

    startGeneProgress(geneName) {
        var idx = this.genesInProgress.indexOf(geneName);
        if (idx < 0) {
            this.genesInProgress.push(geneName);
        }
    }

    endGeneProgress(geneName) {
        var idx = this.genesInProgress.indexOf(geneName);
        if (idx >= 0) {
            this.genesInProgress.splice(idx, 1);
        }
    }

    promiseLoadKnownVariants(theGene, theTranscript) {
        let self = this;
        if (self.knownVariantViz === 'variants') {
            return self._promiseLoadKnownVariants(theGene, theTranscript);
        } else {
            return self._promiseLoadKnownVariantCounts(theGene, theTranscript);
        }
    }

    _promiseLoadKnownVariants(theGene, theTranscript) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.getModel('known-variants').inProgress.loadingVariants = true;
            self.sampleMap['known-variants'].model.promiseAnnotateVariants(theGene, theTranscript, [self.sampleMap['known-variants'].model], false, false)
                .then(function (resultMap) {
                    self.getModel('known-variants').inProgress.loadingVariants = false;
                    self.setLoadedVariants(theGene, 'known-variants');
                    resolve(resultMap);
                })

        })
    }

    _promiseLoadKnownVariantCounts(theGene, theTranscript) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.getModel('known-variants').inProgress.loadingVariants = true;
            var binLength = null;
            if (self.knownVariantViz === 'histo') {
                binLength = Math.floor(((+theGene.end - +theGene.start) / $('#gene-viz').innerWidth()) * 8);
            }
            let annotationMode = 'vep';
            self.sampleMap['known-variants'].model.promiseGetKnownVariantHistoData(theGene, theTranscript, binLength, annotationMode)
                .then(function (data) {
                    self.getModel('known-variants').inProgress.loadingVariants = false;
                    self.setVariantHistoData('known-variants', data);
                    resolve(data);
                })
        })
    }

    promiseGetCosmicVariantIds(theGene, theTranscript) {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.getModel('cosmic-variants').inProgress.loadingVariants = true;
            self.sampleMap['cosmic-variants'].model.promiseGetVariantIds(theGene, theTranscript, self.sampleMap['cosmic-variants'].model)
                .then(function(resultMap) {
                    self.getModel('cosmic-variants').inProgress.loadingVariants = false;
                    self.cosmicVariantIdHash = resultMap['cosmic-variants-ids'];
                    delete resultMap['cosmic-variants-ids'];
                    resolve();
                })
                .catch((error) => {
                    reject('Problem loading cosmic variants: ' + error);
                })
        })
    }

    promiseLoadCosmicVariants(theGene, theTranscript) {
        let self = this;
        if (self.cosmicVariantViz === 'variants') {
            return self._promiseLoadCosmicVariants(theGene, theTranscript);
        } else  {
            return self._promiseLoadCosmicVariantCounts(theGene, theTranscript);
        }
    }

    _promiseLoadCosmicVariants(theGene, theTranscript) {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.getModel('cosmic-variants').inProgress.loadingVariants = true;
            self.sampleMap['cosmic-variants'].model.promiseAnnotateVariants(theGene, theTranscript, [self.sampleMap['cosmic-variants'].model], false, false)
                .then(function(resultMap) {
                    self.getModel('cosmic-variants').inProgress.loadingVariants = false;
                    self.setLoadedVariants(theGene, 'cosmic-variants');
                    resolve(resultMap);
                })
                .catch((error) => {
                    reject('Problem loading cosmic variants: ' + error);
                })
        })
    }

    _promiseLoadCosmicVariantCounts(theGene, theTranscript) {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.getModel('cosmic-variants').inProgress.loadingVariants = true;
            var binLength = null;
            if (self.cosmicVariantViz === 'histo') {
                binLength = Math.floor( ((+theGene.end - +theGene.start) / $('#gene-viz').innerWidth()) * 8);
            }
            let annotationMode = 'vep';
            self.sampleMap['cosmic-variants'].model.promiseGetCosmicVariantHistoData(theGene, theTranscript, binLength, annotationMode)
                .then(function(data) {
                    self.getModel('cosmic-variants').inProgress.loadingVariants = false;
                    self.setVariantHistoData('cosmic-variants', data);
                    resolve(data);
                })
        })
    }

    promiseLoadVariants(theGene, theTranscript, options) {
        let self = this;

        return new Promise(function (resolve, reject) {
            //let isMultiSample = self.samplesInSingleVcf();
            let isMultiSample = true;  // TODO: hardcoding to test for now - test with single sample vcf
            self.promiseAnnotateVariants(theGene, theTranscript, isMultiSample, false, options)
                .then(function (resultMap) {
                    // Flag bookmarked variants
                    self.setVariantFlags(resultMap['s0']);

                    // the variants are fully annotated so determine inheritance (if trio).
                    return self.promiseAnnotateInheritance(theGene, theTranscript, resultMap, {
                        isBackground: false,
                        cacheData: true
                    })
                })
                .then(function (resultMap) {
                    resolve(resultMap);
                })
                .catch(function (error) {
                    reject(error);
                })
        })
    }

    promiseLoadCoverage(theGene, theTranscript) {
        let self = this;
        return new Promise(function (resolve, reject) {

            self.promiseGetCachedGeneCoverage(theGene, theTranscript, true)
                .then(function (data) {
                    return self.promiseLoadBamDepth(theGene, theTranscript);
                })
                .then(function (data) {
                    resolve(data);
                })
                .catch(function (error) {
                    reject(error);
                })
        })

    }

    /* Clears the variant data for each cohort if the last gene analyzed for this data set is different than the one provided.
     * This coordinates display with loading new tracks once some tracks have already been analyzed.
     * Falsifies flags used for chip display. */
    clearLoadedData(geneName) {
        let self = this;
        self.sampleModels.forEach(function (model) {
            if (model.lastGeneLoaded !== geneName) {
                model.loadedVariants = {loadState: {}, features: [], maxLevel: 1, featureWidth: 0};
                model.calledVariants = {loadState: {}, features: [], maxLevel: 1, featureWidth: 0};
                model.variantHistoData = [];
                model.coverage = [[]];
                model.noMatchingSamples = false;
            }
        });
        self.afLinks = null;
        self.afNodes = null;
    }

    clearLoadedVariants() {
        let self = this;
        self.sampleModels.forEach((model) => {
            model.loadedVariants = [];
            model.loadedVariants.push('foo');
            model.loadedVariants.pop();
            model.loadedVariants = null;

            model.coverage = [[]];
            model.coverage.push('foo');
            model.coverage.pop();
        })
    }

    stopAnalysis() {
        this.genesInProgress = [];
    }

    clearCalledVariants() {
        let self = this;
        self.sampleModels.forEach(function (model) {
            model.calledVariants = {loadState: {}, features: [], maxLevel: 1, featureWidth: 0};
        })
    }

    /* Filters variants and performs pileup. Also draws feature matrix. */
    setLoadedVariants(gene, id = null, loadFromFlag = false, drawFeatureMatrix = true) {
        let self = this;

        let filterAndPileupVariants = function (model, start, end, target = 'loaded') {
            let filteredVariants = $.extend({}, model.vcfData);
            filteredVariants.features = model.vcfData.features.filter(function (feature) {

                let isTarget = false;
                if (target === 'loaded' && (!feature.fbCalled || feature.fbCalled !== 'Y')) {
                    isTarget = true;
                } else if (target === 'called' && feature.fbCalled && feature.fbCalled === 'Y') {
                    isTarget = true;
                }

                let isHomRef = feature.zygosity == null
                    || feature.zygosity.toUpperCase() === "HOMREF"
                    || feature.zygosity.toUpperCase() === "NONE"
                    || feature.zygosity === "";

                let inRegion = true;
                if (self.filterModel.regionStart && self.filterModel.regionEnd) {
                    inRegion = feature.start >= self.filterModel.regionStart && feature.start <= self.filterModel.regionEnd;
                }

                // Note: this is TDS existing framework, can use later on if desired
                let passesModelFilter = self.filterModel.passesModelFilter(model.id, feature);

                // Don't want to filter by front end filters here! Otherwise zooming with active filters will not work b/c variants never get drawn
                return isTarget && !isHomRef && inRegion && passesModelFilter;
            });

            let pileupObject = model._pileupVariants(filteredVariants.features, start, end);
            filteredVariants.maxLevel = pileupObject.maxLevel + 1;
            filteredVariants.featureWidth = pileupObject.featureWidth;

            return filteredVariants;
        };


        let allVariants = $.extend({}, self.getNormalModel().loadedVariants);
        allVariants.features = [];      // Start empty so when we get normal in loop below, we don't duplicate
        let uniqueMatrixFeatures = {};  // The features to rank in the matrix

        self.sampleModels.forEach(function (model) {
            if (id == null || id === model.id) {
                if (model.vcfData && model.vcfData.features) {

                    let start = self.filterModel.regionStart ? self.filterModel.regionStart : gene.start;
                    let end = self.filterModel.regionEnd ? self.filterModel.regionEnd : gene.end;

                    let loadedVariants = filterAndPileupVariants(model, start, end, 'loaded');
                    model.loadedVariants = loadedVariants;

                    let calledVariants = filterAndPileupVariants(model, start, end, 'called');
                    model.calledVariants = calledVariants;

                    // Don't add known variants to our feature matrix
                    if (model.id !== 'cosmic-variants' && model.id !== 'known-variants') {
                        let currVariants = model.loadedVariants.features;
                        currVariants.forEach((currVar) => {
                            if (uniqueMatrixFeatures[currVar.id] == null) {
                                uniqueMatrixFeatures[currVar.id] = currVar;
                                allVariants.features.push(currVar);
                            }
                        });
                        if (model.calledVariants) {
                            currVariants = model.calledVariants.features;
                            currVariants.forEach((currVar) => {
                                if (uniqueMatrixFeatures[currVar.id] == null) {
                                    uniqueMatrixFeatures[currVar.id] = currVar;
                                    allVariants.features.push(currVar);
                                }
                            });
                        }
                    }
                } else {
                    model.loadedVariants = {loadState: {}, features: []};
                    model.calledVariants = {loadState: {}, features: []}
                }
            }
        });

        // Plug combined, unique features into feature matrix model
        if (id !== 'known-variants' && id !== 'cosmic-variants' && drawFeatureMatrix) {
            if (self.allUniqueFeaturesObj != null && self.allUniqueFeaturesObj.features
                    && self.allUniqueFeaturesObj.features.length > 0
                    && loadFromFlag) {
                self.featureMatrixModel.promiseRankVariants(self.allUniqueFeaturesObj, self.allSomaticFeaturesLookup, self.allInheritedFeaturesLookup, self.getAllFilterPassingVariants())
            } else if (allVariants && allVariants.features.length > 0) {
                self.featureMatrixModel.promiseRankVariants(allVariants, self.allSomaticFeaturesLookup, self.allInheritedFeaturesLookup, self.getAllFilterPassingVariants());
                self.allUniqueFeaturesObj = allVariants;
            }
        } else if (!drawFeatureMatrix) {
            self.allUniqueFeaturesObj = allVariants;
        }
    }

    setCoverage(regionStart, regionEnd) {
        let self = this;
        self.getCanonicalModels().forEach(function (model) {
            if (model.bamData) {
                if (regionStart && regionEnd) {
                    model.coverage = model.bamData.coverage.filter(function (depth) {
                        return depth[0] >= regionStart && depth[0] <= regionEnd;
                    })
                } else {
                    model.coverage = model.bamData.coverage;
                }

                if (model.coverage) {
                    var max = d3.max(model.coverage, function (d, i) {
                        return d[1]
                    });
                    if (max > self.maxDepth) {
                        self.maxDepth = max;
                    }
                }
            }
        })
    }

    setVariantHistoData(relationship, data, regionStart, regionEnd) {
        let self = this;
        var model = self.getModel(relationship);
        if (regionStart && regionEnd) {
            model.variantHistoData = data.filter(function (binObject) {
                binObject.start >= regionStart && binObject.end <= regionEnd;
            })
        } else {
            model.variantHistoData = data;
        }

        model.variantHistoCount = 0;
        model.variantHistoData.forEach(function (histo) {
            model.variantHistoCount += histo.total;
        })
    }

    promiseAnnotateVariants(theGene, theTranscript, isMultiSample, isBackground, options = {}) {
        let self = this;
        return new Promise(function (resolve, reject) {
            let annotatePromises = [];
            let theResultMap = {};
            self.featureMatrixModel.inProgress.loadingVariants = true;
            for (var id in self.sampleMap) {
                let model = self.sampleMap[id].model;
                let noReloadNecessary = model.lastGeneLoaded === theGene.gene_name && model.loadedVariants != null && !model.entryDataChanged;
                if ((model.isVcfReadyToLoad() || model.isLoaded()) /*&& !noReloadNecessary*/) {
                    model.lastGeneLoaded = theGene.gene_name;
                    if (!isBackground) {
                        model.inProgress.loadingVariants = true;
                    }
                    if (id !== 'known-variants' && id !== 'cosmic-variants') {
                        let p = model.promiseAnnotateVariants(theGene, theTranscript, [model], isMultiSample, isBackground)
                            .then(function (resultMap) {
                                for (var theId in resultMap) {
                                    // if (!isBackground) {
                                    //     self.getModel(theId).inProgress.loadingVariants = false;
                                    // }
                                    theResultMap[theId] = resultMap[theId];
                                }
                                self.annotationComplete = false;
                            });
                        annotatePromises.push(p);
                    }
                }
            }

            // Load clinvar track
            if (options.getKnownVariants) {
                let p = self.promiseLoadKnownVariants(theGene, theTranscript)
                    .then(function (resultMap) {
                        if (self.knownVariantViz === 'variants') {
                            for (let id in resultMap) {
                                theResultMap[id] = resultMap[id];
                            }
                        }
                    });
                annotatePromises.push(p);
            }

            // Always get COSMIC IDs so we can put status in feature matrix
            let p = self.promiseGetCosmicVariantIds(theGene, theTranscript);
            annotatePromises.push(p);

            Promise.all(annotatePromises)
                .then(function () {
                    self.promiseAnnotateWithCosmic(theResultMap)
                        .then(function (updatedResultMap) {
                            self.promiseAnnotateWithClinvar(updatedResultMap, theGene, theTranscript, isBackground)
                                .then(function (data) {
                                    for (var theId in data) {
                                        if (!isBackground) {
                                            self.getModel(theId).inProgress.loadingVariants = false;
                                        }
                                    }
                                    self.annotationComplete = true;
                                    resolve(data)
                                });
                        });
                });
        })
    }

    /* Assigns bool to each variant telling if in COSMIC or not */
    promiseAnnotateWithCosmic(resultMap) {
        const self = this;
        return new Promise((resolve, reject) => {
            let cosmicHash = self.cosmicVariantIdHash;
            if (!cosmicHash) {
                reject('Could not annotate cosmic status per variants');
            } else {
                // for each non-ref sample, assign inCosmic field for variants
                for (var id in resultMap) {
                    if (id !== 'known-variants' && id !=='cosmic-variants') {
                        let currSample = resultMap[id];
                        currSample.features.forEach((feat) => {
                            if (cosmicHash[feat.id]) {
                                feat.inCosmic = true;
                                feat.cosmicLegacyId = cosmicHash[feat.id];
                            }
                        })
                    }
                }
                resolve(resultMap);
            }
        });
    }

    promiseAnnotateWithClinvar(resultMap, geneObject, transcript, isBackground) {
        let self = this;
        let formatClinvarKey = function (variant) {
            let delim = '^^';
            return variant.chrom + delim + variant.ref + delim + variant.alt + delim + variant.start + delim + variant.end;
        };

        let formatClinvarThinVariant = function (key) {
            var delim = '^^';
            var tokens = key.split(delim);
            return {'chrom': tokens[0], 'ref': tokens[1], 'alt': tokens[2], 'start': tokens[3], 'end': tokens[4]};
        };


        let refreshVariantsWithClinvarLookup = function (theVcfData, clinvarLookup) {
            theVcfData.features.forEach(function (variant) {
                var clinvarAnnot = clinvarLookup[formatClinvarKey(variant)];
                if (clinvarAnnot) {
                    for (var clinKey in clinvarAnnot) {
                        variant[clinKey] = clinvarAnnot[clinKey];
                    }
                }
            });
            if (theVcfData.loadState == null) {
                theVcfData.loadState = {};
            }
            theVcfData.loadState['clinvar'] = true;
        };


        return new Promise(function (resolve, reject) {

            // Combine the trio variants into one set of variants so that we can access clinvar once
            // instead of on a per sample basis
            var uniqueVariants = {};
            var unionVcfData = {features: []};
            for (var id in resultMap) {
                var vcfData = resultMap[id];
                if (vcfData) {
                    if (!vcfData.loadState['clinvar'] && id !== 'known-variants' && id !== 'cosmic-variants') {
                        vcfData.features.forEach(function (feature) {
                            uniqueVariants[formatClinvarKey(feature)] = true;
                        })
                    }
                }
            }
            if (Object.keys(uniqueVariants).length === 0) {
                resolve(resultMap);
            } else {
                for (var varKey in uniqueVariants) {
                    unionVcfData.features.push(formatClinvarThinVariant(varKey));
                }
                var refreshVariantsFunction = self.globalApp.isClinvarOffline || self.globalApp.clinvarSource === 'vcf'
                    ? self.getNormalModel()._refreshVariantsWithClinvarVCFRecs.bind(self.getNormalModel(), unionVcfData)
                    : self.getNormalModel()._refreshVariantsWithClinvarEutils.bind(self.getNormalModel(), unionVcfData);

                self.getNormalModel().vcf.promiseGetClinvarRecords(
                    unionVcfData,
                    self.getNormalModel()._stripRefName(geneObject.chr),
                    geneObject,
                    self.geneModel.clinvarGenes,
                    refreshVariantsFunction)
                    .then(function () {

                        // Create a hash lookup of all clinvar variants
                        var clinvarLookup = {};
                        unionVcfData.features.forEach(function (variant) {
                            var clinvarAnnot = {};

                            for (var annotKey in self.getNormalModel().vcf.getClinvarAnnots()) {
                                clinvarAnnot[annotKey] = variant[annotKey];
                                clinvarLookup[formatClinvarKey(variant)] = clinvarAnnot;
                            }
                        });

                        let refreshPromises = [];

                        // Use the clinvar variant lookup to initialize variants with clinvar annotations
                        for (var id in resultMap) {
                            var vcfData = resultMap[id];
                            if (vcfData) {
                                if (!vcfData.loadState['clinvar']) {
                                    var p = refreshVariantsWithClinvarLookup(vcfData, clinvarLookup);
                                    if (!isBackground) {
                                        // TODO: need to filter these vars prior to setting
                                        self.getModel(id).vcfData = vcfData;
                                    }
                                    //var p = getVariantCard(rel).model._promiseCacheData(vcfData, CacheHelper.VCF_DATA, vcfData.gene.gene_name, vcfData.transcript);
                                    refreshPromises.push(p);
                                }
                            }
                        }
                        Promise.all(refreshPromises)
                            .then(function () {
                                resolve(resultMap);
                            })
                            .catch(function (error) {
                                reject(error);
                            })
                    })
            }
        })
    }


    promiseAnnotateInheritance(geneObject, theTranscript, resultMap, options = {isBackground: false, cacheData: true}) {
        let self = this;

        var resolveIt = function (resolve, resultMap, geneObject, theTranscript, options) {
            self.promiseCacheCohortVcfData(geneObject, theTranscript, CacheHelper.VCF_DATA, resultMap, options.cacheData)
                .then(function () {
                    resolve({'resultMap': resultMap, 'gene': geneObject, 'transcript': theTranscript});
                })
        };

        return new Promise(function (resolve, reject) {

            if (self.isAlignmentsOnly() && !self.globalApp.autocall && (resultMap == null || resultMap['s0'] == null)) {
                resolve({'resultMap': {'s0': {features: []}}, 'gene': geneObject, 'transcript': theTranscript});
            } else {
                // Set the max allele count across all variants in the trio.  We use this to properly scale
                // the allele counts bars in the tooltip
                self.maxAlleleCount = 0;
                for (let id in resultMap) {
                    self.maxAlleleCount = SampleModel.calcMaxAlleleCount(resultMap[id], self.maxAlleleCount);
                }
                resolveIt(resolve, resultMap, geneObject, theTranscript, options);

                // if (self.mode == 'single') {
                //     // Determine harmful variants, cache data, etc.
                //     resolveIt(resolve, resultMap, geneObject, theTranscript, options);
                // } else {
                    // We only pass in the affected info if we need to sync up genotypes because samples
                    // were in separate vcf files
                    // var syncGenotypes = self.isAlignmentsOnly() || self.samplesInSingleVcf() ? false : true;
                    //
                    // var trioModel = new VariantTrioModel(resultMap.proband, resultMap.mother, resultMap.father, null, syncGenotypes, self.affectedInfo);
                    //
                    // // Compare the mother and father variants to the proband, setting the inheritance
                    // // mode on the proband's variants
                    // trioModel.compareVariantsToMotherFather(function () {
                    //
                    //     self.getProbandModel().promiseDetermineCompoundHets(resultMap.proband, geneObject, theTranscript)
                    //         .then(function () {
                    //             // Now set the affected status for the family on each variant of the proband
                    //             self.getProbandModel().determineAffectedStatus(resultMap.proband, geneObject, theTranscript, self.affectedInfo, function () {
                    //
                    //                 // Determine harmful variants, cache data, etc.
                    //                 resolveIt(resolve, resultMap, geneObject, theTranscript, options);
                    //
                    //             });
                    //         })
                    //
                    //
                    // })
                //}

            }


        })

    }


    promiseCacheCohortVcfData(geneObject, theTranscript, dataKind, resultMap, cacheIt) {
        let self = this;
        return new Promise(function (resolve, reject) {
            if (cacheIt) {
                let cachedPromises = [];
                self.sampleModels.forEach(function (model) {
                    if (resultMap[model.getId()]) {
                        let p = model._promiseCacheData(resultMap[model.getId()], dataKind, geneObject.gene_name, theTranscript);
                        cachedPromises.push(p);
                    }
                });
                Promise.all(cachedPromises).then(function () {
                    resolve();
                })
            } else {
                resolve();
            }

        })

    }

    promiseSummarizeError(error) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.getProbandModel().promiseSummarizeError(error)
                .then(function (dangerObject) {
                    self.geneModel.setDangerSummary(geneObject, dangerObject);
                    resolve();
                }).catch(function (error) {
                reject(error);
            })
        })
    }

    // TODO: need to know when this is called and why
    promiseSummarizeDanger(geneObject, theTranscript, theVcfData, options) {
        let self = this;

        return new Promise(function (resolve, reject) {

            self.promiseGetCachedGeneCoverage(geneObject, theTranscript, false)
                .then(function (data) {
                    let geneCoverageAll = data.geneCoverage;
                    let theOptions = null;

                    self.getNormalModel().promiseGetDangerSummary(geneObject.gene_name)
                        .then(function (dangerSummary) {
                            // Summarize the danger for the gene based on the filtered annotated variants and gene coverage
                            let filteredVcfData = null;
                            let filteredFbData = null;
                            if (theVcfData) {
                                if (theVcfData.features && theVcfData.features.length > 0) {
                                    filteredVcfData = self.getNormalModel().filterVariants(theVcfData, self.filterModel.getFilterObject(), geneObject.start, geneObject.end, true);
                                    filteredFbData = self.getNormalModel().reconstituteFbData(filteredVcfData);
                                } else if (theVcfData.features) {
                                    filteredVcfData = theVcfData;
                                }


                                theOptions = $.extend({}, options);
                                if ((dangerSummary && dangerSummary.CALLED) || (filteredFbData && filteredFbData.features.length > 0)) {
                                    theOptions.CALLED = true;
                                }
                            }

                            // TODO: write new method to determine compound hets using filteredFbData
                            //if (filteredVcfData && filteredVcfData.features) {
                            //    return self.getNormalModel().promiseDetermineCompoundHets(filteredVcfData, geneObject, theTranscript);
                            //} else {
                                return Promise.resolve(filteredVcfData);
                            //}


                        })
                        .then(function (theVcfData) {
                            return self.getNormalModel().promiseSummarizeDanger(geneObject.gene_name, theVcfData, theOptions, geneCoverageAll, self.filterModel);
                        })
                        .then(function (theDangerSummary) {
                            self.geneModel.setDangerSummary(geneObject, theDangerSummary);
                            resolve();
                        })
                        .catch(function (error) {
                            let msg = "An error occurred in promiseSummarizeDanger() when calling SampleModel.promiseGetDangerSummary(): " + error;
                            console.log(msg);
                            reject(msg);
                        })


                })
                .catch(function (error) {
                    let msg = "An error occurred in CohortModel.promiseSummarizeDanger() when calling promiseGetCachedGeneCoverage(): " + error;
                    console.log(msg);
                    reject(msg);
                });

        });


    }


    promiseGetCachedGeneCoverage(geneObject, transcript, showProgress = false) {
        let self = this;
        return new Promise(function (resolve, reject) {
            let geneCoverageAll = {gene: geneObject, transcript: transcript, geneCoverage: {}};

            let promises = [];
            self.sampleModels.forEach(function (model) {
                if (model.isBamLoaded() /*&& model.entryDataChanged*/) {
                    if (showProgress) {
                        //vc.showBamProgress("Analyzing coverage in coding regions");
                    }
                    let promise = model.promiseGetGeneCoverage(geneObject, transcript)
                        .then(function (data) {
                            var gc = data.geneCoverage;
                            geneCoverageAll.geneCoverage[data.model.getId()] = gc;
                            if (showProgress) {
                                //getVariantCard(data.model.getRelationship()).endBamProgress();
                            }
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                    promises.push(promise);
                }

            });
            Promise.all(promises).then(function () {
                resolve(geneCoverageAll);
            })
        })
    }

    promiseLoadBamDepth(theGene, theTranscript) {
        let self = this;

        return new Promise(function (resolve, reject) {
            let promises = [];
            let theResultMap = {};
            self.getCanonicalModels().forEach(function (model) {
                if (model.isBamLoaded() /*&& model.entryDataChanged*/) {
                    model.inProgress.loadingCoverage = true;
                    var p = new Promise(function (innerResolve, innerReject) {
                        var theModel = model;
                        theModel.getBamDepth(theGene, theTranscript, function (coverageData) {
                            theModel.inProgress.loadingCoverage = false;
                            theResultMap[theModel.relationship] = coverageData;
                            innerResolve();
                        });
                    });
                    promises.push(p);
                }
            });
            Promise.all(promises)
                .then(function () {
                    resolve(theResultMap);
                })

        })

    }

    promiseMarkCodingRegions(geneObject, transcript) {
        let self = this;
        return new Promise(function (resolve, reject) {

            let exonPromises = [];
            transcript.features.forEach(function (feature) {
                if (!feature.hasOwnProperty("danger")) {
                    feature.danger = {};
                    let sampleIds = Object.keys(self.sampleMap);
                    for (let i = 0; i < sampleIds.length; i++) {
                        let currId = sampleIds[i];
                        feature.danger[currId] = false;
                    }
                    //feature.danger = {proband: false, mother: false, father: false};
                }
                if (!feature.hasOwnProperty("geneCoverage")) {
                    feature.geneCoverage = {};
                    let sampleIds = Object.keys(self.sampleMap);
                    for (let i = 0; i < sampleIds.length; i++) {
                        let currId = sampleIds[i];
                        feature.geneCoverage[currId] = false;
                    }
                    //feature.geneCoverage = {proband: false, mother: false, father: false};
                }

                self.getCanonicalModels().forEach(function (model) {
                    let promise = model.promiseGetCachedGeneCoverage(geneObject, transcript)
                        .then(function (geneCoverage) {
                            if (geneCoverage) {
                                let matchingFeatureCoverage = geneCoverage.filter(function (gc) {
                                    return feature.start === gc.start && feature.end === gc.end;
                                });
                                if (matchingFeatureCoverage.length > 0) {
                                    let gc = matchingFeatureCoverage[0];
                                    feature.geneCoverage[model.getId()] = gc;
                                    feature.danger[model.getId()] = self.filterModel.isLowCoverage(gc);
                                } else {
                                    feature.danger[model.getId()] = false;
                                }
                            } else {
                                feature.danger[model.getId()] = false;
                            }

                        });
                    exonPromises.push(promise);
                })
            });

            Promise.all(exonPromises).then(function () {
                let sortedExons = self.geneModel._getSortedExonsForTranscript(transcript);
                self.geneModel._setTranscriptExonNumbers(transcript, sortedExons);
                resolve({'gene': geneObject, 'transcript': transcript});
            });
        })

    }


    getCurrentTrioVcfData() {
        var trioVcfData = {};
        this.getCanonicalModels().forEach(function (model) {
            var theVcfData = model.vcfData;
            if (model.isAlignmentsOnly() && theVcfData == null) {
                theVcfData = {};
                theVcfData.features = [];
                theVcfData.loadState = {};
            }
            trioVcfData[model.getRelationship()] = theVcfData;
        })
        return trioVcfData;
    }


    promiseJointCallVariants(geneObject, theTranscript, loadedTrioVcfData, options) {
        var me = this;

        return new Promise(function (resolve, reject) {

            var showCallingProgress = function () {
                if (!options.isBackground) {
                    me.getCanonicalModels().forEach(function (model) {
                        model.inProgress.callingVariants = true;
                    })
                }
            }

            var showCalledVariants = function () {
                if (!options.isBackground) {
                    me.endGeneProgress(geneObject.gene_name);
                    me.setLoadedVariants(geneObject);
                    me.getCanonicalModels().forEach(function (model) {
                        model.inProgress.callingVariants = false;
                    });
                }
            }

            var endCallProgress = function () {
                if (!options.isBackground) {
                    me.getCanonicalModels().forEach(function (model) {
                        model.inProgress.callingVariants = false;
                    })

                }
            }
            var refreshClinvarAnnots = function (trioFbData) {
                for (var rel in trioFbData) {
                    if (trioFbData) {
                        if (trioFbData[rel]) {
                            trioFbData[rel].features.forEach(function (fbVariant) {
                                if (fbVariant.source) {
                                    fbVariant.source.clinVarUid = fbVariant.clinVarUid;
                                    fbVariant.source.clinVarClinicalSignificance = fbVariant.clinVarClinicalSignificance;
                                    fbVariant.source.clinVarAccession = fbVariant.clinVarAccession;
                                    fbVariant.source.clinvarRank = fbVariant.clinvarRank;
                                    fbVariant.source.clinvar = fbVariant.clinvar;
                                    fbVariant.source.clinVarPhenotype = fbVariant.clinVarPhenotype;
                                    fbVariant.source.clinvarSubmissions = fbVariant.clinvarSubmissions;
                                }
                            });

                        }
                    }
                }
            }

            var makeDummyVcfData = function () {
                return {'loadState': {}, 'features': []}
            }


            var trioFbData = {'proband': null, 'mother': null, 'father': null};
            var trioVcfData = loadedTrioVcfData ? loadedTrioVcfData : null;

            me.startGeneProgress(geneObject.gene_name);

            me.clearCalledVariants();

            me.promiseHasCachedCalledVariants(geneObject, theTranscript)
                .then(function (hasCalledVariants) {

                    if (options.checkCache && hasCalledVariants) {
                        showCallingProgress();
                        var promises = [];

                        me.getCanonicalModels().forEach(function (model) {


                            var theFbData;
                            var theVcfData = trioVcfData && trioVcfData[model.getRelationship()] ? trioVcfData[model.getRelationship()] : null;
                            var theModel;


                            var p = model.promiseGetFbData(geneObject, theTranscript)
                                .then(function (data) {
                                    theFbData = data.fbData;
                                    theModel = data.model;
                                    if (theVcfData) {
                                        return Promise.resolve({'vcfData': theVcfData});
                                    } else {
                                        return the.promiseGetVcfData(geneObject, theTranscript);
                                    }
                                })
                                .then(function (data) {
                                        theVcfData = data.vcfData;
                                        if (theVcfData == null) {
                                            theVcfData = makeDummyVcfData();
                                        }

                                        // When only alignments provided, only the called variants were cached as "fbData".
                                        // So initialize the vcfData to 0 features.
                                        var promise = null;
                                        if (theFbData && theFbData.features.length > 0 && theVcfData.features.length == 0) {
                                            promise = theModel.promiseCacheDummyVcfDataAlignmentsOnly(theFbData, geneObject, theTranscript);
                                        } else {
                                            Promise.resolve();
                                        }

                                        promise.then(function () {
                                            if (!options.isBackground) {
                                                theModel.vcfData = theVcfData;
                                                theModel.fbData = theFbData;
                                            }
                                            trioFbData[model.getRelationship()] = theFbData;
                                            trioVcfData[model.getRelationship()] = theVcfData;
                                        })

                                    },
                                    function (error) {
                                        me.endGeneProgress(geneObject.gene_name);
                                        var msg = "A problem occurred in jointCallVariantsImpl(): " + error;
                                        console.log(msg);
                                        reject(msg);
                                    })

                            promises.push(p);
                        })
                        Promise.all(promises).then(function () {
                            showCalledVariants();
                            resolve({
                                'gene': geneObject,
                                'transcript': theTranscript,
                                'jointVcfRecs': [],
                                'trioVcfData': trioVcfData,
                                'trioFbData': trioFbData,
                                'refName': geneObject.chr,
                                'sourceVariant': null
                            });
                        })


                    } else {
                        var bams = [];
                        me.getCanonicalModels().forEach(function (model) {
                            bams.push(model.bam);
                        });

                        showCallingProgress();

                        me.getProbandModel().bam.freebayesJointCall(
                            geneObject,
                            theTranscript,
                            bams,
                            me.geneModel.geneSource == 'refseq' ? true : false,
                            me.freebayesSettings.arguments,
                            me.globalApp.vepAF, // vep af
                            function (theData, trRefName) {

                                var jointVcfRecs = theData.split("\n");

                                if (trioVcfData == null) {
                                    trioVcfData = {
                                        'proband': makeDummyVcfData(),
                                        'mother': makeDummyVcfData(),
                                        'father': makeDummyVcfData()
                                    };
                                }

                                // Parse the joint called variants back to variant models
                                var data = me._parseCalledVariants(geneObject, theTranscript, trRefName, jointVcfRecs, trioVcfData, options)

                                if (data == null) {
                                    endCallProgress();
                                    trioFbData = data.trioFbData;
                                } else {


                                    // Annotate called variants with clinvar
                                    me.promiseAnnotateWithClinvar(trioFbData, geneObject, theTranscript, true)
                                        .then(function () {

                                            refreshClinvarAnnots(trioFbData);

                                            // Determine inheritance across union of loaded and called variants
                                            me.promiseAnnotateInheritance(geneObject, theTranscript, trioVcfData, {
                                                isBackground: options.isBackground,
                                                cacheData: true
                                            })
                                                .then(function () {
                                                    me.getCanonicalModels().forEach(function (model) {
                                                        model.loadCalledTrioGenotypes(trioVcfData[model.getRelationship()], trioFbData[model.getRelationship()]);
                                                    })
                                                    // Summarize danger for gene
                                                    return me.promiseSummarizeDanger(geneObject, theTranscript, trioVcfData.proband, {'CALLED': true});
                                                })
                                                .then(function () {
                                                    showCalledVariants();

                                                    var refreshedSourceVariant = null;
                                                    if (options.sourceVariant) {
                                                        trioVcfData.proband.features.forEach(function (variant) {
                                                            if (!refreshedSourceVariant &&
                                                                me.globalApp.utility.stripRefName(variant.chrom) == me.globalApp.utility.stripRefName(options.sourceVariant.chrom) &&
                                                                variant.start == options.sourceVariant.start &&
                                                                variant.ref == options.sourceVariant.ref &&
                                                                variant.alt == options.sourceVariant.alt) {

                                                                refreshedSourceVariant = variant;
                                                            }
                                                        })
                                                    }
                                                    resolve({
                                                        'gene': geneObject,
                                                        'transcript': theTranscript,
                                                        'jointVcfRecs': jointVcfRecs,
                                                        'trioVcfData': trioVcfData,
                                                        'trioFbData': trioFbData,
                                                        'refName': trRefName,
                                                        'sourceVariant': refreshedSourceVariant
                                                    });
                                                })
                                        });
                                }

                            }
                        );

                    }
                })
        })

    }


    _parseCalledVariants(geneObject, theTranscript, translatedRefName, jointVcfRecs, trioVcfData, options) {
        var me = this;
        var trioFbData = {'proband': null, 'mother': null, 'father': null};
        var fbPromises = [];
        var idx = 0;

        me.getCanonicalModels().forEach(function (model) {

            var sampleNamesToGenotype = model.getSampleNamesToGenotype();

            var theVcfData = trioVcfData[model.getRelationship()];
            if (theVcfData == null) {
                theVcfData = {loadState: [], features: []};
                trioVcfData[model.getRelationship()] = theVcfData;
            }

            theVcfData.loadState['called'] = true;
            var data = model.vcf.parseVcfRecordsForASample(jointVcfRecs, translatedRefName, geneObject, theTranscript, me.translator.clinvarMap, true, (sampleNamesToGenotype ? sampleNamesToGenotype.join(",") : null), idx, me.globalApp.vepAF);

            var theFbData = data.results;
            theFbData.loadState['called'] = true;
            theFbData.features.forEach(function (variant) {
                variant.extraAnnot = true;
                variant.fbCalled = "Y";
                variant.extraAnnot = true;
                model._determineHighestAf(variant);
            })


            // Filter the freebayes variants to only keep the ones
            // not present in the vcf variant set.
            model._determineUniqueFreebayesVariants(geneObject, theTranscript, theVcfData, theFbData);


            if (!options.isBackground) {
                model.fbData = theFbData;
                model.vcfData = theVcfData;
            }
            trioFbData[model.getRelationship()] = theFbData;

            idx++;
        });


        return {'trioVcfData': trioVcfData, 'trioFbData': trioFbData};

    }

    promiseHasCalledVariants() {
        var me = this;

        return new Promise(function (resolve, reject) {
            var promises = [];
            var cardCount = 0;
            var count = 0;

            me.getCanonicalModels().forEach(function (model) {
                cardCount++;
                var promise = model.promiseHasCalledVariants().then(function (hasCalledVariants) {
                    if (hasCalledVariants) {
                        count++;
                    }
                })
                promises.push(promise);
            });

            Promise.all(promises).then(function () {
                resolve(count == cardCount);
            })
        });

    }

    promiseHasCachedCalledVariants(geneObject, transcript) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var cachedCount = 0;
            var promises = [];
            me.getCanonicalModels().forEach(function (model) {
                var p = model.promiseGetFbData(geneObject, transcript)
                    .then(function (data) {
                        if (data.fbData) {
                            cachedCount++;
                        }

                    })
                promises.push(p);
            });
            Promise.all(promises).then(function () {
                resolve(cachedCount == me.getCanonicalModels().length);
            })

        })
    }

    // addFlaggedVariant(theGene, theTranscript, variant) {
    //     var self = this;
    //     var existingVariants = this.flaggedVariants.filter(function (v) {
    //         var matches = (
    //             self.globalApp.utility.stripRefName(v.chrom) === self.globalApp.utility.stripRefName(variant.chrom)
    //             && v.start === variant.start
    //             && v.ref === variant.ref
    //             && v.alt === variant.alt);
    //         return matches;
    //     });
    //     if (existingVariants.length === 0) {
    //         this.flaggedVariants.push(variant);
    //         this._recacheForFlaggedVariant(theGene, theTranscript, variant);
    //     }
    // }

    /* Returns the matching variant object in the combined unique feature list.*/
    getMatrixMatchVar(variantId) {
        let self = this;

        let matchingVar = null;
        if (self.allUniqueFeaturesObj && self.allUniqueFeaturesObj.features) {
            for (let i = 0; i < self.allUniqueFeaturesObj.features.length; i++) {
                let feat = self.allUniqueFeaturesObj.features[i];
                if (feat.id === variantId) {
                    matchingVar = feat;
                    break;
                }
            }
        }
        return matchingVar;
    }

    addUserFlaggedVariant(theGene, theTranscript, variant) {
        var self = this;

        // Get matching variant from unique variant joint list
        let matchingVar = self.getMatrixMatchVar(variant.id);
        if (matchingVar == null) {
            console.log('Could not find matching variant')
        }

        matchingVar.isFlagged = true;
        matchingVar.isUserFlagged = true;
        if (matchingVar.filtersPassed == null) {
            matchingVar.filtersPassed = [];
        }
        matchingVar.filtersPassed.push("userFlagged");
        matchingVar.featureClass = "flagged";

        self._recacheForFlaggedVariant(theGene, theTranscript, matchingVar, {summarizeDanger: true});

    }

    removeFilterPassed(variant, filterName) {
        if (variant && variant.filtersPassed && variant.filtersPassed.length > 0) {
            var idx = variant.filtersPassed.indexOf(filterName);
            if (idx >= 0) {
                variant.filtersPassed.splice(idx, 1);
            }
            if (variant.filtersPassed.length === 0) {
                delete variant.filtersPassed;
            }
        }
    }

    removeUserFlaggedVariant(theGene, theTranscript, variant) {
        var self = this;
        var index = -1;
        var i = 0;

        // Get matching variant from unique variant joint list
        let matchingVar = self.getMatrixMatchVar(variant.id);
        if (matchingVar == null) {
            console.log('Could not find matching variant')
        }

        matchingVar.isFlagged = false;
        matchingVar.isUserFlagged = false;
        this.removeFilterPassed(matchingVar, "userFlagged");
        this._removeFlaggedVariantImpl(matchingVar);
        this._recacheForFlaggedVariant(theGene, theTranscript, matchingVar, {summarizeDanger: true});
    }

    _removeFlaggedVariantImpl(variant) {
        let self = this;
        var index = -1;
        var i = 0;
        this.flaggedVariants.forEach(function(v) {
            var matches = (
                self.globalApp.utility.stripRefName(v.chrom) === self.globalApp.utility.stripRefName(variant.chrom)
                && v.start === variant.start
                && v.ref === variant.ref
                && v.alt === variant.alt);
            if (matches) {
                index = i;
                v.isUserFlagged = false;
                v.isFlagged = false;
                self.removeFilterPassed(v, "userFlagged");
            }
            i++;
        });
        if (index >= 0) {
            this.flaggedVariants.splice(index, 1);
        }
    }

    // removeFlaggedVariant(theGene, theTranscript, variant) {
    //     var self = this;
    //     var index = -1;
    //     var i = 0;
    //     this.removeFilterPassed(variant, "userFlagged");
    //     this.flaggedVariants.forEach(function (v) {
    //         var matches = (
    //             self.globalApp.utility.stripRefName(v.chrom) === self.globalApp.utility.stripRefName(variant.chrom)
    //             && v.start === variant.start
    //             && v.ref === variant.ref
    //             && v.alt === variant.alt);
    //         if (matches) {
    //             index = i;
    //             v.isUserFlagged = false;
    //             self.removeFilterPassed(v, "userFlagged");
    //         }
    //         i++;
    //     })
    //     if (index >= 0) {
    //         this.flaggedVariants.splice(index, 1);
    //     }
    //     this._recacheForFlaggedVariant(theGene, theTranscript, variant);
    // }

    _recacheForFlaggedVariant(theGene, theTranscript, variant) {
        let self = this;
        self.getNormalModel().promiseGetVcfData(theGene, theTranscript)
            .then(function (data) {
                let cachedVcfData = data.vcfData;
                cachedVcfData.features.forEach(function (v) {
                    var matches = (
                        self.globalApp.utility.stripRefName(v.chrom) === self.globalApp.utility.stripRefName(variant.chrom)
                        && v.start === variant.start
                        && v.ref === variant.ref
                        && v.alt === variant.alt);
                    if (matches) {
                        v.isUserFlagged = variant.isUserFlagged;
                        v.filtersPassed = variant.filtersPassed;
                    }
                });
                self.getNormalModel()._promiseCacheData(cachedVcfData, CacheHelper.VCF_DATA, theGene.gene_name, theTranscript);
            });
    }


    clearFlaggedVariants() {
        this.flaggedVariants = [];
    }

    summarizeDangerForFlaggedVariants(geneName, flaggedVariants) {
        return SampleModel._summarizeDanger(geneName, {features: flaggedVariants}, {}, [], this.filterModel, this.translator, this.annotationScheme);
    }


    setVariantFlags(vcfData) {
        let self = this;
        if (vcfData) {
            vcfData.features.forEach(function (variant) {
                if (self.isFlaggedVariant(variant)) {
                    variant.isFlagged = true;
                } else {
                    variant.isFlagged = false;
                }
            });
        }
    }

    isFlaggedVariant(variant) {
        var matchingVariants = this.flaggedVariants.filter(function (v) {
            return v.start === variant.start
                && v.ref === variant.ref
                && v.alt === variant.alt;
        });
        return matchingVariants.length > 0;
    }

    promiseExportFlaggedVariants(format = 'csv') {
        let self = this;
        // If this is a trio, the exporter will be getting the genotype info for proband, mother
        // and father, so pass in a comma separated value of sample names for trio.  Otherwise,
        // just pass null, which will default to the proband's sample name
        var sampleNames = null;
        if (self.mode == 'trio') {
            sampleNames = self.getCanonicalModels().map(function (model) {
                return model.sampleName;
            })
        }

        return self.variantExporter.promiseExportVariants(self.flaggedVariants, format, sampleNames);
    }

    onFlaggedVariantsFileSelected(fileSelection, fileType, callback) {
        var files = fileSelection.currentTarget.files;
        var me = this;
        // Check for the various File API support.
        if (window.FileReader) {
            var variantsFile = files[0];
            var reader = new FileReader();

            reader.readAsText(variantsFile);

            // Handle errors load
            reader.onload = function (event) {
                var data = event.target.result;
                me.importFlaggedVariants(fileType, data, function () {
                    if (callback) {
                        callback();
                    }
                });
                fileSelection.value = null;
            }
            reader.onerror = function (event) {
                alert("Cannot read file. Error: " + event.target.error.name);
                console.log(event.toString())
                if (callback) {
                    callback();
                }
            }

        } else {
            alert('FileReader are not supported in this browser.');
            if (callback) {
                callback();
            }
        }
    }


    importFlaggedVariants(fileType, data, callback) {
        var me = this;
        me.flaggedVariants = [];

        var importRecords = null;
        if (fileType == 'json') {
            importRecords = data == null ? [] : data;
        } else {
            importRecords = VariantImporter.parseRecords(fileType, data);
        }

        // If the number of bookmarks exceeds the max gene limit, truncate the
        // bookmarked variants to this max.
        if (me.globalApp.maxGeneCount && importRecords.length > me.globalApp.maxGeneCount) {
            var bypassedCount = importRecords.length - me.globalApp.maxGeneCount;
            importRecords = importRecords.slice(0, me.globalApp.maxGeneCount);
            alertify.alert("Only first " + me.globalApp.maxGeneCount + " bookmarks will be imported. " + bypassedCount.toString() + " were bypassed.");
        }


        // We need to make sure each imported record has a cached gene object and is assigned
        // a transcript.
        // So first, cache all of the gene objects for the imported variants
        var promises = []

        importRecords.forEach(function (ir) {
            let geneObject = me.geneModel.geneObjects[ir.gene];
            if (geneObject == null || !ir.transcript || ir.transcript == '') {
                var promise = me.geneModel.promiseGetCachedGeneObject(ir.gene, true)
                    .then(function () {
                        if (geneObject == null) {
                            me.geneModel.promiseAddGeneName(ir.gene);
                        }
                    })
                promises.push(promise);
            }
        })

        // Now that all of the gene objects have been cached, we can fill in the
        // transcript if necessary and then find load the imported bookmarks
        Promise.all(promises).then(function () {
            var genesToAnalyze = {load: [], call: []};
            var geneToAltTranscripts = {};
            importRecords.forEach(function (variant) {
                var geneObject = me.geneModel.geneObjects[variant.gene];

                variant.geneName = variant.gene;
                variant.gene = geneObject;
                variant.isProxy = true;
                variant.isFlagged = true;
                variant.filtersPassed = variant.filtersPassed && variant.filtersPassed.indexOf(",") > 0 ? variant.filtersPassed.split(",").join() : (variant.filtersPassed ? [variant.filtersPassed] : []);
                if (variant.isUserFlagged == 'Y') {
                    variant.isUserFlagged = true;
                } else {
                    variant.isUserFlagged = null;
                }
                if (variant.transcript && typeof variant.transcript === 'object') {

                } else if (variant.transcript && variant.transcript.length > 0) {
                    variant.transcript = me.geneModel.getTranscript(geneObject, variant.transcript);
                } else {
                    var tx = geneObject ? me.geneModel.getCanonicalTranscript(geneObject) : null;
                    if (tx) {
                        variant.transcript = tx;
                    }
                }
                geneToAltTranscripts[geneObject.gene_name] = variant.transcript;
                me.flaggedVariants.push(variant);

                var analyzeKind = variant.freebayesCalled == 'Y' ? 'call' : 'load';
                var theVariants = genesToAnalyze[analyzeKind][variant.gene.gene_name];
                if (theVariants == null) {
                    theVariants = [];
                    genesToAnalyze[analyzeKind][variant.gene.gene_name] = theVariants;
                }
                theVariants.push(variant);

            });


            var intersectedGenes = {};
            for (var analyzeKind in genesToAnalyze) {
                for (var geneName in genesToAnalyze[analyzeKind]) {
                    var variants = genesToAnalyze[analyzeKind][geneName];
                    var allVariants = intersectedGenes[geneName];
                    if (allVariants == null) {
                        allVariants = [];
                        intersectedGenes[geneName] = allVariants;
                    }
                    variants.forEach(function (v) {
                        allVariants.push(v);
                    })
                }
            }


            me.cacheHelper.promiseAnalyzeSubset(me, Object.keys(genesToAnalyze.load), geneToAltTranscripts, false)
                .then(function () {
                    if (Object.keys(genesToAnalyze.call).length > 0) {
                        return me.cacheHelper.promiseAnalyzeSubset(me, Object.keys(genesToAnalyze.call), geneToAltTranscripts, true)
                    } else {
                        return Promise.resolve();
                    }
                })
                .then(function () {

                    // Get all of the cached vcf data
                    let dataPromises = [];
                    for (let geneName in intersectedGenes) {

                        var uniqueTranscripts = {};
                        intersectedGenes[geneName].forEach(function (importedVariant) {
                            uniqueTranscripts[importedVariant.transcript.transcript_id] = importedVariant.transcript;
                        })

                        for (var transcriptId in uniqueTranscripts) {
                            let dataPromise = new Promise(function (resolve, reject) {

                                var geneObject = me.geneModel.geneObjects[geneName];
                                var transcript = uniqueTranscripts[transcriptId];
                                var importedVariants = intersectedGenes[geneName];

                                me.getProbandModel().promiseGetVcfData(geneObject, transcript, true)
                                    .then(function (data) {

                                        if (data == null || data.vcfData == null || data.vcfData.features == null) {
                                            var msg = "Unable to get variant vcf data for " + geneObject.gene_name + " " + transcript.transcript_id;
                                            console.log(msg);
                                            alert(msg);
                                            reject(msg);
                                        }

                                        // Refresh imported variant records with real variants
                                        importedVariants.forEach(function (importedVariant) {
                                            var matchingVariants = data.vcfData.features.filter(function (v) {
                                                return v.start == importedVariant.start
                                                    && v.ref == importedVariant.ref
                                                    && v.alt == importedVariant.alt;
                                            })
                                            if (matchingVariants.length > 0) {
                                                var geneObject = importedVariant.gene;
                                                var transcript = importedVariant.transcript;
                                                var isUserFlagged = importedVariant.isUserFlagged;
                                                importedVariant = $.extend(importedVariant, matchingVariants[0]);
                                                importedVariant.isFlagged = true;
                                                importedVariant.isUserFlagged = isUserFlagged;
                                                importedVariant.isProxy = false;
                                                importedVariant.gene = geneObject;
                                                importedVariant.transcript = transcript;
                                                console.log(importedVariant);
                                            } else {
                                                console.log("Unable to match imported variant to vcf data for " + importedVariant.gene + " " + importedVariant.transcript + " " + importedVariant.start)
                                            }
                                        })

                                        // We need to recache the variants since the isUserFlag has been established
                                        me.getProbandModel()._promiseCacheData(data.vcfData, CacheHelper.VCF_DATA, geneObject.gene_name, transcript)
                                            .then(function () {

                                                // Now recalc the badge counts on danger summary to reflect imported variants
                                                me.getProbandModel().promiseGetDangerSummary(geneObject.gene_name)
                                                    .then(function (dangerSummary) {
                                                        dangerSummary.badges = me.filterModel.flagVariants(data.vcfData);
                                                        me.geneModel.setDangerSummary(geneObject, dangerSummary);

                                                        resolve();
                                                    });

                                            })

                                    })
                                    .catch(function (error) {
                                        reject(error)
                                    })

                            })
                            dataPromises.push(dataPromise);
                        }
                    }

                    // Finished with syncing imported variants for all imported genes.
                    Promise.all(dataPromises)
                        .then(function () {

                            if (callback) {
                                callback();
                            }
                        })
                })

        })

    }

    organizeVariantsByFilterAndGene(activeFilterName, isFullAnalysis, interpretationFilters, options={includeNotCategorized: false}) {
        let self = this;
        let filters = [];
        for (var filterName in self.filterModel.flagCriteria) {
            if (activeFilterName == null || activeFilterName === filterName || activeFilterName === 'coverage') {
                let flagCriteria = self.filterModel.flagCriteria[filterName];
                let include = true;
                if (isFullAnalysis && !options.includeNotCategorized && filterName === 'notCategorized') {
                    include = false;
                }
                if (include) {
                    var sortedGenes = self._organizeVariantsForFilter(filterName, flagCriteria.userFlagged, isFullAnalysis, interpretationFilters);

                    if (sortedGenes.length > 0) {
                        filters.push({'key': filterName, 'filter': flagCriteria, 'genes': sortedGenes });
                    }
                }
            }
        }

        let sortedFilters = filters.sort(function(filterObject1, filterObject2) {
            return filterObject1.filter.order > filterObject2.filter.order;
        })

        sortedFilters.forEach(function(filterObject) {
            filterObject.variantCount = 0;
            var variantIndex = 1;
            filterObject.genes.forEach(function(geneList) {

                // Sort the variants according to the Ranked Variants table features
                self.featureMatrixModel.setFeaturesForVariants(geneList.variants);
                geneList.variants = self.featureMatrixModel.sortVariantsByFeatures(geneList.variants);


                geneList.variants.forEach(function(variant) {
                    variant.ordinalFilter = variantIndex++;
                    filterObject.variantCount++;
                })

            })
        })
        return sortedFilters;
    }

    getFlaggedVariant(theVariant) {
        let self = this;
        var existingVariants = this.flaggedVariants.filter(function(v) {
            var matches = (
                self.globalApp.utility.stripRefName(v.chrom) == self.globalApp.utility.stripRefName(theVariant.chrom)
                && v.start === theVariant.start
                && v.ref === theVariant.ref
                && v.alt === theVariant.alt);
            return matches;
        })
        if (existingVariants && existingVariants.length > 0) {
            return existingVariants[0];
        } else {
            return null;
        }

    }

    getFlaggedVariantCount(isFullAnalysis, options={includeNotCategorized: false}) {
        let self = this;
        let theFlaggedVariants = self.flaggedVariants.filter(function(variant) {
            if (isFullAnalysis) {
                let include = true;
                if (!options.includeNotCategorized && variant.filtersPassed.length === 1 && variant.filtersPassed.indexOf("notCategorized") === 0) {
                    include = false;
                }
                return include && !self.geneModel.isCandidateGene(variant.geneName);

            } else {
                return self.geneModel.isCandidateGene(variant.geneName);
            }
        });
        return theFlaggedVariants.length;
    }

    getFlaggedVariantsByFilter(geneName) {
        let self = this;
        let variants = this.flaggedVariants.filter(function (flaggedVariant) {
            return flaggedVariant.gene.gene_name === geneName;
        });
        let filterToVariantMap = {};
        variants.forEach(function (v) {
            if (v.isUserFlagged) {
                var filterName = 'userFlagged';
                let theVariants = filterToVariantMap[filterName];
                if (theVariants == null) {
                    theVariants = [];
                    filterToVariantMap[filterName] = theVariants;
                }
                theVariants.push(v);
            } else if (v.filtersPassed) {
                v.filtersPassed.forEach(function (filterName) {
                    let theVariants = filterToVariantMap[filterName];
                    if (theVariants == null) {
                        theVariants = [];
                        filterToVariantMap[filterName] = theVariants;
                    }
                    theVariants.push(v);
                })
            }
        })
        let filters = [];
        for (var filterName in self.filterModel.flagCriteria) {
            var theFilter = self.filterModel.flagCriteria[filterName];
            var theVariants = filterToVariantMap[filterName];

            if (theVariants) {
                // Sort the variants according to the Ranked Variants table features
                self.featureMatrixModel.setFeaturesForVariants(theVariants);
                let sortedVariants = self.featureMatrixModel.sortVariantsByFeatures(theVariants);

                filters.push({filter: theFilter, variants: sortedVariants});
            }
        }
        return filters.sort(function (filterObject1, filterObject2) {
            return filterObject1.filter.order > filterObject2.filter.order;
        })
    }

    // TODO: used for clin and left navigation panel functionality - incorporate in future
    getFlaggedVariantsForGene(geneName) {
        let self = this;
        let theVariants = this.flaggedVariants.filter(function(flaggedVariant) {
            return flaggedVariant.gene.gene_name === geneName;
        });
        return theVariants;
    }

    removeFlaggedVariantsForGene(geneName) {
        let self = this;
        let variantsToRemove = this.flaggedVariants.filter(function (flaggedVariant) {
            return flaggedVariant.gene.gene_name === geneName;
        });
        variantsToRemove.forEach(function (variant) {
            var index = self.flaggedVariants.indexOf(variant);
            variant.filtersPassed = [];
            if (index !== -1) {
                self.flaggedVariants.splice(index, 1);
            }
        })
    }


    _organizeVariantsForFilter(filterName, userFlagged, isFullAnalysis, interpretationFilters) {
        let self = this;
        let geneMap        = {};
        let flaggedGenes   = [];
        if (this.flaggedVariants) {
            this.flaggedVariants.forEach(function(variant) {
                if ((userFlagged && variant.isUserFlagged) ||
                    (filterName && variant.filtersPassed && variant.filtersPassed.indexOf(filterName) >= 0)) {

                    let keepVariant = interpretationFilters && interpretationFilters.length > 0 ? interpretationFilters.indexOf(variant.interpretation ? variant.interpretation : 'not-reviewed') >= 0 : true;

                    let flaggedGene = geneMap[variant.gene.gene_name];

                    let keepGene = isFullAnalysis ? !self.geneModel.isCandidateGene(variant.gene.gene_name) : self.geneModel.isCandidateGene(variant.gene.gene_name);


                    if (keepGene && keepVariant) {
                        if (flaggedGene == null) {
                            flaggedGene = {};
                            flaggedGene.gene = variant.gene;
                            flaggedGene.transcript = variant.transcript;
                            flaggedGene.variants = [];
                            geneMap[variant.gene.gene_name] = flaggedGene;
                            flaggedGenes.push(flaggedGene);
                        }
                        flaggedGene.variants.push(variant);
                    }
                }
            });

            let sortedGenes = flaggedGenes.sort(function(a,b) {
                return self.geneModel.compareDangerSummary(a.gene.gene_name, b.gene.gene_name);
            });
            let i = 0;
            sortedGenes.forEach(function(flaggedGene) {
                // Sort the variants according to the Ranked Variants table features
                self.featureMatrixModel.setFeaturesForVariants(flaggedGene.variants);
                let sortedVariants = self.featureMatrixModel.sortVariantsByFeatures(flaggedGene.variants);

                sortedVariants.forEach(function(variant) {
                    variant.index = i;
                    i++;
                });
                flaggedGene.variants = sortedVariants;
            });
            return sortedGenes;

        } else {
            return [];
        }
    }

    captureFlaggedVariants(dangerSummary) {
        let self = this;
        if (self.flaggedVariants == null) {
            self.flaggedVariants = [];
        }

        if (dangerSummary) {
            for (var filterName in self.filterModel.flagCriteria) {
                if (dangerSummary.badges[filterName]) {
                    let theFlaggedVariants = dangerSummary.badges[filterName];
                    theFlaggedVariants.forEach(function(variant) {
                        let matchingVariant = self.getFlaggedVariant(variant);
                        if (!matchingVariant) {
                            self.flaggedVariants.push(variant);
                        }
                    })
                }
            }
        }
    }

    /* Creates nodes for Sankey AF visualization. intervalSize must be between 0-1 and divide evenly into 1.
     * Otherwise, intervalSize will default to 0.10 */
    getVariantAFNodes(intervalSize) {
        const self = this;

        if (intervalSize == null || intervalSize >= 1 || intervalSize <= 0) {
            intervalSize = 0.10;
        }
        let nodeList = [];
        let intervals = 1 / intervalSize;

        let normalIdx = 0;
        let tumorIdx = 0;
        self.getCanonicalModels().forEach((model) => {
            let modelIdx = model.isTumor ? tumorIdx : normalIdx;
            let currModelColor = self.globalApp.utility.getTrackColor(modelIdx, model.isTumor);
            for (let i = 0; i < intervals; i++) {
                // Add in descending order
                let topRange = Math.round((1 - (i * intervalSize)) * 100) / 100;
                let bottomRange = Math.round((topRange - intervalSize) * 100) / 100;
                let node = {sampleId: model.id, bottomRange: (bottomRange + ''), topRange: (topRange + ''), color: currModelColor, isEmpty: true};
                nodeList.push(node);
            }
            if (model.isTumor) {
                tumorIdx += 1;
            } else {
                normalIdx += 1;
            }
        });
        return nodeList;
    }

    /* Takes in list of nodes and creates list of links for sankey AF visualization. */
    getVariantAFLinks(nodes, intervalSize) {
        const self = this;

        // Make sure we're in the correct order
        let orderedModels = self.sortSampleModels(self.getCanonicalModels(), self.sampleMap, false);

        let linkHash = {};
        let linkList = [];
        let maxLinkValue = 1;
        let scaleIntervals = true;

        for (let i = 0; i < orderedModels.length - 1; i++) {
            let currModel = orderedModels[i];
            let currModelVars = currModel.loadedVariants != null ? currModel.loadedVariants.features : [];
            let currModelVarHash = currModel.variantIdHash;
            let nextModel = orderedModels[i+1];
            let nextModelVars = nextModel.loadedVariants != null ? nextModel.loadedVariants.features : [];
            let nextModelVarHash = nextModel.variantIdHash;

            // Force links from currModel's 0 -> nextModel's N by adding fake variants to list
            nextModelVars.forEach((variant) => {
                let prevVar = currModelVarHash[variant.id];
                if (!prevVar) {
                    let fakeVar = { id: variant.id, af: 0 };
                    currModelVars.push(fakeVar);
                }
            });

            // Force links from currModel's N -> nextModel's 0 by adding fake variants to list
            currModelVars.forEach((variant) => {
                let nextVar = nextModelVarHash[variant.id];
                if (!nextVar) {
                    let fakeVar = { id: variant.id, af: 0 };
                    nextModelVars.push(fakeVar);
                }
            });

            // Pre-populate hash with each level to same level to get alignment correct (e.g. s0_0 -> s1_0)
            let currModelNodes = nodes.filter((node) => {
                return node.sampleId === currModel.id;
            });
            currModelNodes.forEach((node) => {
                let linkId = self.getLinkId(currModel.id, nextModel.id, node);
                let flatLink = { id: linkId, source: (currModel.id + '_' + node.bottomRange), sourceModelId: currModel.id,
                    target: (nextModel.id + '_' + node.bottomRange), targetModelId: nextModel.id, variantIds: [], value: 1, isSpacer: true };
                linkList.push(flatLink);
                linkHash[linkId] = flatLink;
            });

            // Get next model nodes for sorting later
            let nextModelNodes = nodes.filter((node) => {
                return node.sampleId === nextModel.id;
            });

            // Add actual data
            currModelVars.forEach((variant) => {
                // Get variant AF for this sample time point
                let currRawAf = 0;
                if (variant.genotypeDepth > 0) {
                    currRawAf = parseInt(variant.genotypeAltCount) / parseInt(variant.genotypeDepth);
                }

                // Get variant AF for next sample time point - or set to zero if DNE
                let nextRawAf = 0;
                let nextVar = nextModelVarHash[variant.id];
                if (nextVar && nextVar.genotypeDepth > 0) {
                    nextRawAf = parseInt(nextVar.genotypeAltCount) / parseInt(nextVar.genotypeDepth);
                }

                // Find where both AFs fall in the given nodes
                let topBottomRange = 1.0 - intervalSize;
                let currRoundedAf = 0;
                currModelNodes.forEach((node) => {
                    let bottomRange = parseFloat(node.bottomRange);
                    let topRange = parseFloat(node.topRange);
                    if (currRawAf >= bottomRange && currRawAf < topRange) {
                        currRoundedAf = bottomRange;
                    } else if (currRawAf > topBottomRange && currRawAf <= 1.0) {
                        currRoundedAf = topBottomRange;
                    }
                });
                let nextRoundedAf = 0;
                nextModelNodes.forEach((node) => {
                    let bottomRange = parseFloat(node.bottomRange);
                    let topRange = parseFloat(node.topRange);
                    if (nextRawAf >= bottomRange && nextRawAf < topRange) {
                        nextRoundedAf = bottomRange;
                    } else if (nextRawAf > topBottomRange && nextRawAf <= 1.0) {
                        nextRoundedAf = topBottomRange;
                    }
                });

                // Check to see if an object exists within linkHash that already has this range
                let linkId = currModel.id + "_" + currRoundedAf + '_' + nextModel.id + '_' + nextRoundedAf;
                let currLink = linkHash[linkId];

                // If it does, increment value and add varId to the list
                if (currLink) {
                    // If this is the first time we're switching from fake to real link, don't increment
                    if (currLink.isSpacer === false) {
                        currLink.value += 1;
                    }
                    currLink.variantIds.push(variant.id);
                    currLink.isSpacer = false;

                    // Mark source and targets as not empty
                    let sourceAndTarget = nodes.filter((currNode) => {
                        return (currLink.source === currNode.sampleId + '_' + currNode.bottomRange) ||
                            (currLink.target === currNode.sampleId + '_' + currNode.bottomRange);
                    });
                    sourceAndTarget.forEach((node) => {
                        node.isEmpty = false;
                    });
                // If not, create new link object
                } else {
                    let newLink = { id: linkId, source: (currModel.id + '_' + currRoundedAf), sourceModelId: currModel.id,
                        target: (nextModel.id + '_' + nextRoundedAf), targetModelId: nextModel.id, variantIds: [variant.id], value: 1, isSpacer: false };
                    linkHash[linkId] = newLink;
                    linkList.push(newLink);

                    // Mark source and targets as not empty
                    let sourceAndTarget = nodes.filter((currNode) => {
                        return (newLink.source === currNode.sampleId + '_' + currNode.bottomRange) ||
                            (newLink.target === currNode.sampleId + '_' + currNode.bottomRange);
                    });
                    sourceAndTarget.forEach((node) => {
                        node.isEmpty = false;
                    });
                }
            });
        }

        // Find max node height
        if (scaleIntervals) {
            let numIntervals = 1 / intervalSize;
            for (let i = 0; i < orderedModels.length; i++) {
                for (let j = 0; j < numIntervals; j++) {
                    let bottomRange = Math.round(j * intervalSize * 100) / 100;

                    // Get links with this as source
                    let fromLinks = linkList.filter((link) => {
                        return link.source === (orderedModels[i].id + '_' + bottomRange);
                    });

                    // Get links with this as target
                    let toLinks = linkList.filter((link) => {
                        return link.target === (orderedModels[i].id + '_' + bottomRange);
                    });

                    // Tally all values from outgoing links and set max
                    let fromMax = 0;
                    fromLinks.forEach((link) => {
                        fromMax += link.value;
                    });

                    // Tally all values from incoming links and set max
                    let toMax = 0;
                    toLinks.forEach((link) => {
                        toMax += link.value;
                    });

                    let currMax = Math.max(toMax, fromMax);
                    if (currMax > maxLinkValue) {
                        maxLinkValue = currMax;
                    }
                }
            }

            // Adjust each node so scaled to the same approximate height
            // NOTE: this helps to make nodes a bit better, but impossible to make completely synonymous
            for (let i = 0; i < orderedModels.length -1; i++) {
                for (let j = 0; j < numIntervals; j++) {
                    let bottomRange = Math.round(j * intervalSize * 100) / 100;

                    // Get links with this as source
                    let currLinks = linkList.filter((link) => {
                        return link.source === (orderedModels[i].id + '_' + bottomRange);
                    });

                    // Tally all values from links and set max
                    let currMax = 0;
                    currLinks.forEach((link) => {
                        currMax += link.value;
                    });

                    if (currMax < maxLinkValue) {
                        let valDiff = maxLinkValue - currMax;

                        let currFakeLink = currLinks.filter((link) => {
                            return link.isSpacer === true;
                        });
                        // If we still have a fake link, adjust that value
                        if (currFakeLink.length > 0) {
                            currFakeLink[0].value += valDiff;
                        } else {
                            // Otherwise, add another fake link to pad value
                            if (i === (orderedModels.length - 1)) {
                                // Slightly diff approach for last column
                                let fakeLink = { source: (orderedModels[i-1].id + '_' + bottomRange), target: (orderedModels[i].id + '_' + bottomRange), variantIds: [], value: valDiff, isSpacer: true };
                                linkList.push(fakeLink);
                            } else {
                                let fakeLink = { source: (orderedModels[i].id + '_' + bottomRange), target: (orderedModels[i+1].id + '_' + bottomRange), variantIds: [], value: valDiff, isSpacer: true };
                                linkList.push(fakeLink);
                            }
                        }
                    }
                }
            }
        }
        return linkList;
    }

    getLinkId(currModelId, nextModelId, node) {
        return currModelId + "_" + node.bottomRange + '_' + nextModelId + '_' + node.bottomRange;
    }

    /* Returns IDs of all variants, in any track, that passes filters. Used to populate feature matrix. */
    getAllFilterPassingVariants() {
        const self = this;
        let passingFeatureLookup = {};
        self.getCanonicalModels().forEach((model) => {
            if (model.vcfData && model.vcfData.features) {
                model.vcfData.features.forEach((feature) => {
                    if (feature.passesFilters === true) {
                        passingFeatureLookup[feature.id] = true;
                    }
                })
            }
        });
        return passingFeatureLookup;
    }
}

export default CohortModel;
