class FilterModel {

  constructor(globalApp, affectedInfo, isBasicMode) {
    this.globalApp = globalApp;
    this.affectedInfo = affectedInfo;

    this.isBasicMode = isBasicMode;

    this.annotsToInclude = new Object();

    this.regionStart = null;
    this.regionEnd = null;

    this.pathogenicityScheme = "clinvar";

    this.annotClasses     = ".type, .impact, ." + this.globalApp.impactFieldToFilter + ", .effect, .vepConsequence, .sift, .polyphen, .regulatory, .zygosity, .inheritance, .clinvar, .uasibs, .recfilter";
    this.annotClassLabels = "Type, Impact, VEP Impact, Effect, VEP Consequence, SIFT, PolyPhen, Regulatory, Zygosity, Inheritance mode, ClinVar, Unaffected Sibs, VCF Filter Status";

    this.applyLowCoverageFilter = false;

    // standard filters
    this.KNOWN_CAUSATIVE           = "known_causative";
    // this.DENOVO                    = "denovo";
    this.RECESSIVE                 = "recessive";
    this.FUNCTIONAL_IMPACT         = "functional_impact";
    this.LOW_COVERAGE              = "low_coverage";

    this.snpEffEffects = {};
    this.vepConsequences = {};
    this.exonicOnlyFilter = false;
    this.recFilters = {};

    this.geneCoverageMin           = 10;
    this.geneCoverageMean          = 30;
    this.geneCoverageMedian        = 30;

    this.flagCriteria = {
      'pathogenic': {
        active: true,
        custom: false,
        title: "Pathogenic / Likely Pathogenic",
        name: "Pathogenic, likely pathogenic ClinVar, low allele freq",
        order: 0,
        userFlagged: false,
        maxAf: .05,
        clinvar: ['clinvar_path', 'clinvar_lpath'],
        impact: null,
        consequence: null,
        inheritance: null,
        zyosity: null,
        minGenotypeDepth: null,
        exclusiveOf: null
      },
      'autosomalDominant': {
        active: true,
        custom: false,
        title: "Autosomal dominant",
        name: "Autosomal dominant inhertance, low allele freq",
        order: 1,
        userFlagged: false,
        maxAf: .05,
        clinvar: null,
        impact: ['HIGH', 'MODERATE'],
        consequence: null,
        inheritance: ['autosomal dominant'],
        zyosity: null,
        minGenotypeDepth: null,
        exclusiveOf: ['pathogenic']
      },
      'recessive': {
        active: true,
        custom: false,
        title: "Recessive",
        name: "Recessive inheritance, low allele freq",
        order: 2,
        userFlagged: false,
        maxAf: .05,
        clinvar: null,
        impact: ['HIGH', 'MODERATE'],
        consequence: null,
        inheritance: ['recessive'],
        zyosity: null,
        minGenotypeDepth: null,
        isUserFlagged: false,
        exclusiveOf: ['pathogenic']
      },
      'compoundHet': {
        active: true,
        custom: false,
        title: "Compound Hets",
        name: "Compound het inheritance, low allele freq",
        order: 4,
        userFlagged: false,
        maxAf: .15,
        clinvar: null,
        impact: ['HIGH', 'MODERATE'],
        consequence: null,
        inheritance: ['compound het'],
        zyosity: null,
        minGenotypeDepth: null,
        exclusiveOf: ['pathogenic']
      },
      'xlinked': {
        active: true,
        custom: false,
        title: "X-linked recessive",
        name: "X-linked recessive inheritance, low allele freq",
        userFlagged: false,
        order: 5,
        maxAf: .05,
        clinvar: null,
        impact: ['HIGH', 'MODERATE'],
        consequence: null,
        inheritance: ['x-linked'],
        zyosity: null,
        minGenotypeDepth: null,
        exclusiveOf: ['pathogenic']
      },
      'highOrModerate': {
        active: true,
        custom: false,
        title: "Other variants, moderate/high impact",
        name: "High or moderate impact, low allele freq",
        order: 6,
        userFlagged: false,
        maxAf: .05,
        clinvar: null,
        impact: ['HIGH', 'MODERATE'],
        consequence: null,
        inheritance: null,
        zyosity: null,
        isUserFlagged: false,
        minGenotypeDepth: null,
        exclusiveOf: ['pathogenic', 'autosomalDominant', 'recessive', 'compoundHet', 'xlinked']
      },
      'userFlagged': {
        active: true,
        custom: false,
        title: "Variants flagged by user",
        name: "Variants flagged by user",
        order: 7,
        userFlagged: true,
        maxAf: null,
        clinvar: null,
        impact: null,
        consequence: null,
        inheritance: null,
        zyosity: null,
        minGenotypeDepth: null,
        exclusiveOf:  null
      }
    };


    this.modelFilters = {
      'known-variants': {
        'clinvar': []
      }
    };

    /* The current settings to highlight somatic variants */
    this.DEFAULT_SOMATIC_CUTOFFS = {
        'normalAfCutoff': 0.01,      // Must be between 0-1
        'normalAltCountCutoff': 2,
        'tumorAfCutoff': 0.10,       // Must be between 0-1
        'tumorAltCountCutoff': 8
    };

    this.DEFAULT_SOMATIC_LOGIC = {
        'normalAfCutoff': '<=',
        'normalAltCountCutoff': '<=',
        'tumorAfCutoff': '>=',
        'tumorAltCountCutoff': '>='
    };

    // TODO: on filter reset, reset these
    this.currentSomaticCutoffs = this.DEFAULT_SOMATIC_CUTOFFS;
    this.currentSomaticLogic = this.DEFAULT_SOMATIC_LOGIC;

    /* Default quality filtering criteria */
    this.DEFAULT_QUALITY_FILTERING_CRITERIA = {
        'totalCountCutoff': 15,
        'qualScoreCutoff': 20
    };
  }

