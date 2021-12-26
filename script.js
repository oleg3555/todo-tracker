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
const modal=document.getElementById('exampleModal');
let editTaskId = '';
let allTasksData = [];

function renderAllTasks() {
    currentTasksBlock.innerHTML = null;
    completedTasksBlock.innerHTML = null;
    allTasksData.map(task => addTaskLayout(task));
}

function updateData() {
    if (localStorage.length) {
        allTasksData = JSON.parse(localStorage.getItem('data'));
    }
    currentTasksTitle.textContent = `ToDo (${getCountOfCurrentTasks()})`;
    completedTasksTitle.textContent = `Completed (${getCountOfCompletedTasks()})`;
    renderAllTasks();
}

updateData();

function addTaskLayout(task) {
    const taskLayout = document.createElement('li');
    taskLayout.className = 'list-group-item d-flex w-100 mb-2';
    if (task.priority === 'Low') {
        taskLayout.classList.add('bg-success')
    } else if (task.priority === 'Medium') {
        taskLayout.classList.add('bg-warning')
    } else {
        taskLayout.classList.add('bg-danger')
    }
    taskLayout.innerHTML = `<div class="w-100 mr-2">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${task.title}</h5>
                    <div>
                        <small class="mr-2">${task.priority} priority</small>
                        <small>${task.date.timeString} ${task.date.dateString}</small>
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
        : `<button type="button" class="btn btn-success w-100 my-1">Uncomplete</button>`}
                    <button type="button" class="btn btn-danger w-100">Delete</button>
                </div>
            </div>`;
    task.isDone ? completedTasksBlock.appendChild(taskLayout) : currentTasksBlock.appendChild(taskLayout);
}

function removeTask(taskId) {
    allTasksData = allTasksData.filter(task => task.id !== taskId);
    localStorage.setItem('data', JSON.stringify(allTasksData));
    updateData();
}

function changeTaskStatus(taskId) {
    allTasksData = allTasksData.map(task => task.id === taskId ? {...task, isDone: !task.isDone} : task);
    localStorage.setItem('data', JSON.stringify(allTasksData));
    updateData();
}

function tasksBlockListener({target}) {
    const dropDownMenu = target.closest('.dropdown-menu');
    if (dropDownMenu) {
        const taskId = dropDownMenu.getAttribute('id');
        if (target.classList.contains('btn-info')) {
            const task = allTasksData.find(task => task.id === taskId);
            modalLabelText.textContent = 'Edit task';
            submitButton.textContent = 'Save changes';
            inputTitle.value = task.title;
            inputText.value = task.text;
            document.getElementById(`${task.priority}`).checked = true;
            editTaskId = task.id;
        }
        if (target.classList.contains('btn-success')) {
            changeTaskStatus(taskId);
        }
        if (target.classList.contains('btn-danger')) {
            removeTask(taskId);
        }
    }
}

currentTasksBlock.addEventListener('click', tasksBlockListener);
completedTasksBlock.addEventListener('click', tasksBlockListener);

function clearFormValues() {
    modalLabelText.textContent = 'Add task';
    submitButton.textContent = 'Add task';
    form.querySelector('.form-check-input').checked = true;
    inputTitle.value = '';
    inputText.value = '';
    editTaskId = '';
}

closeFormButton.addEventListener('click', clearFormValues);
closeFormIcon.addEventListener('click', clearFormValues);

function generateId() {
    return Math.random().toString(36).slice(2);
}

function editTask(taskId) {
    const task = allTasksData.find(task => task.id === taskId);
    form.querySelectorAll('.form-check-input').forEach((checkbox) => {
        if (checkbox.checked) {
            task.priority = checkbox.value;
        }
    })
    task.title = inputTitle.value;
    task.text = inputText.value;
}

function addTask() {
    const taskData = {};
    const currentDate = new Date();
    form.querySelectorAll('.form-check-input').forEach((checkbox) => {
        if (checkbox.checked) {
            taskData.priority = checkbox.value;
        }
    })
    taskData.title = document.getElementById('inputTitle').value;
    taskData.text = document.getElementById('inputText').value;
    taskData.id = generateId();
    taskData.isDone = false;
    taskData.date = {};
    taskData.date.timeString = currentDate.toTimeString().split('').splice(0, 5).join('');
    taskData.date.dateString = currentDate.toLocaleDateString();
    taskData.sortParametr = currentDate.getTime();
    JSON.parse(localStorage.getItem('sortUpEnabled')) ? allTasksData.unshift(taskData) : allTasksData.push(taskData);
}

function formSubmitListener(event) {
    event.preventDefault();
    editTaskId ? editTask(editTaskId) : addTask();
    closeFormButton.click();
    localStorage.setItem('data', JSON.stringify([...allTasksData]));
    clearFormValues();
    updateData();
}

form.addEventListener('submit', formSubmitListener);

modal.addEventListener('click',({target})=>{
    if(!target.closest('.modal-content')){
        clearFormValues();
    }
});

function getCountOfCurrentTasks() {
    return allTasksData.filter(task => !task.isDone).length;
}

function getCountOfCompletedTasks() {
    return allTasksData.filter(task => task.isDone).length;
}


function sortTasksByDate(tasks) {
    for (let i = 0; i < tasks.length; i++) {
        for (let j = 0; j < tasks.length - i - 1; j++) {
            if (tasks[j].sortParametr > tasks[j + 1].sortParametr) {
                const temp = tasks[j];
                tasks[j] = tasks[j + 1];
                tasks[j + 1] = temp;
            }
        }
    }
}

function sortListener(reversed) {
    sortTasksByDate(allTasksData);
    localStorage.setItem('sortUpEnabled', JSON.stringify(reversed));
    if (reversed) {
        allTasksData.reverse();
    }
    localStorage.setItem('data', JSON.stringify(allTasksData))
    updateData();
}

increaseSort.addEventListener('click', () => sortListener(false));
decreaseSort.addEventListener('click', () => sortListener(true));


const changeThemeButton = document.getElementById('change-theme');
const body = document.querySelector('body');
const navbar = document.querySelector('.navbar');
if (JSON.parse(localStorage.getItem('darkMode'))) {
    body.className = 'dark';
    navbar.classList.remove('transition');
    setTimeout(() => {
        body.classList.add('transition')
        navbar.classList.add('transition');
    }, 0);
}
changeThemeButton.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('darkMode', JSON.stringify(body.classList.contains('dark')));
})
