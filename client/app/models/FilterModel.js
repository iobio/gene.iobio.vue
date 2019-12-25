/* Encapsulates logic for filtering variants from a single patient (aka a single normal vs. multiple tumor samples).
 * Among other things, determines if a variant is somatic or not by incorporating filter logic. */

class FilterModel {
    constructor(translator) {

        /* Somatic settings */
        this.DEFAULT_SOMATIC_CUTOFFS = {
            'normalAltFreq': 0.01,      // Must be between 0-1
            'normalAltCount': 2,
            'tumorAltFreq': 0.10,       // Must be between 0-1
            'tumorAltCount': 5
        };

        this.somaticFilterSettings = {
            'tumorAltFreq': this.DEFAULT_SOMATIC_CUTOFFS.tumorAltFreq * 100,
            'tumorAltCount': this.DEFAULT_SOMATIC_CUTOFFS.tumorAltCount,
            'normalAltFreq': this.DEFAULT_SOMATIC_CUTOFFS.normalAltFreq * 100,
            'normalAltCount': this.DEFAULT_SOMATIC_CUTOFFS.normalAltCount
        };

        /* Quality settings */
        this.DEFAULT_QUALITY_FILTERING_CRITERIA = {
            'totalCountCutoff': 15,
            'qualScoreCutoff': 20
        };

        this.qualityFilterSettings = {
            'genotypeDepth': this.DEFAULT_QUALITY_FILTERING_CRITERIA.totalCountCutoff,
            'qual': this.DEFAULT_QUALITY_FILTERING_CRITERIA.qualScoreCutoff
        };

        // The categories by which the filters are grouped
        this.filterCategories =
            [
                {
                    name: 'annotation',
                    display: 'ANNOTATION FILTERS',
                    active: false,
                    custom: false,
                    description: 'Filter by variant effect, impact, or type',
                    icon: 'category'
                },
                {
                    name: 'somatic',
                    display: 'SOMATIC FILTERS',
                    active: false,
                    custom: false,
                    description: 'Select a threshold for allele frequencies and observation counts by which to identify somatic variants',
                    icon: 'flash_on'
                },
                {
                    name: 'quality',
                    display: 'QUALITY FILTERS',
                    active: false,
                    custom: false,
                    description: 'Filter variants by observation counts',
                    icon: 'star'
                },
                {
                    name: 'frequencies',
                    display: 'FREQUENCY FILTERS',
                    active: false,
                    custom: false,
                    description: 'Filter by variant frequency within population databases',
                    icon: 'people_outline'
                }
            ];

        // Note: if filter names match variant object field names, don't have to manually add filter to getVarValue in Variant.d3 class
        // The actual filters that can be applied
        this.filters = {
            'annotation': [
                {name: 'impact', display: 'Impact', active: false, open: false, type: 'checkbox', tumorOnly: false},
                {name: 'type', display: 'Type', active: false, open: false, type: 'checkbox', tumorOnly: false}],
            'somatic': [
                {
                    name: 'tumorAltFreq',
                    display: 'Tumor Allele Frequency',
                    active: true,
                    open: false,
                    type: 'slider',
                    tumorOnly: true,
                    minValue: 0,
                    maxValue: 100,
                    labelSuffix: '%',
                    initLogic: '>=',
                    initVal: this.somaticFilterSettings['tumorAltFreq'],
                    currLogic: '>=',
                    currVal: this.somaticFilterSettings['tumorAltFreq']
                },
                {
                    name: 'tumorAltCount',
                    display: 'Tumor Alt. Observations',
                    active: true,
                    open: false,
                    type: 'slider',
                    tumorOnly: true,
                    labelSuffix: '',
                    initLogic: '>=',
                    initVal: this.somaticFilterSettings['tumorAltCount'],
                    currLogic: '>=',
                    currVal: this.somaticFilterSettings['tumorAltCount']
                },
                {
                    name: 'normalAltFreq',
                    display: 'Normal Allele Frequency',
                    active: true,
                    open: false,
                    type: 'slider',
                    tumorOnly: false,
                    minValue: 0,
                    maxValue: 100,
                    labelSuffix: '%',
                    initLogic: '<=',
                    initVal: this.somaticFilterSettings['normalAltFreq'],
                    currLogic: '<=',
                    currVal: this.somaticFilterSettings['normalAltFreq']
                },
                {
                    name: 'normalAltCount',
                    display: 'Normal Alt. Observations',
                    active: true,
                    open: false,
                    type: 'slider',
                    tumorOnly: false,
                    labelSuffix: '',
                    initLogic: '<=',
                    initVal: this.somaticFilterSettings['normalAltCount'],
                    currLogic: '<=',
                    currVal: this.somaticFilterSettings['normalAltCount'],
                }],
            'frequencies': [
                {name: 'g1000', display: '1000G', active: false, open: false, type: 'cutoff', tumorOnly: false},
                {name: 'exac', display: 'ExAC', active: false, open: false, type: 'cutoff', tumorOnly: false},
                {name: 'gnomad', display: 'gnomAD', active: false, open: false, type: 'cutoff', tumorOnly: false}],
            'quality': [
                {
                    name: 'genotypeDepth',
                    display: 'Total Observations',
                    active: true,
                    open: false,
                    type: 'slider',
                    tumorOnly: false,
                    minValue: 0,
                    maxValue: 100,
                    labelSuffix: '',
                    initLogic: '>=',
                    initVal: this.qualityFilterSettings['genotypeDepth'],
                    currLogic: '>=',
                    currVal: this.qualityFilterSettings['genotypeDepth']
                },
                {
                    name: 'qual',
                    display: 'Quality Score',
                    active: true,
                    open: false,
                    type: 'slider',
                    tumorOnly: false,
                    minValue: 0,
                    maxValue: 500,
                    labelSuffix: '',
                    initLogic: '>=',
                    initVal: this.qualityFilterSettings['qual'],
                    currLogic: '>=',
                    currVal: this.qualityFilterSettings['qual']
                }]
        };

        this.checkboxLists = {
            impact: [
                {name: 'HIGH', displayName: 'HIGH', model: true},
                {name: 'MODERATE', displayName: 'MODERATE', model: true},
                {name: 'MODIFIER', displayName: 'MODIFIER', model: true},
                {name: 'LOW', displayName: 'LOW', model: true}
            ],
            type: [
                {name: 'del', displayName: 'DELETION', model: true},
                {name: 'ins', displayName: 'INSERTION', model: true},
                {name: 'mnp', displayName: 'MNP', model: true},
                {name: 'snp', displayName: 'SNP', model: true}
            ]
        };

        this.modelFilters = {
            'known-variants': {
                'vepImpact': []
            },
            'cosmic-variants': {
                'vepImpact': []
            }
        };

        this.translator = translator;

        /* The current settings */
        // this.currentSomaticCutoffs = this.DEFAULT_SOMATIC_CUTOFFS;
        // this.currentSomaticLogic = this.DEFAULT_SOMATIC_LOGIC;
    }

