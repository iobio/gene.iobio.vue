<style lang="sass">
    @import ../../../assets/sass/variables

    .dragArea
        min-height: 50px

    .dialog-list-header
        font-size: 16px !important
        text-align: left !important
        font-weight: bold !important
        color: rgba(0,0,0,0.54) !important

    .drag-title
        text-align: center !important
        padding-bottom: 2px !important

</style>
<template>
    <v-layout row justify-center>
        <v-dialog v-model="dialog" persistent max-width="500">
            <v-toolbar>
                <v-toolbar-title style="color: white; padding-left: 6px">Terms of Use</v-toolbar-title>
            </v-toolbar>
            <v-card>
                <v-card-text>
                    <div>By viewing COSMIC variants, you agree to the following use conditions of the Wellcome Trust
                        Sanger Institute: </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="cohort-navy" @click.native="confirmCosmicUse">Yes</v-btn>
                    <v-btn color="cohort-navy" @click.native="cancelDialog">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>
<script>
    export default {
        name: 'cosmic-confirmation-dialog',
        components: {},
        props: {},
        data() {
            return {
                dialog: false
            }
        },
        watch: {},
        computed: {},
        methods: {
            displayDialog: function () {
                let self = this;
                self.dialog = true;
            },
            confirmCosmicUse: function() {
                let self = this;
                self.dialog = false;
                self.$emit('confirm-cosmic-track');
            },
            cancelDialog: function() {
                let self = this;
                self.dialog = false;
            }
        },
        created: function () {
        },
        mounted: function () {
        }
    }

</script>