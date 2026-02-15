// Global application state

// Unit types with stats
const UNIT_TYPES = [
    { id: 'Infantry', name: 'Infantry', icon: '🗡️', damage: 10, health: 15, position: 1 },
    { id: 'Cavalry', name: 'Cavalry', icon: '🐎', damage: 18, health: 12, position: 2 },
    { id: 'Archer', name: 'Archer', icon: '🏹', damage: 14, health: 8, position: 3 },
    { id: 'Mage', name: 'Mage', icon: '✨', damage: 22, health: 6, position: 3 },
    { id: 'Knight', name: 'Knight', icon: '🛡️', damage: 12, health: 25, position: 1 }
];

// Available factions (each can only be chosen once)
const FACTIONS = [
    { id: 'empire', name: 'Empire', icon: '🏰', colors: { button: '#8B0000', border: '#FF4444', borderDark: '#CC0000', borderLight: '#FF6666', details: '#2a1a1a', font: '#FFCCCC' } },
    { id: 'horde', name: 'Horde', icon: '👹', colors: { button: '#4A2800', border: '#FF8C00', borderDark: '#CC7000', borderLight: '#FFAA33', details: '#2a2010', font: '#FFE4CC' } },
    { id: 'elves', name: 'Elves', icon: '🧝', colors: { button: '#1A4D1A', border: '#32CD32', borderDark: '#228B22', borderLight: '#66FF66', details: '#1a2a1a', font: '#CCFFCC' } },
    { id: 'undead', name: 'Undead', icon: '💀', colors: { button: '#2D2D4D', border: '#9370DB', borderDark: '#6A5ACD', borderLight: '#B19CD9', details: '#1a1a2a', font: '#E6CCFF' } },
    { id: 'dwarves', name: 'Dwarves', icon: '⛏️', colors: { button: '#5C4033', border: '#DAA520', borderDark: '#B8860B', borderLight: '#FFD700', details: '#2a2215', font: '#FFF0CC' } },
    { id: 'mages', name: 'Mages', icon: '🧙', colors: { button: '#1A1A4D', border: '#4169E1', borderDark: '#2E4A9E', borderLight: '#6B8DD6', details: '#15152a', font: '#CCE0FF' } }
];

// Default players (used if nothing in localStorage)
const DEFAULT_PLAYERS = [
    { id: 1, name: 'Szilárd', color: 'red', faction: 'empire', squads: [] },
    { id: 2, name: 'Kristóf', color: 'blue', faction: 'mages', squads: [] },
    { id: 3, name: 'Balázs', color: 'yellow', faction: 'horde', squads: [] },
    { id: 4, name: 'Kálmán', color: 'white', faction: 'elves', squads: [] }
];

let players = [];

// Save players to localStorage
function savePlayers() {
    try {
        localStorage.setItem('boardGameHelper_players', JSON.stringify(players));
    } catch (e) {
        console.error('Failed to save players:', e);
    }
}

// Load players from localStorage
function loadPlayers() {
    try {
        const saved = localStorage.getItem('boardGameHelper_players');
        if (saved) {
            players = JSON.parse(saved);
        } else {
            players = JSON.parse(JSON.stringify(DEFAULT_PLAYERS));
        }
    } catch (e) {
        console.error('Failed to load players:', e);
        players = JSON.parse(JSON.stringify(DEFAULT_PLAYERS));
    }
}

// Get faction object by id
function getFaction(factionId) {
    return FACTIONS.find(f => f.id === factionId);
}

// Get all faction ids that are already taken
function getUsedFactions() {
    return new Set(players.map(p => p.faction));
}

// Check if there are any factions still available
function hasAvailableFactions() {
    const usedFactions = getUsedFactions();
    return FACTIONS.some(f => !usedFactions.has(f.id));
}

// Calculate army count from player's squads
function getArmyCount(player) {
    if (!player.squads || player.squads.length === 0) return 0;
    return player.squads.reduce((total, squad) => {
        if (!squad.units) return total;
        return total + squad.units.reduce((squadTotal, unit) => squadTotal + (unit.count || 0), 0);
    }, 0);
}

let sidebarVisible = true;
let selectedPlayerId = null;
let selectedSquadIndex = null;

// Function to update toggle button icon based on state
function updateToggleButton() {
    const toggleButton = document.querySelector('.toggle-sidebar-btn');
    if (toggleButton) {
        toggleButton.textContent = '➲';
        toggleButton.classList.toggle('rotated', !sidebarVisible);
        toggleButton.title = sidebarVisible ? 'Hide players' : 'Show players';
    }
}

// Get unit type object by id
function getUnitType(unitId) {
    return UNIT_TYPES.find(u => u.id === unitId);
}
