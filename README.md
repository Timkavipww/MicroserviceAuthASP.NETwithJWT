# Проект микросервисов на ASP.NET Core и React

В этом репозитории находятся три сервиса, взаимодействующие друг с другом внутри одной Docker-сети:

* auth (порт 8001) — сервис авторизации на ASP.NET Core
* backend (порт 8000) — основной API на ASP.NET Core
* frontend (порт 3000) — React-приложение для отладки взаимодействия

## Содержание

1. Описание архитектуры
2. Требования
3. Запуск проекта
4. Настройка CORS
5. Взаимодействие микросервисов
6. Аутентификация через JWT и refresh token
7. React-фронтенд
8. API и Swagger

## 1. Описание архитектуры

В проекте используется две ASP.NET Core-службы и одна React-приложение. Все они соединяются через общую Docker-сеть `dev`.

Каждый микросервис работает в своём контейнере и доступен по локальным портам:

* auth:

  * ип: localhost
  * порт: 8001
* backend:

  * ип: localhost
  * порт: 8000
* frontend:

  * ип: localhost
  * порт: 3000

## 2. Требования

* Docker и Docker Compose
* .NET 8.0 SDK (для локальной сборки)
* Node.js и npm (для фронтенда)

## 3. Запуск проекта

1. Клонировать репозиторий:

   ```bash
   git clone https://github.com/Timkavipww/MicroserviceAuthASP.NETwithJWT
   cd MicroserviceAuthASP.NETwithJWT
   ```

2. Запустить в фоне все сервисы:

   ```bash
   docker compose up --build -d
   ```

3. Открыть браузер:

   * auth: [http://localhost:8001/swagger](http://localhost:8001/swagger)
   * backend: [http://localhost:8000/swagger](http://localhost:8000/swagger)
   * frontend: [http://localhost:3000](http://localhost:3000)

## 4. Настройка CORS

Оба сервиса ASP.NET Core (auth и backend) настроены с политикой CORS, разрешающей запросы только с origin `http://localhost:3000`.

Пример конфигурации в Program.cs:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontendpolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

app.UseCors("frontendpolicy");
```

## 5. Взаимодействие микросервисов

* frontend делает запросы к backend через Axios-инстанс `backendApi`, который автоматически добавляет JWT из localStorage.
* при получении 401-инструкций `backendApi` вызывает `authApi` для обновления токена по эндпоинту `/auth/refresh`.
* `authApi` настроен на `http://localhost:8001` и может принимать запросы `/auth/login` и `/auth/refresh`.

## 6. Аутентификация через JWT и refresh token

### flow при логине

* фронтенд кликает на кнопку "Войти"
* происходит POST-запрос `authApi.post('/auth/login')` с мок-данными `{ username, password }`
* сервер возвращает JSON с двумя токенами:

  * access\_token (JWT, короткий срок жизни)
  * refresh\_token (длинный срок жизни)
* оба токена сохраняются в localStorage (для отладки, временно и небезопасно)

### обновление access\_token

* при 401 от API-интерцептора Axios:

  * выполняется POST-запрос к `/auth/refresh` с DTO `{ refreshToken }`
  * сервер проверяет валидность и срок жизни refresh\_token, деактивирует старый
  * возвращает новый access\_token и новый refresh\_token
  * фронтенд перезаписывает оба токена в localStorage и повторяет оригинальный запрос

## 7. React-фронтенд

В папке `frontend/src/App.tsx` реализовано приложение с тремя кнопками для отладки:

* "Войти" — отправляет логин и сохраняет токены
* "Получить без авторизации" — GET `/auth/without` через `backendApi`
* "Получить с авторизацией" — GET `/auth/with` через `backendApi`
* "Выйти" — очищает localStorage и сбрасывает состояние

Код фронтенда находится в `frontend/src/api/axiosInstance.ts`, где:

* `authApi` — Axios-инстанс для auth-сервиса на порту 8001
* `backendApi` — Axios-инстанс для backend-сервиса на порту 8000, с request/response interceptor

## 8. API и Swagger

Обе службы ASP.NET Core имеют подключённый Swagger UI для быстрого тестирования API.

* auth: [http://localhost:8001/swagger](http://localhost:8001/swagger)
* backend: [http://localhost:8000/swagger](http://localhost:8000/swagger)

Там можно быстро вызывать:

* POST `/auth/login` (логин)
* POST `/auth/refresh` (обновление токена)
* GET `/auth/with` (пример защищённого ендпоинта)
* GET `/auth/without` (публичный endpoint)

---

© 2025 olddarkkid. Все права защищены.
