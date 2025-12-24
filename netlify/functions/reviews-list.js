const { Client } = require('pg');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Connexion DB (Netlify injecte automatiquement env var si Neon est lié)
    const client = new Client({
        connectionString: process.env.NETLIFY_DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Nécessaire pour Neon/AWS Lambda parfois
    });

    try {
        await client.connect();

        // Récupérer uniquement les avis approuvés, sans exposer l'email/uid
        const result = await client.query(`
      SELECT display_name, comment, rating, created_at 
      FROM reviews 
      WHERE status = 'approved' 
      ORDER BY created_at DESC 
      LIMIT 50
    `);

        await client.end();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result.rows)
        };

    } catch (error) {
        console.error('Database Error:', error);
        if (client) await client.end(); // Toujours fermer
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Erreur serveur interne" })
        };
    }
};
