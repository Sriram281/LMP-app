// Database schemas for AI-powered query generation
// This file contains structured information about all database tables
// that can be used by the OpenRouter AI to generate accurate SQL queries

export const tableSchemas = {
  "profiles": [
    {
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()"
    },
    {
      "column_name": "is_active",
      "data_type": "boolean",
      "is_nullable": "YES",
      "column_default": "false"
    },
    {
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null
    },
    {
      "column_name": "role",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "''::text"
    },
    {
      "column_name": "avatar_url",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": "''::text"
    },
    {
      "column_name": "phone_number",
      "data_type": "character varying",
      "is_nullable": "YES",
      "column_default": "''::character varying"
    },
    {
      "column_name": "industry_type",
      "data_type": "character varying",
      "is_nullable": "YES",
      "column_default": "''::character varying"
    },
    {
      "column_name": "address",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": "''::text"
    },
    {
      "column_name": "city",
      "data_type": "character varying",
      "is_nullable": "YES",
      "column_default": "''::character varying"
    },
    {
      "column_name": "state",
      "data_type": "character varying",
      "is_nullable": "YES",
      "column_default": "''::character varying"
    },
    {
      "column_name": "country",
      "data_type": "character varying",
      "is_nullable": "YES",
      "column_default": "''::character varying"
    },
    {
      "column_name": "permission",
      "data_type": "ARRAY",
      "is_nullable": "YES",
      "column_default": "'{}'::text[]"
    },
    {
      "column_name": "email",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "''::text"
    },
    {
      "column_name": "full_name",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "''::text"
    }
  ],
  "courses": [
    {
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()"
    },
    {
      "column_name": "instructor_id",
      "data_type": "uuid",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()"
    },
    {
      "column_name": "updated_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()"
    },
    {
      "column_name": "is_published",
      "data_type": "boolean",
      "is_nullable": "YES",
      "column_default": "false"
    },
    {
      "column_name": "domain",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "course_level",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "language",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "course_duration",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "title",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "description",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "subcategory",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "category",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    }
  ],
  "experts": [
    {
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()"
    },
    {
      "column_name": "years_experience",
      "data_type": "integer",
      "is_nullable": "YES",
      "column_default": "0"
    },
    {
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()"
    },
    {
      "column_name": "date_of_birth",
      "data_type": "date",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "experience_years",
      "data_type": "integer",
      "is_nullable": "YES",
      "column_default": "0"
    },
    {
      "column_name": "email",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "phone_number",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "gender",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "bio",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "designation",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "expertise_domains",
      "data_type": "ARRAY",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "profile_photo",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "current_organization",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "expertise_domain",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "linkedin_url",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "skills",
      "data_type": "ARRAY",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "full_name",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    }
  ],
  "categories": [
    {
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()"
    },
    {
      "column_name": "name",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "description",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()"
    }
  ],
  "domains": [
    {
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()"
    },
    {
      "column_name": "name",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "description",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()"
    }
  ],
  "discussions": [
    {
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()"
    },
    {
      "column_name": "title",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null
    },
    {
      "column_name": "content",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null
    },
    {
      "column_name": "author_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null
    },
    {
      "column_name": "course_id",
      "data_type": "uuid",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()"
    },
    {
      "column_name": "likes_count",
      "data_type": "bigint",
      "is_nullable": "YES",
      "column_default": "0"
    }
  ],
  "enrollments": [
    {
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()"
    },
    {
      "column_name": "user_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null
    },
    {
      "column_name": "course_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null
    },
    {
      "column_name": "enrolled_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()"
    },
    {
      "column_name": "progress",
      "data_type": "integer",
      "is_nullable": "YES",
      "column_default": "0"
    },
    {
      "column_name": "completed",
      "data_type": "boolean",
      "is_nullable": "YES",
      "column_default": "false"
    },
    {
      "column_name": "completed_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": null
    }
  ]
};

export default tableSchemas;