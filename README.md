<div align="center">
<img src="admin/public/project_nomad_logo.webp" width="200" height="200"/>

# Projet N.O.M.A.D.
### Nœud pour les médias, les archives et les données hors ligne

**Des connaissances qui ne se déconnectent jamais**

[![Site Web](https://img.shields.io/badge/Website-projectnomad.us-blue)](https://www.projectnomad.us)
[![Discord](https://img.shields.io/badge/Discord-Join%20Community-5865F2)](https://discord.com/invite/crosstalksolutions)
[![Benchmark](https://img.shields.io/badge/Benchmark-Leaderboard-green)](https://benchmark.projectnomad.us)

</div>

---

Projet N.O.M.A.D.est un serveur de connaissances et d'éducation autonome et hors ligne, doté d'outils, de connaissances et d'IA essentiels pour vous tenir informé et responsabilisé, à tout moment et en tout lieu.

## Installation et démarrage rapide
Projet N.O.M.A.D.peut être installé sur n’importe quel système d’exploitation basé sur Debian (nous recommandons Ubuntu).L'installation est entièrement basée sur un terminal et tous les outils et ressources sont conçus pour être accessibles via le navigateur. Vous n'avez donc pas besoin d'un environnement de bureau si vous préférez configurer N.O.M.A.D.en tant que "serveur" et y accéder via d'autres clients.

*Remarque : les privilèges sudo/root sont requis pour exécuter le script d'installation*

### Installation rapide (système d'exploitation basé sur Debian uniquement)
```bash
sudo apt-get update && \
sudo apt-get install -y curl && \
curl -fsSL https://raw.githubusercontent.com/Crosstalk-Solutions/project-nomad/refs/heads/main/install/install_nomad.sh \
  -o install_nomad.sh && \
sudo bash install_nomad.sh
```

Projet N.O.M.A.D.est maintenant installé sur votre appareil !Ouvrez un navigateur et accédez à`http://localhost:8080`(ou`http://DEVICE_IP:8080`) pour commencer à explorer !

Pour une procédure complète étape par étape (y compris l'installation d'Ubuntu), consultez le [Guide d'installation](https://www.projectnomad.us/install).

### Configuration SSD portable/amorçable (résilience)
Si vous effectuez un déploiement sur un SSD externe et souhaitez la persistance + un comportement racine immuable facultatif, utilisez l'assistant inclus :
```bash
sudo bash install/portable_bootable_setup.sh --data-device LABEL=NOMAD_DATA --enable-overlayroot
```
Cela prépare un montage de données BTRFS, migre`/opt/project-nomad`et`/var/lib/docker`au stockage persistant et maintient la compatibilité via des liens symboliques.


### Installation avancée
Pour plus de contrôle sur le processus d'installation, copiez et collez le [modèle Docker Compose](https://raw.githubusercontent.com/Crosstalk-Solutions/project-nomad/refs/heads/main/install/management_compose.yaml) dans un`docker-compose.yml`et personnalisez-le à votre guise (assurez-vous de remplacer tous les espaces réservés par vos valeurs réelles).Ensuite, courez`docker compose up -d`pour démarrer le Command Center et ses dépendances.Remarque : cette méthode est recommandée uniquement aux utilisateurs avancés, car elle nécessite une familiarité avec Docker et une configuration manuelle avant de démarrer.

## Comment ça marche
NOMADE.est une interface utilisateur de gestion (« Command Center ») et une API qui orchestre une collection d'outils et de ressources conteneurisés via [Docker](https://www.docker.com/).Il gère l'installation, la configuration et les mises à jour pour tout, pour que vous n'ayez pas à le faire.

**Les fonctionnalités intégrées incluent :**
- **Chat IA avec base de connaissances** : chat IA local alimenté par [Ollama](https://ollama.com/) ou vous pouvez utiliser un logiciel compatible avec l'API OpenAI tel que LM Studio ou llama.cpp, avec téléchargement de documents et recherche sémantique (RAG via [Qdrant](https://qdrant.tech/))
- **Bibliothèque d'informations** — Wikipédia hors ligne, références médicales, ebooks et bien plus encore via [Kiwix](https://kiwix.org/)
- **Plateforme éducative** — Cours Khan Academy avec suivi des progrès via [Kolibri](https://learningequality.org/kolibri/)
- **Cartes hors ligne** — cartes régionales téléchargeables via [ProtoMaps](https://protomaps.com)
- **Outils de données** — cryptage, encodage et analyse via [CyberChef](https://gchq.github.io/CyberChef/)
- **Notes** — prise de notes locale via [FlatNotes](https://github.com/dullage/flatnotes)
- **System Benchmark** — notation du matériel avec un [classement communautaire](https://benchmark.projectnomad.us)
- **Assistant de configuration facile** : première configuration guidée avec des collections de contenu organisées

NOMADE.comprend également des outils intégrés tels qu'un sélecteur de contenu Wikipédia, un gestionnaire de bibliothèque ZIM et un explorateur de contenu.

## Ce qui est inclus

|Capacité |Propulsé par |Ce que vous obtenez |
|-----------|-----------|-------------|
|Bibliothèque d'informations |Kiwix |Wikipédia hors ligne, références médicales, guides de survie, ebooks |
|Assistant IA |Ollama + Qdrant |Chat intégré avec téléchargement de documents et recherche sémantique |
|Plateforme éducative |Kolibri |Cours Khan Academy, suivi des progrès, support multi-utilisateurs |
|Cartes hors ligne |ProtoMaps |Cartes régionales téléchargeables avec recherche et navigation |
|Outils de données |CyberChef |Chiffrement, codage, hachage et analyse de données |
|Remarques |Notes plates |Prise de notes locale avec prise en charge des démarques |
|Évaluation du système |Intégré |Notation du matériel, balises de constructeur et classement de la communauté |

## Configuration requise pour l'appareil
Alors que de nombreux ordinateurs de survie hors ligne similaires sont conçus pour fonctionner sur du matériel léger et minimal, le projet N.O.M.A.D.c'est tout le contraire.Pour installer et exécuter le
outils d'IA disponibles, nous encourageons fortement l'utilisation d'un appareil robuste soutenu par GPU pour tirer le meilleur parti de votre installation.

Cependant, à la base, N.O.M.A.D.est encore très léger.Pour une installation barebones de l’application de gestion elle-même, les spécifications minimales suivantes sont requises :

*Remarque : le projet N.O.M.A.D.n'est sponsorisé par aucun fabricant de matériel et est conçu pour être aussi indépendant que possible du matériel.Le matériel répertorié ci-dessous est uniquement à titre d'exemple/de comparaison*

#### Spécifications minimales
- Processeur : processeur dual-core 2 GHz ou supérieur
- RAM : 4 Go de mémoire système
- Stockage : au moins 5 Go d'espace disque libre
- Système d'exploitation : basé sur Debian (Ubuntu recommandé)
- Connexion Internet stable (requise lors de l'installation uniquement)

Pour exécuter des LLM et d’autres outils d’IA :

#### Spécifications optimales
- Processeur : AMD Ryzen 7 ou Intel Core i7 ou supérieur
- RAM : 32 Go de mémoire système
- Graphiques : NVIDIA RTX 3060 ou équivalent AMD ou supérieur (plus de VRAM = exécuter des modèles plus grands)
- Stockage : Au moins 250 Go d'espace disque libre (de préférence sur SSD)
- Système d'exploitation : basé sur Debian (Ubuntu recommandé)
- Connexion Internet stable (requise lors de l'installation uniquement)

**Pour des recommandations de construction détaillées à trois niveaux de prix (150 $ à 1 000 $ et plus), consultez le [Guide du matériel](https://www.projectnomad.us/hardware).**

Encore une fois, le projet N.O.M.A.D.lui-même est assez léger - ce sont les outils et les ressources que vous choisissez d'installer avec N.O.M.A.D.qui déterminera les spécifications requises pour votre déploiement unique

#### Exécuter des modèles d'IA sur un autre hôte
Par défaut, le programme d'installation de N.O.M.A.D. tentera de configurer Ollama sur l'hôte lorsque l'AI Assistant est installé.Cependant, si vous souhaitez exécuter le modèle IA sur un autre hôte, vous pouvez accéder aux paramètres de l'assistant IA et saisir une URL pour un serveur API ollama ou compatible OpenAI (tel que LM Studio).
Notez que si vous utilisez Ollama sur un autre hôte, vous devez démarrer le serveur avec cette option`OLLAMA_HOST=0.0.0.0`.
Ollama est le moyen préféré d'utiliser l'assistant IA car il possède des fonctionnalités telles que le téléchargement de modèles que l'API OpenAI ne prend pas en charge.Ainsi, lorsque vous utilisez LM Studio par exemple, vous devrez utiliser LM Studio pour télécharger des modèles.
Vous êtes responsable de la configuration du serveur Ollama/OpenAI sur l'autre hôte.

## Foire aux questions (FAQ)
Pour obtenir des réponses aux questions courantes sur le projet N.O.M.A.D., veuillez consulter notre page [FAQ](FAQ.md).

## À propos de l'utilisation d'Internet et de la confidentialité
Projet N.O.M.A.D.est conçu pour une utilisation hors ligne.Une connexion Internet n'est requise que lors de l'installation initiale (pour télécharger les dépendances) et si vous (l'utilisateur) décidez de télécharger des outils et des ressources supplémentaires ultérieurement.Sinon, N.O.M.A.D.ne nécessite pas de connexion Internet et dispose de télémétrie intégrée ZÉRO.

Pour tester la connectivité Internet, N.O.M.A.D.tente de faire une requête au point de terminaison de l'utilitaire de Cloudflare,`https://1.1.1.1/cdn-cgi/trace`et vérifie une réponse réussie.

## À propos de la sécurité
De par sa conception, le projet N.O.M.A.D.est destiné à être ouvert et disponible sans obstacles - il n'inclut aucune authentification.Si vous décidez de connecter votre appareil à un réseau local après l'installation (par exemple pour permettre à d'autres appareils d'accéder à ses ressources), vous pouvez bloquer/ouvrir des ports pour contrôler quels services sont exposés.

**L'authentification sera-t-elle ajoutée à l'avenir ?** Peut-être.Ce n'est pas actuellement une priorité, mais s'il y a suffisamment de demande, nous pourrions envisager de créer une couche d'authentification facultative dans une prochaine version pour prendre en charge les cas d'utilisation où plusieurs utilisateurs ont besoin d'accéder à la même instance mais avec des niveaux d'autorisation différents (par exemple, utilisation familiale avec contrôle parental, utilisation en classe avec des comptes enseignant/administrateur, etc.).Nous avons une suggestion à ce sujet sur notre feuille de route publique, donc si c'est quelque chose que vous aimeriez voir, veuillez voter ici : https://roadmap.projectnomad.us/posts/1/user-authentication-please-build-in-user-auth-with-admin-user-roles

Pour l'instant, nous vous recommandons d'utiliser des contrôles au niveau du réseau pour gérer l'accès si vous envisagez d'exposer votre N.O.M.A.D.exemple vers d’autres appareils sur un réseau local.NOMADE.n'est pas conçu pour être exposé directement à Internet, et nous vous déconseillons fortement de le faire à moins que vous sachiez vraiment ce que vous faites, que vous ayez pris les mesures de sécurité appropriées et que vous compreniez les risques encourus.

## Contribuer
Les contributions sont les bienvenues et appréciées !Veuillez consulter [CONTRIBUTING.md](CONTRIBUTING.md) pour obtenir des directives sur la manière de contribuer au projet.

## Communauté et ressources

- **Site Web :** [www.projectnomad.us](https://www.projectnomad.us) - En savoir plus sur le projet
- **Discord :** [Rejoignez la communauté](https://discord.com/invite/crosstalksolutions) - Obtenez de l'aide, partagez vos builds et connectez-vous avec d'autres utilisateurs NOMAD
- **Classement de référence :** [benchmark.projectnomad.us](https://benchmark.projectnomad.us) - Découvrez comment votre matériel se compare aux autres versions de NOMAD
- **Guide de dépannage :** [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Trouvez des solutions aux problèmes courants
- **FAQ :** [FAQ.md](FAQ.md) - Trouvez les réponses aux questions fréquemment posées

## Licence

Projet N.O.M.A.D.est sous licence [Apache License 2.0](LICENSE).

## Scripts d'aide
Une fois installé, Project N.O.M.A.D.propose quelques scripts d'assistance si jamais vous avez besoin de résoudre des problèmes ou d'effectuer une maintenance qui ne peut pas être effectuée via le centre de commande.Tous ces scripts se trouvent dans le répertoire d'installation du Projet N.O.M.A.D.,`/opt/project-nomad`

###

###### Démarrer le script - Démarre tous les conteneurs de projet installés
```bash
sudo bash /opt/project-nomad/start_nomad.sh
```
###

###### Stop Script - Arrête tous les conteneurs de projet installés
```bash
sudo bash /opt/project-nomad/stop_nomad.sh
```
###

###### Script de mise à jour : tente d'extraire les dernières images du centre de commande et de ses dépendances (c'est-à-dire mysql) et de recréer les conteneurs.Remarque : ceci *uniquement* met à jour les conteneurs du Command Center.Il ne met pas à jour les conteneurs d'applications installables - cela doit être fait via l'interface utilisateur du Command Center
```bash
sudo bash /opt/project-nomad/update_nomad.sh
```

###### Script de désinstallation – Besoin de recommencer à zéro ?Utilisez le script de désinstallation pour vous faciliter la vie.Attention : cela ne peut pas être annulé !
```bash
curl -fsSL https://raw.githubusercontent.com/Crosstalk-Solutions/project-nomad/refs/heads/main/install/uninstall_nomad.sh -o uninstall_nomad.sh && sudo bash uninstall_nomad.sh
```
