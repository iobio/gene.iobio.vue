/*
* Welcome.vue
*
*/
<style lang="sass">
    @import ../../../assets/sass/variables
    $landing-page-font: Poppins
    $accent-color: #10487f
    $accent-color-light: #1662ac
    $powered-by-accent-color: #1662ac
    $accent-color-bright: #14c39a
    $header-color: #818181
    $brown-gray: #393c40
    $mid-blue-color: #416b9a
    $light-gray-color: #f0f1f3
    $cohort-blue: #95b0c6
    $app-gray: #888888
    .image-shadow
        -webkit-box-shadow: 6px 11px 68px -7px rgba(0, 0, 0, 0.49)
        box-shadow: 6px 11px 68px -7px rgba(0, 0, 0, 0.49)

    #welcome-area
        margin-top: -5px
        display: flex
        justify-content: space-around
        flex-direction: column
        align-items: center
        margin-left: -5px
        margin-right: -5px
        .welcome-panel
            padding-bottom: 0px
            &.main
                /*background: linear-gradient(white 60%, #c31919 80%, #ad1616 85%, #961313 90%, #7f1010 100%)*/
                //background: white
                display: flex
                flex-direction: row
                align-items: flex-start
                justify-content: space-between
                width: 100%
                .main-headline
                    display: flex
                    flex-direction: row
                    padding-top: 70px
                    margin-left: 30px
                    margin-right: 30px
                    width: 100vw !important
                    height: 77vh !important
            &.videos-and-blogs
                //background: linear-gradient(262deg, rgba(43,70,101,1) 23%, rgba(61,99,142,1) 73%, rgba(73,132,170,1) 95%, rgba(52,80,96,1) 100%)
                background: white
                padding-top: 20px
                padding-bottom: 20px
                padding-left: 30px
                padding-right: 30px
                width: 100%
            &.how-it-works
                width: 70%
                flex-grow: 2
                //background: linear-gradient(262deg, rgba(43,70,101,1) 23%, rgba(61,99,142,1) 73%, rgba(73,132,170,1) 95%, rgba(52,80,96,1) 100%)
                //background: linear-gradient(304deg, rgba(43,70,101,1) 14%, rgba(61,99,142,1) 68%, rgba(94,141,184,1) 85%)
                background-color: white
            &.features
                background-color: white
            &.resources
                background-color: $light-gray-color !important
                padding-top: 10px
                padding-bottom: 10px
                margin: 0
            &.collaborations
                background-color: $mid-blue-color
            #welcome-label
                font-size: 32px
                line-height: 36px
                font-family: $landing-page-font
                font-weight: normal
                padding-bottom: 5px
            #welcome-label-small
                color: $app-gray
                font-size: 20px
                font-family: $landing-page-font
                font-weight: normal
                padding-bottom: 10px
                font-weight: normal
                padding-left: 30px
                &.accent-label
                    color: $app-color
            .buttons-group
                margin-top: 0px !important
                padding-top: 30px
                display: flex
                flex-direction: column
                align-items: center
            button.welcome-button
                font-size: 16px !important
                margin-left: 7px
                margin-right: 7px
                height: 40px
                width: 270px
                margin-bottom: 10px
                background-color: $accent-color
                color: $accent-color
                font-family: $landing-page-font
                margin-bottom: 30px
                i.material-icons
                    font-size: 26px
                    width: 26px
                    color: white
                    margin-right: 7px
                .btn__content
                    color: white
            button.welcome-button-outline
                font-size: 16px !important
                margin-left: 7px
                margin-right: 7px
                height: 40px
                width: 230px
                margin-bottom: 10px
                background-color: white
                color: $accent-color
                font-family: $landing-page-font
                border: thin solid $accent-color
                i.material-icons
                    font-size: 26px
                    width: 26px
                    color: $accent-color
                    margin-right: 7px
                .btn__content
                    color: $accent-color
            #welcome-panel-content
                display: flex
                justify-content: center
                margin-top: 0px

    .resources-panel
        flex-wrap: wrap
        justify-content: center !important
        margin: 0
        width: 100vw
        .avatar
            min-height: 90px
            min-width: 90px
            margin-bottom: 10px
            margin-left: 10px
            margin-right: 10px
            background-color: transparent !important
            border: 2px solid white
            border-color: $app-gray !important
            span
                font-size: 15px

    .resources-panel, .collaborators-panel
        padding-top: 20px
        display: flex
        justify-content: space-around
        flex-direction: row
        div
            color: white
            font-family: $landing-page-font
            font-size: 18px
            margin-left: 25px
            margin-right: 25px
            text-align: center
            line-height: 22px

    .how-it-works-panel, .features-panel
        clear: both
        display: flex
        flex-direction: column
        justify-content: space-between
        flex-wrap: wrap
        padding-top: 5px
        .divider
            background-color: transparent
            max-width: 100%
            margin-top: 20px
            margin-bottom: 15px
        div.features-item
            margin-bottom: 40px
            i.material-icons
                display: inline
                margin-right: 8px
                color: $accent-color
                font-size: 28px
        div.how-it-works-item, div.features-item
            display: flex
            padding-left: 30px
            .avatar
                margin-right: 10px
                min-width: 28px !important
                min-height: 28px !important
                &.teal
                    background-color: $cohort-blue !important
                span.headline
                    font-size: 15px !important
            .how-it-works-image, .features-image
                margin-right: 0px
                padding-left: 50px
                img
                    max-width: 400px
                    min-width: 200px
                    -webkit-box-shadow: 6px 11px 68px -7px rgba(0, 0, 0, 0.49)
                    box-shadow: 6px 11px 68px -7px rgba(0, 0, 0, 0.49)
            .how-it-works-title, .features-title
                font-family: $landing-page-font
                font-size: 18px
                display: inline-block
                line-height: 24px
                margin-right: 50px
            /*width: 400px*/
            .how-it-works-title, .features-title
                margin-right: 10px
                min-width: 350px
                max-width: 350px
            .features-title
                color: $header-color
                font-weight: 500
            .how-it-works-title
                color: $header-color
                font-weight: 500

    #blog-post-content, .video-content
        display: flex
        flex-wrap: wrap
        flex-direction: row
        justify-content: space-between
        align-items: center
        padding-bottom: 40px
        padding-top: 20px
        padding-left: 40px
        padding-right: 20px
        .blog-post
            height: 100px
            width: 200px
            margin-bottom: 50px
            .blog-post-title
                font-family: $landing-page-font
                color: $app-color
                font-size: 20px
                padding-top: 15px
                text-align: center
                padding-bottom: 5px
                font-weight: 500
            .blog-post-well
                position: relative
                cursor: pointer
                position: relative
                text-align: center
                margin-left: 0px
                outline: thin solid lightgray
        .video-item
            margin-right: 30px
            margin-bottom: 20px
        .video-thumbnail-placeholder
            height: 132px
            width: 252px
            cursor: pointer
            outline: 1px solid lightgray
            position: relative
            img
                width: 250px
                height: 130px
            #play-button
                cursor: pointer
                color: $app-color
                font-size: 80px
                top: 30px
                left: 90px
                opacity: .7
                position: absolute
        .video-text-title
            font-size: 20px
            font-family: $landing-page-font
            cursor: pointer
            color: $app-color
            padding-bottom: 5px
            text-align: center
            font-weight: 500

    #screencast-panel
        margin-top: -5px
        display: flex
        height: -webkit-fill-available
        justify-content: space-around
        flex-direction: column
        align-items: center
        margin-left: -5px
        margin-right: -5px
        background: linear-gradient(180deg, rgba(49, 82, 120, 1) 11%, rgba(61, 99, 142, 1) 84%, rgba(22, 129, 167, 1) 97%)
        .video-container
            height: 500px
            width: 780px
            margin-left: auto
            margin-right: auto
            text-align: center
            h4
                font-size: 24px
                padding-top: 10px
                margin-right: 90px
                font-family: $landing-page-font
                color: white
            i.material-icons
                color: white !important
            .video-stop-button
                float: left
                margin-left: 10px
                padding-left: 0
                margin-top: 5px
                margin-bottom: 0px
                i.material-icons
                    text-align: left
                    color: white !important
            .iframe-placeholder
                position: relative
                height: 0
                padding-bottom: 75.0%
