import { createContext, useContext, useState, useCallback } from "react";


const TeddyContext = createContext(null);

export const TeddyProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [emotion, setEmotion] = useState("idle");
  const [message, setMessage] = useState("");

  // show teddy with config
  const showTeddy = useCallback(
    ({ emotion = "idle", message = "" }) => {
      setEmotion(emotion);
      setMessage(message);
      setVisible(true);
    },
    []
  );

  // hide teddy
  const hideTeddy = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <TeddyContext.Provider
      value={{
        visible,
        emotion,
        message,
        showTeddy,
        hideTeddy,
      }}
    >
      {children}
    </TeddyContext.Provider>
  );
};

export const useTeddy = () => {
  const context = useContext(TeddyContext);
  if (!context) {
    throw new Error("useTeddy must be used within a TeddyProvider");
  }
  return context;
};
