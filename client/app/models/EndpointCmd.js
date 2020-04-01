import { Client } from 'iobio-api-client';

export default class EndpointCmd {

    constructor(globalApp, launchTimestamp, genomeBuildHelper, getHumanRefNamesFunc) {
        this.globalApp = globalApp;
        this.launchTimestamp = launchTimestamp;
        this.genomeBuildHelper = genomeBuildHelper;
        this.getHumanRefNames = getHumanRefNamesFunc;
        this.launchedFromUtah =  this.globalApp.IOBIO_SERVICES.indexOf('mosaic.chpc.utah.edu') === 0;


        // talk to gru
        this.api = new Client('backend.iobio.io', {secure: false});
        this.gruBackend = true;

        // iobio services
        this.IOBIO = {};
        this.IOBIO.tabix = this.globalApp.IOBIO_SERVICES + (this.globalApp.useOnDemand ? "od_tabix/" : "tabix/");
        this.IOBIO.vcfReadDepther = this.globalApp.IOBIO_SERVICES + "vcfdepther/";
        this.IOBIO.snpEff = this.globalApp.IOBIO_SERVICES + "snpeff/";
        this.IOBIO.vt = this.globalApp.IOBIO_SERVICES + "vt/";
        this.IOBIO.af = this.globalApp.IOBIO_SERVICES + "af/";
        this.IOBIO.vep = (this.launchedFromUtah === true ? this.globalApp.IOBIO_SERVICES : this.globalApp.GREEN_IOBIO) + "vep/";   // Inside utah mosaic, normal services, else beefy nv-green to accommodate sfari
        this.IOBIO.contigAppender = this.globalApp.IOBIO_SERVICES + "ctgapndr/";
        this.IOBIO.bcftools = this.globalApp.IOBIO_SERVICES + "bcftools/";
        this.IOBIO.coverage = this.globalApp.IOBIO_SERVICES + "coverage/";
        this.IOBIO.samtools = this.globalApp.IOBIO_SERVICES + "samtools/";
        this.IOBIO.samtoolsOnDemand = this.globalApp.IOBIO_SERVICES + (this.globalApp.useOnDemand ? "od_samtools/" : "samtools/");
        this.IOBIO.freebayes = this.globalApp.IOBIO_SERVICES + "freebayes/";
        this.IOBIO.vcflib = this.globalApp.IOBIO_SERVICES + "vcflib/";
        this.IOBIO.geneCoverage = this.globalApp.IOBIO_SERVICES + "genecoverage/";
        //this.IOBIO.knownvariants           = this.globalApp.IOBIO_SERVICES  + "knownvariants/";
        this.IOBIO.knownvariants = this.globalApp.DEV_IOBIO + "knownvariants/"; // ONCOGENE SPECIFIC CHANGE
    }


    getVcfHeader(vcfUrl, tbiUrl) {
        if (this.gruBackend) {
            return this.api.streamCommand('variantHeader', {url: vcfUrl, indexUrl: tbiUrl});
        }
        else {
            const me = this;
            let args = ['-H', '"' + vcfUrl + '"'];
            if (tbiUrl) {
                args.push('"' + tbiUrl + '"');
            }
            let cmd = new iobio.cmd(
                me.IOBIO.tabix,
                args,
                {ssl: me.globalApp.useSSL}
            );
            return cmd;
        }
    }

    getVcfDepth(vcfUrl, tbiUrl) {
        if (this.gruBackend) {
            if (!tbiUrl) {
                tbiUrl = vcfUrl + '.tbi';
            }
            return this.api.streamCommand('vcfReadDepth', {url: tbiUrl});
        }
        else {
            const me = this;
            let args = ['-i'];
            if (tbiUrl) {
                args.push('"' + tbiUrl + '"');
            } else {
                args.push('"' + vcfUrl + '.tbi' + '"');
            }

            let cmd = new iobio.cmd(
                me.IOBIO.vcfReadDepther,
                args,
                {ssl: me.globalApp.useSSL}
            );
            return cmd;
        }
    }

