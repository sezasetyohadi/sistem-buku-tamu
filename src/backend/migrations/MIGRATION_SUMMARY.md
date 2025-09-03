# Database Migration Summary

This document outlines the complete database migration structure recreated from the SQL dump.

## Migration Files Created

### 1. Core Tables (No Dependencies)
- `01_create_admin_table.migration.ts` - Admin users table
- `02_create_bidang_tujuan_table.migration.ts` - Department/division lookup
- `03_create_pendidikan_terakhir_table.migration.ts` - Education level lookup
- `04_create_profesi_table.migration.ts` - Profession lookup
- `05_create_tujuan_kunjungan_table.migration.ts` - Visit purpose lookup

### 2. Main Entity Tables
- `06_create_daftar_tamu_table.migration.ts` - Guest registry (main table)
- `07_create_daftar_tamu_triggers.migration.ts` - Status triggers for guest registry

### 3. Token and Messaging
- `08_create_tamu_token_table.migration.ts` - Guest tokens
- `09_create_pesan_email_table.migration.ts` - Email messages

### 4. Information Handling
- `10_create_memperoleh_informasi_table.migration.ts` - Information access methods
- `11_create_mendapatkan_salinan_table.migration.ts` - Copy delivery methods
- `12_create_jawaban_memperoleh_informasi_table.migration.ts` - Information access answers
- `13_create_jawaban_mendapatkan_salinan_table.migration.ts` - Copy delivery answers

### 5. Rating System
- `14_create_jenis_rating_table.migration.ts` - Rating types (5-scale, 3-scale, text, etc.)
- `15_create_opsi_rating_table.migration.ts` - Rating options/scales

### 6. Survey System
- `16_create_pertanyaan_survei_table.migration.ts` - Survey questions
- `17_create_pertanyaan_s_jenis_rating_table.migration.ts` - Question-rating type relations
- `18_create_jawaban_identitas_survei_table.migration.ts` - Survey respondent identity
- `19_create_jawaban_survei_table.migration.ts` - Survey answers

### 7. Security Tables
- `20_create_login_attempts_table.migration.ts` - Login attempt logging
- `21_create_unlock_log_table.migration.ts` - Account unlock logging

### 8. Default Data
- `22_insert_default_data.migration.ts` - Inserts default admin users and sample survey data

## Database Structure Overview

### Primary Tables:
1. **admin** - Administrative users with role-based access
2. **daftar_tamu** - Main guest registry with status tracking
3. **jawaban_identitas_survei** - Survey respondent data

### Lookup Tables:
- bidang_tujuan (departments)
- pendidikan_terakhir (education levels)
- profesi (professions)
- tujuan_kunjungan (visit purposes)
- memperoleh_informasi (information access methods)
- mendapatkan_salinan (copy delivery methods)

### Rating System:
- jenis_rating (rating types)
- opsi_rating (rating scales/options)

### Survey System:
- pertanyaan_survei (survey questions)
- pertanyaan_s_jenis_rating (question-rating type mapping)
- jawaban_survei (survey responses)

### Relationship Tables:
- jawaban_memperoleh_informasi
- jawaban_mendapatkan_salinan
- tamu_token

### Security & Messaging:
- login_attempts
- unlock_log
- pesan_email

## Key Features Implemented

1. **Foreign Key Constraints** - Proper referential integrity
2. **Database Triggers** - Automatic status updates for guest visits
3. **Indexes** - Performance optimization for common queries
4. **Default Data** - Pre-populated lookup tables and admin accounts
5. **Security Logging** - Login attempts and unlock tracking
6. **Survey System** - Flexible rating system with multiple question types

## Migration Order

The migrations are designed to run in a specific order to avoid foreign key constraint issues:
1. Lookup tables first (no dependencies)
2. Main entity tables (depend on lookups)
3. Relationship tables (depend on main entities)
4. Security and logging tables
5. Default data insertion

## Usage

To run all migrations:
```bash
npm run migrate
```

To reset and run fresh migrations:
```bash
npm run reset-migrate
```

To drop all tables:
```bash
npm run drop-tables
```
