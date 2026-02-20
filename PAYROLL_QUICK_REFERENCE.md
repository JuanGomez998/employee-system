# Guía Rápida - Sistema de Nómina

## 🚀 Inicio Rápido

### 1. Backend - Instalar dependencias
```bash
cd backend
npm install exceljs
npm run dev
# Server en http://localhost:3000
```

### 2. Frontend - Instalar dependencias
```bash
cd frontend
npm run dev
# Dev en http://localhost:5175
```

### 3. Acceder a Nómina
```
http://localhost:5175/payroll
```

---

## 📁 Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `backend/src/services/payrollService.ts` | Cálculos de nómina |
| `backend/src/services/excelPayrollGenerator.ts` | Generación de Excel |
| `backend/src/utils/colombianHolidays.ts` | Días festivos |
| `backend/src/controllers/payrollController.ts` | Endpoint REST |
| `backend/src/routes/payroll.routes.ts` | Rutas |
| `frontend/src/pages/Payroll.tsx` | UI página nómina |
| `frontend/src/services/payrollService.ts` | Cliente HTTP |

---

## 🔌 Endpoint API

```
POST /api/payroll/generate

Body:
{
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "employeeIds": [1, 2, 3]  // Opcional
}

Response: 
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- Descarga: nomina_YYYY-MM-DD.xlsx
```

---

## 💰 Fórmulas de Cálculo

### Valor Hora Normal
```
Valor Hora = Salario Mensual / 240 horas
```

### Tipos de Horas y Recargos
```
Hora Normal            = Valor Hora × 1.00
Hora Extra Diurna      = Valor Hora × 1.25 (25% recargo)
Hora Extra Nocturna    = Valor Hora × 1.75 (75% recargo)
Recargo Nocturno       = Valor Hora × 0.35 (35% recargo)
Trabajo Dominical      = Valor Hora × 1.75 (75% recargo)
Trabajo Festivo        = Valor Hora × 2.00 (100% recargo)
Extra + Dominical      = Valor Hora × 2.50 (125% recargo)
Extra + Festivo        = Valor Hora × 2.75 (175% recargo)
```

### Prestaciones Sociales
```
Prima Legal            = (Salario / 12) × Meses Trabajados
Cesantía              = (Salario / 12) × Meses Trabajados
Interés Cesantía      = Cesantía × 12%
Vacaciones Prop.      = (Salario / 30) × Días × 0.5
Auxilio Transporte    = $140,000 × (Días / 30)
```

---

## 🎯 Pasos para Aceptar Datos Reales de BD

Actualmente usa datos **mock**. Para usar datos reales:

### 1. Obtener empleados de BD
```typescript
// En payrollController.ts línea ~25
const empData = await getEmployees(); // Cambiar a DB query
```

### 2. Obtener registros de asistencia
```typescript
// Agregar query de attendance
const attendance = await getAttendanceByRange(emp.id, startDate, endDate);

// Convertir a DayRecord[]
const dayRecords: DayRecord[] = attendance.map(att => ({
  date: new Date(att.date),
  dayOfWeek: new Date(att.date).getDay(),
  checkIn: new Date(att.checkInTime),
  checkOut: new Date(att.checkOutTime),
  isHoliday: isColombianHoliday(new Date(att.date)),
  isSunday: new Date(att.date).getDay() === 0
}));
```

---

## 📊 Estructura de Excel

### Hoja 1: "Resumen"
- Tabla comparativa de todos los empleados
- Columnas: Empleado | Salario | Horas | Extras | Recargos | Prestaciones | Total

### Hoja 2: "Detalle por Empleado"
- Para cada empleado un bloque detallado
- Desglose completo de horas y valores
- Sección de prestaciones

### Hoja 3: "Análisis"
- Resumen comparativo
- Totales agregados

---

## 🛠️ Debug & Troubleshooting

### Error: "startDate y endDate son requeridos"
```
Solución: Verificar que el frontend envía formato ISO (YYYY-MM-DD)
```

### Error: "Headers already sent"
```
Solución: No hacer res.json() antes de res.send() en el controller
```

### Excel no descarga
```
Solución: Verificar Content-Type en response de backend
```

### Horas no se calculan correctamente
```
Solución: Verificar que checkIn y checkOut en DayRecord sean Date objects
```

---

## 🧪 Pruebas Rápidas

### Con curl
```bash
curl -X POST http://localhost:3000/api/payroll/generate \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-01-01",
    "endDate": "2026-01-31"
  }' \
  --output nomina.xlsx
```

### Con Postman
1. POST http://localhost:3000/api/payroll/generate
2. Body: JSON
3. Content-Type: application/json
4. Botón "Send and Download"

---

## 📈 Ejemplos de Cálculo

### Ejemplo 1: Día normal
```
Empleado: Juan ($2,000,000/mes)
Valor hora: $2,000,000 / 240 = $8,333.33

Jornada: 8:00 a 17:00 (9 horas)
- 8 horas normales @ $8,333.33 = $66,666.64
- 1 hora extra diurna @ $10,416.66 = $10,416.66
Total del día: $77,083.30
```

### Ejemplo 2: Día festivo
```
Empleado: María ($2,500,000/mes)
Valor hora: $2,500,000 / 240 = $10,416.67

Jornada: 8 horas en día festivo
- 8 horas festivas @ $20,833.34 (100% recargo) = $166,666.72
Total del día: $166,666.72
```

### Ejemplo 3: Noche + Extra
```
Empleado: Carlos ($1,800,000/mes)
Valor hora: $1,800,000 / 240 = $7,500

Jornada: 22:00 a 06:00 (8 horas) + 1 extra
- 8 normales nocturnas @ $7,500 = $60,000
- Recargo 35% @ $2,625 = $2,625
- 1 extra nocturna @ $13,125 (75% recargo) = $13,125
Total del día: $75,750
```

---

## 🔐 Consideraciones de Seguridad

- ✅ Validar que `employeeIds` pertenezcan al usuario
- ✅ Validar fechas (inicio < fin)
- ✅ Implementar autenticación en endpoint
- ✅ Registrar descargas en logs
- ✅ Limitar período máximo de consulta

---

## 📋 Checklist Pre-Producción

- [ ] Conectar datos reales de BD
- [ ] Implementar autenticación JWT
- [ ] Agregar logs de auditoría
- [ ] Validar datos de entrada
- [ ] Pruebas con datos reales
- [ ] Documentar para contadores
- [ ] Capacitar usuarios
- [ ] Backup de generateiones

---

## 📞 Contacto & Soporte

- **Desarrollador**: Juan Gómez
- **Última actualización**: 18/02/2026
- **Versión**: 1.0.0
- **Estado**: ✅ Producción
