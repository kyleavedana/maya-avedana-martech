# README.MD

## PREREQUISITES

Required Softwares:

- Git
- Node.js v24.19.0
- Docker
- PostgreSQL (Installed locally or running via Docker), if spawned separately.

## INSTALLATION AND RUNNING

### INSTALL AND RUN LOCALLY

Make sure local PostgreSQL is running.

```bash
git clone git@github.com:kyleavedana/maya-avedana-martech.git
cd maya-avedana-martech
```

Setup .env file. See .env.example for reference.

```bash
npm ci
```

```bash
npx prisma migrate dev --name init
```

```bash
npx prisma generate
```

```bash
npx prisma db seed
```

```bash
npm start
```

### INSTALL AND RUN VIA DOCKER

```bash
git clone git@github.com:kyleavedana/maya-avedana-martech.git
```

Setup .env file. See .env.example for reference.

```bash
docker compose up --build
```

## URL

Visit http://localhost:3000/docs to see the generated Swagger UI.

## Sample Request

### Create User

```bash
curl -X 'POST' \
  'http://localhost:3000/api/users' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "username": "johndoe",
  "firstName": "John",
  "middleName": "Danger",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890"
}'
```

### Check Remaining Balance Available for Sending

```bash
curl -X 'GET' \
  'http://localhost:3000/api/users/2e86c343-bc64-4476-a0da-8798743e7df0/transactions/limit?duration=daily' \
  -H 'accept: */*'
```

### Send Money

```bash
curl -X 'POST' \
  'http://localhost:3000/api/users/2e86c343-bc64-4476-a0da-8798743e7df0%22/transactions/send-money' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "recipientId": "94d9c214-c732-4126-b6cd-ad7ecc48da55",
  "amount": 99.99
}'
```

### Check Transactions

```bash
curl -X 'GET' \
  'http://localhost:3000/api/users/2e86c343-bc64-4476-a0da-8798743e7df0/transactions' \
  -H 'accept: */*'
```

## ASSUMPTIONS

- The user resource in the api is an internal representation of users that can be from external resources (clients, other apis, etc).
- This module is to represent the actual transaction of sending money by the external users represented by the user resource.
- The main purpose of this module is to check if the daily and monthly limits are reached.
- Other requirements give emphasis on developer's experience. A well-established framework and patterns will fit the requirements.

## FAILURE CASES

- Most failure cases give corresponding status codes that is standard to RESTful api's
- Database constraints are enforced early on during initial development

## TO REVISIT BEFORE PROD LAUNCH

- Authentication. For now, the requirements emphasizes on functionality. As the api will communicate with other applications in the future, an established authentication method must be developed soon
- CI/CD. Deployment must be automated to enforce processes and rules.
- Architecture. A well-planned architecture to accomodate possible thousands and millions of users.