    /* Marks variants as somatic, or non-inherited, if they fulfill the following:
     *
     *  The normal track exhibits the following logic: (A || B) && C
     *     where
     *      A) does not contain the variant in question
     *      B) does contain the variant but at a threshold meeting slider-set criteria
     *      C) is visible/ not filtered out by other non-somatic filters (including quality)
     *
     *  AND
     *
     *  the tumor track exhibits the following logic: A && B
     *     where
     *      A) contains the variant at a threshold meeting slider-set criteria
     *      B) is visible/ not filtered out by other non-somatic filters (including quality)
     *
     *  Marks variants as inherited, if they fulfill the following:
     *
     *  The normal track contains the variant with quality thresholds met AND the tumor track contains the variant with quality thresholds met but not somatic ones
     *
     *  Returns a dictionary of somatic variant IDs from all tumor tracks combined.
     */
    promiseAnnotateVariantInheritance(resultMap) {
        const self = this;

        return new Promise((resolve, reject) => {
            let normalSamples = [];
            let tumorSamples = [];
            let tumorSampleModelIds = [];
            let somaticVarLookup = {};
            let inheritedVarLookup = {};
            let i = 0;

            // Classify samples
            for (i = 0; i < Object.keys(resultMap).length; i++) {
                let sampleId = Object.keys(resultMap)[i];
                let currData = $.extend({}, Object.values(resultMap)[i].model.vcfData);
                let sampleObj = {'currData': currData, 'model': Object.values(resultMap)[i].model};
                if (!(resultMap[sampleId].isTumor) && sampleId !== 'known-variants' && sampleId !== 'cosmic-variants') {
                    normalSamples.push(sampleObj);
                } else if (sampleId !== 'known-variants' && sampleId !== 'cosmic-variants') {
                    tumorSamples.push(sampleObj);    // Don't need reference to model for tumor
                    tumorSampleModelIds.push(sampleId);
                }
            }

            // Make normal variant hash table
            let passesNormalFiltersLookup = {};   // Hash of variants that pass the Normal somatic filters ONLY (normal alt count and normal alt freq)
            let normalContainsLookup = {};        // Hash of all variants in normal sample
            let passesOtherFiltersLookup = {};    // Hash of variants in normal track ONLY that pass any active filters except somatic related (this includes quality)
            normalSamples.forEach((currNorm) => {
                if (currNorm && currNorm.currData && currNorm.currData.features.length > 0) {
                    let normFeatures = currNorm.currData.features;
                    let filteredNormFeatures = [];
                    normFeatures.forEach((feature) => {
                        feature.isInherited = true;   // Need to mark all normal variants as inherited from null
                        normalContainsLookup[feature.id] = true;
                        if (feature.passesFilters === true) {
                            filteredNormFeatures.push(feature);
                            inheritedVarLookup[feature.id] = true;
                            passesOtherFiltersLookup[feature.id] = true;
                        }
                    });
                    for (i = 0; i < filteredNormFeatures.length; i++) {
                        let currFeat = filteredNormFeatures[i];
                        let currNormAf = Math.round(currFeat.genotypeAltCount / currFeat.genotypeDepth * 100) / 100;
                        let passesNormalCount = self.matchAndPassFilter(self.getFilterField('somatic', 'normalAltCount', 'currLogic'), currFeat.genotypeAltCount, self.getFilterField('somatic', 'normalAltCount', 'currVal'));
                        let passesNormalAf = self.matchAndPassFilter(self.getFilterField('somatic', 'normalAltFreq', 'currLogic'), currNormAf, self.getAdjustedCutoff(self.getFilterField('somatic', 'normalAltFreq', 'currVal'), 'normalAltFreq'));
                        if (currFeat.id != null && passesNormalCount && passesNormalAf) {
                            passesNormalFiltersLookup[currFeat.id] = true;
                        }
                    }
                }
            });

            // Mark somatic and inherited variants
            let coverageCheckFeatures = [];
            for (i = 0; i < tumorSamples.length; i++) {
                let currTumor = tumorSamples[i];
                if (currTumor.currData && currTumor.currData.features && currTumor.currData.features.length > 0) {
                    let tumorFeatures = currTumor.currData.features;

                    // Don't need to look at tumor features that don't pass other filters
                    let filteredTumorFeatures = tumorFeatures.filter((feature) => {
                        return feature.passesFilters === true;
                    });
                    filteredTumorFeatures.forEach((feature) => {
                        let currAltFreq = Math.round(feature.genotypeAltCount / feature.genotypeDepth * 100) / 100;
                        let passesTumorCount = self.matchAndPassFilter(self.getFilterField('somatic', 'tumorAltCount', 'currLogic'), feature.genotypeAltCount, self.getFilterField('somatic', 'tumorAltCount', 'currVal'));
                        let passesTumorAf = self.matchAndPassFilter(self.getFilterField('somatic', 'tumorAltFreq', 'currLogic'), currAltFreq, self.getAdjustedCutoff(self.getFilterField('somatic', 'tumorAltFreq', 'currVal'), 'tumorAltFreq'));

                        if (passesNormalFiltersLookup[feature.id] && passesTumorAf && passesTumorCount) {
                            // Found a somatic variant
                            feature.isInherited = false;
                            somaticVarLookup[feature.id] = true;
                            inheritedVarLookup[feature.id] = false;
                        } else if (normalContainsLookup[feature.id] == null && passesTumorAf && passesTumorCount) {
                            // We might have found a somatic variant, need to check coverage in normal BAM first
                            coverageCheckFeatures.push({
                                'chrom': feature.chrom,
                                'start': feature.start,
                                'end': feature.end,
                                'id': feature.id
                            });
                        } else if (passesOtherFiltersLookup[feature.id]) {
                            // We have an inherited variant
                            feature.isInherited = true;
                            inheritedVarLookup[feature.id] = true;
                        } else {
                            // Else, we don't pass some sort of quality filter
                            // Or we aren't in the normal lookup
                            // Or we are in the normal lookup but we don't pass Tumor criteria

                            feature.isInherited = null;
                            inheritedVarLookup[feature.id] = false;

                            // Have to mark actual variant in normal sample as null b/c that's what feature matrix tooltips look at
                            if (normalContainsLookup[feature.id]) {
                                normalSamples[0].model.variantIdHash[feature.id].isInherited = null;
                            }
                        }
                    })
                }
            }
            //  Check to make sure there's enough coverage in normal to actually call somatic
            if (coverageCheckFeatures.length > 0) {
                // TODO: think this is getting called per normal and tumor comparison - can consolidate into a single call grouped by sample ID?
                normalSamples[0].model.promiseGetBamDepthForVariants(coverageCheckFeatures)
                    .then((depthList) => {
                        for (let i = 0; i < depthList.length; i++) {
                            let depth = depthList[i][1];
                            let feature = coverageCheckFeatures[i];
                            if (depth >= self.DEFAULT_QUALITY_FILTERING_CRITERIA['totalCountCutoff']) {
                                // Have to check to see if all of the tumor samples have this variant
                                tumorSamples.forEach((sample) => {
                                    let tumorModel = sample.model;
                                    let matchingFeature = tumorModel.variantIdHash[feature.id];
                                    if (matchingFeature) {
                                        matchingFeature.isInherited = false;
                                    }
                                });
                                somaticVarLookup[feature.id] = true;
                                inheritedVarLookup[feature.id] = false;
                            } else {
                                feature.isInherited = null;
                                inheritedVarLookup[feature.id] = false;  // Still need to mark this as false to display as undetermined in feature matrix
                            }
                            // Save the read count in the normal model for tooltip use so we don't have to access BAM again
                            normalSamples[0].model.somaticVarCoverage.push(depthList[i]);
                        }
                        resolve({'somaticLookup': somaticVarLookup, 'inheritedLookup': inheritedVarLookup});
                    }).catch((error) => {
                    reject('Something went wrong in promiseAnnotateVariantInheritance: ' + error);
                })
            } else {
                resolve({'somaticLookup': somaticVarLookup, 'inheritedLookup': inheritedVarLookup});
            }
        })
    }

