import { fetchTasks, deleteTaskApi, updateTaskApi } from "./api/tasksApi.js";
import { fetchUsers } from "./api/usersApi.js";
import { getCurrentTimestamp } from "./utils/helpers.js";

// ===============================================================
// 1. SELECTORES DEL DOM
// ===============================================================
const tabTasks = document.getElementById("tabTasks");
const tabUsers = document.getElementById("tabUsers");
const tasksSection = document.getElementById("tasksSection");
const usersSection = document.getElementById("usersSection");
const btnAdminLogout = document.getElementById("btnAdminLogout");
const adminTasksTableBody = document.getElementById("adminTasksTableBody");

// ===============================================================
// 2. LÓGICA DE PESTAÑAS Y NAVEGACIÓN
// ===============================================================
tabTasks.addEventListener("click", () => {
    tasksSection.classList.remove("hidden");
    usersSection.classList.add("hidden");

    tabTasks.className = "btn btn--primary";
    tabTasks.style.backgroundColor = "";
    tabTasks.style.color = "";

    tabUsers.className = "btn";
    tabUsers.style.backgroundColor = "var(--color-gray-200)";
    tabUsers.style.color = "var(--color-text-primary)";
});

tabUsers.addEventListener("click", () => {
    usersSection.classList.remove("hidden");
    tasksSection.classList.add("hidden");

    tabUsers.className = "btn btn--primary";
    tabUsers.style.backgroundColor = ""; 
    tabUsers.style.color = "";

    tabTasks.className = "btn";
    tabTasks.style.backgroundColor = "var(--color-gray-200)";
    tabTasks.style.color = "var(--color-text-primary)";
});

btnAdminLogout.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que quieres salir del panel de administrador?")) {
        window.location.href = "index.html";
    }
});

// ===============================================================
// 3. LÓGICA DE DATOS Y FILTROS (TAREAS)
// ===============================================================
let allTasks = [];
let allUsers = [];

// 3.1. Nuevos selectores para los filtros
const adminSearchTask = document.getElementById("adminSearchTask");
const adminFilterStatus = document.getElementById("adminFilterStatus");

/**
 * Función exclusiva para DIBUJAR la tabla basándose en una lista de tareas
 * @param {Array} tasksToRender - Lista de tareas que queremos mostrar
 */
