<style lang="sass">
    @import ../../../assets/sass/variables

    #cosmic-list
        .list__tile
            height: 85px

</style>
<template>
    <v-layout row justify-center>
        <v-dialog v-model="dialog" persistent max-width="700px">
            <v-toolbar>
                <v-toolbar-title style="color: white; padding-left: 10px">Terms of Use</v-toolbar-title>
            </v-toolbar>
            <v-card>
                <v-card-text>
                    <v-list id="cosmic-list">
                        <v-subheader><i>By viewing COSMIC variants, you agree to the following use conditions of the Wellcome Trust
                            Sanger Institute: </i></v-subheader>
                        <v-list-tile @click="">
                            <v-list-tile-action>
                                <v-checkbox v-model="termsAgreed[0]" color="appColor"></v-checkbox>
                            </v-list-tile-action>
                            <v-list-tile-content @click="termsAgreed[0] = !termsAgreed[0]">
                                <div>I confirm that I am employed by/studying at an academic or not-for-profit institution.</div>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile @click="">
                            <v-list-tile-action>
                                <v-checkbox v-model="termsAgreed[1]" color="appColor"></v-checkbox>
                            </v-list-tile-action>
                            <v-list-tile-content @click="termsAgreed[1] = !termsAgreed[1]">
                                <div>I have read and agree with the COSMIC <a href="https://cancer.sanger.ac.uk/cosmic/cancergenome/assets/COSMIC_academic_license_march2015.pdf" target="_blank">academic licensing agreement.</a></div>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile @click="">
                            <v-list-tile-action>
                                <v-checkbox v-model="termsAgreed[2]" color="appColor"></v-checkbox>
                            </v-list-tile-action>
                            <v-list-tile-content @click="termsAgreed[2] = !termsAgreed[2]">
                                <div>I agree that my use of COSMIC as permitted by the Academic Terms and Conditions shall be solely for the purpose of research or educational activities in the course of my academic or not-for-profit employment. I agree not to transfer, grant access to, or otherwise distribute COSMIC in any form or manner.</div>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile @click="">
                            <v-list-tile-action>
                                <v-checkbox v-model="termsAgreed[3]" color="appColor"></v-checkbox>
                            </v-list-tile-action>
                            <v-list-tile-content @click="termsAgreed[3] = !termsAgreed[3]">
                                <div>I agree that GRL provides COSMIC “as is” without any representations or warranties of any kind and that GRL excludes to the fullest extent permitted by law any liability that may arise from my use of COSMIC.</div>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile @click="">
                            <v-list-tile-action>
                                <v-checkbox v-model="termsAgreed[4]" color="appColor"></v-checkbox>
                            </v-list-tile-action>
                            <v-list-tile-content @click="termsAgreed[4] = !termsAgreed[4]">
                                <div>I have read and agree to the COSMIC <a href="https://cancer.sanger.ac.uk/cosmic/terms" target="_blank">Terms and Conditions.</a></div>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile @click="">
                            <v-list-tile-action>
                                <v-checkbox v-model="termsAgreed[5]" color="appColor"></v-checkbox>
                            </v-list-tile-action>
                            <v-list-tile-content @click="termsAgreed[5] = !termsAgreed[5]">
                                <div>I have read and and understand the COSMIC <a href="https://cancer.sanger.ac.uk/cosmic/privacy" target="_blank">privacy policy.</a></div>
                            </v-list-tile-content>
                        </v-list-tile>
                    </v-list>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="cohort-navy" @click.native="confirmCosmicUse" :disabled="!allTermsAgreed">Agree</v-btn>
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
                dialog: false,
                termsAgreed: [false, false, false, false, false, false]
            }
        },
        watch: {},
        computed: {
            allTermsAgreed: function() {
                let self = this;
                let allAgreed = true;
                self.termsAgreed.forEach((term) => {
                    allAgreed &= term;
                });
                return allAgreed;
            }
        },
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