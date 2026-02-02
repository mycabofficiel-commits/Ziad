// État global de l'application
let currentProject = null;
let conversationHistory = [];

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    setupEventListeners();
});

// Configuration des event listeners
function setupEventListeners() {
    const chatInput = document.getElementById('chatInput');
    
    // Auto-resize du textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    // Envoi avec Enter (Shift+Enter pour nouvelle ligne)
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Gestion de la modal nouveau projet
function openNewProjectModal() {
    document.getElementById('newProjectModal').classList.add('active');
    document.getElementById('projectTitle').focus();
}

function closeNewProjectModal() {
    document.getElementById('newProjectModal').classList.remove('active');
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDescription').value = '';
}

// Créer un nouveau projet
async function createProject() {
    const title = document.getElementById('projectTitle').value.trim();
    const description = document.getElementById('projectDescription').value.trim();

    if (!title) {
        alert('Veuillez entrer un titre pour le projet');
        return;
    }

    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        });

        const data = await response.json();

        if (data.success) {
            closeNewProjectModal();
            await loadProjects();
            selectProject(data.project.id);
            addLog('✅ Projet créé avec succès');
        }
    } catch (error) {
        console.error('Erreur création projet:', error);
        addLog('❌ Erreur lors de la création du projet', 'error');
    }
}

// Charger la liste des projets
async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        const data = await response.json();

        if (data.success) {
            const projectsList = document.getElementById('projectsList');
            
            if (data.projects.length === 0) {
                projectsList.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #666;">
                        <p>Aucun projet</p>
                        <p style="font-size: 12px; margin-top: 5px;">Créez votre premier projet !</p>
                    </div>
                `;
                return;
            }

            projectsList.innerHTML = data.projects.map(project => `
                <div class="project-item ${currentProject?.id === project.id ? 'active' : ''}" 
                     onclick="selectProject(${project.id})">
                    <button class="delete-btn" onclick="event.stopPropagation(); deleteProject(${project.id})">
                        🗑️
                    </button>
                    <h3>${escapeHtml(project.title)}</h3>
                    <p>${escapeHtml(project.description) || 'Pas de description'}</p>
                    <p style="font-size: 10px; color: #666; margin-top: 4px;">
                        ${formatDate(project.updated_at)}
                    </p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Erreur chargement projets:', error);
        addLog('❌ Erreur lors du chargement des projets', 'error');
    }
}

