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

-- Index pour les performances de récupération des avis validés
CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON reviews(status, created_at DESC);

-- Index pour l'anti-spam (recherche par uid/email récente)
CREATE INDEX IF NOT EXISTS idx_reviews_uid_created ON reviews(uid, created_at DESC);