</style>

<style>
    @media only screen and (max-width: 1130px) {
        .how-it-works .how-it-works-panel .how-it-works-image img {
            max-width: 300px !important;
        }
    }

    @media only screen and (max-width: 1000px) {
        .welcome-panel.main img,
        .welcome-panel.main .image-shadow {
            display: none
        }

        .how-it-works-panel {
            padding: 0px;
        }
    }

    @media only screen and (max-width: 768px) {
        .welcome-panel.how-it-works {
            padding-left: 20px;
        }
    }

    @media only screen and (max-width: 600px) {
        #welcome-area .welcome-panel.main {
            flex-direction: column !important;
        }

        #welcome-area .welcome-panel.how-it-works {
            width: 100%;
        }

        .how-it-works-panel {
            align-items: center;
        }

        #welcome-area .welcome-panel.main .main-headline {
            padding-top: 15px;
            width: fit-content;
        }

        .welcome-panel.main img,
        .welcome-panel.main .image-shadow,
        .welcome-panel.how-it-works img,
        .welcome-panel.features img,
        .how-it-works-image,
        .features-image {
            display: none
        }

        .how-it-works-panel {
            padding: 20px;
        }
    }
</style>

<template>
    <div style="background-color: white">
        <div id="welcome-area" style="background-color:white; flex-grow: 1">
            <div class="welcome-panel main">
                <div class="main-headline">
                    <div style="padding-top:10px;padding-left:0px;padding-right:20px; width:100%">
                        <transition-group name="fadeDown">
                            <div v-if="showWelcomeLabel" style="animation-duration: 1s; " key="welcome-label"
                                 id="welcome-label">
                                <div style="text-align: center">
                                    Analyze Somatic Enrichment in Real-time
                                </div>
                            </div>
                        </transition-group>

                        <transition-group name="fadeDown" tag="div">
                            <div v-if="showWelcomeButton" key="welcome-button" class="buttons-group"
                                 style="text-align:center;animation-duration: 1s;">
                                <v-btn class="welcome-button" id="load-demo-data" @click="onLoadDemoData">
                                    <i class="material-icons">local_library</i>
                                    RUN WITH DEMO DATA
                                </v-btn>
