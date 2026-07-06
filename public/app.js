document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // DOM Elements
    const tableBody = document.getElementById('tableBody');
    const addBtn = document.getElementById('addBtn');
    const modal = document.getElementById('itemModal');
    const closeBtn = document.querySelector('.close');
    const itemForm = document.getElementById('itemForm');
    const modalTitle = document.getElementById('modalTitle');
    const searchBtn = document.getElementById('search-btn');
    const resetSearchBtn = document.getElementById('reset-search');
    const searchNameInput = document.getElementById('search-name');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');

    if (!searchBtn || !tableBody) {
        console.error("Critical elements missing!");
        return;
    }

    // State
    let isEditMode = false;
    let currentItemId = null;

    // ======================
    // EVENT LISTENERS
    // ======================

    // Add Button Click
    addBtn.addEventListener('click', () => {
        isEditMode = false;
        currentItemId = null;
        modalTitle.textContent = 'Add New Item';
        itemForm.reset();
        showModal();
    });

    // Close Modal
    closeBtn.addEventListener('click', hideModal);

    // Form Submission
    itemForm.addEventListener('submit', handleFormSubmit);

    // Search Button
    searchBtn.addEventListener('click', handleSearch);

    // Reset Search
    resetSearchBtn.addEventListener('click', resetSearch);

    // ======================
    // CORE FUNCTIONS
    // ======================

    // Show modal with smooth scroll
    function showModal() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        modal.scrollTop = 0;
    }

    // Hide modal
    function hideModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Load items from server
    async function loadItems() {
        try {
            const response = await fetch('http://localhost:5000/api/items');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const items = await response.json();
            renderItems(items);
        } catch (error) {
            console.error("Failed to load items:", error);
        }
    }

    // Handle form submission
    async function handleFormSubmit(e) {
        e.preventDefault();
        const formData = {
            name: document.getElementById('name').value.trim(),
            description: document.getElementById('description').value.trim(),
            quantity: parseInt(document.getElementById('quantity').value),
            price: parseFloat(document.getElementById('price').value)
        };

        try {
            const url = isEditMode 
                ? `http://localhost:5000/api/items/${currentItemId}`
                : 'http://localhost:5000/api/items';
            
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            hideModal();
            loadItems();
        } catch (error) {
            console.error("Save failed:", error);
            alert("Error saving item. Check console for details.");
        }
    }

    // Handle search  // URLSearchParams my class for query params
    async function handleSearch() {
        const nameQuery = searchNameInput.value.trim();
        const minPrice = minPriceInput.value;
        const maxPrice = maxPriceInput.value;

        // Build query parameters
        const params = new URLSearchParams();
        if (nameQuery) params.append('name', nameQuery);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);

        try {
            const response = await fetch(`http://localhost:5000/api/items/search?${params.toString()}`);
            if (!response.ok) throw new Error('Search failed');
            const items = await response.json();
            renderItems(items);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    // Reset search
    function resetSearch() {
        searchNameInput.value = '';
        minPriceInput.value = '';
        maxPriceInput.value = '';
        loadItems();
    }

    // Render items to table
    function renderItems(items) {
        if (!tableBody) {
            console.error("Table body element not found!");
            return;
        }

        tableBody.innerHTML = items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.description || '-'}</td>    // my fallback value - instead of null this will show
                <td>${item.quantity}</td>
                <td>$${item.price?.toFixed(2)}</td>
                <td>
                    <button class="edit-btn" data-id="${item._id}">Edit</button>
                    <button class="delete-btn" data-id="${item._id}">Delete</button>
                </td>
            </tr>
        `).join('');

        // Add event listeners to buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editItem(btn.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteItem(btn.dataset.id));
        });
    }

    // Edit item
    async function editItem(id) {
        try {
            const response = await fetch(`http://localhost:5000/api/items/${id}`);
            if (!response.ok) throw new Error('Failed to fetch item');
            
            const item = await response.json();
            
            isEditMode = true;
            currentItemId = id;
            modalTitle.textContent = 'Edit Item';
            
            // Populate form
            document.getElementById('name').value = item.name;
            document.getElementById('description').value = item.description || '';
            document.getElementById('quantity').value = item.quantity;
            document.getElementById('price').value = item.price;
            
            showModal();
        } catch (error) {
            console.error("Edit failed:", error);
        }
    }

    // Delete item
    async function deleteItem(id) {
        if (!confirm('Are you sure you want to delete this item?')) return;
        
        try {
            const response = await fetch(`http://localhost:5000/api/items/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Delete failed');
            loadItems();
        } catch (error) {
            console.error("Delete error:", error);
        }
    }

    // Initial load
    loadItems();
});
