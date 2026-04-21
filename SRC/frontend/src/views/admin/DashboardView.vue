<script setup>
const sidebarItems = [
  'Tổng quan',
  'Duyệt nhà hàng',
  'Người dùng',
  'Đơn hàng',
  'Doanh thu',
  'Khiếu nại',
  'Khuyến mãi',
  'Cài đặt',
]

const kpiCards = [
  { title: 'Đơn hôm nay', value: '1,284', change: '+12.4%', icon: '🧾' },
  { title: 'Nhà hàng hoạt động', value: '342', change: '+4.1%', icon: '🏬' },
  { title: 'Shipper trực tuyến', value: '216', change: '-2.3%', icon: '🛵' },
  { title: 'Doanh thu ngày', value: '₫248M', change: '+18.7%', icon: '💰' },
]

const approvalQueue = [
  { name: 'Bún Bò Hẻm Nhỏ', owner: 'Nguyễn Văn B', city: 'TP.HCM', status: 'Chờ duyệt' },
  { name: 'Mì Cay Seoul', owner: 'Lê Thu C', city: 'Hà Nội', status: 'Cần bổ sung' },
  { name: 'Cơm Tấm 1998', owner: 'Trần Minh D', city: 'Đà Nẵng', status: 'Chờ duyệt' },
]

const recentFeedback = [
  { user: 'Trần Ngọc A', issue: 'Đơn giao trễ 45 phút', level: 'Cao' },
  { user: 'Phạm Gia B', issue: 'Món nhận sai topping', level: 'Trung bình' },
  { user: 'Võ Anh C', issue: 'Không áp được mã giảm giá', level: 'Thấp' },
]
</script>

<template>
  <section class="admin-page">
    <aside class="admin-sidebar">
      <div class="brand">
        <h1>MiniFood</h1>
        <p>Bảng điều khiển quản trị</p>
      </div>

      <nav class="menu">
        <a
          v-for="(item, index) in sidebarItems"
          :key="item"
          href="#"
          :class="{ active: index === 0 }"
        >
          {{ item }}
        </a>
      </nav>

      <div class="sidebar-note">
        <p>Khuyến nghị</p>
        <strong>7 nhà hàng đang chờ duyệt hồ sơ mới.</strong>
      </div>
    </aside>

    <main class="admin-main">
      <header class="topbar">
        <div>
          <h2>Dashboard</h2>
          <p>Theo dõi vận hành hệ thống giao đồ ăn theo thời gian thực.</p>
        </div>
        <div class="topbar-right">
          <input type="text" placeholder="Tìm nhà hàng, đơn hàng, người dùng..." />
          <button type="button">Xuất báo cáo</button>
        </div>
      </header>

      <section class="kpi-grid">
        <article v-for="card in kpiCards" :key="card.title" class="kpi-card">
          <span class="kpi-icon">{{ card.icon }}</span>
          <div>
            <p>{{ card.title }}</p>
            <h3>{{ card.value }}</h3>
            <small>{{ card.change }} so với hôm qua</small>
          </div>
        </article>
      </section>

      <section class="chart-row">
        <article class="panel">
          <div class="panel-head">
            <h3>Tỉ lệ đơn theo trạng thái</h3>
            <span>Hôm nay</span>
          </div>
          <div class="donut-wrap">
            <div class="donut">68%</div>
            <ul>
              <li><span class="dot success"></span> Hoàn thành: 68%</li>
              <li><span class="dot warn"></span> Đang xử lý: 21%</li>
              <li><span class="dot danger"></span> Hủy: 11%</li>
            </ul>
          </div>
        </article>

        <article class="panel">
          <div class="panel-head">
            <h3>Doanh thu 7 ngày</h3>
            <span>Tuần này</span>
          </div>
          <div class="fake-line-chart"></div>
        </article>
      </section>

      <section class="bottom-grid">
        <article class="panel">
          <div class="panel-head">
            <h3>Hàng đợi duyệt nhà hàng</h3>
            <a href="#">Xem tất cả</a>
          </div>
          <div class="table">
            <div v-for="item in approvalQueue" :key="item.name" class="row">
              <div>
                <strong>{{ item.name }}</strong>
                <p>{{ item.owner }} • {{ item.city }}</p>
              </div>
              <span class="status">{{ item.status }}</span>
            </div>
          </div>
        </article>

        <article class="panel">
          <div class="panel-head">
            <h3>Phản hồi gần đây</h3>
            <a href="#">Chi tiết</a>
          </div>
          <div class="feedback-list">
            <div v-for="fb in recentFeedback" :key="fb.user + fb.issue" class="feedback-item">
              <strong>{{ fb.user }}</strong>
              <p>{{ fb.issue }}</p>
              <small>Mức độ: {{ fb.level }}</small>
            </div>
          </div>
        </article>
      </section>
    </main>
  </section>
</template>

<style scoped src="@/assets/styles/admin-dashboard.css"></style>
