# Dashboard Frontend API Report

## Verified Connection

The API is currently running successfully with:

```text
http://localhost:4000
```

The port is configured by `server/.env`. Do not assume port `5000`; the current environment uses `4000`.

Verified requests:

```text
GET http://localhost:4000/api/products   -> 200
GET http://localhost:4000/api/categories -> 200
```

The API enables CORS and serves static files from `/uploads`.

## Frontend API Client

Use this base URL in the dashboard:

```js
const API_URL = 'http://localhost:4000';
```

For image fields, prepend `API_URL` when the value starts with `/`:

```js
const imageUrl = imagePath ? `${API_URL}${imagePath}` : '';
```

Always handle loading, empty, and HTTP error states.

## Products

Base route: `/api/products`

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/api/products` | Optional query: `search`, `category`, `status` | Raw product array |
| GET | `/api/products/:id` | None | Product object |
| POST | `/api/products` | `multipart/form-data` | Created product |
| PUT | `/api/products/:id` | `multipart/form-data` | Updated product |
| DELETE | `/api/products/:id` | None | `{ message }` |

Product fields:

```json
{
  "name": "Book name",
  "price": 20,
  "description": "HTML or text",
  "category": "CATEGORY_ID",
  "serie": "SERIE_ID",
  "status": "In Stock",
  "size": "A5",
  "pagesNumber": 120,
  "ageRange": "10-14",
  "bookChapters": [],
  "chapters": [],
  "productImages": []
}
```

Required fields are `name`, `price`, and `category`.

Allowed `status` values:

```text
In Stock | Out of Stock | Pre-order | Draft
```

Product creation example:

```js
const formData = new FormData();
formData.append('name', product.name);
formData.append('price', String(product.price));
formData.append('category', product.category);
formData.append('status', product.status);
formData.append('image', selectedFile);

await fetch(`${API_URL}/api/products`, {
  method: 'POST',
  body: formData
});
```

Do not manually set the `Content-Type` header when sending `FormData`.

Product images normally return paths such as:

```text
/uploads/products/filename.png
```

## Categories

Base route: `/api/categories`

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/api/categories` | None | `{ success: true, data: [...] }` |
| POST | `/api/categories` | JSON or multipart | `{ success: true, data: category }` |
| PUT | `/api/categories/:id` | JSON or multipart | `{ success: true, data: category }` |
| POST | `/api/categories/:id/books` | `{ bookId }` | Updated category |
| DELETE | `/api/categories/:id/books/:bookId` | None | Updated category |

Category fields:

```json
{
  "name": "Fantasy",
  "description": "Fantasy books",
  "color": "#0F4000",
  "books": ["PRODUCT_ID"]
}
```

There is no category delete endpoint.

## Series

Base route: `/api/series`

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/api/series` | None | `{ success: true, data: [...] }` |
| POST | `/api/series` | JSON or multipart | `{ success: true, data: serie }` |
| PUT | `/api/series/:id` | JSON or multipart | `{ success: true, data: serie }` |
| POST | `/api/series/:id/books` | `{ bookId }` | Updated series |
| DELETE | `/api/series/:id/books/:bookId` | None | Updated series |

Series fields:

```json
{
  "name": "Harry Potter",
  "description": "Book series",
  "books": ["PRODUCT_ID"]
}
```

There is no series delete endpoint.

## Blogs

Base route: `/api/blogs`

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/api/blogs` | Optional query: `search` | `{ success, count, data }` |
| GET | `/api/blogs/:id` | None | `{ success, data }` |
| POST | `/api/blogs` | JSON | `{ success, data }` |
| PUT | `/api/blogs/:id` | JSON | `{ success, data }` |
| DELETE | `/api/blogs/:id` | None | `{ success, message }` |
| GET | `/api/blogs/categories` | None | `{ success, data }` |
| POST | `/api/blogs/categories` | `{ name, posts }` where `posts` contains blog IDs or existing blog titles | `{ success, data }` |

Blog fields:

```json
{
  "title": "Article title",
  "description": "Short description",
  "body": "Article body",
  "bannerImage": "",
  "author": "WhyQuest Team",
  "category": "Category name",
  "tags": ["tag"],
  "publishDate": "2026-09-24T00:00:00.000Z",
  "status": "Published"
}
```

Allowed blog statuses are `Draft` and `Published`.

Blog categories store references to Blog documents. Create the blogs first, then send their `_id` values in `posts`. Existing blog titles are also accepted and resolved to IDs. Unknown titles return `400` with a readable error instead of a Mongoose cast error.

## Important Backend Limitations

- There is no authentication or authorization yet.
- CORS is open to all origins.
- Products, categories, and series do not have pagination.
- Category and series image paths currently return `/uploads/filename`, while uploads are stored under `uploads/products`; those images may need backend correction before production use.
- The chapter controller is not connected to the server and references an undefined `Book` model. Treat `chapters` as a normal product field until that feature is repaired.

## Copilot Instruction

Use this instruction when connecting the dashboard:

> Connect the dashboard to `http://localhost:4000`. Use `/api/products`, `/api/categories`, `/api/series`, and `/api/blogs`. Products return a raw array; the other resources return `{ success, data }`. Use `multipart/form-data` for product create/update and do not manually set its Content-Type. Prepend `http://localhost:4000` to relative image paths. Treat `category` as required for products. Handle loading, empty, validation, and HTTP error states. Do not invent delete endpoints for categories or series. Do not implement chapter management until the backend exposes a working chapter route.
