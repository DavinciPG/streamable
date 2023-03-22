## Installation
- Clone the repository
- Navigate to the project folder
- Run ```npm install``` to install all dependencies
- [Set up environment variables](#environment-variables)
- Create a database and add the database credentials to .env file
- [Set up database](#database-setup)
- Run ```npm start``` to start the server

## Environment variables

Environment variables are stored in .env file. You can use .env.example as a template. You can also use environment variables in your front end app.

You can use the following steps to set up your environment variables:
- Open your terminal and navigate to the project folder
- Copy .env.example to .env by running the following command: ```cp .env.example .env```
- Edit .env file and set your environment variables

## Database setup
https://dev.mysql.com/downloads/installer download link for MYSQL Installer. Only server required.

MYSQL Users Table SQL Script
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- [Express](https://expressjs.com/) for the web framework.
- [Node.js](https://nodejs.org/en/) for the JavaScript runtime.
- [NPM](https://www.npmjs.com/) for the package manager.
- [Dotenv](https://www.npmjs.com/package/dotenv) for the environment variables.
- [Bcrypt](https://www.npmjs.com/package/bcrypt) for the password hashing.