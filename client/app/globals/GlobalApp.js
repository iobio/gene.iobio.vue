/*  These app.global variables determine which iobio servers the gene.iobio app with interact
    with for a local deployment.  This entire .js can be replaced or modified to suit the
    specific iobio deployment environment.
*/
class GlobalApp {
  constructor() {

    this.cacheHelper           = null;
    this.tour                  = "";
    this.completedTour         = "";


    this.version               = "4.5.1a";

    this.GREEN_IOBIO           = "nv-green.iobio.io/";  // Must always stay at green to accommodate VEP service

    this.DEFAULT_IOBIO_BACKEND  = "backend.iobio.io"
    this.launchedFromUtahMosaic = false;
    this.IOBIO_SERVICES         = null;
    this.HTTP_SERVICES          = null;

    this.isClinvarOffline      = false;          // is clinvar offline?  (Pull from clinvar hosted from URL?)
    this.accessNCBIGeneSummary = true;           // is it okay to access NCBI web resources to obtain the refseq gene summary?  In cases where the server and client are COMPLETELY offline, set this to false.

    this.useOnDemand           = true;           // use on demand tabix and samtools

    this.useSSL                = true;
    this.useServerCache        = false;

    this.emailServer           = null;
    this.hpoLookupUrl          = null;

    this.geneInfoServer        = null;
    this.geneToPhenoServer     = null;
    this.genomeBuildServer     = null;
    this.phenolyzerOnlyServer  = null;

    this.isDirty               = false;


    // config files
    this.siteConfigUrl         =  { 'prod': "https://s3.amazonaws.com/gene.iobio.config/site-config.json",
                                    'dev': "https://s3.amazonaws.com/gene.iobio.config/site-config-dev.json" };
    this.clinvarGenesUrl       =  "https://s3.amazonaws.com/gene.iobio.config/clinvar-counts.txt";

    // Get clinvar annotations from 'eutils' or 'vcf'
    this.clinvarSource         = "vcf";

    // get hgvs, rsid annotation for all variants
    this.getVariantIdsForGene = false;

    // get gnomad extra info (on demand)
    this.gnomADExtra          = true;
    // get gnomad extra info for all variants
    this.gnomADExtraAll       = true;

    // how should we get the gnomad extra info?  'bcftools' or 'vepcustom'
    this.GNOMAD_METHOD_BCFTOOLS   = "gnomad_bcftools";
    this.GNOMAD_METHOD_CUSTOM_VEP = "gnomad_custom_vep";
    this.gnomADExtraMethod        = this.GNOMAD_METHOD_BCFTOOLS;


    // How many genes can be analyzed in one session.  Set to null if no limitation.
    this.maxGeneCount         = null;

    // Should vep retrieve allele frequencies (for gnomad exomes)
    this.vepAF                = true ;

    // What browser cache implementation is used: 'localStorage' or 'indexedDB'
    this.BROWSER_CACHE_LOCAL_STORAGE = 'localStorage';
    this.BROWSER_CACHE_INDEXED_DB    = 'indexedDB';
    this.defaultBrowserCache         = this.BROWSER_CACHE_INDEXED_DB;

    this.BROWSER_CACHE_EXPIRATION    = 3 * 60 * 60 * 1000;  // 3 HOURS


    this.feedbackEmails              = "gene.iobio.feedback@gmail.com";  // what emails should feedback be sent to?   if no emails are provided, the feedback link will be hidden
    this.feedbackAttachScreenCapture = false;          // should the feedback include a screen capture?
    this.feedbackShowURL             = false;         // show the feedback email show the URL that launched gene.iobio?

    this.autocall                    = null       // If only alignments provided, should variants be automatically called when gene is selected?


    this.DEFAULT_BATCH_SIZE          = 10;         // how many genes can be analyzed simultaneously for 'Analyze all'
    this.ignoreAlignments            = false;     // By pass any processing of aligments?

    this.keepLocalStorage            = false; // maintain cache between sessions?
    this.eduModeVariantSize          = 15;

    // Fields
    this.impactFieldToFilter         = 'highestImpactVep';
    this.impactFieldToColor          = 'vepImpact';

    this.gnomADRenameChr = {
       genomes: {
        'GRCh37': {'none': null,     
                   'chr':  'removeChr'},
        'GRCh38': {'none': 'addChr', 
                   'chr':  null}
      },
      exomes: {
        'GRCh37': {'none': null,     
                   'chr':  'removeChr'},
        'GRCh38': {'none': null, 
                   'chr':  'removeChr'}
      }
    }

  }

