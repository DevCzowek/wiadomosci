/**
 * Główny plik JavaScript dla przeglądarki eksportów Discord
 * Wersja 2.0 - Uproszczona
 */

let exportsData = {
    dms: {},
    servers: {}
};

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    loadExportsData();
});

function initializePage() {
    document.getElementById('content-selection').style.display = 'none';
    document.getElementById('channel-list').style.display = 'none';
}

function setupEventListeners() {
    // Obsługa zakładek
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${this.dataset.tab}-tab`).classList.add('active');
        });
    });
    
    // Obsługa wyboru daty
    document.getElementById('date-select').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('content-selection').style.display = 'block';
            loadContentForDate(this.value);
        } else {
            document.getElementById('content-selection').style.display = 'none';
        }
    });
}

function loadExportsData() {
    fetch('exports_data.json')
        .then(response => response.json())
        .then(data => {
            exportsData = data;
            populateDateSelect();
        })
        .catch(error => {
            console.error('Błąd ładowania danych:', error);
            alert('Nie można załadować listy eksportów. Sprawdź czy plik exports_data.json istnieje.');
        });
}

function populateDateSelect() {
    const select = document.getElementById('date-select');
    select.innerHTML = '<option value="">-- Wybierz datę --</option>';
    
    const allDates = new Set();
    
    // Zbierz wszystkie daty z DM-ów
    Object.keys(exportsData.dms).forEach(date => allDates.add(date));
    
    // Zbierz wszystkie daty z serwerów
    Object.values(exportsData.servers).forEach(server => {
        Object.keys(server).forEach(date => allDates.add(date));
    });
    
    // Posortuj daty (najnowsze pierwsze)
    const sortedDates = Array.from(allDates).sort().reverse();
    
    sortedDates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = date;
        select.appendChild(option);
    });
}

function loadContentForDate(date) {
    loadDMsForDate(date);
    loadServersForDate(date);
}

function loadDMsForDate(date) {
    const dmList = document.getElementById('dm-list');
    dmList.innerHTML = '';
    
    if (!exportsData.dms[date]) {
        dmList.innerHTML = '<div class="no-data">Brak konwersacji dla tej daty</div>';
        return;
    }
    
    exportsData.dms[date].forEach(dm => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="avatar">${getInitials(dm.display_name)}</div>
            <div class="name">${dm.display_name}</div>
        `;
        item.addEventListener('click', () => {
            // Bezpośrednie przekierowanie do pliku HTML
            window.location.href = dm.file_path;
        });
        dmList.appendChild(item);
    });
}

function loadServersForDate(date) {
    const serverList = document.getElementById('server-list');
    serverList.innerHTML = '';
    
    let hasServers = false;
    
    Object.entries(exportsData.servers).forEach(([serverName, serverDates]) => {
        if (serverDates[date]) {
            hasServers = true;
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <div class="server-icon">${getInitials(serverName)}</div>
                <div class="name">${serverName}</div>
            `;
            item.addEventListener('click', () => {
                loadChannelsForServer(date, serverName);
            });
            serverList.appendChild(item);
        }
    });
    
    if (!hasServers) {
        serverList.innerHTML = '<div class="no-data">Brak serwerów dla tej daty</div>';
    }
}

function loadChannelsForServer(date, serverName) {
    const channelList = document.getElementById('channel-list').querySelector('.list-container');
    channelList.innerHTML = '';
    
    if (!exportsData.servers[serverName] || !exportsData.servers[serverName][date]) {
        channelList.innerHTML = '<div class="no-data">Brak kanałów dla tego serwera</div>';
        return;
    }
    
    exportsData.servers[serverName][date].forEach(channel => {
        const item = document.createElement('div');
        item.className = 'list-item channel';
        item.innerHTML = `
            <div class="channel-icon">#</div>
            <div class="name">${channel.channel_name}</div>
        `;
        item.addEventListener('click', () => {
            // Bezpośrednie przekierowanie do pliku HTML
            window.location.href = channel.file_path;
        });
        channelList.appendChild(item);
    });
    
    document.getElementById('channel-list').style.display = 'block';
}

function getInitials(name) {
    return name.split(' ')
        .filter(part => part.length > 0)
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}