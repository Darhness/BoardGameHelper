// Fight Page logic

let player1 = null;
let player1SquadIndex = null;
let player2 = null;
let player2SquadIndex = null;

// Initialize fight page on load
document.addEventListener('DOMContentLoaded', () => {
    loadPlayers();
    
    // Load Player 1 (selected player from index page, stored in localStorage)
    let savedPlayerId = localStorage.getItem('fightSelectedPlayerId');
    let savedSquadIndex = localStorage.getItem('fightSelectedSquadIndex');
    
    if (savedPlayerId) {
        player1 = players.find(p => p.id === parseInt(savedPlayerId));
    }
    
    // If no player selected, use first player
    if (!player1 && players.length > 0) {
        player1 = players[0];
    }
    
    if (!player1) {
        alert('No players available. Please create a player first.');
        window.location.href = 'index.html';
        return;
    }
    
    // Load Player 1's squad
    if (savedSquadIndex && player1.squads && player1.squads[parseInt(savedSquadIndex)]) {
        player1SquadIndex = parseInt(savedSquadIndex);
    } else if (player1.squads && player1.squads.length > 0) {
        // Select first squad if available
        player1SquadIndex = 0;
    }
    
    // Render Player 1
    renderPlayer1();
    
    // Populate Player 2 (enemy) dropdown
    populatePlayer2Dropdown();
    
    // Setup event listeners
    document.getElementById('squad1Select').addEventListener('change', (e) => {
        player1SquadIndex = e.target.value === '' ? null : parseInt(e.target.value);
        renderSquad1Display();
    });
    
    document.getElementById('player2Select').addEventListener('change', (e) => {
        const playerId = e.target.value;
        if (playerId === '') {
            player2 = null;
            player2SquadIndex = null;
            document.getElementById('squad2SelectorContainer').style.display = 'none';
            document.getElementById('squad2Display').style.display = 'none';
            document.getElementById('player2Icon').innerHTML = '';
            document.getElementById('player2Name').textContent = '';
            document.getElementById('player2Faction').textContent = '';
        } else {
            player2 = players.find(p => p.id === parseInt(playerId));
            if (player2) {
                renderPlayer2();
                populateSquad2Dropdown();
            }
        }
    });
    
    document.getElementById('squad2Select').addEventListener('change', (e) => {
        player2SquadIndex = e.target.value === '' ? null : parseInt(e.target.value);
        renderSquad2Display();
    });
    
    document.getElementById('fightStartBtn').addEventListener('click', () => {
        if (!player1SquadIndex || player1SquadIndex === null) {
            alert('Select a squad for Player 1');
            return;
        }
        if (!player2 || !player2SquadIndex || player2SquadIndex === null) {
            alert('Select an opponent and their squad');
            return;
        }
        // For now, just alert - implement actual fight logic later
        alert('Fight started: ' + player1.name + ' vs ' + player2.name);
    });
});

function renderPlayer1() {
    const faction = getFaction(player1.faction);
    
    // Set icon with faction colors
    const iconEl = document.getElementById('player1Icon');
    iconEl.textContent = faction.icon;
    iconEl.style.backgroundColor = faction.colors.button;
    iconEl.style.color = faction.colors.font;
    
    // Set player info
    document.getElementById('player1Name').textContent = player1.name;
    document.getElementById('player1Faction').textContent = faction.name;
    
    // Populate squad dropdown
    populateSquad1Dropdown();
    
    // Render squad display
    renderSquad1Display();
}

function populateSquad1Dropdown() {
    const dropdown = document.getElementById('squad1Select');
    dropdown.innerHTML = '<option value="">-- No Squad --</option>';
    
    if (player1.squads && player1.squads.length > 0) {
        player1.squads.forEach((squad, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = squad.name;
            dropdown.appendChild(option);
        });
        
        // Select the current squad
        if (player1SquadIndex !== null && player1SquadIndex >= 0) {
            dropdown.value = player1SquadIndex;
        }
    } else {
        document.getElementById('createSquad1Btn').style.display = 'block';
    }
}

