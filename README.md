# Application-Web (Found Differences Game) 
French description will follow:

client : le site Web fait avec le cadriciel (framework) Angular.
serveur : le serveur dynamique bâti avec la librairie Express ou NestJs (selon votre choix).


Commandes npm
Les commandes commençant par npm devront être exécutées dans les dossiers client et server. Les scripts non standard doivent être lancés en lançant npm run myScript.

Installation des dépendances de l'application


Installer npm. npm vient avec Node que vous pouvez télécharger ici


Lancer npm ci (Continuous Integration) pour installer les versions exactes des dépendances du projet. Ceci est possiblement seulement si le fichier package-lock.json existe. Ce fichier vous est fourni dans le code de départ.



Ajout de dépendances aux projets
Vous pouvez ajouter d'autres dépendances aux deux projets avec la commande npm install nomDependance.
Pour ajouter une dépendance comme une dépendance de développement (ex : librairie de tests, types TS, etc.) ajoutez l'option --save-dev : npm install nomDependance --save-dev.
Un ajout de dépendance modifiera les fichiers package.json et package-lock.json.
Important : assurez-vous d'ajouter ces modifications dans votre Git. N'installez jamais une dépendance du projet globalement.

Client

Développement local
Lorsque la commande npm start est lancée dans le dossier /client, le script suivant (disponible dans package.json) est exécuté : ng serve --open qu exécute les 2 étapes suivantes :


Bundle generation : Traduire le code TypeScript et la syntaxe Angular en JavaScript standard. À la fin de cette étape, vous verrez que les fichiers suivants sont générés : vendor.js,polyfills.js, main.js,runtime.js et styles.css. Ces fichiers continent le code de votre application ainsi que le CSS des différents Components.
Note : ceci est un build de développement : la taille des fichiers est très grande et le code n'est pas minifié. Vous pouvez accéder à votre code à travers les outils de développement de votre navigateur et déboguer avec des breaking points par exemple. Une configuration de debugger pour VSCode est également disponible. Voir la section Debugger pour plus d'informations.


Development Server : un serveur web statique sera lancé sur votre machine pour pouvoir servir votre application web. Le serveur est lancé sur le port 4200 et est accessible à travers http://localhost:4200/ ou 127.0.0.1:4200. Une page web avec cette adresse s'ouvrira automatiquement.
Note : le serveur de développement n'est accessible qu'à partir de votre propre machine. Vous pouvez le rendre disponible à tous en ajoutant --host 0.0.0.0 dans la commande npm start. Le site sera donc accessible dans votre réseau local à partir de votre adresse IP suivie du port 4200. Par exemple : 132.207.5.35:4200. Notez que le serveur de développement n'est pas fait pour un déploiement ouvert et vous recevrez un avertissement en le lançant.



Génération de composants du client
Pour créer de nouveaux composants, nous vous recommandons l'utilisation d'angular CLI. Il suffit d'exécuter ng generate component component-name pour créer un nouveau composant.
Il est aussi possible de générer des directives, pipes, services, guards, interfaces, enums, modules, classes, avec cette commande ng generate directive|pipe|service|class|guard|interface|enum|module.



