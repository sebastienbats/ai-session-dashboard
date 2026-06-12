import React, { useRef, useState } from 'react';
import CurrentAIModel from './components/CurrentAIModel';
import TokenHistory from './components/TokenHistory';
import { sendMessage, resetTokens } from './api';

function App() {
  const aiRef = useRef();
  const [inputMessage, setInputMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    setLoading(true);
    try {
      const result = await sendMessage(inputMessage);
      if (aiRef.current && result.tokensUsed) {
        aiRef.current.addTokens(result.tokensUsed);
      }
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: inputMessage },
        { role: 'assistant', content: result.reply }
      ]);
      setInputMessage('');
      setHistoryRefresh(prev => prev + 1);
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l’envoi');
    } finally {
      setLoading(false);
    }
  };

  const handleResetTokens = async () => {
    try {
      await resetTokens();
      if (aiRef.current) aiRef.current.resetTokens();
      setHistoryRefresh(prev => prev + 1);
      setChatHistory([]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      <CurrentAIModel ref={aiRef} fetchFromApi={true} />
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <div style={{ flex: 2 }}>
          <h3>💬 Conversation</h3>
          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', minHeight: '200px', marginBottom: '1rem' }}>
            {chatHistory.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: '0.5rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                <strong>{msg.role === 'user' ? 'Vous' : 'IA'} :</strong> {msg.content}
              </div>
            ))}
            {loading && <div>L'IA réfléchit...</div>}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Posez une question..."
              style={{ flex: 1, padding: '0.5rem' }}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage} disabled={loading}>Envoyer</button>
            <button onClick={handleResetTokens}>Réinitialiser</button>
          </div>
        </div>
        
        <div style={{ flex: 1.5 }}>
          <TokenHistory refreshTrigger={historyRefresh} />
        </div>
      </div>
    </div>
  );
}

export default App;
