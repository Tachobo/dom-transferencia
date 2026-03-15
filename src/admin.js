import { fetchTasks, deleteTaskApi, updateTaskApi, createTask } from "./api/tasksApi.js";
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
            <td>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button class="btn btn--primary btn-edit-task" data-id="${task.id}" style="padding: 5px 10px; font-size: 0.8rem; white-space: nowrap;">✏️ Editar</button>
                    <button class="btn btn--danger btn-delete-task" data-id="${task.id}" style="padding: 5px 10px; font-size: 0.8rem; white-space: nowrap;">🗑️ Eliminar</button>
                </div>
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
        
        // Traer datos de la base de datos
        allTasks = await fetchTasks();
        allUsers = await fetchUsers();
        
        // Dibujar ambas tablas
        renderAdminTasksTable(allTasks);
        renderAdminUsersTable(allUsers); 

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

// ===============================================================
// 5. LÓGICA DEL MODAL: CREAR TAREA GLOBAL
// ===============================================================
const btnNewGlobalTask = document.getElementById("btnNewGlobalTask");
const modalNewGlobalTask = document.getElementById("modalNewGlobalTask");
const btnCancelGlobalTask = document.getElementById("btnCancelGlobalTask");
const formNewGlobalTask = document.getElementById("formNewGlobalTask");
const globalTaskUser = document.getElementById("globalTaskUser");
const globalTaskDesc = document.getElementById("globalTaskDesc");

// 5.1. Abrir Modal y llenar la lista de usuarios
btnNewGlobalTask.addEventListener("click", () => {
    // Llenar el <select> con los usuarios reales
    globalTaskUser.innerHTML = '<option value="">Selecciona un usuario...</option>';
    allUsers.forEach(user => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = `${user.name} (ID: ${user.document || user.id})`;
        globalTaskUser.appendChild(option);
    });

    // Mostrar el modal
    modalNewGlobalTask.classList.remove("hidden");
});

// 5.2. Cerrar Modal
btnCancelGlobalTask.addEventListener("click", () => {
    modalNewGlobalTask.classList.add("hidden");
    formNewGlobalTask.reset(); // Limpiar el formulario
});

// 5.3. Guardar la nueva tarea
formNewGlobalTask.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evitar que la página se recargue

    // Construir el objeto de la nueva tarea
    const newTask = {
        userId: globalTaskUser.value,
        descripcion: globalTaskDesc.value.trim(),
        estado: "pendiente",
        fecha: getCurrentTimestamp() // Usamos tu helper para la fecha actual
    };

    try {
        // 1. Enviar a la base de datos
        const createdTask = await createTask(newTask);
        
        // 2. Agregar a nuestra lista en memoria
        allTasks.unshift(createdTask); // unshift lo pone al principio de la lista
        
        // 3. Redibujar la tabla
        applyAdminFilters();
        
        // 4. Cerrar el modal y limpiar
        modalNewGlobalTask.classList.add("hidden");
        formNewGlobalTask.reset();
        
        // (Opcional) Mostrar notificación nativa si la tienes importada
        alert("Tarea asignada exitosamente");

    } catch (error) {
        console.error("Error al crear tarea global:", error);
        alert("Hubo un error al intentar crear la tarea.");
    }
});

// ===============================================================
// 6. LÓGICA DE DATOS Y FILTROS (USUARIOS)
// ===============================================================
const adminUsersTableBody = document.getElementById("adminUsersTableBody");
const adminSearchUser = document.getElementById("adminSearchUser");

/**
 * Dibuja la tabla de usuarios en pantalla
 */
