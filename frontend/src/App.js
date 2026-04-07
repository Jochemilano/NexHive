import './App.css';
import AppRouter from './router/AppRouter';
import { useState, useEffect } from "react";
import { preferencesApi } from "@/utils/preferences";

function App() {
  const [userPreferences, setUserPreferences] = useState(null);

  useEffect(() => {
    const loadPreferences = async () => {
      const prefs = await preferencesApi.getPreferences();
      if (prefs) {
        setUserPreferences(prefs);

        // Aplicar tema globalmente
        const themeClass = prefs.theme === "light" ? "" : prefs.theme;
        document.body.className = themeClass;
      }
    };

    loadPreferences();
  }, []);

  return (
    <div className="App">
      <AppRouter userPreferences={userPreferences} />
    </div>
  );
}

export default App;