  initBackendSource(iobioSource) {
      this.IOBIO_SERVICES = (this.useSSL ? "https://" : "http://") + iobioSource + "/";
      this.HTTP_SERVICES  = (this.useSSL ? "https://" : "http://") + iobioSource + "/";;
      if (this.IOBIO_SERVICES.indexOf('mosaic.chpc.utah.edu') >= 0) {
        this.launchedFromUtahMosaic = true;
      }

      // !!!!!
      // TEMPORARY WORKAROUND - POINT HTTP SERVICES TO backend.iobio.io
      //
      this.HTTP_SERVICES  = (this.useSSL ? "https://" : "http://") + "backend.iobio.io" + "/";;


      this.geneInfoServer            = this.HTTP_SERVICES + "geneinfo/";

      this.geneToPhenoServer         = this.HTTP_SERVICES + "gene2pheno/";
      this.phenolyzerOnlyServer      = this.HTTP_SERVICES + "phenolyzer/";
      this.genomeBuildServer         = this.HTTP_SERVICES + "genomebuild/"
      this.hpoLookupUrl              = this.HTTP_SERVICES + "hpo/hot/lookup/?term=";



      this.emailServer           = (this.useSSL ? "wss://" : "ws://") +   iobioSource + "email/";
  }

  initServices(useMosaicBackend) {

    if (process.env.USE_SSL) {
      this.useSSL = process.env.USE_SSL === 'true' ? true : false;
    }

    // These are the public services.
    if (useMosaicBackend && process.env.IOBIO_BACKEND_MOSAIC ) {
      this.initBackendSource(process.env.IOBIO_BACKEND_MOSAIC)
    } else if (process.env.IOBIO_BACKEND) {
      this.initBackendSource(process.env.IOBIO_BACKEND)
    } else {
      console.log("No backend specified")
    }

  }

  getCloseMessage() {
    if (this.isDirty) {
      return "Unsaved work. Do you really want to close?";
    } else {
      return null;
    }
  }

  getClinvarUrl(build) {
    return this.IOBIO_SERVICES + 'static/clinvar/' + build + '/clinvar.vcf.gz';
  }

  getRevelUrl(build) {
    return './vep-cache/' + build + '_revel_all_chromosomes_for_vep.tsv.gz';
  }


  getGnomADUrl(build, chrom, sequencingScope="genomes", isSecure=true) {
    let prot = isSecure ? 'https' : 'http';
    var gnomADSource = {
      genomes: {
        'GRCh37': prot + '://gnomad-public-us-east-1.s3.amazonaws.com/release/2.1.1/vcf/genomes/gnomad.genomes.r2.1.1.sites.CHROM-ALIAS.vcf.bgz',
        'GRCh38': prot + '://gnomad-public-us-east-1.s3.amazonaws.com/release/3.1/vcf/genomes/gnomad.genomes.v3.1.sites.chrCHROM-ALIAS.vcf.bgz'
      },
      exomes: {
        'GRCh37': prot + '://gnomad-public-us-east-1.s3.amazonaws.com/release/2.1.1/vcf/exomes/gnomad.exomes.r2.1.1.sites.CHROM-ALIAS.vcf.bgz',
        'GRCh38': prot + '://gnomad-public-us-east-1.s3.amazonaws.com/release/2.1.1/liftover_grch38/vcf/exomes/gnomad.exomes.r2.1.1.sites.CHROM-ALIAS.liftover_grch38.vcf.bgz'
      }
    }
    var theUrl = gnomADSource[sequencingScope][build];
    theUrl = theUrl.replace(/CHROM-ALIAS/g, chrom);
    return theUrl;
  }

