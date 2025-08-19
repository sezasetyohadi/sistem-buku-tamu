# Database Migrations and Seeds

This directory contains migration files for setting up the database structure and seed files for populating it with initial data.

## Structure

- `migrations/`: Contains migration files that create database tables
- `seeds/`: Contains seed files that insert initial data into tables

## How to Use Migrations

### Install Dependencies

Make sure you have installed the necessary dependencies:

```bash
npm install
```

You'll also need to install tsx for running TypeScript files directly:

```bash
npm install -D tsx
```

### Setup Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=disnaker
DB_PORT=3306
```

### Run All Migrations and Seeds

To run all migrations and seeds:

```bash
npm run migrate
```

This will:
1. Create all database tables if they don't exist
2. Insert initial data into the tables

### Run a Single Migration or Seed

To run a specific migration:

```bash
npm run migrate:single -- 01_create_admin_table.migration.ts
```

To run a specific seed:

```bash
npm run migrate:single -- 01_admin_seed.seed.ts
```

## Correct Migration Order

1. `01_create_admin_table.migration.ts` - Creates the admin table
2. `02_create_bidang_tujuan_table.migration.ts` - Creates the bidang_tujuan table
3. `03_create_daftar_tamu_table.migration.ts` - Creates the daftar_tamu table 
4. `03c_create_section_survei_table.migration.ts` - Creates the section_survei table
5. `04_create_rating_tables.migration.ts` - Creates jenis_rating and opsi_rating tables
6. `05_create_survey_tables.migration.ts` - Creates pertanyaan_survei and jawaban_survei tables
7. `06_create_pendidikan_terakhir_table.migration.ts` - Creates the pendidikan_terakhir table
8. `07_create_pesan_email_table.migration.ts` - Creates the pesan_email table
9. `08_create_profesi_table.migration.ts` - Creates the profesi table
10. `09_create_tujuan_kunjungan_table.migration.ts` - Creates the tujuan_kunjungan table
11. `10_create_memperoleh_informasi_table.migration.ts` - Creates the memperoleh_informasi table

## Correct Seed Order

1. `01_admin_seed.seed.ts` - Inserts default admin user
2. `02_bidang_tujuan_seed.seed.ts` - Inserts bidang tujuan data
3. `02c_section_survei_seed.seed.ts` - Inserts survey sections
4. `04_rating_seed.seed.ts` - Inserts rating scales and options
5. `05_pendidikan_terakhir_seed.seed.ts` - Inserts education levels
6. `05b_pertanyaan_survei_seed.seed.ts` - Inserts survey questions
7. `06_profesi_seed.seed.ts` - Inserts professions
8. `07_tujuan_kunjungan_seed.seed.ts` - Inserts visit purposes
9. `08_memperoleh_informasi_seed.seed.ts` - Inserts information acquisition methods
10. `09_mendapatkan_salinan_seed.seed.ts` - Inserts copy acquisition methods

## Key Dependencies

- `pertanyaan_survei` depends on `section_survei` and `jenis_rating`
- `opsi_rating` depends on `jenis_rating`
- `jawaban_survei` depends on `pertanyaan_survei`
- `pesan_email` depends on `admin` and `daftar_tamu`

## Database Schema

The migrations create the following tables:

1. `admin` - Admin users of the system
2. `bidang_tujuan` - Department targets
3. `daftar_tamu` - Guest register
4. `pertanyaan_survei` - Survey questions
5. `jawaban_survei` - Survey answers
6. `jenis_rating` - Types of ratings
7. `opsi_rating` - Rating options
8. `pendidikan_terakhir` - Education levels
9. `pesan_email` - Email messages
10. `profesi` - Professions
11. `tujuan_kunjungan` - Visit purposes

## Adding New Migrations

To create a new migration:

1. Create a new file in `migrations/` with the pattern `XX_name.migration.ts`
2. Implement the `up()` and `down()` functions
3. Run the migration using `npm run migrate:single -- XX_name.migration.ts`

## Adding New Seeds

To create a new seed:

1. Create a new file in `seeds/` with the pattern `XX_name.seed.ts`
2. Implement the `seed()` function
3. Run the seed using `npm run migrate:single -- XX_name.seed.ts`
