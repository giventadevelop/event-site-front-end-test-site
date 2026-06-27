#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

async function generateApiRoute(modelName, schema) {
  const templateDir = path.join(process.cwd(), 'src', 'templates', 'api');
  const apiDir = path.join(process.cwd(), 'src', 'app', 'api', modelName.toLowerCase());

  // Create directories
  await mkdir(apiDir, { recursive: true });
  await mkdir(path.join(apiDir, '[id]'), { recursive: true });

  // Read templates
  const routeTemplate = await readFile(path.join(templateDir, 'route.ts.template'), 'utf8');
  const dynamicRouteTemplate = await readFile(path.join(templateDir, '[id]', 'route.ts.template'), 'utf8');

  // Replace placeholders
  const modelNameUpper = modelName.charAt(0).toUpperCase() + modelName.slice(1);
  const routeContent = routeTemplate
    .replace(/YOUR_MODEL/g, modelName)
    .replace(/\/\/ Add your schema fields here/, schema);

  const dynamicRouteContent = dynamicRouteTemplate
    .replace(/YOUR_MODEL/g, modelName)
    .replace(/\/\/ Add your schema fields here/, schema);

  // Write files
  await writeFile(path.join(apiDir, 'route.ts'), routeContent);
  await writeFile(path.join(apiDir, '[id]', 'route.ts'), dynamicRouteContent);

  console.log(`Generated API routes for ${modelName}:`);
  console.log(`- /api/${modelName.toLowerCase()}`);
  console.log(`- /api/${modelName.toLowerCase()}/[id]`);
}

// Get command line arguments
const [,, modelName, ...schemaFields] = process.argv;

if (!modelName) {
  console.error('Please provide a model name');
  process.exit(1);
}

// Convert schema fields to Zod schema
const schema = schemaFields
  .map(field => {
    const [name, type] = field.split(':');
    switch (type) {
      case 'string':
        return `  ${name}: z.string(),`;
      case 'number':
        return `  ${name}: z.number(),`;
      case 'boolean':
        return `  ${name}: z.boolean(),`;
      case 'date':
        return `  ${name}: z.string().datetime(),`;
      default:
        return `  ${name}: z.string(), // TODO: Update type`;
    }
  })
  .join('\n');

generateApiRoute(modelName, schema).catch(console.error);