// Squad management functions

// Function to open add squad dialog
function openAddSquadDialog(playerId) {
    currentDialogMode = 'add';
    const dialog = document.getElementById('addSquadDialog');
    document.getElementById('squadPlayerIdInput').value = playerId;
    
    // Generate default squad name based on player name and squad number
    const player = players.find(p => p.id === playerId);
    const squadNumber = player && player.squads ? player.squads.length + 1 : 1;
    const defaultName = player ? `${player.name} Squad ${squadNumber}` : `Squad 1`;
    document.getElementById('squadNameInput').value = defaultName;
    
    // Clear edit dialog to prevent stale data
    document.getElementById('editSquadUnitsContainer').innerHTML = '';
    
    // Initialize with one unit row
    const container = document.getElementById('squadUnitsContainer');
    container.innerHTML = '';
    addSquadUnitRow();
    
    document.getElementById('squadNameInput').focus();
    dialog.showModal();
}

// Function to get all selected unit types in the add dialog
function getSelectedUnitTypes() {
    const selected = new Set();
    document.querySelectorAll('#squadUnitsContainer .squad-unit-row .unit-type-select').forEach(select => {
        if (select.value) {
            selected.add(select.value);
        }
    });
    return selected;
}

// Function to update available options in all unit type selects (add dialog)
function updateUnitTypeOptions() {
    const selectedTypes = getSelectedUnitTypes();
    const availableTypes = UNIT_TYPES.map(u => u.id);
    
    document.querySelectorAll('#squadUnitsContainer .squad-unit-row .unit-type-select').forEach(select => {
        const currentValue = select.value;
        availableTypes.forEach(type => {
            const option = select.querySelector(`option[value="${type}"]`);
            if (option) {
                // Enable the option if it's the current select's value or not selected elsewhere
                option.disabled = selectedTypes.has(type) && type !== currentValue;
            }
        });
        
        // Add change listener
        select.removeEventListener('change', handleUnitTypeChange);
        select.addEventListener('change', handleUnitTypeChange);
    });
}

// Function to handle unit type change
function handleUnitTypeChange() {
    updateUnitTypeOptions();
}

// Function to create a unit row in the squad dialog
function createUnitRow(forEditDialog = false) {
    const template = document.getElementById('squadUnitRowTemplate');
    const clone = template.content.cloneNode(true);
    
    // Populate unit type options from UNIT_TYPES constant
    const select = clone.querySelector('.unit-type-select');
    UNIT_TYPES.forEach(unitType => {
        const option = document.createElement('option');
        option.value = unitType.id;
        option.textContent = `${unitType.icon} ${unitType.name}`;
        select.appendChild(option);
    });
    
    // Set up remove button based on which dialog it's for
    const removeBtn = clone.querySelector('[data-field="removeBtn"]');
    if (forEditDialog) {
        removeBtn.onclick = function() {
            this.closest('.squad-unit-row').remove();
            updateEditUnitTypeOptions();
        };
    } else {
        removeBtn.onclick = function() {
            removeSquadUnitRow(this);
        };
    }
    
    return clone;
}

// Function to add a new unit row to the squad dialog
function addSquadUnitRow() {
    const container = document.getElementById('squadUnitsContainer');
    const selectedTypes = getSelectedUnitTypes();
    const availableTypes = UNIT_TYPES.map(u => u.id);
    const unselectedTypes = availableTypes.filter(type => !selectedTypes.has(type));
    
    // Check if all types are already used
    if (unselectedTypes.length === 0) {
        alert('All unit types are already added to this squad');
        return;
    }
    
    const row = createUnitRow();
    
    // Set the default value to the first unselected type
    const defaultType = unselectedTypes[0];
    row.querySelector('.unit-type-select').value = defaultType;
    
    container.appendChild(row);
    updateUnitTypeOptions();
}

// Function to remove a unit row from the squad dialog
function removeSquadUnitRow(button) {
    button.closest('.squad-unit-row').remove();
    updateUnitTypeOptions();
}

// Function to add a squad to a player
function confirmAddSquad() {
    const playerId = parseInt(document.getElementById('squadPlayerIdInput').value);
    const squadName = document.getElementById('squadNameInput').value.trim();
    
    if (!squadName) {
        alert('Please enter a squad name');
        return;
    }
    
    // Collect all units from the add dialog
    const units = [];
    const usedTypes = new Set();
    document.querySelectorAll('#squadUnitsContainer .squad-unit-row').forEach(row => {
        const count = parseInt(row.querySelector('.unit-count-input').value);
        const type = row.querySelector('.unit-type-select').value;
        if (count > 0 && type) {
            // Check for duplicates
            if (usedTypes.has(type)) {
                alert(`Duplicate unit type: ${type}. Each unit type can only be added once per squad.`);
                return;
            }
            usedTypes.add(type);
            units.push({ count, type });
        }
    });
    
    if (units.length === 0) {
        alert('Please add at least one unit type to the squad');
        return;
    }
    
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    
    if (!player.squads) {
        player.squads = [];
    }
    
    player.squads.push({
        name: squadName,
        units: units
    });
    savePlayers();
    
    document.getElementById('addSquadDialog').close();
    renderPlayerDetails(playerId);
    updatePlayerSlotArmyCount(playerId);
}

