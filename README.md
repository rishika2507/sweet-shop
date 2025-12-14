# Sweet Shop – Django + React

Full‑stack sweets shop application with Django REST API backend and React frontend. It lets users browse sweets, filter by category and price, and simulate purchases, while admins can manage inventory.

## Features

- User authentication (login / register)
- Dashboard to list all sweets with:
  - Search by name
  - Category filter (Cupcakes, Indian sweets, Macarons, Cakes, etc.)
  - Price filter (Any price, Under ₹50, Under ₹100)
- “Add to cart” button:
  - Cart item counter in the header
  - Success message after each purchase
- Visual badges:
  - “Low stock” label when quantity is low
  - “Bestseller” label for high‑stock items
- Admin panel:
  - Create new sweets (name, category, price, stock)
  - Restock existing sweets
  - Delete sweets
  - Shows total number of sweets and total stock value

## Tech Stack

- Backend: Django, Django REST Framework
- Frontend: React, Vite, Axios
- Database: SQLite (for development)
- Auth: JSON Web Tokens (SimpleJWT) or Django auth (update this line to what you used)
- Language: Python 3.11, JavaScript (ES6+)


## Usage

- Register or log in.
- Browse the sweets on the dashboard.
- Use search and sidebar filters to find items.
- Click “Add to cart” to simulate a purchase:
  - The cart counter increases.
  - A green success message appears.
- Log in as admin to:
  - Create new sweets.
  - Restock or delete sweets.
  - View total stock value and total items.

## Website Interface
![Website](website_ui)

  
