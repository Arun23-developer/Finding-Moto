# Finding Moto Test Coding

This folder contains executable test scripts for important Finding Moto flows.

## 1. API Smoke Tests

File:

```bash
testing/api-smoke-tests.mjs
```

Run basic public/API validation tests:

```bash
node testing/api-smoke-tests.mjs
```

Default API base URL:

```bash
http://127.0.0.1:5000/api
```

Use a different backend:

```bash
$env:API_URL="http://127.0.0.1:5000/api"
node testing/api-smoke-tests.mjs
```

## Authenticated Tests

Some tests are skipped unless you provide tokens.

Seller or mechanic product validation:

```bash
$env:SELLER_TOKEN="paste-seller-or-mechanic-jwt-token"
node testing/api-smoke-tests.mjs
```

Buyer return validation:

```bash
$env:BUYER_TOKEN="paste-buyer-jwt-token"
$env:DELIVERED_ORDER_ID="paste-delivered-order-id"
node testing/api-smoke-tests.mjs
```

Product detail image-array validation:

```bash
$env:TEST_PRODUCT_ID="paste-product-id-with-multiple-images"
node testing/api-smoke-tests.mjs
```

## Covered Important Areas

- API health
- Visitor contact form
- Create-account validation
- Product listing API shape
- Product detail image array shape
- Seller/mechanic product validation
- Product image limit validation
- Return image-count validation

## 2. Minimum 6 Separate Test Coding Files

Separate runnable test files are inside:

```bash
testing/cases/
```

Run them one by one:

```bash
node testing/cases/01-health.test.mjs
node testing/cases/02-contact-form.test.mjs
node testing/cases/03-register-validation.test.mjs
node testing/cases/04-public-products.test.mjs
node testing/cases/05-product-gallery.test.mjs
node testing/cases/06-seller-product-validation.test.mjs
```

Files `05` and `06` need env values:

```bash
$env:TEST_PRODUCT_ID="paste-product-id"
node testing/cases/05-product-gallery.test.mjs

$env:SELLER_TOKEN="paste-seller-or-mechanic-token"
node testing/cases/06-seller-product-validation.test.mjs
```

## Notes

- Start backend before running tests.
- These tests use Node built-in `fetch`; no extra package install is required.
- Tests print `PASS`, `FAIL`, or `SKIP`.
- Failed tests exit with code `1`.
