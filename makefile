# Makefile for managing Docker-based FastAPI app

include .env
export


# --- Development ---
up:
	docker compose up --build

down:
	docker compose down

bash:
	docker exec -it ${DEV_CONTAINER_NAME} bash

# --- Production ---
up-prod:
	docker compose -f docker-compose.prod.yml up --build -d

down-prod:
	docker compose -f docker-compose.prod.yml down

logs-prod:
	docker compose -f docker-compose.prod.yml logs -f app

bash-prod:
	docker exec -it ${PROD_CONTAINER_NAME} bash


# --- Code Quality ---
# Этот блок содержит команды для проверки и улучшения качества кода.
# Они выполняются на вашей локальной машине, а не внутри Docker-контейнера.

# Команда `lint`: Проверяет код на наличие ошибок и нарушений стиля, НО НЕ ИЗМЕНЯЕТ ФАЙЛЫ.
# Идеально подходит для запуска в CI/CD (системах автоматической сборки) или перед коммитом,
# чтобы убедиться, что вы не добавляете в репозиторий "грязный" код.
# Если хотя бы одна из команд найдет проблему, `make lint` завершится с ошибкой.
lint:
	# ruff check .: Запускает линтер ruff для поиска потенциальных ошибок и проблем в текущей директории.
	@echo "🔍 Проверка кода с помощью ruff..."
	ruff check .

	# black --check .: Проверяет, отформатирован ли код согласно стандарту Black, не изменяя файлы.
	@echo "💅 Проверка форматирования с помощью black..."
	black --check .

	# isort --check-only .: Проверяет, отсортированы ли импорты, не изменяя файлы.
	@echo "📚 Проверка сортировки импортов с помощью isort..."
	isort --check-only .

	@echo "✅ Код чистый!"


# Команда `format`: Автоматически исправляет все найденные проблемы со стилем.
# Запускайте эту команду перед коммитом, чтобы ваш код всегда был чистым и отформатированным.
format:
	# ruff --fix .: Автоматически исправляет все проблемы, которые ruff может исправить сам.
	@echo "🔧 Исправление ошибок с помощью ruff..."
	ruff --fix .

	# black .: Форматирует весь код в проекте согласно стандарту Black.
	@echo "🎨 Форматирование кода с помощью black..."
	black .

	# isort .: Сортирует все импорты в проекте.
	@echo "📦 Сортировка импортов с помощью isort..."
	isort .

	@echo "✨ Код отформатирован!"


# --- Common ---
clean:
	docker system prune -a --volumes -f