<!--                                <v-btn class="welcome-button" @click="openMosaic">-->
<!--                                    <i class="material-icons">cloud_queue</i>-->
<!--                                    LAUNCH FROM MOSAIC-->
<!--                                </v-btn>-->
                                <v-btn class="welcome-button" @click="openFileSelection">
                                    <i class="material-icons">folder_open</i>
                                    UPLOAD CONFIGURATION
                                </v-btn>
                            </div>
                        </transition-group>
                    </div>
                </div>
                <!--<div class="welcome-panel how-it-works">-->
                <!--<br>-->
                <!--<div id="welcome-label-small" class="accent-label"-->
                <!--style="padding-top:10px;text-align:center"></div>-->
                <!--<div class="how-it-works-panel">-->
                <!--<div class="how-it-works-item">-->
                <!--<v-avatar size="28px" color="appHighlight">-->
                <!--<span class="white&#45;&#45;text headline">1</span>-->
                <!--</v-avatar>-->
                <!--<span class="how-it-works-title">SELECT cohort data from your machine, the cloud, or our project-hosting platform <i>Mosaic</i></span>-->
                <!--<div class="how-it-works-image">-->
                <!--&lt;!&ndash;<img src="../../../assets/images/file_menu_cohort.png" style="">&ndash;&gt;-->
                <!--</div>-->
                <!--</div>-->

                <!--<v-divider></v-divider>-->

                <!--<div class="how-it-works-item">-->
                <!--<v-avatar size="28px" color="appHighlight">-->
                <!--<span class="white&#45;&#45;text headline">2</span>-->
                <!--</v-avatar>-->
                <!--<span class="how-it-works-title">ENTER a gene of interest</span>-->
                <!--<div class="how-it-works-image">-->
                <!--&lt;!&ndash;<img src="../../../assets/images/gene_selection_cohort.png" style="width:230px">&ndash;&gt;-->
                <!--</div>-->
                <!--</div>-->
                <!--<v-divider></v-divider>-->


                <!--<div class="how-it-works-item">-->
                <!--<v-avatar size="28px" color="appHighlight">-->
                <!--<span class="white&#45;&#45;text headline">3</span>-->
                <!--</v-avatar>-->
                <!--<span class="how-it-works-title">IDENTIFY enriched genomic variants within the selected cohort</span>-->
                <!--<div class="how-it-works-image">-->
                <!--&lt;!&ndash;<img src="../../../assets/images/track_600_cohort.png" style="max-width:600px">&ndash;&gt;-->
                <!--</div>-->
                <!--</div>-->

                <!--<div class="how-it-works-item" style="margin-top: -95px">-->
                <!--<v-avatar size="28px" color="appHighlight">-->
                <!--<span class="white&#45;&#45;text headline">4</span>-->
                <!--</v-avatar>-->
                <!--<span class="how-it-works-title">HIGHLIGHT common variants in both the cohort and individual patient samples</span>-->
                <!--</div>-->
                <!--<v-divider></v-divider>-->
                <!--<v-divider></v-divider>-->


                <!--<div class="how-it-works-item">-->
                <!--<v-avatar size="28px" color="appHighlight">-->
                <!--<span class="white&#45;&#45;text headline">5</span>-->
                <!--</v-avatar>-->
                <!--<span class="how-it-works-title">CLICK on a variant to view the most up-to-date annotations from ClinVar, VEP, gnomAD</span>-->
                <!--<div class="how-it-works-image">-->
                <!--&lt;!&ndash;<img src="../../../assets/images/anno_details_cohort.png" style="width: 270px;">&ndash;&gt;-->
                <!--&lt;!&ndash;<img src="../../../assets/images/freq_cohort.png"&ndash;&gt;-->
                <!--&lt;!&ndash;style="max-width:350px; margin-left: 20px">&ndash;&gt;-->
                <!--</div>-->
                <!--</div>-->

                <!--<v-divider></v-divider>-->

                <!--<div class="how-it-works-item">-->
                <!--<v-avatar size="28px" color="appHighlight">-->
                <!--<span class="white&#45;&#45;text headline">6</span>-->
                <!--</v-avatar>-->
                <!--<span class="how-it-works-title">FILTER variants by enrichment, impact, and frequency</span>-->
                <!--</div>-->
                <!--<v-divider></v-divider>-->

                <!--<div class="welcome-panel resources">-->
                <!--<div id="welcome-label-small">-->
                <!--IOBIO. Powered by state-of-the-art bioinformatics tools.-->
                <!--</div>-->
                <!--<div class="resources-panel">-->
                <!--<v-avatar>-->
                <!--<span class="grey&#45;&#45;text">VEP</span>-->
                <!--</v-avatar>-->
                <!--<v-avatar color="teal">-->
                <!--<span class="grey&#45;&#45;text">Samtools</span>-->
                <!--</v-avatar>-->
                <!--<v-avatar color="teal">-->
                <!--<span class="grey&#45;&#45;text">Tabix</span>-->
                <!--</v-avatar>-->
                <!--<v-avatar color="teal">-->
                <!--<span class="grey&#45;&#45;text">vt</span>-->
                <!--</v-avatar>-->
                <!--<v-avatar color="teal">-->
                <!--<span class="grey&#45;&#45;text">GNomAD</span>-->
                <!--</v-avatar>-->
                <!--<v-avatar color="teal">-->
                <!--<span class="grey&#45;&#45;text">1000 Genomes</span>-->
                <!--</v-avatar>-->
                <!--<v-avatar color="teal">-->
                <!--<span class="grey&#45;&#45;text">Phenolyzer</span>-->
                <!--</v-avatar>-->
                <!--<v-avatar color="teal">-->
                <!--<span class="grey&#45;&#45;text">RefSeq</span>-->
                <!--</v-avatar>-->
                <!--<v-avatar color="teal">-->
                <!--<span class="grey&#45;&#45;text">Gencode</span>-->
                <!--</v-avatar>-->
                <!--<v-avatar color="teal">-->
                <!--<span class="grey&#45;&#45;text">HPO</span>-->
                <!--</v-avatar>-->
                <!--</div>-->
                <!--</div>-->
                <!--</div>-->
                <!--</div>-->
            </div>
            <div class="welcome-panel resources">
                <div id="welcome-label-small">
                    IOBIO. Powered by state-of-the-art bioinformatics tools.
                </div>
                <div class="resources-panel">
                    <v-avatar>
                        <span class="grey--text">VEP</span>
                    </v-avatar>
                    <v-avatar>
                        <span class="grey--text">Samtools</span>
                    </v-avatar>
                    <v-avatar>
                        <span class="grey--text">Tabix</span>
                    </v-avatar>
                    <v-avatar>
                        <span class="grey--text">vt</span>
                    </v-avatar>
                    <v-avatar>
                        <span class="grey--text">GNomAD</span>
                    </v-avatar>
                    <v-avatar>
                        <span class="grey--text">ClinVar</span>
                    </v-avatar>
                    <v-avatar>
                        <span class="grey--text">1000 Genomes</span>
                    </v-avatar>
                    <v-avatar>
                        <span class="grey--text">COSMIC</span>
                    </v-avatar>
                    <v-avatar>
                        <span class="grey--text">Phenolyzer</span>
                    </v-avatar>
                    <v-avatar>
                        <span class="grey--text">RefSeq</span>
                    </v-avatar>
                    <v-avatar>
                        <span class="grey--text">Gencode</span>
                    </v-avatar>
                    <v-avatar>
                        <span class="grey--text">HPO</span>
                    </v-avatar>
                    <v-avatar>
                        <span class="grey--text">cBioPortal</span>
                    </v-avatar>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
    export default {
        name: 'welcome',
        components: {},
        props: {
            isBasicMode: null,
            isEduMode: null,
            launchedFromClin: null
        },
        data() {
            return {
                appFeatures: [
                    {key: 1, display: 'Analyze in<br>real-time', icon: "feature-realtime"},
                    {key: 2, display: 'Annotate and segregate variants', icon: "feature-analysis"},
                    {key: 3, display: 'Visualize<br>data', icon: "feature-viz"},
                    {key: 4, display: 'Inspect<br>coverage', icon: "feature-coverage"},
                    {key: 5, display: 'Recall<br>variants', icon: "feature-on-demand"},
                ],
                showWelcomeLabel: false,
                showWelcomeFeature: false,
                showWelcomeButton: false,
                videoPlayer: null,
                videoStyle: "position:absolute;width:100%;height:100%;left:0",
                videoConfigs: {
                    'screencast-intro': {
                        src: "https://www.youtube.com/embed/1R3kuXh6seQ?autoplay=1&rel=0&ecver=2",
                        videoId: '1R3kuXh6seQ',
                        width: 670,
                        height: 420,
                        frameborder: "0",
                        allowfullscreen: ""
                    },
                    'screencast-coverage-analysis': {
                        src: "https://www.youtube.com/embed/dnq8HtthDgU?autoplay=1&rel=0&ecver=2",
                        videoId: 'dnq8HtthDgU',
                        width: 670,
                        height: 420,
                        frameborder: "0",
                        allowfullscreen: ""
                    },
                    'screencast-saving-analysis': {
                        src: "https://www.youtube.com/embed/6T8DkrJWd6w?autoplay=1&rel=0&ecver=2",
                        videoId: '6T8DkrJWd6w',
                        width: 670,
                        height: 420,
                        frameborder: "0",
                        allowfullscreen: ""
                    },
                    'screencast-multi-gene-analysis': {
                        src: "https://www.youtube.com/embed/EW2Sm4HEAPg?autoplay=1&rel=0&ecver=2",
                        videoId: 'EW2Sm4HEAPg',
                        width: 670,
                        height: 420,
                        frameborder: "0",
                        allowfullscreen: ""
                    }
                }
            }
        },
        mounted: function () {
            let self = this;
            let delay = 0;
            this.showWelcomeLabel = true;
            self.showWelcomeButton = true;
            if (!this.launchedFromClin && !this.isBasicMode && !this.isEduMode) {
                self.showWelcomeFeature = true;
            }
        },
        methods: {
            playVideo: function (videoName) {
                let self = this;
                var videoContainer = $('#' + videoName);
                var config = this.videoConfigs[videoName];
                var videoFrame = videoName + "-iframe-placeholder";
                // Hide the welcome panel and show the video panel
                $('#welcome-area').addClass('hide');
                $('#screencast-panel').removeClass('hide');
                $('.video-container').addClass('hide');
                $('#background-img-container').addClass('hide');
                $('#diagonal-background').addClass('hide');
                videoContainer.removeClass('hide');
                // Load the video if the iframe doesn't exist
                if (videoContainer.find("iframe").length == 0) {
                    self.videoPlayer = new YT.Player(videoFrame, {
                        height: config.height,
                        width: config.width,
                        videoId: config.videoId,
                        playerVars: {
                            start: 0,
                            ecver: 2,
                            autoplay: 1
                        },
                        events: {
                            'onReady': self.onPlayerReady,
                            'onStateChange': self.onPlayerStateChange
                        }
                    });
                } else {
                    self.videoPlayer.seekTo(0);
                    self.videoPlayer.playVideo();
                }
            },
            onPlayerReady: function (event) {
                let self = this;
                event.target.playVideo();
            },
            onPlayerStateChange: function () {
                let self = this;
                var eventData = JSON.parse(event.data);
                if (eventData && eventData.hasOwnProperty("info")) {
                    if (eventData.info == YT.PlayerState.ENDED) {
                        $('#welcome-area').removeClass('hide');
                        $('#screencast-panel').addClass('hide');
                    }
                }
            },
            stopVideo: function (videoName) {
                let self = this;
                self.videoPlayer.pauseVideo();
                $('#welcome-area').removeClass('hide');
                $('#screencast-panel').addClass('hide');
                $('#background-img-container').removeClass('hide');
                $('#diagonal-background').removeClass('hide');
            },
            onLoadDemoData: function () {
                this.$emit("load-demo-data");
            },
            openFileSelection: function () {
                let self = this;
                self.$emit('open-file-selection');
            },
            openMosaic: function () {
                window.open('https://viewer.sfari.org');
            }
        }
    }
</script>