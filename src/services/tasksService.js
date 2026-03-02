// ---------------------------------------------------------------
// SERVICIO DE TAREAS (LÓGICA)
// ---------------------------------------------------------------

import { fetchTasks, createTask } from "../api/tasksApi.js";
import { filterVoid, renderTasks, tasksNull, updateMessageCounter } from "../ui/tasksUI.js";
import { clearError, hideEmpty, showError } from "../ui/uiState.js";
import { getSelectedValues, isValidInput, processTasks } from "../utils/helpers.js";

export async function getTasksByUser(userId) {
    const tasks = await fetchTasks();

    let userTasks = tasks.filter(t => t.userId === userId);
    return userTasks
}

export async function saveTask(task) {
    return createTask(task);
}

/**
 * Filtra un conjunto de tareas según los estados seleccionados.
 *
 * @param {Array} tasks - Lista completa de tareas a evaluar.
 * @param {Array} estados - Lista de estados permitidos.
 * 
 * @returns {Array} - Devuelve todas las tareas si no se pasan estados,
 *                    o solo aquellas cuyo status coincide con alguno en 'estados'.
 */
export function filterTasks(tasks, estados) {
    if (!estados || estados.length === 0) return tasks;
    return tasks.filter(t => estados.includes(t.status));
}

/**
 * Ordena un conjunto de tareas según un criterio específico.
 *
 * @param {Array} tasks - Lista de tareas a ordenar.
 * @param {string} criterio - Tipo de ordenamiento a aplicar.
 * @returns {Array} - Una copia de las tareas ordenadas según el criterio,
 *                    o la lista original si el criterio no coincide.
 */
export function sortTasks(tasks, criterio) {
    const copy = [...tasks];

    switch (criterio) {
        case "fecha_desc":
            return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        case "fecha_asc":
            return copy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        case "nombre_asc":
            return copy.sort((a, b) => a.title.localeCompare(b.title));

        case "nombre_desc":
            return copy.sort((a, b) => b.title.localeCompare(a.title));

        case "estado_prioridad":
            const p = { pendiente: 0, "en-progreso": 1, completada: 2 };
            return copy.sort((a, b) => p[a.status] - p[b.status]);

        case "estado_inverso":
            const i = { completada: 0, "en-progreso": 1, pendiente: 2 };
            return copy.sort((a, b) => i[a.status] - i[b.status]);

        default:
            return copy;
    }
}

/**
 * Valida todos los campos del formulario
 * @returns {boolean} - true si todos los campos son válidos, false si alguno no lo es
 */
export function validateForm(taskTitle, taskDescription, taskStatus, taskTitleError, taskDescriptionError, taskStatusError) {
    let isValid = true;

    if (!isValidInput(taskTitle.value)) {
        showError(taskTitleError, 'El título no puede estar vacío.');
        isValid = false;
    } else {
        clearError(taskTitleError);
    }

    if (!isValidInput(taskDescription.value)) {
        showError(taskDescriptionError, 'La descripción no puede estar vacía.');
        isValid = false;
    } else {
        clearError(taskDescriptionError);
    }

    if (!isValidInput(taskStatus.value)) {
        showError(taskStatusError, 'Debes seleccionar un estado.');
        isValid = false;
    } else {
        clearError(taskStatusError);
    }

    return isValid;
}

export async function orderFilter(filterStatus, sortTasksArea, container, currentUser) {
    let tasks = await getTasksByUser(currentUser.id);

    const estados = getSelectedValues(filterStatus);
    const sort = sortTasksArea.value;

    const result = processTasks(tasks, estados, sort, filterTasks, sortTasks);

    let currentFilteredTasks = result;

    const messagesFilters = document.getElementById("messagesFilters");

    result.length === 0 ? filterVoid(container) : renderTasks(container, result, currentUser, messagesFilters);

    updateMessageCounter(result.length);

    return currentFilteredTasks;
}

// analiza las tareas del usuario, al igual que las filtras y maneja la UI a base de estas
export async function postDelete(userId, container, messagesFilters) {
    let tareas = await getTasksByUser(userId)

    //al eliminarse la tarea se actualiza el contador
    updateMessageCounter(tareas.length);

    if (tareas.length == 0) {
        tasksNull(container)
        hideEmpty(messagesFilters)
    } else if (container.children.length === 0) {
        filterVoid(container)
    }
};
