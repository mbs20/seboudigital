const { Client } = require('pg');

exports.handler = async (event, context) => {
    // Sécurité basique : on ne veut pas que n'importe qui reset la DB, 
    // mais ici c'est un CREATE TABLE IF NOT EXISTS, donc c'est safe.

    const client = new Client({
        connectionString: process.env.NETLIFY_DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const sql = `
      -- Création de la table reviews
      CREATE TABLE IF NOT EXISTS reviews (
          id BIGSERIAL PRIMARY KEY,
          uid TEXT NOT NULL,
          email TEXT NOT NULL,
          display_name TEXT NOT NULL,
          comment TEXT NOT NULL CHECK (length(comment) <= 600),
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Index
      CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON reviews(status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_reviews_uid_created ON reviews(uid, created_at DESC);
    `;

        await client.query(sql);
        await client.end();

        return {
            statusCode: 200,
            body: "✅ Base de données initialisée avec succès ! La table 'reviews' est créée. Vous pouvez maintenant laisser des avis."
        };

    } catch (error) {
        console.error('Setup Error:', error);
        if (client) await client.end();
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Erreur lors de l'initialisation DB", details: error.message })
        };
    }
};