function renderAdminTasksTable(tasksToRender) {
    adminTasksTableBody.innerHTML = "";

    if (tasksToRender.length === 0) {
        adminTasksTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">No se encontraron tareas con estos filtros.</td></tr>`;
        return;
    }

    tasksToRender.forEach(task => {
        const taskUser = allUsers.find(u => String(u.id) === String(task.userId));
        const userName = taskUser ? taskUser.name : "Usuario Desconocido";

        const statusColor = task.estado === "completada" ? "var(--color-success)" : "var(--color-warning)";
        const statusText = task.estado === "completada" ? "Completada" : "Pendiente";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>#${task.id}</strong></td>
            <td>${userName} <br><small style="color: var(--color-gray-500)">ID: ${task.userId}</small></td>
            <td>${task.descripcion}</td>
            <td>${task.fecha}</td>
            <td>
                <span style="background-color: ${statusColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem;">
                    ${statusText}
                </span>
            </td>
            <td style="display: flex; gap: 5px;">
                <button class="btn btn--primary btn-edit-task" data-id="${task.id}" style="padding: 5px 10px; font-size: 0.8rem;">✏️ Editar</button>
                <button class="btn btn--danger btn-delete-task" data-id="${task.id}" style="padding: 5px 10px; font-size: 0.8rem;">🗑️ Eliminar</button>
            </td>
        `;
        adminTasksTableBody.appendChild(tr);
    });
}

/**
 * Función principal que carga los datos desde la API
 */
async function loadAdminTasks() {
    try {
        adminTasksTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">Cargando datos del sistema...</td></tr>`;

        // Traer datos
        allTasks = await fetchTasks();
        allUsers = await fetchUsers();

        // Dibujar todas las tareas inicialmente
        renderAdminTasksTable(allTasks);

    } catch (error) {
        console.error("Error cargando datos del admin:", error);
        adminTasksTableBody.innerHTML = `<tr><td colspan="6" class="table-empty" style="color: red;">Error al cargar la base de datos. Verifica que json-server esté corriendo.</td></tr>`;
    }
}

/**
 * 3.2. Función que evalúa los filtros y actualiza la tabla
 */
function applyAdminFilters() {
    const searchTerm = adminSearchTask.value.toLowerCase();
    const statusValue = adminFilterStatus.value;

    const filteredTasks = allTasks.filter(task => {
        // 1. Validar si cumple con el estado seleccionado
        const matchStatus = statusValue === "all" || task.estado === statusValue;

        // 2. Validar si el texto buscado coincide con la descripción, ID de la tarea o el nombre del usuario
        const taskUser = allUsers.find(u => String(u.id) === String(task.userId));
        const userName = taskUser ? taskUser.name.toLowerCase() : "";
        
        const matchSearch = task.descripcion.toLowerCase().includes(searchTerm) || 
                            userName.includes(searchTerm) || 
                            String(task.id).includes(searchTerm);

        // Retornar verdadero solo si cumple ambas condiciones
        return matchStatus && matchSearch;
    });

    // Redibujar la tabla solo con las tareas que pasaron el filtro
    renderAdminTasksTable(filteredTasks);
}

// 3.3. Escuchar los eventos de la barra de herramientas
adminSearchTask.addEventListener("input", applyAdminFilters); // Se activa al escribir cada letra
adminFilterStatus.addEventListener("change", applyAdminFilters); // Se activa al cambiar el select

// ===============================================================
// 4. LÓGICA DE ACCIONES EN LA TABLA (ELIMINAR Y EDITAR)
// ===============================================================
adminTasksTableBody.addEventListener("click", async (e) => {
    
    // -----------------------------------------
    // ACCIÓN: ELIMINAR TAREA
    // -----------------------------------------
    const btnDelete = e.target.closest(".btn-delete-task");
    if (btnDelete) {
        const taskId = btnDelete.getAttribute("data-id");
        if (confirm(`¿Estás seguro de que deseas eliminar permanentemente la tarea #${taskId}?`)) {
            try {
                await deleteTaskApi(taskId);
                allTasks = allTasks.filter(task => String(task.id) !== String(taskId));
                applyAdminFilters();
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Hubo un error al intentar eliminar la tarea.");
            }
        }
        return; // Detenemos la ejecución aquí para que no haga nada más
    }

    // -----------------------------------------
    // ACCIÓN: EDITAR TAREA
    // -----------------------------------------
    const btnEdit = e.target.closest(".btn-edit-task");
    if (btnEdit) {
        const taskId = btnEdit.getAttribute("data-id");
        
        // 1. Buscamos la tarea actual en nuestra lista para saber qué decía antes
        const taskToEdit = allTasks.find(task => String(task.id) === String(taskId));
        if (!taskToEdit) return;

        // 2. Le pedimos al administrador el nuevo texto (mostrando el texto actual por defecto)
        const newDescription = prompt("Edita la descripción de la tarea:", taskToEdit.descripcion);

        // 3. Si el administrador escribió algo y no canceló, actualizamos
        if (newDescription !== null && newDescription.trim() !== "") {
            try {
                // Actualizamos en la base de datos (PATCH)
                await updateTaskApi(taskId, { descripcion: newDescription.trim() });
                
                // Actualizamos nuestra lista temporal
                taskToEdit.descripcion = newDescription.trim();
                
                // Redibujamos la tabla
                applyAdminFilters();
                
            } catch (error) {
                console.error("Error al editar:", error);
                alert("Hubo un error al intentar actualizar la tarea.");
            }
        }
    }
});

// Iniciar la carga al abrir la página
document.addEventListener("DOMContentLoaded", () => {
    loadAdminTasks();
});