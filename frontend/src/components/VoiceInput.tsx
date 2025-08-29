import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, TextField, Typography, IconButton, CircularProgress } from '@mui/material';
import { Mic, MicOff, Brightness4, Brightness7 } from '@mui/icons-material';
import axios from 'axios';

interface Props {
  darkMode: boolean;
  toggleTheme: () => void;
}

const VoiceInput: React.FC<Props> = ({ darkMode, toggleTheme }) => {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('SpeechRecognition not supported in this browser');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      setText(event.results[0][0].transcript);
      setListening(false);
    };

    recognitionRef.current.onerror = () => setListening(false);
    recognitionRef.current.onend = () => setListening(false);

    recognitionRef.current.start();
    setListening(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
	  
	  const response = await axios.post(
        'https://8do415ddng.execute-api.us-east-1.amazonaws.com/intent',
        { prompt: text }
      );
		
      console.log('Response:', response.data);
      alert(`Match: ${JSON.stringify(response.data.match)}`);
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={4} gap={2}>
      <IconButton onClick={toggleTheme}>
        {darkMode ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
      <Typography variant="h4">🎙 BOE Voice Input</Typography>
      <TextField
        label="Type or speak your command"
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        startIcon={listening ? <MicOff /> : <Mic />}
        onClick={listening ? () => recognitionRef.current?.stop() : startListening}
      >
        {listening ? 'Stop' : 'Speak'}
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Submit'}
      </Button>
    </Box>
  );
};

export default VoiceInput;