function renderAdminUsersTable(usersToRender) {
    adminUsersTableBody.innerHTML = "";

    if (!usersToRender || usersToRender.length === 0) {
        adminUsersTableBody.innerHTML = `<tr><td colspan="5" class="table-empty">No se encontraron usuarios.</td></tr>`;
        return;
    }

    usersToRender.forEach(user => {
        // Definir un color según el rol (Azul para admin, Verde para usuario)
        const roleColor = user.role === "admin" ? "var(--color-primary)" : "var(--color-success)";
        const roleText = user.role === "admin" ? "Administrador" : "Usuario";
        
        // Usamos user.document porque en tu db.json ese es el ID real de login
        const documentId = user.document || user.id; 

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${documentId}</strong></td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <span style="background-color: ${roleColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem;">
                    ${roleText}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button class="btn btn--primary btn-edit-user" data-id="${user.id}" style="padding: 5px 10px; font-size: 0.8rem; white-space: nowrap;">✏️ Editar</button>
                    <button class="btn btn--danger btn-delete-user" data-id="${user.id}" style="padding: 5px 10px; font-size: 0.8rem; white-space: nowrap;">🗑️ Eliminar</button>
                </div>
            </td>
        `;
        adminUsersTableBody.appendChild(tr);
    });
}

/**
 * Filtra la tabla de usuarios en tiempo real
 */
function applyUserFilters() {
    if (!allUsers) allUsers = []; 
    const searchTerm = adminSearchUser.value.toLowerCase();

    const filteredUsers = allUsers.filter(user => {
        const docId = String(user.document || user.id).toLowerCase();
        return user.name.toLowerCase().includes(searchTerm) || 
                docId.includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm);
    });

    renderAdminUsersTable(filteredUsers);
}

// Activar el buscador de usuarios cuando se escriba
adminSearchUser.addEventListener("input", applyUserFilters);

// ===============================================================
// 7. MODAL DE CONFIRMACIÓN Y ELIMINAR USUARIO
// ===============================================================

// Selectores del nuevo modal
const modalConfirm = document.getElementById("modalConfirm");
const btnAcceptConfirm = document.getElementById("btnAcceptConfirm");
const btnCancelConfirm = document.getElementById("btnCancelConfirm");
const confirmTitle = document.getElementById("confirmTitle");
const confirmMessage = document.getElementById("confirmMessage");

let confirmAction = null; // Variable temporal para guardar qué función ejecutar

/**
 * Función genérica para mostrar el modal de confirmación
 */
function showCustomConfirm(title, message, onAccept) {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmAction = onAccept; // Guardamos la función
    modalConfirm.classList.remove("hidden");
}

// Evento para el botón de Cancelar
btnCancelConfirm.addEventListener("click", () => {
    modalConfirm.classList.add("hidden");
    confirmAction = null;
});

// Evento para el botón de Aceptar (ejecuta la acción guardada)
btnAcceptConfirm.addEventListener("click", async () => {
    if (confirmAction) {
        await confirmAction(); 
    }
    modalConfirm.classList.add("hidden");
});

// ESCUCHAR CLICS EN LA TABLA DE USUARIOS
adminUsersTableBody.addEventListener("click", (e) => {
    
    // CASO: ELIMINAR USUARIO
    const btnDelete = e.target.closest(".btn-delete-user");
    if (btnDelete) {
        const userId = btnDelete.getAttribute("data-id");
        
        // Buscamos el nombre para que el mensaje sea personalizado
        const user = allUsers.find(u => String(u.id) === String(userId));
        if (!user) return;

        // Abrimos el modal personalizado pasándole la lógica de borrado
        showCustomConfirm(
            "Eliminar Usuario", 
            `¿Estás seguro de que deseas eliminar a ${user.name}? Esta acción borrará todos sus datos del sistema.`,
            async () => {
                try {
                    // 1. Llamada a la API
                    await deleteUserApi(userId);
                    
                    // 2. Actualizar lista local
                    allUsers = allUsers.filter(u => String(u.id) !== String(userId));
                    
                    // 3. Redibujar tabla
                    applyUserFilters();
                    
                    alert("Usuario eliminado con éxito");
                } catch (error) {
                    console.error("Error al eliminar usuario:", error);
                    alert("No se pudo eliminar al usuario. Intenta de nuevo.");
                }
            }
        );
    }
});

// ===============================================================
// 8. LÓGICA DE CREAR Y EDITAR USUARIOS
// ===============================================================
const btnNewUser = document.getElementById("btnNewUser");
const modalUserForm = document.getElementById("modalUserForm");
const btnCancelUser = document.getElementById("btnCancelUser");
const formUser = document.getElementById("formUser");
const userModalTitle = document.getElementById("userModalTitle");

// Campos del formulario
const editUserId = document.getElementById("editUserId");
const userNameInput = document.getElementById("userName");
const userEmailInput = document.getElementById("userEmail");
const userDocInput = document.getElementById("userDoc");
const userRoleInput = document.getElementById("userRole");

// 8.1. Abrir para NUEVO usuario
btnNewUser.addEventListener("click", () => {
    formUser.reset();
    editUserId.value = ""; // Importante: vacío para saber que es creación
    userModalTitle.textContent = "Nuevo Usuario";
    modalUserForm.classList.remove("hidden");
});

// 8.2. Abrir para EDITAR usuario (Desde la tabla)
adminUsersTableBody.addEventListener("click", (e) => {
    const btnEdit = e.target.closest(".btn-edit-user");
    if (btnEdit) {
        const userId = btnEdit.getAttribute("data-id");
        const user = allUsers.find(u => String(u.id) === String(userId));
        
        if (user) {
            editUserId.value = user.id;
            userNameInput.value = user.name;
            userEmailInput.value = user.email;
            userDocInput.value = user.document || user.id;
            userRoleInput.value = user.role || "user";
            
            userModalTitle.textContent = "Editar Usuario";
            modalUserForm.classList.remove("hidden");
        }
    }
});

// Cerrar modal
btnCancelUser.addEventListener("click", () => modalUserForm.classList.add("hidden"));

// 8.3. GUARDAR (Crear o Actualizar)
formUser.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userData = {
        name: userNameInput.value.trim(),
        email: userEmailInput.value.trim(),
        document: userDocInput.value.trim(),
        role: userRoleInput.value
    };

    const isEditing = editUserId.value !== "";

    if (isEditing) {
        // LÓGICA DE EDICIÓN (Con confirmación personalizada)
        showCustomConfirm(
            "Confirmar Modificación",
            `¿Estás seguro de que deseas guardar los cambios para ${userData.name}?`,
            async () => {
                try {
                    await updateUserApi(editUserId.value, userData);
                    const index = allUsers.findIndex(u => String(u.id) === String(editUserId.value));
                    allUsers[index] = { ...allUsers[index], ...userData };
                    applyUserFilters();
                    modalUserForm.classList.add("hidden");
                    alert("Usuario actualizado correctamente");
                } catch (error) {
                    alert("Error al actualizar");
                }
            }
        );
    } else {
        // LÓGICA DE CREACIÓN (Directa)
        try {
            const newUser = await createUserApi(userData);
            
            // 1. Agregar a nuestra lista local
            allUsers.push(newUser);
            
            // 2. Redibujar la tabla de usuarios
            applyUserFilters();
            
            // 3. Cerrar y limpiar
            modalUserForm.classList.add("hidden");
            formUser.reset();
            
            alert(`¡Usuario ${newUser.name} creado con éxito! Su contraseña inicial es su documento.`);
        } catch (error) {
            console.error("Error al crear:", error);
            alert("No se pudo crear el usuario. Revisa la consola.");
        }
    }
});