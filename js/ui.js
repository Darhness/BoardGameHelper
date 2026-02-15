// UI rendering and display functions

// Function to render selected player details
function renderPlayerDetails(playerId) {
    const playerDetails = document.querySelector('.player-details');
    const player = players.find(p => p.id === playerId);
    
    if (!player) {
        playerDetails.innerHTML = '<div style="text-align: center; color: #999;">Select a player</div>';
        return;
    }
    
    // Clone the template
    const template = document.getElementById('playerDetailsTemplate');
    const clone = template.content.cloneNode(true);
    
    // Populate basic player info
    const faction = getFaction(player.faction);
    clone.querySelector('[data-field="factionIcon"]').textContent = faction ? faction.icon : '❓';
    clone.querySelector('[data-field="factionName"]').textContent = faction ? faction.name : 'Unknown';
    clone.querySelector('[data-field="name"]').textContent = player.name;
    clone.querySelector('[data-field="armyCount"]').textContent = getArmyCount(player);
    
    // Apply faction colors to the entire player details area
    if (faction && faction.colors) {
        playerDetails.style.backgroundColor = faction.colors.details;
        playerDetails.style.color = faction.colors.font;
    }
    
    // Set color display
    const predefinedColors = ['red', 'blue', 'yellow', 'white', 'green', 'purple', 'orange', 'pink'];
    const colorDisplay = clone.querySelector('[data-field="colorDisplay"]');
    if (predefinedColors.includes(player.color)) {
        colorDisplay.style.backgroundColor = player.color;
    } else {
        colorDisplay.style.backgroundColor = player.color;
    }
    
    // Set up carousel
    const carouselContent = clone.querySelector('[data-field="carouselContent"]');
    const navSquads = clone.querySelector('[data-field="navSquads"]');
    const navFightHistory = clone.querySelector('[data-field="navFightHistory"]');
    
    // Render squads carousel item
    const squadsTemplate = document.getElementById('squadsCarouselItemTemplate');
    const squadsItem = squadsTemplate.content.cloneNode(true);
    const grid = squadsItem.querySelector('[data-field="squadsGrid"]');
    
    if (player.squads && player.squads.length > 0) {
        player.squads.forEach((squad, squadIndex) => {
            const squadTemplate = document.getElementById('squadPanelTemplate');
            const squadClone = squadTemplate.content.cloneNode(true);
            
            const squadPanel = squadClone.querySelector('.squad-panel');
            squadPanel.dataset.squadIndex = squadIndex;
            
            // Add selected class if this squad is selected
            if (selectedSquadIndex === squadIndex) {
                squadPanel.classList.add('selected');
            }
            
            // Click to select squad (on the panel itself, not buttons)
            squadPanel.onclick = (e) => {
                if (e.target.closest('button')) return;
                selectSquad(squadIndex);
            };
            
            squadClone.querySelector('[data-field="squadName"]').textContent = squad.name;
            
            // Set up edit button with stopPropagation
            const editBtn = squadClone.querySelector('[data-field="editBtn"]');
            editBtn.onclick = (e) => {
                e.stopPropagation();
                openEditSquadDialog(playerId, squadIndex);
            };
            
            // Set up remove button with stopPropagation
            const removeBtn = squadClone.querySelector('[data-field="removeBtn"]');
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                removeSquad(playerId, squadIndex);
            };
            
            // Get section containers
            const frontlineUnits = squadClone.querySelector('[data-field="frontlineUnits"]');
            const middleUnits = squadClone.querySelector('[data-field="middleUnits"]');
            const backlineUnits = squadClone.querySelector('[data-field="backlineUnits"]');
            
            // Populate units by section
            if (squad.units && squad.units.length > 0) {
                squad.units.forEach(unit => {
                    const unitTemplate = document.getElementById('unitItemTemplate');
                    const unitClone = unitTemplate.content.cloneNode(true);
                    const unitType = getUnitType(unit.type);
                    
                    unitClone.querySelector('[data-field="unitCount"]').textContent = unit.count;
                    unitClone.querySelector('[data-field="unitIcon"]').textContent = unitType ? unitType.icon : unit.type;
                    
                    // Place in appropriate section based on unit type
                    if (unit.type === 'Infantry' || unit.type === 'Cavalry' || unit.type === 'Knight') {
                        frontlineUnits.appendChild(unitClone);
                    } else if (unit.type === 'Mage') {
                        middleUnits.appendChild(unitClone);
                    } else if (unit.type === 'Archer') {
                        backlineUnits.appendChild(unitClone);
                    }
                });
            }
            
            grid.appendChild(squadClone);
        });
    }
    carouselContent.appendChild(squadsItem);
    
    // Render fight history carousel item
    const fightHistoryTemplate = document.getElementById('fightHistoryCarouselItemTemplate');
    const fightHistoryItem = fightHistoryTemplate.content.cloneNode(true);
    carouselContent.appendChild(fightHistoryItem);
    
    // Set up carousel navigation
    navSquads.classList.add('active');
    navSquads.onclick = () => switchCarouselItem('squads');
    navFightHistory.onclick = () => switchCarouselItem('fight-history');
    
    // Set up add squad button
    const addSquadBtn = clone.querySelector('[data-field="addSquadBtn"]');
    addSquadBtn.onclick = () => openAddSquadDialog(playerId);
    
    // Set up delete player button
    const deletePlayerBtn = clone.querySelector('[data-field="deletePlayerBtn"]');
    deletePlayerBtn.onclick = () => deletePlayer(playerId);
    
    // Clear and append
    playerDetails.innerHTML = '';
    playerDetails.appendChild(clone);
}

