const form = document.forms[0];
const currentTasksBlock = document.getElementById('currentTasks');
const completedTasksBlock = document.getElementById('completedTasks');
const currentTasksTitle = document.getElementById('todo-title');
const completedTasksTitle = document.getElementById('completed-title');
const inputTitle = document.getElementById('inputTitle');
const inputText = document.getElementById('inputText');
const modalLabelText = document.getElementById('exampleModalLabel');
const submitButton = document.getElementById('submitButton');
const closeFormIcon = document.getElementById('closeIcon');
const closeFormButton = document.getElementById('close');
const increaseSort = document.getElementById('sort-growth');
const decreaseSort = document.getElementById('sort-wane');
const modal = document.getElementById('exampleModal');
const toggleTheme = document.getElementById('toggle-theme');
const body = document.body;
let modalEditMode = false;
let editTaskId = '';


const LocalStorageKeys = {
    tasks: 'tasks',
    sort: 'sort',
    darkMode: 'darkMode'
};

const KeysVariables = {
    dark: 'dark',
    transition: 'transition',
    addTask: 'Add task',
    editTask: 'Edit task',
    save: 'Save Changes',
    editBtn: 'btn-info',
    changeStatusBtn: 'btn-success',
    yellowFont: 'bg-warning',
    greenFont: 'bg-success',
    redFont: 'bg-danger',
    lowPriority: 'Low',
    mediumPriority: 'Medium'
};

let sortUp = JSON.parse(localStorage.getItem(LocalStorageKeys.sort));
let allTasks = JSON.parse(localStorage.getItem(LocalStorageKeys.tasks)) || [];

function updateLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getTasksCount() {
    const current = allTasks.filter(task => !task.isDone).length;
    const completed = allTasks.length - current;
    return {current, completed};
}

function getTaskClassName(priority) {
    if (priority === KeysVariables.lowPriority) {
        return KeysVariables.greenFont;
    } else if (priority === KeysVariables.mediumPriority) {
        return KeysVariables.yellowFont;
    } else {
        return KeysVariables.redFont;
    }
}

function addTaskLayout(task) {
    const taskLayout = document.createElement('li');
    const time = getTimeValues(task.time);
    taskLayout.className = `list-group-item d-flex w-100 mb-2 ${getTaskClassName(task.priority)}`;
    taskLayout.innerHTML = `<div class="w-100 mr-2">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${task.title}</h5>
                    <div>
                        <small class="mr-2">${task.priority} priority</small>
                        <small>${time.timeString} ${time.dateString}</small>
                    </div>
                </div>
                <p class="mb-1 w-100">${task.text}</p>
            </div>
            <div class="dropdown m-2 dropleft">
                <button class="btn btn-secondary h-100" type="button" id="dropdownMenuItem1"
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" >
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu p-2 flex-column" aria-labelledby="dropdownMenuItem1" id="${task.id}">
                    ${!task.isDone ? `<button type="button" class="btn btn-success w-100">Complete</button>
    <button type="button" class="btn btn-info w-100 my-2" data-toggle="modal" data-target="#exampleModal">Edit</button>`
        : `<button type="button" class="btn btn-success w-100 mb-2">Uncomplete</button>`}
                    <button type="button" class="btn btn-danger w-100">Delete</button>
                </div>
            </div>`;
    if (sortUp) {
        task.isDone ? completedTasksBlock.append(taskLayout) : currentTasksBlock.append(taskLayout);
    } else {
        task.isDone ? completedTasksBlock.prepend(taskLayout) : currentTasksBlock.prepend(taskLayout);
    }
}

function renderApp() {
    currentTasksBlock.innerHTML = null;
    completedTasksBlock.innerHTML = null;
    allTasks.map(task => addTaskLayout(task));
    const tasksCount = getTasksCount();
    currentTasksTitle.textContent = `ToDo (${tasksCount.current})`;
    completedTasksTitle.textContent = `Completed (${tasksCount.completed})`;
}

