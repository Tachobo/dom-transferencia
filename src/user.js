// ---------------------------------------------------------------
// MAIN - CONTROL TOTAL DE LA APP
// Archivo de inicialización y control de eventos de la aplicación.
// - Valida usuarios
// - Gestiona el formulario de creación de tareas
// - Aplica filtros y ordenamientos
// - Exporta las tareas visibles
// ---------------------------------------------------------------

import { getTasksByUser, orderFilter, saveTask, validateForm } from "./services/tasksService.js";
import { renderTasks, resetFiltersUI, tasksNull, updateMessageCounter } from "./ui/tasksUI.js";
import { hideEmpty, hideUserUI, showAdminUI, showEmpty, showUserUI } from "./ui/uiState.js";
import { showNotification } from "./ui/notificationsUI.js";
import { generateTasksJSON } from "./services/exportService.js";
import { downloadJSONFile } from "./ui/exportUI.js";
import { getCurrentTimestamp } from "./utils/helpers.js";

const header = document.querySelector(".header");
const loginWrapper = document.getElementById("login-wrapper");
const footer = document.querySelector(".footer");
const adminConsole = document.getElementById("admin-console");
const btnTextLogout = document.querySelector(".btn-text-logout");

const userInfo = document.getElementById("userInfo");
const taskForm = document.getElementById("taskForm")
const form = document.getElementById("task-section");
const messages = document.getElementById("messages-section");

const container = document.getElementById("messagesContainer");
const nameDisplay = document.getElementById("userNameDisplay");
const emailDisplay = document.getElementById("userEmailDisplay");
const userRolDisplay = document.getElementById("userRolDisplay");

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


// ================= INICIALIZACION DEL DOCUMENTO =================
document.addEventListener("DOMContentLoaded", async () => {
    try {
        tasksUser = [];
        currentUser = null;

        // Obtener el texto del localStorage
        const sessionData = localStorage.getItem('usuarioActivo');

        // Convertir el texto a Objeto
        if (sessionData) {
            currentUser = JSON.parse(sessionData);
        } else {
            // Si no hay nada, se envia a login
            window.location.href = 'login.html';
            return;
        }

        showNotification(`¡Hola de nuevo, ${currentUser.name}!`, "success");

        nameDisplay.textContent = currentUser.name;
        emailDisplay.textContent = currentUser.email;
        userRolDisplay.textContent = "Usuario";

        // Traemos las tareas del usuario
        tasksUser = await getTasksByUser(currentUser.id, container, messagesFilters);

        if (tasksUser.length == 0) {
            hideEmpty(messagesFilters)
            tasksNull(container)
        } else {
            renderTasks(container, tasksUser, currentUser, messagesFilters);
        }

        updateMessageCounter(tasksUser.length);

        resetFiltersUI(filterStatus, sortTasksArea)

    } catch (error) {
        showNotification("Usuario no encontrado en la base de datos.", "error");
        console.log("Se ha presentado un error: " + error)
    }
});

// ================= CREAR TAREA =================
/**
 * Maneja el envío del formulario de creación de tareas.
 * - Valida que exista un usuario validado
 * - Valida los campos del formulario con `validateForm`
 * - Construye el objeto tarea y lo persiste con `saveTask`
 * - Refresca la lista de tareas mostrada
 */
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
        createdAt: getCurrentTimestamp()
    };

    //persiste la tarea en el backend
    await saveTask(task);

    //Sincroniza la lista local con el servidor
    const updatedTasks = await getTasksByUser(currentUser.id);
    tasksUser = updatedTasks;

    renderTasks(container, tasksUser, currentUser, messagesFilters);
    showNotification("¡Tarea registrada con éxito!", "success");

    e.target.reset();
    taskTitleArea.value = ''
    taskDescriptionArea.value = ''
    taskStatusArea.value = ''

    // visibilidad para la card de filtro y orden
    showEmpty(messagesFilters)

    // si es la primera tarea del usuario, limpia el filtro 
    if (tasksUser.length == 1) {
        resetFiltersUI(filterStatus, sortTasksArea)
        updateMessageCounter(tasksUser.length);
        currentFilteredTasks = [];
        return;
    }

    // en caso de que tenga un filtro u orden activado: 
    currentFilteredTasks = await orderFilter(filterStatus, sortTasksArea, container, currentUser)
});

// ================= FILTRAR Y ORDENAR =================
/**
 * Aplica filtro y orden a las tareas mostradas llamando a
 * `orderFilter` desde el servicio de tareas.
 */
applyFiltersBtn.addEventListener("click", async () => {
    currentFilteredTasks = await orderFilter(filterStatus, sortTasksArea, container, currentUser)
});

// ================= EXPORTAR TAREAS =================
/**
 * Genera y descarga un archivo JSON con las tareas visibles.
 * - Si hay filtros activos usa `currentFilteredTasks`, si no `tasksUser`.
 */
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

// ================= CERRAR SESIÓN =================
btnTextLogout.addEventListener("click", () => {
    // confirmamos que desea cerrar seccion
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {

        // Notificar (Se verá brevemente antes de cambiar de página)
        showNotification("Sesión cerrada correctamente.", "info");

        setTimeout(() => {
            // Limpiar datos de las variables en memoria
            currentUser = null;
            tasksUser = [];
            currentFilteredTasks = [];

            // Limpiar rastro en el navegador
            localStorage.removeItem('usuarioActivo');

            // Limpiar UI
            container.innerHTML = "";
            nameDisplay.textContent = "";
            emailDisplay.textContent = "";
            userRolDisplay.textContent = "";
            taskForm.reset();

            // Redireccion al login
            window.location.href = 'index.html';
        }, 500)
    }
});

if (adminConsole) {
    adminConsole.addEventListener("click", (e) => {
        // Si el clic fue en un botón o tarjeta dentro de la consola de admin
        const card = e.target.closest(".card"); // O la clase/ID que tengan tus tarjetas
        if (card) {
            window.location.href = "admin.html";
        }
    });
}