
import CacheHelperWorker from './CacheHelperWorker.js'
import CacheIndexStore from './CacheIndexStore.js'

function CacheHelper(globalApp, forceLocalStorage) {

  this.globalApp = globalApp;
  this.forceLocalStorage = forceLocalStorage;
  this.genesToCache = [];
  this.cacheQueue = [];
  this.batchSize = null;
  this.showCallAllProgress = false;
  this.geneToAltTranscript = {};

  this.start = null;
  this.cacheIndexStore = new CacheIndexStore();

  this.cohort = null;

  this.analyzeAllInProgress = false;
  this.callAllInProgress    = false;

  this.dispatch = d3.dispatch("geneAnalyzed", "analyzeAllCompleted");
  d3.rebind(this, this.dispatch, "on");
}

CacheHelper.recordedCacheErrors = {};
CacheHelper.cacheErrorTypes = {};

CacheHelper.KEY_DELIM = "^";
CacheHelper.VCF_DATA            = "vcfData";
CacheHelper.BAM_DATA            = "bamData";
CacheHelper.FB_DATA             = "fbData";
CacheHelper.DANGER_SUMMARY_DATA = "dangerSummary";
CacheHelper.GENE_COVERAGE_DATA  = "geneCoverage";



CacheHelper.prototype.analyzeAll = function(cohort, analyzeCalledVariants = false) {
  var me = this;
  this.cohort = cohort;

  if (this.cohort.isAlignmentsOnly()) {
    analyzeCalledVariants = true;
  }

  // Show the freebayes runtime args dialog first if dialog has not
  // yet been visited.   Note:  showFreebayesSettingsDialog() is a
  // pass-through if global settings allowFreebayesSettings is set
  // to false.
  if (analyzeCalledVariants && !me.cohort.freebayesSettings.visited) {
    me.cohort.freebayesSettings.showDialog(function() {
      me._analyzeAllImpl(analyzeCalledVariants)
    })
  } else {
    me._analyzeAllImpl(analyzeCalledVariants)
  }
}

CacheHelper.prototype.promiseAnalyzeSubset = function(cohort, theGeneNames, geneToAltTranscript, analyzeCalledVariants=false) {
  var me = this;
  me.cohort = cohort;
  me.geneToAltTranscript = geneToAltTranscript;

  return new Promise(function(resolve, reject) {
    theGeneNames.forEach(function(geneName) {
      me.genesToCache.push(geneName);
    });
    me.cacheGenes(analyzeCalledVariants, function() {
      me.cohort.geneModel.sortGenes("harmful variants");
      resolve();
    });

  })

}

CacheHelper.prototype.stopAnalysis = function() {

  this.analyzeAllInProgress = false;
  this.callAllInProgress = false;
  this.genesToCache = [];
  this.cacheQueue = [];
}

CacheHelper.prototype.setLoaderDisplay = function(loaderDisplay) {
  this.geneBadgeLoaderDisplay = loaderDisplay;
}

CacheHelper.prototype.promiseInit = function() {
  if (this.useLocalStorage()) {
    return Promise.resolve();
  } else {
    return this.cacheIndexStore.promiseInit();
  }
}

CacheHelper.prototype.useLocalStorage = function() {
  if (this.forceLocalStorage || this.globalApp.defaultBrowserCache == this.globalApp.BROWSER_CACHE_LOCAL_STORAGE) {
    return true;
  } else {
    return false;
  }
}

CacheHelper.prototype.useIndexedDB = function() {
  if (!this.forceLocalStorage &&  this.globalApp.defaultBrowserCache == this.globalApp.BROWSER_CACHE_INDEXED_DB) {
    return true;
  } else {
    return false;
  }
}

CacheHelper.prototype.isolateSession = function(isEduMode) {
  if (isEduMode) {
    this.launchTimestamp = 9999;
  } else {
    this.launchTimestamp = Date.now().valueOf();
  }
}


CacheHelper.prototype.promiseClearOlderCache = function() {
  var me = this;

  return new Promise(function(resolve, reject) {
    var counts = null;
    me.promiseGetCacheSize(false)
    .then(function(data) {
      counts = data;
      console.log(counts);

      if (counts.oldSessions.length > 0) {
        var promises = [];
        counts.oldSessions.forEach(function(timestamp) {
          var p = me._promiseClearCache(timestamp);
          promises.push(p);
        })
        return Promise.all(promises);
      } else {
        return Promise.resolve();
      }
    })
    .then(function() {
      resolve();
    })
    .catch(function(error) {
      reject(error);
    })
  })

}



