
export default class HubSession {
  constructor(clientApplicationId) {
    this.vcf = null;
    this.samples = null;
    this.url = null;
    this.isMother = false;
    this.isFather = false;
    this.apiVersion =  '/api/v1';
    this.apiDepricated = null;
    this.apiVersionDeprecated = '/apiv1'
    this.client_application_id = clientApplicationId,
    this.variantSetTxtCols = [
      "chrom",
      "start",
      "end",
      "ref",
      "alt",
      "allelicBalance",
      "slivarFilter",
      "gene",
      "afgnomAD",
      "sampleId"
    ]
    this.user = null;

    this.variantSetToFilterName = {
      'compoundhet': 'compoundHet'
    };
    this.globalApp = null;
  }

  promiseInit(sampleId, source, isPedigree, projectId, geneSetId, variantSetId, build ) {
    let self = this;
    self.api = source + self.apiVersion;
    self.apiDepricated = source + self.apiVersionDeprecated

    return new Promise((resolve, reject) => {
      let modelInfos = [];
      let geneSet = null;
      let variantSet = null;

      self.promiseGetCurrentUser()
      .then(function(data) {
        self.user = data;
      })
      .catch(function(error) {
        console.log(error)
      })

      self.promiseGetClientApplication()
      .then(function() {
        if (geneSetId) {
          return self.promiseGetGeneSet(projectId, geneSetId)
        } else {
          return Promise.resolve(null);
        }
      })
      .then(function(data) {
        geneSet = data;

        if (variantSetId) {
          return self.promiseGetVariantSet(projectId, variantSetId, build)
        } else {
          return Promise.resolve(null);
        }

      })
      .then(function(data) {
        variantSet = data;

        self.promiseGetSampleInfo(projectId, sampleId, isPedigree).then(data => {

          let promises = [];

          let foundPedigree = data.foundPedigree;

          let pedigree    = foundPedigree ? data.pedigree : {'proband': data.proband};
          let rawPedigree = data.rawPedigree;

          // Let's get the proband info first
          let probandSample = foundPedigree ? pedigree.proband : data.proband;
          self.promiseGetFileMapForSample(projectId, probandSample, 'proband').then(data => {
            probandSample.files = data.fileMap;
          })
          .then( () => {
            for (var rel in pedigree) {
              if (rel != 'unparsed') {
                let samples = [];
                if (Array.isArray(pedigree[rel])) {
                  samples = pedigree[rel];
                } else {
                  samples = [pedigree[rel]];
                }
                samples.forEach(s => {
                  let p =  self.promiseGetFileMapForSample(projectId, s, rel).then(data => {
                    let theSample = data.sample;
                    theSample.files = data.fileMap;

                    // gene.iobio only supports siblings in same multi-sample vcf as proband.
                    // bypass siblings in their own vcf.
                    let bypass = false;
                    // TODO:  Need to check if samples exist in proband vcf rather than checking file names
                    // since mosaic generates different vcf url for sample physical file.
                    //if (data.relationship == 'siblings' && theSample.files.vcf != probandSample.files.vcf) {
                    //  bypass = true;
                    //  console.log("Bypassing sibling " + theSample.id + ".  This sample must reside in the same vcf as the proband in order to be processed.")
                    //}

                    if (!bypass) {

                      var modelInfo = {
                        'relationship':   data.relationship == 'siblings' ? 'sibling' : data.relationship,
                        'affectedStatus': foundPedigree ? theSample.pedigree.affection_status == 2 ? 'affected' : 'unaffected' : 'affected',
                        'sex':            foundPedigree ? theSample.pedigree.sex == 1 ? 'male' : (theSample.pedigree.sex == 2 ? 'female' : 'unknown') : 'unknown',
                        'name':           theSample.name,
                        'sample':         theSample.files.vcf ? theSample.vcf_sample_name : theSample.name,
                        'vcf':            theSample.files.vcf,
                        'tbi':            theSample.files.tbi == null || theSample.files.tbi.indexOf(theSample.files.vcf) == 0 ? null : theSample.files.tbi,
                        'txt':            theSample.files.txt
                      }


                      if (theSample.files.bam != null) {
                        modelInfo.bam = theSample.files.bam;
                        if (theSample.files.bai) {
                          modelInfo.bai = theSample.files.bai;
                        }

                      } else if (theSample.files.cram != null) {
                        modelInfo.bam = theSample.files.cram;
                        if (theSample.files.crai) {
                          modelInfo.bai = theSample.files.crai;
                        }
                      }

                      modelInfos.push(modelInfo);
                    }

                  })
                  promises.push(p);
                })
              }


            }
            Promise.all(promises).then(response => {
              // Don't want to expose db info here?
              //console.log(pedigree);

              let buf = "";
              modelInfos.forEach(function(modelInfo) {
                if (modelInfo.sample == null || modelInfo.sample == "") {
                  buf += "The sample " + modelInfo.name + "  (" + modelInfo.relationship + ")   has an empty vcf_sample_name. Unable to properly filter variants for this sample.<br><br>";
                }
              })
              if (buf.length > 0) {
                alertify.alert("Error", buf)
              }

              resolve({'modelInfos': modelInfos,
                'rawPedigree': rawPedigree,
                'geneSet': geneSet,
                'variantSet': variantSet,
                'isMother': self.isMother,
                'isFather': self.isFather,
                'foundPedigree': foundPedigree});
            })
            .catch(error => {
              reject(error);
            })
          })




        })
      })

    })

  }

