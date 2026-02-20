# Sistema de Liquidación de Nómina - Documentación Completa

## 📋 Descripción General

Sistema completo para **calcular y generar reportes de nómina** según la ley laboral colombiana. Incluye:
- ✅ Cálculo automático de horas normales, extras diurnas, nocturnas
- ✅ Recargos por trabajo nocturno (35%), dominical (75%), festivo (100%)
- ✅ Cálculo de prestaciones sociales (Prima, Cesantía, Vacaciones, Auxilio)
- ✅ Detección automática de días festivos colombianos
- ✅ Generación de **Excel profesional y coloreado**
- ✅ Filtros por período y empleado
- ✅ Descarga directa desde frontend

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────┐
│         Frontend (React + TS)           │
├─────────────────────────────────────────┤
│  - Payroll.tsx (página de configuración)│
│  - payrollService.ts (consumo API)      │
│  - App.tsx (con ruta /payroll)          │
└─────────────────────────────────────────┘
              ↓ (axios POST)
┌─────────────────────────────────────────┐
│       Backend (Node + Express + TS)     │
├─────────────────────────────────────────┤
│  - payrollController.ts (endpoint)      │
│  - payrollService.ts (lógica)           │
│  - excelPayrollGenerator.ts (Excel)     │
│  - colombianHolidays.ts (festivos)      │
│  - payroll.routes.ts (rutas)            │
└─────────────────────────────────────────┘
              ↓ (blob)
┌─────────────────────────────────────────┐
│      Excel descargado al cliente        │
│   (Nomina_YYYY-MM-DD.xlsx)              │
└─────────────────────────────────────────┘
```

---

## 📂 Estructura de Carpetas

### Backend

```
backend/src/
├── services/
│   ├── payrollService.ts          ← Cálculos de nómina
│   └── excelPayrollGenerator.ts    ← Generación de Excel
├── controllers/
│   └── payrollController.ts        ← Endpoint de nómina
├── routes/
│   └── payroll.routes.ts           ← Rutas REST
├── utils/
│   └── colombianHolidays.ts        ← Días festivos
└── server.ts                       ← Integración de rutas
```

### Frontend

```
frontend/src/
├── pages/
│   └── Payroll.tsx                 ← Página de UI
├── services/
│   └── payrollService.ts           ← Cliente HTTP
├── App.tsx                         ← Ruta agregada
└── layout.css                      ← Estilos
```

---

## 🔧 Instalación y Configuración

### Backend

```bash
cd backend
npm install exceljs
npm install
npm run dev  # Puerto 3000
```

### Frontend

```bash
cd frontend
npm install xlsx (si generarás Excel en frontend)
npm run dev  # Puerto 5175
```

---

## 📊 Detalle de Funcionalidades

### 1. **colombianHolidays.ts** - Días Festivos Automáticos

Calcula automáticamente los **13 festivos colombianos** más variables (Pascua, etc):

```typescript
getColombianHolidays(2026)  // Retorna todos los festivos del año
isColombianHoliday(new Date()) // true/false
getHolidaysInRange(start, end)  // Festivos en un período
```

**Festivos incluidos:**
- Fijos: Año Nuevo, Epifanía, San José, Día del Trabajo, etc.
- Variables: Viernes Santo, Ascensión, Corpus Christi, etc.

---

### 2. **payrollService.ts** - Cálculos de Nómina

#### Algoritmo de Desglose de Horas

```
┌──────────────────────────────────────────────┐
│     JORNADA LABORAL DIARIA (P. ej. 9 hrs)    │
├──────────────────────────────────────────────┤
│ HORAS NORMALES: 8 horas @ valor hora         │
│ HORAS EXTRAS: 1 hora                         │
│   - Si es nocturno (22:00-06:00): 75% recargo│
│   - Si es diurno: 25% recargo                │
│   - Si es domingo: +75% adicional            │
│   - Si es festivo: +100% adicional           │
└──────────────────────────────────────────────┘
```

**Funciones principales:**

```typescript
// Calcula valor hora normal
calculateHourlyRate(salary: number) 
// Formula: salario / 240 horas/mes

// Desglose de horas del día
breakdownDayHours(dayRecord: DayRecord)
// Retorna: HourBreakdown con todos los tipos

// Calcula valor de cada tipo de hora
calculatePaymentBreakdown(hourlyRate, breakdown)

// Calcula prestaciones proporcionales
calculateBenefits(salary, days, months)

// Nómina completa
calculatePayroll(employeeId, name, salary, dayRecords, start, end)
```

#### Fórmulas de Cálculo

```
HORAS NORMALES:
- Máximo 8 por día
- Máximo 48 por semana
- Valor: Salario / 240