    matchAndPassFilter(logic, varVal, cutoffVal) {
        let passesFilter = false;
        varVal = parseInt(varVal);
        cutoffVal = parseInt(cutoffVal);
        switch (logic) {
            case '<': {
                passesFilter = varVal < cutoffVal;
                break;
            }
            case '<=': {
                passesFilter = varVal <= cutoffVal;
                break;
            }
            case '=': {
                passesFilter = varVal === cutoffVal;
                break;
            }
            case '>=': {
                passesFilter = varVal >= cutoffVal;
                break;
            }
            case '>': {
                passesFilter = varVal > cutoffVal;
                break;
            }
            default: {
                break;
            }
        }
        return passesFilter;
    }

    /* Need a special case here because of drop-down menu structure in Vue. */
    updateFilterLogic(filterName, newLogic) {
        const self = this;
        for (var filterCatName in self.filters) {
            let filterCat = self.filters[filterCatName];
            filterCat.forEach((filter) => {
                if (filter.name === filterName) {
                    filter.currLogic = newLogic;
                }
            })
        }
    }

    /* Takes in a list of variants, sets passesFilter field on each variant to true,
     * if it passes all of the current filter criteria within this model. */
    markFilteredVariants(variants, isTumorSample) {
        const self = this;

        // Get active filters
        let checkboxFilters = self.getCheckboxFilters();
        let cutoffFilters = isTumorSample ? self.getTumorCutoffFilters() : self.getNormalCutoffFilters();

        for (let variant of variants) {
            // Innocent until proven guilty
            variant.passesFilters = true;

            // Checkbox filters
            for (let filter of checkboxFilters) {
                const field = filter[0];
                const value = filter[1];

                if (self.getVarField(variant, field) === value) {
                    variant.passesFilters = false;
                    break;
                }
            }
            // Don't check cutoff filters unless we need to
            if (!variant.passesFilters) {
                continue;
            }
            // Cutoff filters
            for (let currFilter of cutoffFilters) {
                let filterCutoff = currFilter.currVal;
                let filterLogic = currFilter.currLogic;

                // Some filter names need a translate
                const adjustedName = self.translator.getTranslatedFilterName(currFilter.name);  // TODO: test this for each one
                let varValue = self.getAdjustedCutoff(variant[adjustedName]);
                if (!self.matchAndPassFilter(filterLogic, varValue, filterCutoff)) {
                    variant.passesFilters = false;
                    break;
                }
            }
        }
    }