  hasVariantSets(modelInfos, rel='proband') {
    let proband = modelInfos.filter(function(mi) {
      return mi.relationship == rel;
    })
    if (proband && proband.length > 0) {
      let fileInfos = proband[0].txt;
      return fileInfos && fileInfos.length > 0
    } else {
      return false;
    }
  }

  promiseParseVariantSets(modelInfos, rel='proband') {
    let self = this;
    return new Promise(function(resolve,reject) {
      let proband = modelInfos.filter(function(mi) {
        return mi.relationship == rel;
      })
      let variantSets = {};
      if (proband && proband.length > 0) {
        var promises = [];
        let fileInfos = proband[0].txt;
        fileInfos.forEach(function(fileInfo) {
          let p = self.promiseParseVariantSetFile(fileInfo, proband[0])
          .then(function(data) {
            if (data) {
              variantSets[data.nickname] = data.records;
            }
          })
          promises.push(p);
        })
        Promise.all(promises)
        .then(function() {
          resolve(variantSets)
        })
      } else {
        resolve(variantSets);
      }

    })
  }

  promiseParseVariantSetFile(fileInfo, modelInfo) {
    let self = this;
    return new Promise(function(resolve, reject) {
      let theFileInfo = fileInfo
      $.ajax({
        url: fileInfo.url
      })
      .done(data => {
        let variants = [];
        if (data && data.length > 0) {
          let records = data.split("\n");
          records.map(function(record) {
            let fields = record.split("\t");
            if (fields.length >= self.variantSetTxtCols.length-1) {
              let variant = {};
              self.variantSetTxtCols.forEach(function(col, i) {
                variant[col] = fields[i];
              })
              let keep = true
              // If sampleId was included, us it to filter variants
              if (fields.length == self.variantSetTxtCols.length) {
                if (variant.sampleId  &&  modelInfo.sample && variant.sampleId != modelInfo.sample) {
                  keep = false;
                }
              }
              if (keep) {
                if (variant.gene == "" || variant.gene == null || variant.gene.trim().length == 0) {
                  console.log("promiseParseVariantSets: missing gene field.  bypassing record " + record);
                } else {
                  variant.isProxy = true;
                  variant.variant_id = variant.gene + "^" + variant.start + "^" + variant.ref + "^" + variant.alt;
                  if (variant.slivarFilter.indexOf("comphet") >= 0) {
                    variant.inheritance = "compound het"
                    variant.filtersPassed = "compoundHet"
                  } else {
                    variant.inheritance = variant.slivarFilter;
                    variant.filtersPassed = variant.inheritance;
                  }

                  let matched = variants.filter(function(v) {
                    return v.variant_id == variant.variant_id;
                  })
                  if (matched.length == 0) {
                    variants.push(variant)
                  }
                }
              } else {
                console.log("bypassing variant rec for sample " + variant.sampleId)
              }
            } else {
              console.log("promiseParseVariantSets: insufficient record fields.  bypassinging record " + record);
            }
          })
        }
        resolve({nickname: fileInfo.name, records: variants});
      })
      .fail(error => {
        console.log("Unable to get file " + fileInfo.url)

        let errorMsg = error.responseJSON.message;
        let msg = "Unable to get file " + fileInfo.url;
        alertify.alert("<div class='pb-2 dark-text-important'>"+   msg +  "</div>  <div class='pb-2' font-italic>Please email <a href='mailto:info@frameshift.io'>info@frameshift.io</a> for help resolving this issue.</div><code>" + errorMsg + "</code>").setHeader("Fatal Error");
        resolve();
      })

    })
  }


