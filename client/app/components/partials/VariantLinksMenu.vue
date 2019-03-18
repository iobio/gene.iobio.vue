<style lang="sass">

    @import "../../../assets/sass/variables"

    #show-variant-links-button
        margin: 0px 8px 0px 8px
        padding: 0px
        margin-top: -3px

        .btn__content
            color:  $app-color

            i.material-icons
                color: $app-color
                font-size: 17px
                padding-right: 3px

    #variant-links
        display: inline-block
        .variant-link
            display: inline-block
            margin-right: 10px
            color: $link-color !important
            font-size: 13px

    .variant-link-button
        background-color: $link-button-color !important
        padding: 0px
        height: 20px !important
        min-width: 70px
        margin-left: 8px
        margin-right: 0px
        margin-top: -2px
        margin-bottom: 0px

        .btn__content
            color: $app-color !important
            padding-left: 4px
            padding-right: 4px
            font-size: 12px

            i.material-icons
                color: $app-color
                font-size: 12px
                padding-right: 2px
                padding-top: 0px


</style>

<template>
  <span :style="expanded ? 'margin-left:40px' : ''">
    <v-menu
            v-if="!expanded"
            offset-y
            :close-on-content-click="false"
            bottom
            v-model="showMenu"
    >

      <v-btn id="show-variant-links-button"
             flat
             slot="activator"
             v-tooltip.top-center="`External links to variant info (e.g. VarSome, UCSC Browser, etc.`"
      >
          <v-icon>open_in_new</v-icon>
          External links
      </v-btn>

      <v-list>

          <v-list-tile
                  v-for="link in links"
                  :key="link.name">

            <v-list-tile-title>
              <a
                      :href="link.url"
                      :target="`_` + link.name"
                      class="variant-link"
              >
                  {{ link.display }}
              </a>
            </v-list-tile-title>

          </v-list-tile>

      </v-list>

    </v-menu>

    <v-btn v-if="expanded"
           flat
           class="variant-link-button"
           v-for="link in links"
           @click="onClickLink(link)"
           :key="link.name">
      <v-icon>open_in_new</v-icon>
      {{ link.display }}
    </v-btn>
  </span>
</template>

<script>



    export default {
        name: 'variant-links-menu',
        components: {
        },
        props: {
            geneModel: null,
            selectedGene: null,
            selectedVariant: null,
            expanded: null
        },
        data () {
            return {
                showMenu: null,
                links: null
            }
        },
        watch: {
        },
        methods: {
            onClickLink: function(link) {
                window.open(link.url, "_" + link.display);
            },
            initLinks: function() {
                if (this.selectedGene && this.selectedVariant && this.geneModel) {
                    this.links = this.geneModel.getVariantLinks(this.selectedGene.gene_name, this.selectedVariant);
                }
            }
        },
        created: function() {
        },
        mounted: function() {
            this.initLinks();
        },
        updated: function() {
        },
        watch: {
            showMenu: function() {
                this.initLinks();
            },
            selectedVariant: function() {
                this.initLinks();
            }
        }
    }
</script>