    /* Marks if filter is active or inactive. Used to control indicators in filter drawer. */
    setFilterState(parentFilterName, filterName, filterState) {
        const self = this;
        let filterObj = self.getFilterObject(parentFilterName, filterName);
        if (filterObj) {
            filterObj.active = filterState;
        }
    }

    /* Marks if larger category is active or inactive. Used to control indicators in filter drawer. */
    setCategoryState(categoryName, categoryState) {
        const self = this;
        let filterObj = self.filterCategories.filter((filt) => {
            return filt.name === categoryName;
        });
        if (filterObj.length > 0) {
            filterObj[0].active = categoryState;
        }
    }

    clearAllFilters() {
        const self = this;
        self.filterCategories.forEach((filter) => {
            filter.active = false;
        });
    }

    setModelFilter(id, key, entries) {
        this.modelFilters[id][key] = entries;
    }

    /*** HELPERS ***/

    /* Returns appropriately formatted filter display name for chips/labels. */
    getFilterDisplayName(name, parentFilterName) {
        let filterDisplayName = '';
        if (parentFilterName === 'impact') {
            filterDisplayName = name.toLowerCase();
            filterDisplayName = filterDisplayName.charAt(0).toUpperCase() + filterDisplayName.slice(1);
            filterDisplayName += ' Impact';
        } else if (parentFilterName === 'type') {
            if (name !== 'SNP' && name !== 'MNP') {
                filterDisplayName = filterDisplayName.toLowerCase();
                filterDisplayName = filterDisplayName.charAt(0).toUpperCase() + filterDisplayName.slice(1);
            }
            filterDisplayName += 's';
        } else if (parentFilterName === 'frequencies') {
            filterDisplayName = name + ' Freq';
        } else {
            filterDisplayName = name;
        }
        return filterDisplayName;
    }

