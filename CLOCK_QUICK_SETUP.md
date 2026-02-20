# Sistema de Reloj de Asistencia - Guía Rápida de Implementación

## 🚀 Inicio Rápido

### 1. Configurar Base de Datos

```bash
# Ejecutar SQL (en psql o pgAdmin)
-- Agregar columna employee_id a empleados
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employee_id VARCHAR(20) UNIQUE NOT NULL DEFAULT '';

-- Crear tabla de asistencia
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL,
  attendance_date DATE NOT NULL,
  check_in_time TIMESTAMP NOT NULL,
  check_out_time TIMESTAMP,
  total_hours DECIMAL(5, 2),
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
  UNIQUE(employee_id, attendance_date)
);

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'employee',
  employee_id VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE
);

-- Asignar IDs a empleados existentes
UPDATE employees SET employee_id = 'EMP' || LPAD(id::text, 6, '0') 
WHERE employee_id IS NULL OR employee_id = '';

-- Crear usuario admin de prueba
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@company.com', 'password', 'admin');
```

### 2. Instalar Dependencias Backend

```bash
cd backend
npm install jsonwebtoken  # Si no está instalado
```

### 3. Verificar Instalación de Frontend

```bash
cd frontend
npm install  # Ejecutar si falta algo
```

### 4. Iniciar el Sistema

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Output: Server running on port 3000

# Terminal 2: Frontend
cd frontend
npm run dev
# Output: Local: http://localhost:5175
```

### 5. Probar Interfaz de Reloj

1. Abre `http://localhost:5175` en el navegador
2. Verás la interfaz de reloj en pantalla completa
3. Ve a la base de datos y obtén un `employee_id` (ej: EMP000001)
4. Ingresa el ID en el campo de entrada
5. Haz clic en "Check In / Check Out"
6. ✅ Deberías ver: "Welcome Juan! Check-in registered at 08:01 AM"

---

## 📋 Estructura de Rutas

### Públicas (Sin Autenticación)

```
GET  /               → Reloj (interfaz kiosko)
POST /api/clock/punch         → Registrar entrada/salida
GET  /api/clock/verify/:id    → Verificar empleado
GET  /api/clock/status/:id    → Obtener estado hoy
POST /api/auth/login          → Iniciar sesión admin
```

### Protegidas (Requieren JWT + Admin)

```
/admin/dashboard    → Panel de control
/admin/employees    → Gestión de empleados
/admin/attendance   → Registros de asistencia
/admin/reports      → Reportes
/admin/payroll      → Nómina
```

---

## 🔐 Autenticación

### Flujo Login Futuro (Admin)

```typescript
// POST /api/auth/login
{
  "username": "admin",
  "password": "password"
}

// Respuesta:
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}

// Token se guarda en localStorage
// Se envía automáticamente en headers protegidos
// Authorization: Bearer <token>
```

### Proteger Rutas en Frontend

```jsx
<ProtectedRoute 
  isAuthenticated={isAuthenticated}
  requiredRole="admin"
  userRole={userRole}
>
  <DashboardPage />
</ProtectedRoute>
```

---

## ⏰ Flujo de Asistencia

### Entrada (Check-In)

```
1. Empleado ingresa su ID: EMP000001
2. Sistema verifica que exista
3. Crea registro en tabla attendance
4. Registra check_in_time
5. Muestra: ✓ "Welcome Juan! Check-in at 08:01"
```

### Salida (Check-Out)

```
1. Empleado ingresa mismo ID
2. Sistema encuentra registro de hoy
3. Verifica que no haya check_out aún
4. Calcula horas: (checkout_time - checkin_time)
5. Registra total_hours en decimal (8.75h)
6. Muestra: ✓ "Check-out registered! Total: 8.75h"
```

### Validaciones

```
❌ ID no existe          → "Employee not found"
❌ Ya hizo check-out     → "You have completed today's shift"
❌ Campo vacío           → "Please enter your ID"
✅ Primera lectura hoy   → Check-In
✅ Segunda lectura hoy   → Check-Out
```

---

## 📊 Ejemplos de Datos

### Registro de Asistencia (BD)

```json
{
  "id": 1,
  "employee_id": "EMP000001",
  "attendance_date": "2026-02-18",
  "check_in_time": "2026-02-18T08:01:30Z",
  "check_out_time": "2026-02-18T16:45:15Z",
  "total_hours": 8.73
}
```

### Respuesta API Punch

```json
{
  "success": true,
  "action": "check_in",
  "message": "Welcome Juan! Check-in registered at 08:01 AM",
  "data": {
    "employee": {
      "id": 1,
      "name": "Juan",
      "position": "Developer",
      "employee_id": "EMP000001"
    },
    "attendance": {
      "id": 123,
      "check_in_time": "2026-02-18T08:01:30Z",
      "check_out_time": null
    }
  }
}
```

---

## 🛠️ Características Implementadas

### 1. ✅ Identificador Único de Empleado
- Columna `employee_id` en tabla `employees`
- Formato: `EMPXXXXXX` (6-8 dígitos)
- Constraint UNIQUE a nivel de base de datos

