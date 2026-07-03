# Frontend Integration Guide

Backend base URL:

`https://real-state-backend-system.onrender.com`

This document is written for frontend developers who need to connect a React, Next.js, Vue, or plain JavaScript UI to this backend.

## 1. What this backend provides

This project is a real-estate API with these main areas:

- Authentication and user account management
- Property listings with images, videos, documents, categories, and amenities
- Banners for homepage hero sections
- FAQs
- Testimonials
- Favorites / bookmarks
- Newsletter subscribers
- Inquiry/contact submissions
- Profile management

## 2. Database Schema Design

The Prisma schema is the source of truth for the data model.

### Main tables

#### User

- `id`: number
- `name`: string
- `email`: string, unique
- `password`: string, hashed
- `phone`: string
- `otpCode`: string, optional
- `otpExpiry`: datetime, optional
- `avatar`: string, optional
- `dob`: datetime, optional
- `createdAt`: datetime

#### TokenBlocklist

- `id`: number
- `token`: string, unique
- `createdAt`: datetime

#### Admins

- `id`: number
- `username`: string, unique
- `password`: string
- `createdAt`: datetime
- `updatedAt`: datetime

#### property_inquiries

- `id`: number
- `name`: string
- `email`: string
- `phone`: string
- `message`: string
- `createdAt`: datetime

#### Banner

- `id`: number
- `title`: string, optional
- `imageUrl`: string
- `publicId`: string
- `createdAt`: datetime

#### properties

- `id`: number
- `title`: string
- `description`: string
- `price`: number
- `address`: string
- `locationLink`: string, optional
- `createdAt`: datetime
- `updatedAt`: datetime
- `categoryId`: number
- `statusId`: number

Related data:

- `images`: property_images[]
- `videos`: property_videos[]
- `documents`: property_documents[]
- `property_amenities`: property_amenities[]

#### category

- `id`: number
- `name`: string, unique
- `iconUrl`: string, optional

#### property_status

- `id`: number
- `name`: string, unique

#### amenities

- `id`: number
- `name`: string, unique

#### property_amenities

- `id`: number
- `propertyId`: number
- `amenityId`: number

#### property_images

- `id`: number
- `propertyId`: number
- `image_url`: string
- `publicId`: string

#### property_videos

- `id`: number
- `propertyId`: number
- `video_url`: string
- `publicId`: string

#### property_documents

- `id`: number
- `propertyId`: number
- `doc_url`: string
- `doc_name`: string
- `publicId`: string

#### testimonial

- `id`: number
- `clientName`: string
- `role`: string
- `company`: string, optional
- `message`: string
- `rating`: number
- `avatarUrl`: string, optional
- `publicId`: string, optional
- `createdAt`: datetime
- `updatedAt`: datetime

#### faq

- `id`: number
- `question`: string
- `answer`: string
- `category`: string
- `createdAt`: datetime
- `updatedAt`: datetime

#### Subscriber

- `id`: number
- `email`: string, unique
- `isActive`: boolean
- `createdAt`: datetime

#### Favorite

- `id`: number
- `userId`: number
- `propertyId`: number
- `createdAt`: datetime

Unique rule:

- one user cannot favorite the same property twice

## 3. API Design

All routes are mounted under `/api`.

### 3.1 Authentication

Base path: `/api/auth`

#### POST `/api/auth/signup`

Creates a new user account.

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "12345678",
  "phone": "9800000000"
}
```

Success response:

```json
{
  "message": "User created successfully",
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9800000000"
  }
}
```

#### POST `/api/auth/login`

Logs in a user.

Request body:

```json
{
  "email": "john@example.com",
  "password": "12345678"
}
```

Success response:

```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/logout`

Requires a bearer token.

Header:

```http
Authorization: Bearer JWT_TOKEN
```

#### POST `/api/auth/admin/login`

Admin login with username and password.

#### POST `/api/auth/inquiry/submit`

Public contact form submission.

Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9800000000",
  "message": "I want to know more about this property."
}
```

#### GET `/api/auth/admin/enquiries`

Returns all submitted inquiries.

#### POST `/api/auth/auth/otp`

Starts password reset OTP flow.

#### POST `/api/auth/auth/reset-password`

