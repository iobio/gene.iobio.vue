<style lang="sass" >
@import ../../../assets/sass/variables


.impact-badge
  stroke: #a5a5a5
  stroke-width: 1px
  margin-top: 2px

.level-high
  fill: #ad494A

.level-likely-high
  fill:  #de6d37

.level-medium, .level-unknown-significance, .level-unknown
  fill: rgba(231, 186, 82, 1)

.level-low
  fill: rgba(156, 194, 49, 1)

.level-likely-low
  fill: rgba(181, 207, 107, 1)

.level-conflicting
  fill: rgb(111, 182, 180)

.level-other
  fill: rgb(189, 189, 189)

#user-flagged-symbol
  fill: $link-color !important

#system-flagged-symbol
  fill: #ad494A !important

</style>

<template>
  <div :style="containerStyle">

      <svg
       v-if="icon == 'impact' && (type == 'snp' || type == 'mnp')"
       :icon="icon"
       :type="type"
       :style="iconStyle"
       :class="getClassObject(['impact-badge'])">
        <g transform="translate(1,2)">
          <rect width="8" height="8"
          v-bind:class="clazz"
          style="pointer-events: none;"></rect>
        </g>
      </svg>

      <svg
       v-if="icon == 'impact' && type == 'del' "
       :icon="icon"
       :type="type"
       :style="iconStyle"
       :class="getClassObject(['impact-badge'])">
        <g transform="translate(5,6)">
          <path d="M0,-4.161791450287817L4.805622828269509,4.161791450287817 -4.805622828269509,4.161791450287817Z"
          v-bind:class="clazz">
          </path>
        </g>
      </svg>

      <svg
       v-if="icon == 'impact' && type == 'ins' "
       :style="iconStyle"
       :icon="icon"
       :type="type"
       :class="getClassObject(['impact-badge'])">
        <g transform="translate(5,6)">
          <path d="M0,3.5682482323055424A3.5682482323055424,3.5682482323055424 0 1,1 0,-3.5682482323055424A3.5682482323055424,3.5682482323055424 0 1,1 0,3.5682482323055424Z"
          v-bind:class="clazz">
          </path>
        </g>
      </svg>

      <svg
       v-if="icon == 'impact' && type == 'complex' "
       :style="iconStyle"
       :icon="icon"
       :type="type"
       :clazz="clazz"
       :class="getClassObject(['impact-badge'])">
        <g transform="translate(5,6)">
          <path d="M0,-5.885661912765424L3.398088489694245,0 0,5.885661912765424 -3.398088489694245,0Z"
          v-bind:class="clazz">
          </path>
        </g>
      </svg>


      <svg
       v-if="icon == 'zygosity' && type == 'hom' "
       :style="iconStyle"
       :icon="icon"
       :type="type"
       class="impact-badge">
        <g transform="translate(0,4)">
          <rect width="24" height="10" class="zyg_hom" style="pointer-events: none;">
          </rect>
          <text x="1" y="8" style="stroke: none !important;fill: white !important; font-weight: bold !important; font-size: 9px !important;">
          Hom
          </text>
        </g>
      </svg>

      <svg
       v-if="icon == 'zygosity' && type == 'het' "
       :style="iconStyle"
       :icon="icon"
       :type="type"
       class="impact-badge">
        <g transform="translate(0,4)">
          <rect width="24" height="10" class="zyg_het" style="pointer-events: none;">
          </rect>
          <text x="2" y="8" style="stroke: none !important;fill: white !important; font-weight: bold !important; font-size: 9px !important;">
          Het
          </text>
        </g>
      </svg>

      <svg v-if="icon == 'system-flagged'" id="system-flagged-symbol"  width="16" height="16" viewBox="0 0 24 24" :style="iconStyle">
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
      </svg>

      <svg v-if="icon == 'user-flagged'"  id="user-flagged-symbol"  width="16" height="16" viewBox="0 0 24 24"  :style="iconStyle" >
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
      </svg>


      <svg v-if="icon == 'circle-checkmark'"  id="circle-checkmark-symbol" width="16" height="25" viewBox="0 0 24 24" :style="iconStyle" >
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>

      <svg  v-if="icon == 'denovo' || icon == 'de novo'" id="denovo-symbol" viewBox="0 0 27 27" :style="iconStyle">
        <circle style="fill:#C1272D;stroke:#000000;stroke-miterlimit:10;" cx="8" cy="4" r="3.5"/>
        <g>
          <path style="fill:#717171;" d="M7.8,11.1c1-0.2,2.3-0.3,3.7-0.3c2.3,0,3.8,0.4,5,1.3c1.3,0.9,2.1,2.4,2.1,4.6c0,2.3-0.8,3.9-2,4.9
            c-1.3,1.1-3.2,1.6-5.6,1.6c-1.4,0-2.4-0.1-3.1-0.2L7.8,11.1L7.8,11.1z M10.6,21c0.2,0.1,0.6,0.1,1,0.1c2.5,0,4.1-1.4,4.1-4.2
            c0-2.5-1.5-3.9-3.8-3.9c-0.6,0-1,0.1-1.2,0.1V21H10.6z"/>
        </g>
        <line style="fill:none;stroke:#000000;stroke-width:3;stroke-miterlimit:10;" x1="17.6" y1="0.1" x2="17.6" y2="7.9"/>
        <line style="fill:none;stroke:#000000;stroke-width:3;stroke-miterlimit:10;" x1="13.7" y1="4" x2="21.5" y2="4"/>
      </svg>



      <svg  v-if="icon == 'recessive'" id="recessive-symbol" viewBox="0 0 27 27" :style="iconStyle" >
        <circle fill="#C1272D" stroke="#000000" stroke-miterlimit="10" cx="7.6" cy="4" r="3.5"/>
        <circle fill="#C1272D" stroke="#000000" stroke-miterlimit="10" cx="16.6" cy="4" r="3.5"/>
        <g>
          <path fill="#717171" d="M7.6,11.2c0.9-0.1,2.2-0.3,3.7-0.3c1.8,0,3.1,0.3,3.9,1c0.7,0.6,1.1,1.4,1.1,2.5c0,1.5-1.1,2.6-2.1,3v0.1
            c0.8,0.3,1.3,1.2,1.6,2.3c0.4,1.4,0.8,3,1,3.4h-2.8c-0.2-0.3-0.5-1.3-0.8-2.8c-0.3-1.5-0.8-1.9-2-1.9h-0.8v4.8H7.6V11.2z
             M10.3,16.4h1.1c1.4,0,2.2-0.7,2.2-1.7c0-1.1-0.8-1.7-2-1.7c-0.7,0-1,0.1-1.2,0.1V16.4z"/>
        </g>
      </svg>

      <svg v-if="icon == 'x-linked' || icon == 'xlinked' || icon == 'x linked'"  id="x-linked-symbol"  viewBox="0 0 27 27" :style="iconStyle">
        <circle style="fill:#C1272D;stroke:#000000;stroke-miterlimit:10;" cx="13" cy="4" r="3.5"/>
        <g>
          <path style="fill:#717171;" d="M15.8,21.8l-1.1-2.2c-0.5-0.8-0.7-1.5-1.1-2.2h0c-0.3,0.7-0.6,1.3-0.9,2.2l-1,2.2H8.5l3.5-6.1
          l-3.4-6h3.2l1.1,2.2c0.4,0.7,0.6,1.3,0.9,2h0c0.3-0.8,0.5-1.3,0.8-2l1-2.2h3.1l-3.4,5.9l3.6,6.2H15.8z"/>
        </g>
      </svg>

      <svg v-if="icon == 'compound-het' || icon == 'compound het' || icon == 'compoundHet'"  id="compound-het-symbol" viewBox="0 0 27 27" :style="iconStyle">
        <circle style="fill:#C1272D;stroke:#000000;stroke-miterlimit:10;" cx="8" cy="4" r="3.5"/>
        <circle style="fill:#DB7F05;stroke:#000000;stroke-miterlimit:10;" cx="17" cy="4" r="3.5"/>
        <g>
          <path style="fill:#717171;" d="M11,21.2c-0.5,0.2-1.5,0.5-2.9,0.5c-4,0-6-2.5-6-5.7c0-3.9,2.8-6.1,6.3-6.1c1.3,0,2.4,0.3,2.8,0.5
            l-0.5,2.1C10.1,12.2,9.4,12,8.5,12c-2.1,0-3.7,1.2-3.7,3.8c0,2.3,1.4,3.7,3.7,3.7c0.8,0,1.6-0.2,2.2-0.4L11,21.2z"/>
          <path style="fill:#717171;" d="M15.3,10v4.4h4.3V10h2.6v11.5h-2.6v-4.8h-4.3v4.8h-2.6V10H15.3z"/>
        </g>
      </svg>

      <svg  v-if="icon == 'autosomal-dominant' || icon == 'autosomal dominant' || icon == 'autosomalDominant'" id="autosomal-dominant-symbol" viewBox="0 0 27 27" :style="iconStyle" >
        <circle fill="#C1272D" stroke="#000000" stroke-miterlimit="10" cx="9.6" cy="4" r="3.5"/>
        <circle fill="#FFFFFF" stroke="#000000" stroke-miterlimit="10" cx="18.6" cy="4" r="3.5"/>
        <g>
          <g>
            <path fill="#717171" d="M3.2,21.5L7.7,10h1.8L14,21.5h-2.4l-1.1-2.9h-4l-1.1,2.9H3.2z M8.6,12.4L7,17h3.3L8.6,12.4z"/>
            <path fill="#717171" d="M14.7,21.5V10h4.2c0.9,0,1.8,0.2,2.5,0.5c0.7,0.3,1.3,0.7,1.8,1.2c0.5,0.5,0.8,1.1,1.1,1.8
              c0.2,0.7,0.4,1.4,0.4,2.2c0,0.9-0.1,1.7-0.4,2.4c-0.3,0.7-0.6,1.3-1.1,1.8c-0.5,0.5-1.1,0.9-1.8,1.2c-0.7,0.3-1.5,0.4-2.3,0.4
              H14.7z M22.3,15.7c0-0.6-0.1-1.1-0.2-1.5c-0.2-0.5-0.4-0.9-0.7-1.2c-0.3-0.3-0.7-0.6-1.1-0.8c-0.4-0.2-0.9-0.3-1.5-0.3h-1.9v7.6
              h1.9c0.6,0,1-0.1,1.5-0.3c0.4-0.2,0.8-0.5,1.1-0.8c0.3-0.3,0.5-0.7,0.7-1.2C22.2,16.8,22.3,16.3,22.3,15.7z"/>
          </g>
        </g>
      </svg>



      <svg v-if="icon == 'clinvar'" id="clinvar-symbol"
       :class="getClassObject()"
       :style="iconStyle" viewBox="0 0 16 16">
        <path d="M14 4h-3v-2c0-0.55-0.45-1-1-1h-4c-0.55 0-1 0.45-1 1v2h-3c-1.1 0-2 0.9-2 2v8c0 1.1 0.9 2 2 2h12c1.1 0 2-0.9 2-2v-8c0-1.1-0.9-2-2-2zM6 2h4v2h-4v-2zM12 11h-3v3h-2v-3h-3v-2h3v-3h2v3h3v2z"  />
      </svg>


      <svg v-if="icon == 'af'"  id="af-symbol"
        :class="getClassObject()"
        :style="iconStyle"
        viewBox="0 0 18 16">
        <path d="M12 12.041v-0.825c1.102-0.621 2-2.168 2-3.716 0-2.485 0-4.5-3-4.5s-3 2.015-3 4.5c0 1.548 0.898 3.095 2 3.716v0.825c-3.392 0.277-6 1.944-6 3.959h14c0-2.015-2.608-3.682-6-3.959z" >
        </path>
        <path d="M5.112 12.427c0.864-0.565 1.939-0.994 3.122-1.256-0.235-0.278-0.449-0.588-0.633-0.922-0.475-0.863-0.726-1.813-0.726-2.748 0-1.344 0-2.614 0.478-3.653 0.464-1.008 1.299-1.633 2.488-1.867-0.264-1.195-0.968-1.98-2.841-1.98-3 0-3 2.015-3 4.5 0 1.548 0.898 3.095 2 3.716v0.825c-3.392 0.277-6 1.944-6 3.959h4.359c0.227-0.202 0.478-0.393 0.753-0.573z" >
        </path>
      </svg>

      <svg v-if="icon == 'coverage'"
       :style="iconStyle" viewBox="0 0 24 24" class="gene-badge-coverage-problem" >
        <rect class="st0" width="24" height="24"/>
        <g id="Layer_1">
          <path fill="#FFFFFF" d="M16,18l2.3-2.3l-4.9-4.9l-4,4L2,7.4L3.4,6l6,6l4-4l6.3,6.3L22,12v6H16z"/>
        </g>
      </svg>



      <svg v-if="icon == 'sift'" id="sift-symbol" viewbox="0 0 12 12"
      :style="iconStyle" :level="level"
      :class="getClassObject()">
        <g>
          <rect class="background" x="0" width="12" height="12"/>
        </g>
        <g>
          <path class="foreground" d="M4,8.6c0.5,0.3,1.3,0.5,2.1,0.5c0.9,0,1.3-0.4,1.3-0.9C7.5,7.6,7,7.3,6,7C4.6,6.5,3.7,5.7,3.7,4.5
            c0-1.4,1.2-2.6,3.2-2.6c1,0,1.7,0.2,2.2,0.4L8.6,3.9C8.3,3.7,7.7,3.5,6.9,3.5S5.6,3.9,5.6,4.3c0,0.5,0.5,0.8,1.6,1.2
            C8.7,6,9.4,6.8,9.4,8c0,1.4-1.1,2.6-3.4,2.6c-1,0-1.9-0.3-2.4-0.5L4,8.6z" fill="#FFFFFF"/>
        </g>
      </svg>


      <svg v-if="icon == 'polyphen'" id="polyphen-symbol" viewbox="0 0 12 12"
        :style="iconStyle" :level="level"
        :class="getClassObject()">
        <g>
          <rect class="background" x="0" width="12" height="12"/>
        </g>
        <g>
          <path class="foreground" d="M3.9,2.2C4.5,2.1,5.3,2,6.5,2c1.2,0,2,0.2,2.6,0.7c0.5,0.4,0.9,1.1,0.9,2c0,0.8-0.3,1.5-0.8,2
    C8.6,7.3,7.6,7.6,6.5,7.6c-0.3,0-0.5,0-0.7,0v3H3.9V2.2z M5.8,6.1c0.2,0,0.4,0.1,0.6,0.1c1,0,1.7-0.5,1.7-1.4
    c0-0.8-0.5-1.2-1.5-1.2c-0.4,0-0.7,0-0.8,0.1V6.1z" fill="#FFFFFF"/>
        </g>

      </svg>





      <svg v-if="icon == 'search-dna'" :style="iconStyle" :fill="fill" viewBox="0 0 38 38">
        <g>
          <path d="M29.59,7.917l6.064,7.558c-0.844,0.065-1.75-0.048-2.654-0.496l-3.451-4.3C29.279,9.665,29.346,8.736,29.59,7.917z    M38.872,14.382l-7.494-9.339c-0.353,0.354-0.758,0.833-1.121,1.417l6.976,8.691C37.898,14.925,38.459,14.633,38.872,14.382z    M3.644,27.085l7.553,9.412c0.28-0.27,0.725-0.738,1.157-1.371l-7.186-8.955C4.572,26.453,4.05,26.785,3.644,27.085z    M13.524,31.482l-4.653-5.8c-0.788-0.192-1.552-0.159-2.263-0.006l6.484,8.082C13.369,33.078,13.548,32.312,13.524,31.482z    M15.342,25.721c-4.472-5.573,0.368-9.921,1.383-10.735c1.853-1.486,6.604-4.388,10.727,0.75c0.854,1.063,1.344,2.099,1.577,3.082   c0.718-0.144,1.457-0.22,2.218-0.225c-0.045-0.226-0.093-0.451-0.158-0.68c4.274,1.88,9.341-0.467,11.875-2.407l-1.348-1.766   c-0.312,0.236-7.642,5.714-12.005,0.276c-4.377-5.453,2.462-11.578,2.755-11.837L30.9,0.509c-2.389,2.091-5.688,6.574-4.791,11.159   c-3.731-2.11-7.808-0.797-10.775,1.585c-2.171,1.742-4.747,5.28-3.896,9.46C7.26,21.169,2.449,23.429,0,25.303l1.349,1.767   c0.31-0.236,7.641-5.713,12.004-0.275c4.377,5.455-2.461,11.579-2.755,11.836l1.464,1.67c2.263-1.979,5.349-6.102,4.912-10.424   c0.923,0.449,1.859,0.689,2.781,0.783c-0.007-0.158-0.024-0.316-0.024-0.479c0-0.588,0.058-1.16,0.143-1.727   C18.376,28.273,16.789,27.525,15.342,25.721z M31.154,40.486c-5.672,0-10.285-4.615-10.285-10.287s4.613-10.286,10.285-10.286   c5.673,0,10.287,4.614,10.287,10.286S36.827,40.486,31.154,40.486z M38.859,30.199c0-4.248-3.457-7.704-7.705-7.704   c-4.247,0-7.703,3.456-7.703,7.704s3.456,7.703,7.703,7.703C35.402,37.902,38.857,34.447,38.859,30.199z M40.357,37.574   l-2.274,2.273l7.901,7.903l2.275-2.275L40.357,37.574z M29.622,34.768h2.603v-2.475h-2.603V34.768z M33.709,26.499   c-0.258-0.255-0.596-0.464-1.014-0.625c-0.416-0.163-0.928-0.243-1.537-0.243c-0.617,0-1.141,0.094-1.568,0.279   c-0.43,0.188-0.781,0.432-1.057,0.731s-0.479,0.64-0.613,1.019c-0.133,0.38-0.211,0.766-0.236,1.158h2.613   c-0.025-0.275,0.023-0.521,0.148-0.738s0.34-0.324,0.639-0.324c0.482,0,0.727,0.213,0.727,0.637c0,0.143-0.043,0.264-0.125,0.363   c-0.084,0.102-0.188,0.188-0.307,0.256c-0.121,0.071-0.248,0.137-0.381,0.193c-0.133,0.059-0.25,0.113-0.352,0.162   c-0.242,0.135-0.424,0.301-0.549,0.5c-0.125,0.201-0.214,0.404-0.265,0.612c-0.049,0.208-0.074,0.412-0.074,0.611   c0,0.192,0.005,0.351,0.013,0.478h2.313c0-0.144,0.011-0.269,0.031-0.375c0.021-0.107,0.057-0.205,0.104-0.287   c0.051-0.084,0.121-0.164,0.213-0.238c0.09-0.074,0.207-0.15,0.351-0.225c0.207-0.109,0.411-0.216,0.612-0.319   c0.199-0.104,0.381-0.235,0.543-0.395c0.162-0.157,0.295-0.355,0.396-0.594c0.101-0.237,0.149-0.547,0.149-0.933   c-0.018-0.274-0.086-0.563-0.207-0.868C34.159,27.031,33.969,26.753,33.709,26.499z M15.095,22.252l3.45,4.299   c0.55,0.272,1.098,0.41,1.634,0.47c0.085-0.3,0.184-0.593,0.292-0.882l-5.335-6.649C14.891,20.307,14.825,21.237,15.095,22.252z    M15.803,18.031l5.323,6.634c0.295-0.545,0.642-1.057,1.018-1.544l-5.221-6.507C16.572,16.967,16.164,17.447,15.803,18.031z    M24.295,20.977L19.4,14.876c-0.597,0.282-1.119,0.613-1.525,0.914l5.102,6.358C23.385,21.724,23.827,21.335,24.295,20.977z    M27.116,19.389l-4.013-5c-0.788-0.194-1.552-0.161-2.262-0.007l4.647,5.793C26.008,19.874,26.549,19.609,27.116,19.389z" :fill="fill" >
         </path>

        </g>
      </svg>
      <svg v-if="icon == 'arrow'"  id="arrow-symbol" :style="iconStyle" viewBox="0 0 80.4 10">
        <g>
          <line fill="#FFFFFF" x1="79.4" y1="5" x2="1.3" y2="5"/>
          <g>
            <line fill="none" stroke="#D1D3D4" stroke-width="4" stroke-miterlimit="10" x1="79.4" y1="5" x2="5.7" y2="5"/>
            <g>
              <polygon fill="#D1D3D4" points="6.4,10.1 6.4,-0.1 1.3,5       "/>
            </g>
          </g>
        </g>
      </svg>


      <svg v-if="icon == 'checkmark'"  id="checkmark-symbol" :style="iconStyle" viewBox="0 0 512 512">
        <polygon id="check-mark-icon" points="398.218,92.985 199.729,291.475 113.754,205.476 50,269.242 199.733,419.015 462,156.726 "/>
      </svg>

      <svg v-if="icon == 'question-mark'"  id="question-mark-symbol" :style="iconStyle" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
      </svg>

      <svg v-if="icon == 'thumbs-up'"  id="thumbs-up-symbol" :style="iconStyle" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/>
      </svg>

      <svg v-if="icon == 'thumbs-down'"  id="thumbs-down-symbol" :style="iconStyle" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
      </svg>

      <svg v-if="icon == 'thumbs-up-down'"  id="thumbs-up-down-symbol" :style="iconStyle" viewBox="0 0 24 24">
        <path d="M12 6c0-.55-.45-1-1-1H5.82l.66-3.18.02-.23c0-.31-.13-.59-.33-.8L5.38 0 .44 4.94C.17 5.21 0 5.59 0 6v6.5c0 .83.67 1.5 1.5 1.5h6.75c.62 0 1.15-.38 1.38-.91l2.26-5.29c.07-.17.11-.36.11-.55V6zm10.5 4h-6.75c-.62 0-1.15.38-1.38.91l-2.26 5.29c-.07.17-.11.36-.11.55V18c0 .55.45 1 1 1h5.18l-.66 3.18-.02.24c0 .31.13.59.33.8l.79.78 4.94-4.94c.27-.27.44-.65.44-1.06v-6.5c0-.83-.67-1.5-1.5-1.5z"/>
        <path d="M0 0h24v24H0z" fill="none"/>
      </svg>

      <svg v-if="icon == 'report-problem'"  id="report-problem-symbol" :style="iconStyle" viewBox="0 0 24 24">
        <path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"/>
        <path d="M0 0h24v24H0z" fill="none"/>
      </svg>




      <svg v-if="icon == 'star'"  id="star-symbol" :style="iconStyle" viewBox="0 0 50 50">
        <polygon points="25,3.553 30.695,18.321 46.5,19.173   34.214,29.152 38.287,44.447 25,35.848 11.712,44.447 15.786,29.152 3.5,19.173 19.305,18.321 "  stroke-miterlimit="10" stroke-width="2"/>
      </svg>

      <svg v-if="icon == 'phenotype'"  id="phenotype-symbol" :style="iconStyle" viewBox="0 0 24 24">
        <path d="M12 12.25c1.24 0 2.25-1.01 2.25-2.25S13.24 7.75 12 7.75 9.75 8.76 9.75 10s1.01 2.25 2.25 2.25zm4.5 4c0-1.5-3-2.25-4.5-2.25s-4.5.75-4.5 2.25V17h9v-.75zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
      </svg>

      <svg v-if="icon == 'somatic'"  id="somatic-symbol" :style="iconStyle" viewBox="0 0 502.664 502.664" >
        <g>
          <path  d="M235.704,0c0,16.976,0,59.988,0,77.008c10.98,0,20.255,0,31.234,0c0-17.019,0-60.031,0-77.008
            C255.959,0,246.662,0,235.704,0z M89.476,73.449c12.036,12.036,42.494,42.494,54.509,54.488
            c7.765-7.744,14.345-14.345,22.132-22.045c-12.036-12.058-42.494-42.516-54.531-54.553
            C103.842,59.104,97.241,65.705,89.476,73.449z M336.569,105.869c7.744,7.701,14.345,14.301,22.11,22.045
            c12.036-12.058,42.451-42.473,54.488-54.488c-7.744-7.722-14.366-14.28-22.11-22.088
            C379.042,63.375,348.605,93.833,336.569,105.869z M387.519,197.524c0,11.023,0,20.298,0,31.299c16.998,0,60.053,0,77.051,0
            c0-11.001,0-20.277,0-31.299C447.572,197.524,404.517,197.524,387.519,197.524z M38.116,197.524
            c0,11.023-0.022,20.298-0.022,31.256c16.998,0.022,60.075,0.022,77.072,0.065c0-11.001,0-20.277,0-31.299
            C98.169,197.524,55.092,197.524,38.116,197.524z"/>
          <path  d="M320.11,324.748H182.618c-24.548,0-44.695,22.585-44.695,50.195v127.721h226.903V374.943
            C364.805,347.333,344.701,324.748,320.11,324.748z"/>
          <path  d="M251.278,302.595c43.055,0,77.763-34.729,77.763-77.612c0-42.926-34.707-77.676-77.763-77.676
            c-42.818,0-77.525,34.707-77.525,77.676C173.774,267.844,208.438,302.595,251.278,302.595z"/>
        </g>

       </svg>


      <svg v-if="icon == 'family'"  id="family-symbol" :style="iconStyle"  viewBox="0 0 98.666 98.666">
      <g>
        <g>
          <circle cx="49.332" cy="53.557" r="10.297"/>
          <path d="M53.7,64.556h-8.737c-7.269,0-13.183,5.916-13.183,13.184v10.688l0.027,0.166l0.735,0.229
            c6.937,2.168,12.965,2.892,17.927,2.892c9.688,0,15.303-2.764,15.65-2.938l0.688-0.351l0.071,0.002V77.739
            C66.883,70.472,60.971,64.556,53.7,64.556z"/>
          <circle cx="28.312" cy="23.563" r="16.611"/>
          <path d="M70.35,40.174c9.174,0,16.609-7.44,16.609-16.613c0-9.17-7.438-16.609-16.609-16.609c-9.176,0-16.61,7.437-16.61,16.609
            S61.174,40.174,70.35,40.174z"/>
          <path d="M41.258,62.936c-2.637-2.274-4.314-5.632-4.314-9.378c0-4.594,2.519-8.604,6.243-10.743
            c-2.425-0.965-5.061-1.511-7.826-1.511H21.266C9.54,41.303,0,50.847,0,62.571v17.241l0.043,0.269L1.23,80.45
            c10.982,3.432,20.542,4.613,28.458,4.656v-7.367C29.688,70.595,34.623,64.599,41.258,62.936z"/>
          <path d="M77.398,41.303H63.305c-2.765,0-5.398,0.546-7.824,1.511c3.727,2.139,6.246,6.147,6.246,10.743
            c0,3.744-1.678,7.102-4.313,9.376c2.656,0.661,5.101,2.02,7.088,4.008c2.888,2.89,4.479,6.726,4.478,10.8v7.365
            c7.916-0.043,17.477-1.225,28.457-4.656l1.187-0.369l0.044-0.269V62.571C98.664,50.847,89.124,41.303,77.398,41.303z"/>
        </g>
      </g>
      </svg>

      <svg v-if="icon == 'long-arrow-down'"  id="long-arrow-down-symbol" :style="iconStyle" viewBox="0 0 493.356 493.355">
        <g>
           <path d="M355.457,370.873c-1.523-3.614-4.288-5.428-8.285-5.428h-63.954V9.135c0-2.666-0.858-4.856-2.569-6.567  C278.944, .855,276.753,0,274.084,0h-54.818c-2.667,0-4.854,0.855-6.567,2.568c-1.711,1.711-2.57,3.901-2.57,6.567v356.314h-63.953 c-3.806,0-6.567,1.81-8.28,5.428c-1.521,3.613-1.043,6.943,1.431,9.996L240.68,490.505c1.903,1.902,4.187,2.851,6.854,2.851 c2.478,0,4.665-0.948,6.567-2.851l99.927-109.632C356.503,377.82,356.983,374.49,355.457,370.873z"/>
        </g>
      </svg>


      <svg v-if="icon == 'arrow-down'" id="arrow-down-symbol"  :style="iconStyle" :fill="fill"
      viewBox="0 0 24 24">
        <path d="M7 10l5 5 5-5z" />
      </svg>

      <svg v-if="icon == 'arrow-up'" id="arrow-up-symbol" :style="iconStyle" :fill="fill" viewBox="0 0 24 24">
        <path d="M7 14l5-5 5 5z"  />
      </svg>

      <svg v-if="icon == 'error'"   id="error-symbol" :style="iconStyle" :fill="fill" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>

      <svg v-if="icon == 'error-outline'" id="error-outline-symbol" :style="iconStyle" :fill="fill" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0V0z" fill="none"/>
          <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
      </svg>


      <svg v-if="icon == 'warning'" id="warning-symbol" :style="iconStyle" :fill="fill" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
      </svg>


      <v-icon v-if="icon == 'somatic-variant'" class="somatic-variant">
        check_circle
      </v-icon>

      <v-icon v-if="icon == 'undetermined'" style="font-size: 15px; vertical-align: top">
          help
      </v-icon>

  </div>

