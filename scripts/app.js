class StyleSphere {
    constructor() {
        this.init();
        this.loadData();
        this.registerServiceWorker();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.createWeeklyLayout();
        this.renderCloset();
    }

    cacheDOM() {
        this.appContainer = document.querySelector('.app-container');
        this.toastContainer = document.getElementById('toast-container');
    }

    bindEvents() {
        document.addEventListener('dragover', this.handleDragOver);
        document.addEventListener('drop', this.handleDrop);
        // Add more event listeners as needed
    }

    createWeeklyLayout() {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const weekGrid = document.createElement('div');
        weekGrid.className = 'week-grid';
        
        days.forEach(day => {
            const dayCard = this.createDayCard(day);
            weekGrid.appendChild(dayCard);
        });
        
        this.appContainer.appendChild(weekGrid);
    }

    createDayCard(day) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${day}</h3>
            ${this.createDropZone('Top', 'top')}
            ${this.createDropZone('Bottom', 'bottom')}
            ${this.createDropZone('Dress', 'dress')}
            ${this.createDropZone('Shoes', 'shoes')}
        `;
        return card;
    }

    createDropZone(label, category) {
        return `
            <div class="drop-zone" 
                 data-category="${category}"
                 data-label="${label}"
                 ondragover="event.preventDefault()"
                 ondrop="this.handleDrop(event)">
            </div>
        `;
    }

    handleDragStart(event) {
        event.dataTransfer.setData('text/plain', JSON.stringify({
            id: event.target.dataset.id,
            type: event.target.dataset.type
        }));
        event.currentTarget.style.opacity = '0.5';
    }

    handleDrop(event) {
        event.preventDefault();
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        const dropZone = event.target.closest('.drop-zone');
        
        if (dropZone && data.type === dropZone.dataset.category) {
            this.updateOutfitDisplay(dropZone, data.id);
            this.showToast('Outfit updated!', 'success');
        }
    }

    async loadData() {
        try {
            const response = await fetch('/data/closet.json');
            this.closetData = await response.json();
            this.renderCloset();
        } catch (error) {
            this.showToast('Failed to load closet data', 'error');
        }
    }

    renderCloset() {
        const closetSection = document.createElement('div');
        closetSection.className = 'closet-sidebar card';
        closetSection.innerHTML = `
            <h2>My Digital Closet</h2>
            <div class="closet-grid">
                ${this.closetData.map(item => this.createClosetItem(item)).join('')}
            </div>
        `;
        this.appContainer.prepend(closetSection);
    }

    createClosetItem(item) {
        return `
            <div class="closet-item" 
                 draggable="true"
                 data-id="${item.id}"
                 data-type="${item.category}"
                 ondragstart="this.handleDragStart(event)">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-meta">${item.name}</div>
            </div>
        `;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        this.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new StyleSphere();
});
