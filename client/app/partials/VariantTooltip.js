export default class VariantTooltip {

  constructor(globalApp, genericAnnotation, glyph, translator, annotationScheme, genomeBuildHelper, tipType) {
    this.globalApp = globalApp;
    this.genericAnnotation = genericAnnotation;
    this.glyph = glyph;
    this.translator = translator;
    this.annotationScheme = annotationScheme;
    this.genomeBuildHelper = genomeBuildHelper;
    this.WIDTH = tipType === "click" ? 460 : 360;
    this.ARROW_OFFSET = 10;
    this.ARROW_WIDTH = 10;
    this.SIDE_TOOLTIP_HORZ_OFFSET = 35;
    this.SIDE_TOOLTIP_VERT_OFFSET = 30;
    this.VALUE_EMPTY        = "-";
    this.tipType = tipType;
  }


  fillAndPositionTooltip(tooltip, variant, geneObject, theTranscript, lock, coord, trackId, affectedInfo, cohortMode, maxAlleleCount, html) {
    const me = this;
    if (lock) {
      return;
    }
    tooltip.style("z-index", 1032);

    if (me.tipType === "click") {
        tooltip.transition()
            .duration(1000)
            .style("opacity", 1)
            .style("pointer-events", "all");
    } else {
        tooltip.transition()
            .duration(1000)
            .style("opacity", .9)
            .style("pointer-events", "all");
    }

    if (html == null) {
      let pinMessage = "click on variant for more details";
      if (me.tipType === "click") {
          html = me.formatClickContent(variant, pinMessage, 'tooltip', geneObject, theTranscript, trackId, lock);
      } else {
          html = me.formatHoverContent(variant, pinMessage, 'tooltip', geneObject, theTranscript, trackId, lock);
      }
    }
    tooltip.html(html);
    me.injectVariantGlyphs(tooltip, variant, lock ? '.tooltip-wide' : '.tooltip');

    let w = me.WIDTH;
    let h = d3.round(tooltip[0][0].offsetHeight);

    // We use css variables to place the tooltip chevron in the middle, center of the tooltip
    let middlePos = (h/2);
    tooltip.style("--tooltip-middle", middlePos  + "px");
    tooltip.style("--tooltip-middle-before", (middlePos - 3) + "px");

    let centerPos = (w/2);
    tooltip.style("--tooltip-center", centerPos + "px");
    tooltip.style("--tooltip-center-before", (centerPos - 3) + "px");
    tooltip.classed("chevron", false);
    tooltip.classed("chevron-vertical", false);
    tooltip.classed("chevron-horizontal", false);
    tooltip.classed("chevron-top", false);
    tooltip.classed("chevron-bottom", false);
    tooltip.classed("chevron-middle", false);
    tooltip.classed("chevron-left", false);
    tooltip.classed("chevron-right", false);
    tooltip.classed("chevron-center", false);

    let x = coord.x;
    let y = coord.y;
    let yScroll = window.pageYOffset;

    let tooltipPos = {
      top: null,
      left: null,
      arrowClasses: []
    };

    me.findBestTooltipPosition(tooltipPos, coord, x, y, h, w, yScroll);
    if (tooltipPos.left && tooltipPos.top) {
      tooltipPos.arrowClasses.forEach(function(arrowClass) {
        tooltip.classed(arrowClass, true);
      });
      tooltip.style("width", w + "px")
             .style("left", tooltipPos.left + "px")
             .style("text-align", 'left')
             .style("top", tooltipPos.top + "px");
    }
  }

  findBestTooltipPosition(tooltipPos, coord, x, y, h, w, yScroll) {
    const me = this;
    let availSpace = {
      'top':    {allowed: false},
      'bottom': {allowed: false},
      'middle': {allowed: false},
      'right':  {allowed: false},
      'left':   {allowed: false},
      'center': {allowed: false},
    };

    // If the tooltip sits above the element, is the top of the tooltip
    // below the top of the window?
    if ( (y - h) - yScroll >= 0) {
      availSpace.top.allowed = true;
      availSpace.top.tooltipTop = y - h;
      availSpace.top.sideTooltipVertOffset = me.SIDE_TOOLTIP_VERT_OFFSET;
    }
    // If the tooltip sits below the elements, is the bottom of the tooltip
    // above the bottom of the window?
    if ( (y + coord.height + h) - yScroll < me.globalApp.utility.visibleHeight($('body'))) {
      availSpace.bottom.allowed = true;
      availSpace.bottom.tooltipTop = y + coord.height;
      availSpace.bottom.sideTooltipVertOffset = -1 * me.SIDE_TOOLTIP_VERT_OFFSET;
    }
    // If the tooltip sits in the center (either to the left or right) of the element,
    // are both top and bottom edges within the window?
    if ((y + coord.height/2) - (h/2) - yScroll >= 0
      && ((y + coord.height/2) + (h/2) - yScroll < me.globalApp.utility.visibleHeight($('body')))) {
      availSpace.middle.allowed = true;
      availSpace.middle.tooltipTop = y + (coord.height/2);
      availSpace.middle.sideTooltipVertOffset = -1 * (h/2);
    }
    // If the tooltip sits to the right of the element, is the right
    // edge of the tooltip inside the window?
    if (x > 0 && (x+w) < coord.parentWidth) {
      availSpace.right.allowed = true;
      availSpace.right.tooltipLeft = x;
      availSpace.right.tooltipLeftOffset = -1 * (me.ARROW_OFFSET + me.ARROW_WIDTH);
      availSpace.right.sideTooltipHorzOffset = me.SIDE_TOOLTIP_HORZ_OFFSET;
    }
    // If the tooltip sits to the left of the element, is the left
    // edge of the tooltip within the window?
    if (x - w > 0 ) {
      availSpace.left.allowed = true;
      availSpace.left.tooltipLeft = (x - w);
      availSpace.left.tooltipLeftOffset = me.ARROW_OFFSET + me.ARROW_WIDTH;
      availSpace.left.sideTooltipHorzOffset = -1 * me.SIDE_TOOLTIP_HORZ_OFFSET;
    }
    // If the tooltip sits in the center (either above or below) of the element,
    // are both left and right edges within the window?
    if (x - (w/2) > 0 && x + (w/2) < coord.parentWidth) {
      availSpace.center.allowed = true;
      availSpace.center.tooltipLeft = x - (w/2);
      availSpace.center.tooltipLeftOffset =  me.ARROW_WIDTH;
      availSpace.center.sideTooltipHorzOffset = 0;
    }

    let found = false;
    let assignTooltip = function(key1, key2, force=false) {
      found = false;
      tooltipPos.top = null;
      tooltipPos.left = null;
      tooltipPos.arrowClasses = ['chevron'];

      tooltipPos.top  = availSpace[key1].tooltipTop  ? availSpace[key1].tooltipTop  : availSpace[key2].tooltipTop;
      tooltipPos.left = availSpace[key1].tooltipLeft ? availSpace[key1].tooltipLeft + availSpace[key1].tooltipLeftOffset : availSpace[key2].tooltipLeft + availSpace[key2].tooltipLeftOffset;
      found = (tooltipPos.top && tooltipPos.left) || force;

      if (found) {
        if (key1 === 'top' || key1 === 'bottom') {
          tooltipPos.arrowClasses.push('chevron-vertical');
        } else {
          tooltipPos.arrowClasses.push('chevron-horizontal');
          tooltipPos.left += availSpace[key1].sideTooltipHorzOffset;
          tooltipPos.top  += availSpace[key2].sideTooltipVertOffset;
        }
        tooltipPos.arrowClasses.push("chevron-" + key1);
        tooltipPos.arrowClasses.push("chevron-" + key2);
      }
    };

    coord.preferredPositions.forEach(function(preferredPos) {
      for (var key1 in preferredPos) {
        if (!found && availSpace[key1].allowed) {
          preferredPos[key1].forEach(function(key2) {
            if (!found && availSpace[key2].allowed) {
              assignTooltip(key1, key2);
            }
          })
        }
      }
    });
    // If we can't find enough space, just choose first preferred position.
    if (!found) {
      let pp = coord.preferredPositions[0];
      let key1 = Object.keys(pp)[0];
      let key2 = pp[key1][0];
      assignTooltip(key1, key2, true)
    }
  }

  injectVariantGlyphs(tooltip, variant, selector) {
    const me = this;
    let tooltipNode = $(tooltip.node());

    let injectClinvarBadge = function(clinsig, key, translate) {
      clinsig.split(",").forEach( function(clinsigToken) {
        if (me.translator.clinvarMap.hasOwnProperty(clinsigToken)) {
            var clazz = me.translator.clinvarMap[clinsigToken].clazz;
            var badge = me.translator.clinvarMap[clinsigToken].examineBadge;

            var linkSelector =  ".tooltip-clinsig-link" + key;
            if (badge && tooltipNode.find(linkSelector).length > 0) {
              var div = tooltipNode.find(linkSelector);
            $(div).prepend("<svg class=\"clinvar-badge\" style=\"float:left\"  height=\"12\" width=\"14\">");
            var svg = d3.select($(div).find("svg.clinvar-badge")[0]);
            var selection = svg.data([{width:10, height:10, transform: (translate ? translate : 'translate(0,1)'), clazz: clazz}]);
            me.glyph.showClinVarSymbol(selection);
            }
        }
      })
    };
    if (variant.clinvarSubmissions && variant.clinvarSubmissions.length > 0) {
      let clinsigUniq = {};
      variant.clinvarSubmissions.forEach(function(submission) {
        submission.clinsig.split(",").forEach(function(clinsig) {
          clinsigUniq[clinsig] = "";
        })
      });
      for (let clinsig in clinsigUniq) {
        injectClinvarBadge(clinsig, clinsig, 'translate(0,0)');
      }
    } else if (variant.clinVarClinicalSignificance) {
      for (let clinsig in variant.clinVarClinicalSignificance) {
        var key = variant.clinVarClinicalSignificance[clinsig];
        injectClinvarBadge(clinsig, key);
      }
    }
    // tooltip TODO: update this to display somatic, inherited, undetermined badges
    if (variant.inheritance && variant.inheritance !== '') {
      var clazz = me.translator.inheritanceMap[variant.inheritance].clazz;
      var symbolFunction = me.translator.inheritanceMap[variant.inheritance].symbolFunction;
      if (tooltipNode.find(".tooltip-title:contains('inheritance')").length > 0) {
        tooltipNode.find(".tooltip-title:contains('inheritance')").prepend("<svg class=\"inheritance-badge\"  height=\"15\" width=\"16\">");
        var options = {width:15, height:15, transform: 'translate(0,0)'};
        var selection = tooltip.select('.inheritance-badge').data([{clazz: clazz}]);
        symbolFunction(selection, options);
      }
    }

    // tooltip TODO: add cosmic badge, etc
  }

  formatHoverContent(variant, pinMessage, tooltipClazz, geneObject, theTranscript, trackId, lock) {
    const me = this;

    let info = me.globalApp.utility.formatDisplay(variant, me.translator, me.isEduMode);

    // Called variant information
    let calledVariantRow = "";
    if (variant.hasOwnProperty("fbCalled") && variant.fbCalled === "Y") {
      var calledGlyph = '<i id="gene-badge-called" class="material-icons glyph" style="display:inline-block;font-size:15px;vertical-align:top;float:initial">check_circle</i>';
      var marginTop = tooltipClazz === 'tooltip-wide' ? ';margin-top: 1px;' : ';margin-top: 3px;';
      calledGlyph    += '<span style="display: inline-block;vertical-align: top;margin-left:3px' + marginTop + '">Called variant</span>';
      calledVariantRow = me._tooltipMainHeaderRow(calledGlyph, '', '', '');
    }

    // Clinvar information
    let clinvarSimpleRow1 = '';
    let clinvarSimpleRow2 = '';
    if (info.clinvarSig !== "") {
      if (variant.clinVarUid != null && variant.clinVarUid !== '') {
        clinvarSimpleRow1 = me._tooltipWideHeadingSecondRow('ClinVar', '<span class="tooltip-clinsig-link">' + info.clinvarSig + '</span>', null);
        if (info.phenotype) {
          clinvarSimpleRow2 = me._tooltipWideHeadingSecondRow('&nbsp;', info.phenotype, null, 'tooltip-clinvar-pheno');
        }
      } else if (variant.clinvarSubmissions != null && variant.clinvarSubmissions.length > 0) {
        clinvarSimpleRow1 = me._tooltipSimpleClinvarSigRow('ClinVar', info.clinvarSigSummary );
        clinvarSimpleRow2 = me._tooltipHeaderRow(info.phenotypeSimple !== '' ? info.phenotypeSimple : info.phenotype, '', '', '', '', null, 'style=padding-top:0px');
      }
    }

    // Impact information
    let vepHighestImpactRowSimple = "";
    if (info.vepHighestImpact.length > 0) {
      vepHighestImpactRowSimple = me._tooltipHeaderRow(info.vepHighestImpactSimple, '', '', '', 'highest-impact-badge');
    }

    // Somatic information
    let inheritanceModeRow =  me._tooltipHeaderRow('<span class="tooltip-inheritance-mode-label">'
                    + me.translator.getSomaticLabel(variant.isInherited) + ' </span>', '', '', '', null, 'padding-top:0px;');

    // Cosmic information
    let cosmicRow =  variant.inCosmic == null || variant.inCosmic === false ? ''
          : me._tooltipHeaderRow('<span class="tooltip-cosmic-label">' + me.translator.getCosmicLabel(variant.inCosmic) + ' </span>', '', '', '', null, 'padding-top:0px;');

    // Sift and PolyPhen information
    let siftLabel = info.sift !== ''  && info.sift  !== 'unknown' ? 'SIFT ' + info.sift : "";
    let polyphenLabel = info.polyphen  !== '' && info.polyphen !== 'unknown' ? 'PolyPhen ' + info.polyphen : "";
    let sep = siftLabel !== '' && polyphenLabel !== '' ? '&nbsp;&nbsp;&nbsp;&nbsp;' : '';
    let siftPolyphenRow = '';
    if (siftLabel || polyphenLabel) {
      siftPolyphenRow = me._tooltipClassedRow(polyphenLabel + sep, 'polyphen', siftLabel, 'sift', 'padding-top:2px;');
    }
    let polyphenRowSimple = info.polyphen !== "" ? me._tooltipWideHeadingRow('Predicted effect', info.polyphen + ' to protein', '2px') : "";

    // Genotype information
    let genotypeRow = me.isEduMode && me.tourNumber === 2 ? me._tooltipHeaderRow('Genotype', me.globalApp.utility.switchGenotype(variant.eduGenotype), '','')  : "";

    // AF information
    let sampleAf = 0;
    if (parseInt(variant.genotypeDepth) > 0) {
        sampleAf = parseInt(variant.genotypeAltCount) / parseInt(variant.genotypeDepth);
    }
    let afRow = me._tooltipMainHeaderRow('Allele Freq', (sampleAf > 0 ?  me.globalApp.utility.percentage(sampleAf) : '0%'),'','');

    if (trackId === 'matrix') {
      // Don't show AF if we're hovering over matrix - may be in multiple tracks at diff AFs
      return (
        me._tooltipMainHeaderRow(geneObject ? geneObject.gene_name : "", variant.type ? variant.type.toUpperCase() : "", info.refalt + " " + info.coord, info.dbSnpLink, 'ref-alt')
        + calledVariantRow
        + me._tooltipMainHeaderRow(info.vepImpact, info.vepConsequence, '', '', 'impact-badge')
        + vepHighestImpactRowSimple
        + inheritanceModeRow
        + (trackId === 'known-variants' ? me._tooltipRow('&nbsp;', info.clinvarLinkKnownVariants, '6px')  : clinvarSimpleRow1)
        + clinvarSimpleRow2
        + cosmicRow
        +  me._linksRow(variant, pinMessage)
      );
    } else {
          return (
              me._tooltipMainHeaderRow(geneObject ? geneObject.gene_name : "", variant.type ? variant.type.toUpperCase() : "", info.refalt + " " + info.coord, info.dbSnpLink, 'ref-alt')
              + calledVariantRow
              + me._tooltipMainHeaderRow(info.vepImpact, info.vepConsequence, '', '', 'impact-badge')
              + vepHighestImpactRowSimple
              + inheritanceModeRow
              + afRow
              + (trackId === 'known-variants' ? me._tooltipRow('&nbsp;', info.clinvarLinkKnownVariants, '6px')  : clinvarSimpleRow1)
              + clinvarSimpleRow2
              + cosmicRow
              + me._linksRow(variant, pinMessage)
          );
      }
  }

  formatClickContent(variant, pinMessage, tooltipClazz, geneObject, theTranscript, trackId, lock) {
      const me = this;

      let info = me.globalApp.utility.formatDisplay(variant, me.translator, me.isEduMode);

      // Called variant information
      let calledVariantRow = "";
      if (variant.hasOwnProperty("fbCalled") && variant.fbCalled === "Y") {
          let calledGlyph = '<i id="gene-badge-called" class="material-icons glyph" style="display:inline-block;font-size:15px;vertical-align:top;float:initial">check_circle</i>';
          let marginTop = tooltipClazz === 'tooltip-wide' ? ';margin-top: 1px;' : ';margin-top: 3px;';
          calledGlyph += '<span style="display: inline-block;vertical-align: top;margin-left:3px' + marginTop + '">Called variant</span>';
          calledVariantRow = me._tooltipMainHeaderRow(calledGlyph, '', '', '');
      }

      if (trackId === 'matrix') {
          // Don't show AF if we're hovering over matrix - may be in multiple tracks at diff AFs
          return (
              me._tooltipClickHeader("Variant Details", geneObject ? geneObject.gene_name : "", variant.type ? variant.type.toUpperCase() : "", info.refalt + " " + info.coord, info.dbSnpLink)
              + calledVariantRow
              + me._tooltipMainHeaderRow(info.vepImpact, info.vepConsequence, '', '', 'impact-badge')
              + vepHighestImpactRowSimple
              + inheritanceModeRow
              + (trackId === 'known-variants' ? me._tooltipRow('&nbsp;', info.clinvarLinkKnownVariants, '6px')  : clinvarSimpleRow1)
              + clinvarSimpleRow2
              + cosmicRow
              +  me._linksRow(variant, pinMessage)
          );
      } else {
          let positionInfo = (geneObject ? geneObject.gene_name : "") + " " + info.coord;
          let clinvarInfo = me.globalApp.utility.capitalizeFirstLetter(info.clinvarSig);
          return (
              me._tooltipClickHeader("Variant Details")
              + me._tooltipLabeledRow('Position', positionInfo, 'click-label', 'click-value')
              + me._tooltipLabeledRow('Type', me.globalApp.utility.translateVariantType(variant.type), 'click-label', 'click-value')
              + me._tooltipLabeledRow('Base \u0394', info.refalt, 'click-label', 'click-value')
              + me._tooltipLabeledRow('Impact', me.globalApp.utility.capitalizeFirstLetter(info.vepImpact), 'click-label', 'click-value')
              + me._tooltipLabeledRow('Is Somatic', variant.isInherited == null ? 'Unable to determine': variant.isInherited === true ? 'No' : 'Yes', 'click-label', 'click-value')
              + me._tooltipLabeledRow('In COSMIC', variant.inCosmic === true ? 'Yes' : 'No', 'click-label', 'click-value')
              + me._tooltipLabeledRow('ClinVar', clinvarInfo === "" ? "N/A" : clinvarInfo, 'click-label', 'click-value')

              // + me._tooltipMainHeaderRow(info.vepImpact, info.vepConsequence, '', '', 'impact-badge')
              // + vepHighestImpactRowSimple
              // + inheritanceModeRow
              // + afRow
              // + (trackId === 'known-variants' ? me._tooltipRow('&nbsp;', info.clinvarLinkKnownVariants, '6px')  : clinvarSimpleRow1)
              // + clinvarSimpleRow2
              // + cosmicRow
              // + me._linksRow(variant, pinMessage)
          );
      }
  }


  _linksRow(variant, pinMessage) {
    if (pinMessage == null) {
      pinMessage = 'Click on variant for more details';
    }
    return '<div class="row tooltip-footer">'
      + '<div class="col-md-12 pin-message" style="text-align:right;">' +  pinMessage + '</div>'
      + '</div>';
  }


  _tooltipHeaderRow(value1, value2, value3, value4, clazz, style) {
    var theStyle = style ? style : '';
    var clazzList = "col-md-12 tooltip-title";
    if (clazz) {
      clazzList += " " + clazz;
    }
    return '<div class="row" style="' + theStyle + '">'
          + '<div class="' + clazzList + '" style="text-align:center">' + value1 + ' ' + value2 + ' ' + value3 +  ' ' + value4 + '</div>'
          + '</div>';
  }

  _tooltipMainHeaderRow(value1, value2, value3, value4, clazz) {
    var theClass = "col-md-12 tooltip-title main-header";
    if (clazz) {
      theClass += " " + clazz;
    }
    return '<div class="row">'
          + '<div class="' + theClass + '" style="text-align:center">' + value1 + ' ' + value2 + ' ' + value3 +  ' ' + value4 + '</div>'
          + '</div>';
  }

  _tooltipClickHeader(tooltipName, value1, value2, value3, value4) {
    let titleLine = '<div class="click-tip-header">' + tooltipName +  '</div><hr class="click-tip-divider">';
    // let subTitleLine = '<div>' + '<span style="text-align: left">' + value1 + ' ' + value2 + ' ' + value3 + ' ' + value4 + '</span></div>';
    // TODO: add flag button here
    return titleLine;
  }

  _tooltipClassedRow(value1, class1, value2, class2, style) {
    var theStyle = style ? style : '';
    return '<div class="row" style="' + theStyle + '">'
          +  '<div class="col-md-12 tooltip-title" style="text-align:center">'
          +    "<span class='" + class1 + "'>" + value1 + '</span>'
          +    "<span class='" + class2 + "'>" + value2 + '</span>'
          +  '</div>'
          + '</div>';
  }

  _tooltipLabeledRow(label, value, labelClazz, valueClazz) {
    return '<div class="row" style="padding: 2px 0px">'
          + '<div class="col-xs-3 "' + labelClazz + 'style="text-align:left;word-break:normal">' + label +':</div>'
          + '<div class="col-xs-9 "' + valueClazz + 'style="text-align:left;word-break:normal">' + value + '</div>'
          + '</div>';
  }

  _tooltipWideHeadingRow(value1, value2, paddingTop) {
    var thePaddingTop = paddingTop ? "padding-top:" + paddingTop + ";" : "";
    return '<div class="row" style="padding-bottom:5px;' + thePaddingTop + '">'
          + '<div class="col-sm-4 tooltip-title"  style="text-align:right;word-break:normal">' + value1  +'</div>'
          + '<div class="col-sm-8 tooltip-title" style="text-align:left;word-break:normal">' + value2 + '</div>'
          + '</div>';
  }
  _tooltipWideHeadingSecondRow(value1, value2, paddingTop, valueClazz) {
    var thePaddingTop = paddingTop ? "padding-top:" + paddingTop + ";" : "";
    return '<div class="row" style="padding-bottom:5px;' + thePaddingTop + '">'
          + '<div class="col-sm-4 tooltip-title" style="text-align:right;word-break:normal">' + value1  +'</div>'
          + '<div class="col-sm-8 tooltip-title' + (valueClazz ? ' ' + valueClazz : '') + '" style="text-align:left;word-break:normal">' + value2 + '</div>'
          + '</div>';
  }
  _tooltipSimpleClinvarSigRow(value1, value2) {
    return '<div class="row" style="padding-bottom:0px;padding-top: 5px">'
          + '<div class="col-sm-4 tooltip-title" style="text-align:right;word-break:normal">' + value1  +'</div>'
          + '<div class="col-sm-8 tooltip-title style="text-align:left;word-break:normal">' + value2 + '</div>'
          + '</div>';
  }

  _tooltipRow(label, value, paddingTop, alwaysShow, valueClazz, paddingBottom) {
    if (alwaysShow || (value && value !== '')) {
      var style = paddingTop || paddingBottom ?
                    (' style="'
                     + (paddingTop    ? 'padding-top:'    + paddingTop + ';'  : '' )
                     + (paddingBottom ? 'padding-bottom:' + paddingBottom + ';' : '')
                     + '"') : '';
      var valueClazzes = "tooltip-value";
      if (valueClazz) {
        valueClazzes += " " + valueClazz;
      }
      if (value === "") {
        value = this.VALUE_EMPTY;
      }
      return '<div class="tooltip-row"' + style + '>'
            + '<div class="tooltip-header" style="text-align:right">' + label + '</div>'
            + '<div class="' + valueClazzes + '">' + value + '</div>'
            + '</div>';
    } else {
      return "";
    }
  }

}