    getFilterObject(parentFilterName, filterName) {
        const self = this;

        let filterObj = self.filters[parentFilterName].filter((cat) => {
            return cat.name === filterName;
        });
        if (filterObj.length > 0) {
            return filterObj[0];
        } else {
            return null;
        }
    }

    getAdjustedCutoff(cutoffValue, filterName) {
        const filtersNeedAdjusting = {
            'tumorAltFreq': true,
            'normalAltFreq': true
        };
        if (filtersNeedAdjusting[filterName]) {
            return cutoffValue / 100;
        } else {
            return cutoffValue;
        }
    }

    getFilterField(parentFilterName, filterName, fieldName) {
        const self = this;
        let filterObj = self.getFilterObject(parentFilterName, filterName);
        return filterObj[fieldName];
    }

    getCheckboxFilters() {
        const self = this;
        let typesToHide = [];
        for (var listCatName in self.checkboxLists) {
            let currList = self.checkboxLists[listCatName];
            currList.forEach((filter) => {
                if (!filter.model) {
                    typesToHide.push([listCatName, filter.name]);
                }
            })
        }
        return typesToHide;
    }

    /* Returns filters that should be applied to tumor tracks.
     * Does NOT include 'somatic' filters because those are used
     * only for styling variants, not drawing/filtering out. */
    getTumorCutoffFilters() {
        const self = this;
        const tumorFilters = [];
        for (var filterCatName in self.filters) {
            if (filterCatName !== 'annotation' && filterCatName !== 'somatic') {
                const currFilters = self.filters[filterCatName];
                currFilters.forEach((currFilter) => {
                    if (currFilter.active) {
                        tumorFilters.push(currFilter);
                    }
                });
            }
        }
        return tumorFilters;
    }

    /* Returns filters that should be applied to normal tracks.
     * Does NOT include 'somatic' filters because those are used
     * only for styling variants, not drawing/filtering out. */
    getNormalCutoffFilters() {
        const self = this;
        const normalFilters = [];
        for (var filterCatName in self.filters) {
            if (filterCatName !== 'annotation' && filterCatName !== 'somatic') {
                const currFilters = self.filters[filterCatName];
                currFilters.forEach((currFilter) => {
                    if (!currFilter.tumorOnly && currFilter.active) {
                        normalFilters.push(currFilter);
                    }
                });
            }
        }
        return normalFilters;
    }