CacheHelper.prototype.queueGene = function(geneName) {
  if (this.cacheQueue == null) {
    this.cacheQueue = [];
  }
  if (this.cacheQueue.indexOf(geneName) < 0) {
    this.cacheQueue.push(geneName);
  }
  this.cohort.startGeneProgress(geneName);
}

CacheHelper.prototype.dequeueGene = function(geneName) {
  var idx = this.cacheQueue.indexOf(geneName);
  if (idx >= 0) {
    this.cacheQueue.splice(idx,1);
  }
  this.cohort.endGeneProgress(geneName);
}


CacheHelper.prototype._analyzeAllImpl = function(analyzeCalledVariants=false) {
  var me = this;

  this.analyzeAllInProgress = !analyzeCalledVariants
  this.callAllInProgress    = analyzeCalledVariants;

  this.start = new Date();

  if (analyzeCalledVariants) {
    me.showCallAllProgress = true;
  }

  // Start over with a new queue of genes to be analyzed
  // is all of the genes that need to be analyzed (and cached.)
  me.genesToCache = [];
  me.cacheQueue = [];

  me.cohort.geneModel.geneNames.forEach(function(geneName) {
    me.genesToCache.push(geneName);
  });
  me.cacheGenes(analyzeCalledVariants, function() {

    me.analyzeAllInProgress = false;
    me.callAllInProgress    = false;

    me.cohort.geneModel.sortGenes("harmful variants");

    me.dispatch.analyzeAllCompleted();

    console.log("");
    console.log("******   ANALYZE ALL ELAPSED TIME *******");
    console.log((new Date() - me.start) / 1000 + " seconds ");
    console.log("*******************************************")
    console.log("");

  });

}



CacheHelper.prototype.cacheGenes = function(analyzeCalledVariants, callback) {
  var me = this;

  // If there are no more genes to cache,
  if (me.genesToCache.length == 0 && me.cacheQueue.length == 0) {
    if (callback) {
      callback();
    }
  }


  // If we are already have the max size of genes in the queue, don't
  // queue anymore.
  if (me.cacheQueue.length >= me.globalApp.DEFAULT_BATCH_SIZE) {
    return;
  }


  // Figure out how much to replinish in the cache queue
  var sizeToQueue = me.globalApp.DEFAULT_BATCH_SIZE - me.cacheQueue.length;

  // Just queue genes to the end of the (unanalyzed) genes list
  if (sizeToQueue > me.genesToCache.length) {
    sizeToQueue = me.genesToCache.length;
  }
  var startingPos = me.cacheQueue.length == 0 ? 0 : me.cacheQueue.length;

  // Place next batch of genes in caching queue
  for (var i = 0; i < sizeToQueue; i++) {
    me.queueGene(me.genesToCache[i]);
  }
  // Remove this batch of genes from the list of all genes to be cached
  for (var i = 0; i < sizeToQueue; i++) {
    me.genesToCache.shift();
  }


  // Invoke method to cache each of the genes in the queue
  var count = 0;
  for (var i = startingPos; i < me.globalApp.DEFAULT_BATCH_SIZE && count < sizeToQueue; i++) {
    me.promiseCacheGene(me.cacheQueue[i], analyzeCalledVariants)
    .then(function(theGeneObject) {
      me.cacheNextGene(theGeneObject.gene_name, analyzeCalledVariants, callback);
    },
    function(error) {
      // An error occurred.  Set the gene badge with an error glyph
      // and move on to analyzing the next gene
      //genesCard.setGeneBadgeError(error.geneName);
      console.log("problem caching data for gene " + error.geneName + ". " + error.message);
      //genesCard._geneBadgeLoading(error.geneName, false);

      me.cohort.promiseSummarizeError(error.geneName, error.message)
      .then(function(dangerObject) {
        // take this gene off of the queue and see
        // if next batch of genes should be analyzed
        me.cacheNextGene(error.geneName, analyzeCalledVariants, callback);
      },
      function(error) {
        var msg = "A problem ocurred while summarizing error in CacheHelper.prototype.cacheGene(): " + error;
        console.log(msg);
        me.cacheNextGene(error.geneName, analyzeCalledVariants, callback);
      })
    })
    count++;
  }


}