    /* Returns only the columns of a VCF file which contain fields necessary to create a unique identifier for a variant.
     * These include: POS, REF, ALT and INFO
     * Can be used when determining if a variant exists in two samples across VCF files, for instance.
     * Currently used in Oncogene for COSMIC comparison */
    getVariantIds(vcfSource, refName, regions) {
        const me = this;

        let cmd = null;
        if (me.gruBackend) {
            cmd = me.api.streamCommand('getIdColumns', {vcfUrl: vcfSource.vcfUrl, regions});
        } else {
            // Format region
            let regionParam = "";
            if (regions && regions.length > 0) {
                regions.forEach(function (region) {
                    if (regionParam.length > 0) {
                        regionParam += " ";
                    }
                    regionParam += region.name + ":" + region.start + "-" + region.end;
                })
            }
            // Form iobio command based on type of vcf input
            if (vcfSource.hasOwnProperty('vcfUrl')) {
                let view_args = ['view', '-r', regionParam, '"' + vcfSource.vcfUrl + '"'];
                cmd = new iobio.cmd(me.IOBIO.bcftools, view_args, {ssl: me.globalApp.useSSL});
            } else if (vcfSource.hasOwnProperty('writeStream')) {
                // If we have a local vcf file, use the writeStream function to stream in the vcf records
                cmd = new iobio.cmd(me.IOBIO.bcftools, ['view', '-r', regionParam, vcfSource.writeStream], {ssl: me.globalApp.useSSL})
            } else {
                console.log("EndpointCmd.annotateVariants() vcfSource arg is not invalid.");
                return null;
            }
        }
        // Return command
        return cmd;
    }

