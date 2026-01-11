/**
 * NEXO CHATBOT LOGIC
 * Handles the interaction flow between the user and the virtual assistant.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const config = {
        name: 'Nexo',
        typingSpeed: 30, // ms per char
        delayBeforeReply: 600, // ms
    };

    // --- DOM ELEMENTS ---
    const trigger = document.getElementById('nexo-trigger');
    const overlay = document.getElementById('nexo-chat-overlay');
    const closeBtn = document.getElementById('nexo-close-btn');
    const chatBody = document.getElementById('nexo-chat-body');
    const chatFooter = document.getElementById('nexo-chat-footer');

    // --- STATE ---
    let isOpen = false;
    let isTyping = false;

    // --- SCENARIO DATA ---
    const SCENARIO = {
        'start': {
            text: "Bonjour ! 👋 Je suis **Nexo**, l'assistant virtuel de Sebou Digital. Je peux vous renseigner sur les tarifs, ma méthode de travail, ou votre projet. Par quoi commençons-nous ?",
            options: [
                { label: "💰 C'est quoi les tarifs ?", next: 'tarifs' },
                { label: "🚀 Comment ça marche ?", next: 'process' },
                { label: "🏆 Pourquoi un Freelance ?", next: 'freelance' },
                { label: "💬 Parler à un humain", action: 'whatsapp' }
            ]
        },
        'tarifs': {
            text: "Je joue la transparence totale, sans frais cachés :\n\n• **Site Vitrine** : 2 500 DH tout compris.\n• **Site Business** : 3 500 DH.\n\nVous ne payez qu'une fois la livraison validée.",
            options: [
                { label: "Voir le détail des formules", action: 'scroll_pricing' },
                { label: "Retour au menu", next: 'start' }
            ]
        },
        'process': {
            text: "C'est très simple, en 3 étapes :\n\n1. **On discute** de vos besoins.\n2. **Je crée** votre site en 14 jours max.\n3. **On valide** et je vous forme.",
            options: [
                { label: "Je veux lancer mon projet", action: 'scroll_contact' },
                { label: "Retour au menu", next: 'start' }
            ]
        },
        'freelance': {
            text: "Contrairement à une agence, je suis votre **seul interlocuteur**. Pas d'attente au standard, je réponds 7j/7 sur WhatsApp. Je m'occupe de tout : technique, design, et référencement.",
            options: [
                { label: "Ça me plaît, discutons !", action: 'whatsapp' },
                { label: "Retour au menu", next: 'start' }
            ]
        }
    };

    // --- FUNCTIONS ---

    function openChat() {
        if (isOpen) return;
        isOpen = true;
        overlay.classList.add('active');

        // Reset if empty
        if (chatBody.children.length === 0) {
            playScenario('start');
        }
    }

    function closeChat() {
        isOpen = false;
        overlay.classList.remove('active');
        // Reset Chat
        setTimeout(() => {
            chatBody.innerHTML = '';
            chatFooter.innerHTML = '';
        }, 300); // Wait for transition
    }

    function addMessage(text, sender = 'bot') {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);

        // Simple markdown parsing for bold
        msgDiv.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

        chatBody.appendChild(msgDiv);
        scrollToBottom();
    }

    function addOptions(options) {
        chatFooter.innerHTML = ''; // Clear previous
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.classList.add('nexo-option-btn');
            btn.textContent = opt.label;
            btn.onclick = () => handleOptionClick(opt);
            chatFooter.appendChild(btn);
        });
        scrollToBottom();
    }

    function handleOptionClick(opt) {
        if (isTyping) return;

        // User message
        addMessage(opt.label, 'user');
        chatFooter.innerHTML = ''; // Remove buttons immediately

        // Action Logic
        if (opt.action === 'whatsapp') {
            window.open('https://wa.me/212625475147?text=Bonjour, je viens de discuter avec Nexo et je souhaite parler de mon projet.', '_blank');
            closeChat();
            return;
        }

        if (opt.action === 'scroll_pricing') {
            closeChat();
            document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
            return;
        }

        if (opt.action === 'scroll_contact') {
            closeChat();
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
            return;
        }

        // Next Scenario Step
        if (opt.next) {
            setTimeout(() => {
                showTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    playScenario(opt.next);
                }, config.delayBeforeReply);
            }, 500);
        }
    }

    function playScenario(stepId) {
        const step = SCENARIO[stepId];
        if (!step) return;

        addMessage(step.text, 'bot');
        if (step.options) {
            setTimeout(() => addOptions(step.options), 500);
        }
    }

    function scrollToBottom() {
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function showTypingIndicator() {
        const id = 'typing-indicator';
        if (document.getElementById(id)) return;

        const div = document.createElement('div');
        div.id = id;
        div.classList.add('message', 'bot');
        div.innerHTML = '<em>Nexo écrit...</em>';
        chatBody.appendChild(div);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const el = document.getElementById('typing-indicator');
        if (el) el.remove();
    }

    // --- EVENT LISTENERS ---

    // Only bind if elements exist (safety)
    if (trigger && overlay && closeBtn) {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openChat();
        });

        closeBtn.addEventListener('click', closeChat);

        // Close when clicking outside modal
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeChat();
        });
    } else {
        console.warn("Nexo Chat: DOM elements missing");
    }

});
