document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => fetchVibe(btn.dataset.mood));
  });
});

async function fetchVibe(mood) {
  const resultContainer = document.getElementById('moodResult');
  
  try {
    const res = await fetch(`/api/mood/${mood}`);
    
    if (res.ok) {
      const game = await res.json();
      resultContainer.style.display = 'block';
      resultContainer.innerHTML = `
        <div class="game-card" style="text-align: left; max-width: 400px; margin: 0 auto;">
          <div class="color-strip" style="background-color: ${game.color_tag}"></div>
          <div class="game-header">
            <div>
              <h3 class="game-title">Tonight, you should play:</h3>
              <h2 style="margin: 0.5rem 0; color: var(--accent);">${game.title}</h2>
              <div class="game-meta">${game.platform || 'Unknown Platform'} · ${game.genre || 'Unknown Genre'}</div>
            </div>
          </div>
          <div class="game-actions" style="margin-top: 1.5rem;">
            <button class="btn btn-primary" onclick="markPlaying(${game.id})" style="width: 100%">▶ Mark as Playing</button>
          </div>
        </div>
      `;
    } else {
      const data = await res.json();
      resultContainer.style.display = 'block';
      resultContainer.innerHTML = `
        <div class="empty-state" style="max-width: 400px; margin: 0 auto; padding: 2rem;">
          <h3>Aww, no games found!</h3>
          <p>${data.error}</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error fetching mood:', error);
  }
}

async function markPlaying(id) {
  try {
    const res = await fetch(`/api/games/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'playing' })
    });
    
    if (res.ok) {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Update status error:', error);
  }
}
