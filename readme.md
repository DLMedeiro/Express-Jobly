# Jobly

Jobly is a job searching API built using Node, Express, and PostrgeSQL.

To run this use: ```node server.js```

## Routes

** = Admin required

*** = Admin or active user required

### Users
>
__POST /users__ **

__POST /users/username/id__ ***

__GET /users__ **

__GET /users/username__ ***

__PATCH users/username__ ***

__DELETE users/username__ ***
>
### Companies

__POST /companies__ **

__GET /companies__ 

__GET /companies/handle__

__PATCH companies/handle__ **

__DELETE companies/handle__ **

### Jobs

__POST /jobs__ **

__GET /jobs__ 

__GET /jobs/title__ 

__PATCH jobs/title__ **

__DELETE jobs/title__ **


## Testing

* Model tests check the underlying database actions.

* Route tests check the underlying model methods and do not rely directly on the database changes.

* Run all tests using:  ```jest -i```