  getGnomADSourceName(build, chrom, sequencingScope="genomes", isSecure=true) {
    let prot = isSecure ? 'https' : 'http';
    var gnomADSource = {
      genomes: {
        'GRCh37': 'v2.1',
        'GRCh38': 'v3.1'
      },
      exomes: {
        'GRCh37': 'v2.1',
        'GRCh38': 'v2.1 liftover'
      }
    }
    var theUrl = gnomADSource[sequencingScope][build];
    theUrl = theUrl.replace(/CHROM-ALIAS/g, chrom);
    return theUrl;
  }

  
  getGnomADFields(build, sequencingScope="genomes") {
    var gnomADFields = {
      genomes: {
        'GRCh37': 'AF,AN,AC,nhomalt_raw,AF_popmax,AC_fin,AC_nfe,AC_oth,AC_amr,AC_afr,AC_asj,AC_eas,AC_sas,AN_fin,AN_nfe,AN_oth,AN_amr,AN_afr,AN_asj,AN_eas,AN_sas',
        'GRCh38': 'AF,AN,AC,nhomalt-raw,AF_popmax,faf95_popmax,AC_fin,AC_nfe,AC_oth,AC_amr,AC_afr,AC_asj,AC_eas,AC_sas,AN_fin,AN_nfe,AN_oth,AN_amr,AN_afr,AN_asj,AN_eas,AN_sas'
      },
      exomes: {
        'GRCh37': 'AF,AN,AC,nhomalt_raw,AF_popmax,AC_fin,AC_nfe,AC_oth,AC_amr,AC_afr,AC_asj,AC_eas,AC_sas,AN_fin,AN_nfe,AN_oth,AN_amr,AN_afr,AN_asj,AN_eas,AN_sas',
        'GRCh38': 'AF,AN,AC,nhomalt_raw,AF_popmax,AF_fin,AC_fin,AC_nfe,AC_oth,AC_amr,AC_afr,AC_asj,AC_eas,AC_sas,AN_fin,AN_nfe,AN_oth,AN_amr,AN_afr,AN_asj,AN_eas,AN_sas'
      }
    }
    return gnomADFields[sequencingScope][build];
  }

  getGnomADRenameChr(build, sequencingScope="genomes", refName) {
    let self = this;
    let renameCommand = null;
    let prefix = refName.indexOf('chr') == 0 ? 'chr' : 'none';
    
    let action = self.gnomADRenameChr[sequencingScope][build][prefix];
    if (action && action == 'addChr') {
      renameCommand = refName + " chr" + refName;
    } else if (action && action == "removeChr") {
      renameCommand = refName + " " + self.utility.stripRefName(refName)
    }
    return renameCommand
  }

  getGnomADRefName(build, sequencingScope="genomes", refName) {
    let self = this;
    let renameCommand = null;
    let prefix = refName.indexOf('chr') == 0 ? 'chr' : 'none';
    
    let action = self.gnomADRenameChr[sequencingScope][build][prefix];
    if (action && action == 'addChr') {
      return "chr" + refName;
    } else if (action && action == "removeChr") {
     return self.utility.stripRefName(refName)
    } else {
      return refName;
    }
  }