    annotateVariants(vcfSource, refName, regions, vcfSampleNames, annotationEngine, isRefSeq, hgvsNotation, getRsId, vepAF, useServerCache, serverCacheKey, sfariMode = false, gnomadUrl, gnomadRegionStr) {
        if (this.gruBackend) {
            const refNames = this.getHumanRefNames(refName).split(" ");
            const genomeBuildName = this.genomeBuildHelper.getCurrentBuildName();
            const refFastaFile = this.genomeBuildHelper.getFastaPath(refName);

            const ncmd = this.api.streamCommand('annotateVariants', {
                vcfUrl: vcfSource.vcfUrl,
                tbiUrl: vcfSource.tbiUrl,
                refNames,
                regions,
                vcfSampleNames: vcfSampleNames.split(','),
                refFastaFile,
                genomeBuildName,
                isRefSeq,
                hgvsNotation,
                getRsId,
                vepAF,
                sfariMode,
                vepREVELFile: this.globalApp.vepREVELFile,
                gnomadUrl: gnomadUrl ? gnomadUrl : '',
                gnomadRegionStr: gnomadRegionStr ? gnomadRegionStr : '',
            });

            return ncmd;
        } else {
            const me = this;
            // Figure out the file location of the reference seq files
            let regionParm = "";
            if (regions && regions.length > 0) {
                regions.forEach(function (region) {
                    if (regionParm.length > 0) {
                        regionParm += " ";
                    }
                    regionParm += region.name + ":" + region.start + "-" + region.end;
                })
            }

            let contigStr = "";
            me.getHumanRefNames(refName).split(" ").forEach(function (ref) {
                contigStr += "##contig=<ID=" + ref + ">\n";
            });

            let contigNameFile = new Blob([contigStr]);

            // Create an iobio command get get the variants and add any header recs.
            let cmd = null;
            if (vcfSource.hasOwnProperty('vcfUrl')) {
                //  If we have a vcf URL, use tabix to get the variants for the region
                let args = ['-h', '"' + vcfSource.vcfUrl + '"', regionParm];
                if (vcfSource.tbiUrl) {
                    args.push('"' + vcfSource.tbiUrl + '"');
                }
                cmd = new iobio.cmd(me.IOBIO.tabix, args, {ssl: me.globalApp.useSSL})
                    .pipe(me.IOBIO.bcftools, ['annotate', '-h', contigNameFile, '-'], {ssl: me.globalApp.useSSL})

            } else if (vcfSource.hasOwnProperty('writeStream')) {
                // If we have a local vcf file, use the writeStream function to stream in the vcf records
                cmd = new iobio.cmd(me.IOBIO.bcftools, ['annotate', '-h', contigNameFile, vcfSource.writeStream], {ssl: me.globalApp.useSSL})
            } else {
                console.log("EndpointCmd.annotateVariants() vcfSource arg is not invalid.");
                return null;
            }


            if (vcfSampleNames && vcfSampleNames.length > 0) {
                let sampleNameFile = new Blob([vcfSampleNames.split(",").join("\n")]);
                cmd = cmd.pipe(me.IOBIO.vt, ["subset", "-s", sampleNameFile, '-'], {ssl: me.globalApp.useSSL});
            }

            // normalize variants
            let refFastaFile = me.genomeBuildHelper.getFastaPath(refName);
            cmd = cmd.pipe(me.IOBIO.vt, ["normalize", "-n", "-r", refFastaFile, '-'], {ssl: me.globalApp.useSSL});

            // if af not retreived from vep, get allele frequencies from 1000G and ExAC in af service
            cmd = cmd.pipe(me.IOBIO.af, ["-b", me.genomeBuildHelper.getCurrentBuildName()], {ssl: me.globalApp.useSSL});

            // Skip snpEff if RefSeq transcript set or we are just annotating with the vep engine
            if (annotationEngine === 'none') {
                // skip annotation if annotationEngine set to  'none'
            } else if (isRefSeq || annotationEngine === 'vep') {
                // VEP
                let vepArgs = [];
                vepArgs.push(" --assembly");
                vepArgs.push(me.genomeBuildHelper.getCurrentBuildName());
                vepArgs.push(" --format vcf");
                vepArgs.push(" --allele_number");
                if (me.globalApp.vepREVELFile) {
                    vepArgs.push(" --plugin REVEL," + me.globalApp.vepREVELFile);
                }
                if (vepAF) {
                    vepArgs.push("--af");
                    vepArgs.push("--af_gnomad");
                    vepArgs.push("--af_esp");
                    vepArgs.push("--af_1kg");
                    vepArgs.push("--max_af");
                }
                if (isRefSeq) {
                    vepArgs.push("--refseq");
                }
                // Get the hgvs notation and the rsid since we won't be able to easily get it one demand
                // since we won't have the original vcf records as input
                if (hgvsNotation) {
                    vepArgs.push("--hgvs");
                }
                if (getRsId) {
                    vepArgs.push("--check_existing");
                }
                if (hgvsNotation || me.globalApp.utility.getRsId || isRefSeq) {
                    vepArgs.push("--fasta");
                    vepArgs.push(refFastaFile);
                }

                //
                //  SERVER SIDE CACHING
                //
                let cacheKey = null;
                let urlParameters = {};
                if (useServerCache && serverCacheKey.length > 0) {
                    urlParameters.cache = serverCacheKey;
                    urlParameters.partialCache = true;
                    cmd = cmd.pipe("nv-dev-new.iobio.io/vep/", vepArgs, {
                        ssl: me.globalApp.useSSL,
                        urlparams: urlParameters
                    });
                } else {
                    cmd = cmd.pipe(me.IOBIO.vep, vepArgs, {ssl: me.globalApp.useSSL, urlparams: urlParameters});
                }

            } else if (annotationEngine === 'snpeff') {
                cmd = cmd.pipe(me.IOBIO.snpEff, [], {ssl: me.globalApp.useSSL});
            }

            // NOTE: this should never be true for oncogene...ß
            if (sfariMode === true) {
                cmd = cmd.pipe(me.IOBIO.bcftools, ['view', '-G', '-'], {ssl: me.globalApp.useSSL});
            }
            return cmd;
        }
    }