Resets the password using OTP.

#### GET `/api/auth/users`

Returns all users.

#### GET `/api/auth/blocked-tokens`

Returns blocked tokens.

### 3.2 Properties

Base path: `/api/properties`

#### GET `/api/properties`

Returns all properties, including related category, status, images, videos, documents, and amenities.

#### GET `/api/properties/:id`

Returns one property by ID.

#### POST `/api/properties`

Creates a property with media upload.

This endpoint uses `multipart/form-data`.

Required text fields:

- `title`
- `description`
- `price`
- `address`
- `categoryId`
- `statusId`

Optional text fields:

- `locationLink`
- `amenityIds`

File fields:

- `propertyImages` up to 10 files
- `propertyVideos` up to 2 files
- `propertyDocs` up to 5 files

`amenityIds` can be sent as:

- JSON array string: `[1,2,3]`
- comma-separated string: `1,2,3`
- repeated array values from the form

Example response:

```json
{
  "success": true,
  "message": "Property listed smoothly!",
  "data": {}
}
```

#### PUT `/api/properties/:id`

Updates property text or media.

Supports the same field names as create.

#### DELETE `/api/properties/:id`

Deletes the property and its Cloudinary assets.

### 3.3 Banners

Base path: `/api/banners`

#### GET `/api/banners`

Returns all banners.

#### POST `/api/banners/upload`

Creates a banner.

This uses `multipart/form-data`.

Fields:

- `bannerImage` file field
- `title` optional text field

#### PUT `/api/banners/:id`

Updates title and/or image.

#### DELETE `/api/banners/:id`

Deletes a banner.

### 3.4 FAQs

Base path: `/api/faqs`

#### GET `/api/faqs`

Returns all FAQ items.

#### POST `/api/faqs`

Creates a FAQ item.

Body:

```json
{
  "question": "How do I book a property?",
  "answer": "Contact us through the inquiry form.",
  "category": "General"
}
```

#### PUT `/api/faqs/:id`

Updates a FAQ item.

#### DELETE `/api/faqs/:id`

Deletes a FAQ item.

### 3.5 Testimonials

Base path: `/api/testimonials`

#### GET `/api/testimonials`

Returns all testimonials.

#### POST `/api/testimonials`

Creates a testimonial.

This uses `multipart/form-data`.

Fields:

- `clientName`
- `role`
- `company`
- `message`
- `rating`
- `avatar` file field

#### DELETE `/api/testimonials/:id`

Deletes a testimonial.

### 3.6 Favorites

Base path: `/api`

#### POST `/api/favorites/`

Adds or removes a favorite toggle.

Body:

```json
{
  "userId": 1,
  "propertyId": 12
}
```

If the favorite already exists, it is removed. If not, it is added.

#### GET `/api/favorites/:userId`

Returns all favorites for a user.

### 3.7 Subscribers

Base path: `/api`

#### POST `/api/subscribe`

Adds or reactivates a subscriber.

Body:

```json
{
  "email": "john@example.com"
}
```

#### GET `/api/subscribers`

Returns all subscribers.

### 3.8 Profile

Base path: `/api/profile`

#### GET `/api/profile/:userId`

Returns user profile data.

#### PUT `/api/profile/:userId/text`

Updates profile text fields.

Body:

```json
{
  "name": "John Doe",
  "phone": "9800000000",
  "dob": "2000-01-01"
}
```

#### PUT `/api/profile/:userId/avatar`

Updates the avatar.

This uses `multipart/form-data` with a file field named `avatar`.

#### DELETE `/api/profile/:userId`

Deletes the profile.

## 4. Response Pattern Frontend Should Expect

Most successful responses use one of these patterns:

```json
{
  "success": true,
  "data": []
}
```

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Some endpoints return named keys instead of `data`, such as `banners`, `testimonial`, `banner`, or `property`.

Recommended frontend approach:

- check `success`
- read `data` when present
- if `data` is missing, check the named payload key
- handle `error` for failures

## 5. Frontend Integration Rules

### Auth

- Send login and signup requests as JSON `POST` requests
- Store the returned token in memory, localStorage, or secure cookie depending on your app design
- Send protected requests with `Authorization: Bearer <token>`

