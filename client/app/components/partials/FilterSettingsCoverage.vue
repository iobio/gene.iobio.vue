
<style lang="sass" >

.filter-coverage-form
  .input-group
    label
      font-size: 13px

</style>

<template>


      <v-layout row wrap class="filter-coverage-form mx-2 px-2" style="max-width:500px;">
        <v-flex  xs12 class="mb-3" >
            Coverage Thresholds
        </v-flex>

        <v-flex  xs4 class="coverage-threshold mb-3 pr-4" >
            <v-text-field label="Min"  suffix="X" v-model="minCoverage" hide-details>
            </v-text-field>
        </v-flex>
        <v-flex  xs4 class="coverage-threshold mb-3 pr-4" >
            <v-text-field label="Mean"  suffix="X" v-model="medianCoverage" hide-details>
            </v-text-field>
        </v-flex>
        <v-flex  xs4 class="coverage-threshold mb-3" >
            <v-text-field label="Median"  suffix="X" v-model="medianCoverage" hide-details>
            </v-text-field>
        </v-flex>

      </v-layout>


</template>

<script>



export default {
  name: 'filter-settings-coverage',
  components: {
  },
  props: {
    filterModel: null
  },
  data () {
    return {
      minCoverage: null,
      meanCoverage: null,
      medianCoverage: null
    }
  },
  watch: {
  },
  methods: {
    init: function() {
      this.minCoverage               = this.filterModel.geneCoverageMin;
      this.meanCoverage              = this.filterModel.geneCoverageMean;
      this.medianCoverage            = this.filterModel.geneCoverageMedian;
    },
    apply: function() {
      this.filterModel.geneCoverageMin         = this.minCoverage;
      this.filterModel.geneCoverageMean        = this.meanCoverage;
      this.filterModel.geneCoverageMedian      = this.medianCoverage;
    }
  },
  computed: {
  },
  created: function() {
  },
  mounted: function() {
    this.init();
  }
}
</script>