    normalizeVariants(vcfUrl, tbiUrl, refName, regions) {
        const me = this;
        if (this.gruBackend) {
            let me = this;
            let refFastaFile = me.genomeBuildHelper.getFastaPath(refName);
            // do with annotateVariants
            let contigStr = "";
            me.getHumanRefNames(refName).split(" ").forEach(function (ref) {
                contigStr += "##contig=<ID=" + ref + ">\n";
            });
            return this.api.streamCommand('normalizeVariants', {
                vcfUrl,
                tbiUrl,
                refName,
                regions,
                contigStr,
                refFastaFile
            });
        } else {
            let refFastaFile = me.genomeBuildHelper.getFastaPath(refName);
            let regionParm = "";
            regions.forEach(function (region) {
                if (regionParm.length > 0) {
                    regionParm += " ";
                }
                regionParm += region.refName + ":" + region.start + "-" + region.end;
            });

            let args = ['-h', vcfUrl, regionParm];
            if (tbiUrl) {
                args.push(tbiUrl);
            }
            let contigStr = "";
            me.getHumanRefNames(refName).split(" ").forEach(function (ref) {
                contigStr += "##contig=<ID=" + ref + ">\n";
            });
            let contigNameFile = new Blob([contigStr]);
            let cmd = new iobio.cmd(me.IOBIO.tabix, args, {ssl: me.globalApp.useSSL})
                .pipe(me.IOBIO.bcftools, ['annotate', '-h', contigNameFile, '-'], {ssl: me.globalApp.useSSL})

            // normalize variants
            cmd = cmd.pipe(me.IOBIO.vt, ["normalize", "-n", "-r", refFastaFile, '-'], {ssl: me.globalApp.useSSL})
            return cmd;
        }
    }

    getCountsForGene(url, refName, geneObject, binLength, regions, annotationMode, requiresVepService = false) {
        if (this.gruBackend) {
            let vepArgs = '';
            if (requiresVepService) {
                vepArgs += " --assembly " + this.genomeBuildHelper.getCurrentBuildName();
                vepArgs += " --format vcf";
                vepArgs += " --allele_number";
            }

            return this.api.streamCommand('clinvarCountsForGene', {
                clinvarUrl: url,
                region: {
                    refName,
                    start: geneObject.start,
                    end: geneObject.end,
                },
                binLength,
                regions,
                annotationMode: annotationMode,
                requiresVepService: requiresVepService,
                vepArgs: vepArgs
            });
        } else {
            const me = this;
            let regionParm = refName + ":" + geneObject.start + "-" + geneObject.end;

            // For the knownVariants service, pass in an argument for the gene region, then pass in with
            // the length of the bin region or a comma separate string of region parts (e.g. the exons)
            let knownVariantsArgs = [];
            knownVariantsArgs.push("-r");
            knownVariantsArgs.push(regionParm);
            if (binLength) {
                knownVariantsArgs.push("-b");
                knownVariantsArgs.push(binLength);
            } else if (regions) {
                let regionParts = "";
                regions.forEach(function (region) {
                    if (regionParts.length > 0) {
                        regionParts += ",";
                    }
                    regionParts += region.start + "-" + region.end;
                });
                if (regionParts.length > 0) {
                    knownVariantsArgs.push("-p");
                    knownVariantsArgs.push(regionParts);
                }
            }
            if (annotationMode === 'vep') {
                knownVariantsArgs.push("-m vep");
            } else {
                knownVariantsArgs.push("-m clinvar");
            }
            knownVariantsArgs.push("-");

            // Create an iobio command get get the variants and add any header recs.
            let tabixArgs = ['-h', url, regionParm];
            let cmd = new iobio.cmd(me.IOBIO.tabix, tabixArgs, {ssl: me.globalApp.useSSL});

            if (requiresVepService) {
                let vepArgs = [];
                vepArgs.push(" --assembly");
                vepArgs.push(me.genomeBuildHelper.getCurrentBuildName());
                vepArgs.push(" --format vcf");
                vepArgs.push(" --allele_number");
                cmd = cmd.pipe(me.IOBIO.vep, vepArgs, {ssl: me.globalApp.useSSL});
            }
            cmd = cmd.pipe(me.IOBIO.knownvariants, knownVariantsArgs, {ssl: false});
            return cmd;
        }
    }

