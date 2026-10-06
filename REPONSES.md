# TP 1 : Ma première API REST (Node.js, Express, MongoDB)

## Réponses aux questions de compréhension

### 1. Pourquoi l'application Android ne se connecte-t-elle pas directement à MongoDB ?

- **Sécurité** : se connecter à MongoDB oblige à mettre l'adresse de la base et ses identifiants dans l'application. Un APK peut être décompilé, donc n'importe qui pourrait lire ces identifiants et accéder à toutes les données.
- **Contrôle** : l'API est la seule porte d'entrée. Elle valide les données, applique les règles métier et renvoie des codes d'erreur clairs. Si l'application écrivait directement dans la base, ces règles seraient à recopier dans chaque client.
- **Partage** : plusieurs clients (Android, Flutter, site web) utilisent la même API et les mêmes données.
- **Évolution** : on peut changer la base ou sa structure sans mettre à jour l'application, tant que l'API garde le même format de réponse.

### 2. Différence entre `req.body`, `req.params` et `req.query`

| Propriété | Contient | Exemple |
|---|---|---|
| `req.body` | Le corps JSON envoyé (POST, PUT) | `{ "nom": "Ben Salah" }` |
| `req.params` | Les parties variables du chemin (`:id`) | `/api/patients/6ab5…` donne `req.params.id` |
| `req.query` | Les filtres après le `?` | `/api/patients?statut=Actif` donne `req.query.statut` |

### 3. Pourquoi répondre 404 et non 400 pour un identifiant valide qui ne correspond à aucun patient ?

Le code **400** signifie que la requête est mal formée (par exemple l'identifiant `abc`, qui n'a pas le format d'un ObjectId). Ici la requête est correcte et bien écrite, mais la **ressource demandée n'existe pas** : c'est le rôle du **404 Not Found**. Cette distinction permet au client Android d'afficher le bon message : « requête incorrecte » ou « élément introuvable ».

### 4. Que se passerait-il si l'on oubliait `app.use(express.json())` ?

Express ne transformerait pas le corps JSON reçu en objet JavaScript. `req.body` serait vide ou `undefined`. Les routes POST et PUT ne recevraient donc aucun champ : une création renverrait **400** (« Le nom est obligatoire », « Le prénom est obligatoire ») même si le client a bien envoyé un JSON correct, et une modification ne changerait rien.

### 5. Pourquoi l'émulateur doit-il utiliser `10.0.2.2` au lieu de `localhost` ?

Dans l'émulateur, `localhost` (127.0.0.1) désigne **l'émulateur lui-même** et non le PC. L'adresse `10.0.2.2` est une adresse spéciale d'Android Studio qui redirige vers le **PC hôte**, où tourne le serveur Node.js. L'API est donc joignable à `http://10.0.2.2:5001/api/`.

### 6. À quoi sert `await` ? Quelle notion de Kotlin lui correspond ?

`await` fait **attendre le résultat d'une opération longue** (requête à la base de données, par exemple) sans bloquer le serveur, qui continue de traiter les autres requêtes pendant ce temps. Une fonction qui utilise `await` doit être déclarée `async`.

En Kotlin, cela correspond aux **coroutines** et aux fonctions **`suspend`**, qui permettent d'attendre un résultat sans bloquer le thread principal.