    /* Returns the value of the variant according to the field name argument.
     * Sometimes these need a bit of translating - if not, returns simple value according to key. */
    getVarField(variant, fieldName) {
        if (!variant || variant[fieldName] == null) {
            console.log('Could not retrieve field from variant');
        } else {
            if (fieldName === 'impact') {
                let impactObj = variant['highestImpactVep'];
                let keys = Object.keys(impactObj);
                return (impactObj && keys.length > 0) ? keys[0] : null;
            } else {
                return variant[fieldName];
            }
        }
    }
//
//     populateEffectFilters(resultMap) {
//         let self = this;
//         for (var key in resultMap) {
//             resultMap[key].features.forEach(function (variant) {
//                 if (variant.hasOwnProperty('effect')) {
//                     for (var effect in variant.effect) {
//                         self.snpEffEffects[effect] = effect;
//                     }
//                 }
//                 if (variant.hasOwnProperty('vepConsequence')) {
//                     for (var vepConsequence in variant.vepConsequence) {
//                         self.vepConsequences[vepConsequence] = vepConsequence;
//                     }
//                 }
//             });
//         }
//     }
//
//     populateRecFilters(resultMap) {
//         let self = this;
//
//         if (self.recFilters == null) {
//             self.recFilters = {};
//         }
//         for (var key in resultMap) {
//             resultMap[key].features.forEach(function (variant) {
//                 if (!variant.hasOwnProperty('fbCalled') || variant.fbCalled !== 'Y') {
//                     self.recFilters[variant.recfilter] = variant.recfilter;
//                 }
//             });
//         }
//     }
//
//
//     hasFilters() {
//         return this.getFilterString().length > 0;
//     }
//
//     getFilterString() {
//         let self = this;
//
//         var filterString = "";
//         var filterObject = self.getFilterObject();
//
//
//         var AND = function (filterString) {
//             if (filterString.length > 0) {
//                 return " <span class='filter-element'>and</span> ";
//             } else {
//                 return "";
//             }
//         }
//
//         var filterBox = function (filterString) {
//             return "<span class=\"filter-flag filter-element label label-primary\">" + filterString + "</span>";
//         }
//
//
//         // When low coverage filter applied, we only filter on this, not any other criteria.
//         if (this.applyLowCoverageFilter) {
//             filterString += filterBox("Exon coverage min < " + this.geneCoverageMin + " OR median < " + this.geneCoverageMedian + " OR mean < " + this.geneCoverageMean);
//             return filterString;
//         }
//
//         var affectedFilters = [];
//         if (filterObject.affectedInfo) {
//             affectedFilters = filterObject.affectedInfo.filter(function (info) {
//                 return info.filter && info.status == 'affected';
//             });
//             if (affectedFilters.length > 0) {
//                 var buf = "";
//                 affectedFilters.forEach(function (info) {
//                     if (buf.length > 0) {
//                         buf += ", ";
//                     }
//                     buf += info.label;
//                 })
//                 filterString += AND(filterString) + filterBox("Present in affected: " + buf);
//             }
//         }
//
//         var unaffectedFilters = [];
//         if (filterObject.affectedInfo) {
//             unaffectedFilters = filterObject.affectedInfo.filter(function (info) {
//                 return info.filter && info.status == 'unaffected';
//             });
//             if (unaffectedFilters.length > 0) {
//                 var buf = "";
//                 unaffectedFilters.forEach(function (info) {
//                     if (buf.length > 0) {
//                         buf += ", ";
//                     }
//                     buf += info.label;
//                 })
//                 filterString += AND(filterString) + filterBox("Absent in unaffected: " + buf);
//             }
//         }
//
//
// //    if ($('#exonic-only-cb').is(":checked")) {
// //      filterString += AND(filterString) + filterBox("not intronic");
// //    }
//
//         if (filterObject.afMin != null && filterObject.afMax != null) {
//             if (filterObject.afMin >= 0 && filterObject.afMax < 1) {
//                 filterString += AND(filterString) + filterBox("Allele freqency between " + filterObject.afMin + " and  " + filterObject.afMax);
//             }
//         }
//
//         if (filterObject.coverageMin && filterObject.coverageMin > 0) {
//             if (filterString.length > 0) {
//                 filterString += AND(filterString) + filterBox("coverage at least " + filterObject.coverageMin + "X");
//             }
//         }
//
//
//         var annots = {};
//         for (var key in filterObject.annotsToInclude) {
//             var annot = filterObject.annotsToInclude[key];
//             if (annot.state) {
//                 var annotObject = annots[annot.key];
//                 if (annotObject == null) {
//                     annotObject = {values: [], label: annot.label};
//                     annots[annot.key] = annotObject;
//                 }
//                 annotObject.values.push((annot.not ? "NOT " : "") + annot.valueDisplay);
//             }
//         }
//
//         for (var key in annots) {
//             var annotObject = annots[key];
//             var theValues = "";
//             annotObject.values.forEach(function (theValue) {
//                 if (theValues.length > 0) {
//                     theValues += ", "
//                 } else if (annotObject.values.length > 1) {
//                     theValues += "(";
//                 }
//                 theValues += theValue;
//             });
//             if (annotObject.values.length > 1) {
//                 theValues += ")";
//             }
//
//             filterString += AND(filterString) + filterBox(annotObject.label + '&nbsp;&nbsp;' + theValues);
//         }
//         return filterString;
//     }

