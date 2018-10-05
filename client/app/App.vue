<style lang="sass">
@import "../assets/sass/site.sass"

.container
  margin-top: 0px
  margin-bottom: 10px
  margin-right: 0px
  margin-left: 0px
  width: 100%
  padding: 0px 5px 0px 5px

button
  color: $text-color

.theme--light
  .content--wrap
    .btn
      color: $text-color
      padding-top: 2px
      padding-bottom: 2px
      height: 30px

.chip
  background-color:  $default-badge-color
  .chip__content
    color: white
    background-color:  $default-badge-color
    font-size: 12px
    height: 20px

.progress-linear__background.primary
  background-color: $app-gray !important
.progress-linear__bar__indeterminate--active
  .progress-linear__bar__indeterminate
    background-color: $amber-darken-1 !important


.toolbar
  .input-group__details
    .progress-linear__background
      background-color: $app-gray !important
    .progress-linear__bar__indeterminate--active
      .progress-linear__bar__indeterminate
        background-color: $amber-darken-1 !important

.snack
  top: 0px

.snack__wrapper
  background-color: rgba(50,50,50,.75) !important

.snack__content
  padding-right: 2px


.attention
  display: inline-block
  outline-color: $amber-darken-1
  outline-width: 3px
  outline-style: solid
  outline-offset: 0px

.dropdown-menu > .active > a, .dropdown-menu > .active > a:hover, .dropdown-menu > .active > a:focus
  background-color: $active-menu-background-color
  color: $app-color

.dropdown-menu > li > a:hover, .dropdown-menu > li >a:focus
  background-color:  $hover-menu-background-color !important

</style>

<template>

  <div id="app">

    <v-app light>
      <router-view></router-view>
    </v-app>


  </div>
</template>

<script>



export default {
  name: 'app',
  data() {
    return {
    }
  }
}
</script>