### File uploads

- Use `multipart/form-data`
- Do not send JSON when uploading files
- Match the exact field names used by the backend:
  - `bannerImage`
  - `avatar`
  - `propertyImages`
  - `propertyVideos`
  - `propertyDocs`

### IDs

- Most routes use numeric IDs
- Convert route params to numbers only on the backend; frontend can send them as strings in the URL

### Favorites and profile

- Favorites currently accept `userId` in the body or URL
- Profile routes use `userId` in the URL
- In a production setup, this should ideally come from the authenticated token instead of the client body

## 6. Render Testing Design

Use this as a simple checklist to verify the deployed backend on Render.

### Public endpoints to test in browser or Postman

- `GET https://real-state-backend-system.onrender.com/api/banners`
- `GET https://real-state-backend-system.onrender.com/api/properties`
- `GET https://real-state-backend-system.onrender.com/api/faqs`
- `GET https://real-state-backend-system.onrender.com/api/testimonials`

### Postman or curl tests for JSON routes

#### Login

```bash
curl -X POST https://real-state-backend-system.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"12345678"}'
```

#### Signup

```bash
curl -X POST https://real-state-backend-system.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"12345678","phone":"9800000000"}'
```

#### Subscribe

```bash
curl -X POST https://real-state-backend-system.onrender.com/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'
```

### Postman or curl tests for file upload routes

#### Banner upload

- Method: `POST`
- URL: `https://real-state-backend-system.onrender.com/api/banners/upload`
- Body type: `form-data`
- Fields:
  - `title`: text
  - `bannerImage`: file

#### Property create

- Method: `POST`
- URL: `https://real-state-backend-system.onrender.com/api/properties`
- Body type: `form-data`
- Fields:
  - `title`: text
  - `description`: text
  - `price`: text or number
  - `address`: text
  - `categoryId`: text or number
  - `statusId`: text or number
  - `locationLink`: text
  - `amenityIds`: `1,2,3` or `[1,2,3]`
  - `propertyImages`: file
  - `propertyVideos`: file
  - `propertyDocs`: file

#### Profile avatar update

- Method: `PUT`
- URL: `https://real-state-backend-system.onrender.com/api/profile/:userId/avatar`
- Body type: `form-data`
- Field:
  - `avatar`: file

### Expected success checks

- response status is `200` or `201`
- response contains `success: true` for most endpoints
- media URLs should be returned from Cloudinary
- list endpoints should return arrays

### Common failure checks

- `Cannot GET ...` means the browser is using the wrong HTTP method
- `400` means required fields are missing
- `401` means auth credentials or token are invalid
- `404` means the target ID does not exist
- `500` means server-side error or missing environment configuration

## 7. Suggested Frontend Fetch Pattern

```ts
const response = await fetch(`${BASE_URL}/api/auth/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();

if (!response.ok) {
  throw new Error(data.error || data.message || "Request failed");
}
```

## 8. Suggested Frontend Axios Pattern

```ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://real-state-backend-system.onrender.com",
});

const login = async (email: string, password: string) => {
  const response = await api.post("/api/auth/login", { email, password });
  return response.data;
};
```

## 9. Quick Endpoint Map

- `/api/auth/login` - user login
- `/api/auth/signup` - user signup
- `/api/auth/logout` - logout
- `/api/auth/admin/login` - admin login
- `/api/banners` - banner list
- `/api/banners/upload` - banner upload
- `/api/properties` - property list / create
- `/api/properties/:id` - property detail / update / delete
- `/api/faqs` - FAQ list / create / update / delete
- `/api/testimonials` - testimonial list / create / delete
- `/api/favorites/` - toggle favorite
- `/api/favorites/:userId` - get user favorites
- `/api/subscribe` - subscribe email
- `/api/subscribers` - get subscribers
- `/api/profile/:userId` - profile read / delete
- `/api/profile/:userId/text` - update profile text
- `/api/profile/:userId/avatar` - update avatar

## 10. Best Practice Notes

- Use `POST` for login and create actions
- Use `multipart/form-data` for file uploads
- Do not open API URLs in the browser and expect page UI
- Treat Render as a JSON API, not a website
- For protected data, include the JWT token in the request header
