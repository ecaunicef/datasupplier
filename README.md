# DATASUPPLIER
## Prerequisites
Ensure you have **Node.js v18.20.8** installed.
## Clone the Repository
```sh
git clone <repository-url>
cd datasupplier
```
## Install Dependencies
```sh
npm install
```
## Project Structure
```
/datasupplier
│---- controllers/
│---- models/
|---- routes/
│---- services/
│-- .env
|--- app.js
│-- package.json
│-- README.md
```
## Environment Variables
Create a `.env` file in the root directory and configure necessary environment variables:
```
PORT=9092
DATABASE_URL=<your-database-url>
```
## Start the Development Server
Run the following command to start the server in development mode:
```sh
nodemon
```
The Express server runs on **port 9092**.

