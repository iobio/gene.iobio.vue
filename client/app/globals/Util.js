class Util {
  constructor() {
    this.impactEduMode = {
      HIGH:      'Harmful',
      MODERATE:  'Probably harmful',
      MODIFIER:  'Probably benign',
      LOW:       'Benign'
    }
    this.globalApp = null;


  }

  formatRegion() {
    return d3.format(",");
  }

  decodeUrl(url) {
    if (url && (url.slice(0,14) == 'https%3A%2F%2F' || url.slice(0,13) == 'http%3A%2F%2F'))
      return decodeURIComponent(url)
    else
      return url;
  }


  formatDate(d) {
    var padMinutes = function(n) {
        return String("00" + n).slice(-2);
    }
    var formatHours = function(h) {
      if (+h > 12) {
        return +h - 12;
      } else {
        return h;
      }
    }
    var getAmPm = function(h) {
      if (+h > 12) {
        return 'pm';
      } else {
        return 'am';
      }
    }
    return d.getMonth() + "-" + d.getDay() + "-" + d.getFullYear() + " " + formatHours(d.getHours()) + ":" + padMinutes(d.getMinutes()) + " " + getAmPm(d.getHours());
  }



  visibleHeight($el) {
      var elH = $el.outerHeight(),
          H = $(window).height(),
          r = $el[0].getBoundingClientRect(), t=r.top, b=r.bottom;
      return Math.max(0, t>0? Math.min(elH, H-t) : (b<H?b:H));
  }

  goToHome() {
    var homeUrl = window.location.protocol + "\/\/" + window.location.hostname + window.location.pathname;
    window.location.assign(homeUrl);
  }

  changeSiteStylesheet(cssHref) {

      var oldlink = $("#site-stylesheet")[0];

      var newlink = document.createElement("link");
      newlink.setAttribute("rel",  "stylesheet");
      newlink.setAttribute("id",   "site-stylesheet");
      newlink.setAttribute("type", "text/css");
      newlink.setAttribute("href", cssHref);

      document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
  }

  createDownloadLink(anchorSelector, str, fileName) {

    if(window.navigator.msSaveOrOpenBlob) {
      var fileData = [str];
      blobObject = new Blob(fileData);
      $(anchorSelector).click(function(){
        window.navigator.msSaveOrOpenBlob(blobObject, fileName);
      });
    } else {
      var url = "data:text/plain;charset=utf-8," + encodeURIComponent(str);
      $(anchorSelector).attr("download", fileName);
      $(anchorSelector).attr("href", url);
    }
  }




  switchGenotype(gt) {
    if (gt != null && gt.length == 3) {
      return gt[2] +  gt[0];
    } else {
      return gt;
    }

  }

  endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }

  showStackTrace(e) {
    var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
        .replace(/^\s+at\s+/gm, '')
        .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
        .split('\n');
    console.log(stack);
  }

  getHumanRefNames(refName) {
      if (refName.indexOf("chr") == 0) {
        return "chr1 chr2 chr3 chr4 chr5 chr6 chr7 chr8 chr9 chr10 chr11 chr12 chr13 chr14 chr15 chr16 chr17 chr18 chr20 chr21 chr22 chrX chrY";
      } else {
        return "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 X Y";
      }
  }

  formatCurrentDateTime(delim) {
    var theDelim = delim ? delim : '-';
    var theTimeDelim = delim ? delim : ':';
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd
    }
    if(mm<10){
        mm='0'+mm
    }


    var hours = today.getHours();
    var minutes = today.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var theTime = hours + theTimeDelim + minutes + ampm;

    var today = mm + theDelim + dd + theDelim + yyyy + theDelim + theTime;
    return today;
  }

  stripTranscriptPrefix(transcriptId) {
    if (transcriptId == null) {
      console.log("null transcript id")
      return "";
    }
    var nameTokens = transcriptId.split('.');
    return nameTokens.length > 0 ? nameTokens[0] : transcriptId;
  }

  stripRefName(refName) {
    var tokens = refName.split("chr");
    var strippedName = refName;
    if (tokens.length > 1) {
      strippedName = tokens[1];
    } else {
      tokens = refName.split("ch");
      if (tokens.length > 1) {
        strippedName = tokens[1];
      }
    }
    return strippedName;
  }


  uniq(theArray) {
     return Array.from(new Set(theArray));
  }


  /*
  *
  *  Stream the app snapshot (html) to the emailServer which
  *  will email a description of the problem along with an html file attachment
  *  that is the snapshop of vcfiobio.
  */
  sendFeedbackEmail(name, email, note, htmlAttachment) {
    let self = this;
    var client = BinaryClient(this.globalApp.emailServer);

    // Strip of the #modal-report-problem from the URL
    var appURL = "";
    if (this.globalApp.feedbackShowURL) {
      appURL = location.href;
      if (appURL.indexOf("#feedback-modal") > -1){
          appURL = appURL.substr(0, appURL.indexOf("#feedback-modal"));
      }
    }

    // Format the body of the email
    var htmlBody = '<span style="padding-right: 4px">Reported by:</span>' + name  + "<br><br>";
    htmlBody    += '<span style="padding-right: 4px">Email:</span>' + email  + "<br><br>";
    if (this.globalApp.feedbackShowURL) {
      htmlBody +=  '<span style="padding-right: 51px">gene.iobio URL:</span>' + appURL + "<br><br>";
    }
    htmlBody += note + '<br><br>';

    var emailObject = {
        'from':     email,
        'to':       self.globalApp.feedbackEmails,
        'subject':  'Feedback on gene.iobio',
        'body':     htmlBody
     };
     if (this.globalApp.feedbackAttachScreenCapture && htmlAttachment) {
      emailObject.filename = 'gene.iobio.screencapture.' + util.formatCurrentDateTime('.') + '.html';
     } else {
      emailObject.filename = '';
     }

    client.on('open', function(stream){
      var stream = client.createStream(emailObject);
      if (self.globalApp.feedbackAttachScreenCapture && htmlAttachment) {
        stream.write(htmlAttachment);
      }
      stream.end();
    });
  }


  sendFeedbackReceivedEmail(emailTo) {
    let self = this;
    var client = BinaryClient(self.globalApp.emailServer);

    // Format the body of the email
    var htmlBody = 'Thank you for your feedback on gene.iobio.  We will review your email as soon as possible.';
    htmlBody     += '<br><br>';
      htmlBody     += 'Best regards,<br>';
      htmlBody     += 'The IOBIO team';

    var emailObject = {
        'from':     self.globalApp.feedbackEmails,
        'to':       emailTo,
        'subject':  'gene.iobio feedback received',
        'body':     htmlBody
     };

    client.on('open', function(stream){
      var stream = client.createStream(emailObject);
      stream.end();
    });
  }



  capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }

  percentage(a, showSign=true) {
    let me = this;
    var pct = a * 100;
    var places = 0;
    if (pct < .001) {
      places = 4;
    } else if (pct < .01) {
      places = 3;
    } else if (pct < .1) {
      places = 2
    } else if (pct < 1) {
      places = 1;
    } else {
      places = 0;
    }
    return me.round(pct, places) + (showSign ? "%" : "");
  }

  round(value, places) {
    return +(Math.round(value + "e+" + places)  + "e-" + places);
  }

  splitArray(a, n) {
    var len = a.length,out = [], i = 0;
    while (i < len) {
        var size = Math.ceil((len - i) / n--);
        out.push(a.slice(i, i + size));
        i += size;
    }
    return out;
  }

  getRsId(variant) {
    var rsId = null;
    if (variant.vepVariationIds) {
      for (var key in variant.vepVariationIds) {
        if (key != 0 && key != '') {
          var tokens = key.split("&");
          tokens.forEach( function(id) {
            if (id.indexOf("rs") == 0) {
              rsId = id;
            }
          });
        }
      }
    }
    return rsId;
  }

  getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    var hits = {};

    var matchExact = function(r, str) {
      var match = str.match(r);
      return match != null && str.indexOf(match[0]) == 0;
    }

    var getMatch = function(string, regex, index) {
      index || (index = 1); // default to the first capturing group
      var matches = [];
      var match = regex.exec(string);
      if (match && match.length > index && match[index]) {
        return match[index];
      } else {
        return null;
      }
    }


    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (typeof sParam == 'string' || sParam instanceof String) {
          if (sParameterName[0] == sParam)
          {
              return sParameterName[1];
          }
      } else {
        var match = getMatch(sParameterName[0], sParam)
        if ( match) {
          hits[sParameterName[0]] = sParameterName[1];
        }
      }
    }

    if (Object.keys(hits).length == 0)
      return undefined;
    else
      return hits;
  }


  addCommas(nStr) {
    nStr += '';
    let x = nStr.split('.');
    let x1 = x[0];
    let x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  }


  updateUrl(paramName, value) {
    var params = {};
    // turn params into hash
    window.location.search.split('&').forEach(function(param){
      if (param != '') {
        param = param.split('?').length == 1 ? param : param.split('?')[1];
        var fields = param.split('=');
        params[fields[0]] = fields[1];
      }
    });
    params[paramName] = value;
    var search = [];
    Object.keys(params).forEach(function(key) {
      search.push(key + '=' + params[key]);
    })
      window.history.replaceState(null,null,'?'+search.join('&'));
  }

  removeUrl(paramName) {
    var params = {};
    // turn params into hash, but leave out the specified parameter
    window.location.search.split('&').forEach(function(param){
      if (param.indexOf(paramName) == 0) {

      } else if (param != '') {
        param = param.split('?').length == 1 ? param : param.split('?')[1];
        var fields = param.split('=');
        params[fields[0]] = fields[1];
      }
    });
    var search = [];
    Object.keys(params).forEach(function(key) {
      search.push(key + '=' + params[key]);
    })
    window.history.replaceState(null,null,'?'+search.join('&'));

  }


  isChrome() {
    var isChromium = window.chrome,
      winNav = window.navigator,
      vendorName = winNav.vendor,
      isOpera = winNav.userAgent.indexOf("OPR") > -1,
      isIEedge = winNav.userAgent.indexOf("Edge") > -1,
      isIOSChrome = winNav.userAgent.match("CriOS");

    if (isIOSChrome) {
      return true;
    } else if (
      isChromium !== null &&
      typeof isChromium !== "undefined" &&
      vendorName === "Google Inc." &&
      isOpera === false &&
      isIEedge === false
    ) {
      return true;
    } else {
      return false;
    }
  }



  /**
   * detect IE
   * returns version of IE or false, if browser is not Internet Explorer
   */
  detectIE() {
      var ua = window.navigator.userAgent;

      var msie = ua.indexOf('MSIE ');
      if (msie > 0) {
          // IE 10 or older => return version number
          return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
      }

      var trident = ua.indexOf('Trident/');
      if (trident > 0) {
          // IE 11 => return version number
          var rv = ua.indexOf('rv:');
          return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
      }

      var edge = ua.indexOf('Edge/');
      if (edge > 0) {
         // IE 12 => return version number
         return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
      }

      // other browser
      return false;
  }

  detectSafari() {
    return (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1);
  }



  // Function from David Walsh: http://davidwalsh.name/css-animation-callback
  whichTransitionEvent() {
    var t,
        el = document.createElement("fakeelement");

    var transitions = {
      "transition"      : "transitionend",
      "OTransition"     : "oTransitionEnd",
      "MozTransition"   : "transitionend",
      "WebkitTransition": "webkitTransitionEnd"
    }

    for (t in transitions){
      if (el.style[t] !== undefined){
        return transitions[t];
      }
    }
  }

