# EXJET website — hosted Avinode widget

The charter, contact, and group pages use the existing EXJET Avinode hosted Web App. The landing page introduces EXJET and links to the dedicated charter page for booking. The public embed configuration is included, so these search forms do not depend on the rejected sandbox REST API credentials. An optional `AVINODE_WEB_APP_URL` server variable can override the configured embed.

The uploaded archive ended inside `node_modules`. Missing tracked files, including package files and public images, were recovered from the source history included in that same upload. The intact uploaded working files were then applied over that history. This package contains the restored website source and assets, without generated builds, dependencies, local credentials, or repository internals. Uncommitted files beyond the truncated portion of the upload could not be recovered.

To run the website, use the existing `npm ci` and `npm run dev` commands. `npm run build` produces the standard Next.js build for Vercel. The widget route runs on the Node.js runtime. Keep API credentials in the server environment.

The development command uses a small Next.js argument adapter so the same project can open in the supervised review browser. Normal local development and production build commands are preserved.

The current version adds the EXJET design system described in `DESIGN-RULES.md`. Deployment is paused at the user's request so the design can be built and reviewed first. No production deployment is claimed.

Widget request delivery is handled by Avinode. This change does not activate management imports, operator quotes, contracts, invoices, or payments. See `integration/avinode/README.md` for the data connection boundaries.
