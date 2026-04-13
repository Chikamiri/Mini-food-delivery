<script setup>
// TODO: Import useAuth composable, router
defineOptions({
  name: 'AppNavbar',
})
</script>

<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/">Mini Food Delivery</router-link>
    </div>
    <div class="navbar-menu">
      <!-- TODO: Navigation links based on user role -->
    </div>
  </nav>
</template>

<style scoped>
</style>
