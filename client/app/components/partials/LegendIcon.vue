<style lang="sass" >
@import ../../../assets/sass/variables


</style>

<template>
  <div>
    <app-icon
     :icon="icon"
     :type="type"
     :clazz="clazz"
     :width="width"
     :height="height"
     :level="level"
     :style="iconStyle">
    </app-icon>
    <span :class="wrapLabel ? 'legend-wrap-text legend-text' : 'legend-text'"
      :style="labelStyle"
    >{{ label }}</span>
  </div>
</template>

<script>

import AppIcon from '../partials/AppIcon.vue'

export default {
  name: 'legend-icon',
  components: {
    AppIcon
  },
  props: {
    icon: null,
    type: null,
    clazz: null,
    width: null,
    height: null,
    level: null,
    label: null,
    wrapLabel: null,
    wrapWidth: null,
    iconStyle: null
  },
  data () {
    return {
    }
  },
  computed: {
      labelStyle: function() {
          const self = this;
          let compStyle = '';

          let widthStyle = 'width: 60px;';
          if (self.wrapLabel && self.wrapWidth) {
              widthStyle = 'width: ' + self.wrapWidth + 'px;';
          }
          compStyle += widthStyle;


          if (self.icon === 'clinvar') {
              compStyle += ' padding-top: 5px';
          } else if (self.icon === 'coverage' || self.icon === 'somatic-variant' || self.icon === 'undetermined') {
              compStyle += ' padding-top: 2px';
          }

          return compStyle;
      }
  }
}
</script>