---
# Reference: Part of this documentation was generated Using APIDog.
title: Project APIs
language_tabs:
  - http: HTTP
  - python: Python
---

# Programming Project Backend/User

## 1. GET Get User Profile

GET /api/v1/user

> Response Examples

> 200 Response

```json
{}
```

### Responses

| HTTP Status Code | Meaning                                                 | Description | Data schema |
| ---------------- | ------------------------------------------------------- | ----------- | ----------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none        | Inline      |

### Responses Data Schema

## 2. PATCH Update User Profile

PATCH /api/v1/user

> Response Examples

> 200 Response

```json
{}
```

### Responses

| HTTP Status Code | Meaning                                                 | Description | Data schema |
| ---------------- | ------------------------------------------------------- | ----------- | ----------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none        | Inline      |

### Responses Data Schema

# Data Schema

<h2 id="tocS_Pet">Pet</h2>

<a id="schemapet"></a>
<a id="schema_Pet"></a>
<a id="tocSpet"></a>
<a id="tocspet"></a>

```json
{
  "id": 1,
  "category": {
    "id": 1,
    "name": "string"
  },
  "name": "doggie",
  "photoUrls": ["string"],
  "tags": [
    {
      "id": 1,
      "name": "string"
    }
  ],
  "status": "available"
}
```

### Attribute

| Name      | Type                        | Required | Restrictions | Title | Description      |
| --------- | --------------------------- | -------- | ------------ | ----- | ---------------- |
| id        | integer(int64)              | true     | none         |       | Pet ID           |
| category  | [Category](#schemacategory) | true     | none         |       | group            |
| name      | string                      | true     | none         |       | name             |
| photoUrls | [string]                    | true     | none         |       | image URL        |
| tags      | [[Tag](#schematag)]         | true     | none         |       | tag              |
| status    | string                      | true     | none         |       | Pet Sales Status |

#### Enum

| Name   | Value     |
| ------ | --------- |
| status | available |
| status | pending   |
| status | sold      |

<h2 id="tocS_Category">Category</h2>

<a id="schemacategory"></a>
<a id="schema_Category"></a>
<a id="tocScategory"></a>
<a id="tocscategory"></a>

```json
{
  "id": 1,
  "name": "string"
}
```

### Attribute

| Name | Type           | Required | Restrictions | Title | Description   |
| ---- | -------------- | -------- | ------------ | ----- | ------------- |
| id   | integer(int64) | false    | none         |       | Category ID   |
| name | string         | false    | none         |       | Category Name |

<h2 id="tocS_Tag">Tag</h2>

<a id="schematag"></a>
<a id="schema_Tag"></a>
<a id="tocStag"></a>
<a id="tocstag"></a>

```json
{
  "id": 1,
  "name": "string"
}
```

### Attribute

| Name | Type           | Required | Restrictions | Title | Description |
| ---- | -------------- | -------- | ------------ | ----- | ----------- |
| id   | integer(int64) | false    | none         |       | Tag ID      |
| name | string         | false    | none         |       | Tag Name    |
