//
//  vcfiobio
//  Tony Di Sera
//  October 2014
//
//  This is a data manager class for variant data.
//
//  Two file are used to generate the variant data:
//    1. the bgzipped vcf (.vcf.gz)
//    2. its corresponding tabix file (.vcf.gz.tbi).
//
export default function vcfiobio(theGlobalApp) {

  var globalApp = theGlobalApp;

  var debug =  false;

  var exports = {};

  var isEduMode = false;

  var dispatch = d3.dispatch( 'dataReady', 'dataLoading');

  var SOURCE_TYPE_URL = "URL";
  var SOURCE_TYPE_FILE = "file";
  var sourceType = "url";

  var vcfURL;
  var tbiUrl;

  var vcfReader;
  var vcfFile;
  var tabixFile;

  var size16kb = Math.pow(2, 14);
  var refData = [];
  var refDensity = [];
  var refName = "";
  var infoFields =  {};

  var regions = [];
  var regionIndex = 0;
  var stream = null;

  var endpoint = null;
  var genericAnnotation = null;
  var genomeBuildHelper = null;

  // Url for offline Clinvar URL
  var OFFLINE_CLINVAR_VCF_BASE_URL  = globalApp.isOffline ?  ("http://" + globalApp.serverInstance + globalApp.serverCacheDir) : "";



  var VEP_FIELDS_AF_1000G  = "AF|AFR_AF|AMR_AF|EAS_AF|EUR_AF|SAS_AF".split("|");
  var VEP_FIELDS_AF_ESP    = "AA_AF|EA_AF".split("|");
  var VEP_FIELDS_AF_GNOMAD = "gnomAD_AF|gnomAD_AFR_AF|gnomAD_AMR_AF|gnomAD_ASJ_AF|gnomAD_EAS_AF|gnomAD_FIN_AF|gnomAD_NFE_AF|gnomAD_OTH_AF|gnomAD_SAS_AF".split("|");
  var VEP_FIELDS_AF_MAX    = "MAX_AF|MAX_AF_POPS".split("|");


  var CLINVAR_CODES = {
    '0':   'not_provided',
    '1':   'not_provided',
    '2':   'benign',
    '3':   'likely_benign',
    '4':   'likely_pathogenic',
    '5':   'pathogenic',
    '6':   'drug_response',
    '7':   'other',
    '255': 'other'
  }


var effectCategories = [
['coding_sequence_variant', 'coding'],
['chromosome' ,'chromosome'],
['inframe_insertion'  ,'indel'],
['disruptive_inframe_insertion' ,'indel'],
['inframe_deletion' ,'indel'],
['disruptive_inframe_deletion'  ,'indel'],
['downstream_gene_variant'  ,'other'],
['exon_variant' ,'other'],
['exon_loss_variant'  ,'exon_loss'],
['frameshift_variant' ,'frameshift'],
['gene_variant' ,'other'],
['intergenic_region'  ,'other'],
['conserved_intergenic_variant' ,'other'],
['intragenic_variant' ,'other'],
['intron_variant' ,'other'],
['conserved_intron_variant' ,'other'],
['miRNA','other'],
['missense_variant' ,'missense'],
['initiator_codon_variant'  ,'missense'],
['stop_retained_variant'  ,'missense'],
['rare_amino_acid_variant'  ,'rare_amino_acid'],
['splice_acceptor_variant'  ,'splice_acceptor'],
['splice_donor_variant' ,'splice_donor'],
['splice_region_variant'  ,'splice_region'],
['stop_lost'  ,'stop_lost'],
['5_prime_UTR_premature start_codon_gain_variant' ,'utr'],
['start_lost' ,'start_lost'],
['stop_gained'  ,'stop_gained'],
['synonymous_variant' ,'synonymous'],
['start_retained' ,'synonymous'],
['stop_retained_variant'  ,'synonymous'],
['transcript_variant' ,'other'],
['regulatory_region_variant'  ,'regulatory'],
['upstream_gene_variant'  ,'other'],
['3_prime_UTR_variant'  ,'utr'],
['3_prime_UTR_truncation +','utr'],
['5_prime_UTR_variant'  ,'utr'],
['5_prime_UTR_truncation +','utr']
];

  exports.isFile = function() {
    return sourceType != null && sourceType == SOURCE_TYPE_FILE;
  }

  exports.hasFileOrUrl = function() {
    return vcfURL != null || vcfFile !=null;
  }

  exports.clear = function() {
    vcfURL = null;
    tbiUrl = null;
    vcfFile = null;
  }

  exports.clearVcfURL = function() {
    vcfURL = null;
    tbiUrl = null;
  }

  exports.setEndpoint = function(theEndpoint) {
    endpoint = theEndpoint;
  }

  exports.getEndpoint = function() {
    return endpoint;
  }

  exports.setIsEduMode = function(flagIsEduMode) {
    isEduMode = flagIsEduMode;
  }


  exports.setGenericAnnotation = function(theGenericAnnotation) {
    genericAnnotation = theGenericAnnotation;
  }

  exports.getGenericAnnotation = function() {
    return genericAnnotation;
  }

  exports.setGenomeBuildHelper = function(theGenomeBuildHelper) {
    genomeBuildHelper = theGenomeBuildHelper;
  }

  exports.getGenomeBuildHelper = function() {
    return genomeBuildHelper;
  }
  exports.getAnnotators = function() {
    return this.infoFields ? Object.keys(this.infoFields) : [];
  }

  var errorMessageMap =  {
    "tabix Could not load .tbi": {
        regExp: /tabix\sError:\s.*:\sstderr\s-\sCould not load .tbi.*/,
        message:  "Unable to load the index (.tbi) file, which has to exist in same directory and be given the same name as the .vcf.gz with the file extension of .vcf.gz.tbi.  "
    },
     "tabix [E::hts_open]": {
        regExp:  /tabix\sError:\s.*:\sstderr\s-\s\[E::hts_open\]\sfail\sto\sopen\sfile/,
        message: "Unable to access the file.  "
     },
     "tabix [E::hts_open_format]": {
        regExp:  /tabix\sError:\s.*:\sstderr\s-\s\[E::hts_open_format\]\sfail\sto\sopen\sfile/,
        message: "Unable to access the file. "
     }
  }

  var ignoreMessages =  [
    /tabix\sError:\s.*:\sstderr\s-\s\[M::test_and_fetch\]\sdownloading\sfile\s.*/,
    /tabix\sError:\s.*:\sstderr\s-\s.*to local directory/
  ];



  exports.openVcfUrl = function(url, theTbiUrl, callback) {
    var me = this;
    sourceType = SOURCE_TYPE_URL;
    vcfURL = url;
    tbiUrl = theTbiUrl;


    this.checkVcfUrl(url, tbiUrl, function(success, message) {
        callback(success, message);
    });

  }

  exports.getHeader = function(callback) {
    var me = this;
    if (sourceType.toLowerCase() == SOURCE_TYPE_URL.toLowerCase() && vcfURL != null) {

      var buffer = "";
      var success = false;

      var cmd = me.getEndpoint().getVcfHeader(vcfURL, tbiUrl);

      cmd.on('data', function(data) {
        if (data != undefined) {
          success = true;
          buffer += data;
        }
      });

      cmd.on('end', function() {
        if (success == null) {
          success = true;
        }
        if (success && buffer.length > 0) {
          callback(buffer);
        }
      });

      cmd.on('error', function(error) {
        console.log(error);
      })
      cmd.run();

    } else if (vcfFile) {
        var vcfReader = new readBinaryVCF(tabixFile, vcfFile, function(tbiR) {
          vcfReader.getHeader( function(theHeader) {
            callback(theHeader);
          });
        });
    } else {
      callback(null);
    }

  }


  exports.checkVcfUrl = function(url, tbiUrl, callback) {
    var me = this;
    var success = null;
    var buffer = "";
    var recordCount = 0;

    var cmd = me.getEndpoint().getVcfHeader(url, tbiUrl);

    cmd.on('data', function(data) {
      if (data != undefined) {
        success = true;
        buffer += data;
      }
    });

    cmd.on('end', function() {
      if (success == null) {
        success = true;
      }
      if (success && buffer.length > 0) {
        buffer.split("\n").forEach( function(rec) {
          if (rec.indexOf("#") == 0) {
            me._parseHeaderForInfoFields(rec);
          }
        })
        callback(success);
      }
    });

    cmd.on('error', function(error) {
      if (me.ignoreErrorMessage(error)) {
      } else {
        if (success == null) {
          success = false;
          console.log(error);
          callback(success, me.translateErrorMessage(error));
        }
      }

    });

    cmd.run();
  }

  exports.ignoreErrorMessage = function(error) {
    var me = this;
    var ignore = false;
    ignoreMessages.forEach( function(regExp) {
      if (error.match(regExp)) {
        ignore = true;
      }
    });
    return ignore;

  }

  exports.translateErrorMessage = function(error) {
    var me = this;
    var message = null;
    for (var key in errorMessageMap) {
      var errMsg = errorMessageMap[key];
      if (message == null && error.match(errMsg.regExp)) {
        message = errMsg.message;
      }
    }
    return message ? message : error;
  }

  exports.clearVcfFile = function() {
    vcfReader = null;
    vcfFile = null;
    tabixFile = null;
  }

  exports.openVcfFile = function(fileSelection, callback) {
    sourceType = SOURCE_TYPE_FILE;

    if (fileSelection.files.length != 2) {
       callback(false, 'must select 2 files, both a .vcf.gz and .vcf.gz.tbi file');
       return;
    }

    if (endsWith(fileSelection.files[0].name, ".vcf") ||
        endsWith(fileSelection.files[1].name, ".vcf")) {
      callback(false, 'You must select a compressed vcf file (.vcf.gz), not a vcf file');
      return;
    }

    var fileType0 = /([^.]*)\.(vcf\.gz(\.tbi)?)$/.exec(fileSelection.files[0].name);
    var fileType1 = /([^.]*)\.(vcf\.gz(\.tbi)?)$/.exec(fileSelection.files[1].name);

    var fileExt0 = fileType0 && fileType0.length > 1 ? fileType0[2] : null;
    var fileExt1 = fileType1 && fileType1.length > 1 ? fileType1[2] : null;

    var rootFileName0 = fileType0 && fileType0.length > 1 ? fileType0[1] : null;
    var rootFileName1 = fileType1 && fileType1.length > 1 ? fileType1[1] : null;


    if (fileType0 == null || fileType0.length < 3 || fileType1 == null || fileType1.length <  3) {
      callback(false, 'You must select BOTH  a compressed vcf file (.vcf.gz) and an index (.tbi)  file');
      return;
    }


    if (fileExt0 == 'vcf.gz' && fileExt1 == 'vcf.gz.tbi') {
      if (rootFileName0 != rootFileName1) {
        callback(false, 'The index (.tbi) file must be named ' +  rootFileName0 + ".tbi");
        return;
      } else {
        vcfFile   = fileSelection.files[0];
        tabixFile = fileSelection.files[1];
      }
    } else if (fileExt1 == 'vcf.gz' && fileExt0 == 'vcf.gz.tbi') {
      if (rootFileName0 != rootFileName1) {
        callback(false, 'The index (.tbi) file must be named ' +  rootFileName1 + ".tbi");
        return;
      } else {
        vcfFile   = fileSelection.files[1];
        tabixFile = fileSelection.files[0];
      }
    } else {
      callback(false, 'You must select BOTH  a compressed vcf file (.vcf.gz) and an index (.tbi)  file');
      return;
    }

    callback(true);
    return;

  }


  function showFileFormatMessage() {
    alertify.set(
      {
        labels: {
          cancel     : "Show me how",
          ok         : "OK",
        },
        buttonFocus:  "cancel"
    });

    alertify.confirm("You must select a compressed vcf file and its corresponding index file in order to run this app. ",
        function (e) {
        if (e) {
            return;
        } else {
            window.location = 'http://iobio.io/2015/09/03/install-run-tabix/';
        }
     }).set('labels', {ok:'OK', cancel:'Cancel'});
  }

  function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }

  exports.setSamples = function(sampleNames) {
    samples = sampleNames;
  }
  exports.getSamples = function() {
    return samples;
  }
  exports.getVcfFile = function() {
    return vcfFile;
  }
  exports.getTabixFile = function() {
    return tabixFile;
  }
  exports.setVcfFile = function(file) {
    vcfFile = file;
  }

  exports.getVcfURL = function() {
    return vcfURL;
  }

  exports.getTbiURL = function() {
    return tbiUrl;
  }

  exports.setVcfURL = function(url, tbiUrl) {
    vcfURL = url;
    tbiUrl = tbiUrl;
  }

  exports.getSourceType = function() {
    return sourceType;
  }

  exports.setSourceType = function(st) {
    sourceType = st;
  }



  function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }


  exports.stripChr = function(ref) {
    if (ref.indexOf("chr") == 0) {
      return ref.split("chr")[1];
    } else {
      return ref;
    }
  }


  exports.isNumeric = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }



  exports.getReferenceLengths = function(callback) {
    if (sourceType.toLowerCase() === SOURCE_TYPE_URL.toLowerCase()) {
      this._getRemoteReferenceLengths(callback);
    } else {
      this._getLocalReferenceLengths(callback);
    }
  }




  exports._getLocalReferenceLengths = function(callback, callbackError) {
    var me = this;

    vcfReader = new readBinaryVCF(tabixFile, vcfFile, function(tbiR) {
      var tbiIdx = tbiR;
      refDensity.length = 0;

      if (tbiIdx.idxContent.head.n_ref == 0) {
        var errorMsg = "Invalid index file.  The number of references is set to zero.  Try recompressing the vcf with bgzip and regenerating the index with tabix."
        if (callbackError) {
          callbackError(errorMsg);
        }
        console.log(errorMsg);
        return;
      }

      var referenceNames = [];
      for (var i = 0; i < tbiIdx.idxContent.head.n_ref; i++) {
        var ref   = tbiIdx.idxContent.head.names[i];
        referenceNames.push(ref);
      }

      for (var i = 0; i < referenceNames.length; i++) {
        var ref   = referenceNames[i];

        var indexseq = tbiIdx.idxContent.indexseq[i];
        var calcRefLength = indexseq.n_intv * size16kb;


        // Load the reference density data.  Exclude reference if 0 points.
        refData.push( {"name": ref, "calcRefLength": calcRefLength, "idx": i});
      }

      // Sort ref data so that refs are ordered numerically
      refData = me.sortRefData(refData);

      if (callback) {
        callback(refData);
      }

    });

  }


  exports._getRemoteReferenceLengths = function(callback, callbackError) {
    var me = this;
    var buffer = "";
    var refName;

    var cmd = me.getEndpoint().getVcfDepth(vcfURL, tbiUrl)

    cmd.on('data', function(data) {

      if (data == undefined) {
        return;
      }

      buffer += data;

    })

    // All data has been streamed.
    cmd.on('end', function() {


      var recs = buffer.split("\n");
      if (recs.length > 0) {
        for (var i=0; i < recs.length; i++)  {
          if (recs[i] == undefined) {
            return;
          }

          var success = true;
          if ( recs[i][0] == '#' ) {
            var tokens = recs[i].substr(1).split("\t");
            if (tokens.length >= 3) {
              var refNamePrev = refName;
              var refIndex = tokens[0];
              var refName = tokens[1];
              var refLength = tokens[2];

              // Zero fill the previous reference point data and callback with the
              // data we have loaded so far.
              if (refData.length > 0) {
                var refDataPrev = refData[refData.length - 1];
              }

              refData.push({"name": refName,  "calcRefLength": +refLength, "idx": +refIndex});


            } else {
                success = false;
            }
          }
          else {
            // We only care about getting the reference lengths, not the density data
          }
          if (success) {
            buffer = "";
          } else {
            buffer += recs[i];
          }
        }
      } else  {
        buffer += data;
      }

      // sort refData so references or ordered numerically
      refData = me.sortRefData(refData);


      // Zero fill the previous reference point data and callback with the
      // for the last reference that was loaded
      if (refData.length > 0) {
        var refDataPrev = refData[refData.length - 1];
      }
      if (callback) {
        callback(refData);
      }
    })

    // Catch error event when fired
    cmd.on('error', function(error) {
      console.log("Error occurred in loadRemoteIndex. " +  error);
      if (callbackError) {
        callbackError("Error occurred in loadRemoteIndex. " +  error);
      }
    })

    // execute command
    cmd.run();




  };



  exports.sortRefData = function(refData) {
    var me = this;
    return refData.sort(function(refa,refb) {
          var x = me.stripChr(refa.name);
          var y = me.stripChr(refb.name);
          if (me.isNumeric(x) && me.isNumeric(y)) {
            return ((+x < +y) ? -1 : ((+x > +y) ? 1 : 0));
          } else {
             if (!me.isNumeric(x) && !me.isNumeric(y)) {
                return ((+x < +y) ? -1 : ((+x > +y) ? 1 : 0));
             } else if (!me.isNumeric(x)) {
                return 1;
             } else {
                return -1;
             }
          }

      });
  };

  /* Returns dictionary with IDs as keys and values from INFO column according to infoValueField if provided. Else true as value. */
  exports.promiseGetVariantIds = function(refName, geneObject, selectedTranscript, regions, infoValueField = null) {
      const me = this;

      return new Promise(function(resolve, reject) {
        if (sourceType === SOURCE_TYPE_URL) {
            if (regions == null || regions.length === 0) {
                regions = [];
                regions.push({'name': refName, 'start': geneObject.start, 'end': geneObject.end});
            }

            let cmd = me.getEndpoint().getVariantIds({'vcfUrl': vcfURL, 'tbiUrl': tbiUrl}, refName, regions);
            let annotatedData = "";
            // Get the results from the iobio command
            cmd.on('data', function(data) {
                if (data == null) {
                    return;
                }
                annotatedData += data;
            });
            cmd.on('end', function(data) {
                let annotatedRecs = annotatedData.split("\n");
                let idLookup = {};
                annotatedRecs.forEach(function(record) {
                    if (record.charAt(0) !== "#") {
                        // Parse the vcf record into its fields
                        let fields = record.split('\t');
                        let refName      = fields[0];
                        let pos      = fields[1];
                        let ref      = fields[3];
                        let alt      = fields[4];
                        let info     = fields[7];

                        let strand = '';
                        let infoVal = '';
                        if (info && info !== '') {
                          let infoFields = info.split(';');
                          infoFields.forEach((field) => {
                            if (field.startsWith('STRAND')) {
                              strand = field.split('=')[1];
                            }
                            if (infoValueField && field.startsWith(infoValueField.toUpperCase())) {
                              infoVal = field.split('=')[1];
                            }
                          })
                        }
                        if (strand === '') {
                          console.log("Could not find strand from promiseGetVariantIds");
                        }
                        alt = getCssSafeAlt(alt);
                        strand = strand === '+' ? 'plus' : 'minus';
                        let chr = refName.indexOf("chr") === 0 ? refName.slice(3) : refName;

                        // Parse ids and return as array
                        let id = 'var_' + pos + '_' + chr + '_' + strand + '_' + ref + '_' + alt;
                        idLookup[id] = infoVal === '' ? true : infoVal;
                    }
                });
                resolve(idLookup);
            });
            cmd.on('error', function(error) {
                console.log(error);
            });
            cmd.run();
        } else {
            reject('Getting variant IDs for a local file not yet supported.');
        }
    });
  };


  exports.promiseGetVariants = function(refName, geneObject, selectedTranscript, regions, isMultiSample, samplesToRetrieve, annotationEngine, clinvarMap, isRefSeq, hgvsNotation, getRsId, vepAF, cache, sampleModelId) {
    var me = this;

    return new Promise( function(resolve, reject) {
      // This comma separated string of samples to perform vcf subset on
      let vcfSampleNames = samplesToRetrieve.filter(function(sample) {
        return (sample.vcfSampleName !== "" && sample.vcfSampleName != null);
      })
      .map(function(sample) {
        return sample.vcfSampleName;
      })
      .join(",");

      // This comma separated string of samples to be contained in the maps of genotypes
      let sampleNamesToGenotype = samplesToRetrieve.map(function(sample) {
        return sample.sampleName;
      })
      .join(",");



      if (sourceType === SOURCE_TYPE_URL) {
        me._getRemoteVariantsImpl(refName, geneObject, selectedTranscript, regions, isMultiSample, vcfSampleNames, sampleNamesToGenotype, annotationEngine, clinvarMap, isRefSeq, hgvsNotation, getRsId, vepAF, cache,
          function(annotatedData, results) {
            if (annotatedData && results) {
              resolve([annotatedData, results]);
            } else {
              reject();
            }
          }, null, sampleModelId);
      } else {
        //me._getLocalStats(refName, geneObject.start, geneObject.end, sampleName);

        me._getLocalVariantsImpl(refName, geneObject, selectedTranscript, regions, isMultiSample, vcfSampleNames, sampleNamesToGenotype, annotationEngine, clinvarMap, isRefSeq, hgvsNotation, getRsId, vepAF, cache,
          function(annotatedData, results) {
            if (annotatedData && results) {
              resolve([annotatedData, results]);
            } else {
              reject();
            }
          }, null, sampleModelId);

      }

    });
  }


  exports._getLocalVariantsImpl = function(refName, geneObject, selectedTranscript, regions, isMultiSample, vcfSampleNames, sampleNamesToGenotype, annotationEngine, clinvarMap, isRefSeq, hgvsNotation, getRsId, vepAF, cache, callback, errorCallback, sampleModelId) {
    var me = this;

    // The variant region may span more than the specified region.
    // We will be keeping track of variant depth by relative position
    // of the region start, so to prevent a negative index, we will
    // keep track of the region start based on the variants.
    var variantRegionStart = geneObject.start;

    var vcfObjects = [];
    vcfObjects.length = 0;

    var headerRecords = [];
    vcfReader.getHeader( function(header) {
       headerRecords = header.split("\n");

    });

    var getRecordsForRegion = function(theRegions, theRecords, callback) {
      if (theRegions.length > 0) {
        var region = theRegions.splice(0,1)[0];
        vcfReader.getRecords(region.name, region.start, region.end, function(recs) {
          theRecords = theRecords.concat(recs);
          getRecordsForRegion(theRegions, theRecords, callback);
        });
      } else {
        if (callback) {
          callback(theRecords);
        }
      }
    };


    var theRegions = null;
    if (regions && regions.length > 0) {
      theRegions = regions.slice();
    } else {
      theRegions = [{name: refName, start: geneObject.start, end: geneObject.end}];
    }

    // Get the vcf records for every region
    var records = [];
    getRecordsForRegion(theRegions, records, function(recordsForRegions) {

        var allRecs = headerRecords.concat(recordsForRegions);

        me._promiseAnnotateVcfRecords(allRecs, refName, geneObject, selectedTranscript, clinvarMap, isRefSeq && hgvsNotation, isMultiSample, vcfSampleNames, sampleNamesToGenotype, annotationEngine, isRefSeq, hgvsNotation, getRsId, vepAF, cache, sampleModelId)
        .then(function(data) {
            callback(data[0], data[1]);
        }, function(error) {
          console.log("_getLocalVariantsImpl() error - " + error);
          if (errorCallback) {
            errorCallback("_getLocalVariantsImpl() error - " + error);
          }
        });
    });
  };

  exports._getRemoteVariantsImpl = function(refName, geneObject, selectedTranscript, regions, isMultiSample, vcfSampleNames, sampleNamesToGenotype, annotationEngine, clinvarMap, isRefSeq, hgvsNotation, getRsId, vepAF, useServerCache, callback, errorCallback, sampleModelId) {

    var me = this;


    if (regions == null || regions.length === 0) {
      regions = [];
      regions.push({'name': refName, 'start': geneObject.start, 'end': geneObject.end});
    }

    var serverCacheKey = me._getServerCacheKey(vcfURL, annotationEngine, refName, geneObject, vcfSampleNames, {refseq: isRefSeq, hgvs: hgvsNotation, rsid: getRsId});

    var cmd = me.getEndpoint().annotateVariants({'vcfUrl': vcfURL, 'tbiUrl': tbiUrl}, refName, regions, vcfSampleNames, annotationEngine, isRefSeq, hgvsNotation, getRsId, vepAF, useServerCache, serverCacheKey);


    var annotatedData = "";
    // Get the results from the iobio command
    cmd.on('data', function(data) {
         if (data == null) {
            return;
         }
         annotatedData += data;
    });

    // We have all of the annotated vcf recs.  Now parse them into vcf objects
    cmd.on('end', function(data) {
      var annotatedRecs = annotatedData.split("\n");
      var vcfObjects = [];
      var contigHdrRecFound = false;

      annotatedRecs.forEach(function(record) {
        if (record.charAt(0) === "#") {
          me._parseHeaderForInfoFields(record);

        } else {

          // Parse the vcf record into its fields
          var fields = record.split('\t');
          var pos    = fields[1];
          var id     = fields[2];
          var ref    = fields[3];
          var alt    = fields[4];
          var qual   = fields[5];
          var filter = fields[6];
          var info   = fields[7];
          var format = fields[8];
          var genotypes = [];
          for (var i = 9; i < fields.length; i++) {
            genotypes.push(fields[i]);
          }

          // Turn vcf record into a JSON object and add it to an array
          var vcfObject = {'pos': pos, 'id': 'id', 'ref': ref, 'alt': alt,
                           'qual': qual, 'filter': filter, 'info': info, 'format':format, 'genotypes': genotypes};
          vcfObjects.push(vcfObject);
        }
      });

      // Parse the vcf object into a variant object that is visualized by the client.
      var results = me._parseVcfRecords(vcfObjects, refName, geneObject, selectedTranscript, clinvarMap, (hgvsNotation && getRsId), isMultiSample, sampleNamesToGenotype, null, vepAF, sampleModelId);


      callback(annotatedRecs, results);
    });

    cmd.on('error', function(error) {
       console.log(error);
    });

    cmd.run();

  };

    exports.promiseGetVariantsHistoData = function(trackId, refName, geneObject, transcript, binLength) {
        var me = this;
        return new Promise( function(resolve, reject) {
            me._getVariantsHistoDataImpl(trackId, refName, geneObject, transcript, binLength,
                function(data) {
                    if (data) {
                        resolve(data);
                    } else {
                        reject();
                    }
                });
        });
    }

  exports._getExonRegions = function(transcript) {

    return transcript.features
      .filter( function(feature) {
        return feature.feature_type.toUpperCase() == 'CDS' || feature.feature_type.toUpperCase() == 'UTR';
      })
      .sort( function(exon1, exon2) {
        if (exon1.start < exon2.start) {
          return -1;
        } else if (exon1.start > exon2.start) {
          return 1;
        } else {
          return 0;
        }
      })
      .map( function(exon) {
        return {start: exon.start, end: exon.end};
      })
  }

  exports._getVariantsHistoDataImpl = function(trackId, refName, geneObject, transcript, binLength, callback) {
    const me = this;

    let clinvarUrl = globalApp.getClinvarUrl(me.getGenomeBuildHelper().getCurrentBuildName(), true);
    // let clinvarUrl = me.getGenomeBuildHelper().getBuildResource(me.getGenomeBuildHelper().RESOURCE_CLINVAR_VCF_S3);
    let cosmicUrl = globalApp.getCosmicUrl(me.getGenomeBuildHelper().getCurrentBuildName());

    let url = null;
    if (trackId == 'cosmic-variants') {
      url = cosmicUrl;
    } else if (trackId == 'known-variants') {
      url = clinvarUrl;
    }

    var cmd = me.getEndpoint().getCountsForGene(url, refName, geneObject, binLength, (binLength == null ? me._getExonRegions(transcript) : null));

    var summaryData = "";
    // Get the results from the iobio command
    cmd.on('data', function(data) {
         if (data == undefined) {
            return;
         }
         summaryData += data;
    });

    // We have all of the annotated vcf recs.  Now parse them into vcf objects
    cmd.on('end', function(data) {
      var results = [];
      var records = summaryData.split("\n");
      var fieldNames = {};

      var idx = 0;
      records.forEach(function(record) {
        if (idx == 0) {
          fieldNames = record.split('\t');
        } else {
          if (record.trim().length > 0) {
            var fields = record.split('\t');
            var resultRec = {};
            var i = 0;
            fieldNames.forEach(function(fieldName) {
              // All fields are numeric
              resultRec[fieldName] = +fields[i];
              i++;
            });
            // Find the mid-point of the interval (binned region)
            resultRec.point = resultRec.start + ((resultRec.end - resultRec.start) / 2);
            results.push(resultRec);
          }
        }
        idx++;
      });
      callback(results);
    });
    cmd.on('error', function(error) {
       console.log(error);
    });
    cmd.run();
  };



  exports.clearVepInfoFields = function() {
    this.infoFields.VEP = null;
  };

  exports._parseHeaderForInfoFields = function(record) {
    var me = this;
    if (me.infoFields == null) {
      me.infoFields = {};
    }
    if (record.indexOf("INFO=<ID=CSQ") > 0 && !me.infoFields.VEP) {
      var fieldMap = me._parseInfoHeaderRecord(record);
      me.infoFields.VEP = fieldMap;
    } else if (record.indexOf("INFO=<ID=AVIA3") > 0 && !me.infoFields.AVIA3) {
      var fieldMap = me._parseInfoHeaderRecord(record);
      me.infoFields.AVIA3 = fieldMap;
    }
  }

  exports._parseInfoHeaderRecord = function(record) {
    var fieldMap = {};
    var tokens = record.split("Format: ");
    if (tokens.length == 2) {
      var format = tokens[1];
      if (endsWith(format, '">')) {
        format  =  format.substring(0, format.length - 2 );
      }
      var fields = format.split("|");
      for(var idx = 0; idx < fields.length; idx++) {
        var fieldName = fields[idx];
        if (fieldName.indexOf("\"") == fieldName.length-1) {
          fieldName = fieldName.trim("\"");
        }
        fieldMap[fieldName] = idx;
      }
    }
    return fieldMap;
  }


  exports.getSampleNames = function(callback) {
    if (sourceType == SOURCE_TYPE_URL) {
      this._getRemoteSampleNames(callback);
    } else {
      this._getLocalSampleNames(callback);
    }
  }


  exports._getLocalSampleNames = function(callback) {
    var me = this;

    var vcfReader = new readBinaryVCF(tabixFile, vcfFile, function(tbiR) {
      var sampleNames = [];
      sampleNames.length = 0;

      var headerRecords = [];
      vcfReader.getHeader( function(header) {
         headerRecords = header.split("\n");
         headerRecords.forEach(function(headerRec) {
            if (headerRec.indexOf("#CHROM") == 0) {
              var headerFields = headerRec.split("\t");
              sampleNames = headerFields.slice(9);
              callback(sampleNames);
            }
         });

      });
   });

  }


  exports._getRemoteSampleNames = function(callback) {
    var me = this;

    var cmd = me.getEndpoint().getVcfHeader(vcfURL, tbiUrl);


    var headerData = "";
    // Use Results
    cmd.on('data', function(data) {
         if (data == undefined) {
            return;
         }
         headerData += data;
    });

    cmd.on('end', function(data) {
        var headerRecords = headerData.split("\n");
         headerRecords.forEach(function(headerRec) {
              if (headerRec.indexOf("#CHROM") == 0) {
                var headerFields = headerRec.split("\t");
                var sampleNames = headerFields.slice(9);
                callback(sampleNames);
              }
         });

    });

    cmd.on('error', function(error) {
      console.log(error);
    });

    cmd.run();

  }

  exports.parseVcfRecordsForASample = function(annotatedRecs, refName, geneObject, selectedTranscript, clinvarMap, hasExtraAnnot, sampleNamesToGenotype, sampleIndex, vepAF) {
    var me = this;

      // For each vcf records, call snpEff to get the annotations.
      // Each vcf record returned will have an EFF field in the
      // info field.
      var vcfObjects = [];

      annotatedRecs.forEach(function(record) {
        if (record == null || record == "") {

        } else if (record.charAt(0) == "#") {
          me._parseHeaderForInfoFields(record);
        } else {

          // Parse the vcf record into its fields
          var fields = record.split('\t');
          var pos    = fields[1];
          var id     = fields[2];
          var ref    = fields[3];
          var alt    = fields[4];
          var qual   = fields[5];
          var filter = fields[6];
          var info   = fields[7];
          var format = fields[8];
          var genotypes = [];
          for (var i = 9; i < fields.length; i++) {
            genotypes.push(fields[i]);
          }


          // Turn vcf record into a JSON object and add it to an array
          var vcfObject = {gene: geneObject, 'pos': pos, 'id': 'id', 'ref': ref, 'alt': alt,
                           'qual': qual, 'filter': filter, 'info': info, 'format': format, 'genotypes': genotypes};
          vcfObjects.push(vcfObject);
        }
      });


      // Parse the vcf object into a variant object that is visualized by the client.
      var results = me._parseVcfRecords(vcfObjects, refName, geneObject, selectedTranscript, clinvarMap, hasExtraAnnot, false, sampleNamesToGenotype, sampleIndex, vepAF);
      return {'annotatedRecs': annotatedRecs, 'results': results};

  }

  exports._promiseAnnotateVcfRecords = function(records, refName, geneObject, selectedTranscript, clinvarMap, hasExtraAnnot, isMultiSample, vcfSampleNames, sampleNamesToGenotype, annotationEngine, isRefSeq, hgvsNotation, getRsId, vepAF, useServerCache, sampleModelId) {
    var me = this;

    return new Promise( function(resolve, reject) {
      // For each vcf records, call snpEff to get the annotations.
      // Each vcf record returned will have an EFF field in the
      // info field.
      me._annotateVcfRegion(records, refName, vcfSampleNames, annotationEngine, isRefSeq, hgvsNotation, getRsId, vepAF, useServerCache, function(annotatedData) {

        var annotatedRecs = annotatedData.split("\n");
        var vcfObjects = [];

        annotatedRecs.forEach(function(record) {
          if (record.charAt(0) == "#") {
              me._parseHeaderForInfoFields(record);
          } else {

            // Parse the vcf record into its fields
            var fields = record.split('\t');
            var pos    = fields[1];
            var id     = fields[2];
            var ref    = fields[3];
            var alt    = fields[4];
            var qual   = fields[5];
            var filter = fields[6];
            var info   = fields[7];
            var format = fields[8];
            var genotypes = [];
            for (var i = 9; i < fields.length; i++) {
              genotypes.push(fields[i]);
            }

            // Turn vcf record into a JSON object and add it to an array
            var vcfObject = {'pos': pos, 'id': 'id', 'ref': ref, 'alt': alt,
                             'qual': qual, 'filter': filter, 'info': info, 'format': format, 'genotypes': genotypes};
            vcfObjects.push(vcfObject);
          }
        });

        // Parse the vcf object into a variant object that is visualized by the client.
        var results = me._parseVcfRecords(vcfObjects, refName, geneObject, selectedTranscript, clinvarMap, hasExtraAnnot, isMultiSample, sampleNamesToGenotype, null, vepAF, sampleModelId);
        resolve([annotatedRecs, results]);
      });
    });
  }

  exports.promiseGetClinvarRecords = function(theVcfData, refName, geneObject, clinvarGenes, clinvarLoadVariantsFunction) {
    var me = this;

    return new Promise( function(resolve, reject) {
      var batchSize = 100;
      // When the clinvar vcf is used, just use 1 batch to get all clinvar variants.  But if accessing clinvar
      // via eutils, for every 100 variants, make an http request to eutils to get clinvar records.  Keep
      // repeating until all variants have been processed.
      var numberOfBatches = globalApp.isClinvarOffline || globalApp.clinvarSource == 'vcf' ? 1 : Math.ceil(theVcfData.features.length / batchSize);
      if (numberOfBatches == 0) {
        numberOfBatches = 1;
      }
      var clinvarPromises = [];
      for( var i = 0; i < numberOfBatches; i++) {
        var start = i * batchSize;
        var end = start + batchSize;
        var batchOfVariants = theVcfData.features.slice(start, end <= theVcfData.features.length ? end : theVcfData.features.length);

        if (globalApp.isClinvarOffline || globalApp.clinvarSource === 'vcf') {
          var promise = me.promiseGetClinvarVCFImpl(batchOfVariants, refName, geneObject, clinvarGenes, clinvarLoadVariantsFunction)
          .then(  function() {

          }, function(error) {
            reject("Unable to get clinvar annotations for variants");
          });
          clinvarPromises.push(promise);

        } else {
          var promise = me.promiseGetClinvarEutilsImpl(batchOfVariants, refName, geneObject, clinvarLoadVariantsFunction)
          .then(  function(data) {
            if (data == 'clinvarError') {
              alertify.alert("A problem occurred accessing ClinVar variants in gene " + geneObject.gene_name + ".  Unable to get ClinVar annotations at this time.");
            }

          }, function(error) {
            reject("Unable to get clinvar annotations for variants");
          });
          clinvarPromises.push(promise);

        }
      }

      Promise.all(clinvarPromises).then(function() {
        resolve(theVcfData);
      });



    });
  }

  exports._getClinvarVariantRegions = function(refName, geneObject, variants, clinvarGenes) {
    var regions = [];
    if (variants && variants.length > 0) {
      var clinvarVariantCount = clinvarGenes[geneObject.gene_name];
      // Avoid returning ALL clinvar variants for a gene when this gene has
      // a huge number of variants in clinvar.  Instead, just get the clinvar variants
      // for the specific positions of the sample's variants
      if (clinvarVariantCount != null && clinvarVariantCount > variants.length) {

        // Interrogate clinvar vcf by specific positions
        variants.forEach(function(variant) {
          regions.push({'refName': refName, 'start': variant.start, 'end': variant.end});
        })
      } else {
        // Just grab all clinvar variants for the gene
        regions.push({'refName': refName, 'start': geneObject.start, 'end': geneObject.end});
      }
    } else {
      // We don't have any variants for the sample, so don't bother interogating clinvar vcf
      regions.push({'refName': '0', 'start': 0, 'end': 0});
    }
    return regions;
  }

  // This method will obtain clinvar annotations from a clinvar vcf.
  // When there is no internet (isOffline == true), read the clinvar vcf from a locally served
  // file; otherwise, serve clinvar vcf from standard ftp site.
  exports.promiseGetClinvarVCFImpl= function(variants, refName, geneObject, clinvarGenes, clinvarLoadVariantsFunction) {
    var me = this;

    return new Promise( function(resolve, reject) {

      var clinvarUrl = null;
      if (globalApp.isOffline) {
        clinvarUrl = OFFLINE_CLINVAR_VCF_BASE_URL + me.getGenomeBuildHelper().getBuildResource(me.getGenomeBuildHelper().RESOURCE_CLINVAR_VCF_OFFLINE)
      } else {
          clinvarUrl = globalApp.getClinvarUrl(me.getGenomeBuildHelper().getCurrentBuildName());
      }

      var regions = me._getClinvarVariantRegions(refName, geneObject, variants, clinvarGenes);

      var cmd = me.getEndpoint().normalizeVariants(clinvarUrl, null, refName, regions);


      var clinvarData = "";
      // Parse results
      cmd.on('data', function(data) {
        if (data == undefined) {
            return;
        }
        clinvarData += data;
      });

      cmd.on('end', function(data) {
        var clinvarRecs = clinvarData.split("\n");
        var vcfObjects = [];

        clinvarRecs.forEach(function(record) {
          if (record.charAt(0) === "#" || record === "") {

          } else {

            // Parse the vcf record into its fields
            var fields = record.split('\t');
            var pos    = fields[1];
            var id     = fields[2];
            var ref    = fields[3];
            var altBuf = fields[4];
            var qual   = fields[5];
            var filter = fields[6];
            var info   = fields[7];
            var format = fields[8];
            var genotypes = [];
            for (var i = 9; i < fields.length; i++) {
              genotypes.push(fields[i]);
            }

            altBuf.split(",").forEach(function(alt) {
              // Turn vcf record into a JSON object and add it to an array
              var vcfObject = {'pos': pos, 'start':  +pos,  'id': 'id', 'ref': ref, 'alt': alt, 'chrom': refName,
                               'qual': qual, 'filter': filter, 'info': info, 'format':format, 'genotypes': genotypes};
              vcfObjects.push(vcfObject);
            })

          }
        });
        clinvarLoadVariantsFunction(vcfObjects);
        resolve();
      });

      cmd.on('error', function(error) {
        console.log(error);
      });
      cmd.run();
    });

  };


  exports.promiseGetClinvarEutilsImpl = function(variants, refName, geneObject, clinvarLoadVariantsFunction) {
    var me = this;

    return new Promise( function(resolve, reject) {

      var regionStart = geneObject.start;
      var regionEnd = geneObject.end;


      // Multiallelic input vcf records were assigned a number submission
      // index.  Create a map that ties the vcf record number to the
      // clinvar records number
      var sourceIndex = -1;
      var clinvarIndex = 0;
      var url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=clinvar&usehistory=y&retmode=json&term=";
      url += "(" + refName + "[Chromosome]" + " AND ";
      // clinvarToSourceMap = new Object();
      variants.forEach(function(variant) {

        var pos    = variant.start;
        var ref    = variant.ref;
        var alt    = variant.alt;

        if (pos == null || ref == null || alt == null) {

        } else {
          // Get rid of the left most anchor base for insertions and
          // deletions for accessing clinvar
          var clinvarStart = +pos;
          if (alt == '.') {

          } else if (ref == '.') {

          } else if (ref.length > alt.length) {
            // deletion
            clinvarStart++;
          } else if (alt.length > ref.length) {
            // insertion
            clinvarStart++;
          }

          url += clinvarStart + ','
        }
      });

      var clinvarBuild = me.getGenomeBuildHelper().getBuildResource(me.getGenomeBuildHelper().RESOURCE_CLINVAR_POSITION);
      url = url.slice(0,url.length-1) + '[' + clinvarBuild + '])';

      var clinvarVariants = null;
      var requestClinvarSummaryTries = 0;
      requestClinvarSummary(url);

      function requestClinvarSummary(url) {
        $.ajax( url )
          .done(function(data) {
            if (data["esearchresult"]["ERROR"] != undefined) {
              if (requestClinvarSummaryTries < 2 ) {
                requestClinvarSummaryTries += 1;
                console.log('clinvar request failed ' + requestClinvarSummaryTries + ' times (' + data["esearchresult"]["ERROR"] + '). Trying again ...')
                requestClinvarSummary(url);
              } else {
                console.log('clinvar request failed 3 times (' + data.esearchresult.ERROR + '). Aborting ...')
                resolve("clinvarError");
              }
            } else {
              var webenv = data["esearchresult"]["webenv"];
              var queryKey = data["esearchresult"]["querykey"];
              var summaryUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&query_key=" + queryKey + "&retmode=json&WebEnv=" + webenv + "&usehistory=y"
              $.ajax( summaryUrl )
                .done(function(sumData) {

                  if (sumData.result == null) {
                    if (sumData.esummaryresult && sumData.esummaryresult.length > 0) {
                      sumData.esummaryresult.forEach( function(message) {
                      });
                    }
                    sumData.result = {uids: []};
                    clinvarLoadVariantsFunction(sumData.result);
                    resolve();
                  } else {
                    var sorted = sumData.result.uids.sort(function(a,b){
                      var aStart = parseInt(sumData.result[a].variation_set[0].variation_loc.filter(function(v){return v["assembly_name"] == me.getGenomeBuildHelper().getCurrentBuildName()})[0].start);
                      var bStart = parseInt(sumData.result[b].variation_set[0].variation_loc.filter(function(v){return v["assembly_name"] == me.getGenomeBuildHelper().getCurrentBuildName()})[0].start);
                      if ( aStart > bStart)
                        return 1;
                      else
                        return -1;
                    })
                    sumData.result.uids = sorted;
                    if (clinvarLoadVariantsFunction) {
                      clinvarLoadVariantsFunction(sumData.result);
                    }
                    resolve();
                  }
                })
                .fail(function() {
                  console.log('Error: clinvar http request failed to get summary data');
                  resolve("clinvarError");
                  //reject('Error: clinvar http request failed to get summary data');
                })
            }
          })
          .fail(function() {
            console.log('Error: clinvar http request failed to get IDs');
            //reject('Error: clinvar http request failed to get IDs');
            resolve("clinvarError");

          })
        }
      });

  };



  exports._annotateVcfRegion = function(records, refName, sampleName, annotationEngine, isRefSeq, hgvsNotation, getRsId, vepAF, useServerCache, callback, callbackClinvar) {
          var me = this;

          //  Figure out the reference sequence file path
          var refFastaFile = me.getGenomeBuildHelper().getFastaPath(refName);

          var writeStream = function (stream) {
              records.forEach(function (record) {
                  if (record.trim() === "") {
                  } else {
                      stream.write(record + "\n");
                  }
              });

              stream.end();
          };

          var cmd = me.getEndpoint().annotateVariants({'writeStream': writeStream}, refName, regions, sampleName, annotationEngine, isRefSeq, hgvsNotation, getRsId, vepAF, useServerCache);


          var buffer = "";
          // Get the results from the command
          cmd.on('data', function (data) {
              buffer = buffer + data;
          });

          cmd.on('end', function () {
              callback(buffer);
          });

          cmd.on('error', function (error) {
              console.log("error while annotating vcf records " + error);
          });

          // Run the iobio command
          cmd.run();
    };


    exports._parseVcfRecords = function (vcfRecs, refName, geneObject, selectedTranscript, clinvarMap, hasExtraAnnot, parseMultiSample, sampleNames, sampleIndex, vepAF, sampleModelId) {

        var me = this;
        var selectedTranscriptID = globalApp.utility.stripTranscriptPrefix(selectedTranscript.transcript_id);

        // Use the sample index to grab the right genotype column from the vcf record
        // If it isn't provided, assume that the first genotype column is the one
        // to be evaluated and parsed.  If sampleNames (a comma separated value string) is
        // provided, evaluate the sample indices as ordinals since vt select will return only those
        // sample (genotype) columns.
        var gtSampleIndices = [];
        var gtSampleNames = null;

        if (sampleNames != null && sampleNames !== "") {
            gtSampleNames = globalApp.utility.uniq(sampleNames.split(","));
            gtSampleIndices = gtSampleNames.map(function (sampleName, i) {
                return i;
            });
        }
        // If no sample name provided, get the genotype for the provided
        // index.  If no index provided, get the first genotype.
        if (gtSampleIndices.length === 0) {
            gtSampleIndices.push(sampleIndex != null ? sampleIndex : 0);
        }
        if (gtSampleNames == null) {
            gtSampleNames = gtSampleIndices.map(function (elem, i) {
                return elem.toString();
            })
        }
        var allVariants = null;
        if (parseMultiSample) {
            allVariants = gtSampleIndices.map(function (element) {
                return [];
            })
        } else {
            allVariants = [[]];
        }


        // The variant region may span more than the specified region.
        // We will be keeping track of variant depth by relative position
        // of the region start, so to prevent a negative index, we will
        // keep track of the region start based on the variants.
        var variantRegionStart = geneObject.start;

        // Interate through the vcf records.  For each record, if multiple
        // alternates are provided, iterate through each alternate
        vcfRecs.forEach(function (rec) {
            if (rec.pos && rec.id) {
                var alts = [];
                if (rec.alt.indexOf(',') > -1) {
                    // Done split apart multiple alt alleles for education edition
                    if (isEduMode) {
                        alts.push(rec.alt);
                    } else {
                        alts = rec.alt.split(",");
                    }
                } else {
                    alts.push(rec.alt);
                }
                var altIdx = 0;
                alts.forEach(function (alt) {
                    var len = null;
                    var type = null;
                    var end = null;

                    var isMultiAllelic = alts.length > 1;

                    if (alt.indexOf("<") === 0 && alt.indexOf(">") > 0) {
                        var annotTokens = rec.info.split(";");
                        annotTokens.forEach(function (annotToken) {
                            if (annotToken.indexOf("SVLEN=") === 0) {
                                len = Math.abs(+annotToken.substring(6, annotToken.length));
                            } else if (annotToken.indexOf("SVTYPE=") === 0) {
                                type = annotToken.substring(7, annotToken.length);
                                //if (type && type.toLowerCase() == 'mnp') {
                                //  type = 'snp';
                                //}
                            }
                        });
                        rec.ref = '';
                        alt = '';
                        end = +rec.pos + len;

                    } else {
                        len = alt.length;
                        type = 'SNP';
                        if (rec.ref === '.' || alt.length > rec.ref.length) {
                            type = 'INS';
                            len = alt.length - rec.ref.length;
                        } else if (rec.alt === '.' || alt.length < rec.ref.length) {
                            type = 'DEL';
                            len = rec.ref.length - alt.length;
                        }
                        end = +rec.pos + len;

                    }


                    var annot = me._parseAnnot(rec, altIdx, isMultiAllelic, geneObject, selectedTranscript, selectedTranscriptID, vepAF);

                    var clinvarResult = me.parseClinvarInfo(rec.info, clinvarMap);

                    var gtResult = me._parseGenotypes(rec, alt, altIdx, gtSampleIndices, gtSampleNames);

                    var clinvarObject = me._formatClinvarCoordinates(rec, alt);

                    if (gtResult.keep) {

                        var highestImpactSnpeff = me._getHighestImpact(annot.snpEff.allSnpeff, me._cullTranscripts, selectedTranscriptID);
                        var highestImpactVep = me._getHighestImpact(annot.vep.allVep, me._cullTranscripts, selectedTranscriptID);
                        var highestSIFT = me._getLowestScore(annot.vep.allSIFT, me._cullTranscripts, selectedTranscriptID);
                        var highestPolyphen = me._getHighestScore(annot.vep.allPolyphen, me._cullTranscripts, selectedTranscriptID);
                        var highestREVEL = me._getHighestScore(annot.vep.allREVEL, me._cullTranscripts, selectedTranscriptID);

                        for (var i = 0; i < allVariants.length; i++) {
                            var genotype = gtResult.genotypes[i];
                            let cssFormattedAlt = getCssSafeAlt(rec.alt);
                            let cssFormattedStrand = geneObject.strand === '+' ? 'plus' : 'minus';
                            let trimmedChromName = refName.indexOf("chr") === 0 ? refName.slice(3) : refName; // We have to synonymize chromosome name between versions - no chr13 vs 13 b/c messes up track filtering

                            // Keep the variant if we are just parsing a single sample (parseMultiSample=false)
                            // or we are parsing multiple samples and this sample's genotype is het or hom
                            if (!parseMultiSample || genotype.keep) {
                                var variant = {
                                    'start': +rec.pos,
                                    'end': +end,
                                    'len': +len,
                                    'level': +0,
                                    'strand': geneObject.strand,
                                    'chrom': refName,
                                    'type': annot.typeAnnotated && annot.typeAnnotated !== '' ? annot.typeAnnotated : type,
                                    'id': ('var_' + rec.pos + '_' + trimmedChromName + '_' + cssFormattedStrand + '_' + rec.ref + '_' + cssFormattedAlt),  // key = start.chromosome.strand.ref.alt NOTE: have to use alt instead of rec.alt b/c rec.alt is comma-delim combined of all alts
                                    'ref': rec.ref,
                                    'alt': alt,
                                    'qual': rec.qual,
                                    'recfilter': rec.filter.split(";").join("-"),

                                    'extraAnnot': hasExtraAnnot,

                                    // genotype fields
                                    'genotypes': gtResult.genotypeMap,
                                    'genotype': genotype,
                                    'genotypeDepth': genotype.genotypeDepth,
                                    'genotypeFilteredDepth': genotype.filteredDepth,
                                    'genotypeAltCount': genotype.altCount,
                                    'genotypeRefCount': genotype.refCount,
                                    'genotypeAltForwardCount': genotype.altForwardCount,
                                    'genotypeAltReverseCount': genotype.altReverseCount,
                                    'genotypeRefForwardCount': genotype.refForwardCount,
                                    'genotypeRefReverseCount': genotype.refReverseCount,
                                    'eduGenotype': genotype.eduGenotype,
                                    'eduGenotypeReversed': genotype.eduGenotypeReversed,
                                    'zygosity': genotype.zygosity ? genotype.zygosity : 'gt_unknown',
                                    'phased': genotype.phased,

                                    // fields to init to 'empty'
                                    'consensus': rec.consensus,
                                    'inheritance': '',

                                    // clinvar coords
                                    'clinvarStart': clinvarObject.clinvarStart,
                                    'clinvarRef': clinvarObject.clinvarRef,
                                    'clinvarAlt': clinvarObject.clinvarAlt,

                                    //
                                    // annot fields
                                    //
                                    'af': annot.af,
                                    'af1000G': me._parseAf(altIdx, annot.af1000G),
                                    'afExAC': me._parseAf(altIdx, annot.afExAC),
                                    'afgnomAD': vepAF ? annot.vep.af['gnomAD'].AF : '',
                                    'rsid': annot.rs,
                                    'combinedDepth': annot.combinedDepth,

                                    // snpeff
                                    'effect': annot.snpEff.effects,
                                    'impact': annot.snpEff.impacts,

                                    // vep
                                    'vepConsequence': annot.vep.vepConsequence,
                                    'vepImpact': annot.vep.vepImpact,
                                    'vepExon': annot.vep.vepExon,
                                    'vepHGVSc': annot.vep.vepHGVSc,
                                    'vepHGVSp': annot.vep.vepHGVSp,
                                    'vepAminoAcids': annot.vep.vepAminoAcids,
                                    'vepVariationIds': annot.vep.vepVariationIds,
                                    'vepREVEL': annot.vep.vepREVEL,
                                    'vepSIFT': annot.vep.vepSIFT,
                                    'sift': annot.vep.sift,
                                    'vepPolyPhen': annot.vep.vepPolyPhen,
                                    'polyphen': annot.vep.polyphen,
                                    'vepRegs': annot.vep.vepRegs,
                                    'regulatory': annot.vep.regulatory,
                                    'vepAf': annot.vep.af,

                                    // generic annots
                                    'genericAnnots': annot.genericAnnots,

                                    //  when multiple impacts, pick the highest one (by variant type and transcript)
                                    'highestImpactSnpeff': highestImpactSnpeff,
                                    'highestImpactVep': highestImpactVep,
                                    'highestSIFT': highestSIFT,
                                    'highestPolyphen': highestPolyphen,
                                    'highestREVEL': highestREVEL,
                                    'isInherited': null,              // Null = undetermined, True = inherited, False = somatic
                                    'passesFilters': true,            // Used for somatic calling when other filters applied
                                    'inCosmic': false,
                                    'cosmicLegacyId': null,           // Used for cosmic links in variant detail tooltip
                                    'sampleModelId': sampleModelId   // Used for feature matrix tracking
                                };

                                for (var key in clinvarResult) {
                                    variant[key] = clinvarResult[key];
                                }

                                if (me.getGenericAnnotation() !== undefined) {
                                    me.getGenericAnnotation().setSimpleFields(variant);
                                }
                                allVariants[i].push(variant);
                            }
                        }

                        if (rec.pos < variantRegionStart) {
                            variantRegionStart = rec.pos;
                        }
                    }
                    altIdx++;
                });
            }
        });

        // Here is the result set.  An object representing the entire region with a field called
        // 'features' that contains an array of variants for this region of interest.
        var results = [];
        for (var i = 0; i < allVariants.length; i++) {
            var data = {
                'name': gtSampleNames ? gtSampleNames[i] : 'vcf track',
                'ref': refName,
                'gene': geneObject.gene_name,
                'start': +geneObject.start,
                'end': +geneObject.end,
                'strand': geneObject.strand,
                'transcript': selectedTranscript,
                'variantRegionStart': variantRegionStart,
                'loadState': {},
                'features': allVariants[i],
                'genericAnnotators': me.infoFields ? Object.keys(me.infoFields) : []
            };
            results.push(data);
        }
        return parseMultiSample ? results : results[0];
    };

    var getCssSafeAlt = function(alt) {
      if (alt == null || alt === "") {
        console.log("Bad alt input");
        return alt;
      }

      if (alt === '*') {
        return 'D';
      }

      let safeAlt = alt;
      let checkAlt = true;
      while(checkAlt) {
        let badCharIdx = safeAlt.indexOf(',');
        if (badCharIdx >= 0) {
            safeAlt = alt.slice(0, badCharIdx);
            safeAlt += '_';
            safeAlt += alt.slice(badCharIdx+1);
        } else {
          checkAlt = false;
        }
    }
      return safeAlt;
    };

    exports._parseAnnot = function (rec, altIdx, isMultiAllelic, geneObject, selectedTranscript, selectedTranscriptID, vepAF) {
        var me = this;

        var annot = {
            af: null,
            typeAnnotated: null,
            combinedDepth: null,
            af1000G: '.',
            afExAC: '.',
            rs: '',
            snpEff: {
                effects: {},
                impacts: {},
                allSnpeff: {}
            },
            vep: {
                allVep: {},
                allSIFT: {},
                allPolyphen: {},
                allREVEL: {},
                vepConsequence: {},
                vepImpact: {},
                vepFeatureType: {},
                vepFeature: {},
                vepExon: {},
                vepHGVSc: {},
                vepHGVSp: {},
                vepAminoAcids: {},
                vepVariationIds: {},
                vepSIFT: {},
                vepPolyPhen: {},
                vepREVEL: {},
                sift: {},       // need a special field for filtering purposes
                polyphen: {},   // need a special field for filtering purposes
                regulatory: {}, // need a special field for filtering purposes
                vepRegs: [],
                af: {'1000G': {}, 'ESP': {}, 'gnomAD': {}, 'MAX': {}}
            },
            genericAnnots: {}
        };

        var annotTokens = rec.info.split(";");

        annotTokens.forEach(function (annotToken) {
            if (annotToken.indexOf("BGAF_1KG=") == 0) {

                annot.af1000G = annotToken.substring(9, annotToken.length);

            } else if (annotToken.indexOf("BGAF_EXAC=") == 0) {

                annot.afExAC = annotToken.substring(10, annotToken.length);

            } else if (annotToken.indexOf("RS=") == 0) {

                annot.rs = annotToken.substring(3, annotToken.length);

            } else if (annotToken.indexOf("AF=") == 0) {

                // For now, just grab first af
                //af = me._parseAnnotForAlt(annotToken.substring(3, annotToken.length), altIdx);
                annot.af = me._parseAnnotForAlt(annotToken.substring(3, annotToken.length), 0);

            } else if (annotToken.indexOf("TYPE=") == 0) {

                annot.typeAnnotated = me._parseAnnotForAlt(annotToken.substring(5, annotToken.length), altIdx);

            } else if (annotToken.indexOf("DP=") == 0) {

                annot.combinedDepth = annotToken.substring(3, annotToken.length);

            } else if (annotToken.indexOf("EFF=") == 0) {

                me._parseSnpEffAnnot(annotToken, annot, geneObject, selectedTranscriptID);

            } else if (annotToken.indexOf("CSQ") == 0) {

                me._parseVepAnnot(altIdx, isMultiAllelic, annotToken, annot, geneObject, selectedTranscript, selectedTranscriptID, vepAF)

            } else if (annotToken.indexOf("AVIA3") == 0) {
                me._parseGenericAnnot("AVIA3", annotToken, annot);

            }
        });
        return annot;
    };

      /* To parse the VEP annot, split the CSQ string into its parts.
         Each part represents the annotations for a given transcript.

        Here is the field mapping for each transcript
        which is separated by a comma

         Allele|Consequence|IMPACT|SYMBOL|Gene|Feature_type|Feature|BIOTYPE|EXON|INTRON|HGVSc|HGVSp
         |cDNA_position|CDS_position|Protein_position|Amino_acids|Codons|Existing_variation
         |DISTANCE|STRAND|FLAGS|SYMBOL_SOURCE|HGNC_ID|GENE_PHENO|SIFT|PolyPhen|HGVS_OFFSET
         |AFR_AF|AMR_AF|EAS_AF|EUR_AF|SAS_AF
         |AA_AF|EA_AF
         |gnomAD_AF|gnomAD_AFR_AF|gnomAD_AMR_AF|gnomAD_ASJ_AF|gnomAD_EAS_AF|gnomAD_FIN_AF|gnomAD_NFE_AF|gnomAD_OTH_AF|gnomAD_SAS_AF
         |MAX_AF|MAX_AF_POPS
         |CLIN_SIG|SOMATIC|PHENO|MOTIF_NAME|MOTIF_POS|HIGH_INF_POS|MOTIF_SCORE_CHANGE
      */
      exports._parseVepAnnot = function (altIdx, isMultiAllelic, annotToken, annot, geneObject, selectedTranscript, selectedTranscriptID, vepAF) {
          var me = this;

          var vepFields = me.infoFields.VEP;

          var tokenValue = annotToken.substring(4, annotToken.length);
          var transcriptTokens = tokenValue.split(",");

          transcriptTokens.forEach(function (transcriptToken) {
              var vepTokens = transcriptToken.split("|");

              var keep = true;
              if (isMultiAllelic) {
                  if (vepFields.hasOwnProperty('ALLELE_NUM') && vepFields.ALLELE_NUM >= 0) {
                      var vepAlleleNumber = vepTokens[vepFields.ALLELE_NUM];
                      if (altIdx >= 0 && vepAlleleNumber >= 0) {
                          if (altIdx + 1 != vepAlleleNumber) {
                              keep = false;
                          }
                      }
                  }
              }

              if (keep) {
                  var feature = vepTokens[vepFields.Feature];
                  var featureType = vepTokens[vepFields.Feature_type];

                  // If the transcript is the selected transcript, parse
                  // all of the vep fields.  We place these into maps
                  // because we can have multiple vep consequences for
                  // the same transcript.
                  // TODO:  Need to sort so that highest impact shows first and is used for filtering and ranking purposes.
                  if (featureType == 'Transcript' && (feature == selectedTranscriptID || feature == selectedTranscript.transcript_id)) {
                      annot.vep.vepImpact[vepTokens[vepFields.IMPACT]] = vepTokens[vepFields.IMPACT];

                      var consequence = vepTokens[vepFields.Consequence];
                      consequence.split("&").forEach(function (token) {
                          annot.vep.vepConsequence[token] = token;
                      })

                      if (vepTokens[vepFields.EXON] && vepTokens[vepFields.EXON].length > 0) {
                          annot.vep.vepExon[vepTokens[vepFields.EXON]] = vepTokens[vepFields.EXON];
                      }
                      annot.vep.vepHGVSc[vepTokens[vepFields.HGVSc]] = vepTokens[vepFields.HGVSc];
                      annot.vep.vepHGVSp[vepTokens[vepFields.HGVSp]] = vepTokens[vepFields.HGVSp];
                      annot.vep.vepAminoAcids[vepTokens[vepFields.Amino_acids]] = vepTokens[vepFields.Amino_acids];
                      annot.vep.vepVariationIds[vepTokens[vepFields.Existing_variation]] = vepTokens[vepFields.Existing_variation];

                      var siftString = vepTokens[vepFields.SIFT];
                      var siftDisplay = siftString != null && siftString != "" ? siftString.split("(")[0] : "";
                      annot.vep.vepSIFT[siftDisplay] = siftDisplay;
                      annot.vep.sift['sift_' + siftDisplay] = 'sift_' + siftDisplay;

                      var polyphenString = vepTokens[vepFields.PolyPhen];
                      var polyphenDisplay = polyphenString != null && polyphenString != "" ? polyphenString.split("(")[0] : "";
                      annot.vep.vepPolyPhen[polyphenDisplay] = polyphenDisplay;
                      annot.vep.polyphen['polyphen_' + polyphenDisplay] = 'polyphen_' + polyphenDisplay;

                      if (vepFields.REVEL) {
                          var revelScore = vepTokens[vepFields.REVEL];
                          annot.vep.vepREVEL[revelScore] = revelScore;
                      }


                  } else if (featureType == 'RegulatoryFeature' || featureType == 'MotifFeature') {
                      annot.vep.vepRegs.push({
                          'impact': vepTokens[vepFields.IMPACT],
                          'consequence': vepTokens[vepFields.Consequence],
                          'biotype': vepTokens[vepFields.BIOTYPE],
                          'motifName': vepTokens[vepFields.MOTIF_NAME],
                          'motifPos': vepTokens[vepFields.MOTIF_POS],
                          'motifHiInf': vepTokens[vepFields.HIGH_INF_POS]
                      });
                      var reg = vepTokens[vepFields.Consequence] == 'regulatory_region_variant' ? vepTokens[vepFields.BIOTYPE] : vepTokens[vepFields.Consequence];
                      var regKey = reg;
                      if (reg == "promoter") {
                          regKey = "the_promoter";
                      }

                      var valueUrl = "";
                      if (feature != "" && feature != null) {
                          var url = me.getGenomeBuildHelper().getBuildResource(me.getGenomeBuildHelper().RESOURCE_ENSEMBL_URL) + "Regulation/Context?db=core;fdb=funcgen;rf=" + feature;
                          valueUrl = '<a href="' + url + '" target="_reg">' + reg.split("_").join(" ").toLowerCase() + '</a>';
                      } else {
                          valueUrl = reg.split("_").join(" ").toLowerCase();
                      }
                      annot.vep.regulatory[(featureType == 'RegulatoryFeature' ? "reg_" : "mot_") + regKey.toLowerCase()] = valueUrl;
                  }
                  if (featureType == 'Transcript') {
                      var theTranscriptId = feature;

                      // Only keep annotations that are for transcripts that in the gene's list of known
                      // transcripts
                      var validTranscript = false;
                      geneObject.transcripts.forEach(function (transcript) {
                          if (transcript.transcript_id.indexOf(theTranscriptId) == 0) {
                              validTranscript = true;
                          }
                      });
                      if (validTranscript) {
                          // Keep track of all VEP impact and consequence so that we can determine the highest impact
                          // variant across all transcripts
                          var theImpact = vepTokens[vepFields.IMPACT];
                          var theConsequences = vepTokens[vepFields.Consequence];
                          var siftString = vepTokens[vepFields.SIFT];
                          var siftDisplay = siftString != null && siftString != "" ? siftString.split("(")[0] : "";
                          var siftScore = "99";
                          if (siftString != null && siftString != "" && siftString.indexOf("(") >= 0) {
                              siftScore = siftString.split("(")[1].split(")")[0];
                          }
                          var polyphenString = vepTokens[vepFields.PolyPhen];
                          var polyphenDisplay = polyphenString != null && polyphenString != "" ? polyphenString.split("(")[0] : "";
                          var polyphenScore = -99;
                          if (polyphenString != null && polyphenString != "" && polyphenString.indexOf("(") >= 0) {
                              polyphenScore = polyphenString.split("(")[1].split(")")[0];
                          }

                          var revelScore = vepFields.REVEL ? vepTokens[vepFields.REVEL] : "";

                          var consequencesObject = annot.vep.allVep[theImpact];
                          if (consequencesObject == null) {
                              consequencesObject = {};
                          }

                          me._appendTranscript(consequencesObject, theConsequences, theTranscriptId);
                          annot.vep.allVep[theImpact] = consequencesObject;

                          var siftObject = annot.vep.allSIFT[siftScore];
                          if (siftObject == null) {
                              siftObject = {};
                          }
                          me._appendTranscript(siftObject, siftDisplay, theTranscriptId);
                          annot.vep.allSIFT[siftScore] = siftObject;

                          var polyphenObject = annot.vep.allPolyphen[polyphenScore];
                          if (polyphenObject == null) {
                              polyphenObject = {};
                          }
                          me._appendTranscript(polyphenObject, polyphenDisplay, theTranscriptId);
                          annot.vep.allPolyphen[polyphenScore] = polyphenObject;

                          var revelObject = annot.vep.allREVEL[revelScore];
                          if (revelObject == null) {
                              revelObject = {};
                          }
                          me._appendTranscript(revelObject, revelScore, theTranscriptId);
                          annot.vep.allREVEL[revelScore] = revelObject;


                          if (vepAF) {
                              me._parseVepAfAnnot(VEP_FIELDS_AF_GNOMAD, vepFields, vepTokens, "gnomAD", "gnomAD", annot);
                              me._parseVepAfAnnot(VEP_FIELDS_AF_1000G, vepFields, vepTokens, "1000G", null, annot);
                              me._parseVepAfAnnot(VEP_FIELDS_AF_ESP, vepFields, vepTokens, "ESP", null, annot);
                              me._parseVepAfAnnot(VEP_FIELDS_AF_MAX, vepFields, vepTokens, "MAX", "MAX", annot);
                          }

                      } else {
                          var consequence = vepTokens[vepFields.Consequence];
                          //console.log(geneObject.gene_name + " " + consequence + ": throwing out invalid transcript " + theTranscriptId);
                      }

                  }
              }
          });
      };

      exports._parseVepAfAnnot = function (fieldNames, vepFields, vepTokens, afSource, omitPrefix, annot) {
          fieldNames.forEach(function (fieldName) {
              var targetFieldName = omitPrefix ? fieldName.split(omitPrefix + "_")[1] : fieldName;
              var tokenIdx = vepFields[fieldName];
              if (tokenIdx && vepTokens[tokenIdx] && vepTokens[tokenIdx].length > 0) {
                  annot.vep.af[afSource][targetFieldName] = vepTokens[tokenIdx];
              } else {
                  annot.vep.af[afSource][targetFieldName] = ".";
              }
          })
      };

      exports._parseGenericAnnot = function (annotator, annotToken, annot) {
          var me = this;
          var annotObject = {};
          var fieldMap = me.infoFields[annotator];

          var infoValues = annotToken.substring(annotator.length + 1, annotToken.length);
          var tokens = infoValues.split("|");
          for (var fieldName in fieldMap) {
              var idx = fieldMap[fieldName];

              var theValue = tokens[idx] ? tokens[idx] : '';
              var valueObject = null;
              if (theValue.indexOf(":") > 0) {
                  valueObject = {};
                  var subFields = theValue.split(":");
                  // for each pair, create a tag/value in the associative array
                  for (var x = 0; x < subFields.length - 1; x += 2) {
                      var tag = subFields[x];
                      var value = subFields[x + 1];
                      valueObject[tag] = value;
                  }
              } else {
                  valueObject = theValue;
              }

              annotObject[fieldName] = valueObject;
          }
          annot.genericAnnots[annotator] = annotObject;
      };

      /* Split the EFF annotation into its parts.  Each
          part represents the annotations for a given transcript.
      */
      exports._parseSnpEffAnnot = function (annotToken, annot, geneObject, selectedTranscriptID) {
          var me = this;

          var tokenValue = annotToken.substring(4, annotToken.length);
          var tokens = tokenValue.split(",");

          tokens.forEach(function (token) {
              // If we passed in an applicable transcript, grab the snpEff
              // annotations pertaining to it.  Otherwise, just grab the
              // first snpEff annotations listed.

              //EFF= Effect ( Effect_Impact | Functional_Class | Codon_Change | Amino_Acid_Change| Amino_Acid_Length |
              //              Gene_Name | Transcript_BioType | Gene_Coding | Transcript_ID | Exon_Rank  |
              //              Genotype_Number [ | ERRORS | WARNINGS ] )

              var stop = token.indexOf("(");
              var theEffect = token.substring(0, stop);
              var remaining = token.substring(stop + 1, token.length);
              var effectTokens = remaining.split("|");
              var theImpact = effectTokens[0];
              var theTranscriptId = effectTokens[8];


              // Make sure that this annotation belongs to a transcript in the gene's transcript set.
              var validTranscript = false;
              geneObject.transcripts.forEach(function (transcript) {
                  if (transcript.transcript_id.indexOf(theTranscriptId) == 0) {
                      validTranscript = true;
                  }
              });

              if (validTranscript) {
                  // Determine if this is an annotation for the selected transcript
                  var parseForSelectedTranscript = false;
                  if (selectedTranscriptID && token.indexOf(selectedTranscriptID) > -1) {
                      parseForSelectedTranscript = true;
                  }


                  // Map all impact to effects so that we can determine
                  // the highest impact/effects for this variant, across
                  // ALL transcripts for this variant.
                  var effectsObject = allSnpeff[theImpact];
                  if (effectsObject == null) {
                      effectsObject = {};
                  }
                  me._appendTranscript(effectsObject, theEffect, theTranscriptId);
                  annot.snpEff.allSnpeff[theImpact] = effectsObject;

                  if (parseForSelectedTranscript) {
                      // Parse out the effect
                      annot.snpEff.effects[theEffect] = theEffect;

                      // Parse out the impact
                      annot.snpEff.impacts[theImpact] = theImpact;
                  }
              } else {
                  //console.log(geneObject.gene_name + " " + theEffect + ": throwing out invalid transcript " + selectedTranscriptID)
              }

          });

          if ($.isEmptyObject(annot.snpEff.impacts)) {
              annot.snpEff.impacts["NOIMPACT"] = "NOIMPACT";
          }
      };

      exports.getClinvarAnnots = function () {
          return {
              clinvarSubmissions: [],
              clinVarClinicalSignificance: {},
              clinVarPhenotype: {},
              clinVarAccession: {},
              clinvarRank: null,
              clinvar: null
          };
      };

      exports.parseClinvarInfo = function (info, clinvarMap) {
          var me = this;

          var result = me.getClinvarAnnots();


          var initClinvarSubmissions = function (clinvarSubmissions, length) {
              for (var i = 0; i < length; i++) {
                  var entry = {clinsig: "", phenotype: "", accession: ""};
                  clinvarSubmissions.push(entry);
              }
          };

          info.split(";").forEach(function (annotToken) {

              if (annotToken.indexOf("CLNSIG=") === 0) {
                  var clinvarCode = annotToken.substring(7, annotToken.length);

                  initClinvarSubmissions(result.clinvarSubmissions, clinvarCode.split("|").length);

                  var idx = 0;
                  clinvarCode.split("|").forEach(function (codePart) {
                      var submission = result.clinvarSubmissions[idx];

                      codePart.split(",").forEach(function (code) {

                          var clinvarToken = CLINVAR_CODES[code];
                          var mapEntry = clinvarMap[clinvarToken];
                          if (mapEntry != null) {
                              if (result.clinvarRank == null || mapEntry.value < result.clinvarRank) {

                                  result.clinvarRank = mapEntry.value;
                                  result.clinvar = mapEntry.clazz;

                              }
                              submission.clinsig += submission.clinsig.length > 0 ? "," : "";
                              submission.clinsig += clinvarToken;
                              result.clinVarClinicalSignificance[clinvarToken] = idx.toString();
                          }

                      });

                      idx++;
                  })
              } else if (annotToken.indexOf("CLNDBN=") === 0) {
                  var phenotypesStr = annotToken.substring(7, annotToken.length);
                  var idx = 0;
                  phenotypesStr.split("|").forEach(function (pheno) {

                      var submission = result.clinvarSubmissions[idx];
                      submission.phenotype = pheno;

                      result.clinVarPhenotype[pheno] = idx.toString();
                      idx++;
                  })
              } else if (annotToken.indexOf("CLNACC=") === 0) {
                  var accessionIds = annotToken.substring(7, annotToken.length);
                  var idx = 0;
                  accessionIds.split("|").forEach(function (accessionId) {

                      var submission = result.clinvarSubmissions[idx];
                      submission.accession = accessionId;

                      result.clinVarAccession[accessionId] = idx.toString();
                      idx++;
                  })
              }
          });
          return result;
      };

      /*
       *
       * Parse the genotype field from in the vcf rec
       *
       */
      exports._parseGenotypes = function (rec, alt, altIdx, sampleIndices, sampleNames) {
          var me = this;

          // The result returned will be an object representing all
          // genotypes for the sample indices provided.
          //
          //  all      the alternate for which these genotype(s) apply
          //  keep     a boolean indicating if any of the sample genotypes
          //           contains this alternate.  For example, if this is a
          //           multiallelic, if non of the samples contains this
          //           alternate, keep will be set to false.
          //  gtNumber Normally, the gtNumber for an alterate will equal
          //           1.  For multi-allelics, this number ranges from
          //           1 to the number of alternate alleles.
          //
          //
          var result = {
              alt: alt,
              keep: false,
              gtNumber: altIdx + 1,
              genotype: {},
              genotypes: [],
              genotypeMap: {}
          };


          // The results will contain an array of genotype objects for
          // each sample index provided.  The first element in the
          // array is assumed to be the "target" genotype.  For example,
          // if we are parsing the genotypes for a trio, the first
          // genotype will be for the proband, followed by 2 more elements
          // for the mother and father's genotypes.
          result.genotypes = sampleIndices.map(function (sampleIndex) {
              return {sampleIndex: sampleIndex, zygosity: null, phased: null};
          });

          // The results will also contain a map to obtain
          // the genotype by sample name.  If sample names were not provided,
          // we will use the index as the key to the map.
          result.genotypes.forEach(function (gt) {
              var key = sampleNames ? sampleNames[gt.sampleIndex] : gt.sampleIndex.toString();
              result.genotypeMap[key] = gt;
          });

          // Determine the format of the genotype fields
          var gtTokens = {};
          var idx = 0;
          if (rec.format && rec.format !== '') {
              var tokens = rec.format.split(":");
              tokens.forEach(function (token) {
                  gtTokens[token] = idx;
                  idx++;
              })
          }

          //
          // For each applicable genotype (of the sample indices provided),
          // parse the genotype field of the vcf record, creating an
          // object with the following fields:
          //    sampleIndex         - The applicable genotype column (for a sample)
          //    gt                  - The genotype field (e.g. 0|1)
          //    zygosity            - The zygosity (e.g. het, hom, homref)
          //    depth               - The total observations at this position
          //    filteredDepth       - The total observations considered at this position
          //    altCount            - The number of observations where the alternate allele was observed
          //    refCount            - The number of observations where the reference allele was observed
          //    altForwardCount,    - The alternate counts for the strands
          //    altReverseCount
          //    refForwardCount,    - The reference counts for the strands
          //    refReverseCount
          //    eduGenotype         - The simplified format for showing genotype (e.g. C->T)
          //    eduGenotypeReversed - For reverse strand, show the compliment of the simplified genotype (e.g. A->G)
          //
          result.genotypes.forEach(function (gt) {
              var genotype = rec.genotypes.length > gt.sampleIndex ? rec.genotypes[gt.sampleIndex] : null;

              if (genotype == null || genotype == "" || genotype == '.') {
                  gt.zygosity = 'gt_unknown';
                  gt.keep = rec.genotypes.length == 0 ? true : false;
                  gt.absent = rec.genotypes.length == 0 ? true : false;
              } else {

                  var tokens = genotype.split(":");
                  var gtFieldIndex = gtTokens["GT"];
                  gt.gt = tokens[gtFieldIndex];

                  var gtDepthIndex = gtTokens["DP"];
                  if (gtDepthIndex) {
                      gt.filteredDepth = tokens[gtDepthIndex];
                  } else {
                      gt.filteredDepths = null;
                  }

                  var gtAlleleCountIndex = gtTokens["AD"];
                  var gtAltCountIndex = gtTokens["AO"];
                  if (gtAlleleCountIndex) {
                      //
                      // GATK allele counts
                      //
                      var countTokens = tokens[gtAlleleCountIndex].split(",");
                      if (countTokens.length >= 2) {
                          var refAlleleCount = countTokens[0];
                          var altAlleleCounts = countTokens.slice(1).join(",");

                          var totalAllelicDepth = 0;
                          countTokens.forEach(function (allelicDepth) {
                              if (allelicDepth) {
                                  totalAllelicDepth += +allelicDepth;
                              }
                          });

                          gt.altCount = altAlleleCounts;
                          gt.refCount = refAlleleCount;
                          gt.genotypeDepth = totalAllelicDepth;
                      } else {
                          gt.altCount = null;
                          gt.refCount = null;
                          gt.genotypeDepth = null;
                      }
                  } else if (gtAltCountIndex) {
                      //
                      // Freebayes allele counts
                      //
                      var totalAllelicDepth = 0;


                      gt.altCount = tokens[gtAltCountIndex];

                      var altCountTokens = gt.altCount.split(",");
                      altCountTokens.forEach(function (allelicDepth) {
                          if (allelicDepth) {
                              totalAllelicDepth += +allelicDepth;
                          }
                      })

                      var gtRefCountIndex = gtTokens["RO"];
                      if (gtRefCountIndex) {
                          gt.refCount = tokens[gtRefCountIndex];
                          totalAllelicDepth += +gt.refCount;
                      } else {
                          gt.refCount = null;
                      }

                      gt.genotypeDepth = totalAllelicDepth;


                  } else {
                      gt.altCount = null;
                      gt.refCount = null;
                  }

                  gt.altCount = me._parseMultiAllelic(result.gtNumber - 1, gt.altCount, ",");


                  var strandAlleleCountIndex = gtTokens["SAC"]; // GATK
                  var strandRefForwardIndex = gtTokens["SRF"]; // Freebayes
                  var strandRefReverseIndex = gtTokens["SRR"]; // Freebayes
                  var strandAltForwardIndex = gtTokens["SAF"]; // Freebayes
                  var strandAltReverseIndex = gtTokens["SAR"]; // Freebayes
                  if (strandAlleleCountIndex) {
                      //
                      // GATK Strand allele counts, comma separated
                      //
                      var countTokens = tokens[strandAlleleCountIndex].split(",");
                      if (countTokens.length == 4) {
                          gt.refForwardCount = tokens[0];
                          gt.refReverseCount = tokens[1];
                          gt.altForwardCount = tokens[2];
                          gt.altReverseCount = tokens[3];
                      } else {
                          gt.refForwardCount = null;
                          gt.refReverseCount = null;
                          gt.altForwardCount = null;
                          gt.altReverseCount = null;
                      }
                  } else if (strandRefForwardIndex && strandRefReverseIndex && strandAltForwardIndex && strandAltReverseIndex) {
                      //
                      // Freebayes Strand bias counts (SRF, SRR, SAF, SAR)
                      //
                      gt.refForwardCount = tokens[strandRefForwardIndex];
                      gt.refReverseCount = tokens[strandRefReverseIndex];
                      gt.altForwardCount = tokens[strandAltForwardIndex];
                      gt.altReverseCount = tokens[strandAltReverseIndex];
                  } else {
                      gt.refForwardCount = null;
                      gt.refReverseCount = null;
                      gt.altForwardCount = null;
                      gt.altReverseCount = null;
                  }


                  // Only keep the alt if we have a genotype that matches.
                  // For example
                  // A->G    0|1 keep
                  // A->G,C  0|1 keep A->G, but bypass A->C
                  // A->G,C  0|2 bypass A->G, keep A->C
                  // A->G,C  1|2 keep A->G, keep A->C
                  // unknown .   bypass
                  var delim = null;

                  if (gt.gt.indexOf("|") > 0) {
                      delim = "|";
                      gt.phased = true;
                  } else if (gt.gt.indexOf("/") > 0) {
                      delim = "/";
                      gt.phased = false;
                  } else {
                      gt.keep = false;
                      gt.zygosity = "gt_unknown";
                  }
                  if (delim) {
                      var tokens = gt.gt.split(delim);
                      if (tokens.length == 2) {
                          if (isEduMode && alt.indexOf(",") > 0) {
                              if ((tokens[0] == 1) && (tokens[1] == 2)) {
                                  gt.keep = true;
                              }
                              if (tokens[0] == tokens[1]) {
                                  gt.keep = true;
                                  var theAltIdx = tokens[0] - 1;
                                  result.alt = alt.split(',')[theAltIdx] + ',' + alt.split(',')[theAltIdx];
                              } else if (tokens[0] == 0 && tokens[1] != 0) {
                                  var theAltIdx = +tokens[1] - 1;
                                  result.alt = alt.split(',')[theAltIdx]
                              } else if (tokens[1] == 0 && tokens[0] != 0) {
                                  var theAltIdx = +tokens[0] - 1;
                                  result.alt = alt.split(',')[theAltIdx]
                              }
                              if (gt.keep) {
                                  if (tokens[0] == tokens[1]) {
                                      gt.zygosity = "HOM";
                                  } else {
                                      gt.zygosity = "HET";
                                  }
                              }

                          } else if (tokens[0] == result.gtNumber || tokens[1] == result.gtNumber) {
                              gt.keep = true;
                              if (tokens[0] == tokens[1]) {
                                  gt.zygosity = "HOM";
                              } else {
                                  gt.zygosity = "HET";
                              }
                          } else if (tokens[0] == "0" && tokens[1] == "0") {
                              gt.keep = false;
                              gt.zygosity = "HOMREF"
                          }
                      }

                      gt.eduGenotype = "";
                      if (isEduMode) {
                          var alts = alt.split(",");
                          var gtIdx1 = +tokens[0];
                          var gtIdx2 = +tokens[1];
                          if (gt.zygosity == "HET" && gtIdx1 == 0) {
                              gt.eduGenotype = rec.ref + " " + alts[altIdx];
                          } else if (gt.zygosity == "HET" && gtIdx1 > 0) {
                              gt.eduGenotype = alts[gtIdx1 - 1] + " " + alts[gtIdx2 - 1];
                          } else if (gt.zygosity == "HOM") {
                              gt.eduGenotype = alts[gtIdx1 - 1] + " " + alts[gtIdx1 - 1];
                          } else if (gt.zygosity == "HOMREF") {
                              gt.eduGenotype = rec.ref + " " + rec.ref;
                          }
                      }
                      gt.eduGenotypeReversed = globalApp.utility.switchGenotype(gt.eduGenotype);

                  }
              }

          });


          result.genotypes.forEach(function (gt) {
              if (gt.keep) {
                  result.keep = true;
              }
          });

          // The 'target' genotype will be the first genotype in the array
          // For example, if the sampleIndex of '1' was sent in (sampleIndices = [1]),
          // the first element in the the array will be the second genotype
          // column in the vcf record (sample index is 0 based).
          if (result.genotypes.length > 0) {
              result.genotype = result.genotypes[0];
          }

          return result;
      };

      exports._getServerCacheKey = function (vcfName, service, refName, geneObject, sampleName, miscObject) {
          var me = this;

          var key = "backend.gene.iobio"
              //    + "-" + cacheHelper.launchTimestamp
              + "-" + vcfName
              + "-" + service
              + "-" + refName
              + "-" + geneObject.start.toString()
              + "-" + geneObject.end.toString()
              + "-" + geneObject.strand
              + "-" + sampleName;

          if (miscObject) {
              for (var miscKey in miscObject) {
                  key += "-" + miscKey + "=" + miscObject[miscKey];
              }
          }
          return key;
      };

      exports._appendTranscript = function (theObject, key, theTranscriptId) {
          var me = this;
          var transcripts = theObject[key];
          if (transcripts == null) {
              transcripts = {};
          }
          transcripts[theTranscriptId] = theTranscriptId;
          theObject[key] = transcripts;
      };


      exports._cullTranscripts = function (transcriptObject, theTranscriptId) {
          var me = this;
          // If the current transcript is included in the list,
          // we don't have to identify individual transcripts.
          for (var key in transcriptObject) {
              var transcripts = transcriptObject[key];
              var found = false;
              for (var transcriptId in transcripts) {
                  var strippedTranscriptId = globalApp.utility.stripTranscriptPrefix(transcriptId);
                  if (theTranscriptId.indexOf(strippedTranscriptId) == 0) {
                      found = true;
                  }
              }
              if (found) {
                  transcriptObject[key] = {};
              }
          }
          return transcriptObject;
      };

      exports._getHighestImpact = function (theObject, cullFunction, theTranscriptId) {
          var me = this;

          var theEffects = theObject['HIGH'];
          if (theEffects) {
              return {HIGH: cullFunction(theEffects, theTranscriptId)};
          }
          theEffects = theObject['MODERATE'];
          if (theEffects) {
              return {MODERATE: cullFunction(theEffects, theTranscriptId)};
          }
          theEffects = theObject['MODIFIER'];
          if (theEffects) {
              return {MODIFIER: cullFunction(theEffects, theTranscriptId)};
          }
          theEffects = theObject['LOW'];
          if (theEffects) {
              return {LOW: cullFunction(theEffects, theTranscriptId)};
          }
          return {};
      };

      exports._getLowestScore = function (theObject, cullFunction, theTranscriptId) {
          var me = this;
          var minScore = 99;
          for (var score in theObject) {
              if (+score < minScore) {
                  minScore = +score;
              }
          }
          // Now get other entries with the same SIFT/Polyphen category
          var categoryObject = theObject[minScore];
          for (var category in categoryObject) {
              for (var theScore in theObject) {
                  var theCategoryObject = theObject[theScore];
                  if (+theScore != +minScore && theCategoryObject[category] != null) {
                      var theTranscripts = theCategoryObject[category];
                      for (var transcriptId in theTranscripts) {
                          me._appendTranscript(categoryObject, category, transcriptId);
                      }
                  }
              }

          }
          theObject[minScore] = cullFunction(categoryObject, theTranscriptId);
          return theObject[minScore];
      };

      exports._getHighestScore = function (theObject, cullFunction, theTranscriptId) {
          var me = this;
          var maxScore = -99;
          for (var score in theObject) {
              if (+score > maxScore) {
                  maxScore = +score;
              }
          }
          // Now get other entries with the same SIFT/Polyphen category
          var categoryObject = theObject[maxScore];
          for (var category in categoryObject) {
              for (var theScore in theObject) {
                  var theCategoryObject = theObject[theScore];
                  if (+theScore != +maxScore && theCategoryObject[category] != null) {
                      var theTranscripts = theCategoryObject[category];
                      for (var transcriptId in theTranscripts) {
                          me._appendTranscript(categoryObject, category, transcriptId);
                      }
                  }
              }

          }
          theObject[maxScore] = cullFunction(categoryObject, theTranscriptId);
          return theObject[maxScore];
      };

      /*
       *
       * Get rid of the left most anchor base for insertions and
       * deletions for accessing clinvar
       *
      */
      exports._formatClinvarCoordinates = function (rec, alt) {
          var target = {};
          if (rec.hasOwnProperty("pos")) {
              target.clinvarStart = +rec.pos;
          } else if (rec.hasOwnProperty("start")) {
              target.clinvarStart = +rec.start;
          }

          target.clinvarAlt = alt;
          target.clinvarRef = rec.ref;

          if (target.clinvarAlt == '.') {
              target.clinvarAlt = '-';
          } else if (target.clinvarRef == '.') {
              target.clinvarRef = '-';
          } else if (target.clinvarRef.length > target.clinvarAlt.length) {
              // deletion
              target.clinvarStart++;
              target.clinvarAlt = target.clinvarAlt.length == 1 ? "-" : target.clinvarAlt.substr(1, target.clinvarAlt.length - 1);
              target.clinvarRef = target.clinvarRef.substr(1, target.clinvarRef.length - 1);
          } else if (target.clinvarAlt.length > target.clinvarRef.length) {
              // insertion
              target.clinvarStart++;
              target.clinvarRef = target.clinvarRef.length == 1 ? "-" : target.clinvarRef.substr(1, target.clinvarRef.length - 1);
              target.clinvarAlt = target.clinvarAlt.substr(1, target.clinvarAlt.length - 1);
          }
          return target;
      };

      exports._parseMultiAllelic = function (alleleIdx, genotypeValue, delim) {
          if (genotypeValue == null || genotypeValue == "" || genotypeValue.indexOf(delim) < 0) {
              return genotypeValue;
          } else {
              var tokens = genotypeValue.split(delim);
              if (tokens.length > alleleIdx) {
                  return tokens[alleleIdx];
              } else {
                  return genotypeValue;
              }
          }
      };

      // If af returned from af is for multi-allelic variants, we need to parse out the
      // correct af from the comma separated string.
      exports._parseAf = function (altIdx, af) {
          // Handle multi-allelics
          if (af.indexOf(",") > 0) {
              var aftokens = af.split(",");
              var theAf = aftokens[+altIdx];
              return theAf;
          } else {
              return af;
          }
      };


      exports._parseAnnotForAlt = function (value, altIdx) {
          var annotValue = "";
          if (value.indexOf(",") > 0) {
              var tokens = value.split(",");
              if (tokens.length > altIdx) {
                  annotValue = tokens[altIdx];
              } else {
                  annotValue = value;
              }
          } else {
              annotValue = value;
          }
          return annotValue;
      };

      exports.pileupVcfRecordsImproved = function (variants, regionStart, posToPixelFactor, widthFactor) {
          var pileup = pileupLayout().sort(null).size(800); // 1860
          var maxlevel = pileup(variants);
          return maxLevel;
      };

      exports.pileupVcfRecords = function (variants, regionStart, posToPixelFactor, widthFactor) {
          widthFactor = widthFactor ? widthFactor : 1;
          // Variant's can overlap each over.  Set a field called variant.level which determines
          // how to stack the variants vertically in these cases.
          var posLevels = {};
          var maxLevel = 0;
          var posUnitsForEachVariant = posToPixelFactor * widthFactor;
          variants.forEach(function (variant) {

              // get next available vertical spot starting at level 0
              var startIdx = (variant.start - regionStart);// + i;
              var posLevel = 0;
              var stackAtStart = posLevels[startIdx];
              if (stackAtStart) {
                  for (var k = 0; k <= stackAtStart.length; k++) {
                      if (stackAtStart[k] == undefined) {
                          posLevel = k;
                          break;
                      }
                  }
              }

              // Set variant level.
              variant.level = posLevel;

              // Now set new level for each positions comprised of this variant.
              for (var i = 0; i < variant.len + posUnitsForEachVariant; i++) {
                  var idx = (variant.start - regionStart) + i;
                  var stack = posLevels[idx] || [];
                  stack[variant.level] = true;
                  posLevels[idx] = stack;

                  // Capture the max level of the entire region.
                  if (stack.length - 1 > maxLevel) {
                      maxLevel = stack.length - 1;
                  }
              }
          });
          return maxLevel;
      };


      exports.compareVcfRecords = function (variants1, variants2, comparisonAttr, onMatchFunction, onNoMatchFunction) {

          var set1Label = 'unique1';
          var set2Label = 'unique2';
          var commonLabel = 'common';
          var comparisonAttribute = comparisonAttr;
          if (comparisonAttribute == null) {
              comparisonAttribute = 'consensus';
          }

          variants1.count = variants1.features.length;
          variants2.count = variants2.features.length;

          var features1 = variants1.features;
          var features2 = variants2.features;

          // Flag duplicates as this will throw off comparisons
          var ignoreDups = function (features) {
              for (var i = 0; i < features.length - 1; i++) {
                  var variant = features[i];
                  var nextVariant = features[i + 1];
                  if (i == 0) {
                      variant.dup = false;
                  }
                  nextVariant.dup = false;

                  if (variant.start == nextVariant.start) {
                      var refAlt = variant.type.toLowerCase() + ' ' + variant.ref + "->" + variant.alt;
                      var nextRefAlt = nextVariant.type.toLowerCase() + ' ' + nextVariant.ref + "->" + nextVariant.alt;

                      if (refAlt == nextRefAlt) {
                          nextVariant.dup = true;
                      }
                  }
              }
          }
          ignoreDups(features1);
          ignoreDups(features2);


          // Iterate through the variants from the first set,
          // marking the consensus field based on whether a
          // matching variant from the second list is encountered.
          var idx1 = 0;
          var idx2 = 0;
          while (idx1 < features1.length && idx2 < features2.length) {
              // Bypass duplicates
              if (features1[idx1].dup) {
                  idx1++;
              }
              if (features2[idx2].dup) {
                  idx2++;
              }

              variant1 = features1[idx1];
              variant2 = features2[idx2];

              var refAlt1 = variant1.type.toLowerCase() + ' ' + variant1.ref + "->" + variant1.alt;
              var refAlt2 = variant2.type.toLowerCase() + ' ' + variant2.ref + "->" + variant2.alt;

              if (variant1.start == variant2.start) {

                  if (refAlt1 == refAlt2) {
                      variant1[comparisonAttribute] = commonLabel;
                      variant2[comparisonAttribute] = commonLabel;

                      if (onMatchFunction) {
                          onMatchFunction(variant1, variant2);
                      }
                      idx1++;
                      idx2++;
                  } else if (refAlt1 < refAlt2) {
                      variant1[comparisonAttribute] = set1Label;
                      if (onNoMatchFunction) {
                          onNoMatchFunction(variant1, null);
                      }
                      idx1++;
                  } else {
                      variant2[comparisonAttribute] = set2Label;
                      if (onNoMatchFunction) {
                          onNoMatchFunction(null, variant2);
                      }
                      idx2++;
                  }
              } else if (variant1.start < variant2.start) {
                  variant1[comparisonAttribute] = set1Label;
                  if (onNoMatchFunction) {
                      onNoMatchFunction(variant1, null);
                  }
                  idx1++;
              } else if (variant2.start < variant1.start) {
                  variant2[comparisonAttribute] = set2Label;
                  if (onNoMatchFunction) {
                      onNoMatchFunction(null, variant2);
                  }
                  idx2++;
              }

          }


          // If we get to the end of one set before the other,
          // mark the remaining as unique
          //
          if (idx1 < features1.length) {
              for (var x = idx1; x < features1.length; x++) {
                  var variant1 = features1[x];
                  variant1[comparisonAttribute] = set1Label;
                  if (onNoMatchFunction) {
                      onNoMatchFunction(variant1, null);
                  }
              }
          }
          if (idx2 < features2.length) {
              for (var x = idx2; x < features2.length; x++) {
                  var variant2 = features2[x];
                  variant2[comparisonAttribute] = set2Label;
                  if (onNoMatchFunction) {
                      onNoMatchFunction(null, variant2);
                  }
              }
          }
      };


      //
      //
      //
      //  PRIVATE
      //
      //
      //


      // Allow on() method to be invoked on this class
      // to handle data events
      d3.rebind(exports, dispatch, 'on');

      // Return this scope so that all subsequent calls
      // will be made on this scope.
      return exports;
  }