### 2. ✅ Interfaz de Reloj Profesional
- Pantalla completa (kiosko)
- Teclado numérico en pantalla
- Reloj digital en tiempo real
- Animaciones (verde success, rojo error)
- Sin barra lateral

### 3. ✅ Lógica de Asistencia Backend
- Validación de empleado
- Prevención de duplicados
- Cálculo automático de horas
- Una entrada por empleado por día

### 4. ✅ Protección de Rutas
- JWT authentication
- Middleware de autenticación
- Control de rol (admin)
- ProtectedRoute component

### 5. ✅ Componentes Admin
- AdminLayout (con sidebar)
- Navegación protegida
- Botón de logout
- Soporte dark/light mode

---

## 📱 Componentes Creados

### Backend

```
backend/src/
├─ middleware/
│  └─ auth.ts                    # JWT middleware + admin check
├─ utils/
│  └─ jwt.ts                     # Generar/verificar tokens
├─ services/
│  ├─ auth.service.ts            # Lógica de login
│  └─ clock.service.ts           # Lógica de asistencia
├─ controllers/
│  ├─ auth.controller.ts         # Endpoints de auth
│  └─ clock.controller.ts        # Endpoints de reloj
└─ routes/
   ├─ auth.routes.ts             # Rutas de autenticación
   └─ clock.routes.ts            # Rutas de reloj
```

### Frontend

```
frontend/src/
├─ pages/
│  ├─ Clock.tsx                  # Interfaz principal (pública)
│  └─ Clock.css                  # Estilos kiosko
├─ components/
│  ├─ ProtectedRoute.tsx         # Protección de rutas
│  └─ AdminLayout.tsx            # Layout con sidebar
├─ utils/
│  └─ auth.ts                    # Utilidades de auth
└─ App.tsx                       # Routing refactorizado
```

---

## 🔍 Pruebas Rápidas

### Test 1: Verificar Clock
```bash
# Terminal:
curl -X GET http://localhost:3000/api/clock/verify/EMP000001

# Respuesta esperada:
{
  "exists": true,
  "employee": {"id": 1, "name": "Juan", "position": "Developer"}
}
```

### Test 2: Check-In
```bash
curl -X POST http://localhost:3000/api/clock/punch \
  -H "Content-Type: application/json" \
  -d '{"employee_id": "EMP000001"}'

# Respuesta esperada: success: true, action: "check_in"
```

### Test 3: Check-Out
```bash
curl -X POST http://localhost:3000/api/clock/punch \
  -H "Content-Type: application/json" \
  -d '{"employee_id": "EMP000001"}'

# Respuesta esperada: success: true, action: "check_out", total_hours: 8.XX
```

---

## 🔐 Seguridad Implementada

✅ **Validación de entrada**
- Sanitización de employee_id
- Campos requeridos verificados
- Tipado TypeScript

✅ **Queries parametrizadas**
- Usa $1, $2, etc. (pg library)
- Previene SQL injection

✅ **JWT tokens**
- Firma RSA/HS256
- 24 horas de expiración
- Verificación en cada request

✅ **Middleware de autenticación**
- Verifica token en header
- Valida expiración
- Comprueba rol

---

## ⚠️ Notas Importantes

### Passwords
- **Desarrollo**: Se guardan en texto plano (por simplificar)
- **Producción**: Usar bcrypt hash
```typescript
// En producción:
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 10);
const valid = await bcrypt.compare(input, hash);
```

### Environment Variables
Crear `.env` en `backend/`:
```
JWT_SECRET=your-secret-key-here
PORT=3000
DATABASE_URL=postgresql://...
```

### CORS
Actualmente permite: `http://localhost:5175`
En producción: especificar dominio exacto

---

## 📞 Solución de Problemas

| Problema | Causa | Solución |
|----------|-------|----------|
| "Employee not found" | ID incorrecto | Verifica `employee_id` en BD |
| CORS error | Configuración | Revisa CORS en server.ts |
| Token expirado | Tiempo > 24h | Login nuevamente |
| Conexión BD | PostgreSQL no corre | `sudo service postgresql start` |
| Puerto 3000 ocupado | Otro servicio | `netstat -an \| grep 3000` |

---

## 🎯 Próximos Pasos

1. **Crear UI de Login**
   - Formulario en nueva ruta `/login`
   - Validar credenciales
   - Guardar token

2. **Dashboard Admin**
   - Resumen de asistencia
   - Gráficos de horarios
   - Exportar reportes

3. **Notificaciones**
   - Email en check-in/out
   - Alertas de retrasos
   - SMS opcional

4. **Mejoras**
   - Biometría (fingerprint)
   - Geolocalización
   - Multi-zona horaria

---

## 📜 Archivos Importantes

- `DATABASE_SCHEMA.sql` - Esquema completo
- `CLOCK_SYSTEM_DOCUMENTATION.md` - Documentación detallada
- `backend/src/middleware/auth.ts` - Sistema de autenticación
- `frontend/src/pages/Clock.tsx` - Interfaz de reloj
- `frontend/src/App.tsx` - Routing principal

---

**¡Sistema listo para usar!** ⏰✅

Prueba ingresando en http://localhost:5175 con un ID de empleado válido.
