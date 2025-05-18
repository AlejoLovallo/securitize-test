# Ops

### Setup redis dockerize version

```yaml
services:
  redis:
    image: redis:latest
    ports:
      - 6379:6379
```

```bash
docker run -d \
  --name redis-auth \
  -p 6379:6379 \
  redis:latest \
  redis-server --requirepass strongpassword
```

- To run it in the docker compose version:

Please fill in the variables in the .docker_app_env file

```bash
cp .docker_app_env_example .docker_app_env
```

- And then run:

```bash
docker compose up -d
```

```bash
curl --location 'localhost:3000/api/health'
```

Should answer you:

```json
{
  "status": "ok",
  "info": {
    "undefined - development": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "undefined - development": {
      "status": "up"
    }
  }
}
```