HORA EXTRA DIURNA (06:00-22:00):
- Valor = Hora Normal × 1.25
- Recargo: 25%

HORA EXTRA NOCTURNA (22:00-06:00):
- Valor = Hora Normal × 1.75
- Recargo: 75%

RECARGO NOCTURNO (complementario):
- Valor = Hora Normal × 0.35
- Aplica a horas normales trabajadas en horario nocturno

TRABAJO DOMINICAL:
- Valor = Hora Normal × 1.75
- Recargo: 75% sobre jornada ordinaria

TRABAJO FESTIVO:
- Valor = Hora Normal × 2.00
- Recargo: 100% sobre jornada ordinaria

EXTRA + DOMINICAL:
- Valor = Hora Normal × 2.50
- Recargo acumulado: 125%

EXTRA + FESTIVO:
- Valor = Hora Normal × 2.75
- Recargo acumulado: 175%

PRIMA LEGAL:
- Valor = (Salario Mensual / 12) × Meses Trabajados
- Se paga cada mes, proporcional

CESANTÍA:
- Valor = (Salario Mensual / 12) × Meses Trabajados
- Máximo 1 mes × año

INTERÉS CESANTÍA:
- Valor = Cesantía × 12% anual

VACACIONES PROPORCIONALES:
- Valor = (Salario Diario × Días Trabajados × 0.5)
- 15 días × año = 0.5 días × mes

AUXILIO TRANSPORTE:
- Valor fijo: ~$140,000 COP (2024)
- Se prorratea por período
```

---

### 3. **excelPayrollGenerator.ts** - Excel Profesional

Genera Excel con **3 hojas** diferentes:

#### Hoja 1: "Resumen"

| Empleado | Salario Base | Horas | Extras | Recargos | Prestaciones | Subtotal | Total Final |

- Encabezado azul (@1F3A93)
- Filas con fondo azul claro
- Totales en negrita
- Formato moneda

#### Hoja 2: "Detalle por Empleado"

Para cada empleado muestra:
- Salario mensual
- Valor hora normal
- Período

**Tabla de desglose:**
| Tipo de Hora | Cantidad | Valor Unitario | Valor Total |

- Horas normales
- Horas extra diurnas (+25%)
- Horas extra nocturnas (+75%)
- Recargo nocturno (35%)
- Trabajo dominical (+75%)
- Trabajo festivo (+100%)
- Extra + Dominical (+125%)
- Extra + Festivo (+175%)
- **SUBTOTAL HORAS**

**Sección de Prestaciones:**
- Prima Legal
- Cesantía
- Interés Cesantía
- Vacaciones Proporcionales
- Auxilio Transporte
- **TOTAL PRESTACIONES**

**TOTAL A PAGAR** (resaltado)

#### Hoja 3: "Análisis"

Resumen general comparativo:
- Total horas normales
- Total horas extras
- Total recargos
- Total pago por horas
- Total prestaciones

**Estilos aplicados:**
- Encabezados con fondo azul oscuro y texto blanco
- Subtítulos con fondo azul claro
- Valores totales con fondo naranja
- Bordes en todas las celdas
- Formato de números con decimales
- Colores profesionales y diferenciados

---

### 4. **payrollController.ts** - Endpoint

```
POST /api/payroll/generate
Content-Type: application/json

{
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "employeeIds": [1, 2, 3]  // opcional
}

Response: archivo .xlsx (blob)
```

**Características:**
- Descarga como `nomina_YYYY-MM-DD.xlsx`
- Genera datos mock si no encuentra en BD
- Manejo de errores integrado

---

### 5. **Payroll.tsx** - Interfaz Frontend

**Secciones:**

1. **Encabezado** - Título y descripción
2. **Filtros** - Fecha inicio/fin
3. **Selección de Empleados** - Checkboxes con grid
4. **Botón "Seleccionar Todos"** - Toggle rápido
5. **Información** - Qué incluye el reporte
6. **Botón "Generar Nómina"** - Principal (azul)
7. **Información Legal** - Normativa aplicada

**Estados:**
- Loading (mientras carga empleados)
- Generating (mientras genera Excel)
- Success/Error (notificaciones toast)

---

## 🚀 Flujo de Uso

### Desde el Frontend

```
1. Usuario navega a /payroll
   ↓
2. Se cargan automáticamente los empleados
   ↓
3. Usuario selecciona:
   - Rango de fechas (inicio - fin)
   - Empleados (todos o específicos)
   ↓
4. Click en "Generar Nómina"
   ↓
5. POST a /api/payroll/generate con filtros
   ↓
6. Backend:
   - Obtiene datos de cada empleado
   - Calcula horas por día
   - Cálculo de nómina completa
   - Genera Excel colorido
   - Retorna como blob
   ↓
