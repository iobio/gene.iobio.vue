export default class Translator {

  constructor(globalApp, glyph) {
    this.globalApp = globalApp;
    this.glyph = glyph;


    this.clinvarMap     = {
              'pathogenic'            : {value: 1,   badge: true, examineBadge: true, clazz: 'clinvar_path', symbolFunction: this.glyph.showClinVarSymbol},
              'pathogenic/likely_pathogenic' :
                                        {value: 2,   badge: true, examineBadge: true, clazz: 'clinvar_path', symbolFunction: this.glyph.showClinVarSymbol},
              'likely_pathogenic'     : {value: 3,   badge: true, examineBadge: true, clazz: 'clinvar_lpath', symbolFunction: this.glyph.showClinVarSymbol},
              'uncertain_significance': {value: 4,   badge: true, examineBadge: true, clazz: 'clinvar_uc', symbolFunction: this.glyph.showClinVarSymbol},
              'conflicting_interpretations_of_pathogenicity':
                                        {value: 4,   badge: true, examineBadge: true, clazz: 'clinvar_cd', symbolFunction: this.glyph.showClinVarSymbol},
              'conflicting_data_from_submitters':
                                        {value: 5,   badge: true,  examineBadge: true, clazz: 'clinvar_cd', symbolFunction: this.glyph.showClinVarSymbol},
              'drug_response'         : {value: 131, badge: false, examineBadge: true, clazz: 'clinvar_other', symbolFunction: this.glyph.showClinVarSymbol},
              'confers_sensitivity'   : {value: 131, badge: false, examineBadge: true, clazz: 'clinvar_other', symbolFunction: this.glyph.showClinVarSymbol},
              'risk_factor'           : {value: 131, badge: false, examineBadge: true, clazz: 'clinvar_other', symbolFunction: this.glyph.showClinVarSymbol},
              'other'                 : {value: 131, badge: false, examineBadge: true, clazz: 'clinvar_other', symbolFunction: this.glyph.showClinVarSymbol},
              'association'           : {value: 131, badge: false, examineBadge: true, clazz: 'clinvar_other', symbolFunction: this.glyph.showClinVarSymbol},
              'protective'            : {value: 131, badge: false, examineBadge: true, clazz: 'clinvar_other', symbolFunction: this.glyph.showClinVarSymbol},
              'not_provided'          : {value: 131, badge: false, examineBadge: true, clazz: 'clinvar_other', symbolFunction: this.glyph.showClinVarSymbol},
              'likely_benign'         : {value: 141, badge: false, examineBadge: true, clazz: 'clinvar_lbenign', symbolFunction: this.glyph.showClinVarSymbol},
              'benign/likely_benign'  : {value: 141, badge: false, examineBadge: true, clazz: 'clinvar_lbenign', symbolFunction: this.glyph.showClinVarSymbol},
              'benign'                : {value: 151, badge: false, examineBadge: true, clazz: 'clinvar_benign', symbolFunction: this.glyph.showClinVarSymbol},
              'none'                  : {value: 161, badge: false, examineBadge: false, clazz: ''}
                       };
    this.somaticMap = {
              'somatic'               : {value: 1,   badge: true, examineBadge: true, clazz: 'clinvar_path', symbolFunction: this.glyph.showSomaticSymbol},
              'inherited'             : {value: 2,   badge: false, examineBadge: false, clazz: ''}
                      };

    this.impactMap = {
                        HIGH:     {value: 1, badge: true, clazz: 'impact_HIGH',     symbolFunction: this.glyph.showImpactSymbol},
                        MODERATE: {value: 2, badge: true, clazz: 'impact_MODERATE', symbolFunction: this.glyph.showImpactSymbol},
                        MODIFIER: {value: 3, badge: false, clazz: 'impact_MODIFIER', symbolFunction: this.glyph.showImpactSymbol},
                        LOW:      {value: 4, badge: false, clazz: 'impact_LOW',      symbolFunction: this.glyph.showImpactSymbol},
                        none:     {value: 5, badge: false, clazz: 'impact_none',      symbolFunction: this.glyph.showImpactSymbol}
                     };
    this.highestImpactMap = {
                        HIGH:     {value: 1, badge: true, clazz: 'impact_HIGH',     symbolFunction: this.showHighestImpactSymbol, bind: this},
                        MODERATE: {value: 2, badge: true, clazz: 'impact_MODERATE', symbolFunction: this.showHighestImpactSymbol, bind: this},
                        MODIFIER: {value: 3, badge: false, clazz: 'impact_MODIFIER', symbolFunction: this.showHighestImpactSymbol, bind: this},
                        LOW:      {value: 4, badge: false, clazz: 'impact_LOW',      symbolFunction: this.showHighestImpactSymbol, bind: this}
                     };
    this.siftMap = {
                      deleterious:                 {value: 1, badge: true, clazz: 'sift_deleterious', symbolFunction: this.glyph.showSiftSymbol},
                      deleterious_low_confidence:  {value: 2, badge: true, clazz: 'sift_deleterious_low_confidence', symbolFunction: this.glyph.showSiftSymbol},
                      tolerated_low_confidence: {value: 3, badge: false, clazz: 'sift_tolerated_low_confidence',symbolFunction: this.glyph.showSiftSymbol},
                      tolerated:    {value: 102, badge: false, clazz: 'sift_tolerated',symbolFunction: this.glyph.showSiftSymbol},
                      unknown:      {value: 103, badge: false, clazz: ''},
                      none:         {value: 103, badge: false, clazz: ''}
                    };
    this.polyphenMap = {
                      probably_damaging:    {value: 1, badge: true, clazz: 'polyphen_probably_damaging', symbolFunction: this.glyph.showPolyPhenSymbol},
                      possibly_damaging:    {value: 2, badge: true, clazz: 'polyphen_possibly_damaging', symbolFunction: this.glyph.showPolyPhenSymbol},
                      benign:               {value: 103, badge: false, clazz: 'polyphen_benign',            symbolFunction:this.glyph.showPolyPhenSymbol},
                      unknown:              {value: 104, badge: false, clazz: ''},
                      none:                 {value: 104, badge: false, clazz: ''}
                       };
    this.inheritanceMap = {
                      denovo:               {value: 1, badge: true,  clazz: 'denovo',       display: 'de novo',      symbolFunction: this.glyph.showDeNovoSymbol},
                      recessive:            {value: 2, badge: true,  clazz: 'recessive',    display: 'recessive',    symbolFunction: this.glyph.showRecessiveSymbol},
                      'x-linked':           {value: 3, badge: true,  clazz: 'x-linked',     display: 'x-linked',     symbolFunction: this.glyph.showXLinkedSymbol},
                      'compound het':       {value: 4, badge: true,  clazz: 'compound-het', display: 'compound het', symbolFunction: this.glyph.showCompoundHetSymbol},
                      'autosomal dominant': {value: 5, badge: true,  clazz: 'autosomal-dominant', display: 'autosomal dominant', symbolFunction: this.glyph.showAutosomalDominantSymbol},
                      none:                 {value: 3, badge: false, clazz: 'noinherit',    display: '',             symbolFunction: this.glyph.showNoInheritSymbol}
                       };
    this.zygosityMap = {
                      HOM:        {value: 1, badge: true,  clazz: 'zyg_hom',        symbolFunction: this.glyph.showHomSymbol},
                      HET:        {value: 2, badge: false, clazz: 'het'        },
                      HOMREF:     {value: 3, badge: false, clazz: 'homref'     },
                      gt_unknown: {value: 4, badge: false, clazz: 'gt_unknown' }
                       };
    this.filtersPassedMap = {
                      'pathogenic':        {value: 1, badge: false, clazz: 'system-flagged',  symbolFunction: this.glyph.showFlaggedSymbol},
                      'denovo':            {value: 1, badge: false, clazz: 'system-flagged',  symbolFunction: this.glyph.showFlaggedSymbol},
                      'recessive':         {value: 1, badge: false, clazz: 'system-flagged',  symbolFunction: this.glyph.showFlaggedSymbol},
                      'xlinked':           {value: 1, badge: false, clazz: 'system-flagged',  symbolFunction: this.glyph.showFlaggedSymbol},
                      'autosomalDominant': {value: 1, badge: false, clazz: 'system-flagged',  symbolFunction: this.glyph.showFlaggedSymbol},
                      'compoundHet':       {value: 1, badge: false, clazz: 'system-flagged',  symbolFunction: this.glyph.showFlaggedSymbol},
                      'highOrModerate':    {value: 2, badge: false, clazz: 'system-flagged',  symbolFunction: this.glyph.showFlaggedSymbol},
                      'somatic':           {value: 2, badge: false, clazz: 'system-flagged',  symbolFunction: this.glyph.showFlaggedSymbol},
                      'userFlagged':       {value: 3, badge: false, clazz: 'user-flagged',    symbolFunction: this.glyph.showFlaggedSymbol},
                      '':                  {value: 3, badge: false, clazz: '',                symbolFunction: ''}
                       };
    this.unaffectedMap = {
                          present_some:   {value: 104, badge: false, clazz: 'unaffected', symbolFunction: this.glyph.showAffectedPresentSymbol},
                          present_all:    {value: 104, badge: false, clazz: 'unaffected', symbolFunction: this.glyph.showAffectedPresentSymbol},
                          present_none:   {value: 104, badge: false, clazz: 'unaffected', symbolFunction: this.glyph.showAffectedPresentSymbol},
                          none:           {value: 104, badge: false, clazz: 'unaffected', symbolFunction: ''}
                   };
    this.affectedMap = {
                          present_all:    {value: 3,   badge: true,  clazz: 'affected',  symbolFunction: this.glyph.showAffectedPresentSymbol},
                          present_some:   {value: 4,   badge: true,  clazz: 'affected',  symbolFunction: this.glyph.showAffectedPresentSymbol},
                          present_none:   {value: 104, badge: false, clazz: 'affected',  symbolFunction: this.glyph.showAffectedPresentSymbol},
                          none:           {value: 104, badge: false, clazz: 'affected',  symbolFunction: ''}
                   };
      this.harmfulVariantMap = {
                          1:    {value: 1,   badge: true,  clazz: 'harmful1-variant',  symbolFunction: this.glyph.showHarmfulVariantSymbol},
                          2:    {value: 2,   badge: true,  clazz: 'harmful2-variant',  symbolFunction: this.glyph.showHarmfulVariantSymbol},
                          3:    {value: 3,   badge: true,  clazz: 'harmful3-variant',  symbolFunction: this.glyph.showHarmfulVariantSymbol},
                          none: {value: 101, badge: false, clazz: '',                  symbolFunction: ''}
                   };
    // For af range, value must be > min and <= max
    this.afHighestMap = [ {min: -100.1, max: -100,   value: +99, badge: false, clazz: '',    symbolFunction: ''},
                         {min: -1.1,   max: +0,        value: +2,  badge: true, clazz: 'afhighest_rare',    symbolFunction: this.glyph.showAfRareSymbol},
                         {min: -1.1,   max: +.0001,    value: +3,  badge: true, clazz: 'afhighest_rare',    symbolFunction: this.glyph.showAfRareSymbol},
                         {min: -1.1,   max: +.001,     value: +4,  badge: true, clazz: 'afhighest_rare',    symbolFunction: this.glyph.showAfRareSymbol},
                         {min: -1.1,   max: +.01,      value: +5,  badge: true, clazz: 'afhighest_rare',    symbolFunction: this.glyph.showAfRareSymbol},
                         {min: -1.1,   max: +.05,      value: +6,  badge: true, clazz: 'afhighest_rare',    symbolFunction: this.glyph.showAfRareSymbol},
                         {min: +.05,   max: +1,        value: +7,  badge: false,clazz: '',    symbolFunction: ''},
                        ];

  }

  getInheritanceLabel(inheritance) {
    var map = this.inheritanceMap[inheritance];
    return map ? map.display : inheritance;
  }

  showHighestImpactSymbol(selection, options) {
    var variant = d3.select(selection.node().parentNode).datum();
    var vepHighestImpacts = options.self.globalApp.utility.getNonCanonicalHighestImpactsVep(variant, options.self.impactMap);
    if (Object.keys(vepHighestImpacts).length > 0) {
      options.self.glyph.showImpactSymbol(selection, options);
    }
  }


}


