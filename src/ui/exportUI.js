/**
 * Dispara la descarga de un archivo JSON en el cliente.
 * @param {string} content - Contenido JSON serializado
 * @param {string} fileName - Nombre de archivo sugerido para la descarga
 */
export function downloadJSONFile(content, fileName) {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}