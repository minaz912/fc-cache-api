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
- run `npm start`

## Testing & CI/CD

- Run `npm test` to run all tests. Alternatively you can run `npm run test:server` to only run server tests, `npm run test:client` to run client tests, or `npm run test:e2e` to run the end-to-end tests
- Every code push is tested and built via CI, if autodeploy is configured for the branch, it is deployed to the specified environment in CI configuration

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
