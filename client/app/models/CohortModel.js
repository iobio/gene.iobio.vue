import CacheHelper from './CacheHelper.js'
import VariantImporter from './VariantImporter.js'
import VariantTrioModel from './VariantTrioModel.js'
import SampleModel from './SampleModel.js'

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

        this.annotationScheme = 'vep';

        this.isLoaded = false;

        this.sampleModels = [];        // List of sample models correlated with this cohort
        this.sampleMap = {};           // Relateds IDs to model objects
        this.numNormalSamples = 0;``
        this.numTumorSamples = 0;

        this.mode = 'time';             // Indicates time-series mode
        this.maxAlleleCount = null;
        this.affectedInfo = null;
        this.maxDepth = 0;

        this.inProgress = {
            'loadingDataSources': false
        };

        this.genesInProgress = [];
        this.flaggedVariants = [];

        this.knownVariantsViz = 'variants'; // variants, histo, histoExon


        this.demoVcf = {
            'timeSeries': "https://s3.amazonaws.com/iobio/samples/vcf/platinum-exome.vcf.gz",
            'dual': "https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz"
        }
        this.demoBams = {
            'timeSeries': {
                't0': 'https://s3.amazonaws.com/iobio/samples/bam/NA12878.exome.bam',
                't1': 'https://s3.amazonaws.com/iobio/samples/bam/NA12892.exome.bam',
                't2': 'https://s3.amazonaws.com/iobio/samples/bam/NA12891.exome.bam',
                't3': 'https://s3.amazonaws.com/iobio/samples/bam/NA12878.exome.bam'
            },
            'dual': {
                'normal': 'https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12891.bam',
                'tumor': 'https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12878.bam'
            }
        }
        this.demoGenes = ['TP53', 'APC', 'BRCA2', 'PTEN', 'RB1'];


        this.demoModelInfos = {
            'timeSeries': [
                {
                    id: 't0',
                    isTumor: false,
                    name: 'NA12878',
                    'sample': 'NA12878',
                    'vcf': this.demoVcf.timeSeries,
                    'tbi': null,
                    'bam': this.demoBams.timeSeries['t0'],
                    'bai': null
                },
                {
                    id: 't1',
                    isTumor: true,
                    name: 'NA12892',
                    'sample': 'NA12892',
                    'vcf': this.demoVcf.timeSeries,
                    'tbi': null,
                    'bam': this.demoBams.timeSeries['t1'],
                    'bai': null
                },
                {
                    id: 't2',
                    isTumor: true,
                    name: 'NA12891',
                    'sample': 'NA12891',
                    'vcf': this.demoVcf.timeSeries,
                    'tbi': null,
                    'bam': this.demoBams.timeSeries['t2'],
                    'bai': null
                },
                {
                    id: 't3',
                    isTumor: false,
                    name: 'NA12891',
                    'sample': 'NA12891',
                    'vcf': this.demoVcf.timeSeries,
                    'tbi': null,
                    'bam': this.demoBams.timeSeries['t3'],
                    'bai': null
                }
            ],
            'dual': [
                {
                    id: 't0',
                    isTumor: false,
                    name: 'NA12878',
                    'sample': 'NA12878',
                    'vcf': this.demoVcf.dual,
                    'tbi': null,
                    'bam': this.demoBams.dual['normal'],
                    'bai': null
                },
                {
                    id: 't1',
                    isTumor: true,
                    name: 'NA12892',
                    'sample': 'NA12892',
                    'vcf': this.demoVcf.dual,
                    'tbi': null,
                    'bam': this.demoBams.dual['tumor'],
                    'bai': null
                }
            ]
        };
        this.eduTourModelInfos = {
            "1": [
                {
                    relationship: 'proband',
                    affectedStatus: 'affected',
                    name: 'Father',
                    'sample': 'sample2',
                    vcf: 'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
                    'tbi': null,
                    'bam': null,
                    'bai': null
                },
                {
                    relationship: 'proband',
                    affectedStatus: 'affected',
                    name: 'Jimmy',
                    'sample': 'sample3',
                    vcf: 'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
                    'tbi': null,
                    'bam': null,
                    'bai': null
                },
                {
                    relationship: 'proband',
                    affectedStatus: 'affected',
                    name: 'Bobby',
                    'sample': 'sample4',
                    vcf: 'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
                    'tbi': null,
                    'bam': null,
                    'bai': null
                },
                {
                    relationship: 'proband',
                    affectedStatus: 'affected',
                    name: 'Sarah',
                    'sample': 'sample5',
                    vcf: 'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
                    'tbi': null,
                    'bam': null,
                    'bai': null
                }
            ],
            "2": [
                {
                    relationship: 'proband',
                    affectedStatus: 'affected',
                    name: 'John',
                    'sample': 'sample1',
                    vcf: 'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
                    'tbi': null,
                    'bam': null,
                    'bai': null
                },
                {
                    relationship: 'proband',
                    affectedStatus: 'affected',
                    name: 'Diego',
                    'sample': 'sample3',
                    vcf: 'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
                    'tbi': null,
                    'bam': null,
                    'bai': null
                },
                {
                    relationship: 'proband',
                    affectedStatus: 'affected',
                    name: 'Anna',
                    'sample': 'sample2',
                    vcf: 'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
                    'tbi': null,
                    'bam': null,
                    'bai': null
                }
            ]

        };
        this.eduTourGeneNames = {
            "1": null,
            "2": ['VKORC1']
        };
        this.myGene2GeneNames = ['KDM1A'];
    }

    promiseInitDemo(demoKind = 'exome') {
        let self = this;
        return new Promise(function (resolve, reject) {
            var promise = null;
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


    promiseInitMyGene2(siteConfig, fileId) {
        let self = this;

        return new Promise(function (resolve, reject) {
            var validationMsg = "";
            if (siteConfig == null || Object.keys(siteConfig).length == 0 || !siteConfig.hasOwnProperty('mygene2')) {
                validationMsg += "<br>&nbsp;&nbsp;Site configuration is missing for mygene2. "
            } else {
                if (siteConfig.mygene2.tokenEndpoint == "") {
                    validationMsg += "<br>&nbsp;&nbsp;Missing site configuration field 'tokenEndpoint'. ";
                }
                if (siteConfig.mygene2.xAuthToken == "") {
                    validationMsg += "<br>&nbsp;&nbsp;Missing site configuration field 'xAuthToken'. ";
                }
            }
            if (fileId == null || fileId == "") {
                validationMsg += "<br>&nbsp;&nbsp;Missing request parameter 'fileId'."
            }

            if (!self.genomeBuildHelper.getCurrentBuild()) {
                validationMsg += "<br>&nbsp;&nbsp;Missing request parameter 'build'.";
            }

            if (validationMsg.length > 0) {
                alertify.confirm("Warning", "Cannot load data due to the following errors: " + validationMsg,
                    function () {
                        reject();
                    },
                    function () {
                        self.defaultingToDemoData = true;
                        self.promiseInitDemo()
                            .then(function () {
                                resolve();
                            })
                    }).set('labels', {ok: 'OK', cancel: 'Continue, but just use demo data'});
            } else {

                var endpointUrl = siteConfig.mygene2.tokenEndpoint + "token/" + fileId;

                $.ajax({
                    type: 'get',
                    url: endpointUrl,
                    dataType: 'json',
                    contentType: 'json',
                    xhrFields: {
                        withCredentials: true
                    },
                    headers: {
                        'X-Auth-Token': siteConfig.mygene2.xAuthToken
                    },
                    success: function (res) {
                        var vcfUrl = siteConfig.mygene2.dataEndpoint + res.token + "/" + res.fileUpload.name;
                        var modelInfo = {
                            relationship: 'proband',
                            affectedStatus: 'affected',
                            name: 'Proband',
                            'sample': '',
                            vcf: vcfUrl,
                            'tbi': null,
                            'bam': null,
                            'bai': null
                        };

                        var genePromise = null;
                        if (self.geneModel.geneNames.length === 0 && self.myGene2GeneNames) {
                            genePromise = self.geneModel.promiseCopyPasteGenes(self.myGene2GeneNames.join(","));
                        } else {
                            genePromise = Promise.resolve();
                        }

                        genePromise.then(function () {
                            self.promiseInit([modelInfo])
                                .then(function () {
                                    resolve();
                                })
                                .catch(function (error) {
                                    reject(error);
                                })

                        });
                    },
                    error: function (xhr, status, errorThrown) {
                        console.log("Error: " + errorThrown);
                        console.log("Status: " + status);
                        console.log(xhr);
                        console.log("Unable to get MyGene2 endpoint filenames");
                        alertify.confirm("Unable to obtain variant files using MyGene2 token.",
                            function () {
                                reject(errorThrown);
                            },
                            function () {
                                self.promiseInitDemo()
                                    .then(function () {
                                        resolve();
                                    })
                            }).set('labels', {ok: 'OK', cancel: 'Continue, but just use demo data'});
                    }
                });
            }
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

            let promises = [];
            modelInfos.forEach(function (modelInfo) {
                promises.push(self.promiseAddSample(modelInfo));
            });
            promises.push(self.promiseAddClinvarSample());        // TODO: promise add COSMIC sample


            Promise.all(promises)
                .then(function () {
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


    promiseAddSample(modelInfo) {
        let self = this;
        return new Promise(function (resolve, reject) {
            let vm = new SampleModel(self.globalApp);
            vm.init(self);
            vm.id = modelInfo.id;
            vm.name = modelInfo.name;
            vm.order = modelInfo.order;
            vm.isTumor = modelInfo.isTumor;
            vm.isBasicMode = self.isBasicMode;
            vm.isEduMode = self.isEduMode;

            let vcfPromise = null;
            if (modelInfo.vcf) {
                vcfPromise = new Promise(function (vcfResolve, vcfReject) {
                        vm.onVcfUrlEntered(modelInfo.vcf, modelInfo.tbi, function () {
                            if (modelInfo.name && modelInfo.name !== "") {
                                vm.setName(modelInfo.name);
                            } else {
                                vm.setName(modelInfo.id);
                            }
                            vcfResolve();
                        })
                    },
                    function (error) {
                        vcfReject(error);
                    });
            } else {
                //vm.name = null;
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

                    let theModel = {'model': vm};
                    self.sampleModels.push(vm);
                    self.sampleMap[modelInfo.id] = theModel;
                    resolve(vm);
                })

        })
    }

    /* Removes a sample model corresponding to the given id */
    removeSample(id) {
        let self = this;
        // Get


        // let order = self.sampleMap[id].model.order;
        // let lastIndex = self.sampleModels.length-1;
        // if (lastIndex > removeIndex) {
        //     for (let i = removeIndex; i < lastIndex; i++) {
        //         if (self.sampleMap[('s' + (i+1))] != null) {
        //             let nextModel = self.sampleModels[i+1];
        //             nextModel.order = nextModel.order - 1;
        //             nextModel.id = ('s' + i);
        //             self.sampleMap[('s' + i)] = nextModel;
        //             self.sampleModels[i] = self.sampleModels[i+1];
        //         }
        //     }
        //     delete self.sampleMap[('s' + lastIndex)];
        // } else {
        //     delete self.sampleMap[id];
        //     self.sampleModels.splice(lastIndex, 1);
        // }
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
                var vm = new SampleModel(self.globalApp);
                vm.init(self);
                vm.setRelationship('known-variants');
                vm.setName('Clinvar')
                var clinvarUrl = self.genomeBuildHelper.getBuildResource(self.genomeBuildHelper.RESOURCE_CLINVAR_VCF_S3);
                vm.onVcfUrlEntered(clinvarUrl, null, function () {
                        self.sampleModels.push(vm);

                        var sample = {'relationship': 'known-variants', 'model': vm};
                        self.sampleMap['known-variants'] = sample;

                        resolve(sample);
                    },
                    function (error) {
                        reject(error);
                    });
            })
        }

    }

    setTumorInfo(forceRefresh) {
        let self = this;
        if (self.affectedInfo == null || forceRefresh) {
            self.affectedInfo = [];
            self.getCanonicalModels().forEach(function (model) {
                if (model && model.isTumor()) {    // TODO: change known variants object name
                    let info = {};
                    info.model = model;
                    info.status = model.isTumor() ? 'tumor' : 'normal';
                    info.label = model.getName();
                    info.id = info.status + "-_-" + model.getName() + "-_-" + model.getSampleName();

                    self.affectedInfo.push(info);
                }
            });
        }
    }

    getNormalModel() {
        return this.sampleMap['s0'].model;
    }

    /* Returns model corresponding to name */
    getModel(name) {
        return this.sampleMap[name].model;
    }

    /* Returns all normal and tumor models */
    getCanonicalModels() {
        return this.sampleModels.filter(function (model) {
            return model.id !== 'known-variants';
        })
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
        var theVcfs = {};
        var cards = this.sampleModels.forEach(function (model) {
            if (!model.isAlignmentsOnly() && model.getRelationship() != 'known-variants') {
                if (model.vcfUrlEntered) {
                    theVcfs[model.vcf.getVcfURL()] = true;
                } else {
                    theVcfs[model.vcf.getVcfFile().name] = true;
                }

            }
        });
        return Object.keys(theVcfs).length == 1;
    }


    promiseLoadData(theGene, theTranscript, options) {
        let self = this;
        let promises = [];

        return new Promise(function (resolve, reject) {
            if (Object.keys(self.sampleMap).length == 0) {
                resolve();
            } else {

                self.startGeneProgress(theGene.gene_name);

                self.clearLoadedData();

                let cohortResultMap = null;

                let p1 = self.promiseLoadVariants(theGene, theTranscript, options)
                    .then(function (data) {
                        cohortResultMap = data.resultMap;
                    })
                promises.push(p1);

                let p2 = self.promiseLoadCoverage(theGene, theTranscript)
                    .then(function () {
                        self.setCoverage();
                    })
                promises.push(p2);

                Promise.all(promises)
                    .then(function () {

                        // Now summarize the danger for the selected gene
                        self.promiseSummarizeDanger(theGene, theTranscript, cohortResultMap.proband, null)
                            .then(function () {
                                self.setLoadedVariants(theGene);

                                self.endGeneProgress(theGene.gene_name);
                                resolve(cohortResultMap);
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
        if (self.knownVariantsViz == 'variants') {
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
            if (self.knownVariantsViz == 'histo') {
                binLength = Math.floor(((+theGene.end - +theGene.start) / $('#gene-viz').innerWidth()) * 8);
            }
            self.sampleMap['known-variants'].model.promiseGetKnownVariantHistoData(theGene, theTranscript, binLength)
                .then(function (data) {
                    self.getModel('known-variants').inProgress.loadingVariants = false;
                    self.setVariantHistoData('known-variants', data);
                    resolve(data);
                })
        })
    }

    promiseLoadVariants(theGene, theTranscript, options) {
        let self = this;

        return new Promise(function (resolve, reject) {
            self.promiseAnnotateVariants(theGene, theTranscript, self.mode == 'trio' && self.samplesInSingleVcf(), false, options)
                .then(function (resultMap) {
                    // Flag bookmarked variants
                    self.setVariantFlags(resultMap.proband);

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


    clearLoadedData() {
        let self = this;
        self.sampleModels.forEach(function (model) {
            model.loadedVariants = {loadState: {}, features: [], maxLevel: 1, featureWidth: 0};
            model.calledVariants = {loadState: {}, features: [], maxLevel: 1, featureWidth: 0};
            model.variantHistoData = [];
            model.coverage = [[]];
        });
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

    setLoadedVariants(gene, relationship = null) {
        let self = this;


        var filterAndPileupVariants = function (model, start, end, target = 'loaded') {
            var filteredVariants = $.extend({}, model.vcfData);
            filteredVariants.features = model.vcfData.features.filter(function (feature) {

                var isTarget = false;
                if (target == 'loaded' && (!feature.fbCalled || feature.fbCalled != 'Y')) {
                    isTarget = true;
                } else if (target == 'called' && feature.fbCalled && feature.fbCalled == 'Y') {
                    isTarget = true;
                }

                var isHomRef = feature.zygosity == null
                    || feature.zygosity.toUpperCase() == "HOMREF"
                    || feature.zygosity.toUpperCase() == "NONE"
                    || feature.zygosity == "";

                var inRegion = true;
                if (self.filterModel.regionStart && self.filterModel.regionEnd) {
                    inRegion = feature.start >= self.filterModel.regionStart && feature.start <= self.filterModel.regionEnd;
                }

                var passesModelFilter = self.filterModel.passesModelFilter(model.relationship, feature);

                return isTarget && !isHomRef && inRegion && passesModelFilter;
            });

            var pileupObject = model._pileupVariants(filteredVariants.features, start, end);
            filteredVariants.maxLevel = pileupObject.maxLevel + 1;
            filteredVariants.featureWidth = pileupObject.featureWidth;

            return filteredVariants;
        }


        self.sampleModels.forEach(function (model) {
            if (relationship == null || relationship == model.relationship) {
                if (model.vcfData && model.vcfData.features) {

                    var start = self.filterModel.regionStart ? self.filterModel.regionStart : gene.start;
                    var end = self.filterModel.regionEnd ? self.filterModel.regionEnd : gene.end;

                    var loadedVariants = filterAndPileupVariants(model, start, end, 'loaded');
                    model.loadedVariants = loadedVariants;

                    var calledVariants = filterAndPileupVariants(model, start, end, 'called');
                    model.calledVariants = calledVariants;

                    if (model.getRelationship() == 'proband') {
                        var allVariants = $.extend({}, model.loadedVariants);
                        allVariants.features = model.loadedVariants.features.concat(model.calledVariants.features);
                        self.featureMatrixModel.promiseRankVariants(allVariants);
                    }

                } else {
                    model.loadedVariants = {loadState: {}, features: []};
                    model.calledVariants = {loadState: {}, features: []}
                }

            }
        })
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
            var annotatePromises = [];
            var theResultMap = {};
            if (isMultiSample) {
                self.getCanonicalModels().forEach(function (model) {
                    if (!isBackground) {
                        model.inProgress.loadingVariants = true;
                    }
                })
                p = self.sampleMap['proband'].model.promiseAnnotateVariants(theGene, theTranscript, self.getCanonicalModels(), isMultiSample, isBackground)
                    .then(function (resultMap) {
                        if (!isBackground) {
                            self.getCanonicalModels().forEach(function (model) {
                                model.inProgress.loadingVariants = false;
                            })
                        }
                        theResultMap = resultMap;
                    })
                annotatePromises.push(p);
            } else {
                for (var rel in self.sampleMap) {
                    var model = self.sampleMap[rel].model;
                    if (model.isVcfReadyToLoad() || model.isLoaded()) {
                        if (!isBackground) {
                            model.inProgress.loadingVariants = true;
                        }
                        if (rel != 'known-variants') {
                            var p = model.promiseAnnotateVariants(theGene, theTranscript, [model], isMultiSample, isBackground)
                                .then(function (resultMap) {
                                    for (var theRelationship in resultMap) {
                                        if (!isBackground) {
                                            self.getModel(theRelationship).inProgress.loadingVariants = false;
                                        }
                                        theResultMap[theRelationship] = resultMap[theRelationship];
                                    }
                                })
                            annotatePromises.push(p);
                        }
                    }
                }
            }


            if (options.getKnownVariants) {
                let p = self.promiseLoadKnownVariants(theGene, theTranscript)
                    .then(function (result) {
                        if (self.knownVariantViz == 'variants') {
                            for (var rel in resultMap) {
                                theResultMap[rel] = resultMap[rel];
                            }

                        }
                    })
                annotatePromises.push(p);
            }

            Promise.all(annotatePromises)
                .then(function () {

                    self.promiseAnnotateWithClinvar(theResultMap, theGene, theTranscript, isBackground)
                        .then(function (data) {
                            resolve(data)
                        })

                });
        })
    }


    promiseAnnotateWithClinvar(resultMap, geneObject, transcript, isBackground) {
        let self = this;
        var formatClinvarKey = function (variant) {
            var delim = '^^';
            return variant.chrom + delim + variant.ref + delim + variant.alt + delim + variant.start + delim + variant.end;
        }

        var formatClinvarThinVariant = function (key) {
            var delim = '^^';
            var tokens = key.split(delim);
            return {'chrom': tokens[0], 'ref': tokens[1], 'alt': tokens[2], 'start': tokens[3], 'end': tokens[4]};
        }


        var refreshVariantsWithClinvarLookup = function (theVcfData, clinvarLookup) {
            theVcfData.features.forEach(function (variant) {
                var clinvarAnnot = clinvarLookup[formatClinvarKey(variant)];
                if (clinvarAnnot) {
                    for (var key in clinvarAnnot) {
                        variant[key] = clinvarAnnot[key];
                    }
                }
            })
            if (theVcfData.loadState == null) {
                theVcfData.loadState = {};
            }
            theVcfData.loadState['clinvar'] = true;
        }


        return new Promise(function (resolve, reject) {

            // Combine the trio variants into one set of variants so that we can access clinvar once
            // instead of on a per sample basis
            var uniqueVariants = {};
            var unionVcfData = {features: []}
            for (var rel in resultMap) {
                var vcfData = resultMap[rel];
                if (vcfData) {
                    if (!vcfData.loadState['clinvar'] && rel != 'known-variants') {
                        vcfData.features.forEach(function (feature) {
                            uniqueVariants[formatClinvarKey(feature)] = true;
                        })
                    }
                }
            }
            if (Object.keys(uniqueVariants).length == 0) {
                resolve(resultMap);
            } else {

                for (var key in uniqueVariants) {
                    unionVcfData.features.push(formatClinvarThinVariant(key));
                }

                var refreshVariantsFunction = self.globalApp.isClinvarOffline || self.globalApp.clinvarSource == 'vcf'
                    ? self.getProbandModel()._refreshVariantsWithClinvarVCFRecs.bind(self.getProbandModel(), unionVcfData)
                    : self.getProbandModel()._refreshVariantsWithClinvarEutils.bind(self.getProbandModel(), unionVcfData);

                self.getProbandModel().vcf.promiseGetClinvarRecords(
                    unionVcfData,
                    self.getProbandModel()._stripRefName(geneObject.chr),
                    geneObject,
                    self.geneModel.clinvarGenes,
                    refreshVariantsFunction)
                    .then(function () {

                        // Create a hash lookup of all clinvar variants
                        var clinvarLookup = {};
                        unionVcfData.features.forEach(function (variant) {
                            var clinvarAnnot = {};

                            for (var key in self.getProbandModel().vcf.getClinvarAnnots()) {
                                clinvarAnnot[key] = variant[key];
                                clinvarLookup[formatClinvarKey(variant)] = clinvarAnnot;
                            }
                        })

                        var refreshPromises = [];

                        // Use the clinvar variant lookup to initialize variants with clinvar annotations
                        for (var rel in resultMap) {
                            var vcfData = resultMap[rel];
                            if (vcfData) {
                                if (!vcfData.loadState['clinvar']) {
                                    var p = refreshVariantsWithClinvarLookup(vcfData, clinvarLookup);
                                    if (!isBackground) {
                                        self.getModel(rel).vcfData = vcfData;
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

        }

        return new Promise(function (resolve, reject) {

            if (self.isAlignmentsOnly() && !self.globalApp.autocall && (resultMap == null || resultMap.proband == null)) {
                resolve({'resultMap': {'proband': {features: []}}, 'gene': geneObject, 'transcript': theTranscript});
            } else {
                // Set the max allele count across all variants in the trio.  We use this to properly scale
                // the allele counts bars in the tooltip
                self.maxAlleleCount = 0;
                for (var rel in resultMap) {
                    self.maxAlleleCount = SampleModel.calcMaxAlleleCount(resultMap[rel], self.maxAlleleCount);
                }


                if (self.mode == 'single') {
                    // Determine harmful variants, cache data, etc.
                    resolveIt(resolve, resultMap, geneObject, theTranscript, options);
                } else {
                    // We only pass in the affected info if we need to sync up genotypes because samples
                    // where in separate vcf files
                    var syncGenotypes = self.isAlignmentsOnly() || self.samplesInSingleVcf() ? false : true;

                    var trioModel = new VariantTrioModel(resultMap.proband, resultMap.mother, resultMap.father, null, syncGenotypes, self.affectedInfo);

                    // Compare the mother and father variants to the proband, setting the inheritance
                    // mode on the proband's variants
                    trioModel.compareVariantsToMotherFather(function () {

                        self.getProbandModel().promiseDetermineCompoundHets(resultMap.proband, geneObject, theTranscript)
                            .then(function () {
                                // Now set the affected status for the family on each variant of the proband
                                self.getProbandModel().determineAffectedStatus(resultMap.proband, geneObject, theTranscript, self.affectedInfo, function () {

                                    // Determine harmful variants, cache data, etc.
                                    resolveIt(resolve, resultMap, geneObject, theTranscript, options);

                                });
                            })


                    })
                }

            }


        })

    }


    promiseCacheCohortVcfData(geneObject, theTranscript, dataKind, resultMap, cacheIt) {
        let self = this;
        return new Promise(function (resolve, reject) {
            // Cache vcf data for trio
            var cachePromise = null;
            if (cacheIt) {
                var cachedPromises = [];
                self.sampleModels.forEach(function (model) {
                    if (resultMap[model.getRelationship()]) {
                        var p = model._promiseCacheData(resultMap[model.getRelationship()], dataKind, geneObject.gene_name, theTranscript);
                        cachedPromises.push(p);
                    }
                })
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

    promiseSummarizeDanger(geneObject, theTranscript, probandVcfData, options) {
        let self = this;

        return new Promise(function (resolve, reject) {

            self.promiseGetCachedGeneCoverage(geneObject, theTranscript, false)
                .then(function (data) {

                    var geneCoverageAll = data.geneCoverage;
                    var theOptions = null;

                    self.getProbandModel().promiseGetDangerSummary(geneObject.gene_name)
                        .then(function (dangerSummary) {

                            // Summarize the danger for the gene based on the filtered annotated variants and gene coverage
                            var filteredVcfData = null;
                            var filteredFbData = null;
                            if (probandVcfData) {
                                if (probandVcfData.features && probandVcfData.features.length > 0) {
                                    filteredVcfData = self.getProbandModel().filterVariants(probandVcfData, self.filterModel.getFilterObject(), geneObject.start, geneObject.end, true);
                                    filteredFbData = self.getProbandModel().reconstituteFbData(filteredVcfData);
                                } else if (probandVcfData.features) {
                                    filteredVcfData = probandVcfData;
                                }


                                theOptions = $.extend({}, options);
                                if ((dangerSummary && dangerSummary.CALLED) || (filteredFbData && filteredFbData.features.length > 0)) {
                                    theOptions.CALLED = true;
                                }
                            }

                            if (filteredVcfData && filteredVcfData.features) {
                                return self.getProbandModel().promiseDetermineCompoundHets(filteredVcfData, geneObject, theTranscript);
                            } else {
                                return Promise.resolve();
                            }


                        })
                        .then(function (theVcfData) {
                            return self.getProbandModel().promiseSummarizeDanger(geneObject.gene_name, theVcfData, theOptions, geneCoverageAll, self.filterModel);
                        })
                        .then(function (theDangerSummary) {
                            self.geneModel.setDangerSummary(geneObject, theDangerSummary);
                            resolve();
                        })
                        .catch(function (error) {
                            var msg = "An error occurred in promiseSummarizeDanger() when calling SampleModel.promiseGetDangerSummary(): " + error;
                            console.log(msg);
                            reject(msg);
                        })


                })
                .catch(function (error) {
                    var msg = "An error occurred in CohortModel.promiseSummarizeDanger() when calling promiseGetCachedGeneCoverage(): " + error;
                    console.log(msg);
                    reject(msg);
                });

        });


    }


    promiseGetCachedGeneCoverage(geneObject, transcript, showProgress = false) {
        let self = this;
        return new Promise(function (resolve, reject) {
            var geneCoverageAll = {gene: geneObject, transcript: transcript, geneCoverage: {}};

            var promises = [];
            self.sampleModels.forEach(function (model) {
                if (model.isBamLoaded()) {
                    if (showProgress) {
                        //vc.showBamProgress("Analyzing coverage in coding regions");
                    }
                    var promise = model.promiseGetGeneCoverage(geneObject, transcript)
                        .then(function (data) {
                            var gc = data.geneCoverage;
                            geneCoverageAll.geneCoverage[data.model.getRelationship()] = gc;
                            if (showProgress) {
                                //getVariantCard(data.model.getRelationship()).endBamProgress();
                            }
                        })
                        .catch(function (error) {
                            reject(error);
                        })
                    promises.push(promise);
                }

            })
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
                if (model.isBamLoaded()) {
                    model.inProgress.loadingCoverage = true;
                    var p = new Promise(function (innerResolve, innerReject) {
                        var theModel = model;
                        theModel.getBamDepth(theGene, theTranscript, function (coverageData) {
                            theModel.inProgress.loadingCoverage = false;
                            theResultMap[theModel.relationship] = coverageData;
                            innerResolve();
                        });
                    })
                    promises.push(p);

                }
            })

            Promise.all(promises)
                .then(function () {
                    resolve(theResultMap);
                })

        })

    }

    promiseMarkCodingRegions(geneObject, transcript) {
        let self = this;
        return new Promise(function (resolve, reject) {

            var exonPromises = [];
            transcript.features.forEach(function (feature) {
                if (!feature.hasOwnProperty("danger")) {
                    feature.danger = {proband: false, mother: false, father: false};
                }
                if (!feature.hasOwnProperty("geneCoverage")) {
                    feature.geneCoverage = {proband: false, mother: false, father: false};
                }


                self.getCanonicalModels().forEach(function (model) {
                    var promise = model.promiseGetCachedGeneCoverage(geneObject, transcript)
                        .then(function (geneCoverage) {
                            if (geneCoverage) {
                                var matchingFeatureCoverage = geneCoverage.filter(function (gc) {
                                    return feature.start == gc.start && feature.end == gc.end;
                                });
                                if (matchingFeatureCoverage.length > 0) {
                                    var gc = matchingFeatureCoverage[0];
                                    feature.geneCoverage[model.getRelationship()] = gc;
                                    feature.danger[model.getRelationship()] = self.filterModel.isLowCoverage(gc);
                                } else {
                                    feature.danger[model.getRelationship()] = false;
                                }
                            } else {
                                feature.danger[model.getRelationship()] = false;
                            }

                        })
                    exonPromises.push(promise);
                })
            })

            Promise.all(exonPromises).then(function () {
                var sortedExons = self.geneModel._getSortedExonsForTranscript(transcript);
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
                                } else {
                                    trioFbData = data.trioFbData;


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

    addFlaggedVariant(theGene, theTranscript, variant) {
        var self = this;
        var existingVariants = this.flaggedVariants.filter(function (v) {
            var matches = (
                self.globalApp.utility.stripRefName(v.chrom) == self.globalApp.utility.stripRefName(variant.chrom)
                && v.start == variant.start
                && v.ref == variant.ref
                && v.alt == variant.alt);
            return matches;
        })
        if (existingVariants.length == 0) {
            this.flaggedVariants.push(variant);
            this._recacheForFlaggedVariant(theGene, theTranscript, variant);
        }
    }

    removeFilterPassed(variant, filterName) {
        if (variant && variant.filtersPassed && variant.filtersPassed.length > 0) {
            var idx = variant.filtersPassed.indexOf(filterName);
            if (idx >= 0) {
                variant.filtersPassed.splice(idx, 1);
            }
        }
    }

    removeFlaggedVariant(theGene, theTranscript, variant) {
        var self = this;
        var index = -1;
        var i = 0;
        this.removeFilterPassed(variant, "userFlagged");
        this.flaggedVariants.forEach(function (v) {
            var matches = (
                self.globalApp.utility.stripRefName(v.chrom) == self.globalApp.utility.stripRefName(variant.chrom)
                && v.start == variant.start
                && v.ref == variant.ref
                && v.alt == variant.alt);
            if (matches) {
                index = i;
                v.isUserFlagged = false;
                self.removeFilterPassed(v, "userFlagged");
            }
            i++;
        })
        if (index >= 0) {
            this.flaggedVariants.splice(index, 1);
        }
        this._recacheForFlaggedVariant(theGene, theTranscript, variant);
    }

    _recacheForFlaggedVariant(theGene, theTranscript, variant) {
        let self = this;
        self.getProbandModel().promiseGetVcfData(theGene, theTranscript)
            .then(function (data) {
                let cachedVcfData = data.vcfData;
                cachedVcfData.features.forEach(function (v) {
                    var matches = (
                        self.globalApp.utility.stripRefName(v.chrom) == self.globalApp.utility.stripRefName(variant.chrom)
                        && v.start == variant.start
                        && v.ref == variant.ref
                        && v.alt == variant.alt);
                    if (matches) {
                        v.isUserFlagged = variant.isUserFlagged;
                        v.filtersPassed = variant.filtersPassed;
                    }
                });
                self.getProbandModel()._promiseCacheData(cachedVcfData, CacheHelper.VCF_DATA, theGene.gene_name, theTranscript);
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
            return v.start == variant.start
                && v.ref == variant.ref
                && v.alt == variant.alt;
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

    organizeVariantsByFilterAndGene() {
        let self = this;
        let filters = [];
        for (var filterName in self.filterModel.flagCriteria) {
            let flagCriteria = self.filterModel.flagCriteria[filterName];
            var sortedGenes = self._organizeVariantsForFilter(filterName, flagCriteria.userFlagged);
            if (sortedGenes.length > 0) {
                filters.push({key: filterName, filter: flagCriteria, genes: sortedGenes});
            }
        }

        let sortedFilters = filters.sort(function (filterObject1, filterObject2) {
            return filterObject1.filter.order > filterObject2.filter.order;
        })

        var variantIndex = 0;
        sortedFilters.forEach(function (filterObject) {
            filterObject.genes.forEach(function (geneList) {

                // Sort the variants according to the Ranked Variants table features
                self.featureMatrixModel.setFeaturesForVariants(geneList.variants);
                geneList.variants = self.featureMatrixModel.sortVariantsByFeatures(geneList.variants)


                geneList.variants.forEach(function (variant) {
                    variant.index = variantIndex++;
                })
            })
        })
        return sortedFilters;

    }

    getFlaggedVariantsByFilter(geneName) {
        let self = this;
        let variants = this.flaggedVariants.filter(function (flaggedVariant) {
            return flaggedVariant.gene.gene_name == geneName;
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
                let sortedVariants = self.featureMatrixModel.sortVariantsByFeatures(theVariants)

                filters.push({filter: theFilter, variants: sortedVariants});
            }
        }
        return filters.sort(function (filterObject1, filterObject2) {
            return filterObject1.filter.order > filterObject2.filter.order;
        })


    }

    removeFlaggedVariantsForGene(geneName) {
        let self = this;
        let variantsToRemove = this.flaggedVariants.filter(function (flaggedVariant) {
            return flaggedVariant.gene.gene_name == geneName;
        });
        variantsToRemove.forEach(function (variant) {
            var index = self.flaggedVariants.indexOf(variant);
            variant.filtersPassed = [];
            if (index !== -1) {
                self.flaggedVariants.splice(index, 1);
            }
        })
    }


    _organizeVariantsForFilter(filterName, userFlagged) {
        let self = this;
        let geneMap = {};
        let flaggedGenes = [];
        if (this.flaggedVariants) {
            this.flaggedVariants.forEach(function (variant) {
                if ((userFlagged && variant.isUserFlagged) ||
                    (filterName && variant.filtersPassed && variant.filtersPassed.indexOf(filterName) >= 0)) {
                    let flaggedGene = geneMap[variant.gene.gene_name];
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
            })

            var sortedGenes = flaggedGenes.sort(function (a, b) {
                return self.geneModel.compareDangerSummary(a.gene.gene_name, b.gene.gene_name);
            })
            let i = 0;
            sortedGenes.forEach(function (flaggedGene) {
                // Sort the variants according to the Ranked Variants table features
                self.featureMatrixModel.setFeaturesForVariants(flaggedGene.variants);
                let sortedVariants = self.featureMatrixModel.sortVariantsByFeatures(flaggedGene.variants)

                sortedVariants.forEach(function (variant) {
                    variant.index = i;
                    i++;
                })
                flaggedGene.variants = sortedVariants;
            });
            return sortedGenes;

        } else {
            return [];
        }

    }

}

export default CohortModel;
