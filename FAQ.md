# FAQ – Projet N.O.M.A.D.

## Qu'est-ce que Project N.O.M.A.D. ?

Project N.O.M.A.D. est une plateforme auto-hébergée orientée hors ligne qui agrège des outils d'information, d'éducation, de cartographie et d'IA locale.

## N.O.M.A.D. nécessite-t-il Internet en permanence ?

Non. Internet est nécessaire pour :
- l'installation initiale,
- les mises à jour,
- le téléchargement volontaire de nouveaux contenus/outils.

Le reste fonctionne hors ligne.

## Y a-t-il de la télémétrie ?

Non, aucune télémétrie intégrée.

## Quel matériel est requis ?

- **Minimum** : CPU dual-core 2 GHz, 4 Go RAM, 5 Go disque.
- **Recommandé pour IA** : 32 Go RAM, GPU dédié, SSD.

## Puis-je utiliser un serveur d'IA externe ?

Oui. Vous pouvez pointer l'assistant IA vers une URL Ollama ou une API compatible OpenAI.

## L'authentification est-elle intégrée ?

Actuellement non. Utilisez des contrôles réseau (pare-feu, segmentation, ACL) pour restreindre l'accès.

## Le projet est-il adapté à une exposition publique sur Internet ?

Non recommandé. Le mode d'exploitation attendu est local/hors ligne.

## Où trouver la documentation d'installation ?

- Guide : https://www.projectnomad.us/install
- README : [README.md](README.md)

## Comment mettre à jour ?

```bash
sudo bash /opt/project-nomad/update_nomad.sh
```

## Comment démarrer/arrêter ?

```bash
sudo bash /opt/project-nomad/start_nomad.sh
sudo bash /opt/project-nomad/stop_nomad.sh
```

## Comment désinstaller ?

```bash
curl -fsSL https://raw.githubusercontent.com/Crosstalk-Solutions/project-nomad/refs/heads/main/install/uninstall_nomad.sh -o uninstall_nomad.sh && sudo bash uninstall_nomad.sh
```