    getBamHeader(bamUrl, baiUrl) {
        if (this.gruBackend) {
            return this.api.streamCommand('alignmentHeader', {url: bamUrl});
        }
        else {
            const me = this;
            let args = ['view', '-H', '"' + bamUrl + '"'];
            if (baiUrl) {
                args.push('"' + baiUrl + '"');
            }
            let cmd = new iobio.cmd(
                me.IOBIO.samtoolsOnDemand,
                args,
                {ssl: me.globalApp.useSSL}
            );
            return cmd;
        }
    }

    getBamCoverage(bamSource, refName, regionStart, regionEnd, regions, maxPoints, useServerCache, serverCacheKey) {
        if (this.gruBackend) {
            // TODO: gru version of this is broken with multiple regions...
            // TODO: left off needing to determine why this doesn't work
            const url = bamSource.bamUrl;
            const samtoolsRegion = {refName, start: regionStart, end: regionEnd};
            const indexUrl = bamSource.baiUrl;
            maxPoints = maxPoints ? maxPoints : 0;

            return this.api.streamCommand('alignmentCoverage', {
                url,
                indexUrl,
                samtoolsRegion,
                maxPoints,
                coverageRegions: regions
            });
        } else {
            const me = this;
            let samtools = bamSource.bamUrl != null ? me.IOBIO.samtoolsOnDemand : me.IOBIO.samtools;

            // Format all regions into string param
            let regionsArg = "";
            regions.forEach(function (region) {
                region.name = refName;
                if (region.name && region.start && region.end) {
                    if (regionsArg.length === 0) {
                        regionsArg += " -p ";
                    } else {
                        regionsArg += ",";
                    }
                    regionsArg += region.name + ":" + region.start + ":" + region.end;
                }
            });
            let maxPointsArg = "";
            if (maxPoints) {
                maxPointsArg = "-m " + maxPoints;
            } else {
                maxPointsArg = "-m 0"
            }
            let spanningRegionArg = " -r " + refName + ":" + regionStart + ":" + regionEnd;
            let regionArg = refName + ":" + regionStart + "-" + regionEnd;


            let cmd = null;

            // When file served remotely, first run samtools view, then run samtools mpileup.
            // When bam file is read as a local file, just stream sam records for region to
            // samtools mpileup.
            if (bamSource.bamUrl) {
                let args = ['view', '-b', '"' + bamSource.bamUrl + '"', regionArg];
                if (bamSource.baiUrl) {
                    args.push('"' + bamSource.baiUrl + '"');
                }
                cmd = new iobio.cmd(samtools, args,
                    {
                        'urlparams': {'encoding': 'binary'},
                        ssl: me.globalApp.useSSL
                    });
                cmd = cmd.pipe(samtools, ["mpileup", "-"], {ssl: me.globalApp.useSSL});
            } else {
                cmd = new iobio.cmd(samtools, ['mpileup', bamSource.writeStream],
                    {
                        'urlparams': {'encoding': 'utf8'},
                        ssl: me.globalApp.useSSL
                    });

            }

            //
            //  SERVER SIDE CACHING for coverage service
            //
            let cacheKey = null;
            let urlParameters = {};
            if (useServerCache) {
                urlParameters.cache = serverCacheKey;
                urlParameters.partialCache = true;
                cmd = cmd.pipe("nv-dev-new.iobio.io/coverage/", [maxPointsArg, spanningRegionArg, regionsArg], {
                    ssl: me.globalApp.useSSL,
                    urlparams: urlParameters
                });
            } else {
                // After running samtools mpileup, run coverage service to summarize point data.
                // NOTE:  Had to change to protocol http(); otherwise signed URLs don't work (with websockets)
                cmd = cmd.pipe(me.IOBIO.coverage, [maxPointsArg, spanningRegionArg, regionsArg], {ssl: me.globalApp.useSSL});

            }
            return cmd;
        }
    }

