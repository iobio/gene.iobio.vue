<style lang="sass">
    .file-component
        label
            font-size: 12px !important

        .input-group--text-field
            margin-top: 0px !important

            input
                font-size: 11px !important

        .input-group--text-field.input-group--dirty.input-group--select
            label
                -webkit-transform: translate(0, -18px) scale(0.95)
                transform: translate(0, -18px) scale(0.95)

        .input-group--text-field.input-group--dirty:not(.input-group--textarea)
            label
                -webkit-transform: translate(0, -18px) scale(0.95)
                transform: translate(0, -18px) scale(0.95)
        .btn--floating.btn--small
            height: 20px
            width: 20px

        #clear-file-button
            color: #82b1ff
            font-size: 12px
            font-style: italic
            margin: 0px


</style>
<template>

    <v-layout row wrap class="file-component">
        <v-flex xs9>
            <v-text-field
                    v-if="fileType === 'url'"
                    v-bind:label="'Enter ' + label +  ' URL'"
                    hide-details
                    v-model="url"
                    color="appColor"
                    @change="onUrlChange"
            ></v-text-field>
            <v-text-field
                    v-if="fileType === 'url' && (separateUrlForIndex || indexUrl)"
                    v-bind:label="'Enter ' + indexLabel +  ' URL'"
                    hide-details
                    v-model="indexUrl"
                    @change="onUrlChange"
                    color="appColor"
            ></v-text-field>
        </v-flex>

        <v-flex xs3 class="mt-2">
            or
            <file-chooser class="ml-1"
                          title="Choose files"
                          :isMultiple="true"
                          :showLabel="false"
                          @file-selected="onFileSelected">
            </file-chooser>
        </v-flex>

        <v-flex xs12>
            <span> {{ fileName }} </span>
            <v-btn small flat id="clear-file-button"
                   v-on:click="clearSelectedFile"
                   v-if="fileName != null && fileName.length > 0">
                Clear
            </v-btn>
        </v-flex>
    </v-layout>


</template>

<script>

    import {Typeahead} from 'uiv'
    import FileChooser from '../partials/FileChooser.vue'

    export default {
        name: 'sample-data-file',
        components: {
            Typeahead,
            FileChooser
        },
        props: {
            defaultUrl: null,
            defaultIndexUrl: null,
            label: null,
            indexLabel: null,
            filePlaceholder: null,
            fileAccept: null,
            separateUrlForIndex: null
        },
        data() {
            return {
                isValid: false,
                fileType: 'url',
                url: null,
                indexUrl: null,
                fileName: null
            }
        },
        watch: {
            defaultUrl: function () {
                this.url = this.defaultUrl;
                this.indexUrl = this.defaultIndexUrl;
            }
        },
        methods: {
            onFileSelected: function (event) {
                if (event.target.files.length > 0) {
                    this.fileName = event.target.files[0].name;
                    this.url = '';
                    this.indexUrl = '';
                }
                this.$emit("file-selected", event.target);
            },
            clearSelectedFile: function () {
                this.fileName = '';
                this.$emit("file-selected");
            },
            onUrlChange: _.debounce(function (newUrl) {
                if (newUrl && newUrl.length > 0) {
                    this.fileName = '';
                }
                this.$emit('url-entered', this.url, this.indexUrl);
            }, 100)
        },
        created: function () {
            this.indexUrl = this.defaultIndexUrl;
            this.url = this.defaultUrl;
        }
    }

</script>