CacheHelper.prototype.promiseCacheGene = function(geneName, analyzeCalledVariants, callback) {
  var me = this;

  return new Promise(function(cacheResolve, cacheReject) {
    var theGeneName = geneName;
    var geneObject = null;
    var transcript = null;
    var geneCoverageAll = null;
    var isCached = false;
    var trioVcfData = null;
    var trioFbData = null;
    var shouldCallVariants = analyzeCalledVariants;

    me.cohort.geneModel.promiseGetGeneObject(geneName)
    .then( function(data) {
      // Get the gene model
      geneObject = data;
      me.cohort.geneModel.adjustGeneRegion(geneObject);
      if (me.geneToAltTranscript && me.geneToAltTranscript[geneObject.gene_name]) {
        transcript = me.geneToAltTranscript[geneObject.gene_name];
      } else {
        transcript = me.cohort.geneModel.getCanonicalTranscript(geneObject);
      }

      return me.cohort.promiseMarkCodingRegions(geneObject, transcript);
    })
    .then(function() {
      // Find out if this gene has already been analyzed
      return me.promiseIsCachedForProband(geneObject, transcript, analyzeCalledVariants)
    })
    .then(function(data) {
      isCached = data.isCached;
      if (isCached) {
        // if the gene has already been analyzed, move on to next gene
        cacheResolve(geneObject);
      } else {
        // Get the gene coverage stats
        return me.cohort.promiseGetCachedGeneCoverage(geneObject, transcript, false);
      }
    })
    .then(function(data) {
      // Load and annotate the variants
      geneCoverageAll = data.geneCoverage;

      // Show that we are working on this gene
      //genesCard._geneBadgeLoading(geneObject.gene_name, true);

      // The gene is ready to be analyzed. Annotate the variants
      if (me.cohort.isAlignmentsOnly()) {
        return Promise.resolve(trioVcfData);
      } else {
        return me.cohort.promiseAnnotateVariants(geneObject, transcript, me.cohort.mode == 'trio' && me.cohort.samplesInSingleVcf(), true)
      }
    })
    .then(function(data) {
      trioVcfData = data;

      // Joint call variants if we are calling variants for all genes in 'Analyze All'
      if (analyzeCalledVariants) {
        return me.cohort.promiseJointCallVariants(geneObject, transcript, trioVcfData, {checkCache: true, isBackground: true})
      } else {
        return Promise.resolve({'trioFbData': trioFbData, 'trioVcfData': trioVcfData});
      }
    })
    .then(function(data) {

      // Now determine inheritance and cache the annotated loaded and called variants
      trioFbData = data.trioFbData;
      trioVcfData = data.trioVcfData;

      return me.cohort.promiseAnnotateInheritance(geneObject, transcript, trioVcfData, {isBackground: true, cacheData: true})

    })
    .then(function(data) {

      // Now summarize the danger for the  gene
      return me.cohort.promiseSummarizeDanger(geneObject, transcript, trioVcfData.proband, {'CALLED': analyzeCalledVariants})
    })
    .then(function() {
      // Now clear out mother and father from cache (localStorage browser cache only)
      //if (window.gene == null || window.gene.gene_name != geneObject.gene_name) {
        if (me.useLocalStorage()) {
          me.cohort.getModel("mother").clearCacheItem(CacheHelper.VCF_DATA, geneObject.gene_name, transcript);
          me.cohort.getModel("father").clearCacheItem(CacheHelper.VCF_DATA, geneObject.gene_name, transcript);
        }
      //}
      // Clear out the called variants cache since this is now cached in vcf data
      if (analyzeCalledVariants) {
        me.cohort.getProbandModel().clearCacheItem(CacheHelper.FB_DATA, geneObject.gene_name, transcript);
      }

      // We have analyzed the gene, now move on to another gene
      //if (window.gene && window.gene.gene_name == geneObject.gene_name) {
        //genesCard.selectGene(geneObject.gene_name);
      //}

      // We are done analyzing this gene.  Move on to the next one.
      cacheResolve(geneObject);

    },
    function(error) {
      cacheReject({'geneName': theGeneName, 'message': error});
    });
  })


}


