let eventsByKey = {};

async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
  return response.json();
}

function renderHeaderStats(stats) {
  const container = document.getElementById('headerStats');
  if (!container) return;
  container.innerHTML = stats
    .map(
      (stat) => `
        <div class="stat">
          <span class="stat-value">${stat.value}</span>
          <span class="stat-label">${stat.label}</span>
        </div>`
    )
    .join('');
}

function renderCityGrid(cities) {
  const container = document.getElementById('cityGrid');
  if (!container) return;
  container.innerHTML = cities
    .map(
      (city) => `
        <div class="city-card">
          <span class="city-icon">${city.icon}</span>
          <div class="city-name">${city.name}</div>
          <div class="city-stat">${city.events}</div>
          <div class="city-label">${city.events === 1 ? 'evento activo' : 'eventos activos'}</div>
        </div>`
    )
    .join('');
}

function renderEventsGrid(events) {
  const container = document.getElementById('eventsGrid');
  if (!container) return;
  container.innerHTML = events
    .map(
      (event) => `
        <div class="event-item" data-event-key="${event.key}">
          <span class="event-tag">${event.city}</span>
          <div class="event-title">${event.title}</div>
          <div class="event-meta">
            <i class="ti ti-calendar"></i> ${event.date}
            <i class="ti ti-clock" style="margin-left: 1rem"></i> ${event.durationHours} horas
          </div>
          <div class="event-description">${event.description}</div>
          <button class="cta-small">
            <i class="ti ti-arrow-right"></i> Ver detalles
          </button>
        </div>`
    )
    .join('');

  container.querySelectorAll('.event-item').forEach((item) => {
    item.addEventListener('click', () => openModal(item.dataset.eventKey));
  });
}

function renderLocationStats(cities) {
  const container = document.getElementById('locationStats');
  if (!container) return;
  container.innerHTML = cities
    .map(
      (city) => `
        <div style="padding: 1rem; background: #f8f8f8; border-radius: 8px; border-left: 4px solid #ffd700;">
          <div class="mono" style="font-size: 1.25rem; font-weight: 700; color: #1a1a1a">
            ${city.name}
          </div>
          <div style="font-size: 0.9rem; color: #666; margin-top: 0.5rem">
            ${city.events} eventos | ${city.participants} participantes
          </div>
        </div>`
    )
    .join('');
}

function openModal(eventKey) {
  const event = eventsByKey[eventKey];
  const modal = document.getElementById('modal');
  if (!modal || !event) return;

  document.getElementById('modalTitle').textContent = event.title;
  document.getElementById('modalParticipants').textContent = event.participants;
  document.getElementById('modalDuration').textContent = `${event.durationHours}h`;
  document.getElementById('modalLevel').textContent = event.level;
  document.getElementById('modalDescription').textContent = event.fullDescription;
  modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.remove('active');
}

function scrollTo(id) {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

function renderCharts(cities, charts) {
  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: { font: { family: "'JetBrains Mono', monospace" } },
      },
    },
  };

  const citiesCtx = document.getElementById('citiesChart');
  if (citiesCtx && window.Chart) {
    new Chart(citiesCtx, {
      type: 'bar',
      data: {
        labels: cities.map((city) => city.name),
        datasets: [
          {
            label: 'Eventos',
            data: cities.map((city) => city.events),
            backgroundColor: '#FFD700',
            borderColor: '#1A1A1A',
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      options: {
        ...chartDefaults,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#1A1A1A',
              font: { family: "'JetBrains Mono', monospace" },
            },
            grid: { color: 'rgba(0,0,0,0.05)' },
          },
          x: {
            ticks: {
              color: '#1A1A1A',
              font: { family: "'Inter', sans-serif" },
            },
            grid: { display: false },
          },
        },
      },
    });
  }

  const growthCtx = document.getElementById('growthChart');
  if (growthCtx && window.Chart) {
    new Chart(growthCtx, {
      type: 'line',
      data: {
        labels: charts.growth.labels,
        datasets: [
          {
            label: 'Participantes',
            data: charts.growth.data,
            borderColor: '#FFD700',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#1A1A1A',
            pointBorderColor: '#FFD700',
            pointBorderWidth: 2,
            pointRadius: 5,
          },
        ],
      },
      options: {
        ...chartDefaults,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#1A1A1A', font: { family: "'JetBrains Mono', monospace" } },
            grid: { color: 'rgba(0,0,0,0.05)' },
          },
          x: {
            ticks: { color: '#1A1A1A', font: { family: "'Inter', sans-serif" } },
            grid: { display: false },
          },
        },
      },
    });
  }

  const topicsCtx = document.getElementById('topicsChart');
  if (topicsCtx && window.Chart) {
    new Chart(topicsCtx, {
      type: 'doughnut',
      data: {
        labels: charts.topics.labels,
        datasets: [
          {
            data: charts.topics.data,
            backgroundColor: charts.topics.colors,
            borderColor: '#1A1A1A',
            borderWidth: 2,
          },
        ],
      },
      options: {
        ...chartDefaults,
        plugins: {
          ...chartDefaults.plugins,
          legend: {
            position: 'bottom',
            labels: {
              font: { family: "'Inter', sans-serif" },
              color: '#1A1A1A',
              padding: 15,
            },
          },
        },
      },
    });
  }
}

function renderMap(cities) {
  if (!(window.L && document.getElementById('map'))) return;

  const map = L.map('map').setView([-34.6037, -58.3816], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    tileSize: 256,
  }).addTo(map);

  cities.forEach((city) => {
    const marker = L.circleMarker([city.lat, city.lng], {
      radius: 12 + city.events * 2,
      fillColor: '#FFD700',
      color: '#1A1A1A',
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0.8,
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #1A1A1A;">
        <strong>${city.name}</strong><br>
        📊 ${city.events} eventos<br>
        👥 ${city.participants} participantes
      </div>
    `);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
  }

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.lang-btn').forEach((b) => b.classList.remove('active'));
      this.classList.add('active');
      const lang = this.dataset.lang;
      console.log('Idioma seleccionado:', lang);
    });
  });

  const [stats, cities, events, charts] = await Promise.all([
    loadJSON('data/stats.json'),
    loadJSON('data/cities.json'),
    loadJSON('data/events.json'),
    loadJSON('data/charts.json'),
  ]);

  eventsByKey = Object.fromEntries(events.map((event) => [event.key, event]));

  renderHeaderStats(stats);
  renderCityGrid(cities);
  renderEventsGrid(events);
  renderLocationStats(cities);
  renderCharts(cities, charts);
  renderMap(cities);
});
