# Backend - Employee System

Guía rápida para ejecutar, probar y diagnosticar el backend en entorno local y CI.

## 1) Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## 2) Variables de entorno

Crea un archivo .env (opcional) o exporta variables en consola:

- DB_HOST=localhost
- DB_PORT=5432
- DB_USER=postgres
- DB_PASSWORD=1234
- DB_NAME=employee_system
- JWT_SECRET=your-secret-key-change-in-production

Para pruebas automatizadas:

- NODE_ENV=test
- DB_NAME=employee_system_test

## 3) Instalación y ejecución local

Desde la raíz del repositorio:

1. Instalar dependencias backend
   npm install --prefix backend

2. Levantar backend en desarrollo
   npm run dev --prefix backend

3. Build de producción
   npm run build --prefix backend

4. Ejecutar build
   npm run start --prefix backend

## 4) Scripts de pruebas

- Unitarias
  npm run test:unit --prefix backend

- Integración
  npm run test:integration --prefix backend

- E2E
  npm run test:e2e --prefix backend

- Cobertura (mínimo 80%)
  npm run test:coverage --prefix backend

## 5) Flujo E2E cubierto

Las pruebas E2E validan:

1. Crear empleado
2. Marcar entrada
3. Marcar salida
4. Consultar historial

Archivo principal E2E:

- tests/e2e/attendance-flow.e2e.test.ts

## 6) Reglas de negocio validadas

- No permitir empleados duplicados (409)
- No permitir marcar entrada dos veces seguidas (409)
- No permitir marcar salida sin entrada previa (400)
- Empleado inexistente (404)
- Payload inválido (400)

## 7) CI con GitHub Actions

Pipeline configurado en:

- .github/workflows/ci.yml

El flujo hace:

1. Checkout del repositorio
2. Setup de Node 20
3. Levanta PostgreSQL en servicio de CI
4. Instala dependencias
5. Aplica esquema SQL
6. Ejecuta tests con cobertura
7. Ejecuta build
8. Falla si cualquier paso falla

## 8) Troubleshooting

### Error: Missing script dev

Causa:
- Ejecutar npm run dev en la raíz del repo.

Solución:
- Usar npm run dev --prefix backend

### Error 401 No authorization token provided

Causa:
- Falta cabecera Authorization en endpoints protegidos.

Solución:
- Enviar Authorization: Bearer <token> tras login en /api/auth/login

### Error creating employee

Causa común:
- Payload inválido o token ausente.

Solución:
- Verificar body JSON: cedula, name, email, position
- Verificar rol admin para /api/employees

### Formato de hora del reloj inconsistente

Estado actual:
- Estandarizado a formato 24h en frontend.

### PowerShell y JSON en requests

Recomendación:
- Usar Invoke-RestMethod + ConvertTo-Json para evitar problemas de comillas.

Ejemplo login:

$body = @{ username = '1001'; password = '1001' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/auth/login' -ContentType 'application/json' -Body $body

Nota:
- Al iniciar backend, si no existe usuario admin, se crea automáticamente uno por defecto.
- Puedes sobrescribirlo con variables de entorno: DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_EMAIL.

## 9) Estructura profesional aplicada

- Controllers: capa HTTP
- UseCases: reglas de negocio
- Repositories: acceso a datos
- DTOs: validación de entrada
- Middleware de errores: manejo centralizado

Carpetas clave:

- src/controllers
- src/usecases
- src/repositories
- src/dtos
- src/middleware
- src/core
