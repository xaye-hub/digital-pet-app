import { useState, useEffect } from 'react';
import './App.css';

type PetAction = 'feed' | 'play' | 'sleep';
type PetSpecies = 'Dog' | 'Cat' | 'Dragon';

interface Pet {
  name: string;
  species: PetSpecies;
  hunger: number;
  happiness: number;
  energy: number;
}

const STORAGE_KEY = 'chingu_digital_pet_v1';
const clamp = (value: number): number => Math.max(0, Math.min(100, value));

const SPECIES_ICONS: Record<PetSpecies, { happy: string; neutral: string; hungry: string; sleepy: string }> = {
  Dog: { happy: '🐶', neutral: '🐕', hungry: '🥺', sleepy: '😴' },
  Cat: { happy: '😺', neutral: '🐱', hungry: '😿', sleepy: '💤' },
  Dragon: { happy: '🐲', neutral: '🐉', hungry: '🔥', sleepy: '🥚' },
};

export function App() {
  // Load saved pet from localStorage if available
  const [pet, setPet] = useState<Pet | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [nameInput, setNameInput] = useState<string>('');
  const [speciesInput, setSpeciesInput] = useState<PetSpecies>('Dragon');
  const [statusMessage, setStatusMessage] = useState<string>('Ready to play!');

  // Save pet to localStorage whenever stats change
  useEffect(() => {
    if (pet) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pet));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [pet]);

  // Real-time stat decay every 4 seconds
  useEffect(() => {
    if (!pet) return;
    const timer = setInterval(() => {
      setPet((prev) =>
        prev
          ? {
              ...prev,
              hunger: clamp(prev.hunger - 3),
              happiness: clamp(prev.happiness - 2),
              energy: clamp(prev.energy - 2),
            }
          : null
      );
    }, 4000);

    return () => clearInterval(timer);
  }, [pet]);

  const handleAdopt = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim() || 'Pixel';
    setPet({
      name: cleanName,
      species: speciesInput,
      hunger: 80,
      happiness: 85,
      energy: 80,
    });
    setStatusMessage(`You adopted ${cleanName} the ${speciesInput}!`);
  };

  const handleAction = (action: PetAction) => {
    setPet((prev) => {
      if (!prev) return null;
      if (action === 'feed') {
        setStatusMessage(`You fed ${prev.name}! Hunger restored.`);
        return { ...prev, hunger: clamp(prev.hunger + 15), energy: clamp(prev.energy + 5) };
      }
      if (action === 'play') {
        if (prev.energy < 15) {
          setStatusMessage(`${prev.name} is too exhausted to play!`);
          return prev;
        }
        setStatusMessage(`You played with ${prev.name}! Happiness up!`);
        return {
          ...prev,
          happiness: clamp(prev.happiness + 15),
          energy: clamp(prev.energy - 15),
          hunger: clamp(prev.hunger - 10),
        };
      }
      setStatusMessage(`${prev.name} had a refreshing nap.`);
      return { ...prev, energy: clamp(prev.energy + 25), hunger: clamp(prev.hunger - 5) };
    });
  };

  const getBarColor = (value: number): string => {
    if (value > 50) return '#22c55e';
    if (value > 25) return '#eab308';
    return '#ef4444';
  };

  // Screen 1: Pet Adoption Setup
  if (!pet) {
    return (
      <main className="pet-card">
        <h1>Adopt a Digital Pet</h1>
        <p className="status-banner">Choose a companion to care for!</p>
        <form className="setup-form" onSubmit={handleAdopt}>
          <input
            type="text"
            placeholder="Enter pet name (e.g. Pixel)"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={15}
          />
          <select value={speciesInput} onChange={(e) => setSpeciesInput(e.target.value as PetSpecies)}>
            <option value="Dragon">🐉 Dragon</option>
            <option value="Dog">🐶 Dog</option>
            <option value="Cat">🐱 Cat</option>
          </select>
          <button type="submit">Adopt Pet</button>
        </form>
      </main>
    );
  }

  // Determine current mood icon
  const icons = SPECIES_ICONS[pet.species];
  const currentIcon =
    pet.hunger <= 20 ? icons.hungry : pet.energy <= 20 ? icons.sleepy : pet.happiness >= 75 ? icons.happy : icons.neutral;

  const stats = [
    { label: '🍖 Hunger', value: pet.hunger },
    { label: '🎾 Happiness', value: pet.happiness },
    { label: '⚡ Energy', value: pet.energy },
  ];

  // Screen 2: Active Pet Care Dashboard
  return (
    <main className="pet-card">
      <div className="pet-avatar">{currentIcon}</div>
      <h1>{pet.name}</h1>
      <p className="status-banner">{statusMessage}</p>

      {stats.map((stat) => (
        <div className="stat-row" key={stat.label}>
          <div className="stat-header">
            <span>{stat.label}</span>
            <span>{stat.value}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${stat.value}%`, backgroundColor: getBarColor(stat.value) }}
            />
          </div>
        </div>
      ))}

      <div className="actions">
        <button onClick={() => handleAction('feed')}>🍖 Feed</button>
        <button onClick={() => handleAction('play')}>🎾 Play</button>
        <button onClick={() => handleAction('sleep')}>💤 Sleep</button>
      </div>

      <button className="reset-btn" onClick={() => setPet(null)}>
        Adopt a different pet
      </button>
    </main>
  );
}

export default App;