</template>

<script>
export default {
  name: 'app-icon',
  components: {
  },
  props: {
    icon: null,
    type: null,
    clazz: null,
    width: null,
    height: null,
    fill: null,
    level: null,
    significance: null
  },
  data () {
    return {
      clinvarLevels: {
        clinvar_path: 'high',
        clinvar_lpath: 'likely-high',
        clinvar_uc: "unknown",
        clinvar_benign: "low",
        clinvar_lbenign: "likely-low",
        clinvar_other: "other",
        clinvar_cd: "conflicting"
      }
    }
  },
  methods: {
    getClassObject: function(clazzes) {
      let theLevel = this.level
      if (this.icon == 'clinvar' && this.significance) {
        theLevel = this.clinvarLevels[this.significance];
      }
      var levelClass = theLevel ? 'level-' + theLevel : null;

      if (levelClass) {
        if (clazzes == null) {
          clazzes = [];
        }
        clazzes.push(levelClass);
      }

      return clazzes;

    },
    getContainerStyle: function() {
      let self = this;
      return {
        display: 'inline-block',
        width: self.width,
        height: self.height
      }

    },
  },
  computed: {


    iconStyle: function() {
      return 'width:' + this.width + 'px;height:' + this.height + 'px';
    },
    containerStyle: function() {
      return 'display: inline-block;vertical-align: top; width:' + this.width + 'px;height:' + this.height + 'px';
    }

  }
}
</script>

