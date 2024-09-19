var lat;
var lon;
var tasks = [];
async function getGeo(callback) {
    if (!window.localStorage.getItem('lat') && !window.localStorage.getItem('lon')) {
        if (navigator.geolocation) {
            await navigator.geolocation.getCurrentPosition(success, error);
        }
    }
    else {
        lat = window.localStorage.getItem('lat'); //from storage
        lon = window.localStorage.getItem('lon');
        callback({ lat, lon });
    }
    function success(position) {
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        window.localStorage.setItem('lat', lat);
        window.localStorage.setItem('lon', lon);
        callback({ lat, lon });
    }
    function error() {
        lat = 45.035470;
        lon = 38.975313; // krasnodar by default
        window.localStorage.setItem('lat', lat);
        window.localStorage.setItem('lon', lon);
        callback({ lat, lon });
    }

}
async function getWeather(coordinates) {
    const xhr = new XMLHttpRequest();
    const appid = '';
    // xhr.open('GET', `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${appid}&units=metric&lang=ru`, true);
    xhr.open('GET', `/api/weather?lat=${coordinates.lat}&lon=${coordinates.lon}`)
    xhr.send();
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const response = JSON.parse(xhr.response);
                const temp = parseFloat(response['main']['temp']).toFixed(1);
                const icon_code = response['weather'][0]['icon'];
                document.querySelector('#weather .temp span').textContent = temp + "\u00B0" + 'C';
                const img = document.getElementById('weather_image');
                img.src = `https://openweathermap.org/img/wn/${icon_code}@2x.png`;
                img.style.height = '50px';
                img.style.width = '50px;'
                document.querySelector('.city').textContent = response['city'];
            }
            catch (e) {
                console.error('Error parsing JSON:', e);
            }
        }
    }
}
function updateTime() {
    const now = new Date();
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    let seconds = now.getSeconds().toString().padStart(2, '0');
    let currentTime = `${hours}:${minutes}:${seconds}`;
    document.querySelector('.time span').textContent = currentTime;
}
function updateDate() {
    const now = new Date();
    const months = [
        "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ];
    const days = [
        "воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"
    ];

    let day = now.getDate().toString().padStart(2, '0');
    let month = months[now.getMonth()];
    let dayOfWeek = days[now.getDay()];
    let formattedDate = `${day} ${month}, ${dayOfWeek}`;
    document.querySelector('.date span').textContent = formattedDate;
}
function fillTaskList(tasks) {
    for (let i = 0; i < tasks.length; i++) {
        tasks_list.appendChild(createListElement(tasks[i].title));
        attachEventListeners(tasks_list.lastElementChild);
        if (tasks[i].completed == 'true') {
            let ch = tasks_list.lastElementChild.querySelector('input[type="checkbox"]');
            ch.checked = !ch.checked;
            ch.dispatchEvent(changeEvent);
        }

    }
}
const changeEvent = new Event('change', {
    bubbles: true,
    cancelable: true 
});
function addTask(event) {
    const input = event.currentTarget;
    const task_title = input.value;
    if (task_title != '' && task_title != null) {
        input.style.border = 'none';
        input.style.borderColor = 'none';
        input.placeholder = 'Новая задача';
        input.value = '';
        tasks_list.appendChild(createListElement(task_title));
        attachEventListeners(tasks_list.lastElementChild);
        if (tasks_list.children.length == 1) document.querySelector('.empty').remove();
        tasks.push(task = { title: task_title, completed: 'false' });
        window.localStorage.removeItem('tasks');
        window.localStorage.setItem('tasks', JSON.stringify(tasks))
    }
    else {
        input.style.border = '2px solid';
        input.style.borderColor = 'red';
        input.placeholder = 'Введите задачу';
    }
}
function createListElement(text) {
    const li = document.createElement('li');
    li.classList.add('task');
    li.innerHTML = `<input type="checkbox"></input>
                <span class="task-name">${text}</span>
                <div class="delete_container"><button class="delete"><img src="./images/delete.png" class="icon"></img></button></div>`;
    return li;
}
function deleteTask(event) {
    const task_element = event.currentTarget.closest('.task');
    const text = task_element.querySelector('span').textContent;
    const index = tasks.findIndex(item => item.title === text);
    if (index !== -1) {
        tasks.splice(index, 1);
    }
    changeStoragedTasks();
    tasks_list.removeChild(task_element);
    checkTaskListCount(tasks_list);
    if (tasks.length == 0) window.localStorage.removeItem('tasks');
    if (getFinishedTasksCount() > 0) document.querySelector('.multiple-delete').style.display = 'block';
    else document.querySelector('.multiple-delete').style.display = 'none'
}

function checkTaskListCount(list) {
    if (list.children.length == 0) {
        const span = document.createElement('span');
        span.textContent = "Список задач пуст";
        span.classList.add('empty');
        span.style.fontStyle = 'italic';
        document.querySelector('.task-container').appendChild(span);
        document.querySelector('.multiple-delete').style.display = 'none';
    };
}
function changeStoragedTasks() {
    window.localStorage.removeItem('tasks');
    window.localStorage.setItem('tasks', JSON.stringify(tasks))
}
function changeCheckbox(event) {
    const checkbox = event.currentTarget;
    const task = checkbox.closest('.task');
    const span = task.querySelector('.task-name');
    if (checkbox.checked) {
        span.style.textDecoration = 'line-through';
        span.style.opacity = '0.7';
        span.style.color = '#ffffff';
    }
    else {
        span.style.textDecoration = 'none';
        span.style.color = 'white';
        span.style.opacity = '1';
    }
    const taskToUpdate = tasks.find(task => task.title === span.textContent);
    if(taskToUpdate.completed !== String(checkbox.checked))
    {
        taskToUpdate.completed = checkbox.checked ? 'true' : 'false';
        changeStoragedTasks();
    }
    if (getFinishedTasksCount() > 0) document.querySelector('.multiple-delete').style.display = 'block';
    else document.querySelector('.multiple-delete').style.display = 'none'
}
function attachEventListeners(task) {
    task.querySelector('.delete').addEventListener('click', deleteTask);
    task.querySelector("input[type='checkbox']").addEventListener('change', changeCheckbox);
}
function getFinishedTasksCount() {
    let count = 0;
    for (let task of tasks_list.children) {
        if (task.querySelector('input[type="checkbox"]').checked) count++;
    }
    return count;
}
function handleFinishedTasks() {
    var tasks = tasks_list.children;
    for (let i = tasks.length - 1; i >= 0; i--) {
        if (tasks[i].querySelector('input[type="checkbox"]').checked) tasks[i].querySelector('.delete').click();
    }

}
document.querySelector('.multiple-delete').addEventListener('click', handleFinishedTasks);
async function setWalpaper() {
    const currentTime = new Date().getHours();
    // const currentTime = new Date().getSeconds(); testing
    let url = '';
    if (currentTime >= 0 && currentTime < 6) {
        url = "https://github.com/digitalSector47/traineeship-test-task/blob/main/images/01.jpg?raw=true";
    } else if (currentTime >= 6 && currentTime < 12) {
        url = "https://github.com/digitalSector47/traineeship-test-task/blob/main/images/02.jpg?raw=true";
    } else if (currentTime >= 12 && currentTime < 18) {
        url = "https://github.com/digitalSector47/traineeship-test-task/blob/main/images/03.jpg?raw=true";
    } else if (currentTime >= 18 && currentTime < 24) {
        url = "https://github.com/digitalSector47/traineeship-test-task/blob/main/images/04.jpg?raw=true";
    }
    // if (currentTime >= 0 && currentTime < 10) {
    //     url = "./images/01.jpg";
    // } else if (currentTime >= 10 && currentTime < 20) {
    //     url = "./images/02.jpg";
    // } else if (currentTime >= 20 && currentTime < 30) {
    //     url = "./images/03.jpg";
    // } else if (currentTime >= 30 && currentTime < 40) {
    //     url = "./images/04.jpg";
    // } else if (currentTime >= 40 && currentTime < 50) {
    //     url = "./images/01.jpg";
    // } else if (currentTime >= 50 && currentTime < 60) {
    //     url = "./images/02.jpg";
    // }
    document.querySelector('.wallpaper').style.backgroundImage = `url(${url})`;

}

document.addEventListener('DOMContentLoaded', function () {
    setWalpaper();
    setInterval(setWalpaper, 60000);
    // setInterval(setWalpaper, 1000) //every 10 seconds for testing
    const tasks_list = document.getElementById('tasks_list');
    const task_input = document.getElementById('task_input');
    task_input.addEventListener('keydown', function (event) { if (event.key === "Enter") addTask(event) });
    updateTime();
    setInterval(updateTime, 1000);
    updateDate();
    getGeo(coordinates => getWeather(coordinates));
    if (window.localStorage.getItem('tasks')) {
        tasks = JSON.parse(window.localStorage.getItem('tasks'));
        fillTaskList(tasks);
    }
    else {
        checkTaskListCount(tasks_list);

    }
});