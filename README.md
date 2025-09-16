# Projet Application-web (Hiver 2023): Angular + Express
English will follow!
## Description
Ce projet est composé de deux parties :
- **Client** : une application web construite avec le cadriciel [Angular](https://angular.io/).
- **Serveur** : un serveur dynamique bâti avec la librairie [Express](https://expressjs.com/).

---

## Fonctionnalités principales
- Interface utilisateur dynamique : L'application offre une interface utilisateur réactive et interactive.
- Gestion des utilisateurs : Inscription, connexion et gestion des sessions utilisateur.
- Communication en temps réel : Utilisation des WebSockets pour les interactions en temps réel.
- API RESTful : Le backend Express expose des endpoints API pour interagir avec la base de données NoSQL (MongoDB) et effectuer des opérations CRUD.
- Sécurité : Mise en place de mécanismes de sécurité tels que la validation des entrées et la gestion des erreurs.
---

## Installation

Clonez le projet puis installez les dépendances dans chacun des dossiers :

```bash
git clone https://github.com/username/nom-du-projet.git
cd nom-du-projet

# Installer les dépendances du client
cd client
npm ci

# Installer les dépendances du serveur
cd ../server
npm ci
# Installer dépendances de développement au projet (serveur ou client)
cd client
npm install nomDependence --save-dev
```

---

## Client
Lorsque la commande npm start est lancée dans le dossier /client, le script suivant (disponible dans package.json) est exécuté :
```
 ng serve --open
```
Cela effectue les 2 étapes suivantes :


1. Bundle generation : Traduire le code TypeScript et la syntaxe Angular en JavaScript standard. À la fin de cette étape, vous verrez que les fichiers suivants sont générés : vendor.js,polyfills.js, main.js,runtime.js et styles.css. Ces fichiers contiennent le code de votre application ainsi que le CSS des différents composants.


2. Développement serveur : un serveur web statique sera lancé sur votre machine pour pouvoir servir votre application web. Le serveur est lancé sur le port 4200 et est accessible à travers http://localhost:4200/ ou 127.0.0.1:4200. Une page web avec cette adresse s'ouvrira automatiquement.
Note : le serveur de développement n'est accessible qu'à partir de votre propre machine. Vous pouvez le rendre disponible à tous en ajoutant --host 0.0.0.0 dans la commande npm start. Le site sera donc accessible dans votre réseau local à partir de votre adresse IP suivie du port 4200. Par exemple : 132.207.5.35:4200. Notez que le serveur de développement n'est pas fait pour un déploiement ouvert et vous recevrez un avertissement en le lançant.

## English Version

## Description
This project consists of two parts:
- **Client**: a web application built with the [Angular](https://angular.io/) framework.
- **Server**: a dynamic server built using the [Express](https://expressjs.com/) library.

---

## Main Features
- **Dynamic User Interface**: The application provides a reactive and interactive user interface.
- **User Management**: Registration, login, and session management.
- **Real-time Communication**: Use of WebSockets for real-time interactions.
- **RESTful API**: The Express backend exposes API endpoints to interact with the NoSQL database (MongoDB) and perform CRUD operations.
- **Security**: Implementation of security mechanisms such as input validation and error handling.

---

## Installation

Clone the project and install dependencies in each folder:

```bash
git clone https://github.com/username/project-name.git
cd project-name

# Install client dependencies
cd client
npm ci

# Install server dependencies
cd ../server
npm ci

# Install development dependencies (client or server)
cd client
npm install dependency-name --save-dev
```

---
## Client
When the command `npm start` is run in the `/client` folder, the following script from `package.json` is executed:

```
ng serve --open
```

This performs the following two steps:

1. Bundle Generation: Translates TypeScript and Angular syntax into standard JavaScript.
At the end of this step, the following files are generated: vendor.js, polyfills.js, main.js, runtime.js, and styles.css.
These files contain your application code as well as the CSS of the various components.


2. Development Server: A static web server is launched on your machine to serve your web application.
The server runs on port 4200 and can be accessed at http://localhost:4200/ or 127.0.0.1:4200.
A web page will open automatically in your browser.
Note: The development server is only accessible from your own machine.To make it available on your local network, add --host 0.0.0.0 to the npm start command.
The site will then be accessible from your local IP followed by port 4200, e.g., 132.207.5.35:4200.The development server is not intended for public deployment,
and you will receive a warning if you try to run it as such.


