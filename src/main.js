// ---------------------------------------------------------------
// MAIN - CONTROL TOTAL DE LA APP
// ---------------------------------------------------------------

import { validateUserService } from "./services/userService.js";
import { getTasksByUser, orderFilter, saveTask, validateForm } from "./services/tasksService.js";
import { renderTasks, resetFiltersUI, tasksNull, updateMessageCounter } from "./ui/tasksUI.js";
import { hideEmpty, hideUserUI, showUserUI } from "./ui/uiState.js";
import { showNotification } from "./ui/notificationsUI.js";
import { generateTasksJSON } from "./services/exportService.js";
import { downloadJSONFile } from "./ui/exportUI.js";

const validateBtn = document.getElementById("validateBtn");
const documentoInput = document.getElementById("documento");

const userInfo = document.getElementById("userInfo");
const taskForm = document.getElementById("taskForm")
const form = document.getElementById("task-section");
const messages = document.getElementById("messages-section");

const container = document.getElementById("messagesContainer");
const nameDisplay = document.getElementById("userNameDisplay");
const emailDisplay = document.getElementById("userEmailDisplay");

const emptyState = document.getElementById("emptyState");

// form de tareas
const taskTitleArea = document.getElementById("taskTitleArea");
const taskDescriptionArea = document.getElementById("taskDescriptionArea");
const taskStatusArea = document.getElementById("taskStatusArea");
const messagesFilters = document.getElementById("messagesFilters")

const taskTitleError = document.getElementById("taskTitleError")
const taskDescriptionError = document.getElementById("taskDescriptionError")
const taskStatusError = document.getElementById("taskStatusError")

// Area de filtro y orden
const sortTasksArea = document.getElementById('sortTasks')
const applyFiltersBtn = document.getElementById('applyFiltersBtn')
const filterStatus = document.querySelectorAll(".filterStatus")

//constante boton exportar
const exportTasksBtn = document.getElementById("exportTasksBtn");

let currentUser = null;
let tasksUser = []
let currentFilteredTasks = []; //guarda lo que ve actualmente en tareas 

// Al iniciar solo se ve validación
hideUserUI(userInfo, form, messages);

// ================= VALIDAR USUARIO =================
validateBtn.addEventListener("click", async () => {
    const id = documentoInput.value.trim();

    documentoInput.value = "";
    documentoInput.blur();

    if (!id || isNaN(id)) {
        showNotification("ID inválido. Por favor, ingresa un número.", "warning");
        return;
    }

    try {
        tasksUser = []
        currentUser = null;
        currentUser = await validateUserService(id);

        if (currentUser == null) {
            hideUserUI(userInfo, form, messages);
            showNotification("Usuario no registrado.", "error");
            return;
        }

        nameDisplay.textContent = currentUser.name;
        emailDisplay.textContent = currentUser.email;

        showUserUI(userInfo, form, messages);

        tasksUser = await getTasksByUser(currentUser.id, container, messagesFilters);

        if (tasksUser.length == 0) {
            hideEmpty(messagesFilters)
            tasksNull(container)
        } else {
            renderTasks(container, tasksUser, currentUser, messagesFilters);
        }

        //Contador de las tareas que hay al iniciar usuario
        updateMessageCounter(tasksUser.length);

        showNotification(`¡Hola de nuevo, ${currentUser.name}!`, "success");
        resetFiltersUI(filterStatus, sortTasksArea)

    } catch (error) {
        showNotification("Usuario no encontrado en la base de datos.", "error");
        console.log("Se ha presentado un error: " + error)
    }
});

// ================= CREAR TAREA =================
taskForm.addEventListener("submit", async e => {
    e.preventDefault();

    if (!currentUser) {
        showNotification("Primero debes validar tu usuario.", "warning");
        return;
    }

    if (!validateForm(taskTitleArea, taskDescriptionArea, taskStatusArea, taskTitleError, taskDescriptionError, taskStatusError)) {
        return;
    }

    const task = {
        userId: currentUser.id,
        title: taskTitleArea.value.trim(),
        description: taskDescriptionArea.value.trim(),
        status: taskStatusArea.value,
        createdAt: new Date().toISOString()
    };

    await saveTask(task);

    tasksUser = await getTasksByUser(currentUser.id, emptyState);
    renderTasks(container, tasksUser, currentUser, emptyState, messagesFilters);
    showNotification("¡Tarea registrada con éxito!", "success");
    e.target.reset();

    taskTitleArea.value = ''
    taskDescriptionArea.value = ''
    taskStatusArea.value = ''

    // en caso de que tenga un filtro u orden activado: 
    currentFilteredTasks = await orderFilter(filterStatus, sortTasksArea, container, currentUser)
});

// ================= FILTRAR Y ORDENAR =================
applyFiltersBtn.addEventListener("click", async () => {
    currentFilteredTasks = await orderFilter(filterStatus, sortTasksArea, container, currentUser)
});

// ================= EXPORTAR TAREAS =================
exportTasksBtn.addEventListener("click", () => {
    // Si no se ha filtrado nada, se usa tasksUser, si ya se filtro, se usa currentFilteredTasks
    const dataToExport = currentFilteredTasks.length > 0 ? currentFilteredTasks : tasksUser;

    if (!currentUser || dataToExport.length === 0) {
        alert("No hay tareas para exportar");
        return;
    }

    const jsonContent = generateTasksJSON(dataToExport);
    const fileName = `tareas_pantalla_${currentUser.name.replace(/\s+/g, '_')}.json`;

    downloadJSONFile(jsonContent, fileName);
});