    /* Marks variants that are 'inherited' from all samples for which isTumor = false.
     * If initFiltering = true, we're loading up the app for the first time or clearing filters and
     * want to use the default quality settings. */
    annotateVariantInheritance(resultMap) {
        const self = this;
        let normalSamples = [];
        let tumorSamples = [];
        let tumorSampleModelIds = [];

        // Classify samples
        for (let i = 0; i < Object.keys(resultMap).length; i++) {
            let sampleId = Object.keys(resultMap)[i];
            let currData = $.extend({}, Object.values(resultMap)[i].model.vcfData);
            if (!(resultMap[sampleId].isTumor) && sampleId !== 'known-variants' && sampleId !== 'cosmic-variants') {
                normalSamples.push(currData);
            } else if (sampleId !== 'known-variants' && sampleId !== 'cosmic-variants') {
                tumorSamples.push(currData);
                tumorSampleModelIds.push(sampleId);
            }
        }

        // Make normal variant hash table
        let idLookup = {};
        normalSamples.forEach((currNorm) => {
            if (currNorm && currNorm.features.length > 0) {
                let normFeatures = currNorm.features;

                // let filteredNormFeatures = null;
                // if (initFiltering) {
                //     // We only want to call something somatic if its normal counterpart passes init quality/somatic cutoffs
                //     filteredNormFeatures = normFeatures.filter((feature) => {
                //       let passQual = feature.qual >= self.DEFAULT_QUALITY_FILTERING_CRITERIA.qualScoreCutoff || feature.qual === '.';
                //       return passQual && feature.genotypeDepth >= self.DEFAULT_QUALITY_FILTERING_CRITERIA.totalCountCutoff;
                //     });
                // }
                // else {
                    // We only want to call something somatic if its normal counterpart is visible
                    // Quality filtering is included in passesFilters logic now
                    // let filteredNormFeatures = normFeatures.filter((feature) => {
                    //     return feature.passesFilters === true;
                    // });
                //}

              // Populate lookup with normal variants that pass our filters
              let filteredNormFeatures = normFeatures.filter((feature) => {
                  return feature.passesFilters === true;
              });
              for (let i = 0; i < filteredNormFeatures.length; i++) {
                  let currFeat = filteredNormFeatures[i];
                  const currNormAf = Math.round(currFeat.genotypeAltCount / currFeat.genotypeDepth * 100) / 100;
                  const passesNormalCount = self.matchAndPassFilter(self.currentSomaticLogic['normalAltCountCutoff'], currFeat.genotypeAltCount, self.currentSomaticCutoffs['normalAltCountCutoff']);
                  const passesNormalAf = self.matchAndPassFilter(self.currentSomaticLogic['normalAfCutoff'], currNormAf, self.currentSomaticCutoffs['normalAfCutoff']);
                  if (currFeat.id != null && idLookup[currFeat.id] == null && passesNormalCount && passesNormalAf) {
                      idLookup[currFeat.id] = true;
                  }
              }
            }
        });

        // Mark somatic variants
        for (let i = 0; i < tumorSamples.length; i++) {
            let currTumor = tumorSamples[i];
            if (currTumor.features && currTumor.features.length > 0) {
                let tumorFeatures = currTumor.features;

                // let filteredTumorFeatures = null;
                // if (initFiltering) {
                //   filteredTumorFeatures = tumorFeatures.filter((feature) => {
                //       // If calling for the first time, use initial criteria
                //       let passQual = feature.qual >= self.DEFAULT_QUALITY_FILTERING_CRITERIA.qualScoreCutoff || feature.qual === '.';
                //       return passQual && feature.genotypeDepth >= self.DEFAULT_QUALITY_FILTERING_CRITERIA.totalCountCutoff;
                //   });
                // } else {
                //     // Don't need to look at tumor features that don't pass other filters
                //     filteredTumorFeatures = tumorFeatures.filter((feature) => {
                //         return feature.passesFilters === true;
                //     });
                // }

                // Don't need to look at tumor features that don't pass other filters
                let filteredTumorFeatures = tumorFeatures.filter((feature) => {
                    return feature.passesFilters === true;
                });
                filteredTumorFeatures.forEach((feature) => {
                    // if (feature.id === 'var_31022658_20_plus_A_T') {
                    //     debugger;
                    //     console.log('got it');
                    // }
                    let currAltFreq = Math.round(feature.genotypeAltCount / feature.genotypeDepth * 100) / 100;
                    const passesTumorCount = self.matchAndPassFilter(self.currentSomaticLogic['tumorAltCountCutoff'], feature.genotypeAltCount, self.currentSomaticCutoffs['tumorAltCountCutoff']);
                    const passesTumorAf = self.matchAndPassFilter(self.currentSomaticLogic['tumorAfCutoff'], currAltFreq, self.currentSomaticCutoffs['tumorAfCutoff']);
                    if (idLookup[feature.id] == null && passesTumorAf && passesTumorCount) {
                        feature.isInherited = false;
                    }
                })
            }
        }
    }

