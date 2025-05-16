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
