// ---------------------------------------------------------------
// MAIN - CONTROL TOTAL DE LA APP
// Archivo de inicialización y control de eventos de la aplicación.
// - Valida usuarios
// - Gestiona el formulario de creación de tareas
// - Aplica filtros y ordenamientos
// - Exporta las tareas visibles
// ---------------------------------------------------------------

import { validateUserService } from "./services/userService.js";
import { getTasksByUser, orderFilter, saveTask, validateForm } from "./services/tasksService.js";
import { renderTasks, resetFiltersUI, tasksNull, updateMessageCounter } from "./ui/tasksUI.js";
import { hideEmpty, hideUserUI, showAdminUI, showEmpty, showUserUI } from "./ui/uiState.js";
import { showNotification } from "./ui/notificationsUI.js";
import { generateTasksJSON } from "./services/exportService.js";
import { downloadJSONFile } from "./ui/exportUI.js";

const validateBtn = document.getElementById("validateBtn");
const documentoInput = document.getElementById("documento");

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

// Al iniciar solo se ve validación
hideUserUI(userInfo, form, messages, header, footer);

// ================= VALIDAR USUARIO =================
/**
 * Evento para validar el usuario a partir del ID ingresado.
 * - Llama a `validateUserService` para obtener datos del usuario
 * - Si existe, carga las tareas del usuario y renderiza la UI
 */
validateBtn.addEventListener("click", async () => {
    const document = documentoInput.value.trim();

    documentoInput.value = "";
    documentoInput.blur();

    if (!document || isNaN(document)) {
        showNotification("ID inválido. Por favor, ingresa un número.", "warning");
        return;
    }

    try {
        tasksUser = []
        currentUser = null;
        currentUser = await validateUserService(document);

        if (currentUser == null) {
            hideUserUI(userInfo, form, messages, header, footer);
            showNotification("Usuario no registrado.", "error");
            return;
        }

        nameDisplay.textContent = currentUser.name;
        emailDisplay.textContent = currentUser.email;

        userRolDisplay.textContent = currentUser.role === "admin" ? "Administrador" : "Usuario";

        // oculta la seccion de login
        hideEmpty(loginWrapper)

        // condicional para inicializar el rol "user"
        if (currentUser.role == "user") {
            // habilita la visibilidad base
            showUserUI(userInfo, form, messages, header, footer);

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

        } else if (currentUser.role == "admin") {
            showAdminUI(userInfo, form, header, footer, adminConsole)
            showNotification(`¡Hola de nuevo, ${currentUser.name}!`, "success");
        }


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
        createdAt: new Date().toISOString()
    };

    await saveTask(task);

    tasksUser = await getTasksByUser(currentUser.id, emptyState);
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
    // Implementamos la confirmación igual que en el borrado
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {

        // 1. Limpiar datos
        currentUser = null;
        tasksUser = [];
        currentFilteredTasks = [];

        // 2. Limpiar UI
        container.innerHTML = "";
        nameDisplay.textContent = "";
        emailDisplay.textContent = "";
        userRolDisplay.textContent = "";
        documentoInput.value = "";
        taskForm.reset();

        // 3. Ocultar todo (Con las protecciones que preguntaste)
        hideUserUI(userInfo, form, messages, header, footer);
        if (adminConsole) adminConsole.classList.add("hidden");

        // 4. Mostrar Login
        showEmpty(loginWrapper);

        // 5. Notificar
        showNotification("Sesión cerrada correctamente.", "info");
    }
});