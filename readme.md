# Jobly

Jobly is a job searching API built using Node, Express, and PostrgeSQL.

To run this use: ```node server.js```

## Routes

** = Admin required

*** = Admin or active user required

### Users

POST /users **

POST /users/username/id ***

GET /users **

GET /users/username ***

PATCH users/username ***

DELETE users/username ***

### Companies

POST /companies **

GET /companies 

GET /companies/handle

PATCH companies/handle **

DELETE companies/handle **

### Jobs

POST /jobs **

GET /jobs 

GET /jobs/title 

PATCH jobs/title **

DELETE jobs/title **


## Testing

* Model tests check the underlying database actions.

* Route tests check the underlying model methods and do not rely directly on the database changes.

* Run all tests using:  ```jest -i```