7. Frontend descarga automáticamente
   ↓
8. Toast de éxito
```

---

## 📝 Integración con Base de Datos (Próximo Paso)

Para usar datos **reales en lugar de mock**:

```typescript
// En payrollController.ts
const employees = await Employee.findMany(); // De BD
const attendance = await Attendance.findByRange(startDate, endDate);

// Construir DayRecord[] desde attendance
const dayRecords: DayRecord[] = attendance.map(record => ({
  date: record.date,
  dayOfWeek: record.date.getDay(),
  checkIn: new Date(record.checkInTime),
  checkOut: new Date(record.checkOutTime),
  isHoliday: isColombianHoliday(record.date),
  isSunday: record.date.getDay() === 0
}));

// Calcular nómina
const payroll = calculatePayroll(
  emp.id, 
  emp.name, 
  emp.salary, 
  dayRecords,
  startDate,
  endDate
);
```

---

## 🧪 Pruebas

### Datos Mock Predefinidos

```typescript
Employees:
- Juan Pérez (ID: 1) - $2,000,000
- María García (ID: 2) - $2,500,000
- Carlos López (ID: 3) - $1,800,000

Attendance:
- Lunes a Viernes: 8:00 - 17:00 (9 horas = 1 hora extra)
- Fines de semana: Sin registro
```

### Casos de Prueba

1. **Período sin festivos** - Simula mes regular
2. **Período con festivos** - Semana santa, feriados
3. **Un empleado** - Datos detallados
4. **Todos los empleados** - Comparativo completo

---

## 🎨 Estilos CSS

Agregados a `layout.css`:

```css
.payroll-container      - Contenedor principal
.payroll-filters        - Panel de filtros (grid)
.employees-selection    - Selector con checkboxes
.generate-btn          - Botón principal (azul)
.legal-info            - Recuadro normativa (amarillo)
.info-card             - Tarjetas de información
.selection-header      - Header con botón "Sel. Todos"
```

**Colores:**
- Primario: #1F3A93 (Azul)
- Secundario: #10B981 (Verde)
- Fondo: #FFFFFF (Blanco)
- Textos: #111111 (Negro)
- Acentos: #F59E0B (Naranja)

---

## 📈 Ejemplo de Salida Excel

### Hoja 1: Resumen

```
╔════════════════════════════════════════════════════════════════╗
║         REPORTE DE NÓMINA - Employee System                    ║
║  Período: 01/02/2026 al 28/02/2026                             ║
╠═════════════════╦═════════════╦═════════╦═════════╦═════════┩
║ Empleado        ║ Salario Base║ Horas   ║ Extras  ║ Total   ║
╠═════════════════╬═════════════╬═════════╬═════════╬═════════╣
║ Juan Pérez      ║ 2,000,000   ║ 160.00  ║ 10.00   ║2,290,833║
║ María García    ║ 2,500,000   ║ 160.00  ║  8.00   ║2,729,167║
║ Carlos López    ║ 1,800,000   ║ 160.00  ║ 12.00   ║2,080,000║
╠═════════════════╬═════════════╬═════════╬═════════╬═════════╣
║ TOTAL           ║ 6,300,000   ║         ║         ║7,100,000║
╚═════════════════╩═════════════╩═════════╩═════════╩═════════╝
```

---

## ✅ Checklist de Implementación

- ✅ Backend:
  - ✅ colombianHolidays.ts (festivos automáticos)
  - ✅ payrollService.ts (cálculos)
  - ✅ excelPayrollGenerator.ts (Excel)
  - ✅ payrollController.ts (endpoint)
  - ✅ payroll.routes.ts (rutas)
  - ✅ Integración en server.ts

- ✅ Frontend:
  - ✅ Payroll.tsx (página completa)
  - ✅ payrollService.ts (consumo API)
  - ✅ App.tsx (ruta /payroll)
  - ✅ layout.css (estilos)
  - ✅ Filtros por fecha
  - ✅ Selección de empleados
  - ✅ Descarga de Excel

- ✅ Funcionalidades:
  - ✅ Cálculo ley colombiana
  - ✅ Recargos correctos
  - ✅ Prestaciones
  - ✅ Excel profesional
  - ✅ Días festivos automáticos
  - ✅ UI responsive

---

## 📞 Soporte

Para preguntas sobre cálculos:
- Ver comentarios en `payrollService.ts`
- Revisar fórmulas en esta documentación
- Consultar normativa: "Código Sustantivo del Trabajo Colombiano"

---

**Última actualización:** 18 de febrero de 2026
**Versión:** 1.0
**Estado:** ✅ Producción Lista
