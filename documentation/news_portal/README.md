# News Portal PRD Documentation

This folder contains the Product Requirements Documents (PRDs) for the **News Portal** feature, which brings a dynamic, database-driven news section into the MCEFEE platform (replacing the legacy WordPress/static HTML news site).

**Legacy reference screenshot:** [catholicatenews_in_full_screen_shot.png](catholicatenews_in_full_screen_shot.png) (if present) – used to align display sections (Flash News, Main News, Featured News, Most Read, Press Release, Sidebar Promotional/Advertisement block).

## Documents

| File | Description |
|------|-------------|
| [generic_prd.html](generic_prd.html) | Generic design, scope, stakeholders, display sections (including Most Read and Sidebar Promotional block), Live Video (LIVE menu), database design, and integration points. |
| [frontend_prd.html](frontend_prd.html) | Next.js routes, public news pages (landing with sidebar, /news/live for live video embed), admin dashboard, section config, live stream config, API integration, and UI standards. |
| [backend_prd.html](backend_prd.html) | Database schema (including news_live_stream_config, news_sidebar_promotion for rotating banner ads/slideshow), REST API endpoints, section_key values, live stream config API, sidebar promotions API, entities/DTOs, security, and optional batch jobs. |

## References

- **Legacy reference:** `E:\project_workspace\catholicatenews_in\index.html`
- **Frontend project:** `E:\project_workspace\mosc-temp`
- **Backend project:** `E:\project_workspace\malayalees-us-site-boot`
- **Batch jobs:** `E:\project_workspace\event-site-manager-batch-jobs`
- **Schema:** `code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_12.sql`
- **API schema:** `documentation/Swagger_API_Docs/api-docs.json`
- **Cursor rules:** `nextjs_api_routes.mdc`, `ui_style_guide.mdc`, `mosc_styling_standards.mdc`