CacheHelper.prototype.isGeneInProgress = function(geneName) {
  return this.cacheQueue.indexOf(geneName) >= 0;
}

CacheHelper.prototype.cacheNextGene = function(geneName, analyzeCalledVariants, callback) {

  this.dispatch.geneAnalyzed(geneName);

  this.dequeueGene(geneName);
  // Invoke cacheGenes, which will kick off the next batch
  // of genes to analyze once all of the genes in
  // the current batch have been analyzed.
  this.cacheGenes(analyzeCalledVariants, callback);
}

CacheHelper.prototype.promiseIsCachedForProband = function(geneObject, transcript, checkForCalledVariants) {
  var me = this;
  return new Promise(function(resolve, reject) {
    me.cohort.getProbandModel().promiseGetDangerSummary(geneObject.gene_name)
    .then(function(dangerSummary) {
      var isCached = dangerSummary == null ? false : (checkForCalledVariants ? dangerSummary.CALLED : true);
      resolve({geneObject: geneObject, transcript: transcript, shouldCallVariants: checkForCalledVariants, 'isCached': isCached})
    })
  })
}



CacheHelper.prototype.promiseClearCache = function(launchTimestampToClear) {
  var me = this;
  return new Promise(function(resolve, reject) {
    if (me.globalApp.keepLocalStorage) {
      resolve();

    } else {
      me._promiseClearCache(launchTimestampToClear)
       .then(function() {
        me.genesToCache = [];
        resolve();
       },
       function(error) {
        reject(error);
       })
    }
  })

}

CacheHelper.prototype.refreshGeneBadges = function(callback) {
  var me = this;

  var theGeneNames = {};
  me.cohort.geneModel.sortedGeneNames.forEach(function(geneName) {
    theGeneNames[geneName] = true;
  });

  var dataKind = CacheHelper.VCF_DATA;

  me.promiseGetKeys()
   .then(function(allKeys) {
    var keys = [];

    allKeys.forEach(function(key) {
      var keyObject = CacheHelper._parseCacheKey(key);
      if (keyObject && keyObject.launchTimestamp == me.launchTimestamp) {

          if (keyObject.dataKind == dataKind && keyObject.relationship == "proband" && theGeneNames[keyObject.gene]) {
            keys.push({'key': key, 'keyObject': keyObject});
          }
       }
    })

    me.refreshNextGeneBadge(keys, function() {
      me.cohort.geneModel.sortGenes("harmful variants");

      if (callback) {
        callback();
      }

    });

   },
   function(error) {
    var msg = "A problem occurred in CacheHelper.refreshGeneBadges(): " + error;
    console.log(msg);
    if (callback) {
      callback();
    }
   })

}

CacheHelper.prototype.refreshNextGeneBadge = function(keys, callback) {
  var me = this;
  if (keys.length == 0) {
    callback();
  } else {
    var theKey    = keys.splice(0,1)[0];
    var key       = theKey.key;
    var keyObject = theKey.keyObject;


    me.promiseGetDataThreaded(key, keyObject)
    .then(function(cachedData) {
      var theVcfData    = cachedData.data;
      var theKeyObject  = cachedData.keyObject;
      var theGeneObject = me.cohort.geneModel.geneObjects[theKeyObject.gene];
      var theTranscript = {transcript_id: theKeyObject.transcript};
      me.cohort.promiseSummarizeDanger(theGeneObject, theTranscript, theVcfData, {})
      .then(function() {
        me.refreshNextGeneBadge(keys, callback);
      })
    });
  }
}

CacheHelper.prototype.getCacheKey = function(cacheObject) {
  var me = this;
  var key =  "gene.iobio"
    + CacheHelper.KEY_DELIM + this.launchTimestamp
    + CacheHelper.KEY_DELIM + cacheObject.id
    + CacheHelper.KEY_DELIM + cacheObject.sample
    + CacheHelper.KEY_DELIM + cacheObject.gene
    + CacheHelper.KEY_DELIM + cacheObject.transcript
    + CacheHelper.KEY_DELIM + cacheObject.dataKind;
  if (cacheObject.dataKind != CacheHelper.GENE_COVERAGE_DATA) {
      key += CacheHelper.KEY_DELIM + cacheObject.annotationScheme;
  }
  return key;
}


