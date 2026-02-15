// Player management functions

// Function to select a player
function selectPlayer(playerId) {
    selectedPlayerId = playerId;
    selectedSquadIndex = null; // Clear squad selection when changing player
    // Update visual highlighting
    document.querySelectorAll('.player-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    const selectedSlot = document.querySelector(`[data-player-id="${playerId}"]`);
    if (selectedSlot) {
        selectedSlot.classList.add('selected');
    }
    // Hide players container when player is selected
    sidebarVisible = false;
    const playersContainer = document.getElementById('playersContainer');
    const carouselContent = document.querySelector('[data-field="carouselContent"]');
    playersContainer.style.display = 'none';
    if (carouselContent) {
        carouselContent.style.zIndex = '1000'; // High z-index for carousel when sidebar hidden
    }
    updateToggleButton();
    // Update player details display
    renderPlayerDetails(playerId);
    // Update fight button state
    updateFightButton();
}

// Function to open add player dialog
function openAddPlayerDialog() {
    const dialog = document.getElementById('addPlayerDialog');
    const input = document.getElementById('playerNameInput');
    input.value = '';
    
    // Render faction buttons with taken factions disabled
    renderFactionButtons();
    
    input.focus();
    dialog.showModal();
}

// Function to confirm adding a new player
function confirmAddPlayer() {
    const input = document.getElementById('playerNameInput');
    const colorInput = document.getElementById('playerColorInput');
    const factionInput = document.getElementById('playerFactionInput');
    const playerName = input.value.trim();
    const playerColor = colorInput.value;
    const playerFaction = factionInput.value;
    
    if (!playerName) {
        alert('Please enter a player name');
        return;
    }
    
    if (!playerFaction) {
        alert('Please select a faction');
        return;
    }

    const newId = Math.max(...players.map(p => p.id), 0) + 1;

    const newPlayer = {
        id: newId,
        name: playerName,
        color: playerColor,
        faction: playerFaction,
        squads: [],
        isCurrentTurn: false
    };

    players.push(newPlayer);
    savePlayers();
    
    // Create new player slot using template
    const playersContainer = document.getElementById('playersContainer');
    const template = document.getElementById('playerSlotTemplate');
    const clone = template.content.cloneNode(true);
    
    const playerSlot = clone.querySelector('[data-field="playerSlot"]');
    playerSlot.setAttribute('data-player-id', newPlayer.id);
    
    // Apply faction colors
    const faction = getFaction(newPlayer.faction);
    if (faction && faction.colors) {
        playerSlot.style.backgroundColor = faction.colors.button;
        playerSlot.style.color = faction.colors.font;
        playerSlot.style.setProperty('--faction-border', faction.colors.border);
        playerSlot.style.setProperty('--faction-border-dark', faction.colors.borderDark);
        playerSlot.style.setProperty('--faction-border-light', faction.colors.borderLight);
    }
    
    playerSlot.onclick = () => selectPlayer(newPlayer.id);
    
    // Set player data
    clone.querySelector('[data-field="armyNumber"]').textContent = getArmyCount(newPlayer);
    clone.querySelector('[data-field="playerName"]').textContent = newPlayer.name;
    
    // Set faction icon
    clone.querySelector('[data-field="factionIcon"]').textContent = faction ? faction.icon : '❓';
    
    // Insert player slot before the add button
    const addButton = playersContainer.querySelector('.add-player-btn');
    playersContainer.insertBefore(clone, addButton);
    
    // Select the new player
    selectPlayer(newPlayer.id);
    
    // Update add player button visibility
    updateAddPlayerButton();
    
    document.getElementById('addPlayerDialog').close();
}

// Function to cancel adding player
function cancelAddPlayer() {
    document.getElementById('addPlayerDialog').close();
}
// Function to delete a player
function deletePlayer(playerId) {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    
    if (confirm(`Are you sure you want to delete player "${player.name}"?`)) {
        // Remove player from array
        players = players.filter(p => p.id !== playerId);
        savePlayers();
        
        // Remove player slot from the UI
        const playerSlot = document.querySelector(`[data-player-id="${playerId}"]`);
        if (playerSlot) {
            playerSlot.remove();
        }
        
        // If the deleted player was selected, select another player
        if (selectedPlayerId === playerId) {
            selectedPlayerId = null;
            selectedSquadIndex = null;
            
            if (players.length > 0) {
                selectPlayer(players[0].id);
            } else {
                document.querySelector('.player-details').innerHTML = '<div style="text-align: center; color: #999;">No players. Create one to start!</div>';
            }
        }
        
        // Update add player button and fight button
        updateAddPlayerButton();
        updateFightButton();
    }
}