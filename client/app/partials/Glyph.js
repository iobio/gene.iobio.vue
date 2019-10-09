export default class Glyph {

  constructor(translator) {
    this.translator = translator;

    this.CELL_SIZE_SMALL           = 18;
    this.CELL_SIZE_LARGE           = 22;
    this.CELL_SIZE                 = this.CELL_SIZE_LARGE;
    this.CELL_SIZE_EDU             = 23;
    this.CELL_WIDTH_BASIC          = 160;
  }


  showFlaggedSymbol(selection, options) {
    var width, height, clazz;
    options = options || {};

    var datumAttrs = selection.datum() || {};

    var attrs = {
      width: "15" ,
      height: "15" ,
      transform: "translate(1,1)",
      clazz: ""
    };


    var cellSizeAttrs = {};
    if (options.cellSize > 18) {
      cellSizeAttrs.width  = "18",
      cellSizeAttrs.height = "18",
      cellSizeAttrs.transform =  "translate(1,1)"
    }

    $.extend(attrs, datumAttrs, cellSizeAttrs, options);

    selection.append("g")
             .attr("transform", attrs.transform)
             .append("use")
             .attr("xlink:href", "#" + datumAttrs.clazz + "-symbol")
             .style("pointer-events", "none")
             .attr("width", function(d,i)  { return cellSizeAttrs.width })
             .attr("height", function(d,i) { return cellSizeAttrs.height  });
  };

  showClinVarSymbol(selection, options) {
    var width, height, clazz;
    options = options || {};

    var attrs = {
      width: "14",
      height: "14",
      transform: "translate(2,1)",
      clazz: ""
    };

    var datumAttrs = selection.datum() || {};

    var cellSizeAttrs = {};
    if (options.cellSize > 18) {
      cellSizeAttrs.width = "17",
      cellSizeAttrs.height = "17",
      cellSizeAttrs.transform = "translate(2,2)"
    }

    $.extend(attrs, datumAttrs, cellSizeAttrs, options);

    var colors = {
      clinvar_path: "#ad494A",
      clinvar_lpath: "#FB7737",
      clinvar_uc: "rgba(231,186,82,1)",
      clinvar_benign: "rgba(156,194,49,1)",
      clinvar_lbenign: "rgba(181,207,107,1)",
      clinvar_other: "rgb(189,189,189)",
      clinvar_cd: "rgb(111, 182, 180)"
    };

    selection.append("g")
             .attr("transform", attrs.transform)
             .append("use")
             .attr("xlink:href", "#clinvar-glyph")
             .attr("width", attrs.width)
             .attr("height", attrs.height)
             .style("pointer-events", "none")
             .style("fill", colors[attrs.clazz]);
  };

  showSomaticSymbol(selection, options) {
      var width, height, clazz;
      options = options || {};

      var attrs = {
          width: "14",
          height: "14",
          transform: "translate(2,1)",
          clazz: ""
      };

      var datumAttrs = selection.datum() || {};

      var cellSizeAttrs = {};
      if (options.cellSize > 18) {
          cellSizeAttrs.width = "17",
          cellSizeAttrs.height = "17",
          cellSizeAttrs.transform = "translate(2,2)"
      }

      $.extend(attrs, datumAttrs, cellSizeAttrs, options);

      selection.append("g")
          .attr("transform", attrs.transform)
          .append("use")
          .attr("xlink:href", "#somatic-glyph")
          .attr("width", attrs.width)
          .attr("height", attrs.height)
          .style("pointer-events", "none")
          .style("fill", "#7f107f");
  }

    showUndeterminedSymbol(selection, options) {
        var width, height, clazz;
        options = options || {};

        var attrs = {
            width: "14",
            height: "14",
            transform: "translate(2,1)",
            clazz: ""
        };

        var datumAttrs = selection.datum() || {};

        var cellSizeAttrs = {};
        if (options.cellSize > 18) {
            cellSizeAttrs.width = "17",
                cellSizeAttrs.height = "17",
                cellSizeAttrs.transform = "translate(2,2)"
        }

        $.extend(attrs, datumAttrs, cellSizeAttrs, options);

        selection.append("g")
            .attr("transform", attrs.transform)
            .append("use")
            .attr("xlink:href", "#question-mark-symbol")
            .attr("width", attrs.width)
            .attr("height", attrs.height)
            .style("pointer-events", "none")
            .style("fill", "#888888");
    }

  // Uses material design font lib
  showCosmicSymbol(selection, options) {
      options = options || {};

      // var attrs = {
      //     transform: "translate(1,17)",
      //     styles: "font-size: 16px"
      // };
      // if (options && options.styles) {
      //     attrs.styles = options.styles;
      // }
      // if (options && options.transform) {
      //     attrs.transform = options.transform;
      // }
      //
      // var datumAttrs = selection.datum() || {};
      //
      // var cellSizeAttrs = {};
      // if (options.cellSize > 18) {
      //     cellSizeAttrs.width = "17",
      //     cellSizeAttrs.height = "17",
      //     cellSizeAttrs.transform = "translate(2,2)"
      // }
      //
      // $.extend(attrs, datumAttrs, cellSizeAttrs, options);

      // selection.append("text")
      //     .attr('font-family', 'Material Icons')
      //     .attr('style', attrs.styles)
      //     .attr("transform", attrs.transform)
      //     .style("fill", "#28446F")
      //     .text('copyright');

      var attrs = {
          width: "14",
          height: "14",
          transform: "translate(2,1)",
          clazz: ""
      };

      var datumAttrs = selection.datum() || {};

      var cellSizeAttrs = {};
      if (options.cellSize > 18) {
          cellSizeAttrs.width = "17",
              cellSizeAttrs.height = "17",
              cellSizeAttrs.transform = "translate(2,2)"
      }

      $.extend(attrs, datumAttrs, cellSizeAttrs, options);

      selection.append("g")
          .attr("transform", attrs.transform)
          .append("use")
          .attr("xlink:href", "#somatic-glyph")
          .attr("width", attrs.width)
          .attr("height", attrs.height)
          .style("pointer-events", "none")
          .style("fill", "#28446F");
  }

  shadeCell(selection, options) {
      // TODO: instead of drawing text here, fill in square
      var attrs = {
          transform: "translate(1,17)",
          styles: "font-size: 16px"
      };

      var datumAttrs = selection.datum() || {};

      var cellSizeAttrs = {};
      if (options.cellSize > 18) {
          cellSizeAttrs.width = "17",
              cellSizeAttrs.height = "17",
              cellSizeAttrs.transform = "translate(2,2)"
      }

      // TODO: just change background-color attr on
  }

  // NOTE: went away from these symbols but keeping for now
  showNormalSampleSymbol(selection, options) {
      options = options || {};

      var attrs = {
          transform: "translate(1,17)",
          styles: "font-size: 16px"
      };

      var datumAttrs = selection.datum() || {};

      var cellSizeAttrs = {};
      if (options.cellSize > 18) {
          cellSizeAttrs.width = "17",
          cellSizeAttrs.height = "17",
          cellSizeAttrs.transform = "translate(2,2)"
      }

      $.extend(attrs, datumAttrs, cellSizeAttrs, options);

      selection.append("text")
          .attr('font-family', 'Material Icons')
          .attr('style', attrs.styles)
          .attr("transform", attrs.transform)
          .style("fill", options.color)
          .text('fiber_manual_record');
  }

  showTumorSampleSymbol(selection, options) {
      options = options || {};

      var attrs = {
          transform: "translate(1,17)",
          styles: "font-size: 16px"
      };

      var datumAttrs = selection.datum() || {};

      var cellSizeAttrs = {};
      if (options.cellSize > 18) {
          cellSizeAttrs.width = "17",
          cellSizeAttrs.height = "17",
          cellSizeAttrs.transform = "translate(2,2)"
      }

      $.extend(attrs, datumAttrs, cellSizeAttrs, options);

      selection.append("text")
          .attr('font-family', 'Material Icons')
          .attr('style', attrs.styles)
          .attr("transform", attrs.transform)
          .style("fill", options.color)
          .text('flash_on');
  }

  showPolyPhenSymbol(selection, options) {
    options = options || {};
    var attrs = {
      transform: "translate(2,2)",
      width: "13",
      height: "13",
      clazz: ""
    };

    var cellSizeAttrs = {};
    if (options.cellSize > 18) {
      cellSizeAttrs.width = "17",
      cellSizeAttrs.height = "17",
      cellSizeAttrs.transform = "translate(2,2)"
    }

    var datumAttrs = selection.datum() || {};

    $.extend(attrs, datumAttrs, options, cellSizeAttrs);

    var colors = {
      polyphen_probably_damaging: "#ad494A",
      polyphen_possibly_damaging: "#FB7737",
      polyphen_benign: "rgba(181, 207, 107,1)"
    };

    selection.append("g")
             .attr("transform", attrs.transform)
             .append("use")
             .attr("xlink:href", "#biohazard-symbol")
             .attr("width", attrs.width)
             .attr("height", attrs.height)
             .style("pointer-events", "none")
             .style("fill", colors[attrs.clazz]);

  };

  showSiftSymbol(selection, options) {
    options = options || {};
    var attrs = {
      transform: "translate(2,2)",
      width: "14",
      height: "14",
      clazz: ""
    };

    var cellSizeAttrs = {};
    if (options.cellSize > 18) {
      cellSizeAttrs.width = "17",
      cellSizeAttrs.height = "17",
      cellSizeAttrs.transform = "translate(2,2)"
    }

    var datumAttrs = selection.datum() || {};

    $.extend(attrs, datumAttrs, options, cellSizeAttrs);

    var colors = {
      sift_deleterious: "#ad494A",
      sift_deleterious_low_confidence: "#FB7737",
      sift_tolerated_low_confidence: "rgba(231,186,82,1)",
      sift_tolerated: "rgba(181, 207, 107,1)"
    };

    selection.append("g")
             .attr("transform", attrs.transform)
             .append("use")
             .attr("xlink:href", "#danger-symbol")
             .attr("width", attrs.width)
             .attr("height", attrs.height)
             .style("pointer-events", "none")
             .style("fill", colors[attrs.clazz]);
  };

  showMutationTasterSymbol(selection, options) {
    options = options || {};
    var attrs = {
      transform: "translate(2,2)",
      width: "14",
      height: "14",
      clazz: ""
    };

    var cellSizeAttrs = {};
    if (options.cellSize > 18) {
      cellSizeAttrs.width = "17",
      cellSizeAttrs.height = "17",
      cellSizeAttrs.transform = "translate(2,2)"
    }

    var datumAttrs = selection.datum() || {};

    $.extend(attrs, datumAttrs, options, cellSizeAttrs);

    var colors = {
      mt_disease_causing_auto: "#ad494A",
      mt_disease_causing:      "#FB7737",
      mt_polymorphism:         "rgba(231,186,82,1)",
      mt_polymorphism_auto:    "rgba(181, 207, 107,1)"
    };

    selection.append("g")
             .attr("transform", attrs.transform)
             .append("use")
             .attr("xlink:href", "#danger-symbol")
             .attr("width", attrs.width)
             .attr("height", attrs.height)
             .style("pointer-events", "none")
             .style("fill", colors[attrs.clazz]);
  };


  showAfSymbol(selection, options) {
    var symbolDim   = { transform: "translate(2,2)",    size: "12" };
    if (options.cellSize > 18) {
      symbolDim   = { transform: "translate(2,2)",    size: "17" };
    }
    var symbolAttrs = {
      af_unique:    { fill: "rgb(199, 0, 1)",          transform: symbolDim.transform,   size: symbolDim.size},
      af_uberrare:  { fill: "rgba(204, 28, 29, 0.79)", transform: symbolDim.transform,   size: symbolDim.size},
      af_superrare: { fill: "rgba(255, 44, 0, 0.76)",  transform: symbolDim.transform,   size: symbolDim.size},
      af_rare:      { fill: "rgb(247, 138, 31)",       transform: symbolDim.transform,   size: symbolDim.size},
      af_uncommon:  { fill: "rgb(224, 195, 128)",      transform: symbolDim.transform,   size: symbolDim.size},
      af_common:    { fill: "rgb(189,189,189)",        transform: symbolDim.transform,   size: symbolDim.size}
    }
    // For the gene badge, we will display in a smaller size
    if (options && options.hasOwnProperty('transform')) {
      symbolAttrs[selection.datum().clazz].transform = options.transform;
    }
    if (options && options.hasOwnProperty('height')) {
      symbolAttrs[selection.datum().clazz].size = options.height;
    }
    selection.append("g")
      .attr("class", function(d, i)    { return d.clazz; })
      .attr("transform", function(d,i) { return symbolAttrs[d.clazz].transform; })
      .append("use")
      .attr("xlink:href", "#af-symbol")
      .style("pointer-events", "none")
      .style("fill", function(d,i)  { return symbolAttrs[d.clazz].fill; })
      .attr("width", function(d,i)  { return symbolAttrs[d.clazz].size; })
      .attr("height", function(d,i) { return symbolAttrs[d.clazz].size; });
  };

  showAfRareSymbol(selection, options) {
    var symbolDim   = { transform: "translate(2,2)",    size: "12" };
    if (options.cellSize > 18) {
      symbolDim   = { transform: "translate(2,2)",    size: "17" };
    }
    var symbolAttrs = {
      afhighest_rare:  { fill: "rgba(204, 28, 29, 0.79)", transform: symbolDim.transform,   size: symbolDim.size}
    }
    // For the gene badge, we will display in a smaller size
    if (options && options.hasOwnProperty('transform')) {
      symbolAttrs[selection.datum().clazz].transform = options.transform;
    }
    if (options && options.hasOwnProperty('height')) {
      symbolAttrs[selection.datum().clazz].size = options.height;
    }
    selection.append("g")
      .attr("class", function(d, i)    { return d.clazz; })
      .attr("transform", function(d,i) { return symbolAttrs[d.clazz].transform; })
      .append("use")
      .attr("xlink:href", "#af-symbol")
      .style("pointer-events", "none")
      .style("fill", function(d,i)  { return symbolAttrs[d.clazz].fill; })
      .attr("width", function(d,i)  { return symbolAttrs[d.clazz].size; })
      .attr("height", function(d,i) { return symbolAttrs[d.clazz].size; });
  };

  showHomSymbol(selection, options) {
    var symbolOptions = {x: 0, y: 7, fontSize: "6.5px", width: 15, height: 10};
    if (options.cellSize > 18) {
      symbolOptions = {x: 0, y: 10, fontSize: "9px",  width: 19, height: 14};
    }
    var g = selection.append("g")
                     .attr("transform", "translate(1,4)");

    g.append("rect")
     .attr("width", symbolOptions.width)
     .attr("height", symbolOptions.height)
     .attr("class", "zyg_hom " + selection.datum().clazz)
     .style("pointer-events", "none");

    g.append("text")
     .attr("x", symbolOptions.x)
     .attr("y", symbolOptions.y)
     .style("fill", "white")
     .style("font-weight", "bold")
     .style("font-size", symbolOptions.fontSize)
     .text("Hom");
  };

  showRecessiveSymbol(selection, options) {
    options = options || {};
    var width = (options.cellSize > 18) ? "19" : (options.width || "16");

    selection.append("g")
             .attr("transform", options.transform || "translate(1,2)")
             .append("use")
             .attr("xlink:href", '#recessive-symbol')
             .attr("width", width)
             .attr("height", width)
             .style("pointer-events", "none");
  };

  showDeNovoSymbol(selection, options) {
    options = options || {};

    var width = (options.cellSize > 18) ? "19" : (options.width || "16");

    var transform = (options.cellSize > 18) ? "translate(2,3)" : (options.transform || "translate(1,2)");

    selection.append("g")
             .attr("transform", transform)
             .append("use")
             .attr("xlink:href", '#denovo-symbol')
             .attr("width", width)
             .attr("height", width)
             .style("pointer-events", "none");

  };

  showXLinkedSymbol(selection, options) {
    options = options || {};

    var width = (options.cellSize > 18) ? "19" : (options.width || "16");

    var transform = (options.cellSize > 18) ? "translate(2,3)" : (options.transform || "translate(1,2)");

    selection.append("g")
             .attr("transform", transform)
             .append("use")
             .attr("xlink:href", '#x-linked-symbol')
             .attr("width", width)
             .attr("height", width)
             .style("pointer-events", "none");

  };

  showCompoundHetSymbol(selection, options) {
    options = options || {};

    var width = (options.cellSize > 18) ? "19" : (options.width || "16");

    var transform = (options.cellSize > 18) ? "translate(2,3)" : (options.transform || "translate(1,2)");

    selection.append("g")
             .attr("transform", transform)
             .append("use")
             .attr("xlink:href", '#compound-het-symbol')
             .attr("width", width)
             .attr("height", width)
             .style("pointer-events", "none");

  };

  showAutosomalDominantSymbol(selection, options) {
    options = options || {};

    var width = (options.cellSize > 18) ? "19" : (options.width || "16");

    var transform = (options.cellSize > 18) ? "translate(2,3)" : (options.transform || "translate(1,2)");

    selection.append("g")
             .attr("transform", transform)
             .append("use")
             .attr("xlink:href", '#autosomal-dominant-symbol')
             .attr("width", width)
             .attr("height", width)
             .style("pointer-events", "none");

  };

  showAffectedPresentSymbol(selection, options) {
    var symbolLink = null;
    var id = "thumbs-grey-symbol";

    if ( selection.datum().clazz == "affected") {
      if (selection.datum().value == "present_all") {
        symbolLink = '#thumbs-up-symbol';
        id = "thumbs-green-symbol";
      } else if (selection.datum().value == "present_some") {
        symbolLink = '#question-mark-symbol';
      } else if (selection.datum().value == "present_none") {
        symbolLink = '#thumbs-down-symbol';
      }
    } else if (selection.datum().clazz == "unaffected") {
      if (selection.datum().value == "present_all") {
        symbolLink = '#thumbs-down-symbol';
      } else if (selection.datum().value == "present_some") {
        symbolLink = '#question-mark-symbol';
      } else if (selection.datum().value == "present_none") {
        symbolLink = '#thumbs-up-symbol';
        id = "thumbs-green-symbol";
      }
    }

    selection.append("g")
                     .attr("id", id)
                 .attr("transform",  "translate(1,2)")
                 .append("use")
                 .attr("xlink:href", symbolLink)
                 .attr("width",   options && options.cellSize > 18 ? "16" : "14")
                 .attr("height",  options && options.cellSize > 18 ? "16" : "14")
                 .style("pointer-events", "none");


  };

  showNoInheritSymbol(selection) {

  };

  showBookmarkSymbol(selection, options) {
    var optionsSize = options && options.cellSize && options.cellSize > 18 ? 16 : 11;
    if (selection.datum().clazz) {
      selection.append("g")
         .attr("class", selection.datum().clazz)
             .attr("transform", selection.datum().translate || "translate(2,2)")
             .append("use")
             .attr("xlink:href", '#bookmark-symbol')
             .attr("width",  selection.datum().width || optionsSize)
             .attr("height", selection.datum().height || optionsSize)
             .style("pointer-events", "none")
             .style("cursor", "pointer");

    }
  }

  showPhenotypeSymbol(selection) {
    if (selection.datum().clazz) {
      selection.append("g")
         .attr("class", selection.datum().clazz)
             .attr("transform", selection.datum().translate || "translate(0,-1)")
             .append("use")
             .attr("xlink:href", '#phenotype-symbol')
             .attr("width",  selection.datum().width || 13)
             .attr("height", selection.datum().width || 13);

    }
  }

  showImpactSymbol(selection, options) {
    options = options || {};
    var me = this;
    var type = d3.select(selection.node().parentNode).datum().type;
    var symbolScale = d3.scale.ordinal()
                      .domain([3,4,5,6,7,8,9])
                      .range([9,15,25,38,54,58,98]);
    var symbolScaleCircle = d3.scale.ordinal()
                          .domain([3,4,5,6,7,8,9])
                          .range([9,15,25,58,68,78,128]);

    var symbolSize = symbolScale(options.cellSize > 18 ? 9 : 6);
    var symbolSizeCircle = symbolScaleCircle(options.cellSize > 18 ? 9 : 6);

    var translate       = options.cellSize > 18 ?  "translate(4,4)" : "translate(4,4)";
    var translateSymbol = options.cellSize > 18 ?  "translate(10,10)" : "translate(8,8)";
    var width           = options.cellSize > 18 ? 12 : 8;
    var height          = width;

    if (type.toUpperCase() == 'SNP' || type.toUpperCase() == 'MNP') {
      selection.append("g")
               .attr("transform", translate)
               .append("rect")
               .attr("width", width)
               .attr("height", height)
               .attr("class", "filter-symbol " + selection.datum().clazz + " snp")
               .style("pointer-events", "none");
    } else {
      selection
        .append("g")
        .attr("transform", translateSymbol)
        .append('path')
            .attr("d", function(d,i) {
              return d3.svg
                       .symbol()
                       .size( function(d,i) {
                        if (type.toUpperCase() == 'INS') {
                          return symbolSizeCircle;

                        } else {
                          return symbolSize;
                        }
                       })
                       .type( function(d,i) {
                        if (type.toUpperCase() == 'DEL') {
                  return 'triangle-up';
              } else if (type.toUpperCase() == 'INS') {
                  return  'circle';
              } else if (type.toUpperCase() == 'COMPLEX') {
                  return 'diamond';
              } else {
                return 'square';
              }
                       })();
            })
            .attr("class", "filter-symbol " + selection.datum().clazz + " " + type);
    }
  }


  showImpactBadge(selection, variant, impactClazz, options) {
    var me = this;
    var type = null;
    var transform1 = "translate(1,3)";
    var transform2 = "translate(5,6)";
    if (options && options.transform1) {
        transform1 = options.transform1;
    }
    if (options && options.transform2) {
        transform2 = options.transform2;
    }

    var clazz = null;
    if (variant) {
      type = variant.type ? variant.type : 'SNP';
      clazz = impactClazz ? impactClazz : (variant.impact && variant.impact.length > 0 ? "impact_" + variant.impact[0].toUpperCase() : "");
    } else  {
      type = selection.datum().type ? selection.datum().type : 'SNP';
      transform1 = selection.datum().transform || "translate(1,1)";
      transform2 = selection.datum().transform || "translate(5,5)";
      clazz = selection.datum().clazz;
    }
    var symbolScale = d3.scale.linear()
                      .domain([1,6])
                      .range([10,40]);

      var symbolSize = symbolScale(6);

    if (type.toUpperCase() === 'SNP' || type.toUpperCase() === 'MNP') {
      selection.append("g")
                .attr("transform", transform1)
               .append("rect")
               .attr("width", 8)
               .attr("height", 8)
               .attr("class", "filter-symbol " + clazz)
               .style("pointer-events", "none");
    } else {
      selection
        .append("g")
        .attr("transform", transform2)
        .append('path')
            .attr("d", function(d,i) {
              return d3.svg
                       .symbol()
                       .size(symbolSize)
                       .type( function(d,i) {
                        if (type.toUpperCase() === 'DEL') {
                            return 'triangle-up';
                        } else if (type.toUpperCase() === 'INS') {
                            return 'circle';
                        } else if (type.toUpperCase() === 'COMPLEX') {
                            return 'diamond';
                        }
                       })();
            })
            .attr("class", "filter-symbol " + clazz);
    }
  }


  showTextSymbol(selection, options) {
    var translate = options.cellSize > 18 ? "translate(3,0)" : "translate(0,0)";
    var text =  selection.append("g")
                   .attr("transform", translate)
                   .append("text")
                   .attr("class", function(d,i) {
                      if (selection.datum().clickFunction) {
                        return "clickable";
                      } else {
                        return "";
                      }
                   })
                   .attr("x", 0)
                   .attr("y", 11)
                   .attr("dy", "0em")
                   .text(selection.datum().value)

    this.wrap(text, options.cellSize, 3);
  }

  showNumericSymbol(selection, options) {
    var translate = options.cellSize > 18 ? "translate(0,4)" : "translate(0,0)";
    var text =  selection.append("g")
                   .attr("transform", translate)
                   .append("text")
                   .attr("class", function(d,i) {
                    if (selection.datum().clickFunction) {
                      return "clickable";
                    } else {
                      return "";
                    }
                 })
                   .attr("x", 0)
                   .attr("y", 11)
                   .attr("dy", "0em")
                   .text(selection.datum().value);
    this.wrap(text, options.cellSize, 3, options.cellSize - 1);
  }

  wrap(text, width, maxLines, x) {
    if (maxLines == null) {
      maxLines = 10;
    }
    var theX       = x ? x : 0;
    var textAnchor = x ? "end" : "start";

    text.each(function() {
      var text = d3.select(this),
          words = text.text()
                      .split(/\s+/)
                      .filter( function(d,i) {
                        return d != null && d != '' && d.trim() != '';
                })
                      .reverse();
      var wordCount = words.length;
      var word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null)
                      .append("tspan")
                      .style("text-anchor", textAnchor)
                      .attr("x", theX)
                      .attr("y", y)
                      .attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        if (lineNumber < maxLines) {
            if (lineNumber == maxLines-1) {
              word = " more ...";
            }
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width && wordCount > 1) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", theX).attr("y", y)
                        .attr("dy", ++lineNumber * lineHeight + dy + "em")
                        .style("text-anchor", textAnchor)
                        .text(word);
          }
        }
      }
    })
  }

}