// Function to switch carousel items
function switchCarouselItem(targetId) {
    const root = document.querySelector('.player-details');
    
    // Update nav buttons
    root.querySelectorAll('.carousel-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.carouselTarget === targetId);
    });
    
    // Show/hide carousel items
    root.querySelectorAll('.carousel-item').forEach(item => {
        item.classList.toggle('active', item.dataset.carouselId === targetId);
    });
}

// Function to select a squad
function selectSquad(squadIndex) {
    // Toggle selection if clicking same squad
    if (selectedSquadIndex === squadIndex) {
        selectedSquadIndex = null;
    } else {
        selectedSquadIndex = squadIndex;
    }
    
    // Update visual selection
    document.querySelectorAll('.squad-panel').forEach(panel => {
        panel.classList.toggle('selected', parseInt(panel.dataset.squadIndex) === selectedSquadIndex);
    });
    
    // Update fight button state
    updateFightButton();
}

// Function to update fight button enabled/disabled state
function updateFightButton() {
    const fightBtn = document.getElementById('fightBtn');
    if (fightBtn) {
        fightBtn.disabled = selectedSquadIndex === null;
    }
}

// Function to update a single player's army count in sidebar
function updatePlayerSlotArmyCount(playerId) {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    
    const slot = document.querySelector(`[data-player-id="${playerId}"]`);
    if (slot) {
        const armyNumber = slot.querySelector('[data-field="armyNumber"]');
        if (armyNumber) {
            armyNumber.textContent = getArmyCount(player);
        }
    }
}

// Function to toggle player list visibility
function toggleSidebar() {
    sidebarVisible = !sidebarVisible;
    const playersContainer = document.getElementById('playersContainer');
    const carouselContent = document.querySelector('[data-field="carouselContent"]');

    if (sidebarVisible) {
        playersContainer.style.display = '';
        if (carouselContent) {
            carouselContent.style.zIndex = '10'; // Low z-index for carousel when sidebar visible
        }
    } else {
        playersContainer.style.display = 'none';
        if (carouselContent) {
            carouselContent.style.zIndex = '1000'; // High z-index for carousel when sidebar hidden
        }
    }
    
    updateToggleButton();
}

// Function to update add player button visibility
function updateAddPlayerButton() {
    const addButton = document.getElementById('addPlayerBtn');
    if (addButton) {
        addButton.style.display = hasAvailableFactions() ? '' : 'none';
    }
}

// Function to render all players
function renderPlayers() {
    const playersContainer = document.getElementById('playersContainer');
    const addButton = playersContainer.querySelector('.add-player-btn');
    
    // Remove all existing player slots (but keep the button)
    document.querySelectorAll('.player-slot').forEach(slot => slot.remove());

    // Render each player
    players.forEach(player => {
        const template = document.getElementById('playerSlotTemplate');
        const clone = template.content.cloneNode(true);
        
        const playerSlot = clone.querySelector('[data-field="playerSlot"]');
        playerSlot.setAttribute('data-player-id', player.id);
        if (selectedPlayerId === player.id) {
            playerSlot.classList.add('selected');
        }
        
        // Apply faction colors
        const faction = getFaction(player.faction);
        if (faction && faction.colors) {
            playerSlot.style.backgroundColor = faction.colors.button;
            playerSlot.style.color = faction.colors.font;
            playerSlot.style.setProperty('--faction-border', faction.colors.border);
            playerSlot.style.setProperty('--faction-border-dark', faction.colors.borderDark);
            playerSlot.style.setProperty('--faction-border-light', faction.colors.borderLight);
        }
        
        playerSlot.onclick = () => selectPlayer(player.id);
        
        // Set player data
        clone.querySelector('[data-field="armyNumber"]').textContent = getArmyCount(player);
        clone.querySelector('[data-field="playerName"]').textContent = player.name;
        
        // Set faction icon (faction already retrieved above)
        clone.querySelector('[data-field="factionIcon"]').textContent = faction ? faction.icon : '❓';
        
        // Set turn indicator
        const turnIndicator = clone.querySelector('[data-field="turnIndicator"]');
        if (player.isCurrentTurn) {
            turnIndicator.style.display = '';
        }
        
        // Insert before the add button
        playersContainer.insertBefore(clone, addButton);
    });
    
    // Update add player button visibility
    updateAddPlayerButton();
}