function removeTask(taskId) {
    const copyTasks = allTasks.filter(task => task.id !== taskId);
    updateLocalStorage(LocalStorageKeys.tasks, copyTasks);
    allTasks = copyTasks;
    renderApp();
}

function changeTaskStatus(taskId) {
    const copyTasks = allTasks.map(task => task.id === taskId ? {...task, isDone: !task.isDone} : task);
    updateLocalStorage(LocalStorageKeys.tasks, copyTasks);
    allTasks = copyTasks;
    renderApp();
}

function showEditModal(taskId) {
    const task = allTasks.find(task => task.id === taskId);
    modalLabelText.textContent = KeysVariables.editTask;
    submitButton.textContent = KeysVariables.save;
    inputTitle.value = task.title;
    inputText.value = task.text;
    form.elements[task.priority].checked = true;
    editTaskId = taskId;
    modalEditMode = true;
}


function tasksBlockListener({target}) {
    const dropDownMenu = target.closest('.dropdown-menu');
    if (dropDownMenu) {
        const taskId = dropDownMenu.getAttribute('id');
        if (target.classList.contains(KeysVariables.editBtn)) {
            showEditModal(taskId);
        } else if (target.classList.contains(KeysVariables.changeStatusBtn)) {
            changeTaskStatus(taskId);
        } else {
            removeTask(taskId);
        }
    }
}

currentTasksBlock.addEventListener('click', tasksBlockListener);
completedTasksBlock.addEventListener('click', tasksBlockListener);

function closeModal() {
    modalLabelText.textContent = KeysVariables.addTask;
    submitButton.textContent = KeysVariables.addTask;
    form.querySelectorAll('.form-check-input')[1].checked = true;
    inputTitle.value = '';
    inputText.value = '';
    modalEditMode = false;
}

function getSelectedPriority() {
    form.querySelectorAll('.form-check-input').forEach((checkbox) => {
        if (checkbox.checked) {
            return checkbox.value;
        }
    })
    return null;
}

function editTask() {
    const task = allTasks.find(task => task.id === editTaskId);
    task.priority = getSelectedPriority();
    task.title = inputTitle.value;
    task.text = inputText.value;
}

function getTimeValues(time) {
    const date = new Date(time);
    const timeString = date.toTimeString().split('').splice(0, 5).join('');
    const dateString = date.toLocaleDateString();
    return {timeString, dateString};
}

function addTask() {
    const taskData = {};
    taskData.priority = getSelectedPriority();
    taskData.title = inputTitle.value;
    taskData.text = inputText.value;
    taskData.id = generateId();
    taskData.isDone = false;
    taskData.time = new Date().getTime();
    allTasks.push(taskData);
}

function formSubmitListener(event) {
    event.preventDefault();
    if (modalEditMode) {
        editTask();
    } else {
        addTask();
    }
    closeFormButton.click();
    updateLocalStorage(LocalStorageKeys.tasks, allTasks);
    renderApp();
    closeModal();
}

form.addEventListener('submit', formSubmitListener);

modal.addEventListener('click', ({target}) => {
    if (!target.closest('.modal-content')) {
        closeModal();
    }
});
closeFormButton.addEventListener('click', closeModal);
closeFormIcon.addEventListener('click', closeModal);


function generateId() {
    return Math.random().toString(36).slice(2);
}


function sortListener(sort) {
    if (sortUp !== sort) {
        sortUp = sort;
        renderApp();
        updateLocalStorage(LocalStorageKeys.sort, sortUp);
    }
}

increaseSort.addEventListener('click', () => sortListener(true));
decreaseSort.addEventListener('click', () => sortListener(false));


toggleTheme.addEventListener('click', () => {
    body.classList.toggle(KeysVariables.dark);
    updateLocalStorage(LocalStorageKeys.darkMode, body.classList.contains(KeysVariables.dark));
});
if (JSON.parse(localStorage.getItem(LocalStorageKeys.darkMode))) {
    body.classList.add(KeysVariables.dark);
}
document.addEventListener("DOMContentLoaded", () => {
    body.classList.add(KeysVariables.transition);
})

renderApp();