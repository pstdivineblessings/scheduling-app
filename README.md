# Staff Scheduling application

## Specifications

Write a backend application for the staff scheduling system.

Users must be able to create an account and log in.
Implement 2 roles with different permission levels
-  Staff User:
    - Can view his/her schedule for any period of time (up to 1 year)
    - Can see his/her coworker schedules
-  Admin:
    - Can edit/delete all users,
    - Can create/edit/delete schedule for users
    - Can order users list by accumulated work hours per arbitrary period (up to 1 year).
Schedule should have:
- Work date
- User
- Shift length in hours

Deliverables:
- Create relevant REST endpoints that can be accessed and interacted via Postman or other similar software.
- Add Relevant unit tests. 
- Create a documentation page using Open API specifications.
- Dockerize application and add README file describing how to run the project.
- Upload your project to Github

Technologies to use:
- Node.js (Express.js or other framework is also fine)
- Mysql
- Docker



## Technologies and Features Used in the Project

- **Mysql**: 5.7 | platform: linux/x86_64
- **Adminer**: A full-featured database management tool. [Know More](https://www.adminer.org/)
- **Node.js**: 16.13.1 
- **Express.js**: 4.17.1 
- **Sequelize.js**: A modern Node.js ORM
- **Authentication and authorization**: using [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- **API Validation**: request data validation using [Joi](https://github.com/hapijs/joi)
- **Testing**: unit and integration tests using [Jest](https://jestjs.io)
- **API documentation**: with [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) and [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)
- **Dependency management**: with [Yarn](https://yarnpkg.com)
- **Environment variables**: using [dotenv](https://github.com/motdotla/dotenv)
- **Security**: set security HTTP headers using [helmet](https://helmetjs.github.io)
- **Santizing**: sanitize request data against xss and query injection
- **CORS**: Cross-Origin Resource-Sharing enabled using [cors](https://github.com/expressjs/cors)
- **Docker support**
- **Logging**: using [winston](https://github.com/winstonjs/winston) and [morgan](https://github.com/expressjs/morgan)
- **Error handling**: centralized error handling mechanism



## How To Launch the project? 

The project is running in docker container environment. The environment variables file have been left in the project.

Clone the repo:

```bash
git clone --depth 1 https://github.com/pstdivineblessings/scheduling-app.git
cd scheduling-app
```

Run the project (In development mode. All services will be installed: nodejs, mysql, adminer):

```bash
# run docker container in development mode
yarn docker:dev

```

Once the project is ready:

- Api documentation will be available at url: `http://localhost:8585/v1/docs` in your browser with their specifications. This documentation page is following [Open API](https://www.openapis.org/) definitions and is written as comments in the docs folder (src/docs).

- Mysql can be managed with adminer at url: `http://localhost:8080`

    Adminer credentials:
    - Server: `mysql-db`
    - Username: `root`
    - Password: `Admin@22`

- Some user accounts and data are available:

    Admin user (Role = admin):
    - username: `admin`
    - password: `Admin@22`  

    Some staff users (Role = staff) credentials:
    - staff1: (`staff1`, `Admin@22`)
    - staff2: (`staff2`, `Admin@22`)
    - staff3: (`staff3`, `Admin@22`)
    - staff4: (`staff4`, `Admin@22`)
    - staff5: (`staff5`, `Admin@22`)
    - staff6: (`staff6`, `Admin@22`)
    - staff7: (`staff7`, `Admin@22`)



##  Implementation: How To run all tests? 


```bash
# run all tests in a docker container
yarn docker:test
```



## Environment Variables

The environment variables can be found and modified in the `.env` file:

```bash
# Nodejs Ports
# Port in docker container
PORT=8585
# Port in host 
HOST_PORT=8585

# JWT
# Number of minutes after which an access token expires
JWT_ACCESS_EXPIRATION=20m
# Number of days after which a refresh token expires
JWT_REFRESH_EXPIRATION=30d
# Access token secret key
JWT_ACCESS_TOKEN_SECRET=xxxxxx
# Refresh token secret key
JWT_REFRESH_TOKEN_SECRET=xxxxx

# ADMINER
# Docker port
ADMINER_PORT=8080
# Host port
ADMINER_HOST_PORT=8080


# MYSQL CONFIGS
MYSQL_HOST=mysql-db
MYSQL_USER=root
MYSQL_PASSWORD=Admin@22
MYSQL_DB=scheduling_db
MYSQL_PORT=3306
MYSQL_HOST_PORT=3306

```



## Project Structure

```
tests\              # All test files
src\
 |--config\         # All configurations
 |--controllers\    # Route controllers (controller layer)
 |--docs\           # Swagger files
 |--middlewares\    # Custom express middlewares
 |--models\         # Sequelize models (data layer)
 |--migrations\     # Migration files
 |--routes\         # Routes
 |--services\       # Business logic (service layer)
 |--utils\          # Utility classes and functions
 |--validations\    # Request data validation schemas
 |--app.js          # Express app
 |--index.js        # App entry point
```



## TODOs: Things to improve or add in the current project implementation

- Implement rate limit for public endpoints such as authentication
- Add a stronger mechanism for refreshToken process with related tests