    freebayesJointCall(bamSources, refName, regionStart, regionEnd, isRefSeq, fbArgs, vepAF, sampleNames) {
        if (this.gruBackend) {

            const refFastaFile = this.genomeBuildHelper.getFastaPath(refName);

            const refNames = this.getHumanRefNames(refName).split(" ");
            const genomeBuildName = this.genomeBuildHelper.getCurrentBuildName();
            const clinvarUrl = this.globalApp.getClinvarUrl(genomeBuildName);

            return this.api.streamCommand('freebayesJointCall', {
                alignmentSources: bamSources,
                refFastaFile,
                region: {
                    refName,
                    start: regionStart,
                    end: regionEnd,
                },
                fbArgs,
                refNames,
                genomeBuildName,
                vepREVELFile: this.globalApp.vepREVELFile,
                vepAF,
                isRefSeq,
                clinvarUrl,
                sampleNames,
            });
        }
        else {
            const me = this;
            let bamCmds = me._getBamRegions(bamSources, refName, regionStart, regionEnd);
            let refFastaFile = me.genomeBuildHelper.getFastaPath(refName);
            let freebayesArgs = [];
            bamCmds.forEach(function (bamCmd) {
                freebayesArgs.push("-b");
                freebayesArgs.push(bamCmd);
            });

            freebayesArgs.push("-f");
            freebayesArgs.push(refFastaFile);

            if (fbArgs && fbArgs.useSuggestedVariants.value === true) {
                freebayesArgs.push("-@");
                freebayesArgs.push(me._getSuggestedVariants(refName, regionStart, regionEnd));
            }
            if (fbArgs) {
                for (var key in fbArgs) {
                    let theArg = fbArgs[key];
                    if (theArg.hasOwnProperty('argName')) {
                        if (theArg.hasOwnProperty('isFlag') && theArg.isFlag === true) {
                            if (theArg.value && theArg.value === true) {
                                freebayesArgs.push(theArg.argName);
                            }
                        } else {
                            if (theArg.value && theArg.value !== '') {
                                freebayesArgs.push(theArg.argName);
                                freebayesArgs.push(theArg.value);
                            }
                        }

                    }
                }

            }
            let cmd = new iobio.cmd(me.IOBIO.freebayes, freebayesArgs, {ssl: me.globalApp.useSSL});

            // Normalize variants
            cmd = cmd.pipe(me.IOBIO.vt, ['normalize', '-r', refFastaFile, '-'], {ssl: me.globalApp.useSSL});

            // Subset on all samples (this will get rid of low quality cases where no sample
            // is actually called as having the alt)
            //cmd = cmd.pipe(IOBIO.vt, ['subset', '-s', '-']);

            // Filter out anything with qual <= 0
            cmd = cmd.pipe(me.IOBIO.vt, ['filter', '-f', "\'QUAL>1\'", '-t', '\"PASS\"', '-d', '\"Variants called by iobio\"', '-'], {ssl: me.globalApp.useSSL});

            //
            // Annotate variants that were just called from freebayes
            //
            // bcftools to append header rec for contig
            let contigStr = "";
            me.getHumanRefNames(refName).split(" ").forEach(function (ref) {
                contigStr += "##contig=<ID=" + ref + ">\n";
            });
            let contigNameFile = new Blob([contigStr])
            cmd = cmd.pipe(me.IOBIO.bcftools, ['annotate', '-h', contigNameFile], {ssl: me.globalApp.useSSL})

            // Get Allele Frequencies from 1000G and ExAC
            cmd = cmd.pipe(me.IOBIO.af, [], {ssl: me.globalApp.useSSL});

            // VEP to annotate
            let vepArgs = [];
            vepArgs.push(" --assembly");
            vepArgs.push(me.genomeBuildHelper.getCurrentBuildName());
            vepArgs.push(" --format vcf");
            vepArgs.push(" --allele_number");
            if (me.globalApp.vepREVELFile) {
                vepArgs.push(" --plugin REVEL," + me.globalApp.vepREVELFile);
            }
            if (vepAF) {
                vepArgs.push("--af");
                vepArgs.push("--af_gnomad");
                vepArgs.push("--af_esp");
                vepArgs.push("--af_1kg");
                vepArgs.push("--max_af");
            }

            if (isRefSeq) {
                vepArgs.push("--refseq");
            }
            // Get the hgvs notation and the rsid since we won't be able to easily get it one demand
            // since we won't have the original vcf records as input
            vepArgs.push("--hgvs");
            vepArgs.push("--check_existing");
            vepArgs.push("--fasta");
            vepArgs.push(refFastaFile);
            cmd = cmd.pipe(me.IOBIO.vep, vepArgs, {ssl: me.globalApp.useSSL});

            return cmd;
        }
    }

