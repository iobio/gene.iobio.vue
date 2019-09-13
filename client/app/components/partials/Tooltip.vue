<style lang="sass">
    @import ../../../assets/sass/variables
    .click-tip-title
        font-size: 16px
        background-color: $app-color
        color: white
</style>
<template>
    <v-menu v-model="displayTooltip" absolute
            :min-width="width"
            :position-x="xPos"
            :position-y="yPos">
        <v-card>
            <v-card-title class="click-tip-title">
                Variant Details
            </v-card-title>
            <div>stuff and things</div>
        </v-card>
    </v-menu>
</template>

<script>
    export default {
        name: "tooltip",
        props: {
            width: {
                type: String,
                default: "450px"
            },
            xPos: {
                type: Number,
                default: 0
            },
            yPos: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                displayTooltip: false
            }
        },
        methods: {
            showTooltip: function() {
                const self = this;

            },
            hideTooltip: function() {

            }
        },
        mounted() {
            const self = this;
            self.displayTooltip = false;
        }
    }
</script>