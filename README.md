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

### Installation des packages

`npm install`

### Création de la clé dans la racine du projet

Un fichier `private.pem` contenant un secret doit se trouver dans la racine du projet.

Pour en créer un, par exemple :

```text
> ssh-keygen
Generating public/private rsa key pair.
Enter file in which to save the key (.../.ssh/id_rsa) : private.pem
```

### Définition des variables d'environnement

Créer un fichier appelé `.env` avec toutes les variables d'environnement nécessaires.
Avec openssl tu crées une clé privée, puis tu extrais une clé publique de la clé privée, ensuite tu mets le chemin de cette clé publique dans le .env (et la clé privé, pour l'instant, doit se trouver dans la racine et s'appeler private.pem).
Par exemple:

```text
RECAPTCHA_TOKEN=<clé secrète de recaptcha>
PUBLIC_KEY_PATH=<chemin vers la clé de chiffrement>
ORIGIN_URI=<URI du frontend, ex: http://localhost:4200>
BACKEND_URI=<URI du frontend, ex: http://localhost:5000>
DB_NAME=whitelist
DB_USERNAME=<nom d'utilisateur avec lequel on accède à la base de données>
DB_PASSWORD=<mot de passe de cet utilisateur>
DB_HOST=localhost
DB_DIALECT=mariadb
```

### Lancement du serveur

`npm start`

### Exécution avec Docker

Construire le container

`sudo docker build -t project_api .`

Exécuter le container

`sudo docker run -it --init --env-file <Path to .env file> -p 8070:8070 project_api`

### Documentation

Accéder via un navigateur au chemin <URI_API>/docs pour avoir une description de chaque route (il en manque encore certaines)
