export default function GenericAnnotation(glyph) {
  var me = this;
  me.glyph = glyph;
  me.descriptor = {
    AVIA3: {
      'GENE':              { hide: true},
      'STRAND':            { hide: true},

      'EXAC':              { hide:  true},

      'EXAC_AF':           { label: 'ExAC'},
      'EXAC_AF.AC_ALL':    { label: 'Allele Count All'},
      'EXAC_AF.AC_AFR':    { label: 'Allele Count AFR'},
      'EXAC_AF.AC_AMR':    { label: 'Allele Count AMR'},
      'EXAC_AF.AC_ASJ':    { label: 'Allele Count AJS'},
      'EXAC_AF.AC_EAS':    { label: 'Allele Count EAS'},
      'EXAC_AF.AC_FIN':    { label: 'Allele Count FIN'},
      'EXAC_AF.AC_NFE':    { label: 'Allele Count NFE'},
      'EXAC_AF.AC_OTH':    { label: 'Allele Count OTH'},
      'EXAC_AF.AC_SAS':    { label: 'Allele Count SAS'},
      'EXAC_AF.AC_FEMALE': { label: 'Allele Count Female'},
      'EXAC_AF.AC_MALE':   { label: 'Allele Count Male'},
      'EXAC_AF.AC_Adj':    { label: 'Allele Count Adj'},

      'EXAC_AF.AN_ALL':    { label: 'Allele Number All'},
      'EXAC_AF.AN_AFR':    { label: 'Allele Number AFR'},
      'EXAC_AF.AN_AMR':    { label: 'Allele Number AMR'},
      'EXAC_AF.AN_ASJ':    { label: 'Allele Number AJS'},
      'EXAC_AF.AN_EAS':    { label: 'Allele Number EAS'},
      'EXAC_AF.AN_FIN':    { label: 'Allele Number FIN'},
      'EXAC_AF.AN_NFE':    { label: 'Allele Number NFE'},
      'EXAC_AF.AN_OTH':    { label: 'Allele Number OTH'},
      'EXAC_AF.AN_SAS':    { label: 'Allele Number SAS'},
      'EXAC_AF.AN_FEMALE': { label: 'Allele Number Female'},
      'EXAC_AF.AN_MALE':   { label: 'Allele Number Male'},
      'EXAC_AF.AN_Adj':    { label: 'Allele Number Adj'},

      'EXAC_AF.AF_ALL':    { label: 'Allele Freq All'},
      'EXAC_AF.AF_AFR':    { label: 'Allele Freq AFR'},
      'EXAC_AF.AF_AMR':    { label: 'Allele Freq AMR'},
      'EXAC_AF.AF_ASJ':    { label: 'Allele Freq AJS'},
      'EXAC_AF.AF_EAS':    { label: 'Allele Freq EAS'},
      'EXAC_AF.AF_FIN':    { label: 'Allele Freq FIN'},
      'EXAC_AF.AF_NFE':    { label: 'Allele Freq NFE'},
      'EXAC_AF.AF_OTH':    { label: 'Allele Freq OTH'},
      'EXAC_AF.AF_SAS':    { label: 'Allele Freq SAS'},
      'EXAC_AF.AF_FEMALE': { label: 'Allele Freq Female'},
      'EXAC_AF.AF_MALE':   { label: 'Allele Freq Male'},
      'EXAC_AF.AF_Adj':    { label: 'Allele Freq Adj'},


      'GNOMAD_EXOME':                  { label: 'gnomAD Exome'},
      'GNOMAD_EXOME.gnomAD_exome_ALL': {
        label:    'AF All',
        fieldPath:  ['genericAnnots','AVIA3','GNOMAD_EXOME', 'gnomAD_exome_ALL'],
        fieldName:  'avia3_gnomad_af_all',
        type:       'number',
        filter:     'range',
        valueMap: [
                   {min:    0,   max: +0,     value: +2,  badge: false,  clazz:  'af_unique',     symbolFunction: me.glyph.showAfSymbol},
                   {min:    0,   max: +.0001, value: +3,  badge: false,  clazz:  'af_uberrare',   symbolFunction: me.glyph.showAfSymbol},
                   {min:    0,   max: +.001,  value: +4,  badge: false,  clazz:  'af_superrare',  symbolFunction: me.glyph.showAfSymbol},
                   {min:    0,   max: +.01,   value: +5,  badge: false,  clazz:  'af_rare',       symbolFunction: me.glyph.showAfSymbol},
                   {min:    0,   max: +.05,   value: +6,  badge: false,  clazz:  'af_uncommon',   symbolFunction: me.glyph.showAfSymbol},
                   {min: +.05,   max: +1,     value: +7,  badge: false,  clazz:  'af_common',     symbolFunction: me.glyph.showAfSymbol}
                ]
      },
      'GNOMAD_EXOME.gnomAD_exome_AFR': { label: 'Allele Freq AFR'},
      'GNOMAD_EXOME.gnomAD_exome_AMR': { label: 'Allele Freq AMR'},
      'GNOMAD_EXOME.gnomAD_exome_ASJ': { label: 'Allele Freq AJS'},
      'GNOMAD_EXOME.gnomAD_exome_EAS': { label: 'Allele Freq EAS'},
      'GNOMAD_EXOME.gnomAD_exome_FIN': { label: 'Allele Freq FIN'},
      'GNOMAD_EXOME.gnomAD_exome_NFE': { label: 'Allele Freq NFE'},
      'GNOMAD_EXOME.gnomAD_exome_OTH': { label: 'Allele Freq OTH'},
      'GNOMAD_EXOME.gnomAD_exome_SAS': { label: 'Allele Freq SAS'},

      'MT':                            { label: 'Mutation taster'},
      'MT:KEY': {
        label:    'Mutation taster',
        fieldPath:  ['genericAnnots','AVIA3','MT','OBJECT.KEY'],
        fieldName:  'avia3_mt',
        type:       'category',
        filter:     'category',
        valueMap:   {
                        'Disease Causing Automatic': {value: 1,    badge: false, clazz: 'mt_disease_causing_auto', symbolFunction: me.glyph.showMutationTasterSymbol},
                        'Disease Causing':           {value: 2,    badge: false, clazz: 'mt_disease_causing',      symbolFunction: me.glyph.showMutationTasterSymbol},
                    'Polymorphism':              {value: 103,  badge: false, clazz: 'mt_polymorphism',         symbolFunction: me.glyph.showMutationTasterSymbol},
                    'Polymorphism Automatic':    {value: 104,  badge: false, clazz: 'mt_polymorphism_auto',    symbolFunction: me.glyph.showMutationTasterSymbol},
                        none:                        {value: 105,  badge: false, clazz: ''}
                     }
      },
      'MT:VALUE':  {
        label:    'Mutation taster score',
        fieldPath:  ['genericAnnots','AVIA3','MT','OBJECT.VALUE'],
        fieldName:  'avia3_mt_score',
        type:       'number',
        filter:     'range'
      }
    }
  }

  me.descriptor.AVIA3['GNOMAD_EXOME.gnomAD_exome_ALL'].matrixRow =
  {
    name:      'Allele Frequency - gnomAD',
      id:        'af-gnomad',
      match:     'range',
      attribute: me.descriptor.AVIA3['GNOMAD_EXOME.gnomAD_exome_ALL'].fieldPath,
      map:       me.descriptor.AVIA3['GNOMAD_EXOME.gnomAD_exome_ALL'].valueMap
  }

  me.descriptor.AVIA3['MT:KEY'].matrixRow =
  {
    name:      'Mutation taster',
      id:        'mt',
      match:     'exact',
      attribute: me.descriptor.AVIA3['MT:KEY'].fieldPath,
      map:       me.descriptor.AVIA3['MT:KEY'].valueMap
  }

}