    /* GENE LEVEL coverage */
    whichLowCoverage(gc) {
        let fields = {};
        fields.min = +gc.min < this.geneCoverageMin ? '< ' + this.geneCoverageMin : null;
        fields.median = +gc.median < this.geneCoverageMedian ? '< ' + this.geneCoverageMedian : null;
        fields.mean = +gc.mean < this.geneCoverageMean ? '< ' + this.geneCoverageMean : null;
        return fields;
    }

    isLowCoverage(gc) {
        return +gc.min < this.geneCoverageMin
            || +gc.median < this.geneCoverageMedian
            || +gc.mean < this.geneCoverageMean;
    }
    //
    // getAffectedFilterInfo(refreshedAffectedInfo) {
    //     var self = this;
    //
    //     if (refreshedAffectedInfo) {
    //         self.affectedInfo = refreshedAffectedInfo;
    //     }
    //
    //     if (refreshedAffectedInfo) {
    //         self.affectedInfo.filter(function (info) {
    //             return info.model.isTumor();
    //         })
    //             .forEach(function (info) {
    //                 //var cb = $('#present-in-affected').find("#" + info.id + " input");
    //                 //info.filter = (cb.is(":checked"));
    //             });
    //
    //         self.affectedInfo.filter(function (info) {
    //             return !info.model.isTumor();
    //         })
    //             .forEach(function (info) {
    //                 //var cb = $('#absent-in-unaffected').find("#" + info.id + " input");
    //                 //info.filter = (cb.is(":checked"));
    //             });
    //
    //     }
    //     return this.affectedInfo;
    // }
    //
    //
    // clearAffectedFilters() {
    //     let self = this;
    //
    //     if (self.affectedInfo) {
    //         self.affectedInfo.filter(function (info) {
    //             return info.model.isAffected() && info.relationship != 'proband';
    //         })
    //             .forEach(function (info) {
    //                 //var cb = $('#present-in-affected').find("#" + info.id + " input");
    //                 //cb.prop('checked', false);
    //                 info.filter = false;
    //             });
    //
    //         self.affectedInfo.filter(function (info) {
    //             return !info.model.isAffected();
    //         })
    //             .forEach(function (info) {
    //                 //var cb = $('#absent-in-unaffected').find("#" + info.id + " input");
    //                 //cb.prop('checked', false);
    //                 info.filter = false;
    //             });
    //
    //
    //         //self.affectedInfo = getAffectedInfo();
    //     }
    //
    //     return self.affectedInfo;
    // }
    //
    // flagVariants(theVcfData) {
    //     let self = this;
    //     var badges = {};
    //     for (var key in this.flagCriteria) {
    //         if (this.flagCriteria[key].active) {
    //             badges[key] = [];
    //         }
    //     }
    //     badges.flagged = [];
    //
    //     if (theVcfData && theVcfData.features) {
    //         theVcfData.features.filter(function (variant) {
    //             return variant.zygosity == null || variant.zygosity.toUpperCase() != 'HOMREF';
    //         })
    //             .forEach(function (variant) {
    //                 var badgePassState = {};
    //                 for (var key in self.flagCriteria) {
    //                     if (self.flagCriteria[key].active) {
    //                         badgePassState[key] = false;
    //                     }
    //                 }
    //                 badgePassState.flagged = false;
    //
    //                 if (variant.isUserFlagged) {
    //                     badgePassState['userFlagged'] = true;
    //                 } else {
    //                     variant.isFlagged = false;
    //                     variant.featureClass = "";
    //                     for (var badge in self.flagCriteria) {
    //                         if (self.flagCriteria[badge].active) {
    //
    //                             var passes = self.determinePassCriteria(badge, variant);
    //
    //                             if (passes.all) {
    //                                 badgePassState[badge] = true;
    //                             }
    //                         }
    //                     }
    //
    //                     // If a badge is exclusive of passing other criteria, fail the badge
    //                     // if the other badges passed the criteria for the filter
    //                     // Example:  highOrModerate is exclusive of the clinvar badge.
    //                     //           So if the variant passes the clinvar criteria, it does
    //                     //           not pass the highOrModerate criteria.
    //                     for (var badge in self.flagCriteria) {
    //                         var badgeCriteria = self.flagCriteria[badge];
    //                         if (badgeCriteria.exclusiveOf) {
    //                             var matchesOther = false;
    //                             badgeCriteria.exclusiveOf.forEach(function (exclusiveBadge) {
    //                                 if (badgePassState[exclusiveBadge]) {
    //                                     matchesOther = true;
    //                                 }
    //                             })
    //                             if (matchesOther) {
    //                                 badgePassState[badge] = false;
    //                             }
    //                         }
    //                     }
    //
    //
    //                 }
    //                 // Now add the variant to any badges that passes the critera
    //                 var filtersPassed = [];
    //                 for (var filterName in self.flagCriteria) {
    //                     if (badgePassState[filterName]) {
    //                         filtersPassed.push(filterName);
    //                         badges[filterName].push(variant);
    //                     }
    //                 }
    //                 if (filtersPassed.length > 0) {
    //                     variant.isFlagged = true;
    //                     variant.featureClass = 'flagged';
    //                     variant.filtersPassed = filtersPassed;
    //                 }
    //
    //                 if (variant.isFlagged) {
    //                     badges.flagged.push(variant);
    //                 }
    //
    //
    //             })
    //
    //     }
    //     return badges;
    //
    // }
    //
    // determinePassCriteria(badge, variant, options) {
    //     let self = this;
    //     var badgeCriteria = self.flagCriteria[badge];
    //     var passes = {
    //         all: false,
    //         af: false,
    //         impact: false,
    //         consequence: false,
    //         clinvar: false,
    //         inheritance: false,
    //         zygosity: false,
    //         depth: false,
    //         userFlagged: false
    //     };
    //
    //     if (badgeCriteria.userFlagged == true) {
    //         if (variant.isUserFlagged) {
    //             passes.userFlagged = true;
    //             passes.all = true;
    //         }
    //     } else {
    //         if (badgeCriteria.maxAf == null || (variant.afHighest <= badgeCriteria.maxAf)) {
    //             passes.af = true;
    //         }
    //         if (badgeCriteria.minGenotypeDepth == null || (variant.genotypeDepth >= badgeCriteria.minGenotypeDepth)) {
    //             passes.depth = true;
    //         }
    //         if (badgeCriteria.impact && badgeCriteria.impact.length > 0) {
    //             badgeCriteria.impact.forEach(function (key) {
    //                 if (Object.keys(variant.highestImpactVep).indexOf(key) >= 0) {
    //                     passes.impact = true;
    //                 }
    //             })
    //         } else {
    //             passes.impact = true;
    //         }
    //         if (badgeCriteria.consequence && badgeCriteria.consequence.length > 0) {
    //             badgeCriteria.consequence.forEach(function (key) {
    //                 if (Object.keys(variant.vepConsequence).indexOf(key) >= 0) {
    //                     passes.consequence = true;
    //                 }
    //             })
    //         } else {
    //             passes.consequence = true;
    //         }
    //         if (badgeCriteria.clinvar == null || badgeCriteria.clinvar.length == 0 || badgeCriteria.clinvar.indexOf(variant.clinvar) >= 0) {
    //             passes.clinvar = true;
    //         }
    //         if (badgeCriteria.inheritance == null || badgeCriteria.inheritance.length == 0 || badgeCriteria.inheritance.indexOf(variant.inheritance) >= 0) {
    //             passes.inheritance = true;
    //         }
    //         if (badgeCriteria.zygosity == null || variant.zygosity.toUpperCase() == badgeCriteria.zygosity.toUpperCase()) {
    //             passes.zygosity = true;
    //         }
    //         if (options && options.ignore) {
    //             options.ignore.forEach(function (criterion) {
    //                 passes[criterion] = true;
    //             })
    //         }
    //         if (passes.af && passes.depth && passes.impact && passes.consequence && passes.clinvar && passes.inheritance && passes.zygosity) {
    //             passes.all = true;
    //         }
    //     }
    //
    //     return passes;
    // }


}

export default FilterModel;