  getGnomADHeader() {

    var hdrRecs = [
      "##INFO=<ID=AC,Number=A,Type=Integer,Description=\"Alternate allele count for samples\">",
      "##INFO=<ID=AN,Number=1,Type=Integer,Description=\"Total number of alleles in samples\">",
      "##INFO=<ID=AF,Number=A,Type=Float,Description=\"Alternate allele frequency in samples\">",
      "##INFO=<ID=nhomalt_raw,Number=A,Type=Integer,Description=\"Count of homozygous individuals in samples, before removing low-confidence genotypes\">",
      "##INFO=<ID=AF_popmax,Number=A,Type=Float,Description=\"Maximum allele frequency across populations (excluding samples of Ashkenazi, Finnish, and indeterminate ancestry)\">",
      "##INFO=<ID=AC_fin,Number=A,Type=Integer,Description=\"Alternate allele count for samples of Finnish ancestry\">",
      "##INFO=<ID=AN_fin,Number=1,Type=Integer,Description=\"Total number of alleles in samples of Finnish ancestry\">",
      "##INFO=<ID=AF_fin,Number=A,Type=Float,Description=\"Alternate allele frequency in samples of Finnish ancestry\">",
      "##INFO=<ID=AC_nfe,Number=A,Type=Integer,Description=\"Alternate allele count for samples of Non-Finnish European ancestry\">",
      "##INFO=<ID=AN_nfe,Number=1,Type=Integer,Description=\"Total number of alleles in samples of Non-Finnish European ancestry\">",
      "##INFO=<ID=AF_nfe,Number=A,Type=Float,Description=\"Alternate allele frequency in samples of Non-Finnish European ancestry\">",
      "##INFO=<ID=AC_oth,Number=A,Type=Integer,Description=\"Alternate allele count for samples of Other ancestry\">",
      "##INFO=<ID=AN_oth,Number=1,Type=Integer,Description=\"Total number of alleles in samples of Other ancestry\">",
      "##INFO=<ID=AF_oth,Number=A,Type=Float,Description=\"Alternate allele frequency in samples of Other ancestry\">",
      "##INFO=<ID=AC_amr,Number=A,Type=Integer,Description=\"Alternate allele count for samples of Latino ancestry\">",
      "##INFO=<ID=AN_amr,Number=1,Type=Integer,Description=\"Total number of alleles in samples of Latino ancestry\">",
      "##INFO=<ID=AF_amr,Number=A,Type=Float,Description=\"Alternate allele frequency in samples of Latino ancestry\">",
      "##INFO=<ID=AC_afr,Number=A,Type=Integer,Description=\"Alternate allele count for samples of African-American/African ancestry\">",
      "##INFO=<ID=AN_afr,Number=1,Type=Integer,Description=\"Total number of alleles in samples of African-American/African ancestry\">",
      "##INFO=<ID=AF_afr,Number=A,Type=Float,Description=\"Alternate allele frequency in samples of African-American/African ancestry\">",
      "##INFO=<ID=AC_asj,Number=A,Type=Integer,Description=\"Alternate allele count for samples of Ashkenazi Jewish ancestry\">",
      "##INFO=<ID=AN_asj,Number=1,Type=Integer,Description=\"Total number of alleles in samples of Ashkenazi Jewish ancestry\">",
      "##INFO=<ID=AF_asj,Number=A,Type=Float,Description=\"Alternate allele frequency in samples of Ashkenazi Jewish ancestry\">",
      "##INFO=<ID=AC_eas,Number=A,Type=Integer,Description=\"Alternate allele count for samples of East Asian ancestry\">",
      "##INFO=<ID=AN_eas,Number=1,Type=Integer,Description=\"Total number of alleles in samples of East Asian ancestry\">",
      "##INFO=<ID=AF_eas,Number=A,Type=Float,Description=\"Alternate allele frequency in samples of East Asian ancestry\">",
      "##INFO=<ID=AC_sas,Number=A,Type=Integer,Description=\"Alternate allele count for samples of South Asian ancestry\">",
      "##INFO=<ID=AN_sas,Number=1,Type=Integer,Description=\"Total number of alleles in samples of South Asian ancestry\">",
      "##INFO=<ID=AF_sas,Number=A,Type=Float,Description=\"Alternate allele frequency in samples of South Asian ancestry\">",
    ];
    var buf = "";
    hdrRecs.forEach(function(hdrRec) {
        buf += hdrRec;
    })
    return buf;
  }




}

export default GlobalApp

