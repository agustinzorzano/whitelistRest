# whitelistRest

Project that consists in the development of an anti-spam application which is divided in
three parts:

* [Frontend](https://github.com/agustinzorzano/listeBlancheFrontend)
* [API](https://github.com/agustinzorzano/whitelistRest)
* [Backend scripts](https://github.com/agustinzorzano/liste_blanche_backend) 

In this repository we have defined the API using NodeJS. The website interface
will use the API to obtain all the information that is going to show such as
the emails in quarantine, the email addresses in the blacklist or in the whitelist, etc.
It will also be used for the management of the blacklist and the whitelist. 

The project was developed during an academic exchange in France in the University "IMT Atlantique"
and it was used as a final academic work in the University "Universidad de Buenos Aires".


## Requirement

npm

Server MariaDB

## Getting started

First of all, run MariaDB

### Install packages

`npm install`

### Key creation in the root of the project

A file `private.pem` containing a secret key must be in the root of the project.

To create one:

```text
> ssh-keygen
Generating public/private rsa key pair.
Enter file in which to save the key (.../.ssh/id_rsa) : private.pem
```

### Setting environment variables

Create a file named `.env` with all the necessary environment variables.
With openssl you can create a private key and a public key. The path to the public key should be added to the .env file (the private key should be at the root and should be called private.pem).
For example:

```text
RECAPTCHA_TOKEN=<Recaptcha secret key>
PUBLIC_KEY_PATH=<path to the public key>
ORIGIN_URI=<frontend URI, ex: http://localhost:4200>
BACKEND_URI=<backend URI, ex: http://localhost:5000>
DB_NAME=whitelist
DB_USERNAME=<database username used to access the database>
DB_PASSWORD=<password of the database user>
DB_HOST=localhost
DB_DIALECT=mariadb
```

### Start the server

`npm start`

### Execute with Docker

Build the container

`sudo docker build -t project_api .`

Execute the container

`sudo docker run -it --init --env-file <Path to .env file> -p 8070:8070 project_api`

### Documentation

Go to <URI_API>/docs with the browser to have access to the documentation of the API
