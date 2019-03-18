<style lang="sass" >
    @import ../../../assets/sass/variables

    .info-button
        margin: 0px !important
        padding: 0px !important
        min-width: 17px !important
        height: 17px !important
        margin-top: -6px !important

        .btn__content
            padding: 0px
            max-width: 17px
            max-height: 17px

            i.material-icons
                font-size: 17px
                color: $light-badge-color

    .close-button
        margin: 0px !important
        padding: 0px !important
        min-width: 25px !important
        height: 25px !important
        margin-bottom: 15px !important

        .btn__content
            padding: 0px
            max-width: 25px
            max-height: 25px

            i.material-icons
                font-size: 25px
                color: $text-color

    .info-title
        font-size: 20px
        color: $app-color
        margin-bottom: 15px

    .info-card
        padding: 15px 15px 20px 15px

    .info-description
        font-size: 13px

    .info-publication
        margin-top: 20px
        font-size: 13px
        a
            font-style: italic
            font-size: 13px
            line-height: 16px
</style>
<template>

    <v-dialog  width="500"  v-model="showPopup" lazy >
        <v-btn class="info-button" flat  slot="activator">
            <v-icon>help</v-icon>
        </v-btn>
        <v-card class="info-card">
            <v-card-title style="justify-content:space-between">
                <span class="info-title">{{ info[name].title }}</span>
                <v-btn  @click="onClose" flat class="close-button">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text class="info-description" v-html="info[name].description">
            </v-card-text>
            <div class="info-publication"  v-if="info[name].publication">
          <span style="display:inline-block;margin-right:2px">
            Publication
          </span>
                <a :href="info[name].publication" target="_info">{{ info[name].publication }}</a>
            </div>
        </v-card>
    </v-dialog>

</template>

<script>

    export default {
        name: 'info-popup',
        props: {
            name: String
        },
        data() {
            return {
                showPopup: false,
                info: {
                    'revel': {
                        title: 'REVEL Score',
                        description: 'Revel scores only apply to missense variants.<br><br>The score is a predicted pathogenicity score from 0 to 1 where 0 is benign and 1 is pathogenic.<br><br>Revel scores are open to interpretation, but as a starting point, we have categorized a score > .5 as ‘moderate’ and a score > .75 as ‘high’.',
                        publication: 'REVEL: An Ensemble Method for Predicting the Pathogenicity of Rare Missense Variants',
                        publicationUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5065685/'

                    }
                }

            }
        },
        methods: {

            onClose: function() {
                this.showPopup = false;
            }
        }
    }

</script>
