<style lang="sass" >
@import ../../../assets/sass/variables
#variant-inspect
  .variant-inspect-body
    .variant-row
      display: flex
      flex-direction: row
      font-size: 13px
      margin-bottom: 10px


      .variant-text
        line-height: 15px
        max-width: 190px

      a
        color:  $link-color !important
        cursor: pointer
        font-size: 13px !important

      &.no-icon
        padding-left: 22px

        span
          line-height: 14px
          padding-top: 4px

      &.no-top-margin
        margin-top: -10px

      &.small-font
        font-size: 12px

      .material-icons
        font-size: 22px
        margin-right: 4px
        color: $unremarkable-color
        margin-top: -3px

        &.level-high
          color: $level-high-color
        &.level-medium
          color: $moderate-impact-color
        &.sufficient
          color: $success-color
        &.level-unremarkable
          color: $not-significant-color

      .material-icons.link-icon
        font-size: 15px
        margin-top: -2px
        margin-left: -1px
        margin-right: 0px
        color: $link-color

      .chip, .v-chip
        vertical-align: top
        margin-top: 0px
        margin-bottom: 0px
        margin-right: 0px
        .chip__content, .v-chip__content
          padding: 0 0px
          height: 15px
          width: 34px
          font-size: 12px
          justify-content: center
          color: $text-color
        &.high
          .chip__content, .v-chip__content
            background-color:  $danger-color
            color: white

      .pheno-source
        width: 40px
        display: inline-block
        font-size: 12px
        font-style: italic
        vertical-align: top

      .pheno-search-term


</style>

<template>
  <div>
    <div v-if="selectedVariant.inheritance.indexOf('n/a') == -1 && selectedVariant.inheritance.length > 0" class="variant-row">

      <app-icon  class="level-high" width="18" height="18" icon="evidence"></app-icon>

      <app-icon  :icon="selectedVariant.inheritanceGlyph ? selectedVariant.inheritanceGlyph : selectedVariant.inheritance" style="margin-left:4px;margin-right:4px" width="16" height="16"></app-icon>

      <div  style="padding-bottom: 1px; padding-left: 4px">
        <span style="width:100px;line-height:14px">{{ selectedVariant.inheritance == 'denovo' ? 'De novo' : capitalize(selectedVariant.inheritance) }}</span>
      </div>


    </div>
    <div v-if="selectedVariant.inheritance.length == 0" class="variant-row">
      <div>
        unknown 
      </div>
    </div> 
  </div> 
</template>


<script>

import AppIcon                  from "../partials/AppIcon.vue"

export default {
  name: 'variant-inspect-inheritance-row',
  components: {
    AppIcon
  },
  props: {
    selectedVariant: null
  },
  data() {
    return {
    }
  },


  methods: {

    capitalize: function(buf) {
      if (buf) {
        return this.globalApp.utility.capitalizeFirstLetter(buf);
      } else {
        return "";
      }
    },


  },


  computed: {


  },

  watch: {

  },

  filters: {

  },

  updated: function() {

  },

  mounted: function() {

  },

  created: function() {
  }


}
</script>
