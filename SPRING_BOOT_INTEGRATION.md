# Spring Boot Integration

The frontend is built as a static bundle and placed inside the Spring Boot project. Both the frontend and the `GET /api/commands/flow` endpoint share the same origin, so no proxy or `commands.json` file is needed.

## 1. Ensure the API endpoint exists in Spring Boot

The backend must expose real data at:

```
GET /api/commands/flow
```

The response must match the shape expected by the frontend:

```json
{
  "commands": [
    { "from": "SomeCommand", "to": ["SomeEvent"] }
  ],
  "policies": {
    "SomePolicyName": {
      "invariants": ["..."],
      "flows": [
        { "fromEvent": "SomeEvent", "toCommand": "AnotherCommand" }
      ]
    }
  }
}
```

## 2. Build the frontend

```bash
npm run build
```

This produces a `dist/` folder.

## 3. Copy `dist/` into Spring Boot static resources

Copy everything inside `dist/` into:

```
src/main/resources/static/
```

Spring Boot automatically serves files from this directory. The frontend will be available at the root path (e.g. `http://localhost:8080/`) and will call `/api/commands/flow` on the same origin.
