-- Database schema and migration guide for Employee Attendance System
-- Primary employee identifier: cedula (National ID)

-- ---------------------------------------------------------------------
-- 1) Employees
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
  cedula VARCHAR(20) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  position VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE employees ADD COLUMN IF NOT EXISTS cedula VARCHAR(20);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS name VARCHAR(120);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS email VARCHAR(120);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS position VARCHAR(120);

-- Backfill cedula from legacy employee_id (if present)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'employee_id'
  ) THEN
    EXECUTE '
      UPDATE employees
      SET cedula = employee_id
      WHERE (cedula IS NULL OR cedula = '''')
        AND employee_id IS NOT NULL
        AND employee_id <> ''''
    ';
  END IF;
END $$;

ALTER TABLE employees ALTER COLUMN cedula SET NOT NULL;
ALTER TABLE employees ADD CONSTRAINT employees_cedula_unique UNIQUE (cedula);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'employees'
      AND constraint_name = 'employees_cedula_numeric_check'
  ) THEN
    ALTER TABLE employees
      ADD CONSTRAINT employees_cedula_numeric_check
      CHECK (cedula ~ '^[0-9]+$') NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'employees'
      AND constraint_name = 'employees_name_letters_check'
  ) THEN
    ALTER TABLE employees
      ADD CONSTRAINT employees_name_letters_check
      CHECK (name ~ '^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ[:space:]]+$') NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'employees'
      AND constraint_name = 'employees_position_letters_check'
  ) THEN
    ALTER TABLE employees
      ADD CONSTRAINT employees_position_letters_check
      CHECK (position ~ '^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ[:space:]]+$') NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'employees'
      AND constraint_name = 'employees_email_format_check'
  ) THEN
    ALTER TABLE employees
      ADD CONSTRAINT employees_email_format_check
      CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$') NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'employees'
      AND constraint_type = 'PRIMARY KEY'
      AND constraint_name = 'employees_pkey'
  ) THEN
    ALTER TABLE employees ADD CONSTRAINT employees_pkey PRIMARY KEY (cedula);
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 2) Attendance
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  employee_cedula VARCHAR(20) NOT NULL,
  attendance_date DATE NOT NULL,
  check_in_time TIMESTAMP NOT NULL,
  check_out_time TIMESTAMP,
  total_hours DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_cedula) REFERENCES employees(cedula) ON DELETE CASCADE,
  UNIQUE(employee_cedula, attendance_date)
);

ALTER TABLE attendance ADD COLUMN IF NOT EXISTS employee_cedula VARCHAR(20);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'attendance' AND column_name = 'employee_id'
  ) THEN
    EXECUTE '
      UPDATE attendance
      SET employee_cedula = employee_id
      WHERE (employee_cedula IS NULL OR employee_cedula = '''')
        AND employee_id IS NOT NULL
        AND employee_id <> ''''
    ';
  END IF;
END $$;

ALTER TABLE attendance ALTER COLUMN employee_cedula SET NOT NULL;

-- ---------------------------------------------------------------------
-- 3) Users
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'employee',
  employee_cedula VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_cedula) REFERENCES employees(cedula) ON DELETE SET NULL
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_cedula VARCHAR(20);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'employee_id'
  ) THEN
    EXECUTE '
      UPDATE users
      SET employee_cedula = employee_id
      WHERE (employee_cedula IS NULL OR employee_cedula = '''')
        AND employee_id IS NOT NULL
        AND employee_id <> ''''
    ';
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 4) Biometric Removal
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS biometric_credentials CASCADE;

-- ---------------------------------------------------------------------
-- 5) Legacy Cleanup (remove employee_id dependencies)
-- ---------------------------------------------------------------------
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_new_employee_id_fkey;
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_new_employee_id_attendance_date_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_employee_id_fkey;

ALTER TABLE attendance DROP COLUMN IF EXISTS employee_id;
ALTER TABLE users DROP COLUMN IF EXISTS employee_id;
ALTER TABLE employees DROP COLUMN IF EXISTS employee_id;

-- ---------------------------------------------------------------------
-- 6) Indexes
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_attendance_employee_cedula ON attendance(employee_cedula);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
