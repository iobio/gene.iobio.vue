class FeatureMatrixModel {
    constructor(globalApp, cohort, isEduMode, isBasicMode, tourNumber) {
        this.globalApp = globalApp;
        this.cohort = cohort;

        this.isEduMode = isEduMode;
        this.isBasicMode = isBasicMode;
        this.tourNumber = tourNumber;

        this.currentGene = null;
        this.currentTranscript = null;

        this.featureVcfData = [];
        this.rankedVariants = [];
        this.warning = "";

        this.inProgress = {
            loadingVariants: false,
            rankingVariants: false
        };


        this.matrixRows = [
            {
                name: 'Flagged',
                id: 'isFlagged',
                order: 0,
                index: 0,
                match: 'exact',
                attribute: 'filtersPassed',
                map: this.getTranslator().filtersPassedMap
            },
            {
                name: 'Somatic',
                id: 'isSomatic',
                order: 1,
                index: 1,
                match: 'exact',
                attribute: 'isInherited',
                map: this.getTranslator().somaticMap
            },
            {
                name: 'COSMIC',
                id: 'cosmic',
                order: 2,
                index: 2,
                match: 'exact',
                attribute: 'inCosmic',
                map: this.getTranslator().cosmicMap
            },

            {
                name: 'Pathogenicity - ClinVar',
                id: 'clinvar',
                order: 3,
                index: 3,
                match: 'exact',
                attribute: 'clinVarClinicalSignificance',
                map: this.getTranslator().clinvarMap
            },
            {
                name: 'Impact (VEP)',
                id: 'impact',
                order: 4,
                index: 4,
                match: 'exact',
                attribute: this.globalApp.impactFieldToColor,
                map: this.getTranslator().impactMap
            },
            {
                name: 'Most severe impact (VEP)',
                id: 'highest-impact',
                order: 5,
                index: 5,
                match: 'exact',
                attribute: this.globalApp.impactFieldToFilter,
                map: this.getTranslator().highestImpactMap
            },
            // {name:'SIFT'                         , id:'sift',           order:5, index:5, match: 'exact', attribute: 'sift',                             map: this.getTranslator().siftMap},
            // {name:'PolyPhen'                     , id:'polyphen',       order:6, index:6, match: 'exact', attribute: 'polyphen',                         map: this.getTranslator().polyphenMap},
            {
                name: 'Zygosity',
                id: 'zygosity',
                order: 6,
                index: 6,
                match: 'exact',
                attribute: 'zygosity',
                map: this.getTranslator().zygosityMap
            },
            // {name: 'Genotype', id: 'genotype', order: 6, index: 6, match: 'field', attribute: 'eduGenotypeReversed'}
        ];

        this.matrixRowsBasic = [
            {
                name: 'Pathogenicity - ClinVar',
                id: 'clinvar',
                order: 0,
                index: 0,
                match: 'field',
                height: 18,
                attribute: 'clinVarClinicalSignificance',
                formatFunction: this.formatClinvar,
                clickFunction: this.clickClinvar,
                rankFunction: this.getClinvarRank
            },
            {
                name: 'Inheritance Mode',
                id: 'inheritance',
                order: 1,
                index: 1,
                match: 'field',
                height: 18,
                attribute: 'inheritance',
                formatFunction: this.formatInheritance
            },
            {
                name: 'Transcript',
                id: 'transcript',
                order: 2,
                index: 2,
                match: 'field',
                height: 18,
                attribute: 'start',
                formatFunction: this.formatCanonicalTranscript
            },
            {
                name: 'cDNA',
                id: 'cdna',
                order: 3,
                index: 3,
                match: 'field',
                height: 18,
                attribute: 'vepHGVSc',
                formatFunction: this.formatHgvsC
            },
            {
                name: 'Protein',
                id: 'protien',
                order: 4,
                index: 4,
                match: 'field',
                height: 18,
                attribute: 'vepHGVSp',
                formatFunction: this.formatHgvsP
            },
            {name: 'Chr', id: 'chr', order: 5, index: 5, match: 'field', height: 18, attribute: 'chrom',},
            {name: 'Position', id: 'position', order: 6, index: 6, match: 'field', height: 18, attribute: 'start',},
            {name: 'Ref', id: 'ref', order: 7, index: 7, match: 'field', height: 18, attribute: 'ref',},
            {name: 'Alt', id: 'alt', order: 8, index: 8, match: 'field', height: 18, attribute: 'alt'},
            {
                name: 'Mutation Freq 1000G',
                id: 'af-1000g',
                order: 9,
                index: 9,
                match: 'field',
                height: 18,
                attribute: 'af1000G',
                formatFunction: this.formatAlleleFrequencyPercentage
            },
            {
                name: 'Mutation Freq gnomAD',
                id: 'af-gnomAD',
                order: 10,
                index: 10,
                match: 'field',
                height: 18,
                attribute: 'afgnomAD',
                formatFunction: this.formatAlleleFrequencyPercentage
            }
        ];
        this.filteredMatrixRows = null;
        this.featureUnknown = 199;
        this.matrixRowsEvaluated = false;
    }

    // Called on home page mount
    init(sampleModels = null) {
        let self = this;
        this.matrixRowsEvaluated = false;
        this.clearRankedVariants();

        // if (self.isBasicMode) {
        //   this.filteredMatrixRows = $.extend([], this.matrixRowsBasic);
        //
        // } else if (self.isEduMode) {
        //   this.filteredMatrixRows = $.extend([], this.matrixRows);
        //   this.removeRow('Pathogenicity - SIFT', self.filteredMatrixRows);
        //
        //   this.removeRow('Flagged', self.filteredMatrixRows);
        //   this.removeRow('Zygosity', self.filteredMatrixRows);
        //   this.removeRow('Bookmark', self.filteredMatrixRows);
        //
        //   // Only show genotype on second educational tour or level basic
        //   if (!self.isEduMode || self.tourNumber !== 2) {
        //     this.removeRow('Genotype', self.filteredMatrixRows);
        //   }
        //   // Only show inheritance on first educational tour or level basic
        //   if (!self.isEduMode || self.tourNumber !== 1) {
        //     this.removeRow('Inheritance Mode', self.filteredMatrixRows);
        //   }
        //   this.removeRow('Most severe impact (VEP)', self.filteredMatrixRows);
        //   this.removeRow('Present in Affected Sibs', self.filteredMatrixRows);
        //   this.removeRow('Absent in Unaffected Sibs', self.filteredMatrixRows);
        //   this.removeRow('Allele Frequency - 1000G', self.filteredMatrixRows);
        //   this.removeRow('Allele Frequency - ExAC', self.filteredMatrixRows);
        //
        //   this.setRowLabel('Impact - SnpEff',             'Severity');
        //   this.setRowLabel('Impact - VEP',                'Severity');
        //   this.setRowLabel('Pathogenicity - ClinVar',     'Known from research');
        //   this.setRowLabel('Pathogenicity - PolyPhen',    'Predicted effect');
        //   this.setRowLabel('Inheritance Mode',            'Inheritance');
        // } else {
        if (sampleModels != null) {
            this.addAllLoadedSamples(sampleModels);
        }
        this.filteredMatrixRows = $.extend([], this.matrixRows);
        //this.removeRow('Genotype', self.filteredMatrixRows);
        //}

    }

    getProgressText() {
        if (this.inProgress.loadingVariants) {
            return "Annotation variants";
        } else if (this.inProgress.rankingVariants) {
            return "Ranking variants";
        } else {
            return "";
        }
    }

    removeRow(searchTerm, theMatrixRows) {
        var idx = theMatrixRows.findIndex(function (row) {
            return row.name === searchTerm;
        });

        if (idx >= 0) {
            var removedOrder = theMatrixRows[idx].order;
            theMatrixRows.splice(idx, 1);

            var order = 0;
            for (order = 0; order < theMatrixRows.length; order++) {
                theMatrixRows[order].order = order;
            }
        }
    }

    /* Takes in a list of sample models, adds each of them according to their order property. */
    addAllLoadedSamples(nonRefSampleModels) {
        let self = this;

        nonRefSampleModels.forEach((model) => {
            let rowObj = {};
            rowObj['name'] = model.displayName;
            rowObj['id'] = model.id;
            rowObj['order'] = self.matrixRows.length;
            rowObj['index'] = self.matrixRows.length;
            rowObj['match'] = 'exact';
            rowObj['attribute'] = 'sampleRow';
            rowObj['map'] = self.getTranslator().samplePresenceMap;
            self.matrixRows.push(rowObj);
        })
    }

    setRowLabel(searchTerm, newRowLabel) {
        if (this.filteredMatrixRows) {
            this.filteredMatrixRows.forEach(function (row) {
                if (row.name.indexOf(searchTerm) >= 0) {
                    row.name = newRowLabel;
                }
            });
        }
    }

    setRowLabelById(id, newRowLabel) {
        if (this.filteredMatrixRows) {
            this.filteredMatrixRows.forEach(function (row) {
                if (row.id == id) {
                    row.name = newRowLabel;
                }
            });
        }

    }

    setRowAttributeById(id, newRowAttribute) {
        if (this.filteredMatrixRows) {
            this.filteredMatrixRows.forEach(function (row) {
                if (row.id == id) {
                    row.attribute = newRowAttribute;
                }
            });
        }

    }

    getRowAttribute(searchTerm) {
        var attribute = "";
        this.filteredMatrixRows.forEach(function (row) {
            if (row.name.indexOf(searchTerm) >= 0) {
                attribute = row.attribute;
            }
        });
        return attribute;
    }

    getRowOrder(searchTerm) {
        var order = "";
        this.filteredMatrixRows.forEach(function (row) {
            if (row.name.indexOf(searchTerm) >= 0) {
                order = row.order;
            }
        });
        return order;
    }


    getCellHeights() {
        return this.isBasicMode ? this.matrixRowsBasic.map(function (d) {
            return d.height
        }) : null;
    }

    getTranslator() {
        return this.cohort.translator;
    }

    getAffectedInfo() {
        return this.cohort.affectedInfo;
    }

    getGenericAnnotation() {
        return this.cohort.genericAnnotation;
    }

    clearRankedVariants() {
        this.rankedVariants = [];
    }

    setRankedVariants(regionStart, regionEnd) {
        if (this.featureVcfData) {
            if (regionStart && regionEnd) {
                this.rankedVariants = this.featureVcfData.features.filter(function (feature) {
                    return feature.start >= regionStart && feature.start <= regionEnd;
                })
            } else {
                this.rankedVariants = this.featureVcfData.features;
            }
        }

    }


    promiseRankVariants(theVcfData) {
        let self = this;
        self.featureVcfData = theVcfData;
        self.inProgress.rankingVariants = true;
        self.clearRankedVariants();

        return new Promise(function (resolve, reject) {

            var unfilteredVcfData = theVcfData;

            if (theVcfData == null) {
                self.currentGene = null;
                self.currentTranscript = null;
                resolve();
            } else {

                self.currentGene = theVcfData.gene;
                self.currentTranscript = theVcfData.transcript;

                // Figure out if we should show the unaffected sibs row
                if (!self.matrixRowsEvaluated) {
                    // TODO: no inheritance mode in onc
                    // if (self.cohort.mode === 'single') {
                    //   self.removeRow('Inheritance Mode', self.filteredMatrixRows);
                    // }

                    // TODO: no sibs in onc
                    // var affectedInfo = self.getAffectedInfo();
                    // var affected = affectedInfo.filter(function(info) {
                    //   return info.status === 'affected' && info.relationship === 'sibling';
                    // });
                    // var unaffected = affectedInfo.filter(function(info) {
                    //   return info.status === 'unaffected' && info.relationship === 'sibling';
                    // });
                    // if (affected.length === 0) {
                    //   self.removeRow('Present in Affected Sibs', self.filteredMatrixRows);
                    // }
                    // if (unaffected.length === 0) {
                    //   self.removeRow('Absent in Unaffected Sibs', self.filteredMatrixRows);
                    // }

                    // Figure out if we should show any rows for generic annotations
                    var genericMatrixRows = self.getGenericAnnotation().getMatrixRows(theVcfData.genericAnnotators);

                    genericMatrixRows.forEach(function (matrixRow) {
                        matrixRow.index = self.filteredMatrixRows.length;
                        matrixRow.order = self.filteredMatrixRows.length;
                        self.filteredMatrixRows.push(matrixRow);
                    });

                    self.matrixRowsEvaluated = true;
                }

                if (theVcfData != null) {
                    self.featureVcfData = {};
                    self.featureVcfData.features = [];
                    theVcfData.features.forEach(function (variant) {
                        self.featureVcfData.features.push(variant);
//            self.featureVcfData.features.push($.extend({}, variant));
                    });
                }

                // Sort the matrix rows
                self.filteredMatrixRows = self.filteredMatrixRows.sort(function (a, b) {
                    if (a.order === b.order) {
                        return 0;
                    } else if (a.order < b.order) {
                        return -1;
                    } else {
                        return 1;
                    }
                });

                // Fill all features used in feature matrix for each variant
                self.setFeaturesForVariants(self.featureVcfData.features);

                // Order the variants according to the features
                self.rankedVariants = self.sortVariantsByFeatures(self.featureVcfData.features);

                // For basic mode, filter out all variants that aren't flagged
                if (self.isBasicMode) {
                    self.rankedVariants = self.rankedVariants
                        .filter(function (variant) {
                            return variant.isFlagged;
                        })
                }

                if (self.rankedVariants.length === 0) {
                    self.warning = "0 variants";
                } else {
                    self.warning = "";
                }

                self.inProgress.rankingVariants = false;
                resolve();
            }
        })


    }

    /* Assigns feature objects to each variant which coordinates their sorting in the feature matrix model. */
    setFeaturesForVariants(theVariants) {
        let self = this;

        theVariants.forEach(function (variant) {
            var features = [];
            for (var i = 0; i < self.filteredMatrixRows.length; i++) {
                features.push(null);
            }

            self.filteredMatrixRows.forEach(function (matrixRow) {
                var rawValue = null;
                if (matrixRow.attribute instanceof Array) {
                    rawValue = self.getGenericAnnotation().getValue(variant, matrixRow.attribute);
                } else {
                    rawValue = variant[matrixRow.attribute];
                }
                var theValue = null;
                var mappedValue = null;
                var mappedClazz = null;
                var symbolFunction = null;
                var sampleTrackColor = null;    // Only used for variable colors for sample rows
                var bindTo = null;
                var isText = false;
                var clickFunction = matrixRow.clickFunction;
                // Don't fill in clinvar for now
                if (matrixRow.attribute === 'clinvar') {
                    rawValue = 'N';
                }

                // Input modification for somatic
                if (matrixRow.attribute === 'isInherited' && rawValue === false) {
                    rawValue = 'isSomatic';
                } else if (matrixRow.attribute === 'isInherited' && rawValue === true) {
                    rawValue = 'isInherited';
                }

                // Input modification for COSMIC
                if (matrixRow.attribute === 'inCosmic' && rawValue === true) {
                    rawValue = 'inCosmic';
                } else if (matrixRow.attribute === 'inCosmic') {
                    rawValue = 'notInCosmic';
                }

                // For sample presence rows
                if (matrixRow.attribute === 'sampleRow') {
                    // Get matching variants from cohort model
                    let matchingModel = self.cohort.getModel(matrixRow.id);
                    let varIdHash = matchingModel.variantIdHash;
                    if (varIdHash[variant.id] != null) {
                        if (matchingModel.isTumor) {
                            rawValue = 'tumorSample';
                        } else {
                            rawValue = 'normalSample';
                        }
                    } else {
                        rawValue = '';
                    }

                    // Get track color
                    sampleTrackColor = self.globalApp.utility.getTrackColor(matchingModel.categoryOrder, matchingModel.isTumor)
                }

                if (rawValue != null && (self.isNumeric(rawValue) || rawValue !== "")) {
                    if (matrixRow.match === 'field') {
                        if (matrixRow.formatFunction) {
                            theValue = matrixRow.formatFunction.call(self, variant, rawValue);
                        } else {
                            theValue = rawValue;
                        }
                        mappedClazz = matrixRow.attribute;
                        if (matrixRow.rankFunction) {
                            mappedValue = matrixRow.rankFunction.call(self, variant, rawValue);
                        } else {
                            mappedValue = theValue;
                        }
                        symbolFunction = matrixRow.symbolFunction ? matrixRow.symbolFunction : self.showTextSymbol;
                        bindTo = matrixRow.bind ? matrixRow.bind : null;
                        isText = matrixRow.symbolFunction ? false : true;
                    } else if (matrixRow.match === 'exact') {
                        // We are going to get the mapped value through exact match,
                        // so this will involve a simple associative array lookup.
                        // Some features (like impact) are multi-value and are stored in a
                        // an associative array.  In this case, we loop through the feature
                        // values, keeping the lowest (more important) mapped value.
                        if (self.isDictionary(rawValue)) {
                            // Iterate through the objects in the associative array.
                            // Keep the lowest mapped value
                            if (Object.keys(rawValue).length > 0) {
                                for (var val in rawValue) {
                                    var entry = matrixRow.map[val];
                                    if (entry != null && entry.symbolFunction && (mappedValue == null || entry.value < mappedValue)) {
                                        mappedValue = entry.value;
                                        mappedClazz = entry.clazz;
                                        symbolFunction = entry.symbolFunction;
                                        bindTo = entry.bind ? entry.bind : null;
                                        theValue = val;
                                    }
                                }
                            } else {
                                var entry = matrixRow.map.none;
                                if (entry != null && entry.symbolFunction && (mappedValue == null || entry.value < mappedValue)) {
                                    mappedValue = entry.value;
                                    mappedClazz = entry.clazz;
                                    symbolFunction = entry.symbolFunction;
                                    bindTo = entry.bind ? entry.bind : null;

                                    theValue = '';
                                }
                            }
                        } else {
                            if (matrixRow.map.hasOwnProperty(rawValue)) {
                                mappedValue = matrixRow.map[rawValue].value;
                                mappedClazz = matrixRow.map[rawValue].clazz;
                                symbolFunction = matrixRow.map[rawValue].symbolFunction;
                                bindTo = matrixRow.map[rawValue].bind ? matrixRow.map[rawValue].bind : null;
                                theValue = rawValue;
                            } else {
                                console.log("No matrix value to map to " + rawValue + " for " + matrixRow.attribute);
                            }

                        }
                    } else if (matrixRow.match === 'range') {
                        // If this feature is a range, get the mapped value be testing if the
                        // value is within a min-max range.
                        if (self.isNumeric(rawValue)) {
                            theValue = d3.format(",.3%")(+rawValue);
                            var lowestValue = 9999;
                            matrixRow.map.forEach(function (rangeEntry) {
                                if (+rawValue > rangeEntry.min && +rawValue <= rangeEntry.max) {
                                    if (rangeEntry.value < lowestValue) {
                                        lowestValue = rangeEntry.value;
                                        mappedValue = rangeEntry.value;
                                        mappedClazz = rangeEntry.clazz;
                                        symbolFunction = rangeEntry.symbolFunction;
                                        bindTo = rangeEntry.bind ? rangeEntry.bind : null;
                                    }
                                }
                            });

                            // TODO:  This should be more generic.  In this case, we want to classify
                            // the af level by glyph, but we want to rank with the af value (lowest sorts first)
                            if (matrixRow.id === 'af-highest') {
                                mappedValue = +rawValue;
                            }
                        }
                    }

                } else {
                    rawValue = '';
                    mappedClazz = '';
                }
                features[matrixRow.order] = {
                    'value': theValue,
                    'rank': (mappedValue ? mappedValue : self.featureUnknown),
                    'clazz': mappedClazz,
                    'symbolFunction': symbolFunction,
                    'isText': isText,
                    'bindTo': bindTo,
                    'clickFunction': clickFunction,
                    'color': sampleTrackColor
                };
            });

            variant.features = features;
        });
    }

    /* Orders the columns of variants based on the rank property */
    sortVariantsByFeatures(theVariants) {
        let self = this;
        // Sort the variants by the criteria that matches
        // For mygene2 basic, filter out everything that isn't clinvar pathogenic < 1% af
        return theVariants.sort(function (a, b) {
            // The features have been initialized in the same order as
            // the matrix column order. In each iteration,
            // exit with -1 or 1 if we have non-matching values;
            // otherwise, go to next iteration.  After iterating
            // through every column, if we haven't exited the
            // loop, that means all features of a and b match
            // so return 0;

            for (var i = 0; i < self.filteredMatrixRows.length; i++) {
                if (a.features[i] == null) {
                    return 1;
                } else if (b.features[i] == null) {
                    return -1;
                } else if (a.features[i].rank > 99 && b.features[i].rank > 99) {
                    // In this case, we don't consider the rank and will look at the next feature for ordering
                } else if (a.features[i].rank > 99) {
                    return 1;
                } else if (b.features[i].rank > 99) {
                    return -1;
                } else if (a.features[i].rank < b.features[i].rank) {
                    return -1;
                } else if (a.features[i].rank > b.features[i].rank) {
                    return 1;
                } else {
                    // Do nothing
                }
            }

            // All features between variant a and b have the same rank, so just sort
            // by position at this point
            return a.start - b.start;
        })
    }

    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    isDictionary(obj) {
        if (!obj) {
            return false;
        }
        if (Array.isArray(obj)) {
            return false;
        }
        if (obj.constructor != Object) {
            return false;
        }
        return true;
    }

    formatClinvar(variant, clinvarSig) {
        let self = this;
        var display = "";
        for (var key in clinvarSig) {
            if (key == "none" || key == "not_provided") {

            } else {
                // Highlight the column as 'danger' if variant is considered pathogenic or likely pathogenic
                if (self.isBasicMode) {
                    if (key.indexOf("pathogenic") >= 0) {
                        if (variant.featureClass == null) {
                            variant.featureClass = "";
                        }
                        variant.featureClass += " danger";
                    }
                }
                if (display.length > 0) {
                    display += ",";
                }
                display += key.split("_").join(' ');
            }
        }
        return display;
    }


    formatAlleleFrequencyPercentage(variant, value) {
        return value && value != "" && +value >= 0 ? this.globalApp.utility.round(+value * 100, 2) + "%" : "";
    }

    formatCanonicalTranscript(variant, value) {
        if (this.currentTranscript) {
            return this.globalApp.utility.stripTranscriptPrefix(this.currentTranscript.transcript_id);
        } else {
            return "";
        }
    }

    formatHgvsP(variant, value) {
        return this.globalApp.utility.formatHgvsP(variant, value);
    }

    formatHgvsC(variant, value) {
        return this.globalApp.utility.formatHgvsC(variant, value);
    }

    formatAfHighest(variant, afField) {
        return afField && afField.length > 0 && +variant[afField] < .1 ? this.globalApp.utility.percentage(variant[afField], false) : "";
    }

    formatInheritance(variant, value) {
        return this.getInheritanceLabel(value);
    }

    getInheritanceLabel(inheritance) {
        var matrixRow = this.getTranslator().inheritanceMap[inheritance];
        return matrixRow ? matrixRow.display : inheritance;
    }

    getClinvarRank(variant, clinvarSig) {
        var me = this;
        var lowestRank = 9999;
        for (var key in clinvarSig) {
            var rank = me.getTranslator().clinvarMap[key].value;
            if (rank < lowestRank) {
                lowestRank = rank;
            }
        }
        return lowestRank;
    }

    // TODO: will need a COSMIC rank here

    getImpactRank(variant, highestImpactVep) {
        var me = this;
        var lowestRank = 99;
        for (var key in highestImpactVep) {
            var rank = me.getTranslator().impactMap[key].value;
            if (rank < lowestRank) {
                lowestRank = rank;
            }
        }
        return lowestRank;
    }

}

export default FeatureMatrixModel;