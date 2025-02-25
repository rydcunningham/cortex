import { extendTheme } from '@chakra-ui/react'

// Exactly matching colors from reference
const colors = {
  "cyber-black": "#000000", // Pure black background
  "cyber-dark": "#171E24", 
  "cyber-blue": "#00E5FF",
  "cyber-green": "#00FF66",
  "cyber-text": "#AAAAAA",
  "cyber-red": "#FF4D4D"
}

// Use web-safe fonts as fallbacks
export const theme = extendTheme({
  fonts: {
    heading: "Rajdhani, sans-serif",
    body: "'JetBrains Mono', monospace",
    mono: "'JetBrains Mono', monospace",
  },
  colors,
  styles: {
    global: {
      body: {
        bg: 'black', // Pure black background
        color: 'cyber-text',
        fontFamily: 'mono',
      }
    }
  },
  components: {
    Button: {
      baseStyle: {
        fontFamily: 'mono',
        borderRadius: '4px',
      }
    }
  }
}) 