    matchAndPassFilter(logic, varVal, cutoffVal) {
      let passesFilter = false;
      switch(logic) {
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

  getFilterObject() {
    let self = this;
    // For mygene2 basic mode, return a fixed filter of clinvar path / likely path and AF < 1%
    if (self.isBasicMode) {
      var annots =  {
        clinvar_path:     {key: 'clinvar',       state: true, value: 'clinvar_path'},
        clinvar_lpath:    {key: 'clinvar',       state: true, value: 'clinvar_lpath'}
      }

      return { afMin: 0, afMax: .01, annotsToInclude: annots };
    }

    var afMin = 0;
    var afMax = 1;
    var coverageMin = 0;

    return {
      'coverageMin': coverageMin,
      'afMin': afMin,
      'afMax': afMax,
      'annotsToInclude': this.annotsToInclude,
      'exonicOnly': $('#exonic-only-cb').is(":checked"),
      'loadedVariants': $('#loaded-variants-cb').is(":checked"),
      'calledVariants': $('#called-variants-cb').is(":checked"),
      'affectedInfo': self.getAffectedFilterInfo()
    };
  }


  populateEffectFilters(resultMap) {
    let self = this;
    for (var key in resultMap) {
      resultMap[key].features.forEach(function(variant) {
        if (variant.hasOwnProperty('effect')) {
          for (var effect in variant.effect) {
            self.snpEffEffects[effect] = effect;
          }
        }
        if (variant.hasOwnProperty('vepConsequence')) {
          for (var vepConsequence in variant.vepConsequence) {
            self.vepConsequences[vepConsequence] = vepConsequence;
          }
        }
      });
    }
  }

  populateRecFilters(resultMap) {
    let self = this;

    if (self.recFilters == null) {
      self.recFilters = {};
    }
    for (var key in resultMap) {
      resultMap[key].features.forEach( function(variant) {
        if (!variant.hasOwnProperty('fbCalled') || variant.fbCalled !== 'Y') {
          self.recFilters[variant.recfilter] = variant.recfilter;
        }
      });
    }
  }


  hasFilters() {
    return this.getFilterString().length > 0;
  }

  getFilterString() {
    let self = this;

    var filterString = "";
    var filterObject = self.getFilterObject();


    var AND = function(filterString) {
      if (filterString.length > 0) {
        return   " <span class='filter-element'>and</span> ";
      } else {
        return "";
      }
    }

    var filterBox = function(filterString) {
      return "<span class=\"filter-flag filter-element label label-primary\">" + filterString + "</span>";
    }



    // When low coverage filter applied, we only filter on this, not any other criteria.
    if (this.applyLowCoverageFilter) {
      filterString += filterBox("Exon coverage min < " + this.geneCoverageMin + " OR median < " + this.geneCoverageMedian + " OR mean < " + this.geneCoverageMean);
      return filterString;
    }

    var affectedFilters = [];
    if (filterObject.affectedInfo) {
      affectedFilters = filterObject.affectedInfo.filter(function(info) {
        return info.filter && info.status == 'affected';
      });
      if (affectedFilters.length > 0) {
        var buf = "";
        affectedFilters.forEach(function(info) {
          if (buf.length > 0) {
            buf += ", ";
          }
          buf += info.label;
        })
        filterString +=  AND(filterString) + filterBox("Present in affected: " + buf);
      }
    }

    var unaffectedFilters = [];
    if (filterObject.affectedInfo) {
      unaffectedFilters = filterObject.affectedInfo.filter(function(info) {
        return info.filter  && info.status == 'unaffected';
      });
      if (unaffectedFilters.length > 0) {
        var buf = "";
        unaffectedFilters.forEach(function(info) {
          if (buf.length > 0) {
            buf += ", ";
          }
          buf += info.label;
        })
        filterString +=  AND(filterString) +  filterBox("Absent in unaffected: " + buf);
      }
    }



//    if ($('#exonic-only-cb').is(":checked")) {
//      filterString += AND(filterString) + filterBox("not intronic");
//    }

    if (filterObject.afMin != null && filterObject.afMax != null) {
      if (filterObject.afMin >= 0 && filterObject.afMax < 1) {
        filterString += AND(filterString) + filterBox("Allele freqency between " + filterObject.afMin + " and  " + filterObject.afMax);
      }
    }

    if (filterObject.coverageMin && filterObject.coverageMin > 0) {
      if (filterString.length > 0) {
        filterString += AND(filterString) +  filterBox("coverage at least " + filterObject.coverageMin + "X");
      }
    }


    var annots = {};
    for (var key in filterObject.annotsToInclude) {
      var annot = filterObject.annotsToInclude[key];
      if (annot.state) {
        var annotObject = annots[annot.key];
        if (annotObject == null) {
          annotObject = {values: [], label: annot.label};
          annots[annot.key] = annotObject;
        }
        annotObject.values.push((annot.not ? "NOT " : "") + annot.valueDisplay);
      }
    }

    for (var key in annots) {
      var annotObject = annots[key];
      var theValues = "";
      annotObject.values.forEach(function(theValue) {
        if (theValues.length > 0) {
          theValues += ", "
        } else if (annotObject.values.length > 1) {
          theValues +=  "(";
        }
        theValues += theValue;
      });
      if (annotObject.values.length > 1) {
        theValues += ")";
      }

      filterString += AND(filterString) + filterBox(annotObject.label + '&nbsp;&nbsp;' + theValues);
    }
    return filterString;
  }



  passesModelFilter(sampleId, variant) {
    let self = this;
    let theFilters = self.modelFilters[sampleId];
    if (theFilters) {
      let passCount = 0;
      for (var key in theFilters) {
        let filterEntries = theFilters[key];
        if (filterEntries && filterEntries.length > 0) {
          if (filterEntries.indexOf(variant[key]) >= 0) {
            passCount++;
          }
        } else {
          passCount++;
        }
      }
      return passCount === Object.keys(theFilters).length;
    } else {
      return true;
    }
  }

  setModelFilter(relationship, key, entries) {
    this.modelFilters[relationship][key] = entries;
  }



  whichLowCoverage(gc) {
    var fields = {};
    fields.min    = +gc.min    < this.geneCoverageMin    ? '< ' + this.geneCoverageMin : null;
    fields.median = +gc.median < this.geneCoverageMedian ? '< ' + this.geneCoverageMedian : null;
    fields.mean   = +gc.mean   < this.geneCoverageMean   ? '< ' + this.geneCoverageMean : null;
    return fields;
  }

  isLowCoverage(gc) {
    return  +gc.min   < this.geneCoverageMin
    || +gc.median < this.geneCoverageMedian
    || +gc.mean   < this.geneCoverageMean;
  }

  getAffectedFilterInfo(refreshedAffectedInfo) {
    var self = this;

    if (refreshedAffectedInfo) {
      self.affectedInfo = refreshedAffectedInfo;
    }

    if (refreshedAffectedInfo) {
      self.affectedInfo.filter(function(info) {
        return info.model.isTumor();
      })
      .forEach(function(info) {
        //var cb = $('#present-in-affected').find("#" + info.id + " input");
        //info.filter = (cb.is(":checked"));
      });

      self.affectedInfo.filter(function(info) {
        return !info.model.isTumor();
      })
      .forEach(function(info) {
        //var cb = $('#absent-in-unaffected').find("#" + info.id + " input");
        //info.filter = (cb.is(":checked"));
      });

    }
    return this.affectedInfo;
  }


  clearAffectedFilters() {
    let self = this;

    if (self.affectedInfo) {
      self.affectedInfo.filter(function(info) {
        return info.model.isAffected() && info.relationship != 'proband';
      })
      .forEach(function(info) {
        //var cb = $('#present-in-affected').find("#" + info.id + " input");
        //cb.prop('checked', false);
        info.filter = false;
      });

      self.affectedInfo.filter(function(info) {
        return !info.model.isAffected();
      })
      .forEach(function(info) {
        //var cb = $('#absent-in-unaffected').find("#" + info.id + " input");
        //cb.prop('checked', false);
        info.filter = false;
      });


      //self.affectedInfo = getAffectedInfo();
    }

    return self.affectedInfo;
  }

  flagVariants(theVcfData) {
    let self = this;
    var badges = {};
    for (var key in this.flagCriteria) {
      if (this.flagCriteria[key].active) {
        badges[key] = [];
      }
    }
    badges.flagged = [];

    if (theVcfData && theVcfData.features) {
      theVcfData.features.filter(function(variant) {
        return variant.zygosity == null || variant.zygosity.toUpperCase() != 'HOMREF';
      })
      .forEach(function(variant) {
        var badgePassState = {};
        for (var key in self.flagCriteria) {
          if (self.flagCriteria[key].active) {
            badgePassState[key] = false;
          }
        }
        badgePassState.flagged = false;

        if (variant.isUserFlagged) {
          badgePassState['userFlagged'] = true;
        } else {
          variant.isFlagged = false;
          variant.featureClass = "";
          for (var badge in self.flagCriteria) {
            if (self.flagCriteria[badge].active) {

              var passes = self.determinePassCriteria(badge, variant);

              if (passes.all) {
                badgePassState[badge] = true;
              }
            }
          }

          // If a badge is exclusive of passing other criteria, fail the badge
          // if the other badges passed the criteria for the filter
          // Example:  highOrModerate is exclusive of the clinvar badge.
          //           So if the variant passes the clinvar criteria, it does
          //           not pass the highOrModerate criteria.
          for (var badge in self.flagCriteria) {
            var badgeCriteria = self.flagCriteria[badge];
            if (badgeCriteria.exclusiveOf) {
              var matchesOther = false;
              badgeCriteria.exclusiveOf.forEach(function(exclusiveBadge) {
                if (badgePassState[exclusiveBadge]) {
                  matchesOther = true;
                }
              })
              if (matchesOther) {
                badgePassState[badge] = false;
              }
            }
          }


        }
        // Now add the variant to any badges that passes the critera
        var filtersPassed = [];
        for (var filterName in self.flagCriteria) {
          if (badgePassState[filterName]) {
            filtersPassed.push(filterName);
            badges[filterName].push(variant);
          }
        }
        if (filtersPassed.length > 0) {
          variant.isFlagged = true;
          variant.featureClass = 'flagged';
          variant.filtersPassed = filtersPassed;
        }

        if (variant.isFlagged) {
          badges.flagged.push(variant);
        }


      })

    }
    return badges;

  }

  determinePassCriteria(badge, variant, options) {
    let self = this;
    var badgeCriteria = self.flagCriteria[badge];
    var passes = {
      all: false,
      af: false,
      impact: false,
      consequence: false,
      clinvar: false,
      inheritance: false,
      zygosity: false,
      depth: false,
      userFlagged: false
    };

    if (badgeCriteria.userFlagged == true) {
      if (variant.isUserFlagged) {
        passes.userFlagged = true;
        passes.all = true;
      }
    } else {
      if (badgeCriteria.maxAf == null || (variant.afHighest <= badgeCriteria.maxAf)) {
        passes.af = true;
      }
      if (badgeCriteria.minGenotypeDepth == null || (variant.genotypeDepth >= badgeCriteria.minGenotypeDepth)) {
        passes.depth = true;
      }
      if (badgeCriteria.impact && badgeCriteria.impact.length > 0) {
        badgeCriteria.impact.forEach(function(key) {
          if (Object.keys(variant.highestImpactVep).indexOf(key) >= 0) {
            passes.impact = true;
          }
        })
      } else {
        passes.impact = true;
      }
      if (badgeCriteria.consequence && badgeCriteria.consequence.length > 0) {
        badgeCriteria.consequence.forEach(function(key) {
          if (Object.keys(variant.vepConsequence).indexOf(key) >= 0) {
            passes.consequence = true;
          }
        })
      } else {
        passes.consequence = true;
      }
      if (badgeCriteria.clinvar == null || badgeCriteria.clinvar.length == 0 || badgeCriteria.clinvar.indexOf(variant.clinvar) >= 0) {
        passes.clinvar = true;
      }
      if (badgeCriteria.inheritance == null || badgeCriteria.inheritance.length == 0 || badgeCriteria.inheritance.indexOf(variant.inheritance) >= 0) {
        passes.inheritance = true;
      }
      if (badgeCriteria.zygosity == null || variant.zygosity.toUpperCase() == badgeCriteria.zygosity.toUpperCase() ) {
        passes.zygosity = true;
      }
      if (options && options.ignore) {
        options.ignore.forEach(function(criterion) {
          passes[criterion] = true;
        })
      }
      if (passes.af && passes.depth && passes.impact && passes.consequence && passes.clinvar && passes.inheritance && passes.zygosity) {
        passes.all = true;
      }
    }

    return passes;
  }


}

export default FilterModel;
