# 🚀 GUIDE DE DÉPLOIEMENT : Système d'Avis Clients (Netlify + Neon)

Votre site est configuré pour accepter des avis clients vérifiés via Google. Suivez ces étapes pour activer les services backend.

## 1. Base de Données (Neon) via Netlify

Assurez-vous que l'intégration **Netlify DB (Neon)** est active.
1. Allez sur votre dashboard Netlify > Site configuration > **Integrations**.
2. Vérifiez que **Neon** est "Enabled".
3. Cela injecte automatiquement la variable `NETLIFY_DATABASE_URL` dans vos fonctions.

### Création de la Table (Migration)
Puisque vous n'avez pas d'accès direct console, Netlify ne lance pas le SQL seul.
**Solution simple** : Utilisez une fonction temporaire ou connectez-vous à votre base Neon depuis votre PC (si vous avez l'URL de connexion dans Netlify > Environment Variables) et exécutez le script SQL fourni dans `db/schema.sql`.

Si vous avez accès à l'interface Neon (console.neon.tech), copiez-collez simplement le contenu de `db/schema.sql` dans l'éditeur SQL.

## 2. Authentification (Netlify Identity)

C'est CRUCIAL pour que le bouton "Se connecter avec Google" fonctionne.

1. Allez sur votre dashboard Netlify > **Site configuration** > **Identity**.
2. Cliquez sur **Enable Identity**.
3. Dans **Registration preferences**, mettez "Open" (ou "Invite only" si vous voulez restreindre, mais "Open" est mieux pour des avis clients).
4. Sous **External providers**, cliquez sur "Add provider" et choisissez **Google**.
   - Vous pouvez utiliser les "Default credentials" de Netlify pour tester rapidement.
   - Pour la prod, il est conseillé de créer votre propre OAuth Client ID sur Google Cloud (mais pas obligatoire pour démarrer).
5. **Services** > **Git Gateway** : Pas nécessaire pour les avis, mais utile si vous utilisez Netlify CMS.

## 3. Déploiement

1. Committez et Pushez tous les fichiers :
   - `index.html` (Nouveau script Identity + Section Avis)
   - `script.js` (Logique Fetch + Auth)
   - `netlify/functions/reviews-create.js`
   - `netlify/functions/reviews-list.js`
   - `package.json` (Dépendances)
2. Netlify va détecter les fonctions et les builder automatiquement.

## 4. Modération des Avis

Par défaut, tout avis arrive avec le status `pending` (en attente). Il ne s'affiche PAS sur le site.
Pour valider un avis, vous devez vous connecter à votre base Neon (via SQL) et exécuter :

```sql
-- Voir les avis en attente
SELECT * FROM reviews WHERE status = 'pending';

-- Approuver un avis spécifique (par ID)
UPDATE reviews SET status = 'approved' WHERE id = 1;
```

## Checklist de Test

- [ ] Le bouton "Se connecter avec Google" ouvre la popup Netlify Identity.
- [ ] Une fois connecté, le formulaire d'avis apparaît.
- [ ] L'envoi d'un avis retourne un message de succès ("En attente de modération").
- [ ] L'avis n'apparaît PAS tout de suite dans la liste.
- [ ] Après `UPDATE reviews SET status = 'approved'`, l'avis apparaît au rechargement de la page.
