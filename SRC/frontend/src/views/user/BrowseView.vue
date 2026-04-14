<script setup>
const categories = ['Tất cả', 'Cơm', 'Bún/Phở', 'Trà sữa', 'Đồ ăn nhanh', 'Healthy']
</script>

<template>
  <section class="browse-view">
    <header class="browse-header">
      <h1>Khám phá món ăn</h1>
      <p>Tìm món yêu thích theo danh mục, nhà hàng hoặc từ khóa.</p>
    </header>

    <div class="search-box">
      <input type="text" placeholder="Tìm món ăn, nhà hàng..." />
      <button>Tìm kiếm</button>
    </div>

    <div class="category-row">
      <button v-for="item in categories" :key="item" class="category-btn">
        {{ item }}
      </button>
    </div>

    <div class="result-placeholder">
      <p>Khu vực hiển thị danh sách món/nhà hàng sau khi bạn kết nối dữ liệu.</p>
    </div>
  </section>
</template>

<style scoped>
.browse-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.browse-header h1 {
  margin: 0;
  color: #10131a;
}

.browse-header p {
  margin: 0.4rem 0 0;
  color: #646a76;
}

.search-box {
  margin-top: 1.2rem;
  display: flex;
  gap: 0.7rem;
}

.search-box input {
  flex: 1;
  border: 1px solid #dddfe5;
  border-radius: 10px;
  padding: 0.75rem 0.9rem;
}

.search-box button {
  border: 0;
  border-radius: 10px;
  background: #f8143f;
  color: #fff;
  font-weight: 600;
  padding: 0.75rem 1.2rem;
}

.category-row {
  margin-top: 1rem;
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.category-btn {
  border: 1px solid #eceef3;
  border-radius: 999px;
  background: #fff;
  color: #3d4350;
  padding: 0.45rem 0.9rem;
}

.result-placeholder {
  margin-top: 1.5rem;
  min-height: 260px;
  border: 1px dashed #d7dae2;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: #777e8d;
  background: #fafbfe;
}
</style>