    getGeneCoverage(bamSources, refName, geneName, regionStart, regionEnd, regions) {
        if (this.gruBackend) {
            const url = bamSources[0].bamUrl;
            const indexUrl = bamSources[0].baiUrl;
            return this.api.streamCommand('geneCoverage', {
                url,
                indexUrl,
                refName,
                geneName,
                regionStart,
                regionEnd,
                regions
            });
        } else {
            const me = this;
            let bamCmds = me._getBamRegions(bamSources, refName, regionStart, regionEnd);
            let args = [];

            bamCmds.forEach(function (bamCmd) {
                args.push("-b");
                args.push(bamCmd);
            });

            let regionStr = "#" + geneName + "\n";
            regions.forEach(function (region) {
                regionStr += refName + ":" + region.start + "-" + region.end + "\n";
            });
            let regionFile = new Blob([regionStr]);
            args.push("-r");
            args.push(regionFile);

            let cmd = new iobio.cmd(me.IOBIO.geneCoverage, args, {ssl: me.globalApp.useSSL});
            return cmd;
        }
    }

    // NOTE: this function has not been testing with the monolith backend as of Nov2019
    // Unaware if GRU has an endpoint for this - SJG
    _getBamRegions(bamSources, refName, regionStart, regionEnd) {
        const me = this;

        let regionArg = refName + ":" + regionStart + "-" + regionEnd;
        let bamCmds = [];
        bamSources.forEach(function (bamSource) {
            let samtools = bamSource.bamUrl != null ? me.IOBIO.samtoolsOnDemand : me.IOBIO.samtools;

            if (bamSource.bamUrl) {
                let args = ['view', '-b', '"' + bamSource.bamUrl + '"', regionArg];
                if (bamSource.baiUrl) {
                    args.push('"' + bamSource.baiUrl + '"');
                }
                let bamCmd = new iobio.cmd(samtools, args, {
                    'urlparams': {'encoding': 'binary'},
                    ssl: me.globalApp.useSSL
                });
                bamCmds.push(bamCmd);

            } else {
                let args = ['view', '-b', bamSource.bamBlob];
                let bamCmd = new iobio.cmd(samtools, args, {
                    'urlparams': {'encoding': 'binary'},
                    ssl: me.globalApp.useSSL
                });
                bamCmds.push(bamCmd);
            }

        });
        return bamCmds;
    }

    // NOTE: this function has not been testing with the monolith backend as of Nov2019
    // Unaware if GRU has an endpoint for this - SJG
    _getSuggestedVariants(refName, regionStart, regionEnd) {
        const me = this;

        // Create an iobio command get get the variants from clinvar for the region of the gene
        let regionParm = refName + ":" + regionStart + "-" + regionEnd;

        //var clinvarUrl = me.genomeBuildHelper.getBuildResource(me.genomeBuildHelper.RESOURCE_CLINVAR_VCF_FTP);
        let clinvarUrl = me.globalApp.getClinvarUrl(me.genomeBuildHelper.getCurrentBuildName());

        let tabixArgs = ['-h', clinvarUrl, regionParm];
        let cmd = new iobio.cmd(me.IOBIO.tabix, tabixArgs, {ssl: me.globalApp.useSSL});

        cmd = cmd.pipe(me.IOBIO.vt, ['view', '-f', '\"INFO.CLNSIG=~\'5|4\'\"', '-'], {ssl: me.globalApp.useSSL});
        return cmd;
    }
}


