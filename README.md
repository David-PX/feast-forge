# FeastForge

FeastForge is a microservices-based architecture designed to manage a food preparation system. This project demonstrates the use of microservices communication with RabbitMQ, database integration with PostgreSQL and MongoDB, and API management with Kong Gateway (optional). The application supports real-time updates and efficient workflows for orders, kitchen preparation, and inventory management.

## Table of Contents

- [FeastForge](#feastforge)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Architecture](#architecture)
    - [Component Communication](#component-communication)
  - [Microservices](#microservices)
  - [Technologies Used](#technologies-used)
  - [Setup Instructions](#setup-instructions)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
    - [Database Initialization](#database-initialization)
    - [RabbitMQ Setup](#rabbitmq-setup)
  - [Usage](#usage)

## Features

- **Order Management**: Users can create orders, which are processed asynchronously.
- **Kitchen Operations**: The kitchen handles order preparation, communicates with inventory for ingredients, and updates the order status.
- **Inventory Management**: Tracks ingredient availability, restocks from an external market, and ensures accurate usage.
- **Messaging System**: RabbitMQ is used for communication between microservices.
- **Optional Gateway**: Kong Gateway can be integrated for API management.
- **Database Integration**:
  - PostgreSQL for `ff-orders` and `ff-users`.
  - MongoDB for `ff-kitchen` and `ff-inventory`.

## Architecture

FeastForge consists of multiple microservices that communicate asynchronously via RabbitMQ. The architecture includes:

- **ff-users**: Manages user authentication and authorization.
- **ff-orders**: Handles order creation and updates order statuses.
- **ff-kitchen**: Processes orders, selects recipes, and communicates with inventory.
- **ff-inventory**: Manages ingredients, checks availability, and communicates with an external market.

### Component Communication

1. **Order Creation**:
   - `ff-orders` sends an `order.created` event to `ff-kitchen`.
2. **Kitchen Preparation**:
   - `ff-kitchen` selects a recipe and requests ingredients from `ff-inventory`.
3. **Inventory Check**:
   - `ff-inventory` checks availability locally and, if necessary, queries the external market.
4. **Status Updates**:
   - Each service sends updates via RabbitMQ to notify `ff-orders` of the order's progress.

## Microservices

1. **ff-users**:
   - Handles user registration and login.
   - JWT-based authentication.

2. **ff-orders**:
   - Manages orders and their statuses.
   - Publishes and listens to RabbitMQ events for status updates.

3. **ff-kitchen**:
   - Selects recipes and manages order preparation.
   - Communicates with `ff-inventory` for ingredient requests.

4. **ff-inventory**:
   - Tracks and updates ingredient availability.
   - Requests missing ingredients from the external market.

## Technologies Used

- **Node.js** with NestJS
- **Databases**:
  - PostgreSQL for relational data.
  - MongoDB for document storage.
- **Messaging**: RabbitMQ
- **API Gateway** (Optional): Kong
- **Containerization**: Docker and Docker Compose

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed.
- Node.js (for local development).

### Steps

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/david-px/feastforge.git
   cd feastforge
   ```

2. **Environment Variables**:
   - Create `.env` files in each microservice directory based on the provided `.env.example`.

3. **Build and Run Containers**:

   ```bash
   docker-compose up --build
   ```

4. **Access the Services**:
   - RabbitMQ Management Dashboard: [http://localhost:15672](http://localhost:15672)
   - `ff-users`: [http://localhost:3001](http://localhost:3001)
   - `ff-orders`: [http://localhost:3002](http://localhost:3002)
   - `ff-kitchen`: [http://localhost:3003](http://localhost:3003)
   - `ff-inventory`: [http://localhost:3004](http://localhost:3004)

### Database Initialization

- PostgreSQL databases will initialize automatically.
- MongoDB collections can be seeded manually using sample data.

### RabbitMQ Setup

- Verify exchanges and queues via the RabbitMQ Management Dashboard.

## Usage

1. **Register a User**:
   - Endpoint: `POST /auth/register` (ff-users).
   - Payload:

     ```json
     {
       "email": "user@example.com",
       "password": "securepassword"
     }
     ```

2. **Create an Order**:
   - Endpoint: `POST /orders` (ff-orders).
   - Payload:

     ```json
     {
       "userId": 1,
       "status": "pending"
     }
     ```

3. **Track Order Status**:
   - Check the logs of `ff-orders` to see real-time status updates.

4. **Inventory Management**:
   - Verify ingredient availability via the logs of `ff-inventory`.

---

Happy Cooking with FeastForge! 🎉
