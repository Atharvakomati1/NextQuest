const colors = [
  '#6c63ff', '#ff6584', '#3f3d56', '#4ade80', '#facc15', '#a855f7', '#ec4899', '#0ea5e9'
];

document.addEventListener('DOMContentLoaded', () => {
  fetchGames();
  setupColorPicker();
  setupEventListeners();
  fetchStats();
});

function setupEventListeners() {
  document.getElementById('addGameBtn').addEventListener('click', openAddModal);
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
  document.getElementById('gameForm').addEventListener('submit', handleFormSubmit);
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      fetchGames(e.target.dataset.status);
    });
  });

  document.getElementById('searchInput').addEventListener('input', (e) => {
    filterBySearch(e.target.value);
  });
}

function setupColorPicker() {
  const container = document.getElementById('colorPicker');
  const input = document.getElementById('color_tag');
  
  container.innerHTML = '';
  colors.forEach(color => {
    const div = document.createElement('div');
    div.className = 'color-option';
    div.style.backgroundColor = color;
    if (input.value === color) div.classList.add('selected');
    
    div.addEventListener('click', () => {
      document.querySelectorAll('.color-option').forEach(c => c.classList.remove('selected'));
      div.classList.add('selected');
      input.value = color;
    });
    container.appendChild(div);
  });
  
  if (!input.value) {
    input.value = colors[0];
    container.firstChild.classList.add('selected');
  }
}

async function fetchGames(status = '') {
  try {
    const url = status ? `/api/games?status=${status}` : '/api/games';
    const response = await fetch(url);
    const games = await response.json();
    renderGames(games);
    
    // Store in window for search filtering
    window.currentGames = games;
  } catch (error) {
    console.error('Error fetching games:', error);
  }
}

function filterBySearch(query) {
  if (!window.currentGames) return;
  query = query.toLowerCase();
  const filtered = window.currentGames.filter(g => 
    g.title.toLowerCase().includes(query) || 
    (g.genre && g.genre.toLowerCase().includes(query)) ||
    (g.platform && g.platform.toLowerCase().includes(query))
  );
  renderGames(filtered, true);
}

function renderGames(games, isSearch = false) {
  const grid = document.getElementById('gameGrid');
  const emptyState = document.getElementById('emptyState');
  
  grid.innerHTML = '';
  
  if (games.length === 0) {
    emptyState.style.display = 'block';
    if (isSearch) {
      emptyState.querySelector('h3').textContent = 'No matching games found';
    } else {
      emptyState.querySelector('h3').textContent = 'No games found';
    }
    return;
  }
  
  emptyState.style.display = 'none';
  
  games.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    
    const nextStatusText = game.status === 'backlog' ? 'Start Playing' : (game.status === 'playing' ? 'Finish Game' : 'Replay');
    const nextStatus = game.status === 'backlog' ? 'playing' : (game.status === 'playing' ? 'completed' : 'playing');

    card.innerHTML = `
      <div class="color-strip" style="background-color: ${game.color_tag}"></div>
      <div class="game-header">
        <div>
          <h3 class="game-title">${game.title}</h3>
          <div class="game-meta">${game.platform || 'Unknown Platform'} · ${game.genre || 'Unknown Genre'}</div>
        </div>
        ${game.notes ? `
        <div class="notes-icon-wrapper">
          <span class="notes-icon">💬</span>
          <div class="notes-tooltip">${game.notes}</div>
        </div>
        ` : ''}
      </div>
      <div>
        <span class="status-badge status-${game.status}">${game.status}</span>
      </div>
      <div class="game-actions">
        <button class="btn" onclick="updateStatus(${game.id}, '${nextStatus}')">▶ ${nextStatusText}</button>
        <button class="btn icon-btn" onclick='openEditModal(${JSON.stringify(game).replace(/'/g, "&#39;")})'>✏️</button>
        <button class="btn icon-btn" onclick="deleteGame(${game.id}, '${game.title.replace(/'/g, "\\'")}')">🗑️</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    const stats = await res.json();
    
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-backlog').textContent = stats.backlog;
    document.getElementById('stat-playing').textContent = stats.playing;
    document.getElementById('stat-completed').textContent = stats.completed;
    document.getElementById('stat-platform').textContent = stats.topPlatform;
    
    document.getElementById('count-all').textContent = stats.total;
    document.getElementById('count-backlog').textContent = stats.backlog;
    document.getElementById('count-playing').textContent = stats.playing;
    document.getElementById('count-completed').textContent = stats.completed;
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}

function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Add New Game';
  document.getElementById('gameForm').reset();
  document.getElementById('gameId').value = '';
  document.getElementById('color_tag').value = colors[0];
  setupColorPicker();
  document.getElementById('gameModal').showModal();
}

function openEditModal(game) {
  document.getElementById('modalTitle').textContent = 'Edit Game';
  document.getElementById('gameId').value = game.id;
  document.getElementById('title').value = game.title;
  document.getElementById('platform').value = game.platform || '';
  document.getElementById('genre').value = game.genre || '';
  document.getElementById('status').value = game.status;
  document.getElementById('mood_tags').value = game.mood_tags || '';
  document.getElementById('color_tag').value = game.color_tag;
  document.getElementById('notes').value = game.notes || '';
  
  setupColorPicker();
  document.getElementById('gameModal').showModal();
}

function closeModal() {
  document.getElementById('gameModal').close();
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('gameId').value;
  const gameData = {
    title: document.getElementById('title').value,
    platform: document.getElementById('platform').value,
    genre: document.getElementById('genre').value,
    status: document.getElementById('status').value,
    mood_tags: document.getElementById('mood_tags').value,
    color_tag: document.getElementById('color_tag').value,
    notes: document.getElementById('notes').value
  };
  
  try {
    const url = id ? `/api/games/${id}` : '/api/games';
    const method = id ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameData)
    });
    
    if (res.ok) {
      closeModal();
      const activeBtn = document.querySelector('.filter-btn.active');
      fetchGames(activeBtn ? activeBtn.dataset.status : '');
      fetchStats();
    } else {
      const data = await res.json();
      alert('Error: ' + data.error);
    }
  } catch (error) {
    console.error('Submit error:', error);
  }
}

async function updateStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/games/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (res.ok) {
      const activeBtn = document.querySelector('.filter-btn.active');
      fetchGames(activeBtn ? activeBtn.dataset.status : '');
      fetchStats();
    }
  } catch (error) {
    console.error('Update status error:', error);
  }
}

async function deleteGame(id, title) {
  if (confirm(`Are you sure you want to delete "${title}"?`)) {
    try {
      const res = await fetch(`/api/games/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const activeBtn = document.querySelector('.filter-btn.active');
        fetchGames(activeBtn ? activeBtn.dataset.status : '');
        fetchStats();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  }
}
