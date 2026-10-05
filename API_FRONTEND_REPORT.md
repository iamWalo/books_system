# Dashboard Frontend API Handoff

This document describes the API contracts currently implemented in `server/`. Use the endpoint and payload details below instead of inferring behavior from UI labels or older API notes.

## Frontend Copilot Instructions

> Integrate the dashboard with the existing Express API. Read the API base URL from frontend configuration; the previously verified local URL was `http://localhost:4000`, while the server reads `PORT` from `server/.env` and defaults to `5000`. Use `/api/products`, `/api/categories`, `/api/series`, and `/api/blogs` exactly as listed below. Respect each endpoint's actual response shape: product lists return `{ success, data }`; category and series lists return raw arrays; blog endpoints return `{ success, data }` (the blog list also has `count`). Product create/update use `FormData` and image fields named `productImages` and `descriptionImages`; blog create/update can use `FormData` with a `bannerImage` file. Never set the multipart `Content-Type` header manually. Category create/update and series create accept a single `image` file; series update currently ignores uploaded image changes. Resolve relative `/uploads/...` paths against the API base URL. Use only the fields and status values documented here, handle non-2xx responses and loading/empty states, and do not assume pagination, authentication, or unlisted endpoints exist. `bookChapters` is a product string array; there is no chapter-management route.

## Connection And Shared Behavior

- Configure the base URL per environment. For local development, use the port printed by the server; the code uses `PORT` from `server/.env` and falls back to `5000`. `http://localhost:4000` was previously verified in this workspace but may differ from the current runtime.
- The API enables CORS and serves static files under `/uploads`.
- For an image path beginning with `/`, build the URL as `${API_URL}${imagePath}`. Product image paths may lack the leading slash, so normalize them before joining.
- No endpoint currently requires authentication. The server allows requests from all origins.
- Unless specified otherwise, send JSON for non-upload operations. Check `response.ok`; error responses commonly include a `message` field, but envelope formats vary by endpoint.

## Products

Base route: `/api/products`

| Method | Endpoint | Request | Success response |
|---|---|---|---|
| GET | `/api/products` | No implemented query filters | `{ success: true, data: Product[] }` |
| GET | `/api/products/:id` | None | `{ success: true, data: Product }` |
| POST | `/api/products` | JSON or multipart form data | `201 { success: true, data: Product }` |
| PUT | `/api/products/:id` | JSON or multipart form data | `{ success: true, data: Product }` |
| DELETE | `/api/products/:id` | None | `{ success: true, message }` |

Product fields:

```json
{
  "name": "Book name",
  "subtitle": "Optional subtitle",
  "price": 20,
  "description": "Text or HTML",
  "category": "CATEGORY_ID",
  "categories": ["story_book"],
  "serie": "SERIE_ID",
  "status": "Active",
  "size": "A5",
  "pagesNumber": 120,
  "ageRange": "10-14",
  "bookChapters": ["Chapter 1"],
  "productImages": ["uploads/products/image.png"],
  "descriptionImages": []
}
```

- Required by the schema: `name` and `price`. `category` is an optional single category ID; `categories` is a separate array of `story_book` and/or `best_selling` labels.
- `status` is `Active` or `Inactive` (default: `Active`). Price must be zero or greater. `pagesNumber` is numeric.
- GET list and detail populate `category` and `serie`; expect populated objects rather than IDs in those fields when reading products.
- Product listing does not currently implement `search`, `category`, or `status` query filters, and there is no pagination.
- Uploads use `multipart/form-data`, up to 10 MB per file. Use `productImages` for product images and `descriptionImages` for description images. The upload middleware accepts JPEG, PNG, and WebP. Multiple files are supported.
- For PUT, include `existingProductImages` and `existingDescriptionImages` for image paths to retain; newly uploaded files are appended to those lists. The controller resets image lists from these submitted fields, so include retained paths when editing.
- Do not manually set `Content-Type` when using `FormData`; the browser must add the multipart boundary.
- Product image paths are stored as `uploads/products/<filename>`; normalize the leading slash when building display URLs.

Example product create request:

```js
const formData = new FormData();
formData.append('name', product.name);
formData.append('price', String(product.price));
formData.append('category', product.categoryId ?? '');
formData.append('productImages', selectedFile);

const response = await fetch(`${API_URL}/api/products`, {
  method: 'POST',
  body: formData
});
```

## Categories

Base route: `/api/categories`