CacheHelper.prototype.promiseGetCacheSize = function() {  // provide the size in bytes of the data currently stored
  var me = this;

  return new Promise(function(resolve, reject) {
    var currentSize     = 0;

    var recentSize      = 0;
    var recentSessions  = {};

    var oldSize         = 0;
    var oldSessions     = {};

    // Any session older than the expiration time limit is considered 'old'
    // Any session that is not the current session that
    // has occurred in the before the end of the expiration is considered
    // 'recent'
    me.promiseGetAllKeys()
   .then(function(allKeys) {
      var promises = []
      allKeys.forEach(function(key) {
        var keyObject = CacheHelper._parseCacheKey(key);
        if (keyObject) {
          var p = me.promiseGetData(key, false)
          .then(function(data) {
            if (keyObject.launchTimestamp == me.launchTimestamp) {
              currentSize += data != null ? data.length : 0;
            } else if ((me.launchTimestamp - +keyObject.launchTimestamp) < me.globalApp.BROWSER_CACHE_EXPIRATION ) {
              recentSize += data != null ? data.length : 0;
              recentSessions[keyObject.launchTimestamp] = new Date(parseInt(keyObject.launchTimestamp)).toLocaleString();
            } else {
              oldSize += data != null ? data.length : 0;
              oldSessions[keyObject.launchTimestamp] = new Date(parseInt(keyObject.launchTimestamp)).toLocaleString();
            }
          });
          promises.push(p);
        }
      })

      Promise.all(promises).then(function() {
        resolve({ currentSize:            CacheHelper._sizeMB(currentSize) + " MB",
                  currentSession:         me.launchTimestamp,
                  recentSize:             CacheHelper._sizeMB(recentSize) + " MB",
                  recentSessions:         Object.keys(recentSessions),
                  recentSessionsDisplay:  Object.values(recentSessions),
                  oldSize:                CacheHelper._sizeMB(oldSize) + " MB",
                  oldSessions:            Object.keys(oldSessions),
                  oldSessionsDisplay:     Object.values(oldSessions)
        });
      })
      .catch(function(error) {
        var msg = "A problem ocurred in CacheHelper.promiseGetCacheSize(): +  " + error;
        console.log(msg);
        reject(msg);
      })
    })

  })

}



CacheHelper.prototype._promiseClearCache = function(launchTimestampToClear) {
  var me = this;

  return new Promise(function(resolve, reject) {

    me.geneToAltTranscript = {};

    launchTimestampToClear = launchTimestampToClear ? launchTimestampToClear : me.launchTimestamp;
    var keysToRemove = [];
    me.promiseGetAllKeys()
     .then(function(allKeys) {
      allKeys.forEach(function(key) {
        var keyObject = CacheHelper._parseCacheKey(key);
        if (keyObject && keyObject.launchTimestamp == launchTimestampToClear) {
          keysToRemove.push(key);
        }
      })

      var promises = [];
      keysToRemove.forEach( function(key) {
        var keyObject = CacheHelper._parseCacheKey(key);
        var p = me.promiseRemoveCacheItem(keyObject.dataKind, key);
        promises.push(p);
      })

      Promise.all(promises).then(function() {
        resolve();
      })

     },
     function(error) {
      reject(error);
     })

  });

}

CacheHelper.prototype.clearAll = function() {
  var me = this;
  // confirm dialog
  alertify.confirm("Clear all cached data for this session?", function (e) {
      if (e) {
      // user clicked "ok"
      me._promiseClearCache(me.launchTimestampToClear)
       .then(function() {
          me.refreshDialog();
       });

      }
  }, function() {
    // user clicked "cancel"
  })
  .set('labels', {ok:'OK', cancel:'Cancel'});       ;
}