// Sélectionner un projet
async function selectProject(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`);
        const data = await response.json();

        if (data.success) {
            currentProject = data.project;
            document.getElementById('currentProjectTitle').textContent = currentProject.title;
            
            // Activer le chat
            document.getElementById('chatInput').disabled = false;
            document.getElementById('sendBtn').disabled = false;

            // Charger la conversation
            await loadConversation(projectId);

            // Afficher le code si disponible
            if (currentProject.code) {
                updatePreview(currentProject.code);
            } else {
                clearPreview();
            }

            // Mettre à jour la liste pour highlighter le projet actif
            loadProjects();

            addLog(`📂 Projet "${currentProject.title}" chargé`);
        }
    } catch (error) {
        console.error('Erreur sélection projet:', error);
        addLog('❌ Erreur lors de la sélection du projet', 'error');
    }
}

// Charger l'historique de conversation
async function loadConversation(projectId) {
    try {
        const response = await fetch(`/api/conversations/${projectId}`);
        const data = await response.json();

        if (data.success) {
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.innerHTML = '';

            conversationHistory = [];

            data.conversations.forEach(conv => {
                addMessageToUI(conv.role, conv.content);
                conversationHistory.push({
                    role: conv.role,
                    content: conv.content
                });
            });

            // Si pas de conversation, afficher message d'accueil
            if (data.conversations.length === 0) {
                addMessageToUI('assistant', `Bonjour ! Je suis prêt à travailler sur "${currentProject.title}". Que souhaitez-vous créer ?`);
            }

            scrollChatToBottom();
        }
    } catch (error) {
        console.error('Erreur chargement conversation:', error);
    }
}

// Supprimer un projet
async function deleteProject(projectId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
        return;
    }

    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            if (currentProject?.id === projectId) {
                currentProject = null;
                document.getElementById('currentProjectTitle').textContent = 'Sélectionnez ou créez un projet';
                document.getElementById('chatInput').disabled = true;
                document.getElementById('sendBtn').disabled = true;
                clearChat();
                clearPreview();
            }
            
            await loadProjects();
            addLog('🗑️ Projet supprimé');
        }
    } catch (error) {
        console.error('Erreur suppression projet:', error);
        addLog('❌ Erreur lors de la suppression', 'error');
    }
}

// Envoyer un message à Claude
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message || !currentProject) {
        return;
    }

    // Désactiver l'input pendant le traitement
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="spinner"></span>';

    // Ajouter le message utilisateur à l'UI
    addMessageToUI('user', message);
    input.value = '';
    input.style.height = 'auto';

    try {
        addLog('🤖 Claude réfléchit...');

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                projectId: currentProject.id,
                conversationHistory
            })
        });

        const data = await response.json();

        if (data.success) {
            // Ajouter la réponse de Claude à l'UI
            addMessageToUI('assistant', data.message);

            // Mettre à jour l'historique
            conversationHistory.push({ role: 'user', content: message });
            conversationHistory.push({ role: 'assistant', content: data.message });

            // Si du code a été généré, mettre à jour la preview
            if (data.code) {
                currentProject.code = data.code;
                updatePreview(data.code);
                addLog(`✅ Code généré (${data.usage.output_tokens} tokens)`);
            }

            addLog(`💬 Réponse reçue (${data.usage.input_tokens + data.usage.output_tokens} tokens utilisés)`);
        } else {
            addMessageToUI('assistant', '❌ Désolé, une erreur est survenue. Veuillez réessayer.');
            addLog('❌ ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Erreur envoi message:', error);
        addMessageToUI('assistant', '❌ Erreur de connexion. Vérifiez votre configuration API.');
        addLog('❌ Erreur: ' + error.message, 'error');
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Envoyer';
        input.focus();
    }
}

// Ajouter un message à l'interface
function addMessageToUI(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const label = role === 'user' ? 'Vous' : 'Claude';
    
    // Convertir le markdown basique en HTML
    let htmlContent = escapeHtml(content)
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = `
        <div class="message-label">${label}</div>
        <div class="message-content">${htmlContent}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollChatToBottom();
}

// Faire défiler le chat vers le bas
function scrollChatToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Vider le chat
function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="message assistant">
            <div class="message-label">Claude</div>
            <div class="message-content">
                Sélectionnez un projet pour commencer à discuter.
            </div>
        </div>
    `;
    conversationHistory = [];
}

// Mettre à jour la prévisualisation
function updatePreview(code) {
    const previewContainer = document.getElementById('previewContainer');
    
    // Créer un iframe pour la preview sécurisée
    previewContainer.innerHTML = `
        <iframe class="preview-iframe" sandbox="allow-scripts allow-same-origin"></iframe>
    `;
    
    const iframe = previewContainer.querySelector('iframe');
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    iframeDoc.open();
    iframeDoc.write(code);
    iframeDoc.close();

    addLog('👁️ Prévisualisation mise à jour');
}

// Vider la prévisualisation
function clearPreview() {
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = `
        <div class="preview-placeholder">
            <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/>
            </svg>
            <p>Aucun aperçu disponible</p>
            <p style="font-size: 11px;">Commencez à créer pour voir le résultat ici</p>
        </div>
    `;
}

// Actualiser la prévisualisation
function refreshPreview() {
    if (currentProject?.code) {
        updatePreview(currentProject.code);
    }
}

// Télécharger le code
function downloadCode() {
    if (!currentProject?.code) {
        alert('Aucun code à télécharger');
        return;
    }

    const blob = new Blob([currentProject.code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addLog('📥 Code téléchargé');
}

// Ajouter une entrée de log
function addLog(message, type = 'info') {
    const logsSection = document.getElementById('logsSection');
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    
    const timestamp = new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    
    logEntry.textContent = `[${timestamp}] ${message}`;
    logsSection.appendChild(logEntry);
    
    // Garder seulement les 50 derniers logs
    while (logsSection.children.length > 50) {
        logsSection.removeChild(logsSection.firstChild);
    }
    
    logsSection.scrollTop = logsSection.scrollHeight;
}

// Utilitaires
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}
