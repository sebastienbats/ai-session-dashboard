import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { fetchModelInfo, getTokens } from '../api';
import '../styles/CurrentAIModel.css';

const CurrentAIModel = forwardRef(({ fetchFromApi = true, initialTokens = 0 }, ref) => {
  const [modelInfo, setModelInfo] = useState({ 
    model: '', version: '', provider: '', activeProviders: [] 
  });
  const [tokenCount, setTokenCount] = useState(initialTokens);
  const [loading, setLoading] = useState(fetchFromApi);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (fetchFromApi) {
      Promise.all([fetchModelInfo(), getTokens()])
        .then(([info, tokenData]) => {
          setModelInfo(info);
          setTokenCount(tokenData.tokens);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [fetchFromApi]);

  useImperativeHandle(ref, () => ({
    addTokens: (tokensUsed) => setTokenCount(prev => prev + tokensUsed),
    resetTokens: () => setTokenCount(0),
    getTokenCount: () => tokenCount
  }));

  if (loading) return <div className="ai-card loading">Chargement du modèle IA…</div>;
  if (error) return <div className="ai-card error">Erreur : {error}</div>;

  return (
    <div className="ai-card">
      <h3>🧠 Intelligence Artificielle – Session en cours</h3>
      <div className="ai-field">
        <span className="label">Modèle :</span>
        <span className="value">{modelInfo.model}</span>
      </div>
      <div className="ai-field">
        <span className="label">Version :</span>
        <span className="value">{modelInfo.version}</span>
      </div>
      <div className="ai-field">
        <span className="label">Fournisseur :</span>
        <span className="value">{modelInfo.provider}</span>
      </div>
      <div className="ai-field">
        <span className="label">🔁 Fallback actifs :</span>
        <span className="value active-providers">
          {modelInfo.activeProviders?.join(' → ') || 'Aucun'}
        </span>
      </div>
      <div className="ai-field tokens">
        <span className="label">🎲 Tokens consommés :</span>
        <span className="value token-count">{tokenCount.toLocaleString()}</span>
      </div>
    </div>
  );
});

export default CurrentAIModel;