CacheHelper.prototype.clearCacheForGene = function(geneName) {
  var me = this;

  return new Promise(function(resolve, reject) {
    me.promiseGetKeys()
     .then(function(allKeys) {
      var keys = [];

      delete me.geneToAltTranscript[geneName];

      allKeys.forEach(function(key) {
        var keyObject = CacheHelper._parseCacheKey(key);
        if (keyObject && keyObject.launchTimestamp == me.launchTimestamp) {
          if (keyObject.gene == geneName) {
            keys.push(key);
          }
        }
      })

      var promises = [];
      keys.forEach( function(key) {
        var keyObject = CacheHelper._parseCacheKey(key);
        var p = me.promiseRemoveCacheItem(keyObject.dataKind, key);
        promises.push(p);
      });

      Promise.all(promises).then(function() {
        // Clear out the loading message by the page control for this gene
        //me.geneBadgeLoaderDisplay.setPageCount(genesCard.getPageCount())
        //             .removeGene(geneName);

        // Clear the gene out from the cache 'analyze all' queue
        if (me.isGeneInProgress(geneName)) {
          me.cacheNextGene(geneName);
        }

        resolve();

      })

     },
     function(error) {
      reject(error);
     })

  })


}



CacheHelper.prototype._isProbandVariantCache = function(key) {
  var cacheObject = CacheHelper._parseCacheKey(key);
  return (cacheObject
    && cacheObject.launchTimestamp == this.launchTimestamp
    && ( cacheObject.dataKind == CacheHelper.VCF_DATA  || cacheObject.dataKind == CacheHelper.FB_DATA)
    && cacheObject.relationship == "proband");

}




CacheHelper._sizeMB = function(size, decimalPlaces=1) {
  var multiplier = Math.pow(10, decimalPlaces+1);
  var _sizeMB = size / (1024*1024);
  return  Math.round(_sizeMB * multiplier) / multiplier;
}



CacheHelper._parseCacheKey = function(cacheKey) {
  if (cacheKey.indexOf(CacheHelper.KEY_DELIM) > 0) {
    var tokens = cacheKey.split(CacheHelper.KEY_DELIM);
    if (tokens.length >= 7 && tokens[0] == "gene.iobio") {
      var keyObject = {
           app: tokens[0],
           launchTimestamp: tokens[1],
           relationship: tokens[2],
           sample: tokens[3],
           gene: tokens[4],
           transcript: tokens[5],
           dataKind: tokens[6]
      };
      if (tokens.length == 8) {
        keyObject.annotationScheme = tokens[7];
      }
      return keyObject;

    } else {
      return null;
    }

  } else {
    return null;
  }

}

CacheHelper.showError = function(key, cacheError) {
  var cacheObject = CacheHelper._parseCacheKey(key);
  if (cacheObject) {

    var errorCount = CacheHelper.cacheErrorTypes[cacheError.name];
    if (errorCount == null) {
      errorCount = 0;
    }
    errorCount++;
    CacheHelper.cacheErrorTypes[cacheError.name] = errorCount;

    var errorType = cacheError.name && cacheError.name.length > 0 ? cacheError.name : "A problem";
    var errorKey = cacheObject.gene + CacheHelper.KEY_DELIM + errorType;

    var consoleMessage = errorType + " occurred when caching analyzed " + cacheObject.dataKind + " data for gene " + cacheObject.gene + ". Click on 'Clear cache...' link to clear cache."
      console.log(consoleMessage);
      console.log(cacheError.toString());

      // Only show the error once
      if (!CacheHelper.recordedCacheErrors[errorKey] ) {
        CacheHelper.recordedCacheErrors[errorKey] = message;
        var message = errorType + " occurred when caching analyzed data for gene " + cacheObject.gene + ". Unable to analyze remaining genes.  Click on 'Clear cache...' link to clear cache.";
        // If we have shown this kind of cache error 2 times already, just show in right hand corner instead
        // of showning dialog with ok/cancel.
      if (errorCount < 3) {
        alertify.alert(message, function() {
          CacheHelper.recordedCacheErrors[errorKey] = null;
        });
      } else if (errorCount < 8) {
          var msg = "<span style='font-size:12px'>" + message + "</span>";
          alertify.set('notifier','position', 'top-right');
          alertify.error(msg,  5);
        CacheHelper.recordedCacheErrors[errorKey] = null;
      }
      }
  }

}


CacheHelper.promiseCompressData = function(data) {
  return new Promise(function(resolve, reject) {
    if (data && data != "") {
      var cache = [];
      var dataString = JSON.stringify(data, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
      });
      cache = null;
      var dataStringCompressed = null;
      try {
        dataStringCompressed = LZString.compressToUTF16(dataString);
        resolve(dataStringCompressed);
      }   catch(error) {
        reject("Unable to compress data: " + error);
      }
    } else {
      resolve(null);
    }
  });

}