/*
  *  Evaluate the highest impacts for a variant across all transcripts.
  *  Cull the impact if it already annotated for the canonical transcript
  *  or the impact is less severe than the one for the canonical
  *  transcripts.  Returns an object that looks like this:
  *  {HIGH: {frameshift:
  *            {
  *       transcripts: [ENST000245.1,ENSTxxxx],
  *       display: 'ENST000241.1,ENSTxxxx'
  *     }
  *     stop_gain:
  *       {
  *       transcripts: [ENST000245.1,ENSTxxxx],
  *       display: 'ENST000241.1,ENSTxxxx'
  *     }
  *     }
  * }
  */
  getNonCanonicalHighestImpactsVep(variant, impactMap) {
    let self = this;
    var vepHighestImpacts = {};
    for (var impactKey in variant.highestImpactVep) {
      var nonCanonicalEffects = [];
      var allEffects = variant.highestImpactVep[impactKey];

      var lowestImpactValue = 99;
      for (var key in variant.vepImpact) {
        var value = impactMap[key].value;
        if (value < lowestImpactValue) {
          lowestImpactValue = value;
        }
      }

      var theValue = impactMap[impactKey].value;
      if (theValue < lowestImpactValue) {
        for (var effectKey in allEffects) {
          var allTranscripts = allEffects[effectKey];
          if (Object.keys(allTranscripts).length > 0) {
            var ncObject = {};
            var transcriptUrls = "";
            for(var transcriptId in allTranscripts) {
              if (transcriptUrls.length > 0) {
                transcriptUrls += ", ";
              }
              var url = '<a href="javascript:void(0)" @click="selectTranscript(\'' + transcriptId + '\')">' + transcriptId + '</a>';
              transcriptUrls += url;
            }
            ncObject[effectKey] = {transcripts: Object.keys(allTranscripts), display: Object.keys(allTranscripts).join(","), url: transcriptUrls};
            nonCanonicalEffects.push(ncObject);
          }

        }

        if (nonCanonicalEffects.length > 0) {
          vepHighestImpacts[impactKey] = nonCanonicalEffects;
        }
      }
    }
    return vepHighestImpacts;
  }


  formatHgvsP(variant, value) {
    let me = this;
    if (value == null || value == '' || Object.keys(value).length == 0) {
      return "";
    } else {
      var buf = "";
      for(var key in value) {
        var tokens = key.split(":p.");
        if (buf.length > 0) {
          buf += " ";
        }
        if (tokens.length == 2) {
          var basicNotation = "p." + tokens[1];
          buf += basicNotation;
        } else if (tokens.length == 1 && me.endsWith(tokens[0],"(p.=)")) {
          // If synoymous variants, show p.(=) in cell
          if (variant.vepConsequence && Object.keys(variant.vepConsequence).length > 0) {
            for( consequence in variant.vepConsequence) {
              if (consequence == "synonymous_variant") {
                buf += "p.(=)";
              }
            }
          }
        }
      }
      return buf;
    }
  }

  formatHgvsC(variant, value, stripTranscript=true) {
    let me = this;
    if (value == null || value == '' || Object.keys(value).length == 0) {
      return "";
    } else {
      var buf = "";
      for(var key in value) {
        if (stripTranscript) {
          var tokens = key.split(":c.");
          if (buf.length > 0) {
            buf += " ";
          }
          if (tokens.length == 2) {
            var basicNotation = "c." + tokens[1];
            buf += basicNotation;
          }
        } else {
          if (buf.length > 0) {
            buf += " ";
          }
          buf+= key;
        }
      }
      return buf;
    }

  }

  getTooltipCoordinates(node, tooltip, containerWidth, topMargin) {
    var coord = {};
    var tooltipWidth  = d3.round(tooltip.node().offsetWidth);
    var tooltipHeight = d3.round(tooltip.node().offsetHeight);

    var matrix    = node.getScreenCTM()
                        .translate(+node.getAttribute("cx"), +node.getAttribute("cy"));
    var boundRect = node.getBoundingClientRect();
    coord.x       = d3.round(boundRect.left + (boundRect.width/2));
    coord.y       = window.pageYOffset + matrix.f + topMargin;
    coord.width   = boundRect.width;
    coord.height  = boundRect.height;

    // Position tooltip in the middle of the node
    coord.x = coord.x - (tooltipWidth/2);
    // Position tooltip above the node
    coord.y = coord.y - tooltipHeight;

    // If the tooltip will be cropped to the right, adjust its position
    // so that it is immediately to the left of the node
    if  ((coord.x + (tooltipWidth/2) + 150) > containerWidth) {
      coord.x -= tooltipWidth/2;
      coord.x -= 6;
      tooltip.classed("black-arrow-left", false);
      tooltip.classed("black-arrow-right", true);
    } else if (coord.x < tooltipWidth/2) {
      // If the tooltip will be cropped to the left, adjust its position
      // so that it is immediately to the right of the node
      coord.x += tooltipWidth/2;
      coord.x += 6;
      tooltip.classed("black-arrow-left", true);
      tooltip.classed("black-arrow-down-right", false);
    } else {
      // No cropping of tooltip on either side, just default to show tooltip
      // immediately to the left of the node
      coord.x += tooltipWidth/2;
      coord.x += 6;
      tooltip.classed("black-arrow-left", true);
      tooltip.classed("black-arrow-right", false);
    }
    return coord;
  }

  formatDisplay(variant, translator, isEduMode) {
    var me = this;
    var info = {
      coord: "",
      refalt: "",
      exon: "",
      inheritance: "",
      clinvarSig: "",
      clinvarSigSummary: "",
      clinvarUrl: "",
      clinvarLink: "",
      clinvarLinkKnownVariants: "",
      phenotype: "",
      phenotypeSimple: "",
      zygosity: "",
      af1000G: "",
      afgnomAD: "",
      vepImpact: "",
      vepHighestImpact: "",
      vepHighestImpactSimple: "",
      vepHighestImpactInfo: "",
      vepHighestImpactValue: "",
      vepHighestImpactRecs: [],
      vepConsequence: "",
      HGVSc: "",
      HGVSp: "",
      HGVScAbbrev: "",
      HGVSpAbbrev: "",
      HGVScLoading: false,
      HGVSpLoading: false,
      revel: "",
      sift: "",
      polyphen: "",
      regulatory: "",
      regulatoryMotifLinks: "",
      rsId: "",
      dbSnpUrl: "",
      dbSnpLink: "",
      filtersPassed: "",
    };


    info.coord = variant.chrom + ":" + variant.start;
    info.refalt = variant.ref + "->" + variant.alt;
    if (variant.ref == '' && variant.alt == '') {
      info.refalt = '(' + variant.len + ' bp)';
    }


    if (variant.hasOwnProperty("vepExon") && !$.isEmptyObject(variant.vepExon)) {
      info.exon += "Exon ";
      info.exon += Object.keys(variant.vepExon).join(",");
    }

    info.inheritance = translator.getInheritanceLabel(variant.inheritance);

    for (var key in variant.clinVarClinicalSignificance) {
      if (key != 'none' && key != 'undefined' ) {
        if (!isEduMode || (key.indexOf("uncertain_significance") >= 0 || key.indexOf("pathogenic") >= 0)) {
          if (info.clinvarSig.length > 0 ) {
              info.clinvarSig += ", ";
          }
          info.clinvarSig += key.split("_").join(" ");
        }
      }
    }

    for (var key in variant.clinVarPhenotype) {
      if (key != 'not_specified'  && key != 'undefined') {
        if (info.phenotype.length > 0) {
            info.phenotype += ", ";
        }
        info.phenotype += key.split("_").join(" ").split("\\x2c").join(", ");
      }
    }


    if (info.clinvarSig != null && info.clinvarSig != "") {
      if (variant.clinVarUid != null && variant.clinVarUid != '') {
        info.clinvarUrl = 'http://www.ncbi.nlm.nih.gov/clinvar/variation/' + variant.clinVarUid;
      } else if (variant.clinvarSubmissions != null && variant.clinvarSubmissions.length > 0) {
        var clinsigUniq = {};
        for (var idx = 0; idx < variant.clinvarSubmissions.length; idx++) {
          var submission = variant.clinvarSubmissions[idx];
          submission.clinsig.split(",").forEach(function(clinsig) {
            clinsigUniq[clinsig] = "";
          })
          var accessions = submission.accession.split(",");
          var clinsigs   = submission.clinsig.split(",");
          for (var i = 0; i < accessions.length; i++) {
            var accessionSingle = accessions[i];
            var clinsigSingle   = clinsigs.length > i ? clinsigs[i] : "?";

            info.clinvarUrl   = 'http://www.ncbi.nlm.nih.gov/clinvar/' + accessionSingle;
            info.clinvarLink  +=  '<a class="tooltip-clinvar-link"' + '" href="' + info.clinvarUrl + '" style="float:left;padding-right:4px" target="_new"' + '>' + clinsigSingle.split("_").join(" ") + '</a>';

            info.clinvarLinkKnownVariants += "<span style='clear:both' class='tooltip-clinsig-link" + clinsigSingle + "'>";
            info.clinvarLinkKnownVariants += '<a class="tooltip-clinvar-link"' + '" href="' + info.clinvarUrl + '" style="padding-right:4px" target="_new"' + '>' + clinsigSingle.split("_").join(" ") + '</a>';

          }

        };
        info.clinvarSigSummary = "";
        for (var clinsig in clinsigUniq) {
          var style = 'display:inline-block;'
          if (info.clinvarSigSummary.length > 0) {
            style += 'padding-left:5px';
          }
          info.clinvarSigSummary += "<span style='" + style +"' class='tooltip-clinsig-link" + clinsig + "'>";
          info.clinvarSigSummary += "<span style='float:left'>" + clinsig.split("_").join(" ") + "</span>";
          info.clinvarSigSummary += "</span>";
        }
      }
    }

    if (variant.zygosity && variant.zygosity.toLowerCase() == 'het') {
      info.zygosity = "Heterozygous";
    } else if (variant.zygosity && variant.zygosity.toLowerCase() == 'hom') {
      info.zygosity = "Homozygous";
    }

    if (variant.af1000G) {
      info.af1000G =  +variant.af1000G >= 0 ? me.globalApp.utility.round(+variant.af1000G * 100, 2) + "%" : "";
    }
    if (variant.afgnomAD) {
      info.afgnomAD =  +variant.afgnomAD >= 0 ? me.globalApp.utility.round(+variant.afgnomAD * 100, 2) + "%" : "";
    }


    for (var key in variant.vepImpact) {
      if (info.vepImpact.length > 0) {
          info.vepImpact += ", ";
      }
      if (isEduMode) {
        info.vepImpact = me.impactEduMode[key];
      } else {
        info.vepImpact += key.toLowerCase();
      }
    }


    // If the highest impact occurs in a non-canonical transcript, show the impact followed by
    // the consequence and corresponding transcripts
    var vepHighestImpacts = me.globalApp.utility.getNonCanonicalHighestImpactsVep(variant, translator.impactMap);
    info.vepHighestImpactRecs = [];
    for (var impactKey in vepHighestImpacts) {

      let impactRec = {impact: impactKey, effects: []};

      var nonCanonicalEffects = vepHighestImpacts[impactKey];
      if (info.vepHighestImpact.length > 0) {
          info.vepHighestImpact += ", ";
          info.vepHighestImpactSimple += ", ";
          info.vepHighestImpactInfo += ", ";
      }

      info.vepHighestImpact       += impactKey.toLowerCase();
      info.vepHighestImpactSimple += impactKey.toLowerCase();
      info.vepHighestImpactInfo   += impactKey.toLowerCase();
      if (info.vepHighestImpactValue == null || info.vepHighestImpactValue.length == 0) {
        info.vepHighestImpactValue  = impactKey.toUpperCase();
      }

      nonCanonicalEffects.forEach(function(nonCanonicalEffect) {
        info.vepHighestImpact += "<span>  (";
        let effectRec = {};
        for (var effectKey in nonCanonicalEffect) {
          effectRec = {key: effectKey, display: effectKey.split("_").join(" ").split("\&").join(" & ").split(" variant").join(""), transcripts: nonCanonicalEffect[effectKey].transcripts};

          var transcriptString = nonCanonicalEffect[effectKey].url;
          info.vepHighestImpact     += " " + effectKey.split("\&").join(" & ") + ' in ' + transcriptString;
          info.vepHighestImpactInfo += " " + effectKey.split("\&").join(" & ") + " in " + nonCanonicalEffect[effectKey].display;

          impactRec.effects.push(effectRec);
        }
        info.vepHighestImpact += ")</span> ";
      })
      info.vepHighestImpactSimple += " in non-canonical transcripts";

      info.vepHighestImpactRecs.push(impactRec);

    }


    for (var key in variant.vepConsequence) {
      if (info.vepConsequence.length > 0) {
          info.vepConsequence += ", ";
      }
      if (isEduMode) {
        info.vepConsequence = key.split("_").join(" ").toLowerCase();
      } else {
        info.vepConsequence += key.split("_").join(" ").toLowerCase();
      }
    }
    if (variant.fbCalled == 'Y' || variant.extraAnnot) {
      for (var key in variant.vepHGVSc) {
        if (key.length > 0) {
          if (info.HGVSc.length > 0) {
              info.HGVSc += ", ";
          }
          info.HGVSc += key;
        }
      }
      for (var key in variant.vepHGVSp) {
        if (key.length > 0) {
          if (info.HGVSp.length > 0) {
              info.HGVSp += ", ";
          }
          info.HGVSp += key;
        }
      }
      info.HGVSpAbbrev = me.formatHgvsP(variant, variant.vepHGVSp);
      info.HGVScAbbrev = me.formatHgvsC(variant, variant.vepHGVSc);
    } else {
      info.HGVScLoading = true;
      info.HGVSpLoading = true;
    }


    for (var key in variant.vepSIFT) {
      if (info.sift.length > 0) {
          info.sift += ", ";
      }
      info.sift += key.split("_").join(" ");
    }
    for (var key in variant.vepPolyPhen) {
      if (info.polyphen.length > 0) {
          info.polyphen += ", ";
      }
      if (isEduMode) {
        info.polyphen = key.split("_").join(" ");
      } else {
        info.polyphen += key.split("_").join(" ");
      }
    }
    for (var key in variant.vepREVEL) {
      if (info.revel.length > 0) {
          info.revel += ", ";
      }
      info.revel += key;
    }

    for (var key in variant.regulatory) {
      // Bypass motif-based features
      if (key.indexOf("mot_") == 0) {
        continue;
      }
      if (info.regulatory.length > 0) {
          info.regulatory += ", ";
      }
      var value = variant.regulatory[key];
      info.regulatory += value;
    }


    if (variant.vepRegs) {
      for (var i = 0; i < variant.vepRegs.length; i++) {
        var vr = variant.vepRegs[i];
        if (vr.motifName != null && vr.motifName != '') {

          if (info.regulatoryMotifLinks.length > 0) {
              info.regulatoryMotifLinks += ", ";
          }

          var tokens = vr.motifName.split(":");
          var baseMotifName;
          if (tokens.length == 2) {
            baseMotifName = tokens[1];
          }

          var regUrl = "http://jaspar.genereg.net/cgi-bin/jaspar_db.pl?ID=" + baseMotifName + "&rm=present&collection=CORE"
          info.regulatoryMotifLinks += '<a href="' + regUrl + '" target="_motif">' + vr.motifName + '</a>';
        }
      }
    }

    info.rsId = me.globalApp.utility.getRsId(variant);
    if (info.rsId && info.rsId != '') {
      info.dbSnpUrl   = "http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=" + info.rsId ;
      info.dbSnpLink =  '<a href="' + info.dbSnpUrl + '" target="_dbsnp"' + '>' + info.rsId  + '</a>';
    }

    info.filtersPassed = variant.filtersPassed ? variant.filtersPassed.join(",") : "";

    return info;
  }

  getTrackColor(idx, isTumor) {
    let tumorColors = ['#7f1010', '#ce0e4b', '#ce8510', '#ef0000'];
    let normalColors = ['#10487f', '#107f7f', '#487f10', '#10117f'];

    if (isTumor) {
      return tumorColors[idx];
    } else {
      return normalColors[idx];
    }
  }

}
export default Util


