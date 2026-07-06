<template>
  <div class="dashboard-view">
    <h1>Welcome</h1>

    <div class="cards">
      <div class="card">
        <p class="card-label">Total Students</p>
        <p class="card-value">100</p>
      </div>
      <div class="card">
        <p class="card-label">Pending Requests</p>
        <p class="card-value">20</p>
      </div>
      <div class="card">
        <p class="card-label">Approved Requests</p>
        <p class="card-value">25</p>
      </div>
      <div class="card">
        <p class="card-label">Rejected Requests</p>
        <p class="card-value">5</p>
      </div>
    </div>

    <div class="recent-activity">
      <h2>Recent Activity</h2>
      <p class="placeholder-text">No activity yet (placeholder).</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Real data comes from dashboard API in Sprint 4
</script>

<style scoped>
.dashboard-view h1 {
  margin-bottom: 20px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.card-label {
  font-size: 13px;
  color: #5c687e;
  margin-bottom: 8px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
}

.recent-activity {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.placeholder-text {
  color: #9ca3af;
}

@media (max-width: 1024px) and (min-width: 769px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .cards {
    grid-template-columns: 1fr;
  }
  .card {
    padding: 16px;
  }
  .card-value {
    font-size: 22px;
  }
}
</style>