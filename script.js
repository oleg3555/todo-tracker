const form = document.querySelector('.form');
const currentTasksBlock = document.getElementById('currentTasks');
const completedTasksBlock = document.getElementById('completedTasks');
const currentTasksTitle = document.getElementById('todo-title');
const completedTasksTitle = document.getElementById('completed-title');
const inputTitle = document.getElementById('inputTitle');
const inputText = document.getElementById('inputText');
const modalLabelText = document.getElementById('exampleModalLabel');
const submitButton = document.getElementById('submitButton');
const closeFormButton = document.getElementById('close');
const addTaskButton=document.getElementById('addTaskBtn');
const increaseSort = document.getElementById('sort-growth');
const decreaseSort = document.getElementById('sort-wane');
const toggleTheme = document.getElementById('toggle-theme');
const mediumPriority = form.elements[PRIORITIES.medium];
const body = document.body;
let modalEditMode = false;
let editTaskId = '';

let sortUp = JSON.parse(localStorage.getItem(LocalStorageKeys.sort)) || false;
let allTasks = JSON.parse(localStorage.getItem(LocalStorageKeys.tasks)) || [];

document.addEventListener("DOMContentLoaded", () => {
    if (JSON.parse(localStorage.getItem(LocalStorageKeys.darkMode))) {
        body.classList.add(THEME_CLASSNAMES.dark);
    }
});
toggleTheme.addEventListener('click', () => {
    body.classList.add(THEME_CLASSNAMES.transition);
    body.classList.toggle(THEME_CLASSNAMES.dark);
    updateLocalStorage(LocalStorageKeys.darkMode, body.classList.contains(THEME_CLASSNAMES.dark));
});

function updateLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getTime(date) {
    return date.toTimeString().split('').splice(0, 5).join('');
}

function getDate(date) {
    return date.toLocaleDateString();
}

function generateId() {
    return Math.random().toString(36).slice(2);
}

function getTasksCount() {
    const current = allTasks.filter(task => !task.isDone).length;
    const completed = allTasks.length - current;
    return {current, completed};
}

function getTaskClassName(priority) {
    if (priority === PRIORITIES.low) {
        return TASK_CLASSNAMES.greenFont;
    } else if (priority === PRIORITIES.medium) {
        return TASK_CLASSNAMES.yellowFont;
    } else {
        return TASK_CLASSNAMES.redFont;
    }
}
addTaskButton.addEventListener('click',()=>{
    modalLabelText.textContent = TEXT_VARIABLES.addTask;
    submitButton.textContent = TEXT_VARIABLES.addTask;
    mediumPriority.checked = true;
    inputTitle.value = '';
    inputText.value = '';
    modalEditMode = false;
})
function addTaskLayout(task) {
    const taskLayout = document.createElement('li');
    const time = new Date(task.time);
    taskLayout.className = `list-group-item d-flex w-100 mb-2 ${getTaskClassName(task.priority)}`;
    taskLayout.innerHTML = `<div class="w-100 mr-2">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${task.title}</h5>
                    <div>
                        <small class="mr-2">${task.priority} priority</small>
                        <small>${getTime(time)} ${getDate(time)}</small>
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
    const newTasksList = allTasks.filter(task => task.id !== taskId);
    updateLocalStorage(LocalStorageKeys.tasks, newTasksList);
    allTasks = newTasksList;
    renderApp();
}

function changeTaskStatus(taskId) {
    const updatedTasksList = allTasks.map(task => task.id === taskId ? {...task, isDone: !task.isDone} : task);
    updateLocalStorage(LocalStorageKeys.tasks, updatedTasksList);
    allTasks = updatedTasksList;
    renderApp();
}

function showEditModal(taskId) {
    const task = allTasks.find(task => task.id === taskId);
    modalLabelText.textContent = TEXT_VARIABLES.editTask;
    submitButton.textContent = TEXT_VARIABLES.save;
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
        if (target.classList.contains(BUTTON_CLASSNAMES.editBtn)) {
            showEditModal(taskId);
        } else if (target.classList.contains(BUTTON_CLASSNAMES.changeStatusBtn)) {
            changeTaskStatus(taskId);
        } else {
            removeTask(taskId);
        }
    }
}

currentTasksBlock.addEventListener('click', tasksBlockListener);
completedTasksBlock.addEventListener('click', tasksBlockListener);


function getSelectedPriority() {
    return [...form.querySelectorAll('.form-check-input')].find(item => item.checked).value;
}


function editTask() {
    const task = allTasks.find(task => task.id === editTaskId);
    task.priority = getSelectedPriority();
    task.title = inputTitle.value;
    task.text = inputText.value;
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
}

form.addEventListener('submit', formSubmitListener);



function sortListener(sort) {
    if (sortUp !== sort) {
        sortUp = sort;
        renderApp();
        updateLocalStorage(LocalStorageKeys.sort, sortUp);
    }
}

increaseSort.addEventListener('click', () => sortListener(true));
decreaseSort.addEventListener('click', () => sortListener(false));

renderApp();