// Function to remove a squad from a player
function removeSquad(playerId, squadIndex) {
    const player = players.find(p => p.id === playerId);
    if (player && player.squads) {
        player.squads.splice(squadIndex, 1);
        savePlayers();
        renderPlayerDetails(playerId);
        updatePlayerSlotArmyCount(playerId);
    }
}

// Current dialog mode for shared unit row functions
let currentDialogMode = 'add';

// Function to get the active units container based on dialog mode
function getActiveUnitsContainer() {
    return currentDialogMode === 'edit' 
        ? document.getElementById('editSquadUnitsContainer')
        : document.getElementById('squadUnitsContainer');
}

// Function to open edit squad dialog
function openEditSquadDialog(playerId, squadIndex) {
    currentDialogMode = 'edit';
    const player = players.find(p => p.id === playerId);
    if (!player || !player.squads || !player.squads[squadIndex]) return;
    
    const squad = player.squads[squadIndex];
    const dialog = document.getElementById('editSquadDialog');
    
    document.getElementById('editSquadPlayerIdInput').value = playerId;
    document.getElementById('editSquadIndexInput').value = squadIndex;
    document.getElementById('editSquadNameInput').value = squad.name;
    
    // Clear add dialog to prevent stale data
    document.getElementById('squadUnitsContainer').innerHTML = '';
    
    // Populate existing units
    const container = document.getElementById('editSquadUnitsContainer');
    container.innerHTML = '';
    
    if (squad.units && squad.units.length > 0) {
        squad.units.forEach(unit => {
            const row = createUnitRow(true);
            row.querySelector('.unit-count-input').value = unit.count;
            row.querySelector('.unit-type-select').value = unit.type;
            container.appendChild(row);
        });
    } else {
        addEditSquadUnitRow();
    }
    
    updateEditUnitTypeOptions();
    document.getElementById('editSquadNameInput').focus();
    dialog.showModal();
}

// Function to get all selected unit types in edit dialog
function getEditSelectedUnitTypes() {
    const selected = new Set();
    document.querySelectorAll('#editSquadUnitsContainer .squad-unit-row .unit-type-select').forEach(select => {
        if (select.value) {
            selected.add(select.value);
        }
    });
    return selected;
}

// Function to update available options in edit dialog
function updateEditUnitTypeOptions() {
    const selectedTypes = getEditSelectedUnitTypes();
    const availableTypes = UNIT_TYPES.map(u => u.id);
    
    document.querySelectorAll('#editSquadUnitsContainer .squad-unit-row .unit-type-select').forEach(select => {
        const currentValue = select.value;
        availableTypes.forEach(type => {
            const option = select.querySelector(`option[value="${type}"]`);
            if (option) {
                option.disabled = selectedTypes.has(type) && type !== currentValue;
            }
        });
        
        select.removeEventListener('change', handleEditUnitTypeChange);
        select.addEventListener('change', handleEditUnitTypeChange);
    });
}

// Function to handle unit type change in edit dialog
function handleEditUnitTypeChange() {
    updateEditUnitTypeOptions();
}

// Function to add a unit row in edit dialog
function addEditSquadUnitRow() {
    const container = document.getElementById('editSquadUnitsContainer');
    const selectedTypes = getEditSelectedUnitTypes();
    const availableTypes = UNIT_TYPES.map(u => u.id);
    const unselectedTypes = availableTypes.filter(type => !selectedTypes.has(type));
    
    if (unselectedTypes.length === 0) {
        alert('All unit types are already added to this squad');
        return;
    }
    
    const row = createUnitRow(true);
    const defaultType = unselectedTypes[0];
    row.querySelector('.unit-type-select').value = defaultType;
    
    container.appendChild(row);
    updateEditUnitTypeOptions();
}

// Function to confirm editing a squad
function confirmEditSquad() {
    const playerId = parseInt(document.getElementById('editSquadPlayerIdInput').value);
    const squadIndex = parseInt(document.getElementById('editSquadIndexInput').value);
    const squadName = document.getElementById('editSquadNameInput').value.trim();
    
    if (!squadName) {
        alert('Please enter a squad name');
        return;
    }
    
    // Collect all units from the edit dialog
    const units = [];
    const usedTypes = new Set();
    let hasDuplicate = false;
    
    document.querySelectorAll('#editSquadUnitsContainer .squad-unit-row').forEach(row => {
        if (hasDuplicate) return;
        const count = parseInt(row.querySelector('.unit-count-input').value);
        const type = row.querySelector('.unit-type-select').value;
        if (count > 0 && type) {
            if (usedTypes.has(type)) {
                alert(`Duplicate unit type: ${type}. Each unit type can only be added once per squad.`);
                hasDuplicate = true;
                return;
            }
            usedTypes.add(type);
            units.push({ count, type });
        }
    });
    
    if (hasDuplicate) return;
    
    if (units.length === 0) {
        alert('Please add at least one unit type to the squad');
        return;
    }
    
    const player = players.find(p => p.id === playerId);
    if (!player || !player.squads || !player.squads[squadIndex]) return;
    
    player.squads[squadIndex] = {
        name: squadName,
        units: units
    };
    savePlayers();
    
    document.getElementById('editSquadDialog').close();
    currentDialogMode = 'add';
    renderPlayerDetails(playerId);
    updatePlayerSlotArmyCount(playerId);
}
