// browser-extension/js/apiService.js

// --- 1. ЦЕНТРАЛИЗОВАННАЯ КОНФИГУРАЦИЯ ---
const API_BASE_URL = "http://192.168.0.249:8780";
const API_KEY_STORAGE_KEY = "apiKey"; // Ключ для хранения в chrome.storage

// --- 2. НОВЫЕ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

/**
 * Получает API-ключ из локального хранилища расширения.
 * @returns {Promise<string|null>} API-ключ или null, если он не найден.
 */
async function getApiKey() {
    try {
        const result = await chrome.storage.local.get([API_KEY_STORAGE_KEY]);
        return result[API_KEY_STORAGE_KEY] || null;
    } catch (error) {
        console.error("Ошибка при получении API-ключа из хранилища:", error);
        return null;
    }
}

/**
 * Сохраняет API-ключ в хранилище. Нужна для первоначальной настройки.
 * @param {string} key - API-ключ для сохранения.
 */
export async function saveApiKey(key) {
    try {
        await chrome.storage.local.set({ [API_KEY_STORAGE_KEY]: key });
        console.log("API-ключ успешно сохранен.");
    } catch (error)
 {
        console.error("Ошибка при сохранении API-ключа:", error);
    }
}

// --- 3. ВАША ФУНКЦИЯ ОБРАБОТКИ ОТВЕТА (ОСТАЕТСЯ БЕЗ ИЗМЕНЕНИЙ) ---
async function handleApiResponse(response, operationName = "API") {
    if (!response.ok) {
        let errorDetail = `Ошибка ${operationName}: ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.detail) {
                if (Array.isArray(errorData.detail)) {
                     errorDetail = errorData.detail.map(d =>
                        (typeof d === 'object' && d !== null && d.message) ? d.message : JSON.stringify(d)
                    ).join('; ');
                } else if (typeof errorData.detail === 'string') {
                    errorDetail = errorData.detail;
                }
            }
        } catch (e) {
            console.warn(`Не удалось распарсить JSON из ответа об ошибке для ${operationName}:`, e);
        }
        console.error(`[API] ${operationName} не удался со статусом ${response.status}: ${errorDetail}`);
        throw new Error(errorDetail);
    }
    try {
        return await response.json();
    } catch (e) {
        console.error(`[API] Не удалось распарсить JSON из успешного ответа для ${operationName}:`, e);
        throw new Error(`Ошибка парсинга данных от ${operationName}.`);
    }
}

// --- 4. НОВАЯ ФУНКЦИЯ-ОБЕРТКА ДЛЯ ВСЕХ FETCH-ЗАПРОСОВ ---
/**
 * Выполняет fetch-запрос, автоматически добавляя X-API-KEY.
 * @param {string} endpoint - Путь к эндпоинту (например, "/extension/search").
 * @param {object} options - Настройки для fetch (method, body и т.д.).
 * @param {string} operationName - Имя операции для логов.
 * @returns {Promise<any>}
 */
async function apiFetch(endpoint, options, operationName) {
    const apiKey = await getApiKey();
    if (!apiKey) {
        throw new Error("API-ключ не настроен. Пожалуйста, сохраните ключ.");
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey, // <--- ВОТ САМОЕ ГЛАВНОЕ!
        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    return handleApiResponse(response, operationName);
}

// --- 5. ОБНОВЛЕННЫЕ ЭКСПОРТНЫЕ ФУНКЦИИ (СТАЛИ ПРОЩЕ) ---

/**
 * Запрашивает список пациентов с сервера.
 */
export async function fetchSearchResults(searchPayload) {
    console.log("[API] Запрос на поиск пациентов:", searchPayload);
    return apiFetch(
        "/extension/search",
        {
            method: "POST",
            body: JSON.stringify(searchPayload),
        },
        "поиска пациентов"
    );
}

/**
 * Запрашивает обогащенные данные для пациента.
 */
export async function fetchEnrichedDataForPatient(enrichmentPayload) {
    console.log("[API] Запрос на обогащение данных:", enrichmentPayload);
    return apiFetch(
        "/extension/enrich-data",
        {
            method: "POST",
            body: JSON.stringify(enrichmentPayload),
        },
        "обогащения данных"
    );
}