CacheHelper.promiseDecompressData = function(dataCompressed, decompressIt) {
  return new Promise(function(resolve, reject) {
    if (decompressIt && dataCompressed != null && dataCompressed != "") {
      var dataString = null;
      var data = null;
      try {
         dataString = LZString.decompressFromUTF16(dataCompressed);
         data =  JSON.parse(dataString);
         resolve(data);
      } catch(e) {
        var errorMsg = "an error occurred when uncompressing data";
        console.log(errorMsg);
        reject(errorMsg);
      }
    } else {
      resolve(dataCompressed);
    }
  });
}

CacheHelper.prototype.promiseCacheData = function(key, data) {
  var me = this;

  return new Promise(function(resolve, reject) {

    if (me.useLocalStorage()) {
      if (localStorage) {

          CacheHelper.promiseCompressData(data)
           .then(function(dataStringCompressed) {
          localStorage.setItem(key, dataStringCompressed);
          resolve();
           },
           function(error) {
            reject(error);
           });
      } else {
        reject("no local storage found")
      }
    } else if (me.useIndexedDB()) {
      CacheHelper.promiseCompressData(data)
         .then(function(dataStringCompressed) {
        var keyObject = CacheHelper._parseCacheKey(key);
        return me.cacheIndexStore.promiseSetData(keyObject.dataKind, keyObject.gene, key, dataStringCompressed)
         })
         .then(function() {
          resolve();
         },
         function(error) {
          var msg = "A problem occurred in CacheHelper.promiseCacheData() when calling cacheIndexStore.promiseSetData(): " + error;
        console.log(msg);
        reject(msg);
         });
    } else {
      reject("Unable to determine browser cache method")
    }

  })

}

CacheHelper.prototype.promiseGetData = function(key, decompressIt=true) {
  var me = this;
  return new Promise(function(resolve, reject) {

    if (me.useLocalStorage()) {
      if (localStorage) {
            var dataCompressed = localStorage.getItem(key);
            CacheHelper.promiseDecompressData(dataCompressed, decompressIt).then(function(data) {
              resolve(data);
            },
            function(error) {
              var errorMsg = "an error occurred when uncompressing data for key " + key;
              console.log(errorMsg);
              reject(errorMsg);
            });
        }
    } else if (me.useIndexedDB()) {
      var keyObject = CacheHelper._parseCacheKey(key);
      me.cacheIndexStore.promiseGetData(keyObject.dataKind, key, decompressIt)
       .then(function(dataCompressed) {
            CacheHelper.promiseDecompressData(dataCompressed, decompressIt)
             .then(function(data) {
              resolve(data);
             },
             function(error) {
          var errorMsg = "an error occurred when uncompressing data for key " + key;
          console.log(errorMsg);
          reject(errorMsg);
             });
       })
    } else {
      reject("Unable to determine browser cache method")
    }
  })

}


CacheHelper.prototype.promiseGetDataThreaded = function(key, keyObject) {
  var me = this;

  return new Promise(function(resolve, reject) {
    me.promiseGetData(key, false)
     .then(function(dataCompressed) {

          if (dataCompressed != null) {

        var worker = new Worker('./app/models/cacheHelperWorker.js');

        worker.onmessage = function(e) {
          resolve(e.data);
        };

        // We will also want to be notified if the worker runs into trouble
        worker.onerror = function(e) {
          console.log("An error occurred when uncompressing data for key " + key);
          var msg = 'An error occurred while decompressing cached data:' + e;
          console.log(msg)
          reject(msg);
        };

        // Start the worker!
        worker.postMessage( { 'cmd': 'start', 'compressedData': dataCompressed, 'keyObject': keyObject });
      } else {
        resolve(null);
      }

     },
     function(error) {
      var msg = "An error occurred in CacheHelper.promiseGetDataThreaded(): " + error;
      console.log(msg);
      reject(msg);
     });
  })

}