| Method | Endpoint | Request | Success response |
|---|---|---|---|
| GET | `/api/categories` | None | Raw `Category[]`; each category has populated `books` |
| POST | `/api/categories` | JSON or multipart form data | `201 Category` |
| PUT | `/api/categories/:id` | JSON or multipart form data | Updated category document |
| DELETE | `/api/categories/:id` | None | `{ message }` |
| POST | `/api/categories/:id/books` | `{ "bookId": "PRODUCT_ID" }` | `{ message }` |
| DELETE | `/api/categories/:id/books/:bookId` | None | `{ message }` |

Persisted category fields are `name`, `color`, `image`, and `books` (product IDs). `name` is required; `color` defaults to `#0F4000`. `description` is not persisted. Category create/update accept one `image` file (JPEG, PNG, or WebP; maximum 10 MB); uploaded files are stored under `uploads/categories/` and returned as `/uploads/categories/<filename>`. Both routes persist the image path, which the GET endpoint includes in each category document.

## Series

Base route: `/api/series`

| Method | Endpoint | Request | Success response |
|---|---|---|---|
| GET | `/api/series` | None | Raw `Series[]`; each series has populated `books` |
| POST | `/api/series` | JSON or multipart form data | `201 Series` |
| PUT | `/api/series/:id` | JSON or multipart form data | Updated series document |
| DELETE | `/api/series/:id` | None | `{ message }`; `400` if products are assigned |
| POST | `/api/series/:id/books` | `{ "bookId": "PRODUCT_ID" }` | `{ message }` |
| DELETE | `/api/series/:id/books/:bookId` | None | `{ message }` |

Persisted series fields are `name`, `description`, `image`, and `books` (product IDs). `name` is required. Create accepts one `image` file (JPEG, PNG, or WebP; maximum 10 MB) and stores its path under `/uploads/series/`. Update currently ignores uploaded image files. The controller accepts `color` in its request but the Series schema has no `color` field, so it is not persisted. Series deletion is available, but fails with `400` while any products still reference that series.

## Blogs

Base route: `/api/blogs`

| Method | Endpoint | Request | Success response |
|---|---|---|---|
| GET | `/api/blogs` | Optional `?search=` (matches title) | `{ success, count, data: Blog[] }` |
| GET | `/api/blogs/:id` | None | `{ success, data: Blog }` |
| POST | `/api/blogs` | JSON or multipart form data (`bannerImage` file) | `201 { success, data: Blog }` |
| PUT | `/api/blogs/:id` | JSON or multipart form data (`bannerImage` file) | `{ success, data: Blog }` |
| DELETE | `/api/blogs/:id` | None | `{ success, message }` |
| GET | `/api/blogs/categories` | None | `{ success, data: BlogCategory[] }` |
| POST | `/api/blogs/categories` | `{ name, posts }` | `201 { success, data: BlogCategory }` |

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

`title`, `description`, `body`, and `category` are required. `status` is `Draft` or `Published` (default: `Published`). Create and update accept a single JPEG, PNG, or WebP file (maximum 10 MB) in the multipart field `bannerImage`. Uploaded files are stored under `uploads/blogs/`; the saved and returned `bannerImage` is `/uploads/blogs/<filename>`, served by the backend. Existing `bannerImage` string URLs/paths remain accepted when no file is uploaded.

Example blog create request with a banner upload:

```js
const formData = new FormData();
formData.append('title', blog.title);
formData.append('description', blog.description);
formData.append('body', blog.body);
formData.append('category', blog.category);
formData.append('bannerImage', selectedBannerFile);

const response = await fetch(`${API_URL}/api/blogs`, {
  method: 'POST',
  body: formData
});
const result = await response.json();
// result.data.bannerImage is `/uploads/blogs/<filename>`
```

Blog categories store references to blog documents. Create blogs first, then send their IDs in `posts`. Existing blog titles are also accepted and resolved to IDs. Unknown titles return `400` with a readable message. Only list and create endpoints are implemented for blog categories; do not assume category update or delete routes exist.

## Known Gaps

- There is no authentication or authorization; CORS allows all origins. Do not treat this local API as production-secure.
- Products, categories, and series have no pagination. Product list filters are not implemented.
- Category descriptions/images are not persisted by the schema, category image paths do not match their storage directory, and category/series update routes do not save replacement images.
- Series `color` is not a persisted field.
- Product `bookChapters` is a string array only. There is no chapter-management endpoint.
