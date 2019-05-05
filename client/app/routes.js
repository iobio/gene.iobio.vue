import jQuery from 'jquery'
global.jQuery = jQuery;
global.$ = jQuery;

import globalEduTour from './partials/GlobalEduTour.js'
import d3 from 'd3'
import _ from 'lodash'

import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import GeneHome from './components/pages/GeneHome.vue'
import Tutorial from './components/pages/Tutorial.vue'
import UseCases from './components/pages/UseCases.vue'
import Exhibit from './components/pages/Exhibit.vue'
import ExhibitCases from './components/pages/ExhibitCases.vue'
import ExhibitCaseComplete from './components/pages/ExhibitCaseComplete.vue'
import ExhibitCasesComplete from './components/pages/ExhibitCaseComplete.vue'

// import VueAnalytics from 'vue-analytics'

import bootstrap from 'bootstrap/dist/css/bootstrap.css'
import {Typeahead} from 'uiv'
Vue.use(Typeahead);

import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'
import '../assets/css/siteVuetify.css'
Vue.use(Vuetify, {
    theme: {
        appColor: "#7f1010",
        appHighlight: '#10487f',
        appGray: "#888888",
        appDarkGray: '#686868',
        altRowColor: "#c6c6c8"
    }
});

import Sortable from 'vue-sortable'
Vue.use(Sortable);

import VTooltip from 'v-tooltip'
import '../assets/css/v-tooltip.css'
Vue.use(VTooltip);

import Util from './globals/Util.js'
import GlobalApp from './globals/GlobalApp.js'

Vue.use(VueRouter);

const routes = [
    {
        name: 'home',
        path: '/',
        component: GeneHome,
        beforeEnter: (to, from, next) => {
            var idx = to.hash.indexOf("#access_token");
            if (idx == 0) {
                let queryParams = Qs.parse(to.hash.substring(1));
                let {access_token, expires_in, token_type, ...otherQueryParams} = queryParams;
                localStorage.setItem('hub-iobio-tkn', token_type + ' ' + access_token);
                next('/' + Qs.stringify(otherQueryParams, {addQueryPrefix: true, arrayFormat: 'brackets'}));
            } else {
                var start = 0;
                if (idx == 0) {
                    start = 3;
                } else {
                    var idx = to.hash.indexOf("#\/");
                    var start = 0;
                    if (idx == 0) {
                        start = 3;
                    } else {
                        idx = to.hash.indexOf("#");
                        if (idx == 0) {
                            start = 2;
                        }
                    }
                }
                if (idx == 0) {
                    let queryParams = Qs.parse(to.hash.substring(start));
                    next('/' + Qs.stringify(queryParams, {addQueryPrefix: true, arrayFormat: 'brackets'}));
                } else {
                    next();
                }

            }

        },
        props: (route) => ({
            paramGene: route.query.gene,
            paramGenes: route.query.genes,
            paramSpecies: route.query.species,
            paramBuild: route.query.build,
            paramBatchSize: route.query.batchSize,
            paramGeneSource: route.query.geneSource,
            paramMyGene2: route.query.mygene2,
            paramLaunchedFromClin: route.query.launchedFromClin,
            paramMode: route.query.mode,
            paramTour: route.query.tour,
            paramFileId: route.query.fileId,

            // Added for onc
            paramSamples: route.query.samples,
            paramTumorStatus: route.query.tumorStatus,
            paramBams: route.query.bams,
            paramBais: route.query.bais,
            paramVcfs: route.query.vcfs,
            paramTbis: route.query.tbis,

            paramGeneName: route.query.geneName,
            paramSampleId: route.query.sample_uuid,
            paramIsPedigree: route.query.is_pedigree,
            paramSource: route.query.source
        })
    },
    {
        name: 'home-backward-compat1',
        path: '/#',
        redirect: '/'
    },
    {
        name: 'home-backward-compat2',
        path: '/#/',
        redirect: '/'
    },
    {
        name: 'home-hub',
        path: '/access_token*',
        redirect: '/'
    },
    {
        name: 'tutorial',
        path: '/tutorial',
        component: Tutorial
    },
    {
        name: 'use-cases',
        path: '/use-cases',
        component: UseCases,
        props: (route) => ({
            paramTopic: route.query.topic
        })
    },
    {
        name: 'exhibit',
        path: '/exhibit',
        component: Exhibit
    },
    {
        name: 'exhibit-cases',
        path: '/exhibit-cases',
        component: ExhibitCases
    },
    {
        name: 'exhibit-case-complete',
        path: '/exhibit-case-complete',
        component: ExhibitCaseComplete
    },
    {
        name: 'exhibit-cases-complete',
        path: '/exhibit-cases-complete',
        component: ExhibitCasesComplete
    }
]

const router = new VueRouter({
    'mode': 'history',
    'hashbang': false,
    'base': '/',
    'routes': routes
})

// Google analytics
// TODO: update this with oncogene ID
// Vue.use(VueAnalytics, {
//     id: 'UA-47481907-5',
//     router
// })

// define a globals mixin object
Vue.mixin({
    data: function () {
        return {
            utility: new Util(),
            globalApp: new GlobalApp()
        };
    },
    created: function () {
        this.utility.globalApp = this.globalApp;
        this.globalApp.utility = this.utility;
    }
})


window.vm = new Vue({
    el: '#app',
    created: function () {

    },
    render: h => h(App),
    router
})