function renderSquad1Display() {
    const displayEl = document.getElementById('squad1Display');
    const frontlineEl = document.getElementById('squad1Frontline');
    const middleEl = document.getElementById('squad1Middle');
    const backlineEl = document.getElementById('squad1Backline');
    
    if (player1SquadIndex === null || !player1.squads[player1SquadIndex]) {
        displayEl.style.display = 'none';
        return;
    }
    
    displayEl.style.display = 'block';
    const squad = player1.squads[player1SquadIndex];
    
    // Clear all sections
    frontlineEl.innerHTML = '';
    middleEl.innerHTML = '';
    backlineEl.innerHTML = '';
    
    if (squad.units && squad.units.length > 0) {
        squad.units.forEach(unit => {
            const unitType = getUnitType(unit.type);
            const unitEl = document.createElement('div');
            unitEl.className = 'squad-unit-item';
            unitEl.innerHTML = `
                <span class="unit-icon">${unitType ? unitType.icon : unit.type}</span>
                <span class="unit-count">${unit.count}</span>
            `;
            
            // Place in appropriate section
            if (unit.type === 'Infantry' || unit.type === 'Cavalry' || unit.type === 'Knight') {
                frontlineEl.appendChild(unitEl);
            } else if (unit.type === 'Mage') {
                middleEl.appendChild(unitEl);
            } else if (unit.type === 'Archer') {
                backlineEl.appendChild(unitEl);
            }
        });
    }
}

function renderPlayer2() {
    const faction = getFaction(player2.faction);
    
    // Set icon with faction colors
    const iconEl = document.getElementById('player2Icon');
    iconEl.textContent = faction.icon;
    iconEl.style.backgroundColor = faction.colors.button;
    iconEl.style.color = faction.colors.font;
    
    // Set player info
    document.getElementById('player2Name').textContent = player2.name;
    document.getElementById('player2Faction').textContent = faction.name;
}

function populatePlayer2Dropdown() {
    const dropdown = document.getElementById('player2Select');
    dropdown.innerHTML = '<option value="">-- Select Player --</option>';
    
    players.forEach(player => {
        if (player.id !== player1.id) {
            const option = document.createElement('option');
            option.value = player.id;
            option.textContent = player.name;
            dropdown.appendChild(option);
        }
    });
}

function populateSquad2Dropdown() {
    const container = document.getElementById('squad2SelectorContainer');
    const dropdown = document.getElementById('squad2Select');
    
    dropdown.innerHTML = '<option value="">-- No Squad --</option>';
    
    if (player2.squads && player2.squads.length > 0) {
        player2.squads.forEach((squad, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = squad.name;
            dropdown.appendChild(option);
        });
        
        container.style.display = 'block';
        dropdown.value = '';
        player2SquadIndex = null;
        renderSquad2Display();
    } else {
        container.style.display = 'none';
        document.getElementById('createSquad2Btn').style.display = 'block';
        document.getElementById('squad2Display').style.display = 'none';
    }
}

function renderSquad2Display() {
    const displayEl = document.getElementById('squad2Display');
    const frontlineEl = document.getElementById('squad2Frontline');
    const middleEl = document.getElementById('squad2Middle');
    const backlineEl = document.getElementById('squad2Backline');
    
    if (player2SquadIndex === null || !player2.squads[player2SquadIndex]) {
        displayEl.style.display = 'none';
        return;
    }
    
    displayEl.style.display = 'block';
    const squad = player2.squads[player2SquadIndex];
    
    // Clear all sections
    frontlineEl.innerHTML = '';
    middleEl.innerHTML = '';
    backlineEl.innerHTML = '';
    
    if (squad.units && squad.units.length > 0) {
        squad.units.forEach(unit => {
            const unitType = getUnitType(unit.type);
            const unitEl = document.createElement('div');
            unitEl.className = 'squad-unit-item';
            unitEl.innerHTML = `
                <span class="unit-icon">${unitType ? unitType.icon : unit.type}</span>
                <span class="unit-count">${unit.count}</span>
            `;
            
            // Place in appropriate section
            if (unit.type === 'Infantry' || unit.type === 'Cavalry' || unit.type === 'Knight') {
                frontlineEl.appendChild(unitEl);
            } else if (unit.type === 'Mage') {
                middleEl.appendChild(unitEl);
            } else if (unit.type === 'Archer') {
                backlineEl.appendChild(unitEl);
            }
        });
    }
}
