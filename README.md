## fantasy-soccer

- Hosted on [DO](https://fantasy-soccer-api-9efr8.ondigitalocean.app/) and [Heroku](https://stormy-sea-19298.herokuapp.com/)
- Postman [here](https://documenter.getpostman.com/view/15885507/Tzm3pHjw)

### How to run (the app)

#### Locally with node

1. Export/source the environment variables used in src/config.ts
2. Run `npm run build && npm run start`
3. The api will be exposed on `localhost:<PORT>` or `localhost:<SERVER_PORT>` depending on your env

#### Locally with Docker

1. Build the image using `docker build -t fantasy-soccer .`
2. Start the container using `docker run -d -p <PORT/SERVER_PORT>:<PORT/SERVER_PORT> --env-file <ENV_LOCATION> fantasy-soccer`
   - Substitute `<PORT>`, `<SERVER_PORT>`, and/or `<ENV_LOCATION>` accordingly
3. The api will be exposed on `localhost:<PORT>` or `localhost:<SERVER_PORT>` depending on your env

### License
MIT