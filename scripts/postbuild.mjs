import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const htaccess = `Options -MultiViews
RewriteEngine On

RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

RewriteRule ^ index.html [L]
`;

writeFileSync(resolve("dist", ".htaccess"), htaccess, "utf8");
console.log("✅ .htaccess generated in dist/"); // eslint-disable-line
