<style lang="sass" >

@import ../../../assets/sass/variables

.filter-settings-form
  .filter-title
    vertical-align: top
    margin-left: 3px
    color: $text-color

  svg
    width: 22px
    height: 18px

  .remove-custom-filter
    margin: 0px
    float: right
    color: $text-color


#filter-settings-icon
  font-size: 20px
  color: $app-color



</style>

<template>
  <v-menu
  id="filter-settings-menu"
  offset-y
  :close-on-content-click="false"
  :close-on-click="false"
  :nudge-width="470"
  v-model="showMenu"
  >

    <v-btn slot="activator" raised  medium flat>
      <v-icon id="filter-settings-icon">settings</v-icon>
    </v-btn>


    <v-layout row wrap class="filter-settings-form mt-3 mx-2 px-2" style="max-width:500px;min-width:500px;">

      <v-expansion-panel>
        <v-expansion-panel-content
        v-for="filter in filters"
        :ref="filter.name + 'ExpansionRef'"
        :key="filter.name"
        :value="filter.active"
        >
          <div slot="header">
            <filter-icon :icon="filter.name">
            </filter-icon>
            <span class="filter-title">
              {{ filter.display }}
            </span>
            <v-btn small flat
             class="remove-custom-filter"
             v-if="filter.custom"
             @click="onRemoveCustomFilter(filter)">
              Remove
            </v-btn>
          </div>
          <v-card>
            <filter-settings
              v-if="filter.name != 'coverage'"
              v-bind:ref="filter.name + 'SettingsRef'"
              :filterModel="filterModel"
              :filter="filter">
            </filter-settings>
            <filter-settings-coverage
              v-if="filter.name == 'coverage'"
              v-bind:ref="filter.name + 'SettingsRef'"
              :filterModel="filterModel">
            </filter-settings-coverage>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>



      <v-flex xs12 class="mt-1 text-xs-right">
        <v-btn style="float:left"
          @click="onNewFilter">
          New filter
        </v-btn>



        <v-btn
          @click="onApply">
          Apply
        </v-btn>

        <v-btn @click="onCancel">
         Cancel
       </v-btn>
      </v-flex>

    </v-layout>

  </v-menu>
</template>


<script>

import FilterIcon             from '../partials/FilterIcon.vue'
import FilterSettings         from '../partials/FilterSettings.vue'
import FilterSettingsCoverage from '../partials/FilterSettingsCoverage.vue'

export default {
  name: 'filter-settings-menu',
  components: {
    FilterIcon,
    FilterSettings,
    FilterSettingsCoverage
  },
  props: {
    filterModel: null,
    showCoverageCutoffs: null
  },
  data () {
    return {
      showMenu: false,
      filters: [
        {name: 'pathogenic',        display: 'Known pathogenic',        active: false, custom: false},
        {name: 'autosomalDominant', display: 'Autosomal dominant',      active: false, custom: false},
        {name: 'recessive',         display: 'Recessive',               active: false, custom: false},
        {name: 'xlinked',           display: 'X-linked',                active: false, custom: false},
        {name: 'compoundHet',       display: 'Compound het',            active: false, custom: false},
        {name: 'highOrModerate',    display: 'High or moderate impact', active: false, custom: false},
        {name: 'coverage',          display: 'Insufficient coverage',   active: false, custom: false}
      ]
    }
  },
  watch: {
    showCoverageCutoffs: function() {
      if (this.showCoverageCutoffs) {
        this.showMenu = true;
        this.filters.forEach(function(f) {
          f.active =  f.name == 'coverage';
        })
      }
    }
  },
  methods: {
    onNewFilter: function() {
      let self = this;
      this.filters.forEach(function(filter) {
        filter.active = false;
        var refName = filter.name + 'ExpansionRef';
        self.$refs[refName].forEach(function(component) {
          component.isActive = false;
        })
      });
      this.filters.push({name: 'custom' + (this.filters.length - 7), display: 'custom', active: true, custom: true});
    },
    onApply: function() {
      let self = this;
      this.filters.forEach(function(filter) {
        var refName = filter.name + 'SettingsRef';
        self.$refs[refName].forEach(function(component) {
          component.apply();
        })
      });
      self.$emit('filter-settings-applied');
      this.$emit('filter-settings-closed');
      this.showMenu = false;
    },
    onCancel: function() {
      this.showMenu = false;
      this.$emit('filter-settings-closed');
    },
    close: function() {
      this.showMenu = false;
      this.$emit('filter-settings-closed');
    },
    onRemoveCustomFilter: function(filter) {
      var idx = this.filters.indexOf(filter);
      if (idx >= 0) {
        this.filters.splice(idx, 1);
      }
    }
  },
  computed: {
  },
  created: function() {

  },
  mounted: function() {
  }
}
</script>
