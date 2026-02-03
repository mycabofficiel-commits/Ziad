require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Configuration PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Configuration Anthropic Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Initialisation de la base de données
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        credits INTEGER DEFAULT 1000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        code TEXT,
        preview_url TEXT,
        logs TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id),
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Base de données initialisée');
  } catch (error) {
    console.error('❌ Erreur initialisation BDD:', error);
  }
}

// Route principale - Page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route santé du serveur
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SAS Claude opérationnel !' });
});

// Route pour créer un nouveau projet
app.post('/api/projects', async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = 1; // Pour simplifier, utilisateur par défaut (ajoutez auth plus tard)

    const result = await pool.query(
      'INSERT INTO projects (user_id, title, description, code) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, description || '', '']
    );

    res.json({ success: true, project: result.rows[0] });
  } catch (error) {
    console.error('Erreur création projet:', error);
    res.status(500).json({ error: 'Erreur lors de la création du projet' });
  }
});

// Route pour lister tous les projets
app.get('/api/projects', async (req, res) => {
  try {
    const userId = 1; // Utilisateur par défaut
    const result = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );

    res.json({ success: true, projects: result.rows });
  } catch (error) {
    console.error('Erreur récupération projets:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des projets' });
  }
});

// Route pour obtenir un projet spécifique
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    res.json({ success: true, project: result.rows[0] });
  } catch (error) {
    console.error('Erreur récupération projet:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du projet' });
  }
});

// Route pour mettre à jour un projet
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, logs } = req.body;

    const result = await pool.query(
      'UPDATE projects SET code = $1, logs = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [code, logs || '', id]
    );

    res.json({ success: true, project: result.rows[0] });
  } catch (error) {h
    console.error('Erreur mise à jour projet:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du projet' });
  }
});

// Route pour supprimer un projet
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM conversations WHERE project_id = $1', [id]);
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);

    res.json({ success: true, message: 'Projet supprimé' });
  } catch (error) {
    console.error('Erreur suppression projet:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du projet' });
  }
});

// Route principale - Chat avec Claude
app.post('/api/chat', async (req, res) => {
  try {
    const { message, projectId, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message requis' });
    }

    // Sauvegarder le message utilisateur
    if (projectId) {
      await pool.query(
        'INSERT INTO conversations (project_id, role, content) VALUES ($1, $2, $3)',
        [projectId, 'user', message]
      );
    }

    // Préparer l'historique de conversation
    const messages = conversationHistory || [];
    messages.push({
      role: 'user',
      content: message
    });

    // Appel à Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: `Tu es un assistant expert en développement web. Tu aides à créer des applications web complètes (HTML, CSS, JavaScript, React, etc.).

Quand tu génères du code:
- Fournis du code complet et fonctionnel
- Utilise des commentaires clairs en français
- Crée des applications modernes et responsives
- Teste ton code mentalement avant de le fournir

Format de réponse:
- Explique brièvement ce que tu vas créer
- Fournis le code dans des blocs \`\`\`html ou \`\`\`javascript- Donne des conseils d'amélioration si pertinent`,
      messages: messages
    });

    const assistantMessage = response.content[0].text;

    // Sauvegarder la réponse de Claude
    if (projectId) {
      await pool.query(
        'INSERT INTO conversations (project_id, role, content) VALUES ($1, $2, $3)',
        [projectId, 'assistant', assistantMessage]
      );
    }

    // Extraire le code si présent
    let extractedCode = '';
const codeBlockRegex = /```(?:html|javascript|js|jsx|css|react)?\n?([\s\S]*?)```/g;
    const codeBlocks = [];

    while ((match = codeBlockRegex.exec(assistantMessage)) !== null) {
      codeBlocks.push(match[1]);
    }

    if (codeBlocks.length > 0) {
      extractedCode = codeBlocks.join('\n\n');
      
      // Mettre à jour le code du projet si projectId fourni
      if (projectId) {
        await pool.query(
          'UPDATE projects SET code = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [extractedCode, projectId]
        );
      }
    }

    res.json({
      success: true,
      message: assistantMessage,
      code: extractedCode,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens
      }
    });

  } catch (error) {
    console.error('Erreur API Claude:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la communication avec Claude',
      details: error.message 
    });
  }
});

// Route pour obtenir l'historique de conversation
app.get('/api/conversations/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(
      'SELECT * FROM conversations WHERE project_id = $1 ORDER BY created_at ASC',
      [projectId]
    );

    res.json({ success: true, conversations: result.rows });
  } catch (error) {
    console.error('Erreur récupération conversations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
  }
});

// Démarrage du serveur
app.listen(PORT, async () => {
  console.log(`🚀 SAS Claude démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  await initDatabase();
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', async () => {
  console.log('SIGTERM reçu, fermeture...');
  await pool.end();
  process.exit(0);
});
