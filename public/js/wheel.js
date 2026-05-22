document.addEventListener('DOMContentLoaded', () => {
  initWheel();
});

let games = [];
let currentRotation = 0;

async function initWheel() {
  try {
    const res = await fetch('/api/games');
    games = await res.json();
    
    if (games.length === 0) {
      document.getElementById('wheelWrapper').innerHTML = '<div class="empty-state">No games in your collection to spin!</div>';
      document.getElementById('spinBtn').style.display = 'none';
      return;
    }
    
    drawWheel();
    document.getElementById('spinBtn').addEventListener('click', spinWheel);
  } catch (error) {
    console.error('Failed to load games', error);
  }
}

function drawWheel() {
  const canvas = document.getElementById('wheelCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width / 2;
  
  const arcSize = (2 * Math.PI) / games.length;
  
  ctx.clearRect(0, 0, width, height);
  
  games.forEach((game, index) => {
    const angle = index * arcSize;
    
    // Draw slice
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = game.color_tag || '#6c63ff';
    ctx.fill();
    ctx.strokeStyle = '#1a1a24';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw text
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle + arcSize / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    
    // Truncate text if it's too long
    let text = game.title;
    if (text.length > 20) {
      text = text.substring(0, 17) + '...';
    }
    
    ctx.fillText(text, radius - 20, 5);
    ctx.restore();
  });
}

function spinWheel() {
  if (games.length === 0) return;
  
  const btn = document.getElementById('spinBtn');
  btn.disabled = true;
  
  // Random extra spins + random slice
  const extraSpins = Math.floor(Math.random() * 5) + 5; // 5 to 10 full spins
  const randomDegree = Math.floor(Math.random() * 360); // Random offset inside the final spin
  
  const totalRotation = (extraSpins * 360) + randomDegree;
  currentRotation += totalRotation; // Keep increasing to spin consistently forward
  
  const canvas = document.getElementById('wheelCanvas');
  canvas.style.transform = `rotate(${currentRotation}deg)`;
  
  // Wait for transition (4s as defined in CSS)
  setTimeout(() => {
    btn.disabled = false;
    announceWinner(currentRotation);
  }, 4100);
}

function announceWinner(rotation) {
  // Normalize rotation to 0-359
  const normalizedRotation = rotation % 360;
  
  // The pointer is at the TOP (270 degrees in canvas coords)
  const pointerAngleDeg = (270 - normalizedRotation + 360) % 360;
  const pointerAngleRad = (pointerAngleDeg * Math.PI) / 180;
  
  const arcSize = (2 * Math.PI) / games.length;
  
  // Find which slice covers the pointer angle
  const winningIndex = Math.floor(pointerAngleRad / arcSize);
  const game = games[winningIndex];
  
  const resultContainer = document.getElementById('wheelResult');
  resultContainer.style.display = 'block';
  resultContainer.innerHTML = `
    <div class="game-card" style="text-align: left; margin: 0 auto; border: none; box-shadow: none;">
      <div class="color-strip" style="background-color: ${game.color_tag}"></div>
      <div class="game-header">
        <div>
          <h3 class="game-title">The Wheel has spoken!</h3>
          <h2 style="margin: 0.5rem 0; color: var(--accent);">${game.title}</h2>
          <div class="game-meta">${game.platform || 'Unknown Platform'} · ${game.genre || 'Unknown Genre'}</div>
        </div>
      </div>
      <div style="margin-top: 1rem;">
        <span class="status-badge status-${game.status}">${game.status}</span>
      </div>
    </div>
  `;
  document.getElementById('winnerModal').showModal();
}