  promiseGetClientApplication() {
    let self = this;

    return new Promise(function(resolve, reject) {
      if(self.client_application_id){
      resolve();
    }
      else{
        reject("Cannot find Mosaic client_application for gene");
      }})
  }


  promiseGetProject(project_id) {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.getProject(project_id)
      .done(data => {
          resolve(data);
      })
      .fail(error => {

        let errorMsg = error.responseJSON.message;
        let msg = "Unable to get project " + project_id + " from Mosaic"
        alertify.alert("<div class='pb-2 dark-text-important'>"+   msg +  "</div>  <div class='pb-2' font-italic>Please email <a href='mailto:info@frameshift.io'>info@frameshift.io</a> for help resolving this issue.</div><code>" + errorMsg + "</code>")
          .setHeader("Fatal Error");
        reject("Error getting project " + project_id + ": " + error);
      });
    });
  }

  promiseGetSampleInfo(project_id, sample_id) {
    let self = this;
    return self.promiseGetPedigreeForSample(project_id, sample_id);
  }

  promiseGetSample(project_id, sample_id, rel) {
    let self = this;

    return new Promise(function(resolve, reject) {
      // Get pedigree for sample
      self.getSample(project_id, sample_id)
      .done(data => {
        if (rel) {
          let sample = {};
          sample[rel] = data;
          resolve(sample);
        } else {
          resolve(data);
        }
      })
      .fail(error => {
        let errorMsg = error.responseJSON.message;
        let msg = "Error accessing Mosaic sample for sample_id " + sample_id;
        alertify.alert("<div class='pb-2 dark-text-important'>"+   msg +  "</div>  <div class='pb-2' font-italic>Please email <a href='mailto:info@frameshift.io'>info@frameshift.io</a> for help resolving this issue.</div><code>" + errorMsg + "</code>")
          .setHeader("Fatal Error");
        reject("Error getting sample " + sample_id + ": " + error);
      })
    })
  }

  promiseGetPedigreeForSample(project_id, sample_id) {
    let self = this;

    return new Promise(function(resolve, reject) {
      // Get pedigree for sample
      self.getPedigreeForSample(project_id, sample_id)
      .done(rawPedigree => {
        const rawPedigreeOrig = $.extend({}, rawPedigree);
        let pedigree = self.parsePedigree(rawPedigree, sample_id)
        if (pedigree) {
          resolve({foundPedigree: true, pedigree: pedigree, rawPedigree: rawPedigreeOrig});
        }
        else {
          self.promiseGetSample(project_id, sample_id, 'proband')
          .then(function(data) {
            data.foundPedigree = false;
            resolve(data);
          })
        }
      })
      .fail(error => {
        let errorMsg = error.responseJSON.message;
        let msg = "Error getting pedigree for sample_id " + sample_id
        alertify.alert("<div class='pb-2 dark-text-important'>"+   msg +  "</div>  <div class='pb-2' font-italic>Please email <a href='mailto:info@frameshift.io'>info@frameshift.io</a> for help resolving this issue.</div><code>" + errorMsg + "</code>")
          .setHeader("Fatal Error");

        reject("Error getting pedigree for sample " + sample_id + ": " + error);
      })
    })
  }

  parsePedigree(raw_pedigree, sample_id) {
    let self = this;

    // This assumes only 1 proband. If there are multiple affected samples then
    // the proband will be overwritten
    // This also assume no grandparents/grandchildren

    let pedigree = {}

    // Look for proband, which should have mother and father filled in and is the sample selected
    let probandIndex = raw_pedigree.findIndex(d => ( d.id == sample_id && d.pedigree.maternal_id && d.pedigree.paternal_id ) );
    // If the sample selected doesn't have a mother and father (isn't a proband), find
    // the proband by looking for a child with mother and father filled in and affected status
    if (probandIndex == -1) {
      probandIndex = raw_pedigree.findIndex(d => ( d.pedigree.affection_status == 2 && (d.pedigree.maternal_id || d.pedigree.paternal_id )) );
    }
    // If the sample selected doesn't have a mother and father (isn't a proband), find
    // the proband by looking for a child with mother and father filled in and unknown affected status
    if (probandIndex == -1) {
      probandIndex = raw_pedigree.findIndex(d => ( d.pedigree.affection_status == 0 && (d.pedigree.maternal_id || d.pedigree.paternal_id ) ));
    }

    if (probandIndex == -1) {
      // Assume proband if there is only one sample in the pedigree
      if (raw_pedigree.length == 1) {
        probandIndex = 0;
      } else {
        // Assume proband is the sample selected
        probandIndex = raw_pedigree.findIndex(d => (d.id == sample_id));
      }
    }


    if (probandIndex != -1) {
      // Proband
      const proband  = raw_pedigree.splice(probandIndex, 1)[0];
      pedigree['proband'] = proband;

      // Get mother
      const motherIndex = raw_pedigree.findIndex(d => d.id == proband.pedigree.maternal_id)
      if (motherIndex != -1) {
        pedigree['mother'] = raw_pedigree.splice(motherIndex, 1)[0]
        this.isMother = true;
      }

      // Get mother
      const fatherIndex = raw_pedigree.findIndex(d => d.id == proband.pedigree.paternal_id)
      if (fatherIndex != -1) {
        pedigree['father'] = raw_pedigree.splice(fatherIndex, 1)[0]
        this.isFather = true;
      }

      raw_pedigree.forEach(sample => {
        if (sample.pedigree.maternal_id != null || sample.pedigree.paternal_id != null
            && sample.pedigree.id != pedigree.proband.id) {
          pedigree['siblings'] = (pedigree['siblings'] || [] )
          pedigree['siblings'].push(sample);
        } else {
          pedigree['unparsed'] = (pedigree['siblings'] || []).push(sample)
        }
      })

      return pedigree;


    } else {
      return null;
    }

  }

  getPedigreeForSample(project_id, sample_id) {
    let self = this;
    return $.ajax({
      url: self.api + '/projects/' + project_id +  '/samples/' + sample_id + '/pedigree',
      type: 'GET',
      contentType: 'application/json',
      headers: {
        'Authorization': localStorage.getItem('hub-iobio-tkn')
      }
    });
  }


  getSample(project_id, sample_id) {
    let self = this;
    return $.ajax({
      url: self.api + '/projects/' + project_id + '/samples/' + sample_id,
      type: 'GET',
      contentType: 'application/json',
      headers: {
        'Authorization': localStorage.getItem('hub-iobio-tkn')
      }
    });
  }


  promiseGetFileMapForSample(project_id, sample, relationship) {
    let self = this;
    return new Promise((resolve,reject) => {
      var promises = [];
      var fileMap = {};
      var currentSample = sample;
      self.promiseGetFilesForSample(project_id, currentSample.id)
      .then(files => {
        files.filter(file => {
          return file.type
        })
        .forEach(file => {

          var p = self.promiseGetSignedUrlForFile(project_id, currentSample.id, file)
          .then(signed => {
            if (file.type == 'txt' || file.type == 'tsv') {
              var files = fileMap.txt;
              if (files == null) {
                files = [];
                fileMap.txt = files;
              }
              files.push({'url': signed.url, 'name': file.nickname});

            } else {
              fileMap[file.type] = signed.url
              if (file.type == 'vcf') {
                if (file.vcf_sample_name == null || file.vcf_sample_name == "") {
                  alertify.error("Missing vcf_sample_name for file " + file.name, 20)
                } else {
                  sample.vcf_sample_name = file.vcf_sample_name;
                }
              }
            }
          })
          promises.push(p);
        })
        Promise.all(promises)
        .then(response => {
          resolve({'sample': sample, 'relationship': relationship, 'fileMap': fileMap});
        })
        .catch(error => {
          reject(error);
        })
      })
    })
  }



  promiseGetFilesForSample(project_id, sample_id) {
    let self = this;
    return new Promise((resolve,reject) => {
      self.getFilesForSample(project_id, sample_id)
      .done(response => {
        resolve(response.data);
      })
      .fail(error => {
        let errorMsg = error.responseJSON.message;
        let msg = "Error getting sample files for sample_id " + sample_id;
        alertify.alert("<div class='pb-2 dark-text-important'>"+   msg +  "</div>  <div class='pb-2' font-italic>Please email <a href='mailto:info@frameshift.io'>info@frameshift.io</a> for help resolving this issue.</div><code>" + errorMsg + "</code>")
          .setHeader("Fatal Error");
        console.log("Unable to get files for sample " + sample_id)
        reject(error);
      })
    })
  }


  getFilesForSample(project_id, sample_id) {
    let self = this;
    return $.ajax({
      url: self.api +  '/samples/' + sample_id + '/files',
      type: 'GET',
      contentType: 'application/json',
      headers: {
        'Authorization': localStorage.getItem('hub-iobio-tkn')
      }
    });
  }

  promiseGetFilesForProject(project_id) {
      let self = this;
      return new Promise((resolve,reject) => {
          self.getFilesForProject(project_id)
              .done(response => {
                  resolve(response);
              })
              .fail(error => {
                let msg = "Error getting project files for project_id " + project_id;
                let errorMsg = error.responseJSON.message;
                alertify.alert("<div class='pb-2 dark-text-important'>"+   msg +  "</div>  <div class='pb-2' font-italic>Please email <a href='mailto:info@frameshift.io'>info@frameshift.io</a> for help resolving this issue.</div><code>" + errorMsg + "</code>")
                  .setHeader("Fatal Error");

                console.log("Unable to get files for project " + project_id);
                reject(error);
              })
      })
  }


  getFilesForProject(project_id) {
      let self = this;
      return $.ajax({
          url: self.api +  '/projects/' + project_id + '/files',
          type: 'GET',
          contentType: 'application/json',
          headers: {
              'Authorization': localStorage.getItem('hub-iobio-tkn')
          }
      });
  }

  promiseGetSignedUrlForFile(project_id, sample_id, file) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.getSignedUrlForFile(project_id, sample_id, file)
      .done(file => {
        resolve(file);
      })
      .fail(error => {

        let errorMsg = error.responseJSON.message;
        let msg = "Could not get signed url for file_id  " + file.id;
        alertify.alert("<div class='pb-2 dark-text-important'>"+   msg +  "</div>  <div class='pb-2' font-italic>Please email <a href='mailto:info@frameshift.io'>info@frameshift.io</a> for help resolving this issue.</div><code>" + errorMsg + "</code>")
          .setHeader("Fatal Error");

        reject(error);
      })
    })
  }

  getSignedUrlForFile (project_id, sample_id, file) {
    let self = this;
    return $.ajax({
      url: self.api +  '/projects/' + project_id + '/files/' + file.id + '/url',
      type: 'GET',
      contentType: 'application/json',
      headers: {
        'Authorization': localStorage.getItem('hub-iobio-tkn')
      }
    });
  }

  getProject(projectId) {
    let self = this;
    return $.ajax({
        url: self.api + '/projects/' + projectId,
        type: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': localStorage.getItem('hub-iobio-tkn')
        }
    });
  }

  promiseGetGeneSet(projectId, geneSetId) {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.getGeneSet(projectId, geneSetId)
      .done(response => {
        resolve(response)
      })
      .fail(error => {
        let errorMsg = error.responseJSON.message;
        let msg = "Error getting gene set from Mosaic with gene_set_id " + geneSetId + ".  The Mosaic servers may be down, or the gene set may not be up to date with the most recent version of Mosaic.";
        alertify.alert("<div class='pb-2 dark-text-important'>"+   msg +  "</div>  <div class='pb-2' font-italic>Please email <a href='mailto:info@frameshift.io'>info@frameshift.io</a> for help resolving this issue.</div><code>" + errorMsg + "</code>").setHeader("Fatal Error");

        reject("Error getting gene set " + geneSetId + ": " + error);
      })
    })

  }


  promiseGetVariantSet(projectId, variantSetId, build) {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.getVariantSet(projectId, variantSetId, build)
      .done(response => {
        let data = response;

        // The gene symbol is in a different field depending on the genome build.
        // Set the 'gene_symbol' field so that we can pull it from one field.
        let geneSymbolField = null
        if (build === "GRCh38"){
          geneSymbolField = 'gene_symbol_GRCh38';
        }
        else if (build === "GRCh37"){
           geneSymbolField = 'gene_symbol_GRCh37';
        }
        if (geneSymbolField) {
          data.variants.forEach(function(variant) {
            if (!variant.hasOwnProperty('gene_symbol')) {
              variant['gene_symbol'] = variant[geneSymbolField];
            }
          })
        }

        resolve(data)
      })
      .fail(error => {
        self.getVariantSet(projectId, variantSetId, 'old_project')
        .done(response => {
          resolve(response)
        })
        .fail(error => {
          let errorMsg = error.responseJSON.message;
          let msg = "Error getting variant set " + variantSetId + " from Mosaic. This project may not be up to date with the latest variant annotations.";
          alertify.alert("<div class='pb-2 dark-text-important'>"+   msg +  "</div>  <div class='pb-2' font-italic>Please email <a href='mailto:info@frameshift.io'>info@frameshift.io</a> for help resolving this issue.</div><code>" + errorMsg + "</code>").setHeader("Fatal Error");

          reject("Error getting variant set " + variantSetId + ": " + error);
        })


      })
    })

  }



  promiseGetAnalysis(projectId, analysisId) {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.getAnalysis(projectId, analysisId)
      .done(response => {
        resolve(response)
      })
      .fail(error => {
        let errorMsg = error.responseJSON.message;
        let msg = "Error getting analysis " + analysisId + " from Mosaic. The Mosaic servers may be down.  Come back later and try again."
        alertify.alert("<div class='pb-2 dark-text-important'>"+   msg +  "</div>  <div class='pb-2' font-italic>Please email <a href='mailto:info@frameshift.io'>info@frameshift.io</a> for help resolving this issue.</div><code>" + errorMsg + "</code>").setHeader("Fatal Error");

        console.log("Error getting analysis  " + analysisId + ": " + errorMsg);
        reject("Error getting analysis: " + msg + "." )
      })
    })

  }
  promiseAddAnalysis(projectId, analysis) {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.addAnalysis(projectId, analysis)
      .done(response => {
        resolve(response)
      })
      .fail(error => {
        let errorMsg = error.responseJSON.message;
        let msg = "Error adding analysis " + analysis.id + " from Mosaic. The Mosaic servers may be down.  Come back later and try again."
        alertify.alert("<div class='pb-2 dark-text-important'>"+   msg +  "</div>  <div class='pb-2' font-italic>Please email <a href='mailto:info@frameshift.io'>info@frameshift.io</a> for help resolving this issue.</div><code>" + errorMsg + "</code>").setHeader("Fatal Error");
        console.log("Error adding analysis for project " + projectId + ": " + errorMsg);
        reject("Error adding analysis: " + msg + "." )
      })
    })

  }

  promiseUpdateAnalysis(analysis) {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.updateAnalysis(analysis.project_id, analysis.id, analysis)
      .done(response => {
        resolve(response)
      })
      .fail(error => {
        let errorMsg = error.responseJSON.message;
        console.log("Error updating analysis :" + errorMsg);
        let msg = "Error updating analysis " + analysis.id + " from Mosaic. The Mosaic servers may be down.  Come back later and try again."

        alertify.alert("<div class='pb-2 dark-text-important'>"+   msg +  "</div>  <div class='pb-2' font-italic>Please email <a href='mailto:info@frameshift.io'>info@frameshift.io</a> for help resolving this issue.</div><code>" + errorMsg + "</code>").setHeader("Fatal Error");

        reject("Error saving analysis: " + msg + "." )
      })
    })

  }

  promiseUpdateAnalysisTitle(analysis) {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.updateAnalysisTitle(analysis.project_id, analysis.id, analysis)
      .done(response => {
        resolve(response)
      })
      .fail(error => {
        reject("Error updating analysis title " + analysis.id + ": " + error);
      })
    })

  }

  getAnalysis(projectId, analysisId) {
    let self = this;
    return $.ajax({
      url: self.api + '/projects/' + projectId  + '/analyses/' + analysisId,
      type: 'GET',
      contentType: 'application/json',
      headers: {
        Authorization: localStorage.getItem('hub-iobio-tkn'),
      },
    })
  }




  addAnalysis(projectId, newAnalysisData) {
    let self = this;

    return $.ajax({
      url: self.api + '/projects/' + projectId + '/analyses/?client_application_id=' + this.client_application_id,
      type: 'POST',
      data: self.stringifyAnalysis(newAnalysisData),
      contentType: 'application/json',
      headers: {
        Authorization: localStorage.getItem('hub-iobio-tkn'),
      },
    });
  }

  updateAnalysisTitle(projectId, analysisId, newAnalysisData) {
    let self = this;

    return $.ajax({
      url: self.api + '/projects/' + projectId + '/analyses/' + analysisId,
      type: 'PUT',
      data: self.stringifyAnalysis(newAnalysisData),
      contentType: 'application/json',
      headers: {
        Authorization: localStorage.getItem('hub-iobio-tkn'),
      },
    });
  }


  updateAnalysis(projectId, analysisId, newAnalysisData) {
    let self = this;

    return $.ajax({
      url: self.api + '/projects/' + projectId + '/analyses/' + analysisId
            + '?client_application_id=' + this.client_application_id,
      type: 'PUT',
      data: self.stringifyAnalysis(newAnalysisData),
      contentType: 'application/json',
      headers: {
        Authorization: localStorage.getItem('hub-iobio-tkn'),
      },
    });
  }

  promiseGetCurrentUser() {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.getCurrentUser()
        .done(response => {
          resolve(response)
        })
        .fail(error => {
          let errorMsg = error.responseJSON.message;
          let msg = "Error getting current Mosaic user.  Your authorization may have expired.  Make sure you are still logged into Mosaic, and relaunch the project."
          alertify.alert("<div class='pb-2 dark-text-important'>"+   msg +  "</div>  <div class='pb-2' font-italic>Please email <a href='mailto:info@frameshift.io'>info@frameshift.io</a> for help resolving this issue.</div><code>" + errorMsg + "</code>").setHeader("Fatal Error");


          reject("Error getting currentUser :" + error);
        })
    })
  }

  getCurrentUser() {
    let self = this;

    return $.ajax({
      url: self.api + '/user',
      type: 'GET',
      contentType: 'application/json',
      headers: {
        Authorization: localStorage.getItem('hub-iobio-tkn'),
      },
    });

  }

  getGeneSet(projectId, geneSetId) {
    let self = this;

    return $.ajax({
      url: self.api + '/projects/' + projectId + '/genes/sets/' + geneSetId,
      type: 'GET',
      contentType: 'application/json',
      headers: {
        Authorization: localStorage.getItem('hub-iobio-tkn'),
      },
    });
  }


  getVariantSet(projectId, variantSetId, build) {
    const self = this;
    const VAR_LIMIT = 500;  // Randomly chosen by

    let annotationUids = [];
    if(build === "GRCh38"){
      annotationUids.push('gene_symbol_GRCh38');
    }
    else if(build === "GRCh37"){
      annotationUids.push('gene_symbol_GRCh37');
    }
    else {
      annotationUids.push('gene_symbol');
    }
    return $.ajax({
      // url: 'https://mosaic.chpc.utah.edu/api/v1/projects/' + projectId + '/variants/sets/' + variantSetId + "?include_variant_data=true&include_genotype_data=true",
      url: self.apiDepricated + '/projects/' + projectId + '/variants?variant_set_id=' + variantSetId + '&limit=' + VAR_LIMIT,
      data: {
        annotation_uids: annotationUids,
      },
      type: 'GET',
      contentType: 'application/json',
      headers: {
        Authorization: localStorage.getItem('hub-iobio-tkn'),
      },
    });
  }

  stringifyAnalysis(analysisData) {
    let self = this;
    var cache = [];

    let analysisDataCopy = $.extend({}, analysisData)

    // First get rid of full gene and transcript objects from variants
    // These are too big to stringify and store
    analysisDataCopy.payload.variants.forEach(function(variant) {
      if (variant.gene && self.globalApp.utility.isObject(variant.gene)) {
        variant.gene = variant.gene.gene_name;
      }
      if (variant.transcript && self.globalApp.utility.isObject(variant.transcript)) {
        variant.transcriptId = variant.transcript.transcript_id;
        variant.transcript = null;
      }
//      variant.variantInspect = null;
      if (variant.variantInspect && variant.variantInspect.geneObject) {
        variant.variantInspect.geneName = variant.variantInspect.geneObject.gene_name
        variant.variantInspect.geneObject = null;
      }
      if (variant.variantInspect && variant.variantInspect.transcriptObject) {
        variant.variantInspect.transcriptId = variant.variantInspect.transcriptObject.transcript_id
        variant.variantInspect.transcriptObject = null;
      }
    })
    analysisDataCopy.payload.filters = null;


    let analysisString = JSON.stringify(analysisDataCopy, function(key, value) {
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
    cache = [];
    return analysisString;
  }
}
