<style lang="sass">
@import ../../../assets/sass/variables

#gene-count-badges
  display: inline-block
  vertical-align: top
  margin-top: -5px

  button
    padding-left: 0px
    padding-right: 0px
    min-width: 50px
    margin-left: 0px
    margin-right: 0px

    .btn__content
      padding: 0px

    &.selected
      border: thick solid #717171 !important
      height: 50px
      margin-top: -10px

      .btn__content
        padding-top: 5px;

    &.disabled
      opacity: .6
      pointer-events: none

      .badge__badge
        display: none

    .badge
      padding: 0px 5px 0px 0px
      background-color: transparent

      &.custom
        padding: 3px 7px

      &.flagged
        color: $app-color
        padding: 3px 7px

        i.material-icons
          font-size: 21px



    .badge__badge
      font-weight: normal
      font-size: 12px
      width: 15px
      height: 15px
      right: -7px
      top: -6px
      background-color: $default-badge-color !important



  .btn--floating.btn--small
    height: 18px
    width: 16px
    position: relative
    padding: 0px
    min-width: 20px
    margin-left: 25px
    margin-top: -35px

  .badge-wrapper
    display: inline-block
    height: 45px

  .custom-badge
    color: $app-color
    font-size: 11px

  #active-filter-info
    padding: 0px
    background-color: $info-color !important
    color: $text-color !important

    span
      padding-top: 4px
      display: inline-block
      margin-right: -40px

    button
     float: right
     margin: 0px
     margin-right: 15px

    .btn__content
      color: $text-color !important


</style>

<template>
  <div  id="gene-count-badges" >

    <v-layout row>
     <v-flex xs12class="text-xs-center" >
      Filters
     </v-flex>
    </v-layout>


    <v-layout row style="margin-top:-5px">

      <span
       v-for="filter in filters"
       :key="filter.name"
       class="badge-wrapper"
       @mouseover="onMouseOver(filter)"
       @mouseleave="onMouseLeave(filter)"
       v-tooltip.top-center="{content: filter.tooltip, show: filter.showTooltip, trigger: 'manual'}"
       >
        <v-btn  flat
        v-bind:ref="filter.name"
        v-bind:id="filter.name"
        v-bind:class="badgeCounts[filter.name] == 0 ? 'disabled' : ''"
        @click="onBadgeClick(filter)" slot="activator" flat

        >
          <v-badge right >
            <span slot="badge"> {{ badgeCounts[filter.name] }} </span>
            <filter-icon v-bind:icon="filter.name">
            </filter-icon>
          </v-badge>
        </v-btn>
      </span>


      <span class="badge-wrapper"
       v-for="customFilter in customFilters"
       :key="customFilter.name"
        v-tooltip.top-center="customFilter.display"
       >
          <v-btn flat v-bind:ref="customFilter.name"
           v-bind:id="customFilter.name"
           v-bind:class="badgeCounts[customFilter.name] && badgeCounts[customFilter.name] == 0 ? 'disabled' : badgeCounts[customFilter.name] == null ? 'hide' : ''"
           @click="onBadgeClick(customFilter)"
          >
            <v-badge class="custom" right >
              <span  slot="badge">{{ badgeCounts[customFilter.name] }}</span>
              <span  class="custom-badge">
                {{ filterModel.flagCriteria[customFilter.name].name }}
              </span>
            </v-badge>
          </v-btn>

      </span>



      <filter-settings-menu
       class="ml-2"
       :filterModel="filterModel"
       :showCoverageCutoffs="showCoverageCutoffs"
       @filter-settings-applied="onFilterSettingsApplied"
       @filter-settings-closed="$emit('filter-settings-closed')"
       v-tooltip.top-center="`Customize filters`">
      </filter-settings-menu>


    </v-layout>
    <v-alert   id="active-filter-info"
      :value="showFilterInfo"
      transition="scale-transition"
    >
      <span>{{ showFilterInfo ? activeFilter.display : "" }}</span>
      <v-btn flat @click="onClearFilter">CLEAR FILTER</v-btn>
    </v-alert>
  </div>
</template>

<script>
import FilterIcon         from '../partials/FilterIcon.vue'
import FilterSettingsMenu from '../partials/FilterSettingsMenu.vue'


export default {
  name: 'filter-badges',
  components: {
    FilterIcon,
    FilterSettingsMenu
  },
  props: {
    badgeCounts: null,
    filterModel: null,
    showCoverageCutoffs: null
  },
  data () {
    return {
      customFilters: null,
        // TODO: what information would be useful here?
        // Ideas: Found in cosmic, found in biocportal, existing clinvar scales, compound het
        // Do we need dominant and recessive?
      filters: [
        {name: 'pathogenic',        display: 'Known pathogenic variants'        , tooltip: null, showTooltip: false},
        {name: 'autosomalDominant', display: 'Autosomal dominant variants'      , tooltip: null, showTooltip: false},
        {name: 'recessive',         display: 'Recessive variants'               , tooltip: null, showTooltip: false},
        {name: 'compoundHet',       display: 'Compound het variants'            , tooltip: null, showTooltip: false},
        {name: 'highOrModerate',    display: 'High or moderate impact variants' , tooltip: null, showTooltip: false},
        {name: 'coverage',          display: 'Insufficient coverage in genes'   , tooltip: null, showTooltip: false}
      ],
      activeFilter: null,
      showFilterInfo: false
    }
  },
  computed: {

  },
  methods: {
    onBadgeClick: function(filter) {
      let self = this;
      $(self.$el).find("#" + filter.name).toggleClass("selected");
      for (var key in  (self.filterModel.flagCriteria)) {
        if (key != filter.name) {
         $(self.$el).find("#" + key).removeClass("selected");
        }
      }
      if (filter.name != 'coverage') {
         $(self.$el).find("#coverage").removeClass("selected");
      }
      self.activeFilter = $(self.$el).find("#" + filter.name).hasClass("selected") ? filter : null;
      self.showFilterInfo = self.activeFilter != null ? true : false;
      self.$emit("badge-click", $(self.$el).find("#" + filter.name).hasClass("selected") ? filter.name : null);
    },
    onClearFilter: function() {
      let self = this;
      self.clearFilter();
      self.$emit("badge-click", null);
    },
    clearFilter: function() {
      let self = this;
      if (self.activeFilter) {
        $(self.$el).find("#" + self.activeFilter.name).toggleClass("selected");
        self.showFilterInfo = false;
        self.activeFilter = null;
      }
    },
    onFilterSettingsApplied: function() {
      let self = this;

      self.customFilters = [];
      for (var filterName in self.filterModel.flagCriteria) {
        if (self.filterModel.flagCriteria[filterName].active && self.filterModel.flagCriteria[filterName].custom) {
          self.customFilters.push({name: filterName, display: self.filterModel.flagCriteria[filterName].name});
        }
      }

      this.$emit('filter-settings-applied');
    },
    onMouseOver: function(filter) {
      filter.tooltip = filter.display;
      filter.showTooltip = true;
    },
    onMouseLeave: function(filter) {
      filter.showTooltip = false;
    },
    showTooltip: function(filterName, tooltip) {
      let self = this;
      let filter = self.filters.filter(function(f) {
        return f.name == filterName;
      })[0];
      filter.showTooltip = true;
      filter.tooltip = tooltip;
    },
    hideTooltip: function(filterName) {
      let self = this;
      let filter = self.filters.filter(function(f) {
        return f.name == filterName;
      })[0];
      filter.showTooltip = false;
    }
  }
}
</script>
