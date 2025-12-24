const { Client } = require('pg');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // 1. Vérification Auth (Envoyé par Netlify Identity via le Header Authorization Bearer)
    // context.clientContext.user est peuplé automatiquement par Netlify Functions si Identity est actif
    const user = context.clientContext && context.clientContext.user;

    if (!user) {
        return { statusCode: 401, body: JSON.stringify({ error: "Vous devez être connecté pour laisser un avis." }) };
    }

    // Debug pour vérifier ce qu'on reçoit
    console.log("User:", user.email, user.sub); // sub est l'ID unique

    const { comment, rating } = JSON.parse(event.body);

    // 2. Validation Inputs
    if (!comment || comment.length > 600) {
        return { statusCode: 400, body: JSON.stringify({ error: "Commentaire invalide (max 600 caractères)." }) };
    }

    // Rating optionnel (1-5)
    let cleanRating = null;
    if (rating) {
        cleanRating = parseInt(rating);
        if (isNaN(cleanRating) || cleanRating < 1 || cleanRating > 5) {
            return { statusCode: 400, body: JSON.stringify({ error: "Note invalide (1-5)." }) };
        }
    }

    const client = new Client({
        connectionString: process.env.NETLIFY_DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // 3. Anti-SPAM : Vérifier si l'user a posté dans les dernières 24h
        const spamCheck = await client.query(`
      SELECT id FROM reviews 
      WHERE uid = $1 
      AND created_at > NOW() - INTERVAL '24 hours'
    `, [user.sub]);

        if (spamCheck.rows.length > 0) {
            await client.end();
            return { statusCode: 429, body: JSON.stringify({ error: "Vous avez déjà envoyé un avis récemment. Merci de patienter." }) };
        }

        // 4. Insertion en 'pending'
        // On utilise user_metadata.full_name (Google) ou email
        const displayName = user.user_metadata.full_name || user.email.split('@')[0];

        await client.query(`
      INSERT INTO reviews (uid, email, display_name, comment, rating, status)
      VALUES ($1, $2, $3, $4, $5, 'pending')
    `, [user.sub, user.email, displayName, comment, cleanRating]);

        await client.end();

        return {
            statusCode: 201,
            body: JSON.stringify({ message: "Avis reçu ! Il sera publié après modération." })
        };

    } catch (error) {
        console.error('DB Error:', error);
        if (client) await client.end();
        return { statusCode: 500, body: JSON.stringify({ error: "Erreur lors de l'enregistrement." }) };
    }
};
