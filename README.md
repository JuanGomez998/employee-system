🧑‍💼 Employee Management System

Sistema de Gestión de Empleados desarrollado para administrar empleados, registrar entradas y salidas, y gestionar información interna de la empresa de manera eficiente y organizada.

📌 Descripción del Proyecto

El Employee Management System es una aplicación web que permite:

Registrar empleados.

Editar y eliminar empleados.

Registrar entrada y salida diaria mediante un ID único.

Visualizar historial de asistencia.

Administrar información laboral básica.

El sistema está diseñado para que la vista principal sea el registro de asistencia, permitiendo que cada empleado marque su entrada y salida al llegar o salir de la empresa.

🛠️ Tecnologías Utilizadas
Backend

Node.js

Express.js

TypeScript (opcional según tu implementación)

PostgreSQL

TypeORM (si estás usando arquitectura Onion)

Frontend

React.js (si aplica)

HTML5

CSS3

Bootstrap

Testing

Jest

Supertest

Control de versiones

Git

GitHub

🏗️ Arquitectura

El proyecto sigue una arquitectura basada en separación de responsabilidades:

src/
│
├── application/
│   ├── use-cases/
│
├── domain/
│   ├── entities/
│   ├── interfaces/
│
├── infrastructure/
│   ├── database/
│   ├── controllers/
│   ├── routes/
│
└── main.ts / app.ts

Se implementa el patrón:

Controller → recibe la petición

Service / Use Case → contiene la lógica de negocio

Repository → acceso a base de datos

🚀 Funcionalidades Principales
👤 Gestión de Empleados

Crear empleado

Editar empleado

Eliminar empleado

Listar empleados

⏰ Registro de Asistencia

Registro de entrada por ID único

Registro de salida por ID único

Validación de entrada duplicada

Historial de marcaciones

Vista principal enfocada en asistencia

📊 Reportes (Opcional)

Total de horas trabajadas

Historial por rango de fechas

Registro por empleado

🗄️ Base de Datos
Tabla: employees
Campo	Tipo	Descripción
id	UUID / INT	Identificador único
name	VARCHAR	Nombre completo
email	VARCHAR	Correo electrónico
position	VARCHAR	Cargo
created_at	TIMESTAMP	Fecha de creación
Tabla: attendance
Campo	Tipo	Descripción
id	UUID / INT	Identificador único
employee_id	FK	Relación con empleado
check_in	TIMESTAMP	Hora de entrada
check_out	TIMESTAMP	Hora de salida

git clone https://github.com/tu-usuario/employee-management-system.git
cd employee-management-system

npm install

PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=employees_db

npm run typeorm migration:run

npm run start

npm run test

npm run test:e2e

🔐 Validaciones Implementadas

No se permite marcar salida sin haber marcado entrada.

No se permite marcar doble entrada el mismo día.

Validación de ID único por empleado.

Manejo de errores centralizado.

📌 Vista Principal del Sistema

La pantalla inicial del sistema está diseñada para:

Ingresar ID del empleado.

Registrar entrada automáticamente si no existe registro del día.

Registrar salida si ya existe entrada.

Mostrar mensaje de confirmación.

🌱 Mejoras Futuras

Autenticación con JWT.

Roles (Administrador / Empleado).

Dashboard con métricas.

Exportar reportes en PDF o Excel.

Notificaciones automáticas.

Integración con lector biométrico.

👨‍💻 Autor

Juan Gómez
Desarrollador en formación – Análisis y Desarrollo de Software
Node.js | TypeScript | PostgreSQL | Arquitectura Onion

📄 Licencia

Este proyecto es de uso académico y demostrativo.
