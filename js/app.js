// Main application initialization

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPlayers();
    renderPlayers();
    
    // Select and display first player by default
    if (players.length > 0) {
        selectPlayer(players[0].id);
    }
    
    // Setup sidebar buttons
    document.getElementById('toggleSidebarBtn').onclick = toggleSidebar;
    document.getElementById('addPlayerBtn').onclick = openAddPlayerDialog;
    
    // Setup fight button
    document.getElementById('fightBtn').onclick = () => {
        // Save selected player and squad to localStorage for fight page
        localStorage.setItem('fightSelectedPlayerId', selectedPlayerId);
        localStorage.setItem('fightSelectedSquadIndex', selectedSquadIndex);
        window.location.href = 'fight.html';
    };
    
    // Setup player dialog buttons
    document.getElementById('confirmBtn').onclick = confirmAddPlayer;
    document.getElementById('cancelBtn').onclick = cancelAddPlayer;
    
    // Setup squad dialog buttons
    document.getElementById('confirmSquadBtn').onclick = confirmAddSquad;
    document.getElementById('cancelSquadBtn').onclick = () => document.getElementById('addSquadDialog').close();
    document.getElementById('addUnitBtn').onclick = addSquadUnitRow;
    
    // Setup edit squad dialog buttons
    document.getElementById('confirmEditSquadBtn').onclick = confirmEditSquad;
    document.getElementById('cancelEditSquadBtn').onclick = () => {
        document.getElementById('editSquadDialog').close();
        currentDialogMode = 'add';
    };
    document.getElementById('editAddUnitBtn').onclick = addEditSquadUnitRow;
    
    // Allow Enter key to confirm in player dialog
    document.getElementById('playerNameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            confirmAddPlayer();
        }
    });
    
    // Allow Enter key to confirm in squad dialog
    document.getElementById('squadNameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            confirmAddSquad();
        }
    });
});

// Function to render faction buttons with disabled state for taken factions
function renderFactionButtons() {
    const container = document.getElementById('factionOptions');
    const usedFactions = getUsedFactions();
    container.innerHTML = '';
    
    let firstAvailable = null;
    
    FACTIONS.forEach(faction => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'faction-btn';
        btn.dataset.faction = faction.id;
        btn.title = faction.name;
        btn.innerHTML = `<span class="faction-icon">${faction.icon}</span><span class="faction-label">${faction.name}</span>`;
        
        if (usedFactions.has(faction.id)) {
            btn.disabled = true;
            btn.classList.add('taken');
        } else {
            if (!firstAvailable) firstAvailable = faction.id;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.faction-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                document.getElementById('playerFactionInput').value = faction.id;
            });
        }
        
        container.appendChild(btn);
    });
    
    // Select first available faction
    if (firstAvailable) {
        const firstBtn = container.querySelector(`[data-faction="${firstAvailable}"]`);
        if (firstBtn) {
            firstBtn.classList.add('selected');
            document.getElementById('playerFactionInput').value = firstAvailable;
        }
    } else {
        document.getElementById('playerFactionInput').value = '';
    }
}

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered!'))
            .catch(err => console.log('Registration failed: ', err));
    });
}

// Logic to capture the "Install" prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default mini-infobar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;
    console.log("App is ready to be installed.");
    // You could show a custom "Install App" button here if you like
});