CacheHelper.prototype.promiseRemoveCacheItem = function(dataKind, key) {
  var me = this;

  return new Promise(function(resolve, reject) {

    if (me.useLocalStorage()) {
      if (localStorage) {
        localStorage.removeItem(key);
        }
    } else if (me.useIndexedDB()) {
      me.cacheIndexStore.promiseRemoveData(dataKind, key)
       .then(function() {
        resolve();
       },
       function(error) {
        reject(error);
       })
    } else {
      reject("Unknown caching method")
    }
  });
}


CacheHelper.prototype.promiseGetKeys = function() {
  var me = this;
  return new Promise(function(resolve, reject) {

    me.promiseGetAllKeys()
     .then(function(allKeys) {

      var filteredKeys = allKeys.filter(function(key) {
        var keyObject = CacheHelper._parseCacheKey(key);
        return keyObject && (keyObject.launchTimestamp == me.launchTimestamp);
      })
      resolve(filteredKeys);
     },
     function(error) {
      reject(error);
     })

  });

}


CacheHelper.prototype.promiseGetAllKeys = function() {
  var me = this;
  return new Promise(function(resolve, reject) {

    if (me.useLocalStorage()) {
      if (localStorage) {
        var keys = [];
        for (var i=0; i<=localStorage.length-1; i++)  {
          var key = localStorage.key(i);
          keys.push(key);
        }
        resolve(keys);
      } else {
        reject("No local storage found");
      }

    } else if (me.useIndexedDB()) {
      me.cacheIndexStore.promiseGetAllKeys()
       .then(function(allKeys) {
        resolve(allKeys);
       },
       function(error) {
        reject(error);
       });
    }
  });

}

CacheHelper.prototype.logCacheContents = function(filterObject, showData=false) {
  var me = this;
  me.promiseGetKeys()
   .then(function(keys) {
    me._logCacheContents(keys, filterObject, showData);
   });
}

CacheHelper.prototype.logAllCacheContents = function(filterObject, showData=false) {
  var me = this;
  me.promiseGetAllKeys()
   .then(function(allKeys) {
    me._logCacheContents(allKeys, filterObject, showData);
   });
}


CacheHelper.prototype._logCacheContents = function(keys, filterObject, showData=false) {
  var me = this;

  var itemSize = 0;
  var recs = [];
  var totalKb = 0;

  var promises = [];
  keys.forEach(function(key) {
    var keyObject = CacheHelper._parseCacheKey(key);
    var keep = true;
    if (filterObject && Object.keys(filterObject).length > 0) {
      keep = false;
      var matchesRel = true;
      if (filterObject.hasOwnProperty('relationship')) {
        if (keyObject.relationship != filterObject.relationship) {
          matchesRel = false;
        }
      }
      var matchesGene = true;
      if (filterObject.hasOwnProperty('gene')) {
        if (keyObject.gene != filterObject.gene) {
          matchesGene = false;
        }
      }
      var matchesDataKind = true;
      if (filterObject.hasOwnProperty('dataKind')) {
        if (keyObject.dataKind != filterObject.dataKind) {
          matchesDataKind = false;
        }
      }
      keep = matchesRel && matchesGene && matchesDataKind;
    }
    if (keep) {
      var p = me.promiseGetData(key, false)
       .then(function(dataCompressed) {

        if (dataCompressed) {

          var dataSize = dataCompressed.length + key.length;
          itemSize =  (dataSize/1024);
          totalKb += itemSize;

          var rec = {'key': key, 'size': itemSize.toFixed(2) + " KB"};
          if (showData) {
            CacheHelper.promiseDecompressData(dataCompressed, true).then(function(data) {
              rec.data = data;
            });
          }

          recs.push(rec);
        } else {
          recs.push({'key': key, 'size': '0 KB'});
        }
       })
       promises.push(p);

    }

  })
  Promise.all(promises).then(function() {
    recs.forEach(function(rec) {
      if (showData) {
        console.log(rec.key);
        console.log(rec.data);
      } else {
        console.log(rec.key + "=" + rec.size);
      }

    });
    if (totalKb > 1024){
      console.log("Total = " + (totalKb/1024).toFixed(2)+ " MB");
    } else {
      console.log("Total = " + totalKb.toFixed(2)+ " KB");
    }
  });
}

CacheHelper.prototype.logData = function(key) {
  var me = this;
  me.promiseGetData(key)
   .then(function(data) {
    console.log(data);
   })
}

export default CacheHelper



