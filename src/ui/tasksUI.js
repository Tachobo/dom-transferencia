// ---------------------------------------------------------------
// UI DE TAREAS (DOM)
// ---------------------------------------------------------------

import { getInitials, getCurrentTimestamp } from "../utils/helpers.js";
import { showEmpty } from "./uiState.js";
import { updateTaskApi, deleteTaskApi } from "../api/tasksApi.js";
import { postDelete } from "../services/tasksService.js";

export function updateMessageCounter(count) {
    const counterElement = document.getElementById("messageCount");
    if (counterElement) {
        counterElement.textContent = `${count} ${count === 1 ? 'mensaje' : 'mensajes'}`;
    }
}

export function renderTasks(container, tasks, currentUser, messagesFilters) {
    showEmpty(messagesFilters)
    container.innerHTML = "";

    // Si no hay tareas, corta el proceso y lo indica
    if (tasks.length == 0) {
        // Inserta el nuevo bloque HTML
        tasksNull(container)
        return tasks;
    }

    tasks.forEach(task => {
        const card = document.createElement("div");
        card.classList.add("message-card");

        card.innerHTML = `
        <div class="message-card__header">
            <div class="message-card__user">
                <div class="message-card__avatar">${getInitials(currentUser.name)}</div>
                <span class="message-card__username">${task.title}</span>
            </div>
            <span class="message-card__timestamp">${getCurrentTimestamp()}</span>
            <div class="task-btns">
                <button class="btn-edit">Editar</button>
                <button class="btn-delete">Eliminar</button>
            </div>
        </div>
        <div class="message-card__content">
            <p><strong>Descripción:</strong> ${task.description}</p>
            <p><strong>Estado:</strong> ${task.status}</p>
        </div>
        `;

        card.querySelector('.btn-delete').onclick = async () => {
            if (confirm("¿Eliminar esta tarea?")) {
                await deleteTaskApi(task.id);
                card.remove();

                // si no quedan mas tareas, limpia el UI
                postDelete(currentUser.id, container, messagesFilters)
            }
        };

        card.querySelector('.btn-edit').onclick = () => makeEditable(card, task);

        container.appendChild(card);
    });
}

// Función para transformar la card en formulario de edición
function makeEditable(card, task) {
    const content = card.querySelector('.message-card__content');
    const originalHTML = content.innerHTML;

    content.innerHTML = `
        <div class="edit-mode">
            <input type="text" class="form__input sm" value="${task.title}">
            <textarea class="form__input sm">${task.description}</textarea>
            <select class="form__input sm">
                <option value="pendiente" ${task.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="en-progreso" ${task.status === 'en-progreso' ? 'selected' : ''}>En progreso</option>
                <option value="completada" ${task.status === 'completada' ? 'selected' : ''}>Completada</option>
            </select>
            <div class="edit-actions">
                <button class="btn--primary btn--sm btn-save">Guardar</button>
                <button class="btn--secondary btn--sm btn-cancel">Cancelar</button>
            </div>
        </div>
    `;

    content.querySelector('.btn-cancel').onclick = () => content.innerHTML = originalHTML;

    content.querySelector('.btn-save').onclick = async () => {
        const newTitle = content.querySelector('input').value;
        const newDesc = content.querySelector('textarea').value;
        const newStatus = content.querySelector('select').value;

        const updated = await updateTaskApi(task.id, { title: newTitle, description: newDesc, status: newStatus });

        task.title = updated.title;
        task.description = updated.description;
        task.status = updated.status;
        card.querySelector('.message-card__username').textContent = updated.title;
        content.innerHTML = `
            <p><strong>Descripción:</strong> ${updated.description}</p>
            <p><strong>Estado:</strong> ${updated.status}</p>
        `;
    };
}

export function tasksNull(container) {
    container.innerHTML = `
    <div class="messages-empty" id="emptyState">
        <svg class="messages-empty__icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <p class="messages-empty__text">Aún no hay mensajes</p>
        <p class="messages-empty__subtext">Completa el formulario para agregar tu primer mensaje</p>
    </div>
    `;
}

export function resetFiltersUI(filterStatus, sortTasks) {

    // desmarcar checkboxes
    filterStatus.forEach(cb => {
        cb.checked = false;
    });

    // resetear select
    sortTasks.value = "";

}

export function filterVoid(container) {
    container.innerHTML = `
    <div class="messages-empty" id="emptyState">
        <svg class="messages-empty__icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <p class="messages-empty__text">No tienes tareas en este estado.</p>
        <p class="messages-empty__subtext">Prueba con otro filtro o limpia la selección.</p>
    </div>
    `;
}
