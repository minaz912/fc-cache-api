# FC Cache API

## Prerequisites for running the app locally

- Unix-like environment (MacOS, Linux, WSL). Windows is **not** supported
- node v12.17.0
- npm >= v6.14.8
- mongodb running locally

## How to run

- Go to the root folder and install dependencies (if you haven't already done so) with `npm ci`
- Create a .env file at the project root (see .env.example as an example, or for the purposes of this project, rename it to .env)
- Customize any variables you need in .env
- Run mongodb on port 27017 (or set MONGODB_URI in .env to customize the connection string)
- Run `npm start`

## Viewing the API Docs

- You can view the API docs on `/api-docs`

## Building and running production

- Run `npm run build`, you'll see the transpiled output in the `dist` directory
- You can alternatively just run `npm run start:prod` to run in production mode (note the API docs are not served in production mode)

## Testing & Coverage

- Run `npm test` to run tests and collect coverage (you need to have MongoDB running)
- You can find the collected coverage in the generated `coverage` directory

## Config & .env

As previously mentioned, you must have a .env file in the project root with the following schema: (this is present by default)

```env
# App operating mode, set to 'production' to run in production mode
NODE_ENV=

# Port the application will listen on
PORT=

# Connection URI for the database
MONGODB_URI=

# Max number of items in the cache
CACHE_LIMIT_COUNT=

# Default TTL for new cache entries when one is not provided, measured in seconds
DEFAULT_CACHE_ENTRY_TTL_IN_SECS
```

## TODO

- Set up a real logger and customize log levels
- Add Dockerfile
- Error handling and standardize error responses and internal codes
- More test coverage
- Health-check endpoint (useful when running in a containerized setup)
- Look into codegen for the OpenAPI definition
- Set up Dependency Injection (would be useful for the following point)
- Abstract the data layer (what if we want to later move to an in-memory datastore? MongoDB is not the best choice for a Cache backend)
- Sanitize inputs to prevent possible NoSQL injection (OWASP)
- CI config
- Pre-commit hooks (linting, type-checks)
