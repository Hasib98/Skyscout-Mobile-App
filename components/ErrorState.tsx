
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  message: string;
  onRetry: () => void;
  isDarkMode: boolean;
}

const ErrorState  = ({ message="", isDarkMode=false }:Props) => {
  const textColor = isDarkMode ? '#fff' : '#000';
  const secondaryColor = isDarkMode ? '#ccc' : '#666';
  const buttonBg = isDarkMode ? '#007AFF' : '#007AFF';
  const containerBg = isDarkMode ? '#2c2c2c' : '#f8f8f8';

  return (
    <View 
      style={[styles.container, { backgroundColor: containerBg }]}
      accessible
      accessibilityLabel="Error state"
    >
      <Text style={[styles.emoji, { color: textColor }]}>⚠️</Text>
      
      <Text style={[styles.title, { color: textColor }]}>
        Something went wrong
      </Text>
      
      <Text 
        style={[styles.message, { color: secondaryColor }]}
        accessibilityLabel={`Error message: ${message}`}
      >
        {message}
      </Text>
      
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: buttonBg }]}
        // onPress={onRetry}
        accessible
        accessibilityLabel="Retry loading weather data"
        accessibilityRole="button"
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
      
      <Text style={[styles.suggestion, { color: secondaryColor }]}>
        Make sure you have an internet connection and try again.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
    margin: 20,
    borderRadius: 15,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestion: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ErrorState;