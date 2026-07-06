<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1 class="code">404</h1>
      <h2>Page not found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <RouterLink to="/dashboard" class="back-link">← Back to Dashboard</RouterLink>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f6fa;
  text-align: center;
  padding: 24px;
}

.code {
  font-size: 72px;
  font-weight: 700;
  color: #2563eb;
  margin: 0;
}

h2 {
  margin: 8px 0;
  color: #1f2937;
}

p {
  color: #6b7280;
  margin-bottom: 24px;
}

.back-link {
  display: inline-block;
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
}

.back-link:hover {
  background: #1d4ed8;
}
</style>