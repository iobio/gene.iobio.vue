class GeneModel {
  constructor(globalApp, limitGenes, launchedFromHub, genePanels) {

    this.globalApp                 = globalApp;
    this.limitGenes                = limitGenes;
    this.launchedFromHub = launchedFromHub;
    this.phenolyzerServer          = "https://services.backend.iobio.io/phenolyzer/";

    this.NCBI_GENE_SEARCH_URL      = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&usehistory=y&retmode=json";
    this.NCBI_GENE_SUMMARY_URL     = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&usehistory=y&retmode=json";


    this.NCBI_PUBMED_SEARCH_URL    = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&usehistory=y&retmode=json";
    this.NCBI_PUBMED_SUMMARY_URL   = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&usehistory=y&retmode=json";
    
    this.OMIM_URL                  = "https://api.omim.org/api/";
    this.warnedMissingOMIMApiKey   = false;

    this.linkTemplates = {
        omim:      { display: 'OMIM',      url: 'https://www.omim.org/search/?search=GENESYMBOL'},
        humanmine: { display: 'HumanMine', url: 'http://www.humanmine.org/humanmine/keywordSearchResults.do?searchTerm=+GENESYMBOL&searchSubmit=GO'},
        ncbi:      { display: 'NCBI',      url: 'https://www.ncbi.nlm.nih.gov/gene/GENEUID'},
        pubmed:    { display: 'PubMed',    url: 'https://pubmed.ncbi.nlm.nih.gov/?from_uid=GENEUID&linkname=gene_pubmed'},
        decipher:  { display: 'DECIPHER',  url: 'https://decipher.sanger.ac.uk/search?q=GENESYMBOL'},
        marrvel:   { display: 'MARRVEL',   url: 'http://marrvel.org/search/gene/GENESYMBOL'},
        genecards: { display: 'GeneCards', url: 'https://www.genecards.org/cgi-bin/carddisp.pl?gene=GENESYMBOL'},
        uniprot:   { display: 'UniProt',   url: 'http://www.uniprot.org/uniprot/?query=gene:GENESYMBOL AND organism:"Homo sapiens (Human) [9606]"'},
        gtex:      { display: 'GTex',      url: 'https://www.gtexportal.org/home/gene/GENESYMBOL'},
        humanproteinatlas:
                   { display: 'Human Protein Atlas', url: 'https://www.proteinatlas.org/search/gene_name:GENESYMBOL'},
        ucsc:      { display: 'UCSC Browser', url: 'http://genome.ucsc.edu/cgi-bin/hgTracks?db=GENOMEBUILD-ALIAS-UCSC&position=GENECOORD'}
    }

    this.variantLinkTemplates = {
        gnomad:    { display: 'gnomAD',       url: 'http://gnomad.broadinstitute.org/variant/VARIANTCOORD-GNOMAD'},
        varsome:   { display: 'VarSome',      url: 'https://varsome.com/variant/GENOMEBUILD-ALIAS-UCSC/VARIANTCOORD-VARSOME'},
        dbsnp:     { display: 'dbSNP',        url: 'http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=VARIANT-RSID'},
        ucsc:      { display: 'UCSC Browser', url: 'http://genome.ucsc.edu/cgi-bin/hgTracks?db=GENOMEBUILD-ALIAS-UCSC&position=VARIANTCOORD-UCSC'},
        clinvar:   { display: 'ClinVar',      url: 'https://www.ncbi.nlm.nih.gov/clinvar/variation/VARIANT-CLINVAR-UID/'}
    }

    this.geneSource = null;
    this.refseqOnly = {};
    this.gencodeOnly = {};

    this.translator = null;

    this.genomeBuildHelper = null;

    this.genePanels = genePanels;

    this.geneNames = [];
    this.geneDangerSummaries = {};
    this.sortedGeneNames = [];
    this.candidateGenes = null;


    this.geneNCBISummaries = {};
    this.geneOMIMEntries = {};
    this.genePubMedEntries = {};
    this.geneClinvarPhenotypes = {};
    this.genePhenotypes = {};
    this.geneObjects = {};
    this.geneToLatestTranscript = {};


    this.allKnownGenes = [];
    this.allKnownGeneNames = {};
    this.clinvarGenes = {};

    this.transcriptCodingRegions = {};

    this.geneRegionBuffer = 1000;

    this.NUMBER_PHENOLYZER_GENES = 300;
    this.phenolyzerGenes = [];

    this.pendingNCBIRequests = {};

    this.rankedGenes = {};

    this.genePhenotypeHits = {};

    this.isFullAnalysis = false;

    this.dispatch = d3.dispatch("geneDangerSummarized");
    d3.rebind(this, this.dispatch, "on");

    this.genesAssociatedWithSource = {};
  }


  getGenePanelNames() {
    let self = this;
    let siteName = process.env.SITE_NAME;
    let filteredGenePanelNames = Object.keys(this.genePanels).filter(function(name) {
      let gp = self.genePanels[name];
      if (gp.sites == null || (siteName != null && siteName.length > 0 && gp.sites.indexOf(siteName) >= 0)) {
        return true;
      } else {
        return false;
      }
    })
    return filteredGenePanelNames;
  }

  getGenePanelShortName(name) {
    if (this.genePanels[name]) {
      return this.genePanels[name].shortName
    } else {
      return null;
    }
  }

  getGenePanelGenes(name) {
    if (this.genePanels[name]) {
      return this.genePanels[name].genes;
    } else {
      return null;
    }
  }

  setCandidateGenes(genes) {
    let self = this;
    self.candidateGenes = {};
    genes.forEach(function(gene) {
      self.candidateGenes[gene] = true;
    })
  }
  
  getCandidateGenes() {
    let self = this;
    return Object.keys(self.candidateGenes);
  }

  isCandidateGene(theGeneName) {
    let self = this;
    if (self.candidateGenes != null) {
      return self.candidateGenes[theGeneName];
    } else {
      return true;
    }
  }


  getGenePhenotypeHits(geneName) {
    if (this.genePhenotypeHits) {
      return this.genePhenotypeHits[geneName];
    } else {
      return null;
    }
  }


  setGenePhenotypeHitsFromClin(genesReport) {
    let self = this;
    if (genesReport) {
      this.genePhenotypeHits = {};
      genesReport.forEach(function(geneEntry) {
        var searchTerms = self.genePhenotypeHits[geneEntry.name];
        if (searchTerms == null) {
          searchTerms = {};
          self.genePhenotypeHits[geneEntry.name] = searchTerms;
        }
        if (geneEntry.searchTermsGtr && geneEntry.searchTermsGtr.length > 0) {
          geneEntry.searchTermsGtr.forEach(function(searchTermObject) {
            var searchTerm = searchTermObject.searchTerm.split(" ").join("_");
            var ranks = searchTerms[searchTerm];
            if (ranks == null) {
              ranks = [];
              searchTerms[searchTerm] = ranks;
            }
            ranks.push( {'rank': searchTermObject.rank, 'source': 'GTR'});
          })
        }
        if (geneEntry.searchTermsPhenolyzer && geneEntry.searchTermsPhenolyzer.length > 0) {
          geneEntry.searchTermsPhenolyzer.forEach(function(searchTermObject) {
            var searchTerm = searchTermObject.searchTerm.split(" ").join("_");
            var ranks = searchTerms[searchTerm];
            if (ranks == null) {
              ranks = [];
              searchTerms[searchTerm] = ranks;
            }
            ranks.push( {'rank': searchTermObject.rank, 'source': 'Phen.'});
          })
        }
        if (geneEntry.searchTermHpo && geneEntry.searchTermHpo.length > 0) {
          geneEntry.searchTermHpo.forEach(function(searchTermObject) {
            var searchTerm = searchTermObject.searchTerm.split(" ").join("_");
            var ranks = searchTerms[searchTerm];
            if (ranks == null) {
              ranks = [];
              searchTerms[searchTerm] = ranks;
            }
            ranks.push( { 'hpoPhenotype': searchTermObject.hpoPhenotype, 'source': 'HPO'});
          })
        }

      })

    }
  }

  setGenePhenotypeHitsFromPhenolyzer(phenotypeTerm, phenotypeGenes) {
    let self = this;
    this.genePhenotypeHits = {};
    if (phenotypeGenes && phenotypeGenes.length > 0) {
      var searchTerm = phenotypeTerm.split(" ").join("_");
      phenotypeGenes.forEach(function(phenotypeGene) {
        var searchTerms = self.genePhenotypeHits[phenotypeGene.geneName];
        if (searchTerms == null) {
          searchTerms = {};
          self.genePhenotypeHits[phenotypeGene.geneName] = searchTerms;
        }
        var ranks = searchTerms[searchTerm];
        if (ranks == null) {
          ranks = [];
          searchTerms[searchTerm] = ranks;
        }
        ranks.push( {'rank': phenotypeGene.rank, 'source': 'Phen.'});
      })
    }

  }


  getPhenotypeHits(geneName) {
    return this.genePhenotypeHits[geneName];
  }

  setRankedGenes(rankedGenes) {
    let self = this;
    self.rankedGenes = {};
    if (rankedGenes.gtr) {
      rankedGenes.gtr.forEach(function(gtrGene) {
        let theRankedGene = self.rankedGenes[gtrGene.name];
        if (theRankedGene == null) {
          theRankedGene = { 'name': gtrGene.name, 'gtrRank': gtrGene.gtrRank, 'gtrAssociated': gtrGene.gtrAssociated};
          self.rankedGenes[gtrGene.name] = theRankedGene;
        } else {
          theRankedGene.gtrRank = gtrGene.gtrRank;
          theRankedGene.gtrAssociated = gtrGene.gtrAssociated;
        }
      })
    }
    if (rankedGenes.phenolyzer) {
      rankedGenes.phenolyzer.forEach(function(phGene) {
        let theRankedGene = self.rankedGenes[phGene.name];
        if (theRankedGene == null) {
          theRankedGene = { 'name': phGene.name, 'phenolyzerRank': phGene.phenolyzerRank};
          self.rankedGenes[phGene.name] = theRankedGene;
        } else {
          theRankedGene.phenolyzerRank = phGene.phenolyzerRank;
        }
      })
    }
    if (rankedGenes.hpo) {
      rankedGenes.hpo.forEach(function(hpoGene) {
        let theRankedGene = self.rankedGenes[hpoGene.name];
        if (theRankedGene == null) {
          theRankedGene = { 'name': hpoGene.name, 'hpoRank': hpoGene.hpoRank};
          self.rankedGenes[hpoGene.name] = theRankedGene;
        } else {
          theRankedGene.hpoRank = hpoGene.hpoRank;
        }
      })
    }
  }

  getGeneRank(geneName) {
    if (this.rankedGenes) {
      return this.rankedGenes[geneName];
    } else {
      var rank = this.geneNames.indexOf(geneName) + 1;
      return { 'name': geneName, 'genericRank': rank};
    }
  }

  promiseAddGeneName(theGeneName) {
    let me = this;

    return new Promise(function(resolve, reject) {
      if (theGeneName == null) {
        debugger;
      }

      let geneName = theGeneName.toUpperCase();

      if (me.geneNames.indexOf(geneName) < 0) {
        me.geneNames.push(geneName);
        me.sortedGeneNames.push(geneName);
        me.promiseGetGeneObject(geneName)
        .then(function() {
          return me.promiseGetGenePhenotypes(geneName)
        })
        //.then(function() {
        //  return me.promiseGetNCBIGeneSummary(geneName);
        //})
        .then(function() {
          resolve(true);
        })
      } else {
        resolve(false);
      }

    })
  }

  setAllKnownGenes(allKnownGenes) {
    var me = this;
    me.allKnownGenes = allKnownGenes;
    me.allKnownGeneNames = {};
    me.allKnownGenes.forEach(function(gene) {
      me.allKnownGeneNames[gene.gene_name.toUpperCase()] = gene;
    })
  }

  ACMGGenes() {
    this.promiseCopyPasteGenes(this.getGenePanel("ACMG 59").join(","));
  }


  promiseCopyPasteGenes(genesString, options={replace:true, warnOnDup: true}) {
    var me = this;

    return new Promise(function(resolve, reject) {

      me._promiseCopyPasteGenesImpl(genesString, options)
      .then(function() {
        return me.promiseGetNCBIGeneSummaries(me.geneNames)
      })
      .then(function() {

        var promises = [];
        me.geneNames.forEach(function(geneName) {
          promises.push(me.promiseGetGeneObject(geneName));
          promises.push(me.promiseGetGenePhenotypes(geneName));
        })

        return Promise.all(promises)
      })
      .then(function() {
        resolve();
      })
      .catch(function(error) {
        console.log(error);
        resolve();
      })

    })


 }

 getCopyPasteGeneCount(genesString) {
    genesString = genesString.replace(/\s*$/, "");
    var geneNameList = genesString.split(/(?:\s+|,\s+|,|^W|\n)/g);
    return geneNameList.length;
 }

 _promiseCopyPasteGenesImpl(genesString, options={replace: true, warnOnDup: true}) {
    var me = this;

    return new Promise(function(resolve, reject) {

      genesString = genesString.replace(/\s*$/, "");
      var geneNameList = genesString.split(/(?:\s+|,\s+|,|^W|\n)/g);



      var genesToAdd = [];
      var unknownGeneNames = {};
      var duplicateGeneNames = {};
      var promises = [];
      geneNameList.forEach( function(geneName) {
        if (geneName.trim().length > 0) {
          let p = me.promiseIsValidGene(geneName.trim())
          .then(function(isValid) {
            if (isValid) {
              // Make sure this isn't a duplicate.  If we are not replacing the current genes,
              // make sure to check for dups in the existing gene list as well.
              if (genesToAdd.indexOf(geneName.trim().toUpperCase()) < 0
                  && (options.replace || me.geneNames.indexOf(geneName.trim().toUpperCase()) < 0)) {
                genesToAdd.push(geneName.trim().toUpperCase());
              } else {
                duplicateGeneNames[geneName.trim().toUpperCase()] = true;
              }
            } else {
              unknownGeneNames[geneName.trim().toUpperCase()] = true;
            }
          })
          promises.push(p);
        }
      });

      Promise.all(promises)
      .then(function() {

        if (options.replace) {
          me.geneNames = [];
          me.sortedGeneNames = [];
        }

        genesToAdd.forEach(function(geneName) {
          me.geneNames.push(geneName);
          me.sortedGeneNames.push(geneName);
        })



        var message = "";
        if (Object.keys(unknownGeneNames).length > 0) {
          message = "Bypassing unknown genes: " + Object.keys(unknownGeneNames).join(", ") + ".";
          alertify.alert("Warning", message);
        }
        if (Object.keys(duplicateGeneNames).length > 0 && options.warnOnDup) {
          if (message.length > 0) {
            message += "   ";
          }
          message += "Bypassing duplicate gene name(s): " + Object.keys(duplicateGeneNames).join(", ") + ".";
        }
        if (message.length > 0) {
          alertify.alert("Warning", message);
        }

        if (me.limitGenes) {
          if (me.globalApp.maxGeneCount && me.geneNames.length > me.globalApp.maxGeneCount) {
            var bypassedCount = me.geneNames.length - me.globalApp.maxGeneCount;
            me.geneNames = me.geneNames.slice(0, me.globalApp.maxGeneCount);
            alertify.alert("Due to browser cache limitations, only the first " + me.globalApp.maxGeneCount
              + " genes were added. "
              + bypassedCount.toString()
              + " "
              + (bypassedCount == 1 ? "gene" : "genes")
              +  " bypassed.");
          }

        }

        resolve();

      })
      .catch(function(error) {
        reject(error);
      })


    })

 }


  setDangerSummary(geneName, dangerSummary) {
    if (geneName == null) {
      return;
    }
    delete this.geneDangerSummaries[geneName];
    this.geneDangerSummaries[geneName.toUpperCase()] = dangerSummary;
    this.dispatch.geneDangerSummarized(dangerSummary);
  }

  getDangerSummary(geneName) {
    if (geneName == null) {
      return
    }
    return this.geneDangerSummaries[geneName.toUpperCase()];
  }

  clearDangerSummaries() {
    this.geneDangerSummaries = {};
  }


  promiseLoadClinvarGenes() {
    let me = this;
    var p = new Promise(function(resolve, reject) {

      me.clinvarGenes = {};

      $.ajax({
          url: me.globalApp.clinvarGenesUrl,
          type: "GET",
          crossDomain: true,
          dataType: "text",
          success: function( res ) {
            if (res && res.length > 0) {
              let recs = res.split("\n");
              var firstTime = true;
              recs.forEach(function(rec) {
                if (firstTime) {
                  // ignore col headers
                  firstTime = false;
                } else {
                  var fields = rec.split("\t");
                  me.clinvarGenes[fields[0]] = +fields[1];
                }
              })

              resolve();
            } else {
              reject("Empty results returned from promiseLoadClinvarGenes");

            }

          },
          error: function( xhr, status, errorThrown ) {
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.log( xhr );
            reject("Error " + errorThrown + " occurred in promiseLoadClinvarGenes() when attempting get clinvar gene counts ");
          }
      });

    });

  }



  getRidOfDuplicates(genes) {
    let me = this;
    var sortedGenes = genes.sort( function(g1, g2) {
      if (g1.gene_name < g2.gene_name) {
        return -1;
      } else if (g1.gene_name > g2.gene_name) {
        return 1;
      } else {
        return 0;
      }
    });
    // Flag gene objects with same name
    for (var i =0; i < sortedGenes.length - 1; i++) {
          var gene = sortedGenes[i];


          var nextGene = sortedGenes[i+1];
          if (i == 0) {
            gene.dup = false;
          }
          nextGene.dup = false;

          if (gene.gene_name == nextGene.gene_name && gene.refseq == nextGene.refseq && gene.gencode == nextGene.gencode) {
            nextGene.dup = true;
        }

        // Some more processing to gather unique gene sets and add field 'name'
        gene.name = gene.gene_name;
        if (gene.refseq != gene.gencode) {
          if (gene.refseq) {
            me.refseqOnly[gene.gene_name] = gene;
          } else {
            me.gencodeOnly[gene.gene_name] = gene;
          }
        }
    }
    return sortedGenes.filter(function(gene) {
      return gene.dup == false;
    });
  }

  getTranscript(geneObject, transcriptId) {
    var theTranscripts = geneObject.transcripts.filter(function(transcript) {
      return transcript.transcript_id == transcriptId;
    });
    return theTranscripts.length > 0 ? theTranscripts[0] : null;
  }

  getCanonicalTranscript(theGeneObject) {
    let me = this;
    var geneObject = theGeneObject != null ? theGeneObject : window.gene;
    var canonical;

    if (geneObject.transcripts == null || geneObject.transcripts.length == 0) {
      return null;
    }
    var order = 0;
    geneObject.transcripts.forEach(function(transcript) {
      transcript.isCanonical = false;
      var cdsLength = 0;
      if (transcript.features != null) {
        transcript.features.forEach(function(feature) {
          if (feature.feature_type == 'CDS') {
            cdsLength += Math.abs(parseInt(feature.end) - parseInt(feature.start));
          }
        })
        transcript.cdsLength = cdsLength;
      } else {
        transcript.cdsLength = +0;
      }
      transcript.order = order++;

    });
    var sortedTranscripts = geneObject.transcripts.slice().sort(function(a, b) {
      var aType = +2;
      var bType = +2;
      if (a.hasOwnProperty("transcript_type") && a.transcript_type == 'protein_coding') {
        aType = +0;
      } else if (a.hasOwnProperty("gene_type") && a.gene_type == "gene")  {
        aType = +0;
      } else {
        aType = +1;
      }
      if (b.hasOwnProperty("transcript_type") && b.transcript_type == 'protein_coding') {
        bType = +0;
      } else if (b.hasOwnProperty("gene_type") && b.gene_type == "gene")  {
        bType = +0;
      } else {
        bType = +1;
      }


      var aLevel = +2;
      var bLevel = +2;
      if (me.geneSource.toLowerCase() == 'refseq') {
        if (a.transcript_id.indexOf("NM_") == 0 ) {
          aLevel = +0;
        }
        if (b.transcript_id.indexOf("NM_") == 0 ) {
          bLevel = +0;
        }
      } else {
        // Don't consider level for gencode as this seems to point to shorter transcripts many
        // of the times.
        //aLevel = +a.level;
        //bLevel = +b.level;
      }


      var aSource = +2;
      var bSource = +2;
      if (me.geneSource.toLowerCase() =='refseq') {
        if (a.annotation_source == 'BestRefSeq' ) {
          aSource = +0;
        }
        if (b.annotation_source == 'BestRefSeq' ) {
          bSource = +0;
        }
      }

      a.sort = aType + ' ' + aLevel + ' ' + aSource + ' ' + a.cdsLength + ' ' + a.order;
      b.sort = bType + ' ' + bLevel + ' ' + bSource + ' ' + b.cdsLength + ' ' + b.order;

      if (aType == bType) {
        if (aLevel == bLevel) {
          if (aSource == bSource) {
            if (+a.cdsLength == +b.cdsLength) {
              // If all other sort criteria is the same,
              // we will grab the first transcript listed
              // for the gene.
              if (a.order == b.order) {
                return 0;
              } else if (a.order < b.order) {
                return -1;
              } else {
                return 1;
              }
              return 0;
            } else if (+a.cdsLength > +b.cdsLength) {
              return -1;
            } else {
              return 1;
            }
          } else if ( aSource < bSource ) {
            return -1;
          } else {
            return 1;
          }
        } else if (aLevel < bLevel) {
          return -1;
        } else {
          return 1;
        }
      } else if (aType < bType) {
        return -1;
      } else {
        return 1;
      }
    });
    canonical = sortedTranscripts[0];
    canonical.isCanonical = true;
    return canonical;
  }


  getCanonicalTranscriptOld(theGeneObject) {
    let me = this;

    var geneObject = theGeneObject != null ? theGeneObject : window.gene;
    var canonical;
    var maxCdsLength = 0;
    geneObject.transcripts.forEach(function(transcript) {
      var cdsLength = 0;
      if (transcript.features != null) {
        transcript.features.forEach(function(feature) {
          if (feature.feature_type == 'CDS') {
            cdsLength += Math.abs(parseInt(feature.end) - parseInt(feature.start));
          }
        })
        if (cdsLength > maxCdsLength) {
          maxCdsLength = cdsLength;
          canonical = transcript;
        }
        transcript.cdsLength = cdsLength;
      }

    });

    if (canonical == null) {
      // If we didn't find the canonical (transcripts didn't have features), just
      // grab the first transcript to use as the canonical one.
      if (geneObject.transcripts != null && geneObject.transcripts.length > 0)
      canonical = geneObject.transcripts[0];
    }
    canonical.isCanonical = true;
    return canonical;
  }

  getCodingRegions(transcript) {
    let me = this;
    if (transcript && transcript.features) {
      var codingRegions = me.transcriptCodingRegions[transcript.transcript_id];
      if (codingRegions) {
        return codingRegions;
      }
      codingRegions = [];
      transcript.features.forEach( function(feature) {
        if ($.inArray(feature.feature_type, ['EXON', 'CDS', 'UTR']) !== -1) {
          codingRegions.push({ start: feature.start, end: feature.end });
        }
      });
      me.transcriptCodingRegions[transcript.transcript_id] = codingRegions;
      return codingRegions;
    }
    return [];
  }




  _getSortedExonsForTranscript(transcript) {
    var sortedExons = transcript
      .features.filter(function(feature) {
        return feature.feature_type.toUpperCase() == 'EXON';
      })
      .sort(function(feature1, feature2) {

        var compare = 0;
        if (feature1.start < feature2.start) {
          compare = -1;
        } else if (feature1.start > feature2.start) {
          compare = 1;
        } else {
          compare = 0;
        }

        var strandMultiplier = transcript.strand == "+" ? 1 : -1;

        return compare * strandMultiplier;

      })

    var exonCount = 0;
    sortedExons.forEach(function(exon) {
      exonCount++
    })

    var exonNumber = 1;
    sortedExons.forEach(function(exon) {
      exon.exon_number = exonNumber + "/" + exonCount;
      exonNumber++;
    })
    return sortedExons;
  }

  promiseGetNCBIGeneSummaries(geneNames) {
    let me = this;
    let waitSeconds = 0;
    if (Object.keys(me.geneNCBISummaries).length > 0) {
      waitSeconds = 5000;
    }
    setTimeout(function() {
      return me.promiseGetNCBIGeneSummariesImpl(geneNames);
    }, waitSeconds);
  }

  promiseGetNCBIGeneSummariesImpl(geneNames) {
    let me = this;
    return new Promise( function(resolve, reject) {

      let unknownGeneInfo = {description: ' ', summary: ' '};

      let theGeneNames = geneNames.filter(function(geneName) {
        return me.geneNCBISummaries[geneName] == null;
      })

      if (theGeneNames.length == 0) {
        resolve();
      } else {

        let searchGeneExpr = "";
        theGeneNames.forEach(function(geneName) {
          var geneInfo = me.geneNCBISummaries[geneName];
          if (geneInfo == null) {
            if (searchGeneExpr.length > 0) {
              searchGeneExpr += " OR ";
            }
            searchGeneExpr += geneName + "[Gene name]";
          }
        })
        var searchUrl = me.NCBI_GENE_SEARCH_URL + "&term=" + "(9606[Taxonomy ID] AND (" + searchGeneExpr + "))";
        me.pendingNCBIRequests[theGeneNames] = true;

        $.ajax( searchUrl )
         .done(function(data) {

            // Now that we have the gene ID, get the NCBI gene summary
            var webenv = data["esearchresult"]["webenv"];
            var queryKey = data["esearchresult"]["querykey"];
            var summaryUrl = me.NCBI_GENE_SUMMARY_URL + "&query_key=" + queryKey + "&WebEnv=" + webenv;
            $.ajax( summaryUrl )
            .done(function(sumData) {
                if (sumData.result == null || sumData.result.uids.length == 0) {
                  if (sumData.esummaryresult && sumData.esummaryresult.length > 0) {
                    sumData.esummaryresult.forEach( function(message) {
                      console.log("Unable to get NCBI gene summary from eutils esummary")
                      console.log(message);
                    });
                  }
                  delete me.pendingNCBIRequests[theGeneNames];
                  reject();

                } else {

                  sumData.result.uids.forEach(function(uid) {
                    var geneInfo = sumData.result[uid];
                    me.geneNCBISummaries[geneInfo.name] = geneInfo;

                  })
                  delete me.pendingNCBIRequests[theGeneNames];
                  resolve();
                }
            })
           .fail(function(error) {
              console.log(error)
              if (me.pendingNCBIRequests && me.pendingNCBIRequests[theGeneNames]) {
                delete me.pendingNCBIRequests[theGeneNames];
              }
              console.log("Error occurred when making http request to NCBI eutils esummary for genes " + geneNames.join(","));
              reject();
            })

          })
          .fail(function(error) {
            console.log(error)
            if (me.pendingNCBIRequests && me.pendingNCBIRequests[theGeneNames]) {
              delete me.pendingNCBIRequests[theGeneNames];
            }
            console.log("Error occurred when making http request to NCBI eutils esearch for gene " + geneNames.join(","));
            reject();
          })

      }

    })


  }


  promiseGetNCBIGeneSummary(geneName) {
    let me = this;
    return new Promise( function(resolve, reject) {

      var geneInfo = me.geneNCBISummaries[geneName];
      let unknownGeneInfo = {description: ' ', summary: ' '};

      if (geneInfo != null && geneInfo.summary != " ") {
        resolve(geneInfo);
      } else {
        // Search NCBI based on the gene name to obtain the gene ID
        var url = me.NCBI_GENE_SEARCH_URL + "&term=" + "(" + geneName + "[Gene name]" + " AND 9606[Taxonomy ID]";
        $.ajax( url )
        .done(function(data) {

          // Now that we have the gene ID, get the NCBI gene summary
          var webenv = data["esearchresult"]["webenv"];
          var queryKey = data["esearchresult"]["querykey"];
          var summaryUrl = me.NCBI_GENE_SUMMARY_URL + "&query_key=" + queryKey + "&WebEnv=" + webenv;
          $.ajax( summaryUrl )
          .done(function(sumData) {
              if (sumData.result == null || sumData.result.uids.length == 0) {
                if (sumData.esummaryresult && sumData.esummaryresult.length > 0) {
                  sumData.esummaryresult.forEach( function(message) {
                    console.log("Unable to get NCBI gene summary from eutils esummary")
                    console.log(message);
                  });
                }
                me.geneNCBISummaries[geneName] = unknownGeneInfo;
                resolve(unknownGeneInfo);

              } else {

                var uid = sumData.result.uids[0];
                var geneInfo = sumData.result[uid];

                me.geneNCBISummaries[geneName] = geneInfo;
                resolve(geneInfo)
              }
          })
          .fail(function() {
            console.log("Error occurred when making http request to NCBI eutils esummary for gene " + geneName);
            me.geneNCBISummaries[geneName] = unknownGeneInfo;
            resolve(unknownGeneInfo);
          })

        })
        .fail(function() {
          console.log("Error occurred when making http request to NCBI eutils esearch for gene " + geneName);
          me.geneNCBISummaries[geneName] = unknownGeneInfo;
          resolve(geneInfo);
        })
      }
    });

  }

  promiseGetPubMedEntries(theGeneName, options={retmax: 5, useCached: true}) {
    let me = this;
    return new Promise( function(resolve, reject) {

      let theEntry = me.genePubMedEntries[theGeneName];
      if (theEntry && options.useCached) {
        resolve(theEntry)
      }
      else {
        setTimeout(function() {
          let geneName = theGeneName;
          var pubMedEntries = [];
          var searchUrl = me.NCBI_PUBMED_SEARCH_URL  + "&term=" + geneName + "[title/abstract]";
          me.pendingNCBIRequests[geneName] = true;
  
          $.ajax( searchUrl )
           .done(function(data) {

              // Now that we have the gene ID, get the NCBI gene summary
              var webenv = data["esearchresult"]["webenv"];
              var queryKey = data["esearchresult"]["querykey"];
              var count = data["esearchresult"]["count"]
              var summaryUrl = me.NCBI_PUBMED_SUMMARY_URL + "&query_key=" + queryKey + "&WebEnv=" + webenv + "&retmax=" + options.retmax;
              $.ajax( summaryUrl )
              .done(function(sumData) {
                delete me.pendingNCBIRequests[geneName];
  
                if (sumData.result != null && sumData.result.uids && sumData.result.uids.length > 0) {
                  sumData.result.uids.forEach(function(uid) {
                    var entry = sumData.result[uid];
                    pubMedEntries.push({uid: uid, title: entry.title, firstAuthor: entry.sortfirstauthor, pubDate: entry.pubdate, source: entry.source})

                  })
                  let theEntry = {geneName: geneName, count: count, entries: pubMedEntries};
                  if (options.useCached) {
                    me.genePubMedEntries[geneName] = theEntry;
                  }
                  resolve(theEntry);
                } else {
                  let theEntry = {geneName: geneName, count: 0, entries: null}
                  if (options.useCached) {
                    me.genePubMedEntries[geneName] = theEntry;
                  }
                  resolve(theEntry)
                }
              })
             .fail(function(error) {
                delete me.pendingNCBIRequests[geneName];
                console.log("Error occurred when making http request to NCBI eutils esummary pubmed for gene " + geneName);

                let msg = "Unable to get PubMed entries for " + geneName;
                //alertify.alert("<div class='pb-2 dark-text-important'>" +  msg +  "</div>  <div class='pb-2' font-italic>Please email <a href='mailto: iobioproject@gmail.com'>iobioproject@gmail.com</a> for help resolving this issue.</div>")
                // .setHeader("Warning");
                console.log(msg);

                reject();
              })

           })
           .fail(function(error) {

              delete me.pendingNCBIRequests[geneName];
  
              let msg = "Unable to get PubMed entries for " + geneName;
              //alertify.alert("<div class='pb-2 dark-text-important'>" +  msg +  "</div>  <div class='pb-2' font-italic>Please email <a href='mailto: iobioproject@gmail.com'>iobioproject@gmail.com</a> for help resolving this issue.</div>")
              // .setHeader("Warning");
              console.log(msg);


              console.log("Error occurred when making http request to NCBI eutils esummary pubmed for gene " + geneName);
              reject();
           })

         }, 
         (Object.keys(me.pendingNCBIRequests).length > 0 ? 5000 : 3000));

      }
    })
  }

  promiseGetClinvarPhenotypes(cohortModel, geneObject, transcript) {
    let self = this;
    return new Promise(function(resolve, reject) {

      let theEntry = self.geneClinvarPhenotypes[geneObject.gene_name];
      if (theEntry) {
        resolve(theEntry)
      } else {
        let geneName = geneObject.gene_name;
        cohortModel.promiseGetClinvarPhenotypes(geneObject, transcript)
        .then(function(data) {
          self.geneClinvarPhenotypes[geneName] = data;
          resolve(data);
        })
        .catch(function(error) {
          reject(error)
        })
      }
    })
  }




  promiseGetOMIMEntries(theGeneName) {
    let self = this;
    return new Promise(function(resolve, reject) {

      let theEntry = self.geneOMIMEntries[theGeneName];
      if (theEntry) {
        resolve(theEntry)
      } else {
        let geneName = theGeneName;
        self._promiseGetOMIMGene(geneName)
        .then(function(data) {
          if (data.phenotypes && data.phenotypes.length > 0) {
            let promises = [];
            let omimEntries = [];
            data.phenotypes.forEach(function(phenotype) {
              let p = self._promiseGetOMIMClinicalSynopsis(data.geneName, phenotype)
              .then(function(data) {
                omimEntries.push(data);
              })      
              promises.push(p)      
            })
            Promise.all(promises)
            .then(function() {
              let theEntry = {geneName: geneName, omimEntries: omimEntries};
              self.geneOMIMEntries[geneName] = theEntry;
              resolve(theEntry)
            })
          } else {
            let theEntry = {geneName: geneName, omimEntries: null};
            self.geneOMIMEntries[geneName] = theEntry;
            resolve(theEntry)
          }
        })
        .catch(function(error) {
          reject(error)
        })

      }

    })

  }

  _promiseGetOMIMGene(geneName) {
    let self = this;
    return new Promise(function(resolve, reject) {
      let apiKey = process.env.OMIM_API_KEY;

      if (apiKey == null || apiKey == "") {
        if (!self.warnedMissingOMIMApiKey) {
          alertify.alert("Warning", "Unable to access OMIM.  API key is required in env.")
          self.warnedMissingOMIMApiKey = true;          
        }
        resolve();
      } else {
        let url = self.OMIM_URL  + 'entry/search'
          + '?apiKey=' + apiKey
          + '&search=approved_gene_symbol:' + geneName
          + '&format=json'
          + '&retrieve=geneMap'
          + '&start=0'
          + '&limit=10';

        $.ajax( url )
          .done(function(data) {
              let mimNumber = null;
              let phenotypes = null;
              if (data 
                && data.omim.searchResponse 
                && data.omim.searchResponse.geneMapList 
                && data.omim.searchResponse.geneMapList.length > 0) {
              let geneMap = data.omim.searchResponse.geneMapList[0].geneMap;
              mimNumber = geneMap.mimNumber;
              if (geneMap.phenotypeMapList) {
                phenotypes = geneMap.phenotypeMapList.map(function(entry) {
                  return entry.phenotypeMap;
                })
              }
              resolve({geneName: geneName, mimNumber: mimNumber, phenotypes: phenotypes});
            }
          })
          .fail(function(error) {
              let msg = "Unable to get phenotype mim number OMIM " + url;
              console.log(msg);
              console.log(error)
              reject(msg + '. Error: ' + error);
          })
        
      }

    })
  }

  _promiseGetOMIMClinicalSynopsis(geneName, phenotype) {
    let self = this;
    return new Promise(function(resolve, reject) {
      let apiKey = process.env.OMIM_API_KEY;

      let url = self.OMIM_URL  + 'clinicalSynopsis'
        + '?apiKey=' + apiKey
        + '&mimNumber=' + phenotype.phenotypeMimNumber
        + '&include=clinicalSynopsis'
        + '&format=json';

      $.ajax( url )
        .done(function(data) {
          let clinicalSynopsis = null;
          if (data && data.omim.clinicalSynopsisList && data.omim.clinicalSynopsisList.length > 0) {
            clinicalSynopsis = data.omim.clinicalSynopsisList[0].clinicalSynopsis;
          } 
          resolve({geneName: geneName, phenotype: phenotype, clinicalSynopsis: clinicalSynopsis});
        })
        .fail(function(error) {
            let msg = "Unable to get clinical synopsisi from OMIM " + url;
            console.log(msg);
            console.log(error)
            reject(msg + '. Error: ' + error);
        })
    })
  }


  _setTranscriptExonNumbers(transcript, sortedExons) {
    // Set the exon number on each UTR and CDS within the corresponding exon
    transcript.features.forEach(function(feature) {
      if (feature.feature_type.toUpperCase() == 'CDS' || feature.feature_type.toUpperCase() == 'UTR') {
        sortedExons.forEach(function(exon) {
          if (feature.start >= exon.start && feature.end <= exon.end) {
            feature.exon_number = exon.exon_number;
          }
        })
      }
    })
  }

  clearAllGenes() {
    this.promiseCopyPasteGenes("");
  }

  removeGene(geneName) {
    let self = this;

    var index = self.geneNames.indexOf(geneName);
    if (index >= 0) {
      self.geneNames.splice(index, 1);
    }

    index = self.sortedGeneNames.indexOf(geneName);
    if (index >= 0) {
      self.sortedGeneNames.splice(index, 1);
    }

    if (self.geneDangerSummaries && self.geneDangerSummaries.hasOwnProperty(geneName)) {
      delete self.geneDangerSummaries[geneName];
    }
      if (self.genePhenotypes && self.genePhenotypes.hasOwnProperty(geneName)) {
      delete self.genePhenotypes[geneName];
    }

    if (self.geneObjects && self.geneObjects.hasOwnProperty(geneName)) {
      delete self.geneObjects[geneName];
    }

    if (self.geneNCBISummaries && self.geneNCBISummaries.hasOwnProperty(geneName)) {
      delete self.geneNCBISummaries[geneName];
    }
    if (self.geneOMIMEntries && self.geneOMIMEntries.hasOwnProperty(geneName)) {
      delete self.geneOMIMEntries[geneName];
    }
    if (self.genePubMedEntries && self.genePubMedEntries.hasOwnProperty(geneName)) {
      delete self.genePubMedEntries[geneName];
    }
    if (self.geneToLatestTranscript && self.geneToLatestTranscript.hasOwnProperty(geneName)) {
      delete self.geneToLatestTranscript[geneName];
    }
    if (self.geneClinvarPhenotypes && self.geneClinvarPhenotypes.hasOwnProperty(geneName)) {
      delete self.geneClinvarPhenotypes[geneName];
    }
  }

  promiseGetGenePhenotypes(geneName) {
    var me = this;

    return new Promise( function(resolve, reject) {

      var phenotypes = me.genePhenotypes[geneName];
      if (phenotypes != null) {
        resolve([phenotypes, geneName]);
      } else {
        var url = me.globalApp.geneToPhenoServer + geneName;

        fetch(url).then(r => r.json())
        .then((response) => {
          var phenotypes = response.sort(function(a,b) {
            if (a.hpo_term_name < b.hpo_term_name) {
              return -1;
            } else if (a.hpo_term_name > b.hpo_term_name) {
              return 1;
            } else {
              return 0;
            }
          });
          me.genePhenotypes[geneName] = phenotypes;

          resolve([response, geneName]);
        })
        .catch((e) => {
          console.error(e);
          reject("unable to get phenotypes for gene " + geneName);
        });
      }
    });
  }



  promiseGetCachedGeneObject(geneName, resolveOnError=false) {
    var me = this;
    return new Promise( function(resolve, reject) {
      let theGeneName = geneName;
      var theGeneObject = me.geneObjects[theGeneName];
      if (theGeneObject) {
        resolve(theGeneObject);
      } else {
        me.promiseGetGeneObject(theGeneName).then(function(geneObject) {
          resolve(geneObject);
        })
        .catch(function(error) {
          if (resolveOnError) {
            resolve({notFound: theGeneName});
          } else {
            reject(error);
          }
        });
      }

    });
  }


  promiseGetGeneObject(geneName) {
    var me = this;
    return new Promise(function(resolve, reject) {

      var url = me.globalApp.geneInfoServer + geneName;

      // If current build not specified, default to GRCh37
      var buildName = me.genomeBuildHelper.getCurrentBuildName() ? me.genomeBuildHelper.getCurrentBuildName() : "GRCh37";
      $('#build-link').text(buildName);

      var defaultGeneSource = me.geneSource ? me.geneSource : 'gencode';
      let knownGene = me.getKnownGene(geneName);
      let theGeneSource = null;
      if (knownGene && knownGene[defaultGeneSource]) {
        theGeneSource = defaultGeneSource
      } else if (knownGene && knownGene.refseq) {
        theGeneSource = 'refseq';
      } else if (knownGene && knownGene.gencode) {
        theGeneSource == 'gencode';
      }

      if (theGeneSource) {
        url += "?source="  + theGeneSource;
        url += "&species=" + me.genomeBuildHelper.getCurrentSpeciesLatinName();
        url += "&build="   + buildName;


        fetch(url).then(r => r.json())
        .then((response) => {
          if (response.length > 0 && response[0].hasOwnProperty('gene_name')) {
            var theGeneObject = response[0];
            me.geneObjects[theGeneObject.gene_name] = theGeneObject;
            resolve(theGeneObject);
          } else {
            let msg = "Gene model for " + geneName + " not found.  Empty results returned from " + url;
            console.log(msg);
            reject(msg);
          }
        })
        .catch((errorThrown) => {
          console.log("Gene model for " +  geneName + " not found.  Error occurred.");
          console.log( "Error: " + errorThrown );
          reject("Error " + errorThrown + " occurred when attempting to get gene model for gene " + geneName);
        });

      } else {
        reject("No known gene source for gene " + geneName);
      }



    });
  }


  promiseGetGeneForVariant(variant) {
    var me = this;
    return new Promise(function(resolve, reject) {

      var url = me.globalApp.geneInfoServer + 'api/region/' + variant.chrom + ":" + variant.start + "-" + variant.start;

      // If current build not specified, default to GRCh37
      var buildName = me.genomeBuildHelper.getCurrentBuildName() ? me.genomeBuildHelper.getCurrentBuildName() : "GRCh37";


      var defaultGeneSource = me.geneSource ? me.geneSource : 'gencode';


      if (defaultGeneSource) {
        url += "?source="  + defaultGeneSource;
        url += "&species=" + me.genomeBuildHelper.getCurrentSpeciesLatinName();
        url += "&build="   + buildName;
        url += "&bound=inner"


        $.ajax({
          url: url,
          jsonp: "callback",
          type: "GET",
          dataType: "json",
          success: function( response ) {
            if (response.length > 0 && response[0].hasOwnProperty('gene_name')) {
              var theGeneObject = response[0];
              me.geneObjects[theGeneObject.gene_name] = theGeneObject;
              resolve({'gene': theGeneObject, 'variant': variant});
            } else {
              let msg = "Gene model for region " + variant.chrom + ":" + variant.start + " not found.  Empty results returned from " + url;
              console.log(msg);
              reject(msg);
            }
          },
          error: function( xhr, status, errorThrown ) {

            console.log("Gene model for region " + variant.chrom + ":" + variant.start + " not found.  Error occurred.");
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.log( xhr );
            reject("Error " + errorThrown + " occurred when attempting to get gene for region " +  variant.chrom + ":" + variant.start);

          }
        });

      } else {
        reject("No known gene source");
      }



    });
  }

  searchPhenolyzerGenes(phenotypeTerm, selectGeneCount, statusCallback) {
    var me = this;

    var url = me.phenolyzerServer + '?term=' + phenotypeTerm;
    var status = null;

    $.ajax({
      url: url,
      type: "GET",
      dataType: "json",
      success: function( data ) {
      if (data == "") {
      } else if (data.record == 'queued') {
        if (statusCallback) {
          statusCallback({status:'queued', 'phenotypeTerm': phenotypeTerm});
        }
        setTimeout(function() {
            me.searchPhenolyzerGenes(phenotypeTerm, selectGeneCount, statusCallback);
          }, 5000);
      } else if (data.record == 'pending') {
        if (statusCallback) {
          statusCallback({status:'running', 'phenotypeTerm': phenotypeTerm});
        }
        setTimeout(function() {
            me.searchPhenolyzerGenes(phenotypeTerm, selectGeneCount, statusCallback);
          }, 5000);
      } else {
        me.parsePhenolyzerGenes(data.record, selectGeneCount, me.NUMBER_PHENOLYZER_GENES);
        if (statusCallback) {
          me.setGenePhenotypeHitsFromPhenolyzer(phenotypeTerm, me.phenolyzerGenes);
          statusCallback({status:'done', 'phenotypeTerm': phenotypeTerm, 'genes': me.phenolyzerGenes});
        }

      }

      },
      fail: function() {
        alert("An error occurred in Phenolyzer iobio services. " + thrownError);
        if (statusCallback) {
          me.setGenePhenotypeHitsFromPhenolyzer(phenotypeTerm, null);
          statusCallback({status:'error', error: thrownError})
        }
      }
    });

  }

  parsePhenolyzerGenes(data, selectGeneCount, numberPhenolyzerGenes) {
    var me = this;
    var count = 0;
    me.phenolyzerGenes = [];
    data.split("\n").forEach( function(rec) {
      var fields = rec.split("\t");
      if (fields.length > 2 && fields[1]!=="Gene") {
        var geneName               = fields[1];
        if (count < numberPhenolyzerGenes) {
          var rank                 = fields[0];
          var score                = fields[3];
          var haploInsuffScore     = fields[5];
          var geneIntoleranceScore = fields[6];
          var selected             = count < selectGeneCount ? true : false;
          me.phenolyzerGenes.push({rank: rank, geneName: geneName, score: score, haploInsuffScore: haploInsuffScore, geneIntoleranceScore: geneIntoleranceScore, selected: selected});
        }
        count++;

      }
    });

  }

  promiseGetLinks(geneName) {
    let me = this;

    return new Promise(function(resolve, reject) {
      let links = [];

      var geneCoord = null;
      var geneObject = me.geneObjects[geneName];
      if (geneObject) {
        geneCoord = geneObject.chr + ":" + geneObject.start + "-" + geneObject.end;
      }
      me.promiseGetNCBIGeneSummary(geneName)
      .then(function() {
        var buildAliasUCSC = me.genomeBuildHelper.getBuildAlias('UCSC');

        var geneUID = null;
        var ncbiInfo = me.geneNCBISummaries[geneName];
        if (ncbiInfo) {
          geneUID = ncbiInfo.uid;
        }
        for (var linkName in me.linkTemplates) {
          var theLink = $.extend({}, me.linkTemplates[linkName]);
          theLink.name = linkName;
          if (geneUID) {
            theLink.url = theLink.url.replace(/GENEUID/g, geneUID );
          }
          if (geneObject) {
            theLink.url = theLink.url.replace(/GENESYMBOL/g, geneName);
          }
          if (geneCoord) {
            theLink.url = theLink.url.replace(/GENECOORD/g, geneCoord);
          }
          if (buildAliasUCSC) {
            theLink.url = theLink.url.replace(/GENOMEBUILD-ALIAS-UCSC/g, buildAliasUCSC);
          }
          links.push(theLink);
        }
        resolve(links)


      })
      .catch(function(error) {
        reject(error)
      })

    })
  }

  getVariantLinks(geneName, variant) {

    let me = this;
    let variantLinks = [];

    var variantCoordUCSC = null;
    var variantCoordVarSome = null;
    var variantCoordGNomAD
    var geneObject = me.geneObjects[geneName];

    var buildAliasUCSC = me.genomeBuildHelper.getBuildAlias('UCSC');

    if (geneObject) {
      variantCoordUCSC    = geneObject.chr + ":" + variant.start + "-" + variant.end;

      if (variant.alt.length > variant.ref.length && variant.ref.length == 1) {
        // ins
        variantCoordVarSome = geneObject.chr + "-" + (variant.start+1) + "-"  + '-' + variant.alt.substr(1);
      } else if (variant.ref.length > variant.alt.length && variant.alt.length == 1) {
        // del
        variantCoordVarSome = geneObject.chr + "-" + (variant.start+1) + "-"  + variant.ref.substr(1) ;
      } else if (variant.ref.length == variant.alt.length) {
        // snp
        variantCoordVarSome = geneObject.chr + "-" + variant.start + "-" + variant.ref + '-' + variant.alt;
      } else {
        // complex - just show varsome = at given loci
        variantCoordVarSome = geneObject.chr + "-" + variant.start
      }

      variantCoordGNomAD  = me.globalApp.utility.stripRefName(geneObject.chr) + "-" + variant.start + "-" + variant.ref + '-' + variant.alt;
    }

    var info = me.globalApp.utility.formatDisplay(variant, me.translator, false);


    for (var linkName in me.variantLinkTemplates) {
      var theLink = $.extend({}, me.variantLinkTemplates[linkName]);
      theLink.name = linkName;

      if (variantCoordGNomAD) {
        theLink.url = theLink.url.replace(/VARIANTCOORD-GNOMAD/g, variantCoordGNomAD);
      }
      if (variantCoordUCSC) {
        theLink.url = theLink.url.replace(/VARIANTCOORD-UCSC/g, variantCoordUCSC);
      }
      if (variantCoordVarSome) {
        theLink.url = theLink.url.replace(/VARIANTCOORD-VARSOME/g, variantCoordVarSome);
      }
      if (buildAliasUCSC) {
        theLink.url = theLink.url.replace(/GENOMEBUILD-ALIAS-UCSC/g, buildAliasUCSC);
      }
      if (info && info.rsId &&  info.rsId.length > 0) {
        theLink.url = theLink.url.replace(/VARIANT-RSID/g, info.rsId);
      }
      if (variant.clinvarUid) {
        theLink.url = theLink.url.replace(/VARIANT-CLINVAR-UID/g, variant.clinvarUid);
      }
      var keep = false;

      if (linkName == 'gnomad') {
        if (variant.vepAf && variant.vepAf.gnomAD && variant.vepAf.gnomAD.AF && variant.vepAf.gnomAD.AF != ".") {
          keep = true;
        }
      } else if (linkName == 'dbsnp') {
        if (info && info.rsId &&  info.rsId.length > 0) {
          keep = true;
        }
      } else if (linkName == 'clinvar') {
        if (variant.clinvarUid && variant.clinvarUid.length > 0) {
          keep = true;
        }
      } else {
        keep = true;
      }
      if (keep) {
        variantLinks.push(theLink);
      }
    }

    return variantLinks;

  }


  isKnownGene(geneName) {
    return this.allKnownGeneNames[geneName] != null || this.allKnownGeneNames[geneName.toUpperCase()] != null;
  }

  promiseIsValidGene(geneName) {
    let self = this;
    return new Promise(function(resolve, reject) {
      if (self.isKnownGene(geneName)) {
        self.promiseGetGeneObject(geneName)
        .then(function() {
          resolve(true);
        })
        .catch(function(error) {
          resolve(false);
        })
      } else {
        resolve(false);
      }
    })
  }

  getKnownGene(geneName) {
    if (this.allKnownGeneNames[geneName]) {
      return this.allKnownGeneNames[geneName];
    } else {
      return this.allKnownGeneNames[geneName.toUpperCase()]
    };
  }


  adjustGeneRegion(geneObject) {
    let me = this;
    if (geneObject.startOrig == null) {
      geneObject.startOrig = geneObject.start;
    }
    if (geneObject.endOrig == null) {
      geneObject.endOrig = geneObject.end;
    }
    // Open up gene region to include upstream and downstream region;
    geneObject.start = geneObject.startOrig < me.geneRegionBuffer ? 0 : geneObject.startOrig - me.geneRegionBuffer;
    // TODO: Don't go past length of reference
    geneObject.end   = geneObject.endOrig + me.geneRegionBuffer;

  }

  getLatestGeneTranscript(geneName) {
    return this.geneToLatestTranscript[geneName];
  }

  setLatestGeneTranscript(geneName, transcript) {
    this.geneToLatestTranscript[geneName] = transcript;
  }

  sortGenes(sortBy) {
    var me = this;

    me.sortedGeneNames = null;


    if (sortBy.indexOf("gene name") >= 0) {
      me.sortedGeneNames = me.geneNames.slice().sort();
    } else if (sortBy.indexOf("harmful variant") >= 0 || sortBy.indexOf("danger summary") >= 0) {
      me.sortedGeneNames = me.geneNames.slice().sort( function(a,b) {
        return me.compareDangerSummary(a,b);
      });
    } else if (sortBy.indexOf("coverage") >= 0) {
      me.sortedGeneNames = me.geneNames.slice().sort( function(a,b) {
        return me.compareDangerSummaryByLowCoverage(a,b);
      });
    } else if (sortBy.indexOf("original") >= 0) {
      me.sortedGeneNames = me.geneNames.slice();
    }

  }

  compareDangerSummary(geneName1, geneName2) {
    var me = this;

    var danger1 = me.geneDangerSummaries[geneName1];
    var danger2 = me.geneDangerSummaries[geneName2];

    var value = me.compareDangerSummaryObjects(danger1, danger2);
    if (value == 0) {
      if (geneName1 < geneName2) {
        value = -1;
      } else if (geneName2 < geneName1) {
        value = 1;
      }
    }
    return value;
  }

  compareDangerSummaryObjects(danger1, danger2) {
    var me = this;
    if (danger1 == null && danger2 == null) {
      return 0;
    } else if (danger2 == null) {
      return -1;
    } else if (danger1 == null) {
      return 1;
    }

    var dangers = [danger1, danger2];


    // clinvar badges
    if (danger1.badges.pathogenic.length !== danger2.badges.pathogenic.length) {
      return danger2.badges.pathogenic.length -  danger1.badges.pathogenic.length;
    }

    // inheritance badges
    if (danger1.badges.recessive.length !== danger2.badges.recessive.length) {
      return danger2.badges.recessive.length -  danger1.badges.recessive.length;
    }
    if (danger1.badges.denovo.length !== danger2.badges.denovo.length) {
      return danger2.badges.denovo.length -  danger1.badges.denovo.length;
    }

    // high or moderate badge
    if (danger1.badges.high && danger2.badges.high) {
      if (danger1.badges.high.length !== danger2.badges.high.length) {
        return danger2.badges.high.length -  danger1.badges.high.length;
      }
    }


    // lowest clinvar value = highest relevance
    var clinvarValues = [9999, 9999];
    dangers.forEach(function(danger, index) {
      if (danger.CLINVAR) {
        for (var key in danger.CLINVAR) {
          var showBadge = me.translator.clinvarMap[key].badge;
          if (showBadge) {
            clinvarValues[index] = danger.CLINVAR[key].value;
          }
        }
      }
    });
    if (clinvarValues[0] !== clinvarValues[1]) {
      return clinvarValues[0] - clinvarValues[1];
    }

    // lowest impact value = highest relevance
    var impactValues = [9999, 9999];
    dangers.forEach(function(danger, index) {
      if (danger.IMPACT) {
        for (var key in danger.IMPACT) {
          impactValues[index] = me.translator.impactMap[key].value;
        }
      }
    });
    if (impactValues[0] !== impactValues[1]) {
      return impactValues[0] - impactValues[1];
    }

    /*
    // FIXME: Can't compare allele frequencies because it would be lowest for all variants, not
    // a particular variant

    // lowest allele frequency = highest relevance
    var afValues = [9999,9999];
    dangers.forEach(function(danger, index) {
      if (danger.AF && Object.keys(danger.AF).length > 0) {
        var clazz   = Object.keys(danger.AF)[0];
        var afValue  = danger.AF[clazz].value;
        afValues[index] = afValue;
      }
    });
    if (afValues[0] !== afValues[1]) {
      return afValues[0] - afValues[1];
    }
    */

    return 0;
  }

  compareDangerSummaryOld(geneName1, geneName2) {
    var me = this;

    var danger1 = me.geneDangerSummaries[geneName1];
    var danger2 = me.geneDangerSummaries[geneName2];

    if (danger1 == null && danger2 == null) {
      return 0;
    } else if (danger2 == null) {
      return -1;
    } else if (danger1 == null) {
      return 1;
    }

    var dangers = [danger1, danger2];


    // lowests (non-zero) harmful variant level  = highest relevance
    var harmfulVariantValues = [9999, 9999];
    dangers.forEach(function(danger, index) {
      if (danger.harmfulVariantsLevel) {
        harmfulVariantValues[index] = danger.harmfulVariantsLevel;
      }
    });
    if (harmfulVariantValues[0] !== harmfulVariantValues[1]) {
      return harmfulVariantValues[0] - harmfulVariantValues[1];
    }

    // lowest clinvar value = highest relevance
    var clinvarValues = [9999, 9999];
    dangers.forEach(function(danger, index) {
      if (danger.CLINVAR) {
        for (var key in danger.CLINVAR) {
          var showBadge = me.translator.clinvarMap[key].badge;
          if (showBadge) {
            clinvarValues[index] = danger.CLINVAR[key].value;
          }
        }
      }
    });
    if (clinvarValues[0] !== clinvarValues[1]) {
      return clinvarValues[0] - clinvarValues[1];
    }

    // sift
    var siftValues = [9999, 9999];
    dangers.forEach(function(danger, index) {
      if (danger.SIFT) {
        for (var key in danger.SIFT) {
          var siftClass = Object.keys(danger.SIFT[key])[0];
          var showBadge = me.translator.siftMap[siftClass].badge;
          if (showBadge) {
            siftValues[index] = me.translator.siftMap[siftClass].value;
          }
        }
      }
    });
    if (siftValues[0] !== siftValues[1]) {
      return siftValues[0] - siftValues[1];
    }

    // polyphen
    var polyphenValues = [9999, 9999];
    dangers.forEach(function(danger, index) {
      if (danger.POLYPHEN) {
        for (var key in danger.POLYPHEN) {
          var polyphenClass = Object.keys(danger.POLYPHEN[key])[0];
          var showBadge = me.translator.polyphenMap[polyphenClass].badge;
          if (showBadge) {
            polyphenValues[index] = me.translator.polyphenMap[polyphenClass].value;
          }
        }
      }
    });
    if (polyphenValues[0] !== polyphenValues[1]) {
      return polyphenValues[0] - polyphenValues[1];
    }

    // lowest impact value = highest relevance
    var impactValues = [9999, 9999];
    dangers.forEach(function(danger, index) {
      if (danger.IMPACT) {
        for (var key in danger.IMPACT) {
          impactValues[index] = me.translator.impactMap[key].value;
        }
      }
    });
    if (impactValues[0] !== impactValues[1]) {
      return impactValues[0] - impactValues[1];
    }

    // lowest allele frequency = highest relevance
    var afValues = [9999,9999];
    dangers.forEach(function(danger, index) {
      if (danger.AF && Object.keys(danger.AF).length > 0) {
        var clazz   = Object.keys(danger.AF)[0];
        var afValue  = danger.AF[clazz].value;
        afValues[index] = afValue;
      }
    });
    if (afValues[0] !== afValues[1]) {
      return afValues[0] - afValues[1];
    }



    if (geneName1 < geneName2) {
      return -1;
    } else if (geneName2 < geneName1) {
      return 1;
    }
    return 0;
  }


  compareDangerSummaryByLowCoverage(geneName1, geneName2) {
    var me = this;

    var danger1 = me.geneDangerSummaries[geneName1];
    var danger2 = me.geneDangerSummaries[geneName2];


    if (danger1 == null && danger2 == null) {
      return 0;
    } else if (danger2 == null) {
      return -1;
    } else if (danger1 == null) {
      return 1;
    }

    geneCoverageProblem1 = danger1.geneCoverageProblem ? danger1.geneCoverageProblem : false;
    geneCoverageProblem2 = danger2.geneCoverageProblem ? danger2.geneCoverageProblem : false;


    if (geneCoverageProblem1 == geneCoverageProblem2) {
      if (geneName1 < geneName2) {
        return -1;
      } else if (geneName2 < geneName1) {
        return 1;
      } else {
        return 0;
      }
    } else if (geneCoverageProblem1) {
      return -1;
    } else if (geneCoverageProblem2) {
      return 1;
    }

  }
  
  setSourceForGenes(genes, source) {
    let self = this;
    let sourceIndicatorMap = {
      "imported_gene": 1,
      "phenotype_gene_list": 2
    }
    let sourceMap = {
      "imported_gene": "Variant is a member of an imported set of potentially interesting variants",
      "phenotype_gene_list": "Variant is in a gene associated with the patient's clinical note"
    }
    let sourceGeneTabMap = {
      "imported_gene": "Genes contains an imported potentially interesting variant",
      "phenotype_gene_list": "Gene is associated with the patient's clinical note"
    }
    genes.forEach(gene => {
      if(self.genesAssociatedWithSource[gene] === undefined){
        self.genesAssociatedWithSource[gene] = {
          "source": [sourceMap[source]],
          "sourceIndicator": [sourceIndicatorMap[source]],
          "source_gene_tab": [sourceGeneTabMap[source]],
        }
      }
      else {
        if(!self.genesAssociatedWithSource[gene].source.includes(sourceMap[source])){
          self.genesAssociatedWithSource[gene].source.push(sourceMap[source])
          self.genesAssociatedWithSource[gene].sourceIndicator.push(sourceIndicatorMap[source])
          self.genesAssociatedWithSource[gene].source_gene_tab.push(sourceGeneTabMap[source])
        }
      }
    })
  }
  
  getSourceForGenes() {
    let self = this;
    return self.genesAssociatedWithSource;
  }

}



export default GeneModel