GenericAnnotation.prototype.getMatrixRows = function(annotators) {
  var me = this;
  var matrixRows = [];
  if (annotators && annotators.length > 0) {
    annotators.forEach(function(annotator) {
      var theDescriptor = me.descriptor[annotator];
      if (theDescriptor) {
        for (var annotName in theDescriptor) {
          var annot = theDescriptor[annotName];
          if (annot.matrixRow) {
            matrixRows.push(annot.matrixRow);
          }
        }
      }
    })
  }
  return matrixRows;
}

GenericAnnotation.prototype.appendGenericFilters = function(annotators) {
  var me = this;
  var html = "";
  var container = d3.select("#filter-track #generic-annotation-filters");
  container.html("");
  if (annotators && annotators.length > 0) {
    annotators.forEach(function(annotator) {
      var theDescriptor = me.descriptor[annotator];
      if (theDescriptor) {
        for (var annotName in theDescriptor) {
          var annot = theDescriptor[annotName];
          if (annot.filter  && annot.filter == 'category' && annot.valueMap) {
            container.append("h4")
                     .text(annot.label);
            var column = container.append("div")
                                  .style("display", "flex")
                                  .style("flex-direction", "column");


            var filterSelector = "";
            var classToLabel = {};
            for (var key in annot.valueMap) {

              if (annot.valueMap[key].clazz && annot.valueMap[key].clazz.length > 0 && annot.valueMap[key].symbolFunction) {
                var svg =
                 container.append("svg")
                          .datum(annot.valueMap[key])
                        .attr("id", annot.valueMap[key].clazz)
                        .attr("class", annot.fieldName)
                        .style("cursor", "pointer")
                        .attr("width", 200);

                annot.valueMap[key].symbolFunction(svg, {transform: 'translate(0,0)', width: 12, height: 12});

                svg.append("text")
                   .attr("class", "name")
                   .style("fill-opacity", 1)
                   .attr("x", 15)
                   .attr("y", 10)
                   .text(key);


                 if (filterSelector.length > 0) {
                  filterSelector += ", ";
                 }

              }
            }

            filterSelector += "." + annot.fieldName;
            classToLabel[annot.fieldName] = annot.label;
            filterCard.initFilterListeners(filterSelector, classToLabel)


          }
        }
      }
    })
  }
  return html;

}

