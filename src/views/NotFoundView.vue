<template>
  <div class="flex min-h-screen items-center justify-center bg-[#f5f6fa] p-6 text-center">
    <div>
      <h1 class="m-0 text-7xl font-bold text-blue-600">404</h1>
      <h2 class="my-2 text-gray-800">Page not found</h2>
      <p class="mb-6 text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
      <RouterLink
        to="/dashboard"
        class="inline-block rounded-md bg-blue-600 px-5 py-2.5 text-sm text-white no-underline hover:bg-blue-700"
      >← Back to Dashboard</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
