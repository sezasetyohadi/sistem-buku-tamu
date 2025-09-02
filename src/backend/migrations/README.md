# Database Migrations

This directory contains database migrations for the sistem-buku-tamu project.

## Migration Order

Migrations are executed in a specific order to ensure database integrity and handle foreign key dependencies properly:

### Core Tables (No Dependencies)
1. `01_create_admin_table.migration.ts` - Admin user accounts
2. `02_create_bidang_tujuan_table.migration.ts` - Departments/Areas
3. `03c_create_section_survei_table.migration.ts` - Survey sections
4. `04_create_rating_tables.migration.ts` - Rating types
5. `06_create_pendidikan_terakhir_table.migration.ts` - Education levels
6. `08_create_profesi_table.migration.ts` - Professions
7. `09_create_tujuan_kunjungan_table.migration.ts` - Visit purposes
8. `10_create_memperoleh_informasi_table.migration.ts` - Information sources

### Tables with Dependencies
9. `03_create_daftar_tamu_table.migration.ts` - Guest registry (main table)
10. `05_create_survey_tables.migration.ts` - Survey system
11. `07_create_pesan_email_table.migration.ts` - Email messages
12. `11_create_jawaban_informasi_tables.migration.ts` - Information answers

### Constraints and Updates
13. `14_add_daftar_tamu_constraints.migration.ts` - Foreign key constraints
14. `12_update_survey_structure.migration.ts` - Survey enhancements
15. `15_create_tamu_token_table.migration.ts` - Guest tokens
16. `16_update_jawaban_identitas_survei.migration.ts` - Survey identity updates
17. `17_add_profile_picture_to_admin.migration.ts` - Admin profile pictures
18. `18_add_updated_at_to_admin.migration.ts` - Admin timestamp tracking
19. `19_create_login_security_tables.migration.ts` - Login security features

## Running Migrations

### Run All Migrations
```bash
npm run migrate
```

### Run Single Migration
```bash
npm run migrate:single <migration-file-name>
```

## Important Notes

1. **Dependencies**: The migration order is critical. Do not change the execution order as it will cause foreign key constraint failures.

2. **Column Names**: The `daftar_tamu` table uses:
   - `status_kunjungan` (not `status`)
   - `pendidikan_terakhir_id` (not `pendidikan_terakhir`)
   - `profesi_id` (not `profesi`)

3. **Triggers**: The `daftar_tamu` table has triggers that automatically update `status_kunjungan` based on check-in/check-out times.

4. **Foreign Keys**: All foreign key constraints are added after table creation to avoid dependency issues.

## Database Schema

The migrations create a complete database schema for:
- Admin user management with security features
- Guest registration and management
- Survey system with dynamic questions
- Email messaging system
- Token-based guest access
- Comprehensive audit trails

## Troubleshooting

If migrations fail:
1. Check database connection in `.env`
2. Ensure XAMPP MySQL is running
3. Verify foreign key dependencies
4. Check for duplicate column/table names
5. Review error messages for specific SQL issues
