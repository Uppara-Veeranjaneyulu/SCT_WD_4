// Application State
        let lists = [];
        let tasks = [];
        let currentFilter = { status: 'all', sort: 'recent' };
        let editingItemId = null;
        let editingType = null;
        let currentListId = null;

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            initializeTheme();
            loadData();
            updateStats();
            renderContent();
            setupEventListeners();
        });

        function setupEventListeners() {
            document.getElementById('listForm').addEventListener('submit', handleListSubmit);
            document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.dropdown')) {
                    closeAllDropdowns();
                }
            });
        }

        // List Management
        function addList(listData) {
            const list = {
                id: Date.now().toString(),
                name: listData.name,
                description: listData.description,
                color: listData.color,
                createdAt: new Date().toISOString(),
                expanded: false
            };
            lists.unshift(list);
            saveData();
            updateStats();
            renderContent();
            updateTaskListDropdown();
        }

        function editList(id, listData) {
            const listIndex = lists.findIndex(list => list.id === id);
            if (listIndex !== -1) {
                lists[listIndex] = { ...lists[listIndex], ...listData };
                saveData();
                renderContent();
                updateTaskListDropdown();
            }
        }

        function deleteList(id) {
            if (confirm('Are you sure you want to delete this list and all its tasks?')) {
                // Remove list
                lists = lists.filter(list => list.id !== id);
                // Remove all tasks in this list
                tasks = tasks.filter(task => task.listId !== id);
                saveData();
                updateStats();
                renderContent();
                updateTaskListDropdown();
            }
        }

        function toggleList(id) {
            const list = lists.find(list => list.id === id);
            if (list) {
                list.expanded = !list.expanded;
                renderContent();
            }
        }

        // Task Management
        function addTask(taskData) {
            const task = {
                id: Date.now().toString(),
                listId: taskData.listId,
                title: taskData.title,
                description: taskData.description,
                date: taskData.date,
                time: taskData.time,
                priority: taskData.priority,
                completed: false,
                createdAt: new Date().toISOString()
            };
            tasks.unshift(task);
            saveData();
            updateStats();
            renderContent();
        }

        function editTask(id, taskData) {
            const taskIndex = tasks.findIndex(task => task.id === id);
            if (taskIndex !== -1) {
                tasks[taskIndex] = { ...tasks[taskIndex], ...taskData };
                saveData();
                updateStats();
                renderContent();
            }
        }

        function deleteTask(id) {
            if (confirm('Are you sure you want to delete this task?')) {
                tasks = tasks.filter(task => task.id !== id);
                saveData();
                updateStats();
                renderContent();
            }
        }

        function toggleTask(id) {
            const task = tasks.find(task => task.id === id);
            if (task) {
                task.completed = !task.completed;
                saveData();
                updateStats();
                renderContent();
            }
        }

        // Modal Management
        function openModal(type, itemId = null, listId = null) {
            if (type === 'list') {
                const modal = document.getElementById('listModal');
                const modalTitle = document.getElementById('listModalTitle');
                const saveBtn = document.getElementById('saveListBtn');
                
                if (itemId) {
                    modalTitle.textContent = 'Edit List';
                    saveBtn.textContent = 'Update List';
                    loadListToForm(itemId);
                    editingItemId = itemId;
                } else {
                    modalTitle.textContent = 'Create New List';
                    saveBtn.textContent = 'Create List';
                    clearForm('list');
                    editingItemId = null;
                }
                editingType = 'list';
                modal.classList.add('active');
            } else if (type === 'task') {
                const modal = document.getElementById('taskModal');
                const modalTitle = document.getElementById('taskModalTitle');
                const saveBtn = document.getElementById('saveTaskBtn');
                
                updateTaskListDropdown();
                
                if (itemId) {
                    modalTitle.textContent = 'Edit Task';
                    saveBtn.textContent = 'Update Task';
                    loadTaskToForm(itemId);
                    editingItemId = itemId;
                } else {
                    modalTitle.textContent = 'Add New Task';
                    saveBtn.textContent = 'Add Task';
                    clearForm('task');
                    editingItemId = null;
                    
                    // Pre-select list if provided
                    if (listId) {
                        document.getElementById('taskList').value = listId;
                        currentListId = listId;
                    }
                }
                editingType = 'task';
                modal.classList.add('active');
            }
        }

        function closeModal(type) {
            const modal = document.getElementById(type + 'Modal');
            modal.classList.remove('active');
            clearForm(type);
            editingItemId = null;
            editingType = null;
            currentListId = null;
        }

        function clearForm(type) {
            document.getElementById(type + 'Form').reset();
        }

        function loadListToForm(listId) {
            const list = lists.find(l => l.id === listId);
            if (list) {
                document.getElementById('listName').value = list.name;
                document.getElementById('listDescription').value = list.description || '';
                document.getElementById('listColor').value = list.color;
            }
        }

        function loadTaskToForm(taskId) {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                document.getElementById('taskList').value = task.listId;
                document.getElementById('taskTitle').value = task.title;
                document.getElementById('taskDescription').value = task.description || '';
                document.getElementById('taskDate').value = task.date || '';
                document.getElementById('taskTime').value = task.time || '';
                document.getElementById('taskPriority').value = task.priority;
            }
        }

        function updateTaskListDropdown() {
            const select = document.getElementById('taskList');
            select.innerHTML = '<option value="">Choose a list...</option>';
            
            lists.forEach(list => {
                const option = document.createElement('option');
                option.value = list.id;
                option.textContent = list.name;
                select.appendChild(option);
            });
        }

        function handleListSubmit(e) {
            e.preventDefault();
            
            const listData = {
                name: document.getElementById('listName').value,
                description: document.getElementById('listDescription').value,
                color: document.getElementById('listColor').value
            };

            if (editingItemId) {
                editList(editingItemId, listData);
            } else {
                addList(listData);
            }
            
            closeModal('list');
        }

        function handleTaskSubmit(e) {
            e.preventDefault();
            
            const taskData = {
                listId: document.getElementById('taskList').value,
                title: document.getElementById('taskTitle').value,
                description: document.getElementById('taskDescription').value,
                date: document.getElementById('taskDate').value,
                time: document.getElementById('taskTime').value,
                priority: document.getElementById('taskPriority').value
            };

            if (editingItemId) {
                editTask(editingItemId, taskData);
            } else {
                addTask(taskData);
            }
            
            closeModal('task');
        }

        // Filtering and Sorting
        function filterContent() {
            renderContent();
        }

        function getFilteredTasks() {
            let filteredTasks = [...tasks];
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();

            // Apply search filter
            if (searchTerm) {
                filteredTasks = filteredTasks.filter(task => 
                    task.title.toLowerCase().includes(searchTerm) ||
                    (task.description && task.description.toLowerCase().includes(searchTerm))
                );
            }

            // Apply status filter
            if (currentFilter.status === 'pending') {
                filteredTasks = filteredTasks.filter(task => !task.completed);
            } else if (currentFilter.status === 'completed') {
                filteredTasks = filteredTasks.filter(task => task.completed);
            }

            // Apply sorting
            filteredTasks.sort((a, b) => {
                switch (currentFilter.sort) {
                    case 'date':
                        if (!a.date && !b.date) return 0;
                        if (!a.date) return 1;
                        if (!b.date) return -1;
                        return new Date(a.date) - new Date(b.date);
                    case 'priority':
                        const priorityOrder = { high: 3, medium: 2, low: 1 };
                        return priorityOrder[b.priority] - priorityOrder[a.priority];
                    case 'alphabetical':
                        return a.title.localeCompare(b.title);
                    default: // recent
                        return new Date(b.createdAt) - new Date(a.createdAt);
                }
            });

            return filteredTasks;
        }

        function getFilteredLists() {
            let filteredLists = [...lists];
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();

            if (searchTerm) {
                filteredLists = filteredLists.filter(list => 
                    list.name.toLowerCase().includes(searchTerm) ||
                    (list.description && list.description.toLowerCase().includes(searchTerm))
                );
            }

            return filteredLists;
        }

        // Dropdown Management
        function toggleDropdown(dropdownId) {
            const dropdown = document.getElementById(dropdownId);
            const isActive = dropdown.classList.contains('active');
            
            closeAllDropdowns();
            
            if (!isActive) {
                dropdown.classList.add('active');
            }
        }

        function closeAllDropdowns() {
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }

        function setFilter(type, value, text) {
            currentFilter[type] = value;
            
            if (type === 'status') {
                document.getElementById('statusFilterText').textContent = text;
                document.querySelectorAll('#statusFilter .dropdown-item').forEach(item => {
                    item.classList.remove('active');
                });
                event.target.classList.add('active');
            } else if (type === 'sort') {
                document.getElementById('sortFilterText').textContent = text;
                document.querySelectorAll('#sortFilter .dropdown-item').forEach(item => {
                    item.classList.remove('active');
                });
                event.target.classList.add('active');
            }
            
            closeAllDropdowns();
            renderContent();
        }

        // Rendering
        function renderContent() {
            const listsContainer = document.getElementById('listsContainer');
            const emptyState = document.getElementById('emptyState');
            const filteredLists = getFilteredLists();
            const filteredTasks = getFilteredTasks();

            if (filteredLists.length === 0) {
                listsContainer.style.display = 'none';
                emptyState.style.display = 'block';
                
                if (lists.length === 0) {
                    emptyState.innerHTML = `
                        <div class="empty-icon">
                            <i class="fas fa-folder-open"></i>
                        </div>
                        <div class="empty-message">No lists yet. Create your first list to get started!</div>
                        <div class="empty-submessage">Click "New List" to create your first list</div>
                    `;
                } else {
                    emptyState.innerHTML = `
                        <div class="empty-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <div class="empty-message">No lists match your search</div>
                        <div class="empty-submessage">Try adjusting your search terms</div>
                    `;
                }
            } else {
                listsContainer.style.display = 'grid';
                emptyState.style.display = 'none';
                
                listsContainer.innerHTML = filteredLists.map(list => {
                    const listTasks = filteredTasks.filter(task => task.listId === list.id);
                    const completedCount = listTasks.filter(task => task.completed).length;
                    const totalCount = listTasks.length;
                    
                    return `
                        <div class="list-item fade-in" data-list-id="${list.id}">
                            <div class="list-header" onclick="toggleList('${list.id}')">
                                <div class="list-info">
                                    <div class="list-icon" style="background: linear-gradient(135deg, ${list.color} 0%, ${adjustColor(list.color, -20)} 100%)">
                                        <i class="fas fa-folder"></i>
                                    </div>
                                    <div class="list-details">
                                        <h3>${escapeHtml(list.name)}</h3>
                                        <div class="list-stats">
                                            <span><i class="fas fa-tasks"></i> ${totalCount} tasks</span>
                                            <span><i class="fas fa-check-circle"></i> ${completedCount} completed</span>
                                            <span><i class="fas fa-clock"></i> ${formatDateTime(list.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="list-actions">
                                    <button class="task-btn edit" onclick="event.stopPropagation(); openModal('list', '${list.id}')" title="Edit List">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="task-btn delete" onclick="event.stopPropagation(); deleteList('${list.id}')" title="Delete List">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    <button class="expand-btn ${list.expanded ? 'expanded' : ''}" title="${list.expanded ? 'Collapse' : 'Expand'}">
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="list-content ${list.expanded ? 'expanded' : ''}">
                                <div class="add-task-btn" onclick="openModal('task', null, '${list.id}')">
                                    <i class="fas fa-plus"></i>
                                    Add Task to ${escapeHtml(list.name)}
                                </div>
                                <div class="tasks-list">
                                    ${listTasks.map(task => `
                                        <div class="task-item ${task.completed ? 'completed' : ''} priority-${task.priority}" data-task-id="${task.id}">
                                            <div class="task-checkbox ${task.completed ? 'completed' : ''}" onclick="toggleTask('${task.id}')">
                                                ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                                            </div>
                                            <div class="task-content">
                                                <div class="task-title">${escapeHtml(task.title)}</div>
                                                <div class="task-meta">
                                                    ${task.date ? `<span><i class="fas fa-calendar"></i> ${formatDate(task.date)}</span>` : ''}
                                                    ${task.time ? `<span><i class="fas fa-clock"></i> ${task.time}</span>` : ''}
                                                    <span><i class="fas fa-flag"></i> ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                                                </div>
                                                ${task.description ? `<div class="task-description" style="margin-top: 4px; font-size: 12px; color: #aaa;">${escapeHtml(task.description)}</div>` : ''}
                                            </div>
                                            <div class="task-actions">
                                                <button class="task-btn edit" onclick="openModal('task', '${task.id}')" title="Edit Task">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="task-btn delete" onclick="deleteTask('${task.id}')" title="Delete Task">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        function updateStats() {
            const totalTasks = tasks.length;
            const pendingTasks = tasks.filter(task => !task.completed).length;
            const completedTasks = tasks.filter(task => task.completed).length;

            document.getElementById('totalTasks').textContent = totalTasks;
            document.getElementById('pendingTasks').textContent = pendingTasks;
            document.getElementById('completedTasks').textContent = completedTasks;
        }

        // Utility Functions
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            if (date.toDateString() === today.toDateString()) {
                return 'Today';
            } else if (date.toDateString() === tomorrow.toDateString()) {
                return 'Tomorrow';
            } else {
                return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
                });
            }
        }

        function formatDateTime(dateTimeString) {
            const date = new Date(dateTimeString);
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function adjustColor(color, amount) {
            const usePound = color[0] === '#';
            const col = usePound ? color.slice(1) : color;
            
            const num = parseInt(col, 16);
            let r = (num >> 16) + amount;
            let g = (num >> 8 & 0x00FF) + amount;
            let b = (num & 0x0000FF) + amount;
            
            r = r > 255 ? 255 : r < 0 ? 0 : r;
            g = g > 255 ? 255 : g < 0 ? 0 : g;
            b = b > 255 ? 255 : b < 0 ? 0 : b;
            
            return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
        }

        // Storage Functions
        function saveData() {
            // In a real application, this would save to localStorage or an API
            console.log('Data saved:', { lists, tasks });
        }

        function loadData() {
            // Sample data for demonstration
            lists = [
                {
                    id: '1',
                    name: 'School',
                    description: 'Academic tasks and assignments',
                    color: '#667eea',
                    createdAt: new Date().toISOString(),
                    expanded: true
                },
                {
                    id: '2',
                    name: 'Personal',
                    description: 'Personal goals and tasks',
                    color: '#27ae60',
                    createdAt: new Date().toISOString(),
                    expanded: false
                }
            ];

            tasks = [
                {
                    id: '1',
                    listId: '1',
                    title: 'Write notes for Chemistry',
                    description: 'Complete chapter 5 notes on organic compounds',
                    date: '2025-07-28',
                    time: '14:00',
                    priority: 'high',
                    completed: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    listId: '1',
                    title: 'Math homework',
                    description: 'Solve exercises 1-15 from algebra textbook',
                    date: '2025-07-27',
                    time: '16:30',
                    priority: 'medium',
                    completed: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: '3',
                    listId: '2',
                    title: 'Morning exercise',
                    description: '30 minutes cardio workout',
                    date: '2025-07-26',
                    time: '07:00',
                    priority: 'low',
                    completed: true,
                    createdAt: new Date().toISOString()
                }
            ];
        }

        // Theme Management
        function handleThemeToggle() {
            const toggle = document.getElementById('themeToggle');
            const body = document.body;
            
            if (toggle.checked) {
                body.classList.remove('light-theme');
            } else {
                body.classList.add('light-theme');
            }
        }

        function toggleTheme() {
            const toggle = document.getElementById('themeToggle');
            toggle.checked = !toggle.checked;
            handleThemeToggle();
        }

        function initializeTheme() {
            const savedTheme = 'dark';
            const toggle = document.getElementById('themeToggle');
            
            if (savedTheme === 'light') {
                toggle.checked = false;
                document.body.classList.add('light-theme');
            } else {
                toggle.checked = true;
                document.body.classList.remove('light-theme');
            }
        }

        // Keyboard Shortcuts
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                openModal('task');
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                openModal('list');
            }
            
            if (e.key === 'Escape') {
                closeModal('task');
                closeModal('list');
                closeAllDropdowns();
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }
        });