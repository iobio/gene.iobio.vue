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
                <v-toolbar-title style="color: white">Delete Track</v-toolbar-title>
            </v-toolbar>
            <v-card>
                <v-card-text>
                    Are you sure you want to delete this track?
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="cohort-navy" @click.native="confirmDeleteTrack">Yes</v-btn>
                    <v-btn color="cohort-navy" @click.native="cancelDialog">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>
<script>
    export default {
        name: 'confirmation-dialog',
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
            confirmDeleteTrack: function() {
                let self = this;
                self.dialog = false;
                self.$emit('confirm-delete-track');
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