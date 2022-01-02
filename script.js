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

let modalEditMode = false;
let editTaskId = '';
let allTasks;
let sortUp;

JSON.parse(localStorage.getItem('sort')) ? sortUp = true : sortUp = false;
JSON.parse(localStorage.getItem('tasks'))
    ? allTasks = JSON.parse(localStorage.getItem('tasks'))
    : allTasks = [];

function renderApp() {
    currentTasksBlock.innerHTML = null;
    completedTasksBlock.innerHTML = null;
    allTasks.map(task => addTaskLayout(task));
    const tasksCount = getTasksCount();
    currentTasksTitle.textContent = `ToDo (${tasksCount.current})`;
    completedTasksTitle.textContent = `Completed (${tasksCount.completed})`;
}


function updateLocalStorageTasks() {
    localStorage.setItem('tasks', JSON.stringify(allTasks));
}


function getTaskClassName(priority) {
    if (priority === 'Low') {
        return 'bg-success';
    } else if (priority === 'Medium') {
        return 'bg-warning';
    } else {
        return 'bg-danger';
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

function removeTask(taskId) {
    allTasks = allTasks.filter(task => task.id !== taskId);
    updateLocalStorageTasks();
    renderApp();
}

function changeTaskStatus(taskId) {
    allTasks = allTasks.map(task => task.id === taskId ? {...task, isDone: !task.isDone} : task);
    updateLocalStorageTasks();
    renderApp();
}

function showEditModal(taskId) {
    const task = allTasks.find(task => task.id === taskId);
    modalLabelText.textContent = 'Edit task';
    submitButton.textContent = 'Save changes';
    inputTitle.value = task.title;
    inputText.value = task.text;
    document.getElementById(`${task.priority}`).checked = true;
    editTaskId = taskId;
    modalEditMode = true;
}


function tasksBlockListener({target}) {
    const dropDownMenu = target.closest('.dropdown-menu');
    if (dropDownMenu) {
        const taskId = dropDownMenu.getAttribute('id');
        if (target.classList.contains('btn-info')) {
            showEditModal(taskId);
        } else if (target.classList.contains('btn-success')) {
            changeTaskStatus(taskId);
        } else {
            removeTask(taskId);
        }
    }
}

currentTasksBlock.addEventListener('click', tasksBlockListener);
completedTasksBlock.addEventListener('click', tasksBlockListener);

function closeModal() {
    modalLabelText.textContent = 'Add task';
    submitButton.textContent = 'Add task';
    form.querySelectorAll('.form-check-input')[1].checked = true;
    inputTitle.value = '';
    inputText.value = '';
    modalEditMode = false;
}

function editTask() {
    const task = allTasks.find(task => task.id === editTaskId);
    form.querySelectorAll('.form-check-input').forEach((checkbox) => {
        if (checkbox.checked) {
            task.priority = checkbox.value;
        }
    })
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
    form.querySelectorAll('.form-check-input').forEach((checkbox) => {
        if (checkbox.checked) {
            taskData.priority = checkbox.value;
        }
    })
    taskData.title = inputTitle.value;
    taskData.text = inputText.value;
    taskData.id = generateId();
    taskData.isDone = false;
    taskData.time = new Date().getTime();
    allTasks.push(taskData);
    updateLocalStorageTasks();
    renderApp();
}

function formSubmitListener(event) {
    event.preventDefault();
    if (modalEditMode) {
        editTask();
        renderApp();
    } else {
        addTask();
    }
    closeFormButton.click();
    updateLocalStorageTasks();
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

function getTasksCount() {
    const current = allTasks.filter(task => !task.isDone).length;
    const completed = allTasks.length - current;
    return {current, completed};
}

function sortListener(sort) {
    if (sortUp !== sort) {
        sortUp = sort;
        renderApp();
        localStorage.setItem('sort', JSON.stringify(sortUp));
    }
}

increaseSort.addEventListener('click', () => sortListener(true));
decreaseSort.addEventListener('click', () => sortListener(false));


const body = document.body;
const toggleTheme = document.getElementById('toggle-theme');
toggleTheme.addEventListener('click', () => {
    body.classList.toggle('dark')
    localStorage.setItem('darkMode', JSON.stringify(body.classList.contains('dark')));
});
if (JSON.parse(localStorage.getItem('darkMode'))) {
    body.classList.add('dark');
}
document.addEventListener("DOMContentLoaded", () => {
    body.classList.add('transition')
})

renderApp();