GenericAnnotation.prototype.formatContent = function(variant, clazzMap, EMPTY_VALUE) {
  var me = this;
  var annotDiv = "";
  if (variant.genericAnnots && Object.keys(variant.genericAnnots).length > 0) {
    annotDiv = '<div class="' + clazzMap.container + '">';
    for (var annotator in variant.genericAnnots) {
      annotDiv += '<div class="' + clazzMap.row + '" style="text-align:center">' + annotator + '</div>';
      for (var fieldName in variant.genericAnnots[annotator]) {

        if (me.shouldShow(annotator, [fieldName])) {
          var annotValue = variant.genericAnnots[annotator][fieldName];
          var label = me.getLabel(annotator, [fieldName]);

          // Loop through value map to create tag/value subfields
          var tagValues = null;
          if (annotValue instanceof Object) {
            tagValues = "";
            for (var tag in annotValue) {
              if (tagValues.length > 0) {
                tagValues += "<br>"
              }
              if (me.shouldShow(annotator,  [fieldName, tag])) {
                var sublabel = me.getLabel(annotator, [fieldName, tag]);
                tagValues += sublabel + ": " + annotValue[tag];
              }
            }
          }


          annotDiv += me._formatContentRow(label, (tagValues ? tagValues : annotValue), clazzMap, EMPTY_VALUE);

        }


      }
    }
    annotDiv += "</div>"
  }
  return annotDiv;
}

GenericAnnotation.prototype._formatContentRow = function(label, value, clazzMap, EMPTY_VALUE) {
  if (value == "") {
    value = EMPTY_VALUE;
  }
  return '<div class="'  + clazzMap.row + '">'
        + '<div class="' + clazzMap.label + '" style="text-align:right">' + label + '</div>'
        + '<div class="' + clazzMap.value + '">' + value + '</div>'
        + '</div>';
}

GenericAnnotation.prototype.shouldShow = function(annotator, fieldPath) {
  var me = this;
  var theDescriptor = me.descriptor[annotator];

  var hide = false;
  if (theDescriptor) {
    var key = fieldPath.join(".");
    if (theDescriptor[key] && theDescriptor[key].hide) {
      hide = theDescriptor[key].hide;
    }

  }

  return !hide;
}

GenericAnnotation.prototype.getLabel = function(annotator, fieldPath) {
  var me = this;
  var theDescriptor = me.descriptor[annotator];


  var label = null;
  if (theDescriptor) {
    var key = fieldPath.join(".");
    if (theDescriptor[key] && theDescriptor[key].label) {
      label = theDescriptor[key].label
    }

  }

  return label ? label : fieldPath[fieldPath.length-1];
}

GenericAnnotation.prototype.getValue = function(variant, fieldPath) {
  var me = this;
  var node = variant;
  fieldPath.forEach(function(fieldName) {
    if (node) {
      if (fieldName === 'OBJECT.KEY' && Object.keys(node).length > 0) {
        node = Object.keys(node).join(",");
      } else if (fieldName === 'OBJECT.VALUE' && Object.values(node).length > 0) {
        node = Object.values(node).join(",");
      } else if (node[fieldName]) {
        node = node[fieldName];
      } else {
        node = null;
      }
    }
  })
  return node;
}

GenericAnnotation.prototype.setSimpleFields = function(variant) {
  var me = this;
  for (var annotator in me.descriptor) {
    var theDescriptor = me.descriptor[annotator];
    var annots        = variant.genericAnnots[annotator];

    for (var key in theDescriptor) {
      var annotInfo = theDescriptor[key];
      if (annotInfo.fieldName) {
        var theValue = me.getValue(variant, annotInfo.fieldPath);
        if (annotInfo.filter == 'category' && annotInfo.valueMap && annotInfo.valueMap[theValue]) {
          theValue = annotInfo.valueMap[theValue].clazz;
        }
        variant[annotInfo.fieldName] = theValue;
      